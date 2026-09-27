"""
Aptora - Summary Schemas
"""

from pydantic import BaseModel, Field


class SummaryRequest(BaseModel):
    """
    Request schema for study material summarization.
    """

    workspace_id: int = Field(
        ...,
        gt=0,
        description="Workspace identifier",
    )


class SummaryResponse(BaseModel):
    """
    Response schema for generated summary.
    """

    success: bool = Field(
        default=True,
        description="Whether the request succeeded",
    )

    summary: str = Field(
        ...,
        description="Generated study summary",
    )