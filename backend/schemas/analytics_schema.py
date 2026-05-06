"""
Analytics schemas for AI Expense Tracker
Pydantic models for analytics data validation and serialization
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, date
from pydantic import BaseModel, Field, validator


class AnalyticsBase(BaseModel):
    """
    Base analytics schema with common fields
    """
    period: str = Field(..., description="Analytics period")
    start_date: date = Field(..., description="Analysis start date")
    end_date: date = Field(..., description="Analysis end date")
    metrics: Dict[str, Any] = Field(..., description="Analytics metrics")
    
    @validator('period')
    def validate_period(cls, v):
        """
        Validate analytics period
        """
        valid_periods = ["daily", "weekly", "monthly", "quarterly", "yearly"]
        if v not in valid_periods:
            raise ValueError(f"Invalid period. Must be one of: {', '.join(valid_periods)}")
        return v


class DashboardAnalytics(BaseModel):
    """
    Dashboard analytics schema
    """
    total_balance: float = Field(0.0, description="Total account balance")
    monthly_income: float = Field(0.0, description="Monthly income")
    monthly_expenses: float = Field(0.0, description="Monthly expenses")
    savings_rate: float = Field(0.0, description="Savings rate percentage")
    expense_trend: str = Field("stable", description="Expense trend")
    budget_utilization: float = Field(0.0, description="Overall budget utilization")
    active_budgets: int = Field(0, description="Number of active budgets")
    recent_transactions_count: int = Field(0, description="Number of recent transactions")
    top_spending_category: Optional[str] = Field(None, description="Top spending category")
    financial_health_score: float = Field(0.0, ge=0, le=100, description="Financial health score")


class SpendingTrend(BaseModel):
    """
    Spending trend schema
    """
    period: str = Field(..., description="Trend period")
    amount: float = Field(..., description="Spending amount")
    change_percentage: float = Field(0.0, description="Change percentage from previous period")
    trend_direction: str = Field("stable", description="Trend direction (up/down/stable)")
    category_breakdown: Dict[str, float] = Field(default_factory=dict, description="Category breakdown")


class CategoryAnalytics(BaseModel):
    """
    Category analytics schema
    """
    category: str = Field(..., description="Category name")
    total_amount: float = Field(0.0, description="Total amount spent")
    transaction_count: int = Field(0, description="Number of transactions")
    average_transaction: float = Field(0.0, description="Average transaction amount")
    percentage_of_total: float = Field(0.0, description="Percentage of total spending")
    monthly_average: float = Field(0.0, description="Monthly average")
    trend: str = Field("stable", description="Spending trend")
    budget_comparison: Optional[Dict[str, Any]] = Field(None, description="Budget comparison data")


class MonthlyAnalytics(BaseModel):
    """
    Monthly analytics schema
    """
    month: str = Field(..., description="Month (YYYY-MM format)")
    year: int = Field(..., description="Year")
    income: float = Field(0.0, description="Total income")
    expenses: float = Field(0.0, description="Total expenses")
    savings: float = Field(0.0, description="Total savings")
    savings_rate: float = Field(0.0, description="Savings rate percentage")
    transaction_count: int = Field(0, description="Number of transactions")
    category_breakdown: Dict[str, float] = Field(default_factory=dict, description="Category breakdown")
    budget_performance: Dict[str, Any] = Field(default_factory=dict, description="Budget performance")


class YearlyAnalytics(BaseModel):
    """
    Yearly analytics schema
    """
    year: int = Field(..., description="Year")
    total_income: float = Field(0.0, description="Total annual income")
    total_expenses: float = Field(0.0, description="Total annual expenses")
    total_savings: float = Field(0.0, description="Total annual savings")
    average_monthly_income: float = Field(0.0, description="Average monthly income")
    average_monthly_expenses: float = Field(0.0, description="Average monthly expenses")
    savings_rate: float = Field(0.0, description="Annual savings rate")
    monthly_breakdown: List[MonthlyAnalytics] = Field(default_factory=list, description="Monthly breakdown")
    category_totals: Dict[str, float] = Field(default_factory=dict, description="Category totals")


class FinancialHealthMetrics(BaseModel):
    """
    Financial health metrics schema
    """
    overall_score: float = Field(0.0, ge=0, le=100, description="Overall financial health score")
    income_stability: float = Field(0.0, ge=0, le=100, description="Income stability score")
    expense_control: float = Field(0.0, ge=0, le=100, description="Expense control score")
    savings_consistency: float = Field(0.0, ge=0, le=100, description="Savings consistency score")
    debt_management: float = Field(0.0, ge=0, le=100, description="Debt management score")
    investment_diversification: float = Field(0.0, ge=0, le=100, description="Investment diversification score")
    emergency_fund: float = Field(0.0, ge=0, le=100, description="Emergency fund score")
    budget_adherence: float = Field(0.0, ge=0, le=100, description="Budget adherence score")


class AnalyticsFilter(BaseModel):
    """
    Analytics filter schema
    """
    period: Optional[str] = Field(None, description="Filter by period")
    start_date: Optional[date] = Field(None, description="Filter by start date")
    end_date: Optional[date] = Field(None, description="Filter by end date")
    categories: Optional[List[str]] = Field(None, description="Filter by categories")
    include_income: bool = Field(True, description="Include income in analysis")
    include_expenses: bool = Field(True, description="Include expenses in analysis")
    comparison_period: Optional[str] = Field(None, description="Comparison period for trend analysis")


class AnalyticsRequest(BaseModel):
    """
    Analytics request schema
    """
    user_id: str = Field(..., description="User ID")
    analysis_type: str = Field(..., description="Type of analysis")
    period: str = Field("monthly", description="Analysis period")
    start_date: Optional[date] = Field(None, description="Custom start date")
    end_date: Optional[date] = Field(None, description="Custom end date")
    categories: Optional[List[str]] = Field(None, description="Specific categories to analyze")
    include_predictions: bool = Field(False, description="Include AI predictions")
    
    @validator('analysis_type')
    def validate_analysis_type(cls, v):
        """
        Validate analysis type
        """
        valid_types = [
            "dashboard", "spending_trend", "category_analysis", 
            "monthly_summary", "yearly_summary", "financial_health"
        ]
        if v not in valid_types:
            raise ValueError(f"Invalid analysis type. Must be one of: {', '.join(valid_types)}")
        return v


class PredictionAnalytics(BaseModel):
    """
    Prediction analytics schema
    """
    prediction_type: str = Field(..., description="Type of prediction")
    predicted_amount: float = Field(..., description="Predicted amount")
    confidence_score: float = Field(0.0, ge=0, le=100, description="Confidence score")
    time_horizon: str = Field(..., description="Prediction time horizon")
    factors: List[str] = Field(default_factory=list, description="Influencing factors")
    historical_accuracy: Optional[float] = Field(None, description="Historical prediction accuracy")


class ComparisonAnalytics(BaseModel):
    """
    Comparison analytics schema
    """
    current_period: Dict[str, Any] = Field(..., description="Current period data")
    previous_period: Dict[str, Any] = Field(..., description="Previous period data")
    change_amount: float = Field(0.0, description="Absolute change amount")
    change_percentage: float = Field(0.0, description="Percentage change")
    trend_direction: str = Field("stable", description="Trend direction")
    insights: List[str] = Field(default_factory=list, description="Comparison insights")


# Export for use in other modules
__all__ = [
    "AnalyticsBase",
    "DashboardAnalytics",
    "SpendingTrend",
    "CategoryAnalytics",
    "MonthlyAnalytics",
    "YearlyAnalytics",
    "FinancialHealthMetrics",
    "AnalyticsFilter",
    "AnalyticsRequest",
    "PredictionAnalytics",
    "ComparisonAnalytics"
]
