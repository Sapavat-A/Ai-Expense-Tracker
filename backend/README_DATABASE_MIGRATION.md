# Database Migration: SQLite to PostgreSQL

This guide explains how to migrate your Expense Tracker from SQLite to PostgreSQL for production use.

## 🚀 Quick Start

### For Development (SQLite)
```bash
# Use the existing .env file with SQLite
DATABASE_URL=sqlite:///./expenses.db
python main.py
```

### For Production (PostgreSQL)
```bash
# Install PostgreSQL dependencies
pip install psycopg2-binary

# Set up PostgreSQL database
createdb expense_tracker

# Update .env file
DATABASE_URL=postgresql://postgres:password@localhost:5432/expense_tracker
```

## 📋 Prerequisites

### PostgreSQL Setup
1. **Install PostgreSQL**:
   ```bash
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   
   # macOS
   brew install postgresql
   
   # Linux (Ubuntu/Debian)
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

2. **Start PostgreSQL Service**:
   ```bash
   # Windows (as Administrator)
   net start postgresql-x64-15
   
   # macOS
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

3. **Create Database and User**:
   ```bash
   # Connect to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE expense_tracker;
   
   # Create user (optional, can use default postgres user)
   CREATE USER expense_user WITH PASSWORD 'your_secure_password';
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO expense_user;
   ```

## 🔧 Configuration

### Environment Variables

Create or update your `.env` file:

```bash
# PostgreSQL (Production)
DATABASE_URL=postgresql://expense_user:your_secure_password@localhost:5432/expense_tracker

# SQLite (Development)
# DATABASE_URL=sqlite:///./expenses.db

# Database Settings
DB_ECHO=false  # Set to true for SQL query logging
```

### Connection URL Formats

**PostgreSQL**:
```
postgresql://username:password@host:port/database_name
```

**SQLite**:
```
sqlite:///path/to/database.db
```

## 📁 Database Schema

The application uses SQLAlchemy ORM, so the database schema is automatically created. Tables include:

- `users` - User authentication and profiles
- `expenses` - Expense records with anomaly detection fields
- **Anomaly fields**:
  - `is_anomaly` - Boolean flag for anomalous transactions
  - `anomaly_type` - Type classification (high_amount, category_spike, etc.)
  - `anomaly_score` - Statistical severity score
  - `anomaly_severity` - Severity level (low, medium, high, critical)
  - `anomaly_description` - Human-readable explanation
  - `anomaly_detected_at` - Detection timestamp

## 🔄 Migration Steps

### Option 1: Fresh Start (Recommended)
1. **Set up PostgreSQL database** (see Prerequisites)
2. **Configure environment variables** in `.env`
3. **Start the application**:
   ```bash
   python main.py
   ```
4. **Tables are created automatically** on first run

### Option 2: Data Migration (Advanced)
If you need to migrate existing SQLite data to PostgreSQL:

1. **Export SQLite data**:
   ```bash
   sqlite3 expenses.db .dump > data.sql
   ```

2. **Convert to PostgreSQL format** (manual conversion may be needed):
   ```bash
   # Create a conversion script or use tools like pgloader
   pgloader sqlite://expenses.db postgresql://user:pass@localhost/expense_tracker
   ```

3. **Import to PostgreSQL**:
   ```bash
   psql -U postgres -d expense_tracker < converted_data.sql
   ```

## 🛠 Troubleshooting

### Common Issues

**Connection Refused**:
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql      # macOS
net start postgresql-x64-15      # Windows
```

**Authentication Error**:
```bash
# Check PostgreSQL configuration
# pg_hba.conf should allow your connection method
# Default: local connections use 'peer' or 'md5'
```

**Module Not Found**:
```bash
# Install missing dependencies
pip install psycopg2-binary sqlalchemy
```

### Database Connection Test

You can test the database connection:

```python
from database_config import test_database_connection
success, message = test_database_connection()
print(f"Connection test: {success} - {message}")
```

## 🔒 Security Considerations

1. **Use strong passwords** for PostgreSQL users
2. **Restrict network access** in `postgresql.conf`
3. **Use SSL connections** for production
4. **Regular backups** of PostgreSQL database
5. **Environment variables** should not be committed to version control

## 📊 Performance Benefits

**PostgreSQL vs SQLite**:
- ✅ **Better concurrency** handling
- ✅ **Advanced indexing** options
- ✅ **Full-text search** capabilities
- ✅ **Stored procedures** and functions
- ✅ **Better memory management**
- ✅ **Replication support** for scaling
- ✅ **Professional backup tools**

## 🚀 Production Deployment

### Docker (Optional)
```dockerfile
FROM python:3.9
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

### Environment Variables for Production
```bash
# PostgreSQL Production
DATABASE_URL=postgresql://user:password@db-server:5432/expense_tracker
DB_ECHO=false
SECRET_KEY=your-production-secret-key
```

## 📞 Support

If you encounter issues:

1. Check PostgreSQL logs: `tail -f /var/log/postgresql/postgresql.log`
2. Verify connection string format
3. Test with simple connection script
4. Ensure all dependencies are installed

## 🎯 Next Steps

After migration:
1. ✅ Test all API endpoints
2. ✅ Verify anomaly detection works
3. ✅ Check AI chat functionality
4. ✅ Test receipt scanning
5. ✅ Monitor database performance
6. ✅ Set up regular backups
