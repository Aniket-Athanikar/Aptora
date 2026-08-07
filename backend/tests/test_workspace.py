"""
Tests for WorkspaceService and workspace API endpoints.
"""

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
import app.models
from app.core.dependencies import get_db, get_current_user
from app.models.user import UserDb
from app.models.workspace import GoalWorkspaceDb
from app.models.workspace_subject import WorkspaceSubjectDb
from app.models.resource import ResourceDb
from app.models.resource_chunk import ResourceChunkDb
from app.core.enums import ResourceType
from app.services.workspace_service import WorkspaceService
from app.api.v1.workspace import router as workspace_router


from sqlalchemy.pool import StaticPool

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


def mock_current_user():
    return UserDb(id=1, name="Test User", email="test@example.com", password="pw")


test_app = FastAPI()
test_app.include_router(workspace_router)

test_app.dependency_overrides[get_db] = override_get_db
test_app.dependency_overrides[get_current_user] = mock_current_user

client = TestClient(test_app)


# pyrefly: ignore [missing-import]
import pytest

@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed data
    user = UserDb(id=1, name="Test User", email="test@example.com", password="pw")
    db.add(user)
    db.commit()

    ws = GoalWorkspaceDb(
        id=10,
        user_id=1,
        target_exam="UPSC Civil Services",
        exam_category="Civil Services",
    )
    db.add(ws)
    db.commit()

    sub1 = WorkspaceSubjectDb(id=100, workspace_id=10, name="History", description="Indian History", display_order=1)
    sub2 = WorkspaceSubjectDb(id=101, workspace_id=10, name="Geography", description="World Geography", display_order=2)
    db.add_all([sub1, sub2])
    db.commit()

    res1 = ResourceDb(
        id=1000,
        workspace_id=10,
        subject_id=100,
        resource_type=ResourceType.BOOK,
        title="Modern History Spectrum",
        original_filename="spectrum.pdf",
        stored_filename="stored_spectrum.pdf",
        storage_path="/tmp/spectrum.pdf",
        mime_type="application/pdf",
        file_size=1024,
    )
    res2 = ResourceDb(
        id=1001,
        workspace_id=10,
        subject_id=100,
        resource_type=ResourceType.NOTES,
        title="Ancient History Summary Notes",
        original_filename="ancient_notes.pdf",
        stored_filename="stored_ancient_notes.pdf",
        storage_path="/tmp/ancient_notes.pdf",
        mime_type="application/pdf",
        file_size=512,
    )
    res3 = ResourceDb(
        id=1002,
        workspace_id=10,
        subject_id=101,
        resource_type=ResourceType.PYQ,
        title="Geography 10 Year PYQs",
        original_filename="pyq_geo.pdf",
        stored_filename="stored_pyq_geo.pdf",
        storage_path="/tmp/pyq_geo.pdf",
        mime_type="application/pdf",
        file_size=2048,
    )
    db.add_all([res1, res2, res3])
    db.commit()

    chunk1 = ResourceChunkDb(
        id=500,
        resource_id=1000,
        chunk_index=0,
        chapter="Freedom Struggle",
        topic="Non-Cooperation Movement",
        content="Detailed analysis of the 1920 Non-Cooperation Movement.",
        embedding_generated=True,
        qdrant_point_id="point_500",
    )
    db.add(chunk1)
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)



def test_workspace_service():
    db = TestingSessionLocal()

    # 1. get_workspace
    ws_info = WorkspaceService.get_workspace(db, workspace_id=10)
    assert ws_info is not None, "Workspace info should not be None"
    assert ws_info["target_exam"] == "UPSC Civil Services"
    assert ws_info["exam_category"] == "Civil Services"

    # 2. get_workspace_documents
    docs = WorkspaceService.get_workspace_documents(db, workspace_id=10)
    assert len(docs) == 2, f"Expected 2 subject groups, got {len(docs)}"
    history_group = next(d for d in docs if d["subject_id"] == 100)
    assert len(history_group["books"]) == 1
    assert len(history_group["notes"]) == 1

    # 3. get_workspace_statistics
    stats = WorkspaceService.get_workspace_statistics(db, workspace_id=10)
    assert stats["subjects"] == 2
    assert stats["documents"] == 3
    assert stats["books"] == 1
    assert stats["notes"] == 1
    assert stats["pyqs"] == 1
    assert stats["syllabus"] == 0
    assert stats["chunks"] == 1
    assert stats["embeddings"] == 1

    # 4. get_recent_documents
    recent = WorkspaceService.get_recent_documents(db, workspace_id=10, limit=2)
    assert len(recent) == 2

    # 5. get_subject_library
    subj_lib = WorkspaceService.get_subject_library(db, workspace_id=10, subject_id=100)
    assert subj_lib is not None
    assert subj_lib["subject"] == "History"
    assert len(subj_lib["books"]) == 1
    assert len(subj_lib["notes"]) == 1

    # 6. search_library
    search_res = WorkspaceService.search_library(db, workspace_id=10, keyword="Movement")
    assert search_res["total"] == 1
    assert search_res["items"][0].id == 1000

    db.close()


def test_workspace_api_endpoints():
    # 1. GET /workspace/{workspace_id}
    res = client.get("/workspace/10")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    data = res.json()
    assert data["target_exam"] == "UPSC Civil Services"
    assert data["exam_name"] == "UPSC Civil Services"

    # 2. GET /workspace/{workspace_id}/documents
    res = client.get("/workspace/10/documents")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    docs = res.json()
    assert len(docs) == 2

    # 3. GET /workspace/{workspace_id}/statistics
    res = client.get("/workspace/10/statistics")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    stats = res.json()
    assert stats["subjects"] == 2
    assert stats["documents"] == 3
    assert stats["chunks"] == 1

    # 4. GET /workspace/{workspace_id}/recent
    res = client.get("/workspace/10/recent?limit=2")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    recent = res.json()
    assert len(recent) == 2

    # 5. GET /workspace/{workspace_id}/subject/{subject_id}
    res = client.get("/workspace/10/subject/100")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    subj_lib = res.json()
    assert subj_lib["subject"] == "History"

    # 6. GET /workspace/{workspace_id}/library/search
    res = client.get("/workspace/10/library/search?keyword=Spectrum")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
    search_data = res.json()
    assert search_data["total"] == 1
    assert search_data["items"][0]["title"] == "Modern History Spectrum"


if __name__ == "__main__":
    test_workspace_service()
    print("PASS: test_workspace_service")
    test_workspace_api_endpoints()
    print("PASS: test_workspace_api_endpoints")
    print("ALL TESTS PASSED SUCCESSFULLY!")

