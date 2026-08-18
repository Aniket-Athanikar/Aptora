"""Unit and integration tests for Phase 4: Premium AI Chat PDF Export."""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app as fastapi_app
from app.core.dependencies import get_current_user, get_db
from app.db.base import Base
from app.models.user import UserDb
from app.models.workspace import GoalWorkspaceDb
from app.models.knowledge_conversation import KnowledgeConversationDb, KnowledgeMessageDb
from app.models.chat_export import ChatExportDb
from app.services.chat_export_service import ChatExportService

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_setup():
    # Setup database schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = TestingSessionLocal()
    # Create two test users
    user1 = UserDb(id=1, email="user1@examforge.ai", name="User One", password="hashed_password")
    user2 = UserDb(id=2, email="user2@examforge.ai", name="User Two", password="hashed_password")
    db.add_all([user1, user2])
    db.commit()

    # Create workspace for user 1
    ws1 = GoalWorkspaceDb(id=1, user_id=1, target_exam="AWS Certified Solutions Architect", exam_category="IT")
    ws2 = GoalWorkspaceDb(id=2, user_id=2, target_exam="Google Cloud Professional Architect", exam_category="IT")
    db.add_all([ws1, ws2])
    db.commit()

    # Create conversations
    conv1 = KnowledgeConversationDb(id="conv-user1", user_id=1, workspace_id=1, title="AWS S3 Study Session")
    conv2 = KnowledgeConversationDb(id="conv-user2", user_id=2, workspace_id=2, title="GCP GCS Study Session")
    db.add_all([conv1, conv2])
    db.commit()

    # Create messages for conv1
    msg1 = KnowledgeMessageDb(conversation_id="conv-user1", role="user", content="Explain AWS S3 Glacier storage classes.")
    msg2 = KnowledgeMessageDb(
        conversation_id="conv-user1",
        role="assistant",
        content="AWS S3 offers multiple Glacier classes:\n\n*   **S3 Glacier Instant Retrieval** (millisecond access)\n*   **S3 Glacier Flexible Retrieval** (minutes to hours)\n*   **S3 Glacier Deep Archive** (12 hours limit)\n\nLet me know if you need more details.",
        sources=[{"title": "AWS Storage Documentation", "page": 4, "snippet": "Glacier provides archive access."}]
    )
    db.add_all([msg1, msg2])
    db.commit()
    db.close()
    yield


def get_current_user_override(user_id=1):
    def _override():
        db = TestingSessionLocal()
        user = db.query(UserDb).filter(UserDb.id == user_id).first()
        db.close()
        return user
    return _override


@pytest.fixture
def client_user1(test_setup):
    fastapi_app.dependency_overrides[get_db] = override_get_db
    fastapi_app.dependency_overrides[get_current_user] = get_current_user_override(user_id=1)
    return TestClient(fastapi_app)


@pytest.fixture
def client_user2(test_setup):
    fastapi_app.dependency_overrides[get_db] = override_get_db
    fastapi_app.dependency_overrides[get_current_user] = get_current_user_override(user_id=2)
    return TestClient(fastapi_app)


def test_export_conversation_success(client_user1):
    # User 1 exports their own conversation
    response = client_user1.post("/knowledge/conversations/conv-user1/export")
    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "pending"
    assert data["conversation_id"] == "conv-user1"
    assert data["user_id"] == 1
    assert "id" in data


def test_export_conversation_unauthorized(client_user1):
    # User 1 attempts to export User 2's conversation
    response = client_user1.post("/knowledge/conversations/conv-user2/export")
    assert response.status_code == 404


def test_get_export_status_and_pdf_generation(client_user1):
    # Create the export task
    response = client_user1.post("/knowledge/conversations/conv-user1/export")
    assert response.status_code == 202
    export_id = response.json()["id"]

    # Poll status (should be pending or processing since background tasks run asynchronously)
    status_response = client_user1.get(f"/knowledge/exports/{export_id}")
    assert status_response.status_code == 200
    assert status_response.json()["status"] in ("pending", "processing")

    # Manually trigger backend generation to simulate background worker execution
    db = TestingSessionLocal()
    ChatExportService.generate_pdf(db, export_id)
    db.close()

    # Poll status again
    status_response = client_user1.get(f"/knowledge/exports/{export_id}")
    assert status_response.status_code == 200
    data = status_response.json()
    assert data["status"] == "completed"
    assert "ExamForge_Export" in data["file_name"]
    assert data["file_size"] > 0

    # Retrieve and verify file download works
    download_response = client_user1.get(f"/knowledge/exports/{export_id}/download")
    assert download_response.status_code == 200
    assert download_response.headers["content-type"] == "application/pdf"

    # Clean up generated PDF file
    db = TestingSessionLocal()
    export_rec = db.query(ChatExportDb).filter(ChatExportDb.id == export_id).first()
    if export_rec and export_rec.storage_path and os.path.exists(export_rec.storage_path):
        os.remove(export_rec.storage_path)
    db.close()


def test_download_export_unauthorized(client_user1):
    # User 1 creates an export
    response = client_user1.post("/knowledge/conversations/conv-user1/export")
    assert response.status_code == 202
    export_id = response.json()["id"]

    # Manually complete the export so it has a path
    db = TestingSessionLocal()
    ChatExportService.generate_pdf(db, export_id)
    db.close()

    # Switch override to User 2
    fastapi_app.dependency_overrides[get_current_user] = get_current_user_override(user_id=2)

    # User 2 tries to download User 1's export
    unauth_response = client_user1.get(f"/knowledge/exports/{export_id}/download")
    assert unauth_response.status_code == 404

    # User 2 tries to view status of User 1's export
    unauth_status = client_user1.get(f"/knowledge/exports/{export_id}")
    assert unauth_status.status_code == 404

    # Clean up file
    db = TestingSessionLocal()
    export_rec = db.query(ChatExportDb).filter(ChatExportDb.id == export_id).first()
    if export_rec and export_rec.storage_path and os.path.exists(export_rec.storage_path):
        os.remove(export_rec.storage_path)
    db.close()


def test_list_exports(client_user1):
    # Retrieve user 1's exports (should be empty initially)
    res = client_user1.get("/knowledge/exports")
    assert res.status_code == 200
    assert len(res.json()) == 0

    # Create export
    response = client_user1.post("/knowledge/conversations/conv-user1/export")
    assert response.status_code == 202
    
    # List again
    res = client_user1.get("/knowledge/exports")
    assert res.status_code == 200
    assert len(res.json()) == 1
    assert res.json()[0]["conversation_id"] == "conv-user1"


def test_delete_export(client_user1):
    response = client_user1.post("/knowledge/conversations/conv-user1/export")
    export_id = response.json()["id"]

    # Delete export
    del_res = client_user1.delete(f"/knowledge/exports/{export_id}")
    assert del_res.status_code == 204

    # Verify not found
    get_res = client_user1.get(f"/knowledge/exports/{export_id}")
    assert get_res.status_code == 404


def test_save_conversation_as_note(client_user1):
    # Add subject to workspace for user 1 first to satisfy foreign key constraints
    db = TestingSessionLocal()
    from app.models.workspace_subject import WorkspaceSubjectDb
    subject = WorkspaceSubjectDb(id=101, workspace_id=1, name="AWS Services", display_order=1)
    db.add(subject)
    db.commit()
    
    # Associate conversation with the subject
    conv = db.query(KnowledgeConversationDb).filter(KnowledgeConversationDb.id == "conv-user1").first()
    conv.subject_id = 101
    db.commit()
    db.close()

    # Save as AI note
    response = client_user1.post("/knowledge/conversations/conv-user1/save-note")
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "resource_id" in data
    assert "AI Note" in data["title"]

