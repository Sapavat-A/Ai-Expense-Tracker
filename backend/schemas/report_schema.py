"""
Report schemas for AI Expense Tracker
Pydantic models for report data validation and serialization
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, date
from pydantic import BaseModel, Field, validator


class ReportBase(BaseModel):
    """
    Base report schema with common fields
    """
    title: str = Field(..., min_length=1, max_length=200, description="Report title")
    report_type: str = Field(..., description="Report type")
    period: str = Field(..., description="Report period")
    start_date: date = Field(..., description="Report start date")
    end_date: date = Field(..., description="Report end date")
    format: str = Field("pdf", description="Report format")
    include_charts: bool = Field(True, description="Include charts in report")
    include_recommendations: bool = Field(True, description="Include AI recommendations")
    
    @validator('report_type')
    def validate_report_type(cls, v):
        """
        Validate report type
        """
        valid_types = [
            "monthly_summary", "weekly_summary", "yearly_summary",
            "expense_analysis", "budget_performance", "tax_summary",
            "investment_report", "financial_statement"
        ]
        if v not in valid_types:
            raise ValueError(f"Invalid report type. Must be one of: {', '.join(valid_types)}")
        return v
    
    @validator('period')
    def validate_period(cls, v):
        """
        Validate report period
        """
        valid_periods = ["daily", "weekly", "monthly", "quarterly", "yearly", "custom"]
        if v not in valid_periods:
            raise ValueError(f"Invalid period. Must be one of: {', '.join(valid_periods)}")
        return v
    
    @validator('format')
    def validate_format(cls, v):
        """
        Validate report format
        """
        valid_formats = ["pdf", "excel", "csv", "json"]
        if v not in valid_formats:
            raise ValueError(f"Invalid format. Must be one of: {', '.join(valid_formats)}")
        return v


class ReportCreate(ReportBase):
    """
    Report creation schema
    """
    user_id: str = Field(..., description="User ID")
    email_recipients: Optional[List[str]] = Field(None, description="Email recipients")
    schedule: Optional[str] = Field(None, description="Report schedule")


class ReportUpdate(BaseModel):
    """
    Report update schema (all fields optional)
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    report_type: Optional[str] = None
    period: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    format: Optional[str] = None
    include_charts: Optional[bool] = None
    include_recommendations: Optional[bool] = None
    email_recipients: Optional[List[str]] = None
    schedule: Optional[str] = None


class ReportResponse(ReportBase):
    """
    Report response schema
    """
    id: str = Field(..., description="Report ID")
    user_id: str = Field(..., description="User ID")
    status: str = Field("pending", description="Report generation status")
    file_path: Optional[str] = Field(None, description="Generated file path")
    file_size: Optional[int] = Field(None, description="File size in bytes")
    download_url: Optional[str] = Field(None, description="Download URL")
    generated_at: Optional[datetime] = Field(None, description="Generation timestamp")
    expires_at: Optional[datetime] = Field(None, description="Expiration timestamp")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True


class MonthlySummaryReport(BaseModel):
    """
    Monthly summary report schema
    """
    month: str = Field(..., description="Month (YYYY-MM format)")
    year: int = Field(..., description="Year")
    total_income: float = Field(0.0, description="Total income")
    total_expenses: float = Field(0.0, description="Total expenses")
    net_savings: float = Field(0.0, description="Net savings")
    savings_rate: float = Field(0.0, description="Savings rate percentage")
    transaction_count: int = Field(0, description="Number of transactions")
    category_breakdown: Dict[str, float] = Field(default_factory=dict, description="Category breakdown")
    budget_performance: Dict[str, Any] = Field(default_factory=dict, description="Budget performance")
    top_expenses: List[Dict[str, Any]] = Field(default_factory=list, description="Top expenses")
    financial_insights: List[str] = Field(default_factory=list, description="Financial insights")


class WeeklySummaryReport(BaseModel):
    """
    Weekly summary report schema
    """
    week_number: int = Field(..., description="Week number")
    year: int = Field(..., description="Year")
    start_date: date = Field(..., description="Week start date")
    end_date: date = Field(..., description="Week end date")
    total_expenses: float = Field(0.0, description="Total expenses")
    daily_average: float = Field(0.0, description="Daily average expenses")
    transaction_count: int = Field(0, description="Number of transactions")
    category_breakdown: Dict[str, float] = Field(default_factory=dict, description="Category breakdown")
    spending_pattern: Dict[str, Any] = Field(default_factory=dict, description="Spending patterns")
    weekly_goals: List[Dict[str, Any]] = Field(default_factory=list, description="Weekly goals status")


class YearlySummaryReport(BaseModel):
    """
    Yearly summary report schema
    """
    year: int = Field(..., description="Year")
    total_income: float = Field(0.0, description="Total annual income")
    total_expenses: float = Field(0.0, description="Total annual expenses")
    total_savings: float = Field(0.0, description="Total annual savings")
    monthly_averages: Dict[str, float] = Field(default_factory=dict, description="Monthly averages")
    category_totals: Dict[str, float] = Field(default_factory=dict, description="Category totals")
    monthly_trends: List[Dict[str, Any]] = Field(default_factory=list, description="Monthly trends")
    financial_highlights: List[str] = Field(default_factory=list, description="Financial highlights")
    tax_summary: Dict[str, Any] = Field(default_factory=dict, description="Tax summary")


class ExpenseAnalysisReport(BaseModel):
    """
    Expense analysis report schema
    """
    period: str = Field(..., description="Analysis period")
    total_expenses: float = Field(0.0, description="Total expenses")
    category_analysis: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="Category analysis")
    spending_patterns: Dict[str, Any] = Field(default_factory=dict, description="Spending patterns")
    unusual_expenses: List[Dict[str, Any]] = Field(default_factory=list, description="Unusual expenses")
    merchant_analysis: Dict[str, Any] = Field(default_factory=dict, description="Merchant analysis")
    payment_method_analysis: Dict[str, Any] = Field(default_factory=dict, description="Payment method analysis")
    recommendations: List[str] = Field(default_factory=list, description="Expense recommendations")


class BudgetPerformanceReport(BaseModel):
    """
    Budget performance report schema
    """
    period: str = Field(..., description="Report period")
    total_budget: float = Field(0.0, description="Total budget")
    total_spent: float = Field(0.0, description="Total spent")
    overall_utilization: float = Field(0.0, description="Overall utilization")
    category_performance: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="Category performance")
    over_budget_categories: List[Dict[str, Any]] = Field(default_factory=list, description="Over budget categories")
    under_budget_categories: List[Dict[str, Any]] = Field(default_factory=list, description="Under budget categories")
    budget_recommendations: List[str] = Field(default_factory=list, description="Budget recommendations")


class TaxSummaryReport(BaseModel):
    """
    Tax summary report schema
    """
    tax_year: int = Field(..., description="Tax year")
    total_income: float = Field(0.0, description="Total taxable income")
    deductible_expenses: float = Field(0.0, description="Total deductible expenses")
    tax_deductible_categories: Dict[str, float] = Field(default_factory=dict, description="Tax deductible categories")
    business_expenses: float = Field(0.0, description="Business expenses")
    medical_expenses: float = Field(0.0, description="Medical expenses")
    charitable_donations: float = Field(0.0, description="Charitable donations")
    education_expenses: float = Field(0.0, description="Education expenses")
    tax_recommendations: List[str] = Field(default_factory=list, description="Tax recommendations")


class ReportSchedule(BaseModel):
    """
    Report schedule schema
    """
    report_type: str = Field(..., description="Report type")
    frequency: str = Field(..., description="Schedule frequency")
    next_run_date: datetime = Field(..., description="Next run date")
    email_recipients: List[str] = Field(default_factory=list, description="Email recipients")
    is_active: bool = Field(True, description="Schedule status")
    last_run_date: Optional[datetime] = Field(None, description="Last run date")
    
    @validator('frequency')
    def validate_frequency(cls, v):
        """
        Validate schedule frequency
        """
        valid_frequencies = ["daily", "weekly", "monthly", "quarterly", "yearly"]
        if v not in valid_frequencies:
            raise ValueError(f"Invalid frequency. Must be one of: {', '.join(valid_frequencies)}")
        return v


class ReportFilter(BaseModel):
    """
    Report filter schema
    """
    report_type: Optional[str] = Field(None, description="Filter by report type")
    period: Optional[str] = Field(None, description="Filter by period")
    status: Optional[str] = Field(None, description="Filter by status")
    start_date: Optional[date] = Field(None, description="Filter by start date")
    end_date: Optional[date] = Field(None, description="Filter by end date")
    format: Optional[str] = Field(None, description="Filter by format")


# Export for use in other modules
__all__ = [
    "ReportBase",
    "ReportCreate",
    "ReportUpdate",
    "ReportResponse",
    "MonthlySummaryReport",
    "WeeklySummaryReport", 
    "YearlySummaryReport",
    "ExpenseAnalysisReport",
    "BudgetPerformanceReport",
    "TaxSummaryReport",
    "ReportSchedule",
    "ReportFilter"
]
