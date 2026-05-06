"""
Authentication Router for AI Expense Tracker
Handles user registration, login, JWT token management, and authentication
"""

from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import get_database, Collections
from schemas.user_schema import (
    UserCreate, UserLogin, UserResponse, UserProfile, 
    AuthResponse, PasswordChange, PasswordReset
)
from utils.jwt_handler import JWTHandler
from utils.password_utils import PasswordUtils
from utils.response_handler import ResponseHandler

# Create router
router = APIRouter()

# Security scheme for JWT
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    database: AsyncIOMotorDatabase = Depends(get_database)
) -> dict:
    """
    Get current authenticated user from JWT token
    """
    try:
        # Verify JWT token
        payload = JWTHandler.verify_token(credentials.credentials)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        # Get user ID from token
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        # Fetch user from database
        user = await database[Collections.USERS].find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated"
            )
        
        return user
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: UserCreate,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Register a new user
    """
    try:
        # Check if user already exists
        existing_user = await database[Collections.USERS].find_one({"email": user_data.email})
        if existing_user:
            return ResponseHandler.error(
                message="Email already registered",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code="EMAIL_EXISTS"
            )
        
        # Hash password
        hashed_password = PasswordUtils.hash_password(user_data.password)
        
        # Create user document
        user_doc = {
            "email": user_data.email,
            "name": user_data.name,
            "phone": user_data.phone,
            "bio": user_data.bio,
            "avatar": user_data.avatar,
            "currency": user_data.currency,
            "timezone": user_data.timezone,
            "password": hashed_password,
            "is_active": True,
            "is_verified": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "last_login": None,
            "preferences": {
                "language": "en",
                "theme": "light",
                "notifications": {
                    "email": True,
                    "push": True,
                    "sms": False,
                    "desktop": True,
                    "budget_alerts": True,
                    "weekly_reports": True,
                    "monthly_summary": True,
                    "security_alerts": True
                },
                "privacy": {
                    "profile_visibility": "public",
                    "data_sharing": True,
                    "analytics_tracking": True,
                    "marketing_emails": False
                }
            },
            "security": {
                "two_factor_auth": False,
                "login_alerts": True,
                "session_timeout": 30,
                "biometric_login": False,
                "trusted_devices": [],
                "last_password_change": datetime.utcnow()
            }
        }
        
        # Insert user into database
        result = await database[Collections.USERS].insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Generate JWT token
        token_data = {"sub": user_id, "email": user_data.email}
        access_token = JWTHandler.create_access_token(token_data)
        
        # Get created user
        created_user = await database[Collections.USERS].find_one({"_id": ObjectId(user_id)})
        created_user["_id"] = user_id  # Convert ObjectId to string
        
        return ResponseHandler.created(
            data=AuthResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=1800,  # 30 minutes
                user=UserResponse(**created_user)
            ),
            message="User registered successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Registration failed: {str(e)}")


@router.post("/login", response_model=AuthResponse)
async def login(
    login_data: UserLogin,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Authenticate user and return JWT token
    """
    try:
        # Find user by email
        user = await database[Collections.USERS].find_one({"email": login_data.email})
        if not user:
            return ResponseHandler.unauthorized("Invalid email or password")
        
        # Verify password
        if not PasswordUtils.verify_password(login_data.password, user["password"]):
            return ResponseHandler.unauthorized("Invalid email or password")
        
        # Check if user is active
        if not user.get("is_active", True):
            return ResponseHandler.forbidden("Account is deactivated")
        
        # Generate JWT token
        user_id = str(user["_id"])
        token_data = {"sub": user_id, "email": user["email"]}
        access_token = JWTHandler.create_access_token(token_data)
        
        # Update last login
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"last_login": datetime.utcnow()}}
        )
        
        # Prepare user response
        user["_id"] = user_id
        user_response = UserResponse(**user)
        
        return ResponseHandler.success(
            data=AuthResponse(
                access_token=access_token,
                token_type="bearer",
                expires_in=1800,  # 30 minutes
                user=user_response
            ),
            message="Login successful"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Login failed: {str(e)}")


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current user profile
    """
    try:
        # Prepare user profile response
        current_user["_id"] = str(current_user["_id"])
        profile = UserProfile(**current_user)
        
        return ResponseHandler.success(
            data=profile,
            message="Profile retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get profile: {str(e)}")


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Change user password
    """
    try:
        # Verify current password
        if not PasswordUtils.verify_password(password_data.current_password, current_user["password"]):
            return ResponseHandler.unauthorized("Current password is incorrect")
        
        # Hash new password
        hashed_new_password = PasswordUtils.hash_password(password_data.new_password)
        
        # Update password in database
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$set": {
                    "password": hashed_new_password,
                    "security.last_password_change": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return ResponseHandler.success(
            message="Password changed successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to change password: {str(e)}")


@router.post("/refresh-token")
async def refresh_token(
    current_user: dict = Depends(get_current_user)
):
    """
    Refresh JWT token
    """
    try:
        # Generate new token
        user_id = str(current_user["_id"])
        token_data = {"sub": user_id, "email": current_user["email"]}
        access_token = JWTHandler.create_access_token(token_data)
        
        return ResponseHandler.success(
            data={
                "access_token": access_token,
                "token_type": "bearer",
                "expires_in": 1800
            },
            message="Token refreshed successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to refresh token: {str(e)}")


@router.post("/logout")
async def logout(
    current_user: dict = Depends(get_current_user)
):
    """
    Logout user (client-side token removal)
    """
    return ResponseHandler.success(
        message="Logout successful"
    )


@router.post("/forgot-password")
async def forgot_password(
    reset_data: PasswordReset,
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Initiate password reset process
    """
    try:
        # Find user by email
        user = await database[Collections.USERS].find_one({"email": reset_data.email})
        if not user:
            # Don't reveal if email exists or not
            return ResponseHandler.success(
                message="If email exists, password reset instructions will be sent"
            )
        
        # TODO: Generate reset token and send email
        # For now, just return success message
        return ResponseHandler.success(
            message="Password reset instructions sent to email"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to process password reset: {str(e)}")


# Export for use in other modules
__all__ = ["router", "get_current_user"]
