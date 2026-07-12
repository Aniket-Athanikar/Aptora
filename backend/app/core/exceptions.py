"""
ExamForge AI — Custom Exceptions
Application-specific exception classes.
"""
from fastapi import HTTPException, status


class UserNotFoundException(HTTPException):
    def __init__(self, detail: str = "User not found."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)


class InvalidOTPException(HTTPException):
    def __init__(self, detail: str = "Invalid OTP code. Please check console logs."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


class DuplicateResourceException(HTTPException):
    def __init__(self, detail: str = "Resource already exists."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)


class PasswordMismatchException(HTTPException):
    def __init__(self, detail: str = "Passwords do not match."):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
