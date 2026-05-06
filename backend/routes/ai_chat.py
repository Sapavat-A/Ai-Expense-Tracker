import logging
from datetime import datetime
from typing import Dict, List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database import get_db
from models import User, Expense
from ai_service import analyze_user_expenses

router = APIRouter(prefix="/ai-chat", tags=["AI Chat Assistant"])
logger = logging.getLogger(__name__)


@router.post("/ask")
async def ask_ai_assistant(
    request: Dict[str, str],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, str]:
    """
    Ask the AI finance assistant a question about expenses.
    
    Args:
        request: Dictionary containing 'question' field
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Dictionary with AI response
    """
    try:
        question = request.get("question", "").strip()
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question cannot be empty"
            )
        
        # Get user's expenses
        expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
        
        # Convert expenses to dict format
        expense_data = []
        for expense in expenses:
            expense_data.append({
                'amount': float(expense.amount),
                'category': expense.category,
                'date': expense.date.isoformat() if expense.date else None,
            })
        
        # Get AI analysis
        ai_response = await analyze_user_expenses(expense_data, question)
        
        logger.info(f"AI chat request processed for user {current_user.id}")
        
        return {
            "response": ai_response,
            "question": question,
            "timestamp": str(datetime.now()),
            "expenses_analyzed": len(expense_data)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process AI request: {str(e)}"
        )


@router.get("/status")
async def get_ai_status(current_user: User = Depends(get_current_active_user)) -> Dict[str, Any]:
    """
    Check AI assistant availability and configuration.
    
    Returns:
        Dictionary with AI service status
    """
    from ai_service import ai_assistant
    
    return {
        "available": ai_assistant.is_available(),
        "provider": ai_assistant.ai_provider,
        "features": [
            "Spending analysis",
            "Category insights", 
            "Money-saving recommendations",
            "Expense pattern recognition",
            "Financial advice"
        ]
    }


@router.post("/analyze-spending")
async def analyze_spending_patterns(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get comprehensive spending analysis without specific question.
    
    Returns:
        Dictionary with detailed spending analysis
    """
    try:
        # Get user's expenses
        expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
        
        # Convert expenses to dict format
        expense_data = []
        for expense in expenses:
            expense_data.append({
                'amount': float(expense.amount),
                'category': expense.category,
                'date': expense.date.isoformat() if expense.date else None,
            })
        
        # Get comprehensive analysis
        ai_response = await analyze_user_expenses(expense_data, "")
        
        logger.info(f"Spending analysis completed for user {current_user.id}")
        
        return {
            "analysis": ai_response,
            "expenses_count": len(expense_data),
            "analysis_type": "comprehensive_spending_overview"
        }
        
    except Exception as e:
        logger.error(f"Spending analysis error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze spending: {str(e)}"
        )
