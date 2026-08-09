from typing import List
from pydantic import BaseModel, ConfigDict


class NotificationItemResponse(BaseModel):
    id: str
    type: str
    priority: str
    message: str
    read: bool
    createdAt: str

    model_config = ConfigDict(from_attributes=True)


class NotificationCreatePayload(BaseModel):
    type: str = "study"
    priority: str = "medium"
    message: str


class NotificationListResponse(BaseModel):
    success: bool
    notifications: List[NotificationItemResponse]
    unreadCount: int
