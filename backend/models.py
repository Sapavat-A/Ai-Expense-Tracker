from sqlalchemy import Column, Date, Float, Integer, String, Boolean, Text, DateTime
from sqlalchemy.orm import relationship

from database_config import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Email preferences
    monthly_budget = Column(Float, nullable=True, default=2000.0)
    email_reports_enabled = Column(Boolean, default=True, nullable=False)
    budget_alerts_enabled = Column(Boolean, default=True, nullable=False)
    report_day = Column(Integer, default=1, nullable=False)  # Day of month to send report (1st)
    report_frequency = Column(String, default="monthly", nullable=False)  # monthly, weekly, biweekly
    
    expenses = relationship("Expense", back_populates="owner")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, nullable=False)
    
    # Anomaly detection fields
    is_anomaly = Column(Boolean, default=False, nullable=False)
    anomaly_type = Column(String, nullable=True)  # high_amount, category_spike, duplicate, etc.
    anomaly_score = Column(Float, nullable=True)  # Z-score or other metric
    anomaly_severity = Column(String, nullable=True)  # low, medium, high, critical
    anomaly_description = Column(Text, nullable=True)  # Human-readable explanation
    anomaly_detected_at = Column(DateTime, nullable=True)  # When anomaly was detected
    
    owner = relationship("User", back_populates="expenses")
