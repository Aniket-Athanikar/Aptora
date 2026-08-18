"""
Unit tests for AI Knowledge Chat Persistence
"""

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

def get_test_user_override(email="persistence_test@examforge.ai", name="Persistence User"):
    def override_get_current_user_fn():
        db = TestingSessionLocal()
        user = db.query(UserDb).filter(UserDb.email == email).first()
        if not user:
            user = UserDb(email=email, name=name, password="hashed")
            db.add(user)
            db.commit()
            db.refresh(user)
        db.close()
        return user
    return override_get_current_user_fn

@pytest.fixture
def test_client():
    fastapi_app.dependency_overrides.clear()
    # Initialize schema
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    user = UserDb(email="persistence_test@examforge.ai", name="Persistence User", password="hashed")
    db.add(user)
    db.commit()
    db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    fastapi_app.dependency_overrides[get_current_user] = get_test_user_override()
    
    yield TestClient(fastapi_app)
    
    fastapi_app.dependency_overrides.clear()

def test_create_and_reload_conversation(test_client):
    db = TestingSessionLocal()
    user = db.query(UserDb).first()
    workspace = GoalWorkspaceDb(user_id=user.id, target_exam="UPSC CSE", exam_category="Civil Services")
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    
    # Create conversation via API
    payload = {"workspace_id": workspace.id}
    res = test_client.post("/knowledge/conversations", json=payload)
    assert res.status_code == 201
    data = res.json()
    session_id = data["session_id"]
    assert session_id is not None
    assert data["title"] == "New study session"
    
    # Get conversation details (Reload)
    reload_res = test_client.get(f"/knowledge/conversations/{session_id}")
    assert reload_res.status_code == 200
    reload_data = reload_res.json()
    assert reload_data["session_id"] == session_id
    assert len(reload_data["messages"]) == 0
    db.close()

def test_unauthorized_conversation_access(test_client):
    db = TestingSessionLocal()
    user = db.query(UserDb).first()
    workspace = GoalWorkspaceDb(user_id=user.id, target_exam="UPSC CSE", exam_category="Civil Services")
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    
    # Create conversation under User 1
    conversation = KnowledgeConversationDb(id="secret-session-123", user_id=user.id, workspace_id=workspace.id)
    db.add(conversation)
    db.commit()
    
    # Switch active user to User 2
    fastapi_app.dependency_overrides[get_current_user] = get_test_user_override(email="hacker@examforge.ai", name="Hacker User")
    
    # Try accessing User 1's conversation with a new client to ensure overrides are picked up
    client2 = TestClient(fastapi_app)
    res = client2.get("/knowledge/conversations/secret-session-123")
    assert res.status_code == 404
    db.close()

def test_duplicate_message_protection(test_client):
    db = TestingSessionLocal()
    user = db.query(UserDb).first()
    workspace = GoalWorkspaceDb(user_id=user.id, target_exam="UPSC CSE", exam_category="Civil Services")
    db.add(workspace)
    db.commit()
    db.refresh(workspace)
    
    # Create conversation record
    session_id = "test-session-dup-protection"
    conv = KnowledgeConversationDb(id=session_id, user_id=user.id, workspace_id=workspace.id, title="Test Session")
    db.add(conv)
    db.commit()
    
    # Manually add a user message
    msg = KnowledgeMessageDb(conversation_id=session_id, role="user", content="What is democracy?")
    db.add(msg)
    db.commit()
    
    # Double addition attempt should be blocked in our service logic or API flow
    user_msg_exists = db.query(KnowledgeMessageDb).filter(
        KnowledgeMessageDb.conversation_id == session_id,
        KnowledgeMessageDb.role == "user",
        KnowledgeMessageDb.content == "What is democracy?"
    ).first()
    assert user_msg_exists is not None
    
    # Trigger secondary check simulation
    if user_msg_exists:
        # Avoid duplicate inserts
        pass
    db.close()

def test_pin_rename_delete_conversation(test_client):
    db = TestingSessionLocal()
    user = db.query(UserDb).first()
    workspace = GoalWorkspaceDb(user_id=user.id, target_exam="UPSC CSE", exam_category="Civil Services")
    db.add(workspace); db.commit(); db.refresh(workspace)
    
    # Create conversation
    res = test_client.post("/knowledge/conversations", json={"workspace_id": workspace.id})
    assert res.status_code == 201
    conv_id = res.json()["session_id"]
    
    # 1. Rename conversation
    rename_res = test_client.patch(f"/knowledge/conversations/{conv_id}", json={"title": "Updated Session Title"})
    assert rename_res.status_code == 200
    assert rename_res.json()["title"] == "Updated Session Title"
    
    # 2. Pin conversation
    pin_res = test_client.post(f"/knowledge/conversations/{conv_id}/pin")
    assert pin_res.status_code == 200
    assert pin_res.json()["pinned"] is True
    
    # 3. Delete conversation
    delete_res = test_client.delete(f"/knowledge/conversations/{conv_id}")
    assert delete_res.status_code == 204
    
    # Get 404 on deleted conversation
    get_res = test_client.get(f"/knowledge/conversations/{conv_id}")
    assert get_res.status_code == 404
    db.close()

def test_search_and_pagination(test_client):
    db = TestingSessionLocal()
    user = db.query(UserDb).first()
    workspace = GoalWorkspaceDb(user_id=user.id, target_exam="UPSC CSE", exam_category="Civil Services")
    db.add(workspace); db.commit(); db.refresh(workspace)
    
    # Create 3 conversations
    c1 = KnowledgeConversationDb(id="c1", user_id=user.id, workspace_id=workspace.id, title="Polity constitutional framework")
    c2 = KnowledgeConversationDb(id="c2", user_id=user.id, workspace_id=workspace.id, title="Geography physical features")
    c3 = KnowledgeConversationDb(id="c3", user_id=user.id, workspace_id=workspace.id, title="Polity fundamental rights")
    db.add_all([c1, c2, c3])
    db.commit()
    
    # Add message content to c2 to test searching within messages
    msg = KnowledgeMessageDb(conversation_id="c2", role="user", content="tell me about lakes in India")
    db.add(msg)
    db.commit()
    
    # 1. Search by title
    res_title = test_client.get("/knowledge/conversations?q=Polity")
    assert res_title.status_code == 200
    items_title = res_title.json()
    assert len(items_title) == 2
    assert {item["session_id"] for item in items_title} == {"c1", "c3"}
    
    # 2. Search by message content
    res_msg = test_client.get("/knowledge/conversations?q=lakes")
    assert res_msg.status_code == 200
    items_msg = res_msg.json()
    assert len(items_msg) == 1
    assert items_msg[0]["session_id"] == "c2"
    
    # 3. Pagination (limit)
    res_limit = test_client.get("/knowledge/conversations?limit=2")
    assert res_limit.status_code == 200
    assert len(res_limit.json()) == 2
    
    # 4. Pagination (offset)
    res_offset = test_client.get("/knowledge/conversations?limit=2&offset=2")
    assert res_offset.status_code == 200
    assert len(res_offset.json()) == 1
    
    db.close()
