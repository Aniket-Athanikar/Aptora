"""
Aptora - Workspace Subject Schemas
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class WorkspaceSubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    display_order: int = 0
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: bool = True


class WorkspaceSubjectCreate(WorkspaceSubjectBase):
    workspace_id: int


class WorkspaceSubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None


class WorkspaceSubjectResponse(WorkspaceSubjectBase):
    id: int
    workspace_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)