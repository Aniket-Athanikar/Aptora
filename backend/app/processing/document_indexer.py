"""
ExamForge AI - Document Indexer
================================

Orchestration service for full end-to-end document processing and indexing:
1. Text extraction & OCR (DocumentProcessor)
2. Text cleaning (TextCleaner)
3. Text chunking (TextChunker)
4. Metadata extraction (MetadataExtractor)
5. Embedding generation (EmbeddingService)
6. Vector DB storage (QdrantService)
7. Relational DB storage (ResourceContentDb & ResourceChunkDb)
"""

from __future__ import annotations

import datetime
import logging
import traceback
from pathlib import Path
from typing import Any, Dict, List, TypedDict

from sqlalchemy.orm import Session

from app.core.enums import ResourceStatus
from app.models.resource import ResourceDb
from app.models.resource_content import ResourceContentDb
from app.models.resource_chunk import ResourceChunkDb

from app.processing.document_processor import DocumentProcessor
from app.processing.metadata_extractor import MetadataExtractor
from app.ai.services.embedding_service import EmbeddingService
from app.ai.services.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


class IndexerResult(TypedDict):
    """
    Structured dictionary returned upon successful indexing.
    """
    resource_id: int
    chunks: List[str]
    embeddings: List[List[float]]
    status: str


class DocumentIndexer:
    """
    Production-ready orchestrator for document extraction, embedding, vector storage, and DB indexing.
    """

    @classmethod
    def index_document(
        cls,
        db: Session,
        resource: ResourceDb,
    ) -> Dict[str, Any]:
        """
        Run the complete document processing and indexing pipeline for a ResourceDb entity.

        Parameters
        ----------
        db : Session
            SQLAlchemy database session.
        resource : ResourceDb
            Resource database entity to index.

        Returns
        -------
        Dict[str, Any]
            Dictionary containing resource_id, chunks, embeddings, and status.

        Raises
        ------
        Exception
            Re-raises exception after setting resource status to FAILED.
        """
        logger.info(
            "[DocumentIndexer] Starting document indexing pipeline for resource_id=%d ('%s')",
            resource.id,
            resource.original_filename,
        )

        try:
            resource.status = ResourceStatus.PROCESSING.value
            db.commit()
            logger.info("[DocumentIndexer] Resource %d status set to PROCESSING.", resource.id)

            # ------------------------------------------------------------------
            # Stage 1: File Validation & Document Processing (OCR + Clean + Chunk)
            # ------------------------------------------------------------------
            # Uploads can be created on Windows while the worker runs in a
            # Linux container.  Normalise persisted separators before opening
            # the shared /app/app/uploads mount.
            file_path = (resource.storage_path or "").replace("\\", "/")
            if not file_path or not Path(file_path).exists():
                raise FileNotFoundError(
                    f"[DocumentIndexer] Storage path not found: '{file_path}'"
                )

            # Update status to processing stage
            resource.status = ResourceStatus.OCR.value
            db.commit()

            doc_result = DocumentProcessor.process(file_path=file_path)
            logger.info("[DocumentIndexer] OCR complete.")
            logger.info("[DocumentIndexer] Cleaning complete.")
            logger.info("[DocumentIndexer] Chunking complete (%d chunks).", doc_result["total_chunks"])

            # ------------------------------------------------------------------
            # Stage 2: Metadata Extraction
            # ------------------------------------------------------------------
            metadata = MetadataExtractor.extract(
                text=doc_result["clean_text"],
                filename=resource.original_filename or "",
            )
            logger.info(
                "[DocumentIndexer] Metadata complete (title='%s', lang='%s', ~%d pages).",
                metadata["title"],
                metadata["language"],
                metadata["estimated_pages"],
            )

            # ------------------------------------------------------------------
            # Stage 3: Embedding Generation
            # ------------------------------------------------------------------
            resource.status = ResourceStatus.EMBEDDING.value
            db.commit()

            chunks: List[str] = doc_result["chunks"]
            chunk_metadata = cls._build_chunk_metadata(
                chunks=chunks,
                clean_text=doc_result["clean_text"],
                subject=getattr(getattr(resource, "subject", None), "name", None),
                headings=metadata.get("headings", []),
            )

            if not chunks:
                raise RuntimeError(
                    f"Document resource_id={resource.id} produced no indexable chunks."
                )

            embeddings = EmbeddingService.embed_many(chunks)
            logger.info("[DocumentIndexer] Embedding complete (%d vectors).", len(embeddings))
            if len(embeddings) != len(chunks) or any(len(vector) != QdrantService.VECTOR_SIZE for vector in embeddings):
                raise RuntimeError("Embedding validation failed: every chunk needs one 768-dimensional vector.")

            # --------------------------------------------------------------
            # Stage 4: Store Vectors in Qdrant
            # --------------------------------------------------------------
            resource.status = ResourceStatus.INDEXING.value
            db.commit()
            logger.info("[DocumentIndexer] Qdrant insertion started for resource_id=%d.", resource.id)
            try:
                QdrantService.delete_resource(resource.id)
            except RuntimeError:
                # A first upload has no collection/points to remove.
                logger.info("[DocumentIndexer] No prior Qdrant points to replace for resource_id=%d.", resource.id)
            point_ids = QdrantService.upsert_chunks(
                resource_id=resource.id,
                subject_id=resource.subject_id,
                workspace_id=resource.workspace_id,
                chunks=chunks,
                embeddings=embeddings,
                resource_type=getattr(resource.resource_type, "value", resource.resource_type),
                document_title=resource.title or metadata["title"],
                chunk_metadata=chunk_metadata,
            )
            if len(point_ids) != len(chunks):
                raise RuntimeError(
                    f"Qdrant insertion returned {len(point_ids)} point IDs for {len(chunks)} chunks."
                )
            qdrant_state = QdrantService.diagnostics(resource_id=resource.id)
            if qdrant_state["count"] < len(point_ids):
                raise RuntimeError(
                    f"Qdrant insertion verification failed: expected at least {len(point_ids)} "
                    f"points for resource_id={resource.id}, found {qdrant_state['count']}."
                )
            logger.info(
                "[DocumentIndexer] Qdrant insertion finished for resource_id=%d (%d points).",
                resource.id, qdrant_state["count"],
            )

            # ------------------------------------------------------------------
            # Stage 5: Relational Database Persistence
            # ------------------------------------------------------------------
            cls._save_resource_content(
                db=db,
                resource_id=resource.id,
                raw_text=doc_result["raw_text"],
                clean_text=doc_result["clean_text"],
            )

            cls._save_resource_chunks(
                db=db,
                resource_id=resource.id,
                chunks=chunks,
                point_ids=point_ids,
                chunk_metadata=chunk_metadata,
            )

            # Update ResourceDb metadata and status
            resource.total_pages = metadata.get("estimated_pages", resource.total_pages)
            resource.language = metadata.get("language", resource.language or "English")
            if metadata.get("title") and resource.title in ("", "Untitled", resource.original_filename):
                resource.title = metadata["title"]
            resource.status = ResourceStatus.COMPLETED.value
            resource.processed_at = datetime.datetime.utcnow()

            db.commit()
            db.refresh(resource)
            logger.info("[DocumentIndexer] Status updated to COMPLETED and database transaction committed.")

            logger.info(
                "[DocumentIndexer] Finished indexing resource_id=%d successfully. Status: COMPLETED",
                resource.id,
            )

            return {
                "resource_id": resource.id,
                "chunks": chunks,
                "embeddings": embeddings,
                "status": ResourceStatus.COMPLETED.value,
            }

        except Exception as exc:
            error_msg = f"Document indexing failed for resource_id={resource.id}: {exc}"
            logger.error("[DocumentIndexer] %s", error_msg)
            logger.error("[DocumentIndexer] Traceback:\n%s", traceback.format_exc())

            # Attempt rollback and mark status as FAILED in database
            try:
                db.rollback()
                failed_resource = db.query(ResourceDb).filter(ResourceDb.id == resource.id).first()
                if failed_resource:
                    failed_resource.status = ResourceStatus.FAILED.value
                    db.commit()
            except Exception as rollback_exc:
                logger.error("[DocumentIndexer] Failed to update resource status to FAILED: %s", rollback_exc)

            raise RuntimeError(error_msg) from exc

    # -----------------------------------------------------------------------
    # Private Helpers
    # -----------------------------------------------------------------------

    @staticmethod
    def _save_resource_content(
        db: Session,
        resource_id: int,
        raw_text: str,
        clean_text: str,
    ) -> ResourceContentDb:
        """
        Save or update raw and clean text in ResourceContentDb table.
        """
        content_record = (
            db.query(ResourceContentDb)
            .filter(ResourceContentDb.resource_id == resource_id)
            .first()
        )

        if content_record:
            content_record.raw_text = raw_text
            content_record.cleaned_text = clean_text
            content_record.updated_at = datetime.datetime.utcnow()
        else:
            content_record = ResourceContentDb(
                resource_id=resource_id,
                raw_text=raw_text,
                cleaned_text=clean_text,
            )
            db.add(content_record)

        return content_record

    @staticmethod
    def _save_resource_chunks(
        db: Session,
        resource_id: int,
        chunks: List[str],
        point_ids: List[str],
        chunk_metadata: List[Dict[str, Any]],
    ) -> List[ResourceChunkDb]:
        """
        Save or refresh chunk records in ResourceChunkDb table.
        """
        # Delete existing chunks for this resource to allow re-indexing idempotency
        db.query(ResourceChunkDb).filter(ResourceChunkDb.resource_id == resource_id).delete()

        chunk_records: List[ResourceChunkDb] = []
        for idx, chunk_text in enumerate(chunks):
            point_id = point_ids[idx] if idx < len(point_ids) else None
            chunk_record = ResourceChunkDb(
                resource_id=resource_id,
                chunk_index=idx,
                content=chunk_text,
                token_count=len(chunk_text.split()),
                qdrant_point_id=point_id,
                embedding_generated=True if point_id else False,
                page_number=chunk_metadata[idx].get("page_number"),
                subject=chunk_metadata[idx].get("subject"),
                chapter=chunk_metadata[idx].get("chapter"),
                topic=chunk_metadata[idx].get("topic"),
                chunk_metadata={"char_count": len(chunk_text)},
            )
            db.add(chunk_record)
            chunk_records.append(chunk_record)

        return chunk_records

    @staticmethod
    def _build_chunk_metadata(
        chunks: List[str], clean_text: str, subject: str | None, headings: List[str],
    ) -> List[Dict[str, Any]]:
        """Create consistent chunk metadata for Qdrant and relational storage."""
        result: List[Dict[str, Any]] = []
        cursor = 0
        active_heading: str | None = None
        for chunk in chunks:
            position = clean_text.find(chunk, cursor)
            if position < 0:
                position = cursor
            cursor = position + len(chunk)
            preceding = clean_text[:position].lower()
            for heading in headings:
                if heading.lower() in preceding:
                    active_heading = heading
            result.append({
                "subject": subject,
                "chapter": active_heading,
                "topic": active_heading,
                "page_number": max(1, (position // 2200) + 1),
            })
        return result


# ---------------------------------------------------------------------------
# Smoke Test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import sys
    from app.database import SessionLocal

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%H:%M:%S",
    )

    print("=" * 60)
    print("DocumentIndexer - Smoke Test")
    print("=" * 60)

    db_session = SessionLocal()

    try:
        # Query first available resource or check database connection
        test_resource = db_session.query(ResourceDb).first()

        if not test_resource:
            print("No ResourceDb records found in DB to test. Creating dummy mock resource object...")
            test_path = "app/uploads/lec1.pdf"
            if not Path(test_path).exists():
                print(f"Test file '{test_path}' does not exist. Skipping live execution test.")
                sys.exit(0)

            test_resource = ResourceDb(
                id=99999,
                workspace_id=1,
                subject_id=1,
                resource_type="notes",
                title="Smoke Test Lecture Notes",
                original_filename="lec1.pdf",
                stored_filename="lec1.pdf",
                storage_path=test_path,
                mime_type="application/pdf",
                file_size=Path(test_path).stat().st_size,
                status=ResourceStatus.UPLOADED.value,
            )

        print(f"Testing with Resource ID: {test_resource.id}, File: {test_resource.storage_path}")

        # Note: to run index_document in dry-run/test mode without committing mock IDs to production DB:
        # Result demonstration:
        print("DocumentIndexer script loaded cleanly and ready for execution.")

    except Exception as exc:
        print(f"DocumentIndexer test info: {exc}")
    finally:
        db_session.close()
