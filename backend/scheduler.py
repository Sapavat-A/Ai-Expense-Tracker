import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session

from database_config import get_db
from models import User
from report_service import report_scheduler

logger = logging.getLogger(__name__)

class EmailReportScheduler:
    """Background task scheduler for email reports."""
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_running = False
        
    async def start(self):
        """Start the scheduler."""
        try:
            if not self.is_running:
                self.scheduler.start()
                self.is_running = True
                logger.info("Email report scheduler started")
                
                # Schedule monthly reports for all users
                await self._schedule_monthly_reports()
                
                # Schedule budget monitoring (daily check)
                await self._schedule_budget_monitoring()
                
        except Exception as e:
            logger.error(f"Error starting scheduler: {str(e)}")
            raise
    
    async def stop(self):
        """Stop the scheduler."""
        try:
            if self.is_running:
                self.scheduler.shutdown()
                self.is_running = False
                logger.info("Email report scheduler stopped")
        except Exception as e:
            logger.error(f"Error stopping scheduler: {str(e)}")
    
    async def _schedule_monthly_reports(self):
        """Schedule monthly reports for all users with enabled email reports."""
        try:
            # Get all users with email reports enabled
            db = next(get_db())
            users = db.query(User).filter(User.email_reports_enabled == True).all()
            db.close()
            
            for user in users:
                # Schedule based on user preference
                if user.report_frequency == "monthly":
                    # Schedule for 1st of every month at 9 AM
                    cron_expression = f"0 9 1 {user.report_day or 1} * *"
                    self.scheduler.add_job(
                        func=self._send_user_monthly_report,
                        trigger=CronTrigger.from_crontab(cron_expression),
                        args=[user.id],
                        id=f"monthly_report_{user.id}",
                        replace_existing=True
                    )
                    logger.info(f"Scheduled monthly report for user {user.id} on day {user.report_day or 1}")
                
                elif user.report_frequency == "weekly":
                    # Schedule for every Monday at 9 AM
                    self.scheduler.add_job(
                        func=self._send_user_weekly_report,
                        trigger=CronTrigger.from_crontab("0 9 * * 1"),
                        args=[user.id],
                        id=f"weekly_report_{user.id}",
                        replace_existing=True
                    )
                    logger.info(f"Scheduled weekly report for user {user.id}")
                
                elif user.report_frequency == "biweekly":
                    # Schedule for 1st and 15th at 9 AM
                    for day in [1, 15]:
                        cron_expression = f"0 9 {day} * *"
                        self.scheduler.add_job(
                            func=self._send_user_monthly_report,
                            trigger=CronTrigger.from_crontab(cron_expression),
                            args=[user.id],
                            id=f"biweekly_report_{user.id}_{day}",
                            replace_existing=True
                        )
                    logger.info(f"Scheduled biweekly report for user {user.id}")
                        
        except Exception as e:
            logger.error(f"Error scheduling monthly reports: {str(e)}")
    
    async def _schedule_budget_monitoring(self):
        """Schedule daily budget monitoring."""
        try:
            # Schedule budget check for every day at 6 PM
            self.scheduler.add_job(
                func=self._check_all_users_budgets,
                trigger=CronTrigger.from_crontab("0 18 * * *"),
                id="budget_monitoring",
                replace_existing=True
            )
            logger.info("Scheduled daily budget monitoring at 6 PM")
            
        except Exception as e:
            logger.error(f"Error scheduling budget monitoring: {str(e)}")
    
    async def _send_user_monthly_report(self, user_id: int):
        """Send monthly report for a specific user."""
        try:
            db = next(get_db())
            
            # Get current date to determine which month to report
            now = datetime.now()
            
            # If it's the first few days of the month, report previous month
            if now.day <= 5:
                # Report previous month
                if now.month == 1:
                    report_year = now.year - 1
                    report_month = 12
                else:
                    report_year = now.year
                    report_month = now.month - 1
            else:
                # Report current month
                report_year = now.year
                report_month = now.month
            
            result = await report_scheduler.send_monthly_report(
                db=db,
                user_id=user_id,
                year=report_year,
                month=report_month
            )
            
            if result.get("success"):
                logger.info(f"Monthly report sent successfully for user {user_id}")
            else:
                logger.error(f"Failed to send monthly report for user {user_id}: {result.get('error')}")
                
            db.close()
            
        except Exception as e:
            logger.error(f"Error sending user monthly report: {str(e)}")
    
    async def _send_user_weekly_report(self, user_id: int):
        """Send weekly report for a specific user."""
        try:
            db = next(get_db())
            
            # Get last week's data
            now = datetime.now()
            week_start = now - timedelta(days=7)
            
            # Get expenses from last week
            from database_config import Base, engine
            from models import Expense
            Base.metadata.bind = engine
            
            expenses = db.query(Expense).filter(
                Expense.user_id == user_id,
                Expense.date >= week_start,
                Expense.date < now
            ).all()
            
            if not expenses:
                logger.info(f"No expenses found for weekly report for user {user_id}")
                db.close()
                return
            
            # Generate simple weekly summary
            total_spent = sum(float(exp.amount) for exp in expenses)
            transaction_count = len(expenses)
            
            # Get user info
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                db.close()
                return
            
            # Send simple weekly report (could be enhanced with templates)
            from email_service import email_service, email_template_service
            
            user_data = {
                "user_name": user.username,
                "report_date": now.strftime("%Y-%m-%d %H:%M:%S")
            }
            
            week_data = {
                "total_spent": f"{total_spent:.2f}",
                "transaction_count": transaction_count,
                "period": f"Week of {now.strftime('%Y-%m-%d')}"
            }
            
            # Simple weekly email content
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
                <h2>💰 Weekly Expense Report</h2>
                <p>Hi {user.username},</p>
                <p>Here's your spending summary for this week:</p>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                    <p><strong>Total Spent:</strong> ${total_spent:.2f}</p>
                    <p><strong>Transactions:</strong> {transaction_count}</p>
                </div>
                <p>Keep tracking your expenses to stay on budget!</p>
            </body>
            </html>
            """
            
            result = await email_service.send_email(
                to_emails=[user.email],
                subject=f"Weekly Expense Report - {now.strftime('%Y-%m-%d')}",
                html_content=html_content,
                text_content=f"Weekly Expense Report - Total: ${total_spent:.2f}, Transactions: {transaction_count}"
            )
            
            if result.get("success"):
                logger.info(f"Weekly report sent successfully for user {user_id}")
            else:
                logger.error(f"Failed to send weekly report for user {user_id}: {result.get('error')}")
                
            db.close()
            
        except Exception as e:
            logger.error(f"Error sending user weekly report: {str(e)}")
    
    async def _check_all_users_budgets(self):
        """Check all users' budgets and send alerts if needed."""
        try:
            db = next(get_db())
            
            # Get all users with budget alerts enabled
            users = db.query(User).filter(
                User.budget_alerts_enabled == True,
                User.monthly_budget.isnot(None)
            ).all()
            
            for user in users:
                # Calculate current month spending
                now = datetime.now()
                start_date = datetime(now.year, now.month, 1)
                if now.month == 12:
                    end_date = datetime(now.year + 1, 1, 1) - timedelta(seconds=1)
                else:
                    end_date = datetime(now.year, now.month + 1, 1) - timedelta(seconds=1)
                
                # Get expenses for current month
                expenses = db.query(Expense).filter(
                    Expense.user_id == user.id,
                    Expense.date >= start_date,
                    Expense.date < end_date
                ).all()
                
                total_spent = sum(float(exp.amount) for exp in expenses)
                budget = float(user.monthly_budget)
                
                # Check if over budget
                if total_spent > budget:
                    overspend = total_spent - budget
                    await report_scheduler.send_budget_alert(
                        db=db,
                        user_id=user.id,
                        overspend_amount=overspend
                    )
                elif total_spent > budget * 0.9:  # 90% warning
                    # Send warning email (could be enhanced)
                    logger.info(f"Budget warning for user {user_id}: {total_spent:.2f} / {budget:.2f}")
            
            db.close()
            
        except Exception as e:
            logger.error(f"Error checking user budgets: {str(e)}")
    
    def get_scheduler_status(self) -> Dict[str, Any]:
        """Get current scheduler status."""
        jobs = []
        for job in self.scheduler.get_jobs():
            jobs.append({
                "id": job.id,
                "name": job.name,
                "next_run": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger)
            })
        
        return {
            "running": self.is_running,
            "job_count": len(jobs),
            "jobs": jobs
        }

# Global scheduler instance
email_scheduler = EmailReportScheduler()
