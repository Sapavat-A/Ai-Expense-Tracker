"""
User schemas for AI Expense Tracker
Pydantic models for user data validation and serialization
"""

from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    """
    Base user schema with common fields
    """
    email: EmailStr = Field(..., description="User email address")
    name: str = Field(..., min_length=2, max_length=100, description="User full name")
    phone: Optional[str] = Field(None, description="User phone number")
    bio: Optional[str] = Field(None, max_length=500, description="User bio")
    avatar: Optional[str] = Field(None, description="User avatar URL")
    currency: str = Field("USD", description="Default currency")
    timezone: str = Field("UTC", description="User timezone")


class UserCreate(UserBase):
    """
    User creation schema
    """
    password: str = Field(..., min_length=8, max_length=128, description="User password")
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        """
        Validate password strength
        """
        from utils.password_utils import PasswordUtils
        validation_result = PasswordUtils.validate_password_strength(v)
        
        if not validation_result["is_strong"]:
            raise ValueError(f"Password validation failed: {', '.join(validation_result['issues'])}")
        
        return v


class UserLogin(BaseModel):
    """
    User login schema
    """
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UserUpdate(BaseModel):
    """
    User update schema (all fields optional)
    """
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    phone: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)
    avatar: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None


class UserPreferences(BaseModel):
    """
    User preferences schema
    """
    language: str = Field("en", description="Preferred language")
    theme: str = Field("light", description="UI theme preference")
    notifications: Dict[str, bool] = Field(
        default={
            "email": True,
            "push": True,
            "sms": False,
            "desktop": True,
            "budget_alerts": True,
            "weekly_reports": True,
            "monthly_summary": True,
            "security_alerts": True
        },
        description="Notification preferences"
    )
    privacy: Dict[str, Any] = Field(
        default={
            "profile_visibility": "public",
            "data_sharing": True,
            "analytics_tracking": True,
            "marketing_emails": False
        },
        description="Privacy settings"
    )


class UserSecurity(BaseModel):
    """
    User security settings schema
    """
    two_factor_auth: bool = Field(False, description="Two-factor authentication enabled")
    login_alerts: bool = Field(True, description="Login alerts enabled")
    session_timeout: int = Field(30, description="Session timeout in minutes")
    biometric_login: bool = Field(False, description="Biometric login enabled")
    trusted_devices: list[str] = Field(default_factory=list, description="Trusted devices")


class UserResponse(UserBase):
    """
    User response schema (excludes sensitive data)
    """
    id: str = Field(..., description="User ID")
    is_active: bool = Field(True, description="User account status")
    is_verified: bool = Field(False, description="Email verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    preferences: Optional[UserPreferences] = Field(None, description="User preferences")
    security: Optional[UserSecurity] = Field(None, description="User security settings")
    
    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """
    User profile schema (minimal public info)
    """
    id: str = Field(..., description="User ID")
    name: str = Field(..., description="User name")
    email: EmailStr = Field(..., description="User email")
    avatar: Optional[str] = Field(None, description="User avatar URL")
    currency: str = Field(..., description="Default currency")
    timezone: str = Field(..., description="User timezone")
    created_at: datetime = Field(..., description="Account creation timestamp")
    
    class Config:
        from_attributes = True


class UserStats(BaseModel):
    """
    User statistics schema
    """
    total_expenses: float = Field(0.0, description="Total expenses amount")
    total_income: float = Field(0.0, description="Total income amount")
    expense_count: int = Field(0, description="Number of expense records")
    budget_count: int = Field(0, description="Number of budgets")
    savings_rate: float = Field(0.0, description="Savings rate percentage")
    account_age_days: int = Field(0, description="Account age in days")
    
    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """
    Authentication response schema
    """
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field("bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserResponse = Field(..., description="User information")


class PasswordChange(BaseModel):
    """
    Password change schema
    """
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        """
        Validate new password strength
        """
        from utils.password_utils import PasswordUtils
        validation_result = PasswordUtils.validate_password_strength(v)
        
        if not validation_result["is_strong"]:
            raise ValueError(f"Password validation failed: {', '.join(validation_result['issues'])}")
        
        return v


class PasswordReset(BaseModel):
    """
    Password reset schema
    """
    email: EmailStr = Field(..., description="User email address")


class PasswordResetConfirm(BaseModel):
    """
    Password reset confirmation schema
    """
    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New password")
    
    @field_validator('new_password')
    @classmethod
    def validate_new_password(cls, v):
        """
        Validate new password strength
        """
        from utils.password_utils import PasswordUtils
        validation_result = PasswordUtils.validate_password_strength(v)
        
        if not validation_result["is_strong"]:
            raise ValueError(f"Password validation failed: {', '.join(validation_result['issues'])}")
        
        return v


# Export for use in other modules
__all__ = [
    "UserBase",
    "UserCreate", 
    "UserLogin",
    "UserUpdate",
    "UserPreferences",
    "UserSecurity",
    "UserResponse",
    "UserProfile",
    "UserStats",
    "AuthResponse",
    "PasswordChange",
    "PasswordReset",
    "PasswordResetConfirm"
]
