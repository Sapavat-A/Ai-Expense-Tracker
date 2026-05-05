import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ai.prediction import predict_next_month_expense
from database import get_db
from models import Expense
from schemas import ExpensePredictionResponse

router = APIRouter(tags=["Prediction"])
logger = logging.getLogger(__name__)


@router.get("/predict", response_model=ExpensePredictionResponse)
def get_prediction(db: Session = Depends(get_db)) -> ExpensePredictionResponse:
    expenses = db.query(Expense).order_by(Expense.date).all()
    try:
        prediction = predict_next_month_expense(expenses)
        logger.info("Prediction generated successfully")
        return prediction
    except ValueError as error:
        logger.warning("Prediction failed validation: %s", error)
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Unexpected prediction error: %s", error)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error while generating prediction",
        ) from error
