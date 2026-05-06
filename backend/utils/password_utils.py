"""
Password utilities for AI Expense Tracker
Handles password hashing and verification using bcrypt
"""

from typing import Optional
import bcrypt


class PasswordUtils:
    """
    Password utility class for hashing and verification
    """
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password string
        """
        # Convert password to bytes
        password_bytes = password.encode('utf-8')
        
        # Generate salt and hash password
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        
        # Return as string
        return hashed_password.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against its hash
        
        Args:
            plain_password: Plain text password to verify
            hashed_password: Hashed password to verify against
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            # Convert to bytes
            plain_bytes = plain_password.encode('utf-8')
            hashed_bytes = hashed_password.encode('utf-8')
            
            # Verify password
            return bcrypt.checkpw(plain_bytes, hashed_bytes)
        except Exception:
            return False
    
    @staticmethod
    def generate_strong_password(length: int = 12) -> str:
        """
        Generate a strong random password
        
        Args:
            length: Length of the password (default: 12)
            
        Returns:
            Strong password string
        """
        import secrets
        import string
        
        # Define character sets
        lowercase = string.ascii_lowercase
        uppercase = string.ascii_uppercase
        digits = string.digits
        special = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
        # Combine all characters
        all_chars = lowercase + uppercase + digits + special
        
        # Generate password
        password = ''.join(secrets.choice(all_chars) for _ in range(length))
        
        return password
    
    @staticmethod
    def validate_password_strength(password: str) -> dict:
        """
        Validate password strength
        
        Args:
            password: Password to validate
            
        Returns:
            Dictionary with validation results
        """
        import re
        
        result = {
            "is_strong": True,
            "score": 0,
            "issues": []
        }
        
        # Length check
        if len(password) < 8:
            result["issues"].append("Password must be at least 8 characters long")
            result["is_strong"] = False
        else:
            result["score"] += 1
        
        # Uppercase check
        if not re.search(r'[A-Z]', password):
            result["issues"].append("Password must contain at least one uppercase letter")
            result["is_strong"] = False
        else:
            result["score"] += 1
        
        # Lowercase check
        if not re.search(r'[a-z]', password):
            result["issues"].append("Password must contain at least one lowercase letter")
            result["is_strong"] = False
        else:
            result["score"] += 1
        
        # Digit check
        if not re.search(r'\d', password):
            result["issues"].append("Password must contain at least one digit")
            result["is_strong"] = False
        else:
            result["score"] += 1
        
        # Special character check
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', password):
            result["issues"].append("Password must contain at least one special character")
            result["is_strong"] = False
        else:
            result["score"] += 1
        
        # Common patterns check
        common_patterns = [
            r'123456', r'password', r'qwerty', r'abc123',
            r'admin', r'letmein', r'welcome', r'monkey'
        ]
        
        for pattern in common_patterns:
            if re.search(pattern, password, re.IGNORECASE):
                result["issues"].append("Password contains common patterns")
                result["is_strong"] = False
                result["score"] = max(0, result["score"] - 2)
                break
        
        return result


# Export for use in other modules
__all__ = ["PasswordUtils"]
