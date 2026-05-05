import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ai.insights import analyze_expenses
from database import get_db
from models import Expense
from schemas import ExpenseAnalysisResponse

router = APIRouter(tags=["Insights"])
logger = logging.getLogger(__name__)


@router.get("/insights", response_model=ExpenseAnalysisResponse)
def get_ai_insights(db: Session = Depends(get_db)) -> ExpenseAnalysisResponse:
    try:
        expenses = db.query(Expense).all()
        if not expenses:
            logger.info("Insights requested with no expense records")
        else:
            logger.info("Insights generated for %s expense records", len(expenses))
        return analyze_expenses(expenses)
    except Exception as error:
        logger.exception("Unexpected insights error: %s", error)
        raise HTTPException(
            status_code=500,
            detail="Unable to generate insights right now",
        ) from error
