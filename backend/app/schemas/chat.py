"""
Aptora - Chat Schemas
"""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """
    Chat request payload.
    """

    workspace_id: int = Field(
        ...,
        gt=0,
        description="Workspace ID",
    )

    question: str = Field(
        ...,
        min_length=1,
        description="User question",
    )

    stream_format: str = Field(
        "plain",
        description="Format of streaming: 'plain' or 'sse'"
    )


class ChatResponse(BaseModel):
    """
    Chat response payload.
    """

    success: bool = True

    answer: str = Field(
        ...,
        description="Generated AI answer",
    )
