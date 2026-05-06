import logging
import tempfile
import os
from pathlib import Path
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import User
from ocr_service import process_receipt_file

router = APIRouter(prefix="/receipts", tags=["Receipt Scanner"])
logger = logging.getLogger(__name__)

# Supported file types
SUPPORTED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png", 
    "image/bmp": ".bmp",
    "image/tiff": ".tiff",
    "application/pdf": ".pdf"
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/scan")
async def scan_receipt(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Optional[str]]:
    """
    Scan a receipt and extract expense information using OCR.
    
    Args:
        file: Uploaded receipt file (image or PDF)
        current_user: Authenticated user
        
    Returns:
        Dictionary with extracted expense data:
        - amount: Extracted amount
        - merchant: Extracted merchant name  
        - date: Extracted date (YYYY-MM-DD)
        - raw_text: Full OCR text
        - confidence: Processing confidence score
        - error: Error message if processing failed
    """
    try:
        # Validate file type
        if file.content_type not in SUPPORTED_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Supported types: {', '.join(SUPPORTED_TYPES.keys())}"
            )
        
        # Validate file size
        file_content = await file.read()
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 10MB"
            )
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=SUPPORTED_TYPES[file.content_type]
        ) as temp_file:
            temp_file.write(file_content)
            temp_file_path = temp_file.name
        
        try:
            # Process the receipt with OCR
            result = process_receipt_file(temp_file_path)
            
            # Add metadata
            result['filename'] = file.filename
            result['file_size'] = len(file_content)
            result['user_id'] = current_user.id
            
            logger.info(f"Receipt scanned successfully for user {current_user.id}: {file.filename}")
            return result
            
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file_path)
            except OSError:
                pass
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning receipt: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to scan receipt: {str(e)}"
        )


@router.get("/ocr-status")
async def get_ocr_status(current_user: User = Depends(get_current_active_user)) -> Dict[str, bool]:
    """
    Check if OCR service is available.
    
    Returns:
        Dictionary with OCR availability status
    """
    from ocr_service import ocr_service
    
    return {
        "available": ocr_service.is_available(),
        "supported_types": list(SUPPORTED_TYPES.keys()),
        "max_file_size_mb": MAX_FILE_SIZE // (1024 * 1024)
    }
