import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class ExpenseCreate(BaseModel):
    amount: float
    category: str
    date: str | None = None


class ExpenseResponse(BaseModel):
    id: int
    amount: float
    category: str
    date: datetime.date

    class Config:
        from_attributes = True


class CategoryTotalResponse(BaseModel):
    category: str
    total_amount: float


class ExpensePredictionResponse(BaseModel):
    predicted_expense: float
    message: str


class ExpenseAnalysisResponse(BaseModel):
    highest_spending_category: str | None
    average_spending: float
    unusual_expenses: list[ExpenseResponse]
    message: str | None = None
