import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.db.base import Base
import app.models
from app.main import app
from app.models.user import UserDb
from app.models.notification import NotificationDb
from app.services.jwt_service import JWTService

from app.core.dependencies import get_db

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_notif.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

client = TestClient(app)


@pytest.fixture(scope="module")
def db_session():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


import uuid

@pytest.fixture
def test_user(db_session: Session):
    unique_email = f"notif_{uuid.uuid4().hex[:6]}@Aptora.ai"
    user = UserDb(
        email=unique_email,
        password="hashed_secret",
        name="Notif Tester",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user):
    token = JWTService.create_access_token(
        user_id=test_user.id,
        email=test_user.email,
        name=test_user.name,
    )
    return {"Authorization": f"Bearer {token}"}


def test_get_notifications_seeds_defaults(auth_headers):
    res = client.get("/api/notifications", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["notifications"]) >= 4
    assert data["unreadCount"] >= 4


def test_create_and_mark_read_notification(auth_headers):
    # Create notification
    create_res = client.post(
        "/api/notifications",
        json={
            "type": "study",
            "priority": "high",
            "message": "Test alert message",
        },
        headers=auth_headers,
    )
    assert create_res.status_code == 201
    notif_data = create_res.json()["notification"]
    notif_id = notif_data["id"]

    # Mark as read
    read_res = client.patch(f"/api/notifications/{notif_id}/read", headers=auth_headers)
    assert read_res.status_code == 200
    assert read_res.json()["notification"]["read"] is True

    # Delete
    del_res = client.delete(f"/api/notifications/{notif_id}", headers=auth_headers)
    assert del_res.status_code == 200
