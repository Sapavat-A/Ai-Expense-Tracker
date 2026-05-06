"""
Response Handler for AI Expense Tracker
Standardizes API responses across all endpoints
"""

from typing import Any, Dict, Optional, Union
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime


class ResponseHandler:
    """
    Standard response handler for API responses
    """
    
    @staticmethod
    def success(
        data: Any = None,
        message: str = "Success",
        status_code: int = 200,
        metadata: Optional[Dict[str, Any]] = None
    ) -> JSONResponse:
        """
        Create a success response
        
        Args:
            data: Response data
            message: Success message
            status_code: HTTP status code
            metadata: Additional metadata
            
        Returns:
            JSONResponse with standardized format
        """
        response = {
            "success": True,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if metadata:
            response["metadata"] = metadata
        
        return JSONResponse(
            status_code=status_code,
            content=response
        )
    
    @staticmethod
    def error(
        message: str,
        status_code: int = 400,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ) -> JSONResponse:
        """
        Create an error response
        
        Args:
            message: Error message
            status_code: HTTP status code
            error_code: Custom error code
            details: Additional error details
            
        Returns:
            JSONResponse with standardized format
        """
        response = {
            "success": False,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if error_code:
            response["error_code"] = error_code
        
        if details:
            response["details"] = details
        
        return JSONResponse(
            status_code=status_code,
            content=response
        )
    
    @staticmethod
    def paginated(
        data: list,
        page: int,
        page_size: int,
        total: int,
        message: str = "Data retrieved successfully"
    ) -> JSONResponse:
        """
        Create a paginated response
        
        Args:
            data: List of data items
            page: Current page number
            page_size: Items per page
            total: Total number of items
            message: Success message
            
        Returns:
            JSONResponse with pagination metadata
        """
        total_pages = (total + page_size - 1) // page_size
        
        metadata = {
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }
        
        return ResponseHandler.success(
            data=data,
            message=message,
            metadata=metadata
        )
    
    @staticmethod
    def created(data: Any = None, message: str = "Resource created successfully") -> JSONResponse:
        """
        Create a resource created response
        
        Args:
            data: Created resource data
            message: Success message
            
        Returns:
            JSONResponse with 201 status code
        """
        return ResponseHandler.success(
            data=data,
            message=message,
            status_code=201
        )
    
    @staticmethod
    def no_content(message: str = "Operation completed successfully") -> JSONResponse:
        """
        Create a no content response
        
        Args:
            message: Success message
            
        Returns:
            JSONResponse with 204 status code
        """
        return ResponseHandler.success(
            data=None,
            message=message,
            status_code=204
        )
    
    @staticmethod
    def not_found(resource: str = "Resource") -> JSONResponse:
        """
        Create a not found response
        
        Args:
            resource: Name of the resource not found
            
        Returns:
            JSONResponse with 404 status code
        """
        return ResponseHandler.error(
            message=f"{resource} not found",
            status_code=404,
            error_code="NOT_FOUND"
        )
    
    @staticmethod
    def unauthorized(message: str = "Unauthorized access") -> JSONResponse:
        """
        Create an unauthorized response
        
        Args:
            message: Error message
            
        Returns:
            JSONResponse with 401 status code
        """
        return ResponseHandler.error(
            message=message,
            status_code=401,
            error_code="UNAUTHORIZED"
        )
    
    @staticmethod
    def forbidden(message: str = "Access forbidden") -> JSONResponse:
        """
        Create a forbidden response
        
        Args:
            message: Error message
            
        Returns:
            JSONResponse with 403 status code
        """
        return ResponseHandler.error(
            message=message,
            status_code=403,
            error_code="FORBIDDEN"
        )
    
    @staticmethod
    def validation_error(errors: Dict[str, Any]) -> JSONResponse:
        """
        Create a validation error response
        
        Args:
            errors: Validation errors
            
        Returns:
            JSONResponse with 422 status code
        """
        return ResponseHandler.error(
            message="Validation failed",
            status_code=422,
            error_code="VALIDATION_ERROR",
            details=errors
        )
    
    @staticmethod
    def server_error(message: str = "Internal server error") -> JSONResponse:
        """
        Create a server error response
        
        Args:
            message: Error message
            
        Returns:
            JSONResponse with 500 status code
        """
        return ResponseHandler.error(
            message=message,
            status_code=500,
            error_code="SERVER_ERROR"
        )


# Export for use in other modules
__all__ = ["ResponseHandler"]
