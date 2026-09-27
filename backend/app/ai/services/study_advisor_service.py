"""
Aptora — Study Advisor Service
======================================

Orchestrates personalized study advice generation:
1. Fetches workspace details and statistics via WorkspaceService
2. Fetches sample study material chunks via RAG
3. Invokes StudyAdvisorAgent
4. Returns formatted study recommendation response
"""

from __future__ import annotations

import logging
from typing import Any
from sqlalchemy.orm import Session

from app.ai.agents.study_advisor import StudyAdvisorAgent
from app.ai.rag.context_builder import ContextBuilder
from app.ai.rag.retriever import Retriever
from app.services.workspace_service import WorkspaceService

logger = logging.getLogger(__name__)

_agent = StudyAdvisorAgent()


class StudyAdvisorService:
    """
    Service responsible for building customized study plans.
    """

    @classmethod
    def generate_plan(
        cls,
        db: Session,
        workspace_id: int,
    ) -> dict[str, Any]:
        """
        Generate a personalized study plan for a workspace.

        Parameters
        ----------
        db:
            SQLAlchemy Session.
        workspace_id:
            Workspace ID.

        Returns
        -------
        dict with study plan text, workspace info, and resource stats
        """
        workspace_info = WorkspaceService.get_workspace(db, workspace_id=workspace_id)
        if not workspace_info:
            raise ValueError(f"Workspace #{workspace_id} not found.")

        stats = WorkspaceService.get_workspace_statistics(db, workspace_id=workspace_id)

        target_exam = workspace_info.get("target_exam") or "Competitive Exam"
        subjects = [s["name"] for s in workspace_info.get("subjects", [])]

        # Retrieve representative chunks across workspace
        chunks = Retriever.retrieve(
            workspace_id=workspace_id,
            question="key concepts, syllabus, pyq, topics, revision",
            limit=10,
        )

        context = ContextBuilder.build(chunks)

        logger.info(
            "[StudyAdvisorService] Generating study plan | workspace=%d | exam='%s' | subjects=%d",
            workspace_id,
            target_exam,
            len(subjects),
        )

        resource_stats = {
            "total_books": stats.get("total_books", 0),
            "total_notes": stats.get("total_notes", 0),
            "total_pyqs": stats.get("total_pyqs", 0),
            "total_syllabus": stats.get("total_syllabus", 0),
        }

        plan_text = _agent.generate(
            target_exam=target_exam,
            subjects=subjects,
            resource_stats=resource_stats,
            context=context,
        )

        return {
            "workspace_id": workspace_id,
            "target_exam": target_exam,
            "subjects": subjects,
            "resource_stats": resource_stats,
            "study_plan": plan_text,
        }
