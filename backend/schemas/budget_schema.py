"""
Budget schemas for AI Expense Tracker
Pydantic models for budget data validation and serialization
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, date
from pydantic import BaseModel, Field, validator


class BudgetBase(BaseModel):
    """
    Base budget schema with common fields
    """
    category: str = Field(..., description="Budget category")
    allocated_amount: float = Field(..., gt=0, description="Allocated budget amount")
    period: str = Field("monthly", description="Budget period")
    start_date: date = Field(..., description="Budget start date")
    end_date: date = Field(..., description="Budget end date")
    alert_threshold: float = Field(80.0, ge=0, le=100, description="Alert threshold percentage")
    notes: Optional[str] = Field(None, max_length=1000, description="Additional notes")
    
    @validator('category')
    def validate_category(cls, v):
        """
        Validate budget category
        """
        valid_categories = [
            "Food", "Transport", "Shopping", "Entertainment", "Bills", 
            "Healthcare", "Education", "Travel", "Subscriptions", "Other"
        ]
        if v not in valid_categories:
            raise ValueError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return v
    
    @validator('period')
    def validate_period(cls, v):
        """
        Validate budget period
        """
        valid_periods = ["weekly", "monthly", "quarterly", "yearly"]
        if v not in valid_periods:
            raise ValueError(f"Invalid period. Must be one of: {', '.join(valid_periods)}")
        return v
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        """
        Validate date range
        """
        if 'start_date' in values and values['start_date']:
            if v <= values['start_date']:
                raise ValueError("End date must be after start date")
        return v


class BudgetCreate(BudgetBase):
    """
    Budget creation schema
    """
    user_id: str = Field(..., description="User ID")


class BudgetUpdate(BaseModel):
    """
    Budget update schema (all fields optional)
    """
    category: Optional[str] = None
    allocated_amount: Optional[float] = Field(None, gt=0)
    period: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    alert_threshold: Optional[float] = Field(None, ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=1000)
    
    @validator('category')
    def validate_category(cls, v):
        """
        Validate budget category
        """
        if v is not None:
            valid_categories = [
                "Food", "Transport", "Shopping", "Entertainment", "Bills", 
                "Healthcare", "Education", "Travel", "Subscriptions", "Other"
            ]
            if v not in valid_categories:
                raise ValueError(f"Invalid category. Must be one of: {', '.join(valid_categories)}")
        return v
    
    @validator('period')
    def validate_period(cls, v):
        """
        Validate budget period
        """
        if v is not None:
            valid_periods = ["weekly", "monthly", "quarterly", "yearly"]
            if v not in valid_periods:
                raise ValueError(f"Invalid period. Must be one of: {', '.join(valid_periods)}")
        return v


class BudgetResponse(BudgetBase):
    """
    Budget response schema
    """
    id: str = Field(..., description="Budget ID")
    user_id: str = Field(..., description="User ID")
    spent_amount: float = Field(0.0, description="Amount spent")
    remaining_amount: float = Field(0.0, description="Remaining amount")
    utilization_percentage: float = Field(0.0, description="Budget utilization percentage")
    is_active: bool = Field(True, description="Budget status")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True


class BudgetSummary(BaseModel):
    """
    Budget summary schema
    """
    total_allocated: float = Field(0.0, description="Total allocated amount")
    total_spent: float = Field(0.0, description="Total spent amount")
    total_remaining: float = Field(0.0, description="Total remaining amount")
    average_utilization: float = Field(0.0, description="Average utilization percentage")
    active_budgets: int = Field(0, description="Number of active budgets")
    over_budget_count: int = Field(0, description="Number of budgets over limit")
    category_breakdown: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="Category breakdown")


class BudgetAlert(BaseModel):
    """
    Budget alert schema
    """
    budget_id: str = Field(..., description="Budget ID")
    category: str = Field(..., description="Budget category")
    alert_type: str = Field(..., description="Alert type")
    message: str = Field(..., description="Alert message")
    threshold: float = Field(..., description="Alert threshold")
    current_utilization: float = Field(..., description="Current utilization percentage")
    created_at: datetime = Field(..., description="Alert creation timestamp")
    
    class Config:
        from_attributes = True


class BudgetGoal(BaseModel):
    """
    Budget goal schema
    """
    id: str = Field(..., description="Goal ID")
    title: str = Field(..., description="Goal title")
    target_amount: float = Field(..., gt=0, description="Target amount")
    current_amount: float = Field(0.0, ge=0, description="Current amount")
    percentage: float = Field(0.0, ge=0, le=100, description="Completion percentage")
    target_date: date = Field(..., description="Target date")
    is_completed: bool = Field(False, description="Goal completion status")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True


class BudgetRecommendation(BaseModel):
    """
    Budget recommendation schema
    """
    type: str = Field(..., description="Recommendation type")
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Recommendation description")
    priority: str = Field(..., description="Recommendation priority")
    potential_savings: Optional[float] = Field(None, description="Potential savings amount")
    action_items: List[str] = Field(default_factory=list, description="Recommended actions")
    
    class Config:
        from_attributes = True


class BudgetFilter(BaseModel):
    """
    Budget filter schema
    """
    category: Optional[str] = Field(None, description="Filter by category")
    period: Optional[str] = Field(None, description="Filter by period")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    start_date: Optional[date] = Field(None, description="Filter by start date")
    end_date: Optional[date] = Field(None, description="Filter by end date")
    min_amount: Optional[float] = Field(None, ge=0, description="Filter by minimum allocated amount")
    max_amount: Optional[float] = Field(None, gt=0, description="Filter by maximum allocated amount")


class BudgetStats(BaseModel):
    """
    Budget statistics schema
    """
    total_budgets: int = Field(0, description="Total number of budgets")
    active_budgets: int = Field(0, description="Number of active budgets")
    total_allocated: float = Field(0.0, description="Total allocated amount")
    total_spent: float = Field(0.0, description="Total spent amount")
    total_saved: float = Field(0.0, description="Total saved amount")
    average_utilization: float = Field(0.0, description="Average utilization percentage")
    over_budget_categories: List[str] = Field(default_factory=list, description="Categories over budget")
    under_budget_categories: List[str] = Field(default_factory=list, description="Categories under budget")
    monthly_trend: List[Dict[str, Any]] = Field(default_factory=list, description="Monthly budget trend")
    category_performance: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="Category performance")


class BudgetBulkCreate(BaseModel):
    """
    Bulk budget creation schema
    """
    budgets: List[BudgetCreate] = Field(..., min_items=1, max_items=50, description="List of budgets to create")


# Export for use in other modules
__all__ = [
    "BudgetBase",
    "BudgetCreate",
    "BudgetUpdate",
    "BudgetResponse", 
    "BudgetSummary",
    "BudgetAlert",
    "BudgetGoal",
    "BudgetRecommendation",
    "BudgetFilter",
    "BudgetStats",
    "BudgetBulkCreate"
]
