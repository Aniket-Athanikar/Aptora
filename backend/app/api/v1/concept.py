"""
Aptora — Concept Linker API Router
===========================================

Endpoints
---------
POST /concept/map — Map concept across workspace resources
"""

import logging
from fastapi import APIRouter, HTTPException, status

from app.ai.services.concept_linker_service import ConceptLinkerService
from app.schemas.concept import ConceptMapRequest, ConceptMapResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/concept",
    tags=["Concept Linker"],
)


@router.post(
    "/map",
    response_model=ConceptMapResponse,
    status_code=status.HTTP_200_OK,
)
async def map_concept(request: ConceptMapRequest):
    """
    Map occurrences of a concept across all uploaded workspace study materials.
    """
    try:
        result = ConceptLinkerService.generate_concept_map(
            workspace_id=request.workspace_id,
            concept=request.concept,
            limit=request.limit or 20,
        )

        return ConceptMapResponse(
            success=True,
            workspace_id=result["workspace_id"],
            concept=result["concept"],
            total_occurrences=result["total_occurrences"],
            resources_covered=result["resources_covered"],
            occurrences_by_resource=result["occurrences_by_resource"],
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        )
    except Exception as exc:
        logger.exception("Failed to generate concept map.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate concept map.",
        )
