import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from database_config import get_db
from models import User, Expense
from email_service import email_service, email_template_service

logger = logging.getLogger(__name__)

class MonthlyReportService:
    """Service for generating monthly expense reports."""
    
    def __init__(self):
        pass
    
    def generate_monthly_report(
        self,
        db: Session,
        user_id: int,
        year: int,
        month: int,
        currency: str = "$"
    ) -> Dict[str, Any]:
        """
        Generate comprehensive monthly report for a user.
        
        Args:
            db: Database session
            user_id: User ID
            year: Year (e.g., 2024)
            month: Month (1-12)
            currency: Currency symbol
            
        Returns:
            Dictionary with complete monthly report data
        """
        try:
            # Get user info
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValueError("User not found")
            
            # Calculate date range for the month
            start_date = datetime(year, month, 1)
            if month == 12:
                end_date = datetime(year + 1, 1, 1) - timedelta(seconds=1)
            else:
                end_date = datetime(year, month + 1, 1) - timedelta(seconds=1)
            
            # Get expenses for the month
            expenses = db.query(Expense).filter(
                Expense.user_id == user_id,
                Expense.date >= start_date,
                Expense.date < end_date
            ).all()
            
            if not expenses:
                return self._generate_empty_report(user, year, month, currency)
            
            # Calculate basic statistics
            total_spent = sum(float(exp.amount) for exp in expenses)
            transaction_count = len(expenses)
            average_transaction = total_spent / transaction_count if transaction_count > 0 else 0
            
            # Category breakdown
            category_totals = {}
            for expense in expenses:
                category = expense.category
                if category not in category_totals:
                    category_totals[category] = 0
                category_totals[category] += float(expense.amount)
            
            # Sort categories by amount
            sorted_categories = sorted(
                category_totals.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            # Get user's budget (assuming it's stored somewhere, for now using a default)
            monthly_budget = getattr(user, 'monthly_budget', 2000.0)  # Default budget
            
            # Calculate budget metrics
            budget_remaining = monthly_budget - total_spent
            budget_used_percentage = (total_spent / monthly_budget * 100) if monthly_budget > 0 else 0
            savings_rate = ((monthly_budget - total_spent) / monthly_budget * 100) if monthly_budget > 0 else 0
            
            # Get top expenses
            top_expenses = sorted(
                expenses,
                key=lambda x: float(x.amount),
                reverse=True
            )[:5]  # Top 5 expenses
            
            # Generate insights
            insights = self._generate_insights(expenses, category_totals, total_spent, monthly_budget)
            
            # Get month name
            month_name = datetime(year, month, 1).strftime("%B")
            
            # Detect budget alerts
            budget_alert = None
            if budget_used_percentage >= 90:
                budget_alert = f"You've used {budget_used_percentage:.1f}% of your monthly budget!"
            elif budget_used_percentage >= 100:
                overspend = total_spent - monthly_budget
                budget_alert = f"You've exceeded your budget by {currency}{overspend:.2f}!"
            
            # Prepare user data for template
            user_data = {
                "user_name": user.username,
                "report_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            month_data = {
                "month_name": month_name,
                "year": year,
                "total_spent": f"{total_spent:.2f}",
                "budget_remaining": f"{budget_remaining:.2f}",
                "savings_rate": f"{savings_rate:.1f}",
                "transaction_count": transaction_count,
                "average_transaction": f"{average_transaction:.2f}",
                "budget_used_percentage": f"{budget_used_percentage:.1f}",
                "categories": [
                    {"name": cat, "amount": f"{amt:.2f}"}
                    for cat, amt in sorted_categories[:10]  # Top 10 categories
                ],
                "top_expenses": [
                    {
                        "category": exp.category,
                        "amount": f"{float(exp.amount):.2f}",
                        "date": exp.date.strftime("%Y-%m-%d") if exp.date else "N/A"
                    }
                    for exp in top_expenses
                ],
                "insights": insights,
                "budget_alert": budget_alert
            }
            
            logger.info(f"Generated monthly report for user {user_id}, {year}-{month}")
            
            return {
                "user_data": user_data,
                "month_data": month_data,
                "summary": {
                    "total_spent": total_spent,
                    "transaction_count": transaction_count,
                    "budget_remaining": budget_remaining,
                    "savings_rate": savings_rate,
                    "budget_used_percentage": budget_used_percentage
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating monthly report: {str(e)}")
            raise
    
    def _generate_empty_report(self, user: User, year: int, month: int, currency: str) -> Dict[str, Any]:
        """Generate report for month with no expenses."""
        month_name = datetime(year, month, 1).strftime("%B")
        
        user_data = {
            "user_name": user.username,
            "report_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        month_data = {
            "month_name": month_name,
            "year": year,
            "total_spent": "0.00",
            "budget_remaining": "0.00",
            "savings_rate": "100.0",
            "transaction_count": 0,
            "average_transaction": "0.00",
            "budget_used_percentage": "0.0",
            "categories": [],
            "top_expenses": [],
            "insights": "No expenses recorded this month. Start tracking your spending to see insights!",
            "budget_alert": None
        }
        
        return {
            "user_data": user_data,
            "month_data": month_data,
            "summary": {
                "total_spent": 0,
                "transaction_count": 0,
                "budget_remaining": getattr(user, 'monthly_budget', 2000.0),
                "savings_rate": 100.0,
                "budget_used_percentage": 0.0
            }
        }
    
    def _generate_insights(
        self,
        expenses: List[Expense],
        category_totals: Dict[str, float],
        total_spent: float,
        budget: float
    ) -> str:
        """Generate AI-powered insights from expense data."""
        insights = []
        
        # Top category insight
        if category_totals:
            top_category = max(category_totals.items(), key=lambda x: x[1])
            insights.append(f"🏆 Your highest spending category is <strong>{top_category[0]}</strong> at {top_category[1]:.2f}")
        
        # Spending frequency insight
        if len(expenses) > 0:
            days_with_expenses = len(set(exp.date for exp in expenses if exp.date))
            total_days_in_month = 30  # Approximate
            spending_frequency = (days_with_expenses / total_days_in_month) * 100
            if spending_frequency > 70:
                insights.append(f"📅 You're spending on <strong>{days_with_expenses}</strong> different days this month")
        
        # Budget insight
        if budget > 0:
            budget_usage = (total_spent / budget) * 100
            if budget_usage > 80:
                insights.append(f"⚠️ You've used <strong>{budget_usage:.1f}%</strong> of your monthly budget")
            elif budget_usage < 50:
                insights.append(f"✅ Great job! You've only used <strong>{budget_usage:.1f}%</strong> of your budget")
        
        # Average transaction insight
        if len(expenses) > 0:
            avg_transaction = total_spent / len(expenses)
            if avg_transaction > 100:
                insights.append(f"💳 Your average transaction is <strong>{avg_transaction:.2f}</strong> - consider reviewing large purchases")
        
        # Weekend spending insight
        weekend_spending = 0
        weekday_spending = 0
        for expense in expenses:
            if expense.date:
                if expense.date.weekday() >= 5:  # Friday, Saturday, Sunday
                    weekend_spending += float(expense.amount)
                else:
                    weekday_spending += float(expense.amount)
        
        if weekend_spending > weekday_spending * 1.5:
            insights.append(f"🎉 Your weekend spending is <strong>{((weekend_spending/weekday_spending-1)*100):.0f}%</strong> higher than weekdays")
        
        return "<br>".join(insights) if insights else "No specific insights available for this month."

class ReportScheduler:
    """Service for scheduling and sending automated reports."""
    
    def __init__(self):
        pass
    
    async def send_monthly_report(
        self,
        db: Session,
        user_id: int,
        year: int = None,
        month: int = None,
        currency: str = "$"
    ) -> Dict[str, Any]:
        """
        Send monthly report via email.
        
        Args:
            db: Database session
            user_id: User ID
            year: Year (defaults to current year)
            month: Month (defaults to previous month)
            currency: Currency symbol
            
        Returns:
            Dictionary with send status
        """
        try:
            # Default to previous month if not specified
            if year is None or month is None:
                now = datetime.now()
                if month is None:
                    month = now.month - 1
                    if month == 0:
                        month = 12
                        year = now.year - 1
                    else:
                        year = now.year
                else:
                    year = now.year
            
            # Generate report
            report_service = MonthlyReportService()
            report_data = report_service.generate_monthly_report(db, user_id, year, month, currency)
            
            # Generate email content
            email_content = email_template_service.generate_monthly_report(
                report_data["user_data"],
                report_data["month_data"],
                currency
            )
            
            # Get user email
            user = db.query(User).filter(User.id == user_id).first()
            if not user or not user.email:
                return {
                    "success": False,
                    "error": "User email not found"
                }
            
            # Send email
            email_result = await email_service.send_email(
                to_emails=[user.email],
                subject=f"Monthly Expense Report - {report_data['month_data']['month_name']} {report_data['month_data']['year']}",
                html_content=email_content["html"],
                text_content=email_content["text"]
            )
            
            # Combine results
            result = {
                "success": email_result.get("success", False),
                "report_generated": True,
                "report_data": report_data,
                "email_sent": email_result.get("success", False),
                "email_error": email_result.get("error"),
                "month": report_data["month_data"]["month_name"],
                "year": report_data["month_data"]["year"]
            }
            
            if email_result.get("success"):
                logger.info(f"Monthly report sent to user {user_id} for {year}-{month}")
            else:
                logger.error(f"Failed to send monthly report: {email_result.get('error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending monthly report: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def send_budget_alert(
        self,
        db: Session,
        user_id: int,
        overspend_amount: float,
        currency: str = "$"
    ) -> Dict[str, Any]:
        """
        Send immediate budget alert email.
        
        Args:
            db: Database session
            user_id: User ID
            overspend_amount: Amount over budget
            currency: Currency symbol
            
        Returns:
            Dictionary with send status
        """
        try:
            # Get user info
            user = db.query(User).filter(User.id == user_id).first()
            if not user or not user.email:
                return {
                    "success": False,
                    "error": "User email not found"
                }
            
            # Generate budget alert email
            email_content = email_template_service.generate_budget_alert(
                user.username,
                overspend_amount,
                currency
            )
            
            # Send email
            email_result = await email_service.send_email(
                to_emails=[user.email],
                subject=f"⚠️ Budget Alert - Expense Tracker",
                html_content=email_content["html"],
                text_content=email_content["text"]
            )
            
            result = {
                "success": email_result.get("success", False),
                "alert_sent": email_result.get("success", False),
                "email_error": email_result.get("error"),
                "overspend_amount": overspend_amount
            }
            
            if email_result.get("success"):
                logger.info(f"Budget alert sent to user {user_id}")
            else:
                logger.error(f"Failed to send budget alert: {email_result.get('error')}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending budget alert: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

# Global service instances
monthly_report_service = MonthlyReportService()
report_scheduler = ReportScheduler()
