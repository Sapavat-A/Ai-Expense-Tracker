import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from ai.insights import analyze_expenses
from ai.prediction import predict_next_month_expense
from database import get_db
from models import Expense
from schemas import (
    CategoryTotalResponse,
    ExpenseAnalysisResponse,
    ExpenseCreate,
    ExpensePredictionResponse,
    ExpenseResponse,
)

router = APIRouter(prefix="/expenses", tags=["Expenses"])
logger = logging.getLogger(__name__)


def parse_expense_date(date_text: str | None) -> datetime.date:
    if not date_text:
        return datetime.now().date()

    try:
        return datetime.strptime(date_text, "%Y-%m-%d").date()
    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD",
        ) from error


@router.post("", response_model=ExpenseResponse)
def add_expense(expense: ExpenseCreate, db: Session = Depends(get_db)) -> Expense:
    try:
        print("Incoming date:", expense.date)
        parsed_date = parse_expense_date(expense.date)
        print("Saved date:", parsed_date)
        new_expense = Expense(
            amount=expense.amount,
            category=expense.category,
            date=parsed_date,
        )
        db.add(new_expense)
        db.commit()
        db.refresh(new_expense)
        logger.info(
            "Expense created: id=%s category=%s date=%s",
            new_expense.id,
            new_expense.category,
            new_expense.date,
        )
        return new_expense
    except SQLAlchemyError as error:
        db.rollback()
        logger.exception("Database error while creating expense: %s", error)
        raise HTTPException(status_code=500, detail="Unable to save expense") from error


@router.get("", response_model=list[ExpenseResponse])
def get_all_expenses(db: Session = Depends(get_db)) -> list[Expense]:
    try:
        expenses = db.query(Expense).all()
        logger.info("Fetched %s expenses", len(expenses))
        return expenses
    except SQLAlchemyError as error:
        logger.exception("Database error while fetching expenses: %s", error)
        raise HTTPException(status_code=500, detail="Unable to fetch expenses") from error


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int, updated_expense: ExpenseCreate, db: Session = Depends(get_db)
) -> Expense:
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    expense.amount = updated_expense.amount
    expense.category = updated_expense.category
    expense.date = (
        parse_expense_date(updated_expense.date)
        if updated_expense.date is not None
        else expense.date
    )

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)) -> dict[str, str]:
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


@router.get("/total-by-category", response_model=list[CategoryTotalResponse])
def get_total_expenses_by_category(
    db: Session = Depends(get_db),
) -> list[CategoryTotalResponse]:
    results = (
        db.query(
            Expense.category,
            func.sum(Expense.amount).label("total_amount"),
        )
        .group_by(Expense.category)
        .all()
    )

    return [
        CategoryTotalResponse(
            category=row.category,
            total_amount=row.total_amount,
        )
        for row in results
    ]


@router.get("/predict-next-month", response_model=ExpensePredictionResponse)
def get_next_month_prediction(
    db: Session = Depends(get_db),
) -> ExpensePredictionResponse:
    expenses = db.query(Expense).order_by(Expense.date).all()
    try:
        prediction = predict_next_month_expense(expenses)
        logger.info("Prediction generated from /expenses/predict-next-month")
        return prediction
    except ValueError as error:
        logger.warning("Prediction validation error: %s", error)
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        logger.exception("Unexpected prediction error: %s", error)
        raise HTTPException(
            status_code=500,
            detail="Unexpected error while generating prediction",
        ) from error


@router.get("/analyze", response_model=ExpenseAnalysisResponse)
def get_expense_analysis(db: Session = Depends(get_db)) -> ExpenseAnalysisResponse:
    expenses = db.query(Expense).all()
    return analyze_expenses(expenses)
