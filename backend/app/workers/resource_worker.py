"""
ExamForge AI - Resource Worker

Pipeline:
1. Listen for jobs from Redis
2. Extract text (OCR)
3. Clean text
4. Extract metadata
5. Store OCR output
6. Generate chunks
7. Detect topics
8. Generate embeddings
9. Upload vectors to Qdrant
10. Update processing status
"""

import logging
import time

from sqlalchemy.orm import Session

from app.database import SessionLocal

from app.processing.redis_service import RedisService
from app.processing.ocr_service import OCRService
from app.processing.cleaner import CleanerService
from app.processing.metadata_service import MetadataService
from app.processing.chunk_service import ChunkService
from app.processing.topic_service import TopicService
from app.processing.embedding_service import EmbeddingService
from app.processing.qdrant_service import QdrantService

from app.repositories.resource_repository import ResourceRepository
from app.repositories.resource_content_repository import ResourceContentRepository
from app.repositories.resource_chunk_repository import ResourceChunkRepository

logger = logging.getLogger(__name__)


class ResourceWorker:

    # ==========================================================
    # OCR + Resource Content
    # ==========================================================

    @staticmethod
    def save_resource_content(
        db: Session,
        resource,
        raw_text: str,
        cleaned_text: str,
    ):

        existing = ResourceContentRepository.get_by_resource_id(
            db=db,
            resource_id=resource.id,
        )

        if existing:

            ResourceContentRepository.update(
                db=db,
                content=existing,
                raw_text=raw_text,
                cleaned_text=cleaned_text,
            )

        else:

            ResourceContentRepository.create(
                db=db,
                resource_id=resource.id,
                raw_text=raw_text,
                cleaned_text=cleaned_text,
            )

        logger.info(
            "OCR content saved."
        )

    # ==========================================================
    # Chunk Generation
    # ==========================================================

    @staticmethod
    def generate_chunks(
        db: Session,
        resource,
        cleaned_text: str,
    ):

        ResourceChunkRepository.delete_by_resource_id(
            db=db,
            resource_id=resource.id,
        )

        chunks = ChunkService.split(cleaned_text)

        logger.info(
            f"Generated {len(chunks)} chunks."
        )

        ResourceChunkRepository.create_many(
            db=db,
            resource_id=resource.id,
            chunks=chunks,
        )

    # ==========================================================
    # AI Processing
    # ==========================================================

    @staticmethod
    def process_chunks(
        db: Session,
        resource,
    ):

        chunks = ResourceChunkRepository.get_by_resource_id(
            db=db,
            resource_id=resource.id,
        )

        logger.info(
            f"Processing {len(chunks)} chunks."
        )

        for chunk in chunks:

            logger.info(
                f"Chunk #{chunk.chunk_index}"
            )

            # -------------------------
            # Topic Detection
            # -------------------------

            analysis = TopicService.detect(
                chunk.content
            )

            chunk = ResourceChunkRepository.update_analysis(
                db=db,
                chunk=chunk,
                subject=analysis.get("subject"),
                chapter=analysis.get("chapter"),
                topic=analysis.get("topic"),
                metadata={
                    "keywords": analysis.get(
                        "keywords",
                        [],
                    )
                },
            )

            # -------------------------
            # Embedding
            # -------------------------

            embedding = EmbeddingService.generate(
                chunk.content
            )

            # -------------------------
            # Upload to Qdrant
            # -------------------------

            point_id = QdrantService.upload(
                embedding=embedding,
                payload={
                    "workspace_id": resource.workspace_id,
                    "resource_id": resource.id,
                    "chunk_id": chunk.id,
                    "chunk_index": chunk.chunk_index,
                    "subject": chunk.subject,
                    "chapter": chunk.chapter,
                    "topic": chunk.topic,
                    "page_number": chunk.page_number,
                },
            )

            ResourceChunkRepository.update_embedding(
                db=db,
                chunk=chunk,
                qdrant_point_id=point_id,
            )

        logger.info(
            "AI processing completed."
        )

    # ==========================================================
    # Main Processing Pipeline
    # ==========================================================

    @staticmethod
    def process_resource(
        db: Session,
        resource,
    ):

        logger.info(
            f"Processing Resource #{resource.id}"
        )

        ResourceRepository.update_status(
            db=db,
            resource=resource,
            status="PROCESSING",
        )

        try:

            raw_text = OCRService.extract_text(
                resource.storage_path
            )

            if not raw_text.strip():
                raise Exception(
                    "No text extracted from document."
                )

            cleaned_text = CleanerService.clean(
                raw_text
            )

            logger.info(
                f"Extracted {len(cleaned_text)} characters."
            )

            metadata = MetadataService.extract(
                resource.storage_path
            )

            logger.info(
                f"Metadata: {metadata}"
            )

            ResourceWorker.save_resource_content(
                db=db,
                resource=resource,
                raw_text=raw_text,
                cleaned_text=cleaned_text,
            )

            ResourceWorker.generate_chunks(
                db=db,
                resource=resource,
                cleaned_text=cleaned_text,
            )

            ResourceWorker.process_chunks(
                db=db,
                resource=resource,
            )

            ResourceRepository.update_status(
                db=db,
                resource=resource,
                status="COMPLETED",
            )

            logger.info(
                f"Resource #{resource.id} completed."
            )

        except Exception:

            logger.exception(
                "Resource processing failed."
            )

            ResourceRepository.update_status(
                db=db,
                resource=resource,
                status="FAILED",
            )

    # ==========================================================
    # Worker Loop
    # ==========================================================

    @staticmethod
    def start():

        logger.info("=" * 60)
        logger.info("ExamForge Resource Worker Started")
        logger.info("=" * 60)

        while True:

            db = SessionLocal()

            try:

                job = RedisService.dequeue_document()

                if job is None:
                    time.sleep(2)
                    continue

                resource_id = job["resource_id"]

                logger.info(
                    f"Received Resource #{resource_id}"
                )

                resource = ResourceRepository.get_by_id(
                    db=db,
                    resource_id=resource_id,
                )

                if resource is None:

                    logger.warning(
                        f"Resource #{resource_id} not found."
                    )

                    continue

                ResourceWorker.process_resource(
                    db=db,
                    resource=resource,
                )

            except Exception:

                logger.exception(
                    "Worker execution failed."
                )

            finally:

                db.close()

            time.sleep(1)