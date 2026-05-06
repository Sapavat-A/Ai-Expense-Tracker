# Monthly Email Report System

This guide explains the comprehensive email report system for your Expense Tracker application.

## 🚀 Quick Start

### For SMTP (Gmail/Outlook)
```bash
# Update .env file
EMAIL_PROVIDER=smtp
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_USE_TLS=true
FROM_EMAIL=your_email@gmail.com

# Restart application
python main.py
```

### For Resend API
```bash
# Update .env file
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com

# Restart application
python main.py
```

## 📋 Features Overview

### **Automated Monthly Reports**
- **Scheduled delivery** on user-defined day each month
- **Comprehensive spending analysis** with AI insights
- **Category breakdowns** and top expenses
- **Budget status** and savings rate calculation
- **Beautiful HTML templates** with responsive design

### **Budget Alerts**
- **Real-time monitoring** of budget usage
- **Automatic alerts** when budget exceeded
- **Warning notifications** at 90% threshold
- **Customizable alerting** per user preference

### **Flexible Scheduling**
- **Monthly reports** (default: 1st of each month)
- **Weekly reports** (every Monday)
- **Bi-weekly reports** (1st and 15th)
- **Custom report day** selection

### **Email Provider Support**
- **SMTP support** (Gmail, Outlook, custom servers)
- **Resend API** for professional email delivery
- **TLS/SSL security** for SMTP connections
- **Fallback mechanisms** for failed deliveries

## 🔧 Configuration

### **Environment Variables**

```bash
# Email Provider Selection
EMAIL_PROVIDER=smtp              # Options: smtp, resend

# SMTP Configuration (for EMAIL_PROVIDER=smtp)
SMTP_SERVER=smtp.gmail.com         # Gmail: smtp.gmail.com
SMTP_PORT=587                    # Gmail: 587, Outlook: 587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password      # Use App Password for Gmail
SMTP_USE_TLS=true                  # Enable TLS encryption
FROM_EMAIL=your_email@gmail.com

# Resend Configuration (for EMAIL_PROVIDER=resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxx   # Get from Resend dashboard
FROM_EMAIL=noreply@yourdomain.com
```

### **Gmail Setup Instructions**

1. **Enable 2-Step Verification**:
   - Go to Google Account settings
   - Enable 2-Step Verification

2. **Create App Password**:
   - Go to App Passwords section
   - Generate new app password
   - Use app password instead of regular password

3. **Configure Environment**:
   ```bash
   SMTP_USERNAME=your_email@gmail.com
   SMTP_PASSWORD=your_16_character_app_password
   ```

### **Outlook Setup Instructions**

1. **Use SMTP Settings**:
   ```bash
   SMTP_SERVER=smtp.office365.com
   SMTP_PORT=587
   SMTP_USERNAME=your_email@outlook.com
   SMTP_PASSWORD=your_outlook_password
   ```

## 📊 Email Templates

### **Monthly Report Template**
- **Responsive design** for mobile and desktop
- **Interactive charts** and visual indicators
- **Category breakdowns** with spending percentages
- **AI-powered insights** and recommendations
- **Budget status** with color-coded alerts
- **Top expenses** with dates and amounts

### **Budget Alert Template**
- **Immediate notification** when budget exceeded
- **Overspend amount** with clear formatting
- **Call-to-action** buttons for expense review
- **Professional styling** with warning indicators

### **Test Email Template**
- **Configuration verification** emails
- **Service status** and provider information
- **Timestamps** and delivery confirmation

## 🛠 API Endpoints

### **Email Preferences Management**
```http
GET  /email-reports/preferences
PUT  /email-reports/preferences
```

**Response Format**:
```json
{
  "email_reports_enabled": true,
  "budget_alerts_enabled": true,
  "monthly_budget": 2000.0,
  "report_day": 1,
  "report_frequency": "monthly",
  "email": "user@example.com"
}
```

### **Manual Report Generation**
```http
POST /email-reports/send-report
```

**Request Body**:
```json
{
  "year": 2024,
  "month": 12
}
```

### **Budget Alerts**
```http
POST /email-reports/send-budget-alert
```

### **Email Testing**
```http
POST /email-reports/send-test-email
```

**Request Body**:
```json
{
  "to_email": "test@example.com"
}
```

### **Scheduler Status**
```http
GET /email-reports/scheduler-status
```

## 🔄 Background Scheduler

### **Cron Job Scheduling**
- **Monthly reports**: `0 9 1 * *` (9 AM on 1st of month)
- **Weekly reports**: `0 9 * * 1` (9 AM every Monday)
- **Bi-weekly reports**: `0 9 1,15 * *` (9 AM on 1st and 15th)
- **Budget monitoring**: `0 18 * * *` (6 PM daily)

### **Scheduler Features**
- **Automatic restart** on configuration changes
- **Job persistence** across application restarts
- **Error handling** and retry mechanisms
- **Logging** and monitoring capabilities

## 📈 Report Analytics

### **Monthly Report Data**
- **Total spending** for the period
- **Transaction count** and average amounts
- **Category breakdowns** with percentages
- **Top 5 expenses** with dates
- **Budget utilization** and remaining amounts
- **Savings rate** calculation
- **AI-generated insights** based on patterns

### **Budget Alert Data**
- **Current month spending**
- **Budget threshold** comparison
- **Overspend amount** calculation
- **Percentage usage** metrics

## 🎯 User Preferences

### **Email Report Settings**
- **Enable/disable** email reports
- **Choose frequency** (monthly, weekly, biweekly)
- **Set report day** (1-31 for monthly)
- **Configure budget alerts**
- **Set monthly budget** amount

### **Preference Storage**
- **Database persistence** of user preferences
- **Real-time updates** via API
- **Scheduler rescheduling** on preference changes

## 🛡 Security Considerations

### **SMTP Security**
- **TLS encryption** for all connections
- **App passwords** instead of regular passwords
- **Connection timeouts** and retry logic
- **Credential validation** before sending

### **API Security**
- **JWT authentication** for all endpoints
- **Email validation** for test emails
- **Rate limiting** for email sending
- **Input sanitization** and validation

### **Data Privacy**
- **User-specific data** only
- **No email sharing** between users
- **Secure credential storage** in environment variables
- **GDPR compliance** for email communications

## 🔍 Troubleshooting

### **Common Issues**

**SMTP Connection Failed**:
```bash
# Check credentials
python -c "import smtplib; print('SMTP test')"

# Verify app password for Gmail
# Check firewall/port access
```

**Email Not Sending**:
```bash
# Check environment variables
echo $EMAIL_PROVIDER
echo $SMTP_USERNAME

# Test email service
python -c "from email_service import email_service; print(email_service.is_configured())"
```

**Scheduler Not Working**:
```bash
# Check scheduler status
curl http://localhost:8000/email-reports/scheduler-status

# Review application logs
tail -f application.log
```

### **Debug Mode**
Enable detailed logging:
```bash
# Set environment variable
DB_ECHO=true

# Check application logs
python main.py
```

## 📚 Integration Examples

### **Frontend Integration**
```javascript
// Get email preferences
const response = await fetch('/api/email-reports/preferences', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// Update preferences
await fetch('/api/email-reports/preferences', {
  method: 'PUT',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    email_reports_enabled: true,
    monthly_budget: 2000,
    report_frequency: 'monthly'
  })
});

// Send test email
await fetch('/api/email-reports/send-test-email', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({
    to_email: 'user@example.com'
  })
});
```

### **React Component Example**
```jsx
function EmailSettings() {
  const [preferences, setPreferences] = useState({});
  
  const updatePreferences = async (newPrefs) => {
    try {
      const response = await api.put('/email-reports/preferences', newPrefs);
      setPreferences(response.data);
      showToast('Email preferences updated', 'success');
    } catch (error) {
      showToast('Failed to update preferences', 'error');
    }
  };
  
  return (
    <div className="email-settings">
      <h2>Email Report Settings</h2>
      
      <label>
        <input
          type="checkbox"
          checked={preferences.email_reports_enabled}
          onChange={(e) => updatePreferences({
            email_reports_enabled: e.target.checked
          })}
        />
        Enable Monthly Reports
      </label>
      
      <label>
        Report Frequency:
        <select
          value={preferences.report_frequency}
          onChange={(e) => updatePreferences({
            report_frequency: e.target.value
          })}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Bi-weekly</option>
        </select>
      </label>
      
      <button onClick={() => sendTestEmail()}>
        Send Test Email
      </button>
    </div>
  );
}
```

## 🚀 Production Deployment

### **Environment Configuration**
```bash
# Production .env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_live_xxxxxxxxxxxxxx
FROM_EMAIL=noreply@yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@db:5432/expense_tracker

# Security
SECRET_KEY=your_production_secret_key
```

### **Docker Configuration**
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

### **Monitoring and Logging**
- **Email delivery metrics** tracking
- **Scheduler job status** monitoring
- **Error rate** and alerting
- **Performance metrics** collection

## 📞 Support and Maintenance

### **Regular Maintenance Tasks**
- **Monitor email delivery rates**
- **Check scheduler job execution**
- **Update email templates** as needed
- **Review user preferences** and feedback
- **Backup email configurations**

### **Performance Optimization**
- **Batch email sending** for multiple users
- **Connection pooling** for SMTP
- **Template caching** for faster rendering
- **Queue management** for high-volume sending

## 🎯 Next Steps

After implementing the email report system:

1. ✅ **Configure email provider** (SMTP or Resend)
2. ✅ **Set up user preferences** in database
3. ✅ **Test email delivery** with test endpoint
4. ✅ **Verify scheduler** is running correctly
5. ✅ **Monitor email reports** delivery
6. ✅ **Gather user feedback** on report usefulness
7. ✅ **Optimize templates** based on engagement
8. ✅ **Scale for multiple users** and high volume

The Monthly Email Report system provides comprehensive financial insights delivered directly to users' inboxes, helping them stay on top of their spending habits and budget goals.
