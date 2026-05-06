import logging
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from auth import get_current_active_user
from database_config import get_db
from models import User
from report_service import report_scheduler
from email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/email-reports", tags=["Email Reports"])

# Pydantic models for request/response
class EmailPreferencesUpdate(BaseModel):
    email_reports_enabled: Optional[bool] = None
    budget_alerts_enabled: Optional[bool] = None
    monthly_budget: Optional[float] = None
    report_day: Optional[int] = None
    report_frequency: Optional[str] = None

class SendReportRequest(BaseModel):
    year: Optional[int] = None
    month: Optional[int] = None

class SendTestEmailRequest(BaseModel):
    to_email: EmailStr

@router.get("/preferences")
async def get_email_preferences(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get user's email preferences."""
    return {
        "email_reports_enabled": current_user.email_reports_enabled,
        "budget_alerts_enabled": current_user.budget_alerts_enabled,
        "monthly_budget": current_user.monthly_budget,
        "report_day": current_user.report_day,
        "report_frequency": current_user.report_frequency,
        "email": current_user.email
    }

@router.put("/preferences")
async def update_email_preferences(
    preferences: EmailPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Update user's email preferences."""
    try:
        # Update user preferences
        if preferences.email_reports_enabled is not None:
            current_user.email_reports_enabled = preferences.email_reports_enabled
        if preferences.budget_alerts_enabled is not None:
            current_user.budget_alerts_enabled = preferences.budget_alerts_enabled
        if preferences.monthly_budget is not None:
            current_user.monthly_budget = preferences.monthly_budget
        if preferences.report_day is not None:
            current_user.report_day = preferences.report_day
        if preferences.report_frequency is not None:
            if preferences.report_frequency in ["monthly", "weekly", "biweekly"]:
                current_user.report_frequency = preferences.report_frequency
        
        db.commit()
        
        # Reschedule reports if frequency changed
        if preferences.report_frequency is not None or preferences.report_day is not None:
            # Restart scheduler to apply new schedule
            await email_scheduler.stop()
            await email_scheduler.start()
        
        logger.info(f"Updated email preferences for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Email preferences updated successfully",
            "preferences": {
                "email_reports_enabled": current_user.email_reports_enabled,
                "budget_alerts_enabled": current_user.budget_alerts_enabled,
                "monthly_budget": current_user.monthly_budget,
                "report_day": current_user.report_day,
                "report_frequency": current_user.report_frequency,
                "email": current_user.email
            }
        }
        
    except Exception as e:
        logger.error(f"Error updating email preferences: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update email preferences: {str(e)}"
        )

@router.post("/send-report")
async def send_manual_report(
    request: SendReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Manually send a monthly report."""
    try:
        if not current_user.email_reports_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email reports are disabled for this user"
            )
        
        result = await report_scheduler.send_monthly_report(
            db=db,
            user_id=current_user.id,
            year=request.year,
            month=request.month
        )
        
        return {
            "success": result.get("success", False),
            "message": "Report sent successfully" if result.get("success") else result.get("error"),
            "report_data": result.get("report_data") if result.get("success") else None,
            "email_sent": result.get("email_sent", False),
            "email_error": result.get("email_error")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending manual report: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send report: {str(e)}"
        )

@router.post("/send-budget-alert")
async def send_manual_budget_alert(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Manually send a budget alert (for testing)."""
    try:
        if not current_user.budget_alerts_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Budget alerts are disabled for this user"
            )
        
        # Calculate current month spending and budget status
        from datetime import datetime, timedelta
        
        now = datetime.now()
        start_date = datetime(now.year, now.month, 1)
        if now.month == 12:
            end_date = datetime(now.year + 1, 1, 1) - timedelta(seconds=1)
        else:
            end_date = datetime(now.year, now.month + 1, 1) - timedelta(seconds=1)
        
        # Get expenses for current month
        from models import Expense
        expenses = db.query(Expense).filter(
            Expense.user_id == current_user.id,
            Expense.date >= start_date,
            Expense.date < end_date
        ).all()
        
        total_spent = sum(float(exp.amount) for exp in expenses)
        budget = float(current_user.monthly_budget or 2000.0)
        
        if total_spent > budget:
            overspend = total_spent - budget
            result = await report_scheduler.send_budget_alert(
                db=db,
                user_id=current_user.id,
                overspend_amount=overspend
            )
        else:
            result = {"success": False, "error": "Budget not exceeded"}
        
        return {
            "success": result.get("success", False),
            "message": result.get("message"),
            "alert_sent": result.get("alert_sent", False),
            "budget_status": {
                "total_spent": total_spent,
                "budget": budget,
                "remaining": budget - total_spent,
                "percentage_used": (total_spent / budget * 100) if budget > 0 else 0
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending manual budget alert: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send budget alert: {str(e)}"
        )

@router.post("/test-email")
async def send_test_email(
    request: SendTestEmailRequest,
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Send a test email to verify email configuration."""
    try:
        # Check if email service is configured
        if not email_service.is_configured():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email service is not configured"
            )
        
        # Generate test email content
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
            <h2>🧪 Email Test</h2>
            <p>Hi {current_user.username},</p>
            <p>This is a test email to verify your email configuration is working correctly.</p>
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
                <p><strong>Email Provider:</strong> {email_service.email_provider}</p>
                <p><strong>Sent To:</strong> {request.to_email}</p>
                <p><strong>Sent At:</strong> {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
            </div>
            <p>✅ If you received this email, your email configuration is working!</p>
        </body>
        </html>
        """
        
        text_content = f"Email Test - This is a test email sent to {request.to_email} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
        
        # Send test email
        result = await email_service.send_email(
            to_emails=[request.to_email],
            subject="🧪 Email Test - Expense Tracker",
            html_content=html_content,
            text_content=text_content
        )
        
        return {
            "success": result.get("success", False),
            "message": "Test email sent successfully" if result.get("success") else result.get("error"),
            "email_sent": result.get("success", False),
            "email_error": result.get("email_error"),
            "provider": result.get("provider"),
            "sent_to": request.to_email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test email: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test email: {str(e)}"
        )

@router.get("/scheduler-status")
async def get_scheduler_status(
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """Get email scheduler status."""
    try:
        status = email_scheduler.get_scheduler_status()
        
        # Add user-specific information
        user_status = {
            "email_reports_enabled": current_user.email_reports_enabled,
            "budget_alerts_enabled": current_user.budget_alerts_enabled,
            "report_frequency": current_user.report_frequency,
            "report_day": current_user.report_day,
            "next_report_date": self._calculate_next_report_date(current_user)
        }
        
        return {
            "scheduler": status,
            "user_preferences": user_status
        }
        
    except Exception as e:
        logger.error(f"Error getting scheduler status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get scheduler status: {str(e)}"
        )

def _calculate_next_report_date(user: User) -> str:
    """Calculate the next report date for a user."""
    from datetime import datetime, timedelta
    
    now = datetime.now()
    
    if user.report_frequency == "weekly":
        # Next Monday
        days_until_monday = (7 - now.weekday()) % 7
        if days_until_monday == 0:
            next_date = now + timedelta(days=7)
        else:
            next_date = now + timedelta(days=days_until_monday)
    elif user.report_frequency == "biweekly":
        # Next 1st or 15th
        if now.day <= user.report_day or 1:
            if now.month == 12:
                next_date = datetime(now.year + 1, 1, user.report_day or 1)
            else:
                next_date = datetime(now.year, now.month, user.report_day or 1)
        else:
            # Next 15th
            if now.month == 12:
                next_date = datetime(now.year + 1, 1, 15)
            else:
                next_date = datetime(now.year, now.month, 15)
    else:  # monthly
        if now.day <= user.report_day or 1:
            if now.month == 12:
                next_date = datetime(now.year + 1, 1, user.report_day or 1)
            else:
                next_date = datetime(now.year, now.month, user.report_day or 1)
        else:
            # Next month 1st
            if now.month == 12:
                next_date = datetime(now.year + 1, 1, 1)
            else:
                next_date = datetime(now.year, now.month + 1, 1)
    
    return next_date.strftime("%Y-%m-%d")
