"""
ExamForge AI - Qdrant Vector DB Service
=========================================

Service layer for interacting with Qdrant Vector Database.
Manages vector collection creation, chunk embedding upserts,
semantic similarity search, and document vector deletion.

Stack & Specifications:
- Client: qdrant-client
- Collection Name: examforge_documents
- Vector Size: 768 (nomic-embed-text)
- Distance Metric: Cosine
"""

from __future__ import annotations

import logging
import time
import uuid
from typing import Any, Final, List, Dict, Optional

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DEFAULT_COLLECTION_NAME: Final[str] = "examforge_documents"
DEFAULT_VECTOR_SIZE: Final[int] = 768
MAX_RETRIES: Final[int] = 3
RETRY_DELAY_SECONDS: Final[float] = 1.0

class QdrantService:
    """
    Production-ready service for managing Qdrant vector storage and retrieval.
    """

    COLLECTION_NAME: str = getattr(settings, "QDRANT_COLLECTION", DEFAULT_COLLECTION_NAME)
    if not COLLECTION_NAME or COLLECTION_NAME == "examforge_resources":
        COLLECTION_NAME = DEFAULT_COLLECTION_NAME

    VECTOR_SIZE: int = getattr(settings, "EMBEDDING_DIMENSION", DEFAULT_VECTOR_SIZE)

    _client_instance: Optional[QdrantClient] = None

    @classmethod
    def get_client(cls) -> QdrantClient:
        """
        Get or initialize the QdrantClient instance.
        First attempts to reuse database module client, falls back to direct instantiation.
        """
        if cls._client_instance is not None:
            try:
                cls._client_instance.get_collections()
                return cls._client_instance
            except Exception:
                cls._client_instance = None

        # Try to import global qdrant_client from database module if available
        try:
            from app.database import qdrant_client as db_qdrant_client
            if db_qdrant_client is not None:
                db_qdrant_client.get_collections()
                cls._client_instance = db_qdrant_client
                return cls._client_instance
        except Exception as exc:
            logger.debug("[QdrantService] Could not import active qdrant_client from app.database: %s", exc)

        # Fallback to creating a new QdrantClient using configuration
        host = getattr(settings, "QDRANT_HOST", "127.0.0.1")
        port = int(getattr(settings, "QDRANT_PORT", 6333))

        reachable_clients: list[tuple[QdrantClient, int, int]] = []
        for try_port in ([port, 6433] if port != 6433 else [6433]):
            try:
                logger.info("[QdrantService] Initializing QdrantClient at %s:%d", host, try_port)
                c = QdrantClient(host=host, port=try_port, timeout=5)
                c.get_collections()
                try:
                    vector_count = c.count(collection_name=cls.COLLECTION_NAME, exact=True).count
                except Exception:
                    vector_count = 0
                reachable_clients.append((c, try_port, vector_count))
            except Exception as e:
                logger.debug("[QdrantService] Connection attempt to %s:%d failed: %s", host, try_port, e)

        if reachable_clients:
            selected, selected_port, vector_count = max(reachable_clients, key=lambda item: item[2])
            logger.info(
                "[QdrantService] Selected Qdrant at %s:%d for collection '%s' (%d point(s)).",
                host, selected_port, cls.COLLECTION_NAME, vector_count,
            )
            cls._client_instance = selected
            return cls._client_instance

        cls._client_instance = QdrantClient(host=host, port=port, timeout=10)
        return cls._client_instance

    @classmethod
    def create_collection(cls, collection_name: Optional[str] = None) -> bool:
        """
        Check if Qdrant collection exists. If missing, create it with Cosine distance.
        """
        target_collection = collection_name or cls.COLLECTION_NAME
        client = cls.get_client()

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                collections_response = client.get_collections()
                existing_names = [col.name for col in collections_response.collections]

                if target_collection in existing_names:
                    cls._ensure_payload_indexes(client, target_collection)
                    logger.info(
                        "[QdrantService] Collection '%s' already exists.",
                        target_collection,
                    )
                    return True

                logger.info(
                    "[QdrantService] Creating Qdrant collection '%s' (vector_size=%d, distance=Cosine)...",
                    target_collection,
                    cls.VECTOR_SIZE,
                )

                client.create_collection(
                    collection_name=target_collection,
                    vectors_config=qmodels.VectorParams(
                        size=cls.VECTOR_SIZE,
                        distance=qmodels.Distance.COSINE,
                    ),
                )

                # These fields are used by every retrieval path.  Explicit
                # payload indexes make filtered searches reliable at scale.
                cls._ensure_payload_indexes(client, target_collection)

                logger.info(
                    "[QdrantService] Collection '%s' created successfully.",
                    target_collection,
                )
                return True

            except Exception as exc:
                logger.warning(
                    "[QdrantService] Attempt %d/%d to create collection '%s' failed: %s",
                    attempt,
                    MAX_RETRIES,
                    target_collection,
                    exc,
                )
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY_SECONDS * attempt)
                else:
                    logger.error(
                        "[QdrantService] Failed to create collection '%s' after %d attempts.",
                        target_collection,
                        MAX_RETRIES,
                    )
                    raise RuntimeError(
                        f"Qdrant collection creation failed for '{target_collection}': {exc}"
                    ) from exc

        return False

    @staticmethod
    def _ensure_payload_indexes(client: QdrantClient, collection_name: str) -> None:
        for field_name, schema in (("workspace_id", qmodels.PayloadSchemaType.INTEGER), ("subject_id", qmodels.PayloadSchemaType.INTEGER), ("resource_id", qmodels.PayloadSchemaType.INTEGER), ("resource_type", qmodels.PayloadSchemaType.KEYWORD)):
            try:
                client.create_payload_index(collection_name, field_name=field_name, field_schema=schema, wait=True)
            except Exception as exc:
                # Qdrant may report an existing index; it is still safe for retrieval.
                logger.debug("[QdrantService] Payload index %s check: %s", field_name, exc)

    @classmethod
    def upsert_chunks(
        cls,
        resource_id: int,
        subject_id: int,
        workspace_id: int,
        chunks: List[str],
        embeddings: List[List[float]],
        resource_type: Optional[str] = None,
        document_title: Optional[str] = None,
        chunk_metadata: Optional[List[Dict[str, Any]]] = None,
        collection_name: Optional[str] = None,
    ) -> List[str]:
        """
        Store chunk embeddings in Qdrant with metadata payload.

        Parameters
        ----------
        resource_id : int
            ID of the resource document.
        subject_id : int
            ID of the subject context.
        workspace_id : int
            ID of the goal workspace context.
        chunks : List[str]
            List of text chunks.
        embeddings : List[List[float]]
            Corresponding list of embedding vectors.
        collection_name : str, optional
            Target collection name.

        Returns
        -------
        List[str]
            List of generated point UUIDs stored in Qdrant.
        """
        if not chunks or not embeddings:
            raise ValueError("[QdrantService] Chunks and embeddings must not be empty.")

        if len(chunks) != len(embeddings):
            raise ValueError(
                f"[QdrantService] Mismatched counts: {len(chunks)} chunks vs {len(embeddings)} embeddings."
            )
        if chunk_metadata is not None and len(chunk_metadata) != len(chunks):
            raise ValueError("[QdrantService] chunk_metadata must contain one item per chunk.")

        target_collection = collection_name or cls.COLLECTION_NAME
        client = cls.get_client()

        # Ensure collection exists before upsert
        cls.create_collection(target_collection)

        points: List[qmodels.PointStruct] = []
        point_ids: List[str] = []

        for idx, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
            if len(embedding) != cls.VECTOR_SIZE:
                raise ValueError(
                    f"[QdrantService] Chunk {idx} vector dimension mismatch: "
                    f"expected {cls.VECTOR_SIZE}, got {len(embedding)}"
                )

            point_id = str(uuid.uuid4())
            point_ids.append(point_id)

            metadata = chunk_metadata[idx] if chunk_metadata else {}
            payload: Dict[str, Any] = {
                "resource_id": resource_id,
                "workspace_id": workspace_id,
                "subject_id": subject_id,
                "chunk_index": idx,
                "content": chunk_text,
                "chunk_text": chunk_text,
                "resource_type": resource_type,
                "document_title": document_title,
                "subject": metadata.get("subject"),
                "chapter": metadata.get("chapter"),
                "topic": metadata.get("topic"),
                "page_number": metadata.get("page_number"),
            }

            points.append(
                qmodels.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload,
                )
            )

        start_time = time.perf_counter()
        logger.info(
            "[QdrantService] Upserting %d vectors into collection '%s' for resource_id=%d...",
            len(points),
            target_collection,
            resource_id,
        )

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                client.upsert(
                    collection_name=target_collection,
                    points=points,
                    wait=True,
                )
                elapsed = time.perf_counter() - start_time
                logger.info(
                    "[QdrantService] Vectors inserted successfully (%d points in %.3fs).",
                    len(points),
                    elapsed,
                )
                return point_ids

            except Exception as exc:
                logger.warning(
                    "[QdrantService] Attempt %d/%d to upsert chunks failed: %s",
                    attempt,
                    MAX_RETRIES,
                    exc,
                )
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY_SECONDS * attempt)
                else:
                    logger.error("[QdrantService] Failed to upsert chunks to Qdrant after retries.")
                    raise RuntimeError(f"Qdrant upsert failed for resource {resource_id}: {exc}") from exc

        return point_ids

    @classmethod
    def diagnostics(cls, workspace_id: Optional[int] = None, resource_id: Optional[int] = None) -> Dict[str, Any]:
        """Return a small, safe proof of what is actually indexed in Qdrant."""
        client = cls.get_client()
        cls.create_collection(cls.COLLECTION_NAME)
        must = []
        for key, value in (("workspace_id", workspace_id), ("resource_id", resource_id)):
            if value is not None:
                must.append(qmodels.FieldCondition(key=key, match=qmodels.MatchValue(value=value)))
        query_filter = qmodels.Filter(must=must) if must else None
        count = client.count(collection_name=cls.COLLECTION_NAME, count_filter=query_filter, exact=True).count
        points, _ = client.scroll(collection_name=cls.COLLECTION_NAME, scroll_filter=query_filter, limit=1, with_payload=True, with_vectors=False)
        return {"collection": cls.COLLECTION_NAME, "vector_size": cls.VECTOR_SIZE, "count": count, "sample_payload": points[0].payload if points else None}

    @classmethod
    def search(
        cls,
        embedding: List[float],
        limit: int = 5,
        resource_id: Optional[int] = None,
        workspace_id: Optional[int] = None,
        subject_id: Optional[int] = None,
        collection_name: Optional[str] = None,
        query_filter: Optional[qmodels.Filter] = None,
    ) -> List[Any]:
        """
        Search for top matching vector chunks in Qdrant.
        """
        if not embedding or len(embedding) != cls.VECTOR_SIZE:
            raise ValueError(
                f"[QdrantService] Invalid query vector size: expected {cls.VECTOR_SIZE}, got {len(embedding) if embedding else 0}"
            )

        target_collection = collection_name or cls.COLLECTION_NAME
        client = cls.get_client()

        # Build filter if optional parameters supplied
        must_filters = []
        if resource_id is not None:
            must_filters.append(
                qmodels.FieldCondition(
                    key="resource_id",
                    match=qmodels.MatchValue(value=resource_id),
                )
            )
        if workspace_id is not None:
            must_filters.append(
                qmodels.FieldCondition(
                    key="workspace_id",
                    match=qmodels.MatchValue(value=workspace_id),
                )
            )
        if subject_id is not None:
            must_filters.append(
                qmodels.FieldCondition(
                    key="subject_id",
                    match=qmodels.MatchValue(value=subject_id),
                )
            )

        if query_filter is not None:
            if must_filters:
                existing_must = list(query_filter.must) if query_filter.must else []
                query_filter = qmodels.Filter(must=existing_must + must_filters)
        else:
            query_filter = qmodels.Filter(must=must_filters) if must_filters else None

        start_time = time.perf_counter()
        logger.info(
            "[QdrantService] Performing vector search in '%s' (limit=%d)...",
            target_collection,
            limit,
        )

        try:
            cls.create_collection(target_collection)

            if hasattr(client, "query_points"):
                response = client.query_points(
                    collection_name=target_collection,
                    query=embedding,
                    limit=limit,
                    query_filter=query_filter,
                    with_payload=True,
                )
                results = getattr(response, "points", [])
            elif hasattr(client, "search"):
                results = client.search(
                    collection_name=target_collection,
                    query_vector=embedding,
                    limit=limit,
                    query_filter=query_filter,
                    with_payload=True,
                )
            else:
                results = []

            elapsed = time.perf_counter() - start_time
            logger.info(
                "[QdrantService] Search completed in %.3fs — returned %d result(s).",
                elapsed,
                len(results),
            )
            return results

        except Exception as exc:
            logger.error("[QdrantService] Vector search failed: %s", exc)
            raise RuntimeError(f"Qdrant search failed: {exc}") from exc

    @classmethod
    def delete_resource(
        cls,
        resource_id: int,
        collection_name: Optional[str] = None,
    ) -> None:
        """
        Delete all vector points belonging to a specific resource_id.
        """
        target_collection = collection_name or cls.COLLECTION_NAME
        client = cls.get_client()

        logger.info(
            "[QdrantService] Deleting all vectors for resource_id=%d from collection '%s'...",
            resource_id,
            target_collection,
        )

        filter_condition = qmodels.Filter(
            must=[
                qmodels.FieldCondition(
                    key="resource_id",
                    match=qmodels.MatchValue(value=resource_id),
                )
            ]
        )

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                client.delete(
                    collection_name=target_collection,
                    points_selector=qmodels.FilterSelector(filter=filter_condition),
                    wait=True,
                )
                logger.info(
                    "[QdrantService] Deletion completed for resource_id=%d.",
                    resource_id,
                )
                return

            except Exception as exc:
                logger.warning(
                    "[QdrantService] Attempt %d/%d to delete resource_id=%d failed: %s",
                    attempt,
                    MAX_RETRIES,
                    resource_id,
                    exc,
                )
                if attempt < MAX_RETRIES:
                    time.sleep(RETRY_DELAY_SECONDS * attempt)
                else:
                    logger.error(
                        "[QdrantService] Failed to delete vectors for resource_id=%d after retries.",
                        resource_id,
                    )
                    raise RuntimeError(
                        f"Qdrant deletion failed for resource_id={resource_id}: {exc}"
                    ) from exc

if __name__ == "__main__":
    import random

    logging.basicConfig(level=logging.INFO)

    print("=" * 60)
    print("QdrantService - Smoke Test")
    print("=" * 60)

    try:
        # 1. Create collection
        QdrantService.create_collection()

        # 2. Insert dummy vectors
        dummy_resource_id = 9999
        dummy_chunks = [
            "This is dummy chunk 1 about algorithms.",
            "This is dummy chunk 2 about data structures.",
        ]
        dummy_embeddings = [
            [random.uniform(-1, 1) for _ in range(768)],
            [random.uniform(-1, 1) for _ in range(768)],
        ]

        inserted_ids = QdrantService.upsert_chunks(
            resource_id=dummy_resource_id,
            subject_id=1,
            workspace_id=1,
            chunks=dummy_chunks,
            embeddings=dummy_embeddings,
        )
        print(f"Vectors inserted: {len(inserted_ids)} point IDs: {inserted_ids}")

        # 3. Search
        search_results = QdrantService.search(
            embedding=dummy_embeddings[0],
            limit=2,
            resource_id=dummy_resource_id,
        )
        print(f"Search completed: found {len(search_results)} matching points.")
        for res in search_results:
            print(f"  Point ID: {res.id}, Score: {res.score:.4f}, Payload: {res.payload}")

        # 4. Delete
        QdrantService.delete_resource(resource_id=dummy_resource_id)
        print("Deletion completed for dummy resource.")

        print("QdrantService smoke test PASSED!")

    except Exception as exc:
        print(f"QdrantService smoke test notice: {exc}")
