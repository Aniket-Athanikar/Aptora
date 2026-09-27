"""
Unit tests for AI Study Sources & Library API and RAG filters
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app as fastapi_app
from app.database import get_db
from app.db.base import Base
import app.models
from app.models.user import UserDb
from app.models.workspace import GoalWorkspaceDb
from app.models.workspace_subject import WorkspaceSubjectDb
from app.models.resource import ResourceDb
from app.models.ai_study_source import AiStudySourceDb
from app.core.dependencies import get_current_user
from app.core.enums import ResourceType, ResourceStatus
from app.ai.services.search_service import SearchService

from sqlalchemy.pool import StaticPool

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_current_user():
    db = TestingSessionLocal()
    user = db.query(UserDb).filter(UserDb.email == "source_test@Aptora.ai").first()
    if not user:
        user = UserDb(
            email="source_test@Aptora.ai",
            name="Source Test User",
            password="hashed",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()
    return user


client = TestClient(fastapi_app)


@pytest.fixture(autouse=True)
def setup_test_data():
    fastapi_app.dependency_overrides[get_db] = override_get_db
    fastapi_app.dependency_overrides[get_current_user] = override_get_current_user
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # User
    user = UserDb(
        email="source_test@Aptora.ai",
        name="Source Test User",
        password="hashed",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Workspace
    workspace = GoalWorkspaceDb(
        user_id=user.id,
        target_exam="UPSC CSE",
        exam_category="Civil Services",
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    # Subject
    subject = WorkspaceSubjectDb(
        workspace_id=workspace.id,
        name="Indian Polity",
        description="Constitution & Governance",
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)

    # Resource 1: Completed
    res1 = ResourceDb(
        workspace_id=workspace.id,
        subject_id=subject.id,
        resource_type=ResourceType.BOOK,
        title="Indian Polity 6th Edition",
        description="Standard textbook for Polity",
        original_filename="indian_polity.pdf",
        stored_filename="stored_polity.pdf",
        storage_path="/uploads/stored_polity.pdf",
        mime_type="application/pdf",
        file_size=1048576,
        total_pages=842,
        status=ResourceStatus.COMPLETED.value,
    )
    # Resource 2: Processing
    res2 = ResourceDb(
        workspace_id=workspace.id,
        subject_id=subject.id,
        resource_type=ResourceType.BOOK,
        title="Modern History of India",
        description="History book",
        original_filename="history.pdf",
        stored_filename="stored_history.pdf",
        storage_path="/uploads/stored_history.pdf",
        mime_type="application/pdf",
        file_size=2048576,
        total_pages=450,
        status=ResourceStatus.PROCESSING.value,
    )
    db.add_all([res1, res2])
    db.commit()
    db.close()

    yield

    fastapi_app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_browse_library_books():
    response = client.get("/library/books")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2
    titles = [item["title"] for item in data["items"]]
    assert "Indian Polity 6th Edition" in titles
    assert "Modern History of India" in titles


def test_select_ai_study_source_completed():
    db = TestingSessionLocal()
    res = db.query(ResourceDb).filter(ResourceDb.title == "Indian Polity 6th Edition").first()
    db.close()

    # 1. Select completed source
    response = client.post("/ai-study/sources", json={"resource_id": res.id})
    assert response.status_code == 201
    source_data = response.json()
    assert source_data["resource_id"] == res.id
    assert source_data["is_active"] is True

    # 2. Idempotent re-select
    response2 = client.post("/ai-study/sources", json={"resource_id": res.id})
    assert response2.status_code == 201
    assert response2.json()["id"] == source_data["id"]

    # 3. Check selected sources
    get_res = client.get("/ai-study/sources")
    assert get_res.status_code == 200
    sources = get_res.json()
    assert len(sources) == 1
    assert sources[0]["resource_id"] == res.id

    # 4. Remove source
    del_res = client.delete(f"/ai-study/sources/{res.id}")
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True

    # 5. Check remaining books in library (Book itself remains in DB!)
    db = TestingSessionLocal()
    remaining_res = db.query(ResourceDb).filter(ResourceDb.id == res.id).first()
    assert remaining_res is not None
    db.close()


def test_select_ai_study_source_processing_fails():
    db = TestingSessionLocal()
    res = db.query(ResourceDb).filter(ResourceDb.title == "Modern History of India").first()
    db.close()

    # Selecting a PROCESSING book should fail with 400
    response = client.post("/ai-study/sources", json={"resource_id": res.id})
    assert response.status_code == 400
    assert "Only completed resources can be selected" in response.json()["message"]


def test_search_service_build_filter_resource_ids():
    q_filter = SearchService._build_filter(workspace_id=1, subject_id=2, resource_types=["book"], resource_ids=[21, 22])
    assert q_filter is not None
    # Verify conditions inside filter
    must_clause = q_filter.must
    keys = [cond.key for cond in must_clause]
    assert "workspace_id" in keys
    assert "subject_id" in keys
    assert "resource_type" in keys
    assert "resource_id" in keys
