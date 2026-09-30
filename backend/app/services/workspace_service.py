"""
Aptora - Workspace Service

Service layer for managing workspaces, loading workspace documents, workspace statistics,
subject libraries, and searching workspace resource libraries.
"""

import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.core.enums import ResourceType
from app.models.resource import ResourceDb
from app.models.resource_chunk import ResourceChunkDb
from app.models.workspace import GoalWorkspaceDb
from app.models.workspace_subject import WorkspaceSubjectDb
from app.services.base_service import BaseService

logger = logging.getLogger(__name__)


class WorkspaceService(BaseService):
    """
    Service handling all workspace data, library organization, statistics, and search.
    """

    model = GoalWorkspaceDb

    @classmethod
    def get_workspace(
        cls,
        db: Session,
        workspace_id: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> Optional[Any]:
        """
        Retrieve workspace details.
        If workspace_id is specified, loads and returns workspace info dictionary:
        - Workspace ID
        - User ID
        - Exam name & category
        - Description
        - Created / updated dates
        - Progress
        If only user_id is specified, returns GoalWorkspaceDb object for backward compatibility.
        """

        if workspace_id is not None:
            workspace = (
                db.query(GoalWorkspaceDb)
                .filter(GoalWorkspaceDb.id == workspace_id)
                .first()
            )

            if not workspace:
                return None

            progress = 0.0
            if workspace.profile and hasattr(workspace.profile, "syllabus_percent"):
                progress = float(workspace.profile.syllabus_percent or 0.0)

            description = f"{workspace.exam_category} - {workspace.target_exam}"

            return {
                "id": workspace.id,
                "user_id": workspace.user_id,
                "target_exam": workspace.target_exam,
                "exam_name": workspace.target_exam,
                "exam_category": workspace.exam_category,
                "description": description,
                "created_at": workspace.created_at,
                "updated_at": workspace.updated_at,
                "progress": progress,
            }

        if user_id is not None:
            return cls.get_one(
                db,
                user_id=user_id,
            )

        return None

    @classmethod
    def create_workspace(
        cls,
        db: Session,
        user_id: int,
        workspace,
    ) -> GoalWorkspaceDb:
        """
        Create a new workspace and its default subjects.
        """

        created_workspace = cls.create(
            db,
            user_id=user_id,
            target_exam=workspace.target_exam,
            exam_category=workspace.exam_category,
        )

        subjects = cls._get_default_subjects(
            workspace.target_exam
        )

        for index, subject in enumerate(subjects, start=1):
            db.add(
                WorkspaceSubjectDb(
                    workspace_id=created_workspace.id,
                    name=subject,
                    display_order=index,
                    is_active=True,
                )
            )

        db.commit()

        return created_workspace

    @classmethod
    def update_workspace(
        cls,
        db: Session,
        user_id: int,
        workspace,
    ) -> Optional[GoalWorkspaceDb]:
        """
        Update user workspace details.
        """
        obj = cls.get_one(
            db,
            user_id=user_id,
        )

        if not obj:
            return None

        return cls.update(
            db,
            obj,
            target_exam=workspace.target_exam,
            exam_category=workspace.exam_category,
        )

    @classmethod
    def delete_workspace(
        cls,
        db: Session,
        user_id: int,
    ) -> bool:
        """
        Delete user workspace.
        """
        obj = cls.get_one(
            db,
            user_id=user_id,
        )

        if not obj:
            return False

        return cls.delete(
            db,
            obj,
        )

    @classmethod
    def get_workspace_documents(
        cls,
        db: Session,
        workspace_id: int,
    ) -> List[Dict[str, Any]]:
        """
        Return all uploaded resources grouped by:
        Subject -> Books, Notes, PYQs, Syllabus
        """
        subjects = (
            db.query(WorkspaceSubjectDb)
            .filter(WorkspaceSubjectDb.workspace_id == workspace_id)
            .order_by(
                WorkspaceSubjectDb.display_order.asc(),
                WorkspaceSubjectDb.name.asc(),
            )
            .all()
        )

        resources = (
            db.query(ResourceDb)
            .filter(ResourceDb.workspace_id == workspace_id)
            .order_by(ResourceDb.created_at.desc())
            .all()
        )

        resources_by_subject: Dict[int, Dict[str, List[ResourceDb]]] = {
            s.id: {
                "books": [],
                "notes": [],
                "pyqs": [],
                "syllabus": [],
            }
            for s in subjects
        }

        for res in resources:
            if res.subject_id in resources_by_subject:
                res_type = (
                    res.resource_type.value
                    if isinstance(res.resource_type, ResourceType)
                    else str(res.resource_type).lower()
                )

                if res_type == ResourceType.BOOK.value or "book" in res_type:
                    resources_by_subject[res.subject_id]["books"].append(res)
                elif res_type == ResourceType.NOTES.value or "note" in res_type:
                    resources_by_subject[res.subject_id]["notes"].append(res)
                elif res_type == ResourceType.PYQ.value or "pyq" in res_type:
                    resources_by_subject[res.subject_id]["pyqs"].append(res)
                elif res_type == ResourceType.SYLLABUS.value or "syllabus" in res_type:
                    resources_by_subject[res.subject_id]["syllabus"].append(res)

        groups = []
        for s in subjects:
            grp = resources_by_subject[s.id]
            groups.append(
                {
                    "subject_id": s.id,
                    "subject_name": s.name,
                    "description": s.description,
                    "icon": s.icon,
                    "color": s.color,
                    "books": grp["books"],
                    "notes": grp["notes"],
                    "pyqs": grp["pyqs"],
                    "syllabus": grp["syllabus"],
                }
            )

        logger.info(
            f"Loaded documents for workspace #{workspace_id}: "
            f"{len(groups)} subject group(s)"
        )
        return groups

    @classmethod
    def get_workspace_subjects(
        cls,
        db: Session,
        workspace_id: int,
    ) -> List[WorkspaceSubjectDb]:
        """
        Retrieve all subjects belonging to a workspace. Auto-populates default subjects if none exist.
        """
        subjects = (
            db.query(WorkspaceSubjectDb)
            .filter(WorkspaceSubjectDb.workspace_id == workspace_id)
            .order_by(
                WorkspaceSubjectDb.display_order.asc(),
                WorkspaceSubjectDb.name.asc(),
            )
            .all()
        )

        if not subjects:
            workspace = db.query(GoalWorkspaceDb).filter(GoalWorkspaceDb.id == workspace_id).first()
            target_exam = workspace.target_exam if workspace else "General"
            default_names = cls._get_default_subjects(target_exam)
            if not default_names or default_names == ["General"]:
                default_names = [
                    "History & Culture",
                    "Geography & Ecology",
                    "Polity & Governance",
                    "Economy & Growth",
                    "Science & Technology",
                ]

            for index, name in enumerate(default_names, start=1):
                db.add(
                    WorkspaceSubjectDb(
                        workspace_id=workspace_id,
                        name=name,
                        display_order=index,
                        is_active=True,
                    )
                )
            db.commit()

            subjects = (
                db.query(WorkspaceSubjectDb)
                .filter(WorkspaceSubjectDb.workspace_id == workspace_id)
                .order_by(
                    WorkspaceSubjectDb.display_order.asc(),
                    WorkspaceSubjectDb.name.asc(),
                )
                .all()
            )

        return subjects


    @classmethod
    def get_workspace_statistics(
        cls,
        db: Session,
        workspace_id: int,
    ) -> Dict[str, int]:
        """
        Return workspace content statistics:
        - subjects
        - documents
        - books
        - notes
        - pyqs
        - syllabus
        - chunks
        - embeddings
        """
        subject_count = (
            db.query(func.count(WorkspaceSubjectDb.id))
            .filter(WorkspaceSubjectDb.workspace_id == workspace_id)
            .scalar()
            or 0
        )

        doc_count = (
            db.query(func.count(ResourceDb.id))
            .filter(ResourceDb.workspace_id == workspace_id)
            .scalar()
            or 0
        )

        books_count = (
            db.query(func.count(ResourceDb.id))
            .filter(
                ResourceDb.workspace_id == workspace_id,
                ResourceDb.resource_type == ResourceType.BOOK,
            )
            .scalar()
            or 0
        )

        notes_count = (
            db.query(func.count(ResourceDb.id))
            .filter(
                ResourceDb.workspace_id == workspace_id,
                ResourceDb.resource_type == ResourceType.NOTES,
            )
            .scalar()
            or 0
        )

        pyqs_count = (
            db.query(func.count(ResourceDb.id))
            .filter(
                ResourceDb.workspace_id == workspace_id,
                ResourceDb.resource_type == ResourceType.PYQ,
            )
            .scalar()
            or 0
        )

        syllabus_count = (
            db.query(func.count(ResourceDb.id))
            .filter(
                ResourceDb.workspace_id == workspace_id,
                ResourceDb.resource_type == ResourceType.SYLLABUS,
            )
            .scalar()
            or 0
        )

        chunks_count = (
            db.query(func.count(ResourceChunkDb.id))
            .join(ResourceDb, ResourceChunkDb.resource_id == ResourceDb.id)
            .filter(ResourceDb.workspace_id == workspace_id)
            .scalar()
            or 0
        )

        embeddings_count = (
            db.query(func.count(ResourceChunkDb.id))
            .join(ResourceDb, ResourceChunkDb.resource_id == ResourceDb.id)
            .filter(
                ResourceDb.workspace_id == workspace_id,
                ResourceChunkDb.embedding_generated.is_(True),
            )
            .scalar()
            or 0
        )

        stats = {
            "subjects": subject_count,
            "documents": doc_count,
            "books": books_count,
            "notes": notes_count,
            "pyqs": pyqs_count,
            "syllabus": syllabus_count,
            "chunks": chunks_count,
            "embeddings": embeddings_count,
        }

        logger.info(
            f"Calculated statistics for workspace #{workspace_id}: {stats}"
        )
        return stats

    @classmethod
    def get_recent_documents(
        cls,
        db: Session,
        workspace_id: int,
        limit: int = 10,
    ) -> List[ResourceDb]:
        """
        Return last uploaded documents for workspace.
        """
        recent_docs = (
            db.query(ResourceDb)
            .filter(ResourceDb.workspace_id == workspace_id)
            .order_by(ResourceDb.created_at.desc())
            .limit(limit)
            .all()
        )

        logger.info(
            f"Retrieved {len(recent_docs)} recent document(s) "
            f"for workspace #{workspace_id}"
        )
        return recent_docs

    @classmethod
    def get_subject_library(
        cls,
        db: Session,
        workspace_id: int,
        subject_id: int,
    ) -> Optional[Dict[str, Any]]:
        """
        Return library data for a specific subject:
        Subject info + books, notes, pyqs, syllabus lists.
        """
        subject = (
            db.query(WorkspaceSubjectDb)
            .filter(
                WorkspaceSubjectDb.id == subject_id,
                WorkspaceSubjectDb.workspace_id == workspace_id,
            )
            .first()
        )

        if not subject:
            return None

        resources = (
            db.query(ResourceDb)
            .filter(
                ResourceDb.workspace_id == workspace_id,
                ResourceDb.subject_id == subject_id,
            )
            .order_by(ResourceDb.created_at.desc())
            .all()
        )

        books: List[ResourceDb] = []
        notes: List[ResourceDb] = []
        pyqs: List[ResourceDb] = []
        syllabus: List[ResourceDb] = []

        for res in resources:
            res_type = (
                res.resource_type.value
                if isinstance(res.resource_type, ResourceType)
                else str(res.resource_type).lower()
            )

            if res_type == ResourceType.BOOK.value or "book" in res_type:
                books.append(res)
            elif res_type == ResourceType.NOTES.value or "note" in res_type:
                notes.append(res)
            elif res_type == ResourceType.PYQ.value or "pyq" in res_type:
                pyqs.append(res)
            elif res_type == ResourceType.SYLLABUS.value or "syllabus" in res_type:
                syllabus.append(res)

        logger.info(
            f"Retrieved subject library for subject #{subject_id} "
            f"in workspace #{workspace_id}"
        )

        return {
            "subject_id": subject.id,
            "subject": subject.name,
            "description": subject.description,
            "icon": subject.icon,
            "color": subject.color,
            "books": books,
            "notes": notes,
            "pyqs": pyqs,
            "syllabus": syllabus,
        }

    @classmethod
    def search_library(
        cls,
        db: Session,
        workspace_id: int,
        keyword: str,
        resource_type: Optional[str] = None,
        subject_id: Optional[int] = None,
        limit: int = 20,
        offset: int = 0,
        sort_by: str = "created_at_desc",
    ) -> Dict[str, Any]:
        """
        Search document titles, metadata, topics, and chapters.
        Supports pagination, sorting, and filtering.
        """
        query = db.query(ResourceDb).filter(
            ResourceDb.workspace_id == workspace_id
        )

        if subject_id is not None:
            query = query.filter(ResourceDb.subject_id == subject_id)

        if resource_type and resource_type.strip():
            rt_lower = resource_type.strip().lower()
            matching_enum = None
            for member in ResourceType:
                if member.value.lower() == rt_lower or member.name.lower() == rt_lower:
                    matching_enum = member
                    break

            if matching_enum:
                query = query.filter(ResourceDb.resource_type == matching_enum)
            else:
                query = query.filter(ResourceDb.resource_type == resource_type)

        if keyword and keyword.strip():
            kw = f"%{keyword.strip()}%"

            matching_chunk_subquery = (
                db.query(ResourceChunkDb.resource_id)
                .filter(
                    or_(
                        ResourceChunkDb.topic.ilike(kw),
                        ResourceChunkDb.chapter.ilike(kw),
                        ResourceChunkDb.subject.ilike(kw),
                        ResourceChunkDb.content.ilike(kw),
                    )
                )
                .scalar_subquery()
            )


            query = query.filter(
                or_(
                    ResourceDb.title.ilike(kw),
                    ResourceDb.description.ilike(kw),
                    ResourceDb.original_filename.ilike(kw),
                    ResourceDb.id.in_(matching_chunk_subquery),
                )
            )

        total = query.count()

        if sort_by == "created_at_asc":
            query = query.order_by(ResourceDb.created_at.asc())
        elif sort_by == "title_asc":
            query = query.order_by(ResourceDb.title.asc())
        elif sort_by == "title_desc":
            query = query.order_by(ResourceDb.title.desc())
        else:
            query = query.order_by(ResourceDb.created_at.desc())

        items = query.offset(offset).limit(limit).all()

        logger.info(
            f"Searched library workspace #{workspace_id} "
            f"keyword='{keyword}' total={total} items_returned={len(items)}"
        )

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "items": items,
        }
    @staticmethod
    def _get_default_subjects(target_exam: str) -> list[str]:
        exam = target_exam.lower()

        if "upsc" in exam:
            return [
                "History",
                "Geography",
                "Polity",
                "Economy",
                "Environment",
                "Science & Technology",
                "Current Affairs",
                "Ethics",
            ]

        if "jee" in exam:
            return [
                "Physics",
                "Chemistry",
                "Mathematics",
            ]

        if "neet" in exam:
            return [
                "Physics",
                "Chemistry",
                "Biology",
            ]

        return ["General"]