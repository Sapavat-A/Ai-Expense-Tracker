"""
Expense schemas for AI Expense Tracker
Pydantic models for expense data validation and serialization
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, date
from pydantic import BaseModel, Field, field_validator


class ExpenseBase(BaseModel):
    """
    Base expense schema with common fields
    """
    title: str
    amount: float
    category: str
    payment_method: str
    transaction_type: str = "expense"
    date: date
    notes: Optional[str] = None
    tags: List[str] = []
    location: Optional[str] = None
    merchant: Optional[str] = None
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """
        Validate expense category
        """
        valid_categories = [
            "Food", "Transport", "Shopping", "Entertainment", "Bills", 
            "Healthcare", "Education", "Travel", "Subscriptions", "Other"
        ]
        if v not in valid_categories:
            raise ValueError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return v
    
    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v):
        """
        Validate payment method
        """
        valid_methods = [
            "Cash", "Credit Card", "Debit Card", "Bank Transfer", 
            "Mobile Payment", "Check", "Other"
        ]
        if v not in valid_methods:
            raise ValueError(f"Invalid payment method. Must be one of: {', '.join(valid_methods)}")
        return v
    
    @field_validator('transaction_type')
    @classmethod
    def validate_transaction_type(cls, v):
        """
        Validate transaction type
        """
        if v not in ["income", "expense"]:
            raise ValueError("Transaction type must be either 'income' or 'expense'")
        return v


class ExpenseCreate(ExpenseBase):
    """
    Expense creation schema
    """
    user_id: str = Field(..., description="User ID")


class ExpenseUpdate(BaseModel):
    """
    Expense update schema (all fields optional)
    """
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_type: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
    tags: Optional[List[str]] = None
    location: Optional[str] = None
    merchant: Optional[str] = None
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        """
        Validate expense category
        """
        if v is not None:
            valid_categories = [
                "Food", "Transport", "Shopping", "Entertainment", "Bills", 
                "Healthcare", "Education", "Travel", "Subscriptions", "Other"
            ]
            if v not in valid_categories:
                raise ValueError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return v
    
    @field_validator('payment_method')
    @classmethod
    def validate_payment_method(cls, v):
        """
        Validate payment method
        """
        if v is not None:
            valid_methods = [
                "Cash", "Credit Card", "Debit Card", "Bank Transfer", 
                "Mobile Payment", "Check", "Other"
            ]
            if v not in valid_methods:
                raise ValueError(f"Invalid payment method. Must be one of: {', '.join(valid_methods)}")
        return v
    
    @field_validator('transaction_type')
    @classmethod
    def validate_transaction_type(cls, v):
        """
        Validate transaction type
        """
        if v is not None and v not in ["income", "expense"]:
            raise ValueError("Transaction type must be either 'income' or 'expense'")
        return v


class ExpenseResponse(ExpenseBase):
    """
    Expense response schema
    """
    id: str = Field(..., description="Expense ID")
    user_id: str = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


class ExpenseSummary(BaseModel):
    """
    Expense summary schema
    """
    total_amount: float = Field(0.0, description="Total amount")
    count: int = Field(0, description="Number of expenses")
    average_amount: float = Field(0.0, description="Average amount")
    category_breakdown: Dict[str, float] = Field(default_factory=dict, description="Category breakdown")


class ExpenseFilter(BaseModel):
    """
    Expense filter schema
    """
    category: Optional[str] = Field(None, description="Filter by category")
    payment_method: Optional[str] = Field(None, description="Filter by payment method")
    transaction_type: Optional[str] = Field(None, description="Filter by transaction type")
    start_date: Optional[date] = Field(None, description="Filter by start date")
    end_date: Optional[date] = Field(None, description="Filter by end date")
    min_amount: Optional[float] = Field(None, ge=0, description="Filter by minimum amount")
    max_amount: Optional[float] = Field(None, gt=0, description="Filter by maximum amount")
    tags: Optional[List[str]] = Field(None, description="Filter by tags")
    search: Optional[str] = Field(None, description="Search in title and notes")
    
    @field_validator('end_date')
    @classmethod
    def validate_date_range(cls, v, info):
        """
        Validate date range
        """
        if v and 'start_date' in info.data and info.data['start_date']:
            if v < info.data['start_date']:
                raise ValueError("End date must be after start date")
        return v


class ExpenseStats(BaseModel):
    """
    Expense statistics schema
    """
    total_expenses: float = Field(0.0, description="Total expenses")
    total_income: float = Field(0.0, description="Total income")
    net_amount: float = Field(0.0, description="Net amount (income - expenses)")
    expense_count: int = Field(0, description="Number of expenses")
    income_count: int = Field(0, description="Number of income entries")
    average_expense: float = Field(0.0, description="Average expense amount")
    average_income: float = Field(0.0, description="Average income amount")
    category_stats: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="Category statistics")
    payment_method_stats: Dict[str, float] = Field(default_factory=dict, description="Payment method statistics")
    monthly_trend: List[Dict[str, Any]] = Field(default_factory=list, description="Monthly trend data")


class ExpenseBulkCreate(BaseModel):
    """
    Bulk expense creation schema
    """
    expenses: List[ExpenseCreate]


class ExpenseBulkUpdate(BaseModel):
    """
    Bulk expense update schema
    """
    expense_ids: List[str]
    updates: ExpenseUpdate


class ExpenseImport(BaseModel):
    """
    Expense import schema (for CSV/Excel imports)
    """
    title: str
    amount: str
    category: Optional[str] = None
    payment_method: Optional[str] = None
    transaction_type: Optional[str] = "expense"
    date: Optional[str] = None
    notes: Optional[str] = None
    
    @field_validator('amount')
    @classmethod
    def parse_amount(cls, v):
        """
        Parse amount string to float
        """
        try:
            # Remove common currency symbols and commas
            clean_amount = v.replace('$', '').replace('€', '').replace('£', '').replace(',', '')
            return float(clean_amount)
        except ValueError:
            raise ValueError(f"Invalid amount format: {v}")


# Export for use in other modules
__all__ = [
    "ExpenseBase",
    "ExpenseCreate",
    "ExpenseUpdate", 
    "ExpenseResponse",
    "ExpenseSummary",
    "ExpenseFilter",
    "ExpenseStats",
    "ExpenseBulkCreate",
    "ExpenseBulkUpdate",
    "ExpenseImport"
]
