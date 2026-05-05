from models import Expense
from schemas import ExpenseAnalysisResponse, ExpenseResponse


def analyze_expenses(expenses: list[Expense]) -> ExpenseAnalysisResponse:
    if not expenses:
        return ExpenseAnalysisResponse(
            highest_spending_category=None,
            average_spending=0.0,
            unusual_expenses=[],
            message="No expenses found",
        )

    total_spending = sum(expense.amount for expense in expenses)
    average_spending = total_spending / len(expenses)

    category_totals: dict[str, float] = {}
    for expense in expenses:
        category_totals[expense.category] = (
            category_totals.get(expense.category, 0.0) + expense.amount
        )

    highest_spending_category = max(category_totals, key=category_totals.get)
    unusual_threshold = average_spending * 1.5
    unusual_expenses = [
        ExpenseResponse.model_validate(expense)
        for expense in expenses
        if expense.amount > unusual_threshold
    ]

    return ExpenseAnalysisResponse(
        highest_spending_category=highest_spending_category,
        average_spending=round(average_spending, 2),
        unusual_expenses=unusual_expenses,
        message=None,
    )
