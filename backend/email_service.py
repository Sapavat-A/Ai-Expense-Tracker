import os
import logging
import smtplib
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from jinja2 import Template
import aiosmtplib
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

class EmailService:
    """Email service supporting both SMTP and Resend API."""
    
    def __init__(self):
        self.email_provider = os.getenv("EMAIL_PROVIDER", "smtp").lower()
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.smtp_use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
        self.resend_api_key = os.getenv("RESEND_API_KEY", "")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        
    def is_configured(self) -> bool:
        """Check if email service is properly configured."""
        if self.email_provider == "resend":
            return bool(self.resend_api_key and self.from_email)
        else:
            return bool(self.smtp_username and self.smtp_password and self.from_email)
    
    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Send email using configured provider.
        
        Args:
            to_emails: List of recipient email addresses
            subject: Email subject
            html_content: HTML email content
            text_content: Plain text fallback content
            attachments: List of attachments with filename and content
            
        Returns:
            Dictionary with send status and details
        """
        try:
            if self.email_provider == "resend":
                return await self._send_via_resend(to_emails, subject, html_content, text_content, attachments)
            else:
                return await self._send_via_smtp(to_emails, subject, html_content, text_content, attachments)
        except Exception as e:
            logger.error(f"Email send error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "provider": self.email_provider
            }
    
    async def _send_via_resend(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str],
        attachments: Optional[List[Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """Send email using Resend API."""
        try:
            import resend
            
            resend.api_key = self.resend_api_key
            
            # Prepare email parameters
            params = {
                "from": self.from_email,
                "to": to_emails,
                "subject": subject,
                "html": html_content,
            }
            
            if text_content:
                params["text"] = text_content
            
            # Send email
            r = resend.Emails.send(params)
            
            logger.info(f"Email sent via Resend: {r.id}")
            return {
                "success": True,
                "message_id": r.id,
                "provider": "resend"
            }
            
        except ImportError:
            logger.error("Resend not installed. Install with: pip install resend")
            return {
                "success": False,
                "error": "Resend package not installed",
                "provider": "resend"
            }
        except Exception as e:
            logger.error(f"Resend API error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "provider": "resend"
            }
    
    async def _send_via_smtp(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str],
        attachments: Optional[List[Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """Send email using SMTP."""
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = self.from_email
            message["To"] = ", ".join(to_emails)
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, "plain", "utf-8")
                message.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, "html", "utf-8")
            message.attach(html_part)
            
            # Add attachments
            if attachments:
                for attachment in attachments:
                    part = MIMEBase64("application", "octet-stream")
                    part.set_payload(attachment["content"])
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f'attachment; filename="{attachment["filename"]}"'
                    )
                    message.attach(part)
            
            # Send email
            with aiosmtplib.SMTP(
                hostname=self.smtp_server,
                port=self.smtp_port,
                use_tls=self.smtp_use_tls
            ) as server:
                await server.starttls()
                await server.login(self.smtp_username, self.smtp_password)
                await server.send_message(message)
                await server.quit()
            
            logger.info(f"Email sent via SMTP to {', '.join(to_emails)}")
            return {
                "success": True,
                "provider": "smtp"
            }
            
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "provider": "smtp"
            }

class EmailTemplateService:
    """Service for generating email templates."""
    
    @staticmethod
    def generate_monthly_report(
        user_data: Dict[str, Any],
        month_data: Dict[str, Any],
        currency: str = "$"
    ) -> Dict[str, str]:
        """Generate monthly report email content."""
        
        # HTML Template
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Monthly Expense Report - {{ month_name }} {{ year }}</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 10px; }
                .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e9ecef; }
                .logo { font-size: 24px; font-weight: bold; color: #4CAF50; }
                .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .summary-item { background: white; padding: 15px; border-radius: 8px; text-align: center; }
                .summary-amount { font-size: 24px; font-weight: bold; color: #2196F3; }
                .summary-label { font-size: 14px; color: #666; margin-bottom: 5px; }
                .alert { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 18px; font-weight: bold; color: #2196F3; margin-bottom: 15px; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; }
                .category-list { list-style: none; padding: 0; }
                .category-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e9ecef; }
                .category-name { font-weight: 500; }
                .category-amount { font-weight: bold; color: #2196F3; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center; font-size: 12px; color: #666; }
                .positive { color: #4CAF50; }
                .negative { color: #f44336; }
                .neutral { color: #ff9800; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">💰 Expense Tracker</div>
                    <h1>Monthly Report - {{ month_name }} {{ year }}</h1>
                    <p>Hi {{ user_name }}, here's your spending summary for {{ month_name }} {{ year }}</p>
                </div>
                
                {% if budget_alert %}
                <div class="alert">
                    <strong>🚨 Budget Alert:</strong> {{ budget_alert }}
                </div>
                {% endif %}
                
                <div class="summary">
                    <div class="summary-item">
                        <div class="summary-label">Total Spent</div>
                        <div class="summary-amount">{{ currency }}{{ total_spent }}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Budget Status</div>
                        <div class="summary-amount {% if budget_remaining > 0 %}positive{% else %}negative{% endif %}">
                            {{ currency }}{{ budget_remaining }}
                        </div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Savings Rate</div>
                        <div class="summary-amount {% if savings_rate > 80 %}positive{% else %}neutral{% endif %}">
                            {{ savings_rate }}%
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="section-title">📊 Spending by Category</h2>
                    <ul class="category-list">
                        {% for category in categories %}
                        <li class="category-item">
                            <span class="category-name">{{ category.name }}</span>
                            <span class="category-amount">{{ currency }}{{ category.amount }}</span>
                        </li>
                        {% endfor %}
                    </ul>
                </div>
                
                {% if top_expenses %}
                <div class="section">
                    <h2 class="section-title">💳 Top Expenses</h2>
                    <ul class="category-list">
                        {% for expense in top_expenses %}
                        <li class="category-item">
                            <span>{{ expense.category }} - {{ expense.date }}</span>
                            <span class="category-amount">{{ currency }}{{ expense.amount }}</span>
                        </li>
                        {% endfor %}
                    </ul>
                </div>
                {% endif %}
                
                {% if insights %}
                <div class="section">
                    <h2 class="section-title">🧠 AI Insights</h2>
                    <div style="background: white; padding: 15px; border-radius: 8px;">
                        {{ insights | safe }}
                    </div>
                </div>
                {% endif %}
                
                <div class="footer">
                    <p>This report was generated on {{ report_date }}.</p>
                    <p>💡 Tip: Review your spending patterns regularly to stay on track with your financial goals!</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Text template for fallback
        text_template = """
        Monthly Expense Report - {{ month_name }} {{ year }}
        
        Hi {{ user_name }},
        
        Here's your spending summary for {{ month_name }} {{ year }}:
        
        Total Spent: {{ currency }}{{ total_spent }}
        Budget Remaining: {{ currency }}{{ budget_remaining }}
        Savings Rate: {{ savings_rate }}%
        
        {% if budget_alert %}
        Budget Alert: {{ budget_alert }}
        {% endif %}
        
        Top Categories:
        {% for category in categories %}
        - {{ category.name }}: {{ currency }}{{ category.amount }}
        {% endfor %}
        
        {% if insights %}
        AI Insights:
        {{ insights }}
        {% endif %}
        
        Report generated on: {{ report_date }}
        """
        
        # Render templates
        template = Template(html_template)
        text_template_obj = Template(text_template)
        
        return {
            "html": template.render(**user_data, **month_data, currency=currency),
            "text": text_template_obj.render(**user_data, **month_data, currency=currency)
        }
    
    @staticmethod
    def generate_budget_alert(
        user_name: str,
        overspend_amount: float,
        currency: str = "$"
    ) -> Dict[str, str]:
        """Generate budget alert email content."""
        
        html_template = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>⚠️ Budget Alert - Expense Tracker</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #fff3cd; border: 1px solid #ffeaa7; padding: 30px; border-radius: 10px; }
                .alert-icon { font-size: 48px; text-align: center; margin-bottom: 20px; }
                .message { font-size: 18px; text-align: center; margin-bottom: 30px; }
                .amount { font-size: 32px; font-weight: bold; color: #d32f2f; text-align: center; }
                .cta { text-align: center; margin-top: 30px; }
                .btn { background: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="alert-icon">⚠️</div>
                <div class="message">
                    Hi {{ user_name }},<br><br>
                    You've exceeded your monthly budget!
                </div>
                <div class="amount">
                    {{ currency }}{{ overspend_amount }}
                </div>
                <div class="cta">
                    <a href="#" class="btn">Review Your Expenses</a>
                </div>
            </div>
        </body>
        </html>
        """
        
        template = Template(html_template)
        
        return {
            "html": template.render(
                user_name=user_name,
                overspend_amount=overspend_amount,
                currency=currency
            ),
            "text": f"Budget Alert: Hi {user_name}, You've exceeded your monthly budget by {currency}{overspend_amount:.2f}!"
        }

# Global email service instance
email_service = EmailService()
email_template_service = EmailTemplateService()
