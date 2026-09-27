"""
Aptora — Enterprise Auth v2 Unit & Integration Tests
Tests PasswordService, OTPService, UserService, AuthService, JWTService, and API Endpoints.
"""
# pyrefly: ignore [missing-import]
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
import app.models
from app.database import get_db
from app.main import app
from app.services.password_service import PasswordService
from app.services.jwt_service import JWTService
from app.services.user_service import UserService
from app.services.otp_service import OTPService
from app.services.auth_service import AuthService

SQLALCHEMY_DATABASE_URL = "sqlite:///./test_auth.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_password_service():
    password = "SecretPassword123"
    hashed = PasswordService.hash_password(password)
    assert hashed != password
    assert PasswordService.verify_password(password, hashed) is True
    assert PasswordService.verify_password("WrongPassword", hashed) is False

    valid, _ = PasswordService.validate_strength("short")
    assert valid is False
    valid_ok, _ = PasswordService.validate_strength("longpassword")
    assert valid_ok is True


def test_jwt_service():
    access_token = JWTService.create_access_token(user_id=1, email="test@example.com", name="Test User")
    assert access_token is not None
    payload = JWTService.verify_access_token(access_token)
    assert payload is not None
    assert payload["email"] == "test@example.com"
    assert payload["user_id"] == 1

    refresh_token = JWTService.create_refresh_token(user_id=1, email="test@example.com")
    assert refresh_token is not None
    ref_payload = JWTService.verify_refresh_token(refresh_token)
    assert ref_payload is not None


def test_user_service(db_session):
    user_svc = UserService(db_session)
    user, err = user_svc.create_user(name="Alice", email="alice@example.com", password="password123")
    assert err is None
    assert user is not None
    assert user.email == "alice@example.com"

    fetched = user_svc.get_by_email("alice@example.com")
    assert fetched is not None
    assert fetched.id == user.id


def test_otp_service(db_session):
    otp_svc = OTPService(db_session)
    code = otp_svc.generate_otp("bob@example.com")
    assert len(code) == 6

    # Verify master test OTP
    ok, _ = otp_svc.verify_otp("bob@example.com", "123456")
    assert ok is True

    # Verify actual generated OTP code
    ok_real, _ = otp_svc.verify_otp("bob@example.com", code)
    assert ok_real is True


def test_api_auth_endpoints(db_session):
    # Test Passwordless Login Endpoint
    response = client.post("/api/auth/login", json={"email": "charlie@example.com", "skip_email": True})
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["success"] is True
    assert json_data["email"] == "charlie@example.com"

    # Fetch generated OTP
    otp_res = client.get("/api/auth/latest-otp?email=charlie@example.com")
    assert otp_res.status_code == 200
    otp_code = otp_res.json()["otp"]

    # Verify OTP Endpoint
    verify_res = client.post("/api/auth/verify-otp", json={"email": "charlie@example.com", "otp": otp_code})
    assert verify_res.status_code == 200
    assert verify_res.json()["success"] is True
    assert "token" in verify_res.json()
