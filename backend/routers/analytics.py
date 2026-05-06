"""
Analytics Router for AI Expense Tracker
Handles financial analytics and insights
"""

from typing import List, Optional
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from database import get_database, Collections
from schemas.analytics_schema import (
    DashboardAnalytics, CategoryAnalytics, MonthlyAnalytics, 
    YearlyAnalytics, FinancialHealthMetrics, AnalyticsRequest
)
from routers.auth import get_current_user
from utils.response_handler import ResponseHandler

# Create router
router = APIRouter()


@router.get("/dashboard", response_model=DashboardAnalytics)
async def get_dashboard_analytics(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get dashboard analytics for the current user
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get current month's date range
        now = datetime.utcnow()
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(microseconds=1)
        
        # Get expenses for current month
        expense_query = {
            "user_id": user_id,
            "date": {"$gte": start_of_month, "$lte": end_of_month},
            "transaction_type": "expense"
        }
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query)
        expenses = []
        async for expense in expense_cursor:
            expenses.append(expense)
        
        # Get income for current month
        income_query = {
            "user_id": user_id,
            "date": {"$gte": start_of_month, "$lte": end_of_month},
            "transaction_type": "income"
        }
        
        income_cursor = database[Collections.EXPENSES].find(income_query)
        income_list = []
        async for income in income_cursor:
            income_list.append(income)
        
        # Calculate totals
        monthly_expenses = sum(exp["amount"] for exp in expenses)
        monthly_income = sum(inc["amount"] for inc in income_list)
        savings_rate = ((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income > 0 else 0
        
        # Get account balance (simplified - would come from user's actual balance)
        total_balance = monthly_income - monthly_expenses
        
        # Get budget utilization
        budget_cursor = database[Collections.BUDGETS].find({
            "user_id": user_id,
            "is_active": True
        })
        budgets = []
        async for budget in budget_cursor:
            budgets.append(budget)
        
        budget_utilization = 0
        if budgets:
            total_allocated = sum(b["allocated_amount"] for b in budgets)
            total_spent = sum(b["spent_amount"] for b in budgets)
            budget_utilization = (total_spent / total_allocated * 100) if total_allocated > 0 else 0
        
        # Find top spending category
        category_totals = {}
        for expense in expenses:
            category = expense["category"]
            if category not in category_totals:
                category_totals[category] = 0
            category_totals[category] += expense["amount"]
        
        top_spending_category = max(category_totals.keys(), key=category_totals.get) if category_totals else None
        
        # Calculate financial health score (simplified)
        financial_health_score = min(100, max(0, savings_rate + (100 - budget_utilization) / 2))
        
        # Determine expense trend (simplified)
        expense_trend = "stable"
        if len(expenses) > 10:
            recent_avg = sum(exp["amount"] for exp in expenses[-5:]) / 5
            older_avg = sum(exp["amount"] for exp in expenses[:5]) / 5
            if recent_avg > older_avg * 1.1:
                expense_trend = "up"
            elif recent_avg < older_avg * 0.9:
                expense_trend = "down"
        
        dashboard_data = DashboardAnalytics(
            total_balance=total_balance,
            monthly_income=monthly_income,
            monthly_expenses=monthly_expenses,
            savings_rate=savings_rate,
            expense_trend=expense_trend,
            budget_utilization=budget_utilization,
            active_budgets=len(budgets),
            recent_transactions_count=len(expenses),
            top_spending_category=top_spending_category,
            financial_health_score=financial_health_score
        )
        
        return ResponseHandler.success(
            data=dashboard_data,
            message="Dashboard analytics retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get dashboard analytics: {str(e)}")


@router.get("/categories", response_model=List[CategoryAnalytics])
async def get_category_analytics(
    period: str = Query("monthly", description="Analysis period"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get category-wise spending analytics
    """
    try:
        user_id = str(current_user["_id"])
        
        # Calculate date range based on period
        now = datetime.utcnow()
        if period == "weekly":
            start_date = now - timedelta(days=7)
        elif period == "monthly":
            start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        elif period == "quarterly":
            start_date = now - timedelta(days=90)
        else:  # yearly
            start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        
        # Get expenses for the period
        expense_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": now},
            "transaction_type": "expense"
        }
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query)
        expenses = []
        async for expense in expense_cursor:
            expenses.append(expense)
        
        # Group by category
        category_data = {}
        total_expenses = sum(exp["amount"] for exp in expenses)
        
        for expense in expenses:
            category = expense["category"]
            if category not in category_data:
                category_data[category] = {
                    "total": 0,
                    "count": 0,
                    "transactions": []
                }
            category_data[category]["total"] += expense["amount"]
            category_data[category]["count"] += 1
            category_data[category]["transactions"].append(expense)
        
        # Build category analytics
        category_analytics = []
        for category, data in category_data.items():
            average_transaction = data["total"] / data["count"]
            percentage_of_total = (data["total"] / total_expenses * 100) if total_expenses > 0 else 0
            
            # Calculate monthly average (simplified)
            monthly_average = data["total"]
            if period == "weekly":
                monthly_average = data["total"] * 4.33  # Average weeks per month
            elif period == "quarterly":
                monthly_average = data["total"] / 3
            elif period == "yearly":
                monthly_average = data["total"] / 12
            
            # Determine trend (simplified)
            trend = "stable"
            
            # Get budget comparison if available
            budget_comparison = None
            budget_cursor = database[Collections.BUDGETS].find({
                "user_id": user_id,
                "category": category,
                "is_active": True
            })
            budget = await budget_cursor.to_list(length=1)
            if budget:
                budget_comparison = {
                    "allocated": budget[0]["allocated_amount"],
                    "spent": data["total"],
                    "remaining": budget[0]["allocated_amount"] - data["total"],
                    "utilization": (data["total"] / budget[0]["allocated_amount"] * 100) if budget[0]["allocated_amount"] > 0 else 0
                }
            
            category_analytics.append(CategoryAnalytics(
                category=category,
                total_amount=data["total"],
                transaction_count=data["count"],
                average_transaction=average_transaction,
                percentage_of_total=percentage_of_total,
                monthly_average=monthly_average,
                trend=trend,
                budget_comparison=budget_comparison
            ))
        
        # Sort by total amount descending
        category_analytics.sort(key=lambda x: x.total_amount, reverse=True)
        
        return ResponseHandler.success(
            data=category_analytics,
            message="Category analytics retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get category analytics: {str(e)}")


@router.get("/monthly", response_model=List[MonthlyAnalytics])
async def get_monthly_analytics(
    months: int = Query(12, ge=1, le=24, description="Number of months to analyze"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get monthly spending analytics
    """
    try:
        user_id = str(current_user["_id"])
        
        monthly_data = []
        now = datetime.utcnow()
        
        for i in range(months):
            # Calculate month start and end
            month_date = now - timedelta(days=30 * i)
            start_of_month = month_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            end_of_month = (start_of_month + timedelta(days=32)).replace(day=1) - timedelta(microseconds=1)
            
            # Get expenses for the month
            expense_query = {
                "user_id": user_id,
                "date": {"$gte": start_of_month, "$lte": end_of_month},
                "transaction_type": "expense"
            }
            
            expense_cursor = database[Collections.EXPENSES].find(expense_query)
            expenses = []
            async for expense in expense_cursor:
                expenses.append(expense)
            
            # Get income for the month
            income_query = {
                "user_id": user_id,
                "date": {"$gte": start_of_month, "$lte": end_of_month},
                "transaction_type": "income"
            }
            
            income_cursor = database[Collections.EXPENSES].find(income_query)
            income_list = []
            async for income in income_cursor:
                income_list.append(income)
            
            # Calculate monthly metrics
            income_total = sum(inc["amount"] for inc in income_list)
            expenses_total = sum(exp["amount"] for exp in expenses)
            savings = income_total - expenses_total
            savings_rate = (savings / income_total * 100) if income_total > 0 else 0
            transaction_count = len(expenses)
            
            # Category breakdown
            category_breakdown = {}
            for expense in expenses:
                category = expense["category"]
                if category not in category_breakdown:
                    category_breakdown[category] = 0
                category_breakdown[category] += expense["amount"]
            
            # Budget performance (simplified)
            budget_performance = {
                "total_utilization": 0,
                "categories_on_track": 0,
                "categories_over_budget": 0
            }
            
            monthly_analytics = MonthlyAnalytics(
                month=start_of_month.strftime("%Y-%m"),
                year=start_of_month.year,
                income=income_total,
                expenses=expenses_total,
                savings=savings,
                savings_rate=savings_rate,
                transaction_count=transaction_count,
                category_breakdown=category_breakdown,
                budget_performance=budget_performance
            )
            
            monthly_data.append(monthly_analytics)
        
        return ResponseHandler.success(
            data=monthly_data,
            message="Monthly analytics retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get monthly analytics: {str(e)}")


@router.get("/financial-health", response_model=FinancialHealthMetrics)
async def get_financial_health(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get comprehensive financial health metrics
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get last 6 months of data for analysis
        now = datetime.utcnow()
        six_months_ago = now - timedelta(days=180)
        
        # Get expenses and income
        expense_query = {
            "user_id": user_id,
            "date": {"$gte": six_months_ago, "$lte": now},
            "transaction_type": "expense"
        }
        
        income_query = {
            "user_id": user_id,
            "date": {"$gte": six_months_ago, "$lte": now},
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
        
        # Calculate health metrics (simplified scoring)
        total_income = sum(inc["amount"] for inc in income_list)
        total_expenses = sum(exp["amount"] for exp in expenses)
        savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0
        
        # Income stability (based on consistency)
        income_stability = 75  # Simplified - would analyze monthly income variance
        
        # Expense control
        expense_control = max(0, 100 - (total_expenses / total_income * 100)) if total_income > 0 else 0
        
        # Savings consistency
        savings_consistency = min(100, savings_rate * 1.5)  # Simplified
        
        # Other metrics (simplified defaults)
        debt_management = 80
        investment_diversification = 60
        emergency_fund = 70
        budget_adherence = 75
        
        # Calculate overall score
        overall_score = (
            income_stability + expense_control + savings_consistency +
            debt_management + investment_diversification + emergency_fund + budget_adherence
        ) / 7
        
        financial_health = FinancialHealthMetrics(
            overall_score=overall_score,
            income_stability=income_stability,
            expense_control=expense_control,
            savings_consistency=savings_consistency,
            debt_management=debt_management,
            investment_diversification=investment_diversification,
            emergency_fund=emergency_fund,
            budget_adherence=budget_adherence
        )
        
        return ResponseHandler.success(
            data=financial_health,
            message="Financial health metrics retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get financial health metrics: {str(e)}")


# Export for use in other modules
__all__ = ["router"]
