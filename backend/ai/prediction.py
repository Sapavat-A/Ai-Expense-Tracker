from sklearn.linear_model import LinearRegression

from models import Expense
from schemas import ExpensePredictionResponse


def predict_next_month_expense(expenses: list[Expense]) -> ExpensePredictionResponse:
    if not expenses:
        raise ValueError("No expense data found for prediction")

    # Read date from each expense row and convert to YYYY-MM-DD text.
    dates = [str(expense.date) for expense in expenses if expense.date is not None]
    unique_days = set(dates)
    print("All dates:", dates)
    print("Unique days:", unique_days)

    if len(unique_days) < 5:
        raise ValueError(
            "Need at least 5 unique days of expense data for prediction. "
            "If all dates are same, save expenses with different dates."
        )

    # Use only the most recent 15 unique days for training.
    sorted_days = sorted(unique_days)
    recent_days = sorted_days[-15:]

    # Group and sum expenses by date.
    daily_totals: dict[str, float] = {day: 0.0 for day in recent_days}
    for expense in expenses:
        day_key = str(expense.date)
        if day_key in daily_totals:
            daily_totals[day_key] += float(expense.amount)

    sorted_recent_days = sorted(daily_totals.keys())
    y_train = [daily_totals[day] for day in sorted_recent_days]

    x_train = [[index + 1] for index in range(len(y_train))]

    model = LinearRegression()
    model.fit(x_train, y_train)

    predicted_total = float(model.predict([[len(y_train) + 1]])[0])
    if predicted_total < 0:
        predicted_total = 0.0

    return ExpensePredictionResponse(
        predicted_expense=round(predicted_total, 2),
        message="Prediction based on last 15 days",
    )
