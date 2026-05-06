"""
Expenses Router for AI Expense Tracker
Handles expense CRUD operations and management
"""

from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from database import get_database, Collections
from schemas.expense_schema import (
    ExpenseCreate, ExpenseUpdate, ExpenseResponse, ExpenseFilter, 
    ExpenseStats, ExpenseBulkCreate, ExpenseBulkUpdate
)
from routers.auth import get_current_user
from utils.response_handler import ResponseHandler

# Create router
router = APIRouter()


@router.post("/", response_model=ExpenseResponse)
async def create_expense(
    expense_data: ExpenseCreate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new expense
    """
    try:
        # Override user_id with current user ID
        expense_doc = expense_data.dict()
        expense_doc["user_id"] = str(current_user["_id"])
        expense_doc["created_at"] = datetime.utcnow()
        expense_doc["updated_at"] = datetime.utcnow()
        
        # Insert expense into database
        result = await database[Collections.EXPENSES].insert_one(expense_doc)
        expense_id = str(result.inserted_id)
        
        # Get created expense
        created_expense = await database[Collections.EXPENSES].find_one({"_id": ObjectId(expense_id)})
        created_expense["_id"] = expense_id
        
        return ResponseHandler.created(
            data=ExpenseResponse(**created_expense),
            message="Expense created successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to create expense: {str(e)}")


@router.get("/", response_model=List[ExpenseResponse])
async def get_expenses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    start_date: Optional[date] = Query(None, description="Filter by start date"),
    end_date: Optional[date] = Query(None, description="Filter by end date"),
    search: Optional[str] = Query(None, description="Search in title and notes"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get user's expenses with filtering and pagination
    """
    try:
        # Build query
        query = {"user_id": str(current_user["_id"])}
        
        # Add filters
        if category:
            query["category"] = category
        
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query["$gte"] = datetime.combine(start_date, datetime.min.time())
            if end_date:
                date_query["$lte"] = datetime.combine(end_date, datetime.max.time())
            query["date"] = date_query
        
        if search:
            query["$or"] = [
                {"title": {"$regex": search, "$options": "i"}},
                {"notes": {"$regex": search, "$options": "i"}},
                {"merchant": {"$regex": search, "$options": "i"}}
            ]
        
        # Get total count
        total = await database[Collections.EXPENSES].count_documents(query)
        
        # Get expenses with pagination
        skip = (page - 1) * page_size
        cursor = database[Collections.EXPENSES].find(query).sort("created_at", DESCENDING).skip(skip).limit(page_size)
        
        expenses = []
        async for expense in cursor:
            expense["_id"] = str(expense["_id"])
            expenses.append(ExpenseResponse(**expense))
        
        return ResponseHandler.paginated(
            data=expenses,
            page=page,
            page_size=page_size,
            total=total,
            message="Expenses retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get expenses: {str(e)}")


@router.get("/{expense_id}", response_model=ExpenseResponse)
async def get_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific expense by ID
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(expense_id):
            return ResponseHandler.error(
                message="Invalid expense ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get expense
        expense = await database[Collections.EXPENSES].find_one({
            "_id": ObjectId(expense_id),
            "user_id": str(current_user["_id"])
        })
        
        if not expense:
            return ResponseHandler.not_found("Expense")
        
        expense["_id"] = expense_id
        return ResponseHandler.success(
            data=ExpenseResponse(**expense),
            message="Expense retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get expense: {str(e)}")


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    expense_data: ExpenseUpdate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update an existing expense
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(expense_id):
            return ResponseHandler.error(
                message="Invalid expense ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if expense exists and belongs to user
        existing_expense = await database[Collections.EXPENSES].find_one({
            "_id": ObjectId(expense_id),
            "user_id": str(current_user["_id"])
        })
        
        if not existing_expense:
            return ResponseHandler.not_found("Expense")
        
        # Prepare update data
        update_data = expense_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update expense
        await database[Collections.EXPENSES].update_one(
            {"_id": ObjectId(expense_id)},
            {"$set": update_data}
        )
        
        # Get updated expense
        updated_expense = await database[Collections.EXPENSES].find_one({"_id": ObjectId(expense_id)})
        updated_expense["_id"] = expense_id
        
        return ResponseHandler.success(
            data=ExpenseResponse(**updated_expense),
            message="Expense updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update expense: {str(e)}")


@router.delete("/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete an expense
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(expense_id):
            return ResponseHandler.error(
                message="Invalid expense ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if expense exists and belongs to user
        existing_expense = await database[Collections.EXPENSES].find_one({
            "_id": ObjectId(expense_id),
            "user_id": str(current_user["_id"])
        })
        
        if not existing_expense:
            return ResponseHandler.not_found("Expense")
        
        # Delete expense
        await database[Collections.EXPENSES].delete_one({"_id": ObjectId(expense_id)})
        
        return ResponseHandler.success(
            message="Expense deleted successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to delete expense: {str(e)}")


@router.get("/stats/summary", response_model=ExpenseStats)
async def get_expense_stats(
    start_date: Optional[date] = Query(None, description="Start date for stats"),
    end_date: Optional[date] = Query(None, description="End date for stats"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get expense statistics and analytics
    """
    try:
        # Build query
        query = {"user_id": str(current_user["_id"])}
        
        if start_date or end_date:
            date_query = {}
            if start_date:
                date_query["$gte"] = datetime.combine(start_date, datetime.min.time())
            if end_date:
                date_query["$lte"] = datetime.combine(end_date, datetime.max.time())
            query["date"] = date_query
        
        # Get all expenses for the period
        cursor = database[Collections.EXPENSES].find(query)
        expenses = []
        async for expense in cursor:
            expenses.append(expense)
        
        # Calculate statistics
        total_expenses = sum(exp["amount"] for exp in expenses if exp["transaction_type"] == "expense")
        total_income = sum(exp["amount"] for exp in expenses if exp["transaction_type"] == "income")
        net_amount = total_income - total_expenses
        
        expense_count = len([exp for exp in expenses if exp["transaction_type"] == "expense"])
        income_count = len([exp for exp in expenses if exp["transaction_type"] == "income"])
        
        average_expense = total_expenses / expense_count if expense_count > 0 else 0
        average_income = total_income / income_count if income_count > 0 else 0
        
        # Category statistics
        category_stats = {}
        for exp in expenses:
            category = exp["category"]
            if category not in category_stats:
                category_stats[category] = {
                    "total": 0,
                    "count": 0,
                    "average": 0,
                    "type": exp["transaction_type"]
                }
            category_stats[category]["total"] += exp["amount"]
            category_stats[category]["count"] += 1
        
        # Calculate averages
        for category in category_stats:
            category_stats[category]["average"] = (
                category_stats[category]["total"] / category_stats[category]["count"]
            )
        
        # Payment method statistics
        payment_method_stats = {}
        for exp in expenses:
            method = exp["payment_method"]
            if method not in payment_method_stats:
                payment_method_stats[method] = 0
            payment_method_stats[method] += exp["amount"]
        
        # Monthly trend (simplified)
        monthly_trend = []
        # TODO: Implement proper monthly trend calculation
        
        stats = ExpenseStats(
            total_expenses=total_expenses,
            total_income=total_income,
            net_amount=net_amount,
            expense_count=expense_count,
            income_count=income_count,
            average_expense=average_expense,
            average_income=average_income,
            category_stats=category_stats,
            payment_method_stats=payment_method_stats,
            monthly_trend=monthly_trend
        )
        
        return ResponseHandler.success(
            data=stats,
            message="Expense statistics retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get expense stats: {str(e)}")


@router.post("/bulk", response_model=List[ExpenseResponse])
async def create_bulk_expenses(
    bulk_data: ExpenseBulkCreate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create multiple expenses at once
    """
    try:
        # Prepare expense documents
        expense_docs = []
        for expense_data in bulk_data.expenses:
            expense_doc = expense_data.dict()
            expense_doc["user_id"] = str(current_user["_id"])
            expense_doc["created_at"] = datetime.utcnow()
            expense_doc["updated_at"] = datetime.utcnow()
            expense_docs.append(expense_doc)
        
        # Insert expenses
        result = await database[Collections.EXPENSES].insert_many(expense_docs)
        
        # Get created expenses
        expense_ids = [str(oid) for oid in result.inserted_ids]
        cursor = database[Collections.EXPENSES].find({"_id": {"$in": [ObjectId(oid) for oid in expense_ids]}})
        
        expenses = []
        async for expense in cursor:
            expense["_id"] = str(expense["_id"])
            expenses.append(ExpenseResponse(**expense))
        
        return ResponseHandler.created(
            data=expenses,
            message=f"Successfully created {len(expenses)} expenses"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to create bulk expenses: {str(e)}")


@router.put("/bulk", response_model=List[ExpenseResponse])
async def update_bulk_expenses(
    bulk_data: ExpenseBulkUpdate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update multiple expenses at once
    """
    try:
        # Prepare update data
        update_data = bulk_data.updates.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Convert expense IDs to ObjectIds
        expense_object_ids = [ObjectId(eid) for eid in bulk_data.expense_ids]
        
        # Update expenses
        result = await database[Collections.EXPENSES].update_many(
            {
                "_id": {"$in": expense_object_ids},
                "user_id": str(current_user["_id"])
            },
            {"$set": update_data}
        )
        
        # Get updated expenses
        cursor = database[Collections.EXPENSES].find({"_id": {"$in": expense_object_ids}})
        
        expenses = []
        async for expense in cursor:
            expense["_id"] = str(expense["_id"])
            expenses.append(ExpenseResponse(**expense))
        
        return ResponseHandler.success(
            data=expenses,
            message=f"Successfully updated {len(expenses)} expenses"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update bulk expenses: {str(e)}")


# Export for use in other modules
__all__ = ["router"]
