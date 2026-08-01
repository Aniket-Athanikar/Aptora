"""Rebuild Qdrant from the canonical PostgreSQL resource chunks.

Run from ``backend`` with ``python scripts/rebuild_qdrant_index.py``.  The
script is deliberately idempotent: each resource's existing vectors are
removed, regenerated and committed only after Qdrant acknowledges the upsert.
"""

from __future__ import annotations

import argparse
import datetime
import logging
import sys
from pathlib import Path

from sqlalchemy.orm import joinedload, selectinload

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ai.services.embedding_service import EmbeddingService
from app.ai.services.qdrant_service import QdrantService
from app.database import SessionLocal
from app.models.resource import ResourceDb

logger = logging.getLogger("rebuild_qdrant_index")


def rebuild(resource_id: int | None = None, dry_run: bool = False) -> tuple[int, int]:
    """Return ``(resources_rebuilt, chunks_rebuilt)`` or raise on failure."""
    db = SessionLocal()
    rebuilt_resources = 0
    rebuilt_chunks = 0
    try:
        query = db.query(ResourceDb).options(
            selectinload(ResourceDb.chunks), joinedload(ResourceDb.subject)
        ).order_by(ResourceDb.id)
        if resource_id is not None:
            query = query.filter(ResourceDb.id == resource_id)
        resources = query.all()
        if not resources:
            raise RuntimeError("No matching resources found to rebuild.")

        QdrantService.create_collection()
        logger.info("Rebuilding %d resource(s) into collection '%s'.", len(resources), QdrantService.COLLECTION_NAME)

        for resource in resources:
            chunks = sorted((chunk for chunk in resource.chunks if chunk.content and chunk.content.strip()), key=lambda chunk: chunk.chunk_index)
            if not chunks:
                logger.warning("Skipping resource_id=%s: no non-empty stored chunks.", resource.id)
                continue

            logger.info("Resource %s '%s': embedding %d chunk(s).", resource.id, resource.title, len(chunks))
            try:
                texts = [chunk.content for chunk in chunks]
                embeddings = EmbeddingService.embed_many(texts, is_query=False)
                metadata = [
                    {
                        "subject": chunk.subject or getattr(resource.subject, "name", None),
                        "chapter": chunk.chapter,
                        "topic": chunk.topic,
                        "page_number": chunk.page_number,
                    }
                    for chunk in chunks
                ]

                if dry_run:
                    logger.info("Dry run: validated resource_id=%s without changing Qdrant or PostgreSQL.", resource.id)
                    continue

                QdrantService.delete_resource(resource.id)
                point_ids = QdrantService.upsert_chunks(
                    resource_id=resource.id,
                    workspace_id=resource.workspace_id,
                    subject_id=resource.subject_id,
                    chunks=texts,
                    embeddings=embeddings,
                    resource_type=getattr(resource.resource_type, "value", resource.resource_type),
                    document_title=resource.title or resource.original_filename,
                    chunk_metadata=metadata,
                )
                if len(point_ids) != len(chunks):
                    raise RuntimeError(f"Qdrant returned {len(point_ids)} point ids for {len(chunks)} chunks.")
                indexed_count = QdrantService.diagnostics(resource_id=resource.id)["count"]
                if indexed_count < len(point_ids):
                    raise RuntimeError(
                        f"Qdrant verification failed for resource {resource.id}: "
                        f"expected at least {len(point_ids)} points, found {indexed_count}."
                    )

                # This commit happens only after every vector for the resource
                # was accepted, preventing PostgreSQL from claiming a partial
                # indexing success.
                for chunk, point_id in zip(chunks, point_ids):
                    chunk.embedding_generated = True
                    chunk.qdrant_point_id = point_id
                resource.status = "COMPLETED"
                resource.processed_at = datetime.datetime.utcnow()
                db.commit()
                rebuilt_resources += 1
                rebuilt_chunks += len(chunks)
                logger.info("Resource %s rebuilt successfully (%d point(s)).", resource.id, len(chunks))
            except Exception:
                db.rollback()
                resource = db.get(ResourceDb, resource.id)
                if resource is not None:
                    resource.status = "FAILED"
                    db.commit()
                logger.exception("Resource %s failed to rebuild and was marked FAILED.", resource.id)
                raise
        return rebuilt_resources, rebuilt_chunks
    finally:
        db.close()


def main() -> int:
    parser = argparse.ArgumentParser(description="Rebuild ExamForge Qdrant vectors from PostgreSQL chunks.")
    parser.add_argument("--resource-id", type=int, help="Rebuild only one resource.")
    parser.add_argument("--dry-run", action="store_true", help="Validate embeddings without writing Qdrant or PostgreSQL.")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
    try:
        resources, chunks = rebuild(args.resource_id, args.dry_run)
        logger.info("Rebuild complete: %d resource(s), %d chunk(s).", resources, chunks)
        return 0
    except Exception as exc:
        logger.error("Rebuild failed: %s", exc)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
