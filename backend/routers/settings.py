"""
Settings Router for AI Expense Tracker
Handles user preferences, settings, and account management
"""

from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from database import get_database, Collections
from schemas.user_schema import (
    UserUpdate, UserPreferences, UserSecurity, UserProfile
)
from routers.auth import get_current_user
from utils.response_handler import ResponseHandler

# Create router
router = APIRouter()


@router.get("/profile", response_model=UserProfile)
async def get_profile(
    current_user: dict = Depends(get_current_user)
):
    """
    Get user profile information
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


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    profile_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update user profile information
    """
    try:
        # Prepare update data
        update_data = profile_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update user profile
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await database[Collections.USERS].find_one({"_id": ObjectId(current_user["_id"])})
        updated_user["_id"] = str(updated_user["_id"])
        
        return ResponseHandler.success(
            data=UserProfile(**updated_user),
            message="Profile updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update profile: {str(e)}")


@router.get("/preferences", response_model=UserPreferences)
async def get_preferences(
    current_user: dict = Depends(get_current_user)
):
    """
    Get user preferences
    """
    try:
        preferences = current_user.get("preferences", {})
        
        # Ensure all required fields exist with defaults
        default_preferences = {
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
        }
        
        # Merge with defaults
        for key, default_value in default_preferences.items():
            if key not in preferences:
                preferences[key] = default_value
            elif isinstance(default_value, dict) and isinstance(preferences[key], dict):
                for sub_key, sub_default in default_value.items():
                    if sub_key not in preferences[key]:
                        preferences[key][sub_key] = sub_default
        
        return ResponseHandler.success(
            data=UserPreferences(**preferences),
            message="Preferences retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get preferences: {str(e)}")


@router.put("/preferences", response_model=UserPreferences)
async def update_preferences(
    preferences_data: UserPreferences,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update user preferences
    """
    try:
        # Prepare update data
        update_data = {
            "preferences": preferences_data.dict(),
            "updated_at": datetime.utcnow()
        }
        
        # Update user preferences
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_data}
        )
        
        return ResponseHandler.success(
            data=preferences_data,
            message="Preferences updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update preferences: {str(e)}")


@router.get("/security", response_model=UserSecurity)
async def get_security_settings(
    current_user: dict = Depends(get_current_user)
):
    """
    Get user security settings
    """
    try:
        security = current_user.get("security", {})
        
        # Ensure all required fields exist with defaults
        default_security = {
            "two_factor_auth": False,
            "login_alerts": True,
            "session_timeout": 30,
            "biometric_login": False,
            "trusted_devices": [],
            "last_password_change": datetime.utcnow()
        }
        
        # Merge with defaults
        for key, default_value in default_security.items():
            if key not in security:
                security[key] = default_value
        
        return ResponseHandler.success(
            data=UserSecurity(**security),
            message="Security settings retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get security settings: {str(e)}")


@router.put("/security", response_model=UserSecurity)
async def update_security_settings(
    security_data: UserSecurity,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update user security settings
    """
    try:
        # Prepare update data
        update_data = {
            "security": security_data.dict(),
            "updated_at": datetime.utcnow()
        }
        
        # Update user security settings
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {"$set": update_data}
        )
        
        return ResponseHandler.success(
            data=security_data,
            message="Security settings updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update security settings: {str(e)}")


@router.post("/theme")
async def update_theme(
    theme: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update user theme preference
    """
    try:
        # Validate theme
        valid_themes = ["light", "dark", "auto"]
        if theme not in valid_themes:
            return ResponseHandler.error(
                message="Invalid theme. Must be one of: light, dark, auto",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Update theme preference
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$set": {
                    "preferences.theme": theme,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return ResponseHandler.success(
            message="Theme updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update theme: {str(e)}")


@router.post("/currency")
async def update_currency(
    currency: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update user currency preference
    """
    try:
        # Validate currency
        valid_currencies = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY"]
        if currency not in valid_currencies:
            return ResponseHandler.error(
                message="Invalid currency. Must be one of: USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Update currency preference
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$set": {
                    "currency": currency,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return ResponseHandler.success(
            message="Currency updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update currency: {str(e)}")


@router.post("/notifications")
async def update_notification_preferences(
    notifications: Dict[str, bool],
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update user notification preferences
    """
    try:
        # Validate notification types
        valid_notification_types = [
            "email", "push", "sms", "desktop", 
            "budget_alerts", "weekly_reports", "monthly_summary", "security_alerts"
        ]
        
        for notification_type in notifications:
            if notification_type not in valid_notification_types:
                return ResponseHandler.error(
                    message=f"Invalid notification type: {notification_type}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        
        # Update notification preferences
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$set": {
                    "preferences.notifications": notifications,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return ResponseHandler.success(
            message="Notification preferences updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update notification preferences: {str(e)}")


@router.post("/connected-accounts")
async def add_connected_account(
    account_data: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Add a connected account (bank, credit card, etc.)
    """
    try:
        # Validate required fields
        required_fields = ["type", "name", "account_number"]
        for field in required_fields:
            if field not in account_data:
                return ResponseHandler.error(
                    message=f"Missing required field: {field}",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        
        # Add account to user's connected accounts
        account_data["user_id"] = str(current_user["_id"])
        account_data["status"] = "connected"
        account_data["created_at"] = datetime.utcnow()
        account_data["last_sync"] = datetime.utcnow()
        
        # Insert connected account (would typically go to a separate collection)
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$push": {"connected_accounts": account_data},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return ResponseHandler.success(
            message="Connected account added successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to add connected account: {str(e)}")


@router.delete("/connected-accounts/{account_id}")
async def remove_connected_account(
    account_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Remove a connected account
    """
    try:
        # Remove account from user's connected accounts
        await database[Collections.USERS].update_one(
            {"_id": ObjectId(current_user["_id"])},
            {
                "$pull": {"connected_accounts": {"id": account_id}},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        return ResponseHandler.success(
            message="Connected account removed successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to remove connected account: {str(e)}")


@router.get("/connected-accounts")
async def get_connected_accounts(
    current_user: dict = Depends(get_current_user)
):
    """
    Get user's connected accounts
    """
    try:
        connected_accounts = current_user.get("connected_accounts", [])
        
        return ResponseHandler.success(
            data=connected_accounts,
            message="Connected accounts retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get connected accounts: {str(e)}")


@router.post("/export-data")
async def export_user_data(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Export user data (GDPR compliance)
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get all user data
        user_data = await database[Collections.USERS].find_one({"_id": ObjectId(user_id)})
        expenses = await database[Collections.EXPENSES].find({"user_id": user_id}).to_list(length=None)
        budgets = await database[Collections.BUDGETS].find({"user_id": user_id}).to_list(length=None)
        reports = await database[Collections.REPORTS].find({"user_id": user_id}).to_list(length=None)
        
        # Prepare export data
        export_data = {
            "user_profile": user_data,
            "expenses": expenses,
            "budgets": budgets,
            "reports": reports,
            "export_date": datetime.utcnow().isoformat()
        }
        
        return ResponseHandler.success(
            data=export_data,
            message="User data exported successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to export user data: {str(e)}")


@router.delete("/account")
async def delete_account(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete user account and all associated data
    """
    try:
        user_id = str(current_user["_id"])
        
        # Delete all user data
        await database[Collections.USERS].delete_one({"_id": ObjectId(user_id)})
        await database[Collections.EXPENSES].delete_many({"user_id": user_id})
        await database[Collections.BUDGETS].delete_many({"user_id": user_id})
        await database[Collections.REPORTS].delete_many({"user_id": user_id})
        
        return ResponseHandler.success(
            message="Account deleted successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to delete account: {str(e)}")


# Export for use in other modules
__all__ = ["router"]
