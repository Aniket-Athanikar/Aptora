from pydantic import BaseModel


class DocumentStatusResponse(BaseModel):
    resource_id: int
    status: str