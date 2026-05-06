"""
Reports Router for AI Expense Tracker
Handles financial report generation and management
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from database import get_database, Collections
from schemas.report_schema import (
    ReportCreate, ReportUpdate, ReportResponse, ReportFilter,
    MonthlySummaryReport, WeeklySummaryReport, YearlySummaryReport,
    ExpenseAnalysisReport, BudgetPerformanceReport
)
from routers.auth import get_current_user
from utils.response_handler import ResponseHandler

# Create router
router = APIRouter()


@router.post("/", response_model=ReportResponse)
async def create_report(
    report_data: ReportCreate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Generate a new financial report
    """
    try:
        # Override user_id with current user ID
        report_doc = report_data.dict()
        report_doc["user_id"] = str(current_user["_id"])
        report_doc["status"] = "generating"
        report_doc["created_at"] = datetime.utcnow()
        report_doc["updated_at"] = datetime.utcnow()
        
        # Insert report into database
        result = await database[Collections.REPORTS].insert_one(report_doc)
        report_id = str(result.inserted_id)
        
        # Generate report data based on type
        report_content = await generate_report_data(
            report_data.report_type,
            str(current_user["_id"]),
            report_data.start_date,
            report_data.end_date,
            database
        )
        
        # Update report with generated data
        await database[Collections.REPORTS].update_one(
            {"_id": ObjectId(report_id)},
            {
                "$set": {
                    "status": "completed",
                    "content": report_content,
                    "generated_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Get created report
        created_report = await database[Collections.REPORTS].find_one({"_id": ObjectId(report_id)})
        created_report["_id"] = report_id
        
        return ResponseHandler.created(
            data=ReportResponse(**created_report),
            message="Report generated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to create report: {str(e)}")


@router.get("/", response_model=List[ReportResponse])
async def get_reports(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get user's reports with filtering and pagination
    """
    try:
        # Build query
        query = {"user_id": str(current_user["_id"])}
        
        # Add filters
        if report_type:
            query["report_type"] = report_type
        
        if status:
            query["status"] = status
        
        # Get total count
        total = await database[Collections.REPORTS].count_documents(query)
        
        # Get reports with pagination
        skip = (page - 1) * page_size
        cursor = database[Collections.REPORTS].find(query).sort("created_at", DESCENDING).skip(skip).limit(page_size)
        
        reports = []
        async for report in cursor:
            report["_id"] = str(report["_id"])
            reports.append(ReportResponse(**report))
        
        return ResponseHandler.paginated(
            data=reports,
            page=page,
            page_size=page_size,
            total=total,
            message="Reports retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get reports: {str(e)}")


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific report by ID
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(report_id):
            return ResponseHandler.error(
                message="Invalid report ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get report
        report = await database[Collections.REPORTS].find_one({
            "_id": ObjectId(report_id),
            "user_id": str(current_user["_id"])
        })
        
        if not report:
            return ResponseHandler.not_found("Report")
        
        report["_id"] = report_id
        return ResponseHandler.success(
            data=ReportResponse(**report),
            message="Report retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get report: {str(e)}")


@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete a report
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(report_id):
            return ResponseHandler.error(
                message="Invalid report ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if report exists and belongs to user
        existing_report = await database[Collections.REPORTS].find_one({
            "_id": ObjectId(report_id),
            "user_id": str(current_user["_id"])
        })
        
        if not existing_report:
            return ResponseHandler.not_found("Report")
        
        # Delete report
        await database[Collections.REPORTS].delete_one({"_id": ObjectId(report_id)})
        
        return ResponseHandler.success(
            message="Report deleted successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to delete report: {str(e)}")


@router.get("/monthly/summary", response_model=MonthlySummaryReport)
async def get_monthly_summary_report(
    month: str = Query(..., description="Month in YYYY-MM format"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Generate monthly summary report
    """
    try:
        user_id = str(current_user["_id"])
        
        # Parse month and get date range
        year, month_num = map(int, month.split('-'))
        start_date = datetime(year, month_num, 1)
        if month_num == 12:
            end_date = datetime(year + 1, 1, 1) - timedelta(microseconds=1)
        else:
            end_date = datetime(year, month_num + 1, 1) - timedelta(microseconds=1)
        
        # Get expenses and income for the month
        expense_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": end_date},
            "transaction_type": "expense"
        }
        
        income_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": end_date},
            "transaction_type": "income"
        }
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query)
        income_cursor = database[Collections.EXPENSES].find(income_query)
        
        expenses = []
        income_list = []
        async for expense in expense_cursor:
            expenses.append(expense)
        async for income in income_cursor:
            income_list.append(income)
        
        # Calculate monthly metrics
        total_income = sum(inc["amount"] for inc in income_list)
        total_expenses = sum(exp["amount"] for exp in expenses)
        net_savings = total_income - total_expenses
        savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0
        transaction_count = len(expenses)
        
        # Category breakdown
        category_breakdown = {}
        for expense in expenses:
            category = expense["category"]
            if category not in category_breakdown:
                category_breakdown[category] = 0
            category_breakdown[category] += expense["amount"]
        
        # Budget performance
        budget_performance = {"utilization": 0, "categories_on_track": 0}
        
        # Top expenses
        top_expenses = sorted(expenses, key=lambda x: x["amount"], reverse=True)[:5]
        top_expenses_data = [
            {"title": exp["title"], "amount": exp["amount"], "category": exp["category"]}
            for exp in top_expenses
        ]
        
        # Financial insights
        financial_insights = [
            f"Total income: ${total_income:.2f}",
            f"Total expenses: ${total_expenses:.2f}",
            f"Net savings: ${net_savings:.2f}",
            f"Savings rate: {savings_rate:.1f}%"
        ]
        
        monthly_report = MonthlySummaryReport(
            month=month,
            year=year,
            total_income=total_income,
            total_expenses=total_expenses,
            net_savings=net_savings,
            savings_rate=savings_rate,
            transaction_count=transaction_count,
            category_breakdown=category_breakdown,
            budget_performance=budget_performance,
            top_expenses=top_expenses_data,
            financial_insights=financial_insights
        )
        
        return ResponseHandler.success(
            data=monthly_report,
            message="Monthly summary report generated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to generate monthly summary: {str(e)}")


@router.get("/weekly/summary", response_model=WeeklySummaryReport)
async def get_weekly_summary_report(
    week_number: int = Query(..., ge=1, le=53, description="Week number"),
    year: int = Query(..., description="Year"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Generate weekly summary report
    """
    try:
        user_id = str(current_user["_id"])
        
        # Calculate week date range
        start_date = datetime.strptime(f"{year}-W{week_number-1}-1", "%Y-W%W-%w")
        end_date = start_date + timedelta(days=6)
        
        # Get expenses for the week
        expense_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": end_date},
            "transaction_type": "expense"
        }
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query)
        expenses = []
        async for expense in expense_cursor:
            expenses.append(expense)
        
        # Calculate weekly metrics
        total_expenses = sum(exp["amount"] for exp in expenses)
        daily_average = total_expenses / 7
        transaction_count = len(expenses)
        
        # Category breakdown
        category_breakdown = {}
        for expense in expenses:
            category = expense["category"]
            if category not in category_breakdown:
                category_breakdown[category] = 0
            category_breakdown[category] += expense["amount"]
        
        # Spending patterns (simplified)
        spending_pattern = {"most_active_day": "Monday", "peak_spending_day": "Friday"}
        
        # Weekly goals (simplified)
        weekly_goals = []
        
        weekly_report = WeeklySummaryReport(
            week_number=week_number,
            year=year,
            start_date=start_date.date(),
            end_date=end_date.date(),
            total_expenses=total_expenses,
            daily_average=daily_average,
            transaction_count=transaction_count,
            category_breakdown=category_breakdown,
            spending_pattern=spending_pattern,
            weekly_goals=weekly_goals
        )
        
        return ResponseHandler.success(
            data=weekly_report,
            message="Weekly summary report generated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to generate weekly summary: {str(e)}")


@router.get("/yearly/summary", response_model=YearlySummaryReport)
async def get_yearly_summary_report(
    year: int = Query(..., description="Year"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Generate yearly summary report
    """
    try:
        user_id = str(current_user["_id"])
        
        # Calculate year date range
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23, 59, 59)
        
        # Get expenses and income for the year
        expense_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": end_date},
            "transaction_type": "expense"
        }
        
        income_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": end_date},
            "transaction_type": "income"
        }
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query)
        income_cursor = database[Collections.EXPENSES].find(income_query)
        
        expenses = []
        income_list = []
        async for expense in expense_cursor:
            expenses.append(expense)
        async for income in income_cursor:
            income_list.append(income)
        
        # Calculate yearly metrics
        total_income = sum(inc["amount"] for inc in income_list)
        total_expenses = sum(exp["amount"] for exp in expenses)
        total_savings = total_income - total_expenses
        average_monthly_income = total_income / 12
        average_monthly_expenses = total_expenses / 12
        savings_rate = (total_savings / total_income * 100) if total_income > 0 else 0
        
        # Category totals
        category_totals = {}
        for expense in expenses:
            category = expense["category"]
            if category not in category_totals:
                category_totals[category] = 0
            category_totals[category] += expense["amount"]
        
        # Financial highlights
        financial_highlights = [
            f"Total income: ${total_income:.2f}",
            f"Total expenses: ${total_expenses:.2f}",
            f"Total savings: ${total_savings:.2f}",
            f"Savings rate: {savings_rate:.1f}%"
        ]
        
        # Tax summary (simplified)
        tax_summary = {
            "taxable_income": total_income,
            "deductible_expenses": total_expenses * 0.2,  # Simplified
            "estimated_tax": total_income * 0.25  # Simplified
        }
        
        yearly_report = YearlySummaryReport(
            year=year,
            total_income=total_income,
            total_expenses=total_expenses,
            total_savings=total_savings,
            average_monthly_income=average_monthly_income,
            average_monthly_expenses=average_monthly_expenses,
            savings_rate=savings_rate,
            monthly_breakdown=[],  # Would populate with actual monthly data
            category_totals=category_totals,
            financial_highlights=financial_highlights,
            tax_summary=tax_summary
        )
        
        return ResponseHandler.success(
            data=yearly_report,
            message="Yearly summary report generated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to generate yearly summary: {str(e)}")


# Helper function to generate report data
async def generate_report_data(
    report_type: str,
    user_id: str,
    start_date: date,
    end_date: date,
    database: AsyncIOMotorDatabase
) -> Dict[str, Any]:
    """Generate report data based on type"""
    
    if report_type == "monthly_summary":
        # Generate monthly summary data
        return {"type": "monthly_summary", "data": "Generated monthly summary data"}
    elif report_type == "expense_analysis":
        # Generate expense analysis data
        return {"type": "expense_analysis", "data": "Generated expense analysis data"}
    elif report_type == "budget_performance":
        # Generate budget performance data
        return {"type": "budget_performance", "data": "Generated budget performance data"}
    else:
        return {"type": report_type, "data": "Generated report data"}


# Export for use in other modules
__all__ = ["router"]
