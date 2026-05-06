"""
AI Insights Router for AI Expense Tracker
Handles AI-powered financial insights and recommendations
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from database import get_database, Collections
from routers.auth import get_current_user
from utils.response_handler import ResponseHandler

# Create router
router = APIRouter()


@router.post("/analyze")
async def analyze_spending(
    period: str = Query("monthly", description="Analysis period"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Analyze user's spending patterns using AI
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
        
        # Get expenses for analysis
        expense_query = {
            "user_id": user_id,
            "date": {"$gte": start_date, "$lte": now},
            "transaction_type": "expense"
        }
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query)
        expenses = []
        async for expense in expense_cursor:
            expenses.append(expense)
        
        # Perform AI analysis (simplified - in real implementation would use ML models)
        analysis_results = {
            "spending_patterns": analyze_spending_patterns(expenses),
            "anomalies": detect_spending_anomalies(expenses),
            "recommendations": generate_spending_recommendations(expenses),
            "predictions": predict_future_spending(expenses),
            "financial_health_score": calculate_financial_health_score(expenses)
        }
        
        return ResponseHandler.success(
            data=analysis_results,
            message="Spending analysis completed successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to analyze spending: {str(e)}")


@router.get("/recommendations")
async def get_recommendations(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get personalized financial recommendations
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user's recent expenses and budgets
        expense_query = {"user_id": user_id, "transaction_type": "expense"}
        budget_query = {"user_id": user_id, "is_active": True}
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query).sort("date", DESCENDING).limit(100)
        budget_cursor = database[Collections.BUDGETS].find(budget_query)
        
        expenses = []
        budgets = []
        async for expense in expense_cursor:
            expenses.append(expense)
        async for budget in budget_cursor:
            budgets.append(budget)
        
        # Generate recommendations
        recommendations = generate_smart_recommendations(expenses, budgets)
        
        return ResponseHandler.success(
            data=recommendations,
            message="Recommendations generated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get recommendations: {str(e)}")


@router.get("/anomalies")
async def detect_anomalies(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Detect spending anomalies and unusual transactions
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get recent expenses
        expense_query = {"user_id": user_id, "transaction_type": "expense"}
        expense_cursor = database[Collections.EXPENSES].find(expense_query).sort("date", DESCENDING).limit(200)
        
        expenses = []
        async for expense in expense_cursor:
            expenses.append(expense)
        
        # Detect anomalies
        anomalies = detect_spending_anomalies(expenses)
        
        return ResponseHandler.success(
            data=anomalies,
            message="Anomaly detection completed successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to detect anomalies: {str(e)}")


@router.get("/predictions")
async def get_predictions(
    period: str = Query("monthly", description="Prediction period"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get AI-powered spending predictions
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get historical spending data
        expense_query = {"user_id": user_id, "transaction_type": "expense"}
        expense_cursor = database[Collections.EXPENSES].find(expense_query).sort("date", DESCENDING).limit(365)
        
        expenses = []
        async for expense in expense_cursor:
            expenses.append(expense)
        
        # Generate predictions
        predictions = predict_future_spending(expenses, period)
        
        return ResponseHandler.success(
            data=predictions,
            message="Predictions generated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get predictions: {str(e)}")


@router.get("/insights")
async def get_insights(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get comprehensive AI insights
    """
    try:
        user_id = str(current_user["_id"])
        
        # Get user's financial data
        expense_query = {"user_id": user_id}
        budget_query = {"user_id": user_id, "is_active": True}
        
        expense_cursor = database[Collections.EXPENSES].find(expense_query).sort("date", DESCENDING).limit(365)
        budget_cursor = database[Collections.BUDGETS].find(budget_query)
        
        expenses = []
        budgets = []
        async for expense in expense_cursor:
            expenses.append(expense)
        async for budget in budget_cursor:
            budgets.append(budget)
        
        # Generate comprehensive insights
        insights = {
            "spending_patterns": analyze_spending_patterns(expenses),
            "behavioral_insights": analyze_financial_behavior(expenses),
            "savings_opportunities": identify_savings_opportunities(expenses, budgets),
            "risk_assessment": assess_financial_risks(expenses, budgets),
            "optimization_suggestions": generate_optimization_suggestions(expenses, budgets)
        }
        
        return ResponseHandler.success(
            data=insights,
            message="AI insights generated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get insights: {str(e)}")


# Helper functions for AI analysis
def analyze_spending_patterns(expenses: List[Dict]) -> Dict[str, Any]:
    """Analyze spending patterns"""
    if not expenses:
        return {"patterns": [], "insights": []}
    
    # Group by category
    category_patterns = {}
    for expense in expenses:
        category = expense["category"]
        if category not in category_patterns:
            category_patterns[category] = []
        category_patterns[category].append(expense["amount"])
    
    patterns = []
    for category, amounts in category_patterns.items():
        avg_amount = sum(amounts) / len(amounts)
        patterns.append({
            "category": category,
            "average": avg_amount,
            "frequency": len(amounts),
            "trend": "stable"  # Simplified - would analyze trend
        })
    
    return {
        "patterns": patterns,
        "insights": [
            f"You have {len(patterns)} spending categories",
            f"Most frequent category: {max(patterns, key=lambda x: x['frequency'])['category'] if patterns else 'None'}"
        ]
    }


def detect_spending_anomalies(expenses: List[Dict]) -> List[Dict]:
    """Detect spending anomalies"""
    anomalies = []
    
    if not expenses:
        return anomalies
    
    # Calculate average amounts by category
    category_averages = {}
    for expense in expenses:
        category = expense["category"]
        if category not in category_averages:
            category_averages[category] = []
        category_averages[category].append(expense["amount"])
    
    # Calculate averages
    for category in category_averages:
        amounts = category_averages[category]
        category_averages[category] = sum(amounts) / len(amounts)
    
    # Find anomalies (amounts significantly different from average)
    for expense in expenses[-20:]:  # Check recent expenses
        category = expense["category"]
        avg_amount = category_averages.get(category, 0)
        
        if avg_amount > 0:
            deviation = abs(expense["amount"] - avg_amount) / avg_amount
            if deviation > 0.5:  # 50% deviation from average
                anomalies.append({
                    "expense_id": str(expense["_id"]),
                    "title": expense["title"],
                    "amount": expense["amount"],
                    "category": category,
                    "average_amount": avg_amount,
                    "deviation": deviation,
                    "severity": "high" if deviation > 1.0 else "medium",
                    "description": f"Unusual spending in {category} category"
                })
    
    return anomalies


def generate_spending_recommendations(expenses: List[Dict]) -> List[Dict]:
    """Generate spending recommendations"""
    recommendations = []
    
    if not expenses:
        return recommendations
    
    # Category analysis
    category_totals = {}
    for expense in expenses:
        category = expense["category"]
        if category not in category_totals:
            category_totals[category] = 0
        category_totals[category] += expense["amount"]
    
    total_spending = sum(category_totals.values())
    
    # Generate recommendations based on spending patterns
    for category, amount in category_totals.items():
        percentage = (amount / total_spending) * 100
        
        if percentage > 30:
            recommendations.append({
                "type": "budget_alert",
                "title": f"High spending in {category}",
                "description": f"You're spending {percentage:.1f}% of your budget on {category}",
                "priority": "high",
                "action": f"Consider setting a lower budget limit for {category}"
            })
        elif percentage > 20:
            recommendations.append({
                "type": "spending_review",
                "title": f"Review {category} spending",
                "description": f"{category} accounts for {percentage:.1f}% of your spending",
                "priority": "medium",
                "action": f"Look for ways to reduce {category} expenses"
            })
    
    return recommendations


def predict_future_spending(expenses: List[Dict], period: str = "monthly") -> List[Dict]:
    """Predict future spending"""
    predictions = []
    
    if not expenses:
        return predictions
    
    # Simple prediction based on historical averages
    category_predictions = {}
    
    for expense in expenses:
        category = expense["category"]
        if category not in category_predictions:
            category_predictions[category] = []
        category_predictions[category].append(expense["amount"])
    
    for category, amounts in category_predictions.items():
        avg_amount = sum(amounts) / len(amounts)
        
        # Adjust for period
        if period == "weekly":
            predicted_amount = avg_amount * 0.25  # Rough weekly estimate
        elif period == "quarterly":
            predicted_amount = avg_amount * 3
        elif period == "yearly":
            predicted_amount = avg_amount * 12
        else:  # monthly
            predicted_amount = avg_amount
        
        predictions.append({
            "category": category,
            "predicted_amount": predicted_amount,
            "confidence": 75,  # Simplified confidence score
            "trend": "stable",
            "factors": ["Historical spending patterns", "Seasonal trends"]
        })
    
    return predictions


def calculate_financial_health_score(expenses: List[Dict]) -> float:
    """Calculate financial health score"""
    if not expenses:
        return 50.0
    
    # Simplified scoring based on spending patterns
    total_spending = sum(exp["amount"] for exp in expenses)
    avg_transaction = total_spending / len(expenses)
    
    # Score factors (simplified)
    diversity_score = min(100, len(set(exp["category"] for exp in expenses)) * 10)
    consistency_score = max(0, 100 - (avg_transaction / 100))  # Lower average transactions = higher score
    
    overall_score = (diversity_score + consistency_score) / 2
    return round(overall_score, 1)


def generate_smart_recommendations(expenses: List[Dict], budgets: List[Dict]) -> List[Dict]:
    """Generate smart recommendations"""
    recommendations = []
    
    # Analyze budget performance
    for budget in budgets:
        utilization = (budget["spent_amount"] / budget["allocated_amount"]) * 100 if budget["allocated_amount"] > 0 else 0
        
        if utilization > 90:
            recommendations.append({
                "type": "budget_warning",
                "title": f"Budget alert for {budget['category']}",
                "description": f"You've used {utilization:.1f}% of your {budget['category']} budget",
                "priority": "high",
                "potential_savings": budget["allocated_amount"] - budget["spent_amount"],
                "action_items": [
                    "Review recent transactions in this category",
                    "Consider postponing non-essential purchases",
                    "Look for cheaper alternatives"
                ]
            })
    
    return recommendations


def analyze_financial_behavior(expenses: List[Dict]) -> Dict[str, Any]:
    """Analyze financial behavior"""
    if not expenses:
        return {"insights": [], "patterns": []}
    
    # Analyze spending frequency and patterns
    daily_spending = {}
    for expense in expenses:
        date_str = expense["date"].strftime("%Y-%m-%d") if isinstance(expense["date"], datetime) else str(expense["date"])
        if date_str not in daily_spending:
            daily_spending[date_str] = 0
        daily_spending[date_str] += expense["amount"]
    
    avg_daily_spending = sum(daily_spending.values()) / len(daily_spending)
    
    return {
        "insights": [
            f"Average daily spending: ${avg_daily_spending:.2f}",
            f"Most active spending day: {max(daily_spending.keys(), key=lambda k: daily_spending[k]) if daily_spending else 'None'}",
            f"Spending consistency: {'High' if len(daily_spending) > 20 else 'Low'}"
        ],
        "patterns": [
            {"type": "daily_average", "value": avg_daily_spending},
            {"type": "spending_frequency", "value": len(daily_spending)}
        ]
    }


def identify_savings_opportunities(expenses: List[Dict], budgets: List[Dict]) -> List[Dict]:
    """Identify savings opportunities"""
    opportunities = []
    
    # Look for high-frequency spending categories
    category_frequency = {}
    for expense in expenses:
        category = expense["category"]
        if category not in category_frequency:
            category_frequency[category] = 0
        category_frequency[category] += 1
    
    for category, frequency in category_frequency.items():
        if frequency > 10:
            opportunities.append({
                "type": "frequency_optimization",
                "category": category,
                "description": f"High frequency spending in {category}",
                "potential_savings": "Review and consolidate purchases",
                "priority": "medium"
            })
    
    return opportunities


def assess_financial_risks(expenses: List[Dict], budgets: List[Dict]) -> Dict[str, Any]:
    """Assess financial risks"""
    risks = {
        "overall_risk": "low",
        "risk_factors": [],
        "recommendations": []
    }
    
    # Check for over-budget categories
    over_budget_count = 0
    for budget in budgets:
        if budget["utilization_percentage"] > 100:
            over_budget_count += 1
    
    if over_budget_count > 2:
        risks["overall_risk"] = "high"
        risks["risk_factors"].append("Multiple categories over budget")
    elif over_budget_count > 0:
        risks["overall_risk"] = "medium"
        risks["risk_factors"].append("Some categories over budget")
    
    return risks


def generate_optimization_suggestions(expenses: List[Dict], budgets: List[Dict]) -> List[Dict]:
    """Generate optimization suggestions"""
    suggestions = []
    
    # Suggest budget adjustments
    for budget in budgets:
        if budget["utilization_percentage"] < 50:
            suggestions.append({
                "type": "budget_optimization",
                "category": budget["category"],
                "suggestion": f"Consider reducing {budget['category']} budget allocation",
                "reason": f"Current utilization is only {budget['utilization_percentage']:.1f}%",
                "priority": "low"
            })
    
    return suggestions


# Export for use in other modules
__all__ = ["router"]
