"""
JWT Token Handler for AI Expense Tracker
Handles JWT token creation, verification, and management
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from config import settings


class JWTHandler:
    """
    JWT token handler class
    """
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create JWT access token
        
        Args:
            data: Data to encode in the token
            expires_delta: Optional custom expiration time
            
        Returns:
            JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
        
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload if valid, None if invalid
        """
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def get_user_id_from_token(token: str) -> Optional[str]:
        """
        Extract user ID from JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            User ID if valid, None if invalid
        """
        payload = JWTHandler.verify_token(token)
        if payload:
            return payload.get("sub")
        return None
    
    @staticmethod
    def refresh_token(token: str) -> Optional[str]:
        """
        Refresh JWT token
        
        Args:
            token: Current JWT token
            
        Returns:
            New JWT token if valid, None if invalid
        """
        payload = JWTHandler.verify_token(token)
        if not payload:
            return None
        
        # Remove expiration and create new token
        payload_copy = payload.copy()
        payload_copy.pop("exp", None)
        
        return JWTHandler.create_access_token(payload_copy)


# Export for use in other modules
__all__ = ["JWTHandler"]
