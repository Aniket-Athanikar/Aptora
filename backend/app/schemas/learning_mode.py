from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict


class LearningModeBase(BaseModel):
    learning_mode: str


class LearningModeCreate(LearningModeBase):
    pass


class LearningModeUpdate(LearningModeBase):
    pass


class LearningModeListRequest(BaseModel):
    learning_modes: List[str]


class LearningModeResponse(LearningModeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    created_at: datetime