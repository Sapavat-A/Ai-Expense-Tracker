"""
Budgets Router for AI Expense Tracker
Handles budget CRUD operations and management
"""

from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, Query, HTTPException, status
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from database import get_database, Collections
from schemas.budget_schema import (
    BudgetCreate, BudgetUpdate, BudgetResponse, BudgetFilter, 
    BudgetStats, BudgetBulkCreate, BudgetSummary
)
from routers.auth import get_current_user
from utils.response_handler import ResponseHandler

# Create router
router = APIRouter()


@router.post("/", response_model=BudgetResponse)
async def create_budget(
    budget_data: BudgetCreate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create a new budget
    """
    try:
        # Override user_id with current user ID
        budget_doc = budget_data.dict()
        budget_doc["user_id"] = str(current_user["_id"])
        budget_doc["spent_amount"] = 0.0
        budget_doc["remaining_amount"] = budget_doc["allocated_amount"]
        budget_doc["utilization_percentage"] = 0.0
        budget_doc["is_active"] = True
        budget_doc["created_at"] = datetime.utcnow()
        budget_doc["updated_at"] = datetime.utcnow()
        
        # Insert budget into database
        result = await database[Collections.BUDGETS].insert_one(budget_doc)
        budget_id = str(result.inserted_id)
        
        # Get created budget
        created_budget = await database[Collections.BUDGETS].find_one({"_id": ObjectId(budget_id)})
        created_budget["_id"] = budget_id
        
        return ResponseHandler.created(
            data=BudgetResponse(**created_budget),
            message="Budget created successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to create budget: {str(e)}")


@router.get("/", response_model=List[BudgetResponse])
async def get_budgets(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: Optional[str] = Query(None, description="Filter by category"),
    period: Optional[str] = Query(None, description="Filter by period"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get user's budgets with filtering and pagination
    """
    try:
        # Build query
        query = {"user_id": str(current_user["_id"])}
        
        # Add filters
        if category:
            query["category"] = category
        
        if period:
            query["period"] = period
        
        if is_active is not None:
            query["is_active"] = is_active
        
        # Get total count
        total = await database[Collections.BUDGETS].count_documents(query)
        
        # Get budgets with pagination
        skip = (page - 1) * page_size
        cursor = database[Collections.BUDGETS].find(query).sort("created_at", DESCENDING).skip(skip).limit(page_size)
        
        budgets = []
        async for budget in cursor:
            budget["_id"] = str(budget["_id"])
            budgets.append(BudgetResponse(**budget))
        
        return ResponseHandler.paginated(
            data=budgets,
            page=page,
            page_size=page_size,
            total=total,
            message="Budgets retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get budgets: {str(e)}")


@router.get("/{budget_id}", response_model=BudgetResponse)
async def get_budget(
    budget_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a specific budget by ID
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(budget_id):
            return ResponseHandler.error(
                message="Invalid budget ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get budget
        budget = await database[Collections.BUDGETS].find_one({
            "_id": ObjectId(budget_id),
            "user_id": str(current_user["_id"])
        })
        
        if not budget:
            return ResponseHandler.not_found("Budget")
        
        budget["_id"] = budget_id
        return ResponseHandler.success(
            data=BudgetResponse(**budget),
            message="Budget retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get budget: {str(e)}")


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    budget_data: BudgetUpdate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update an existing budget
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(budget_id):
            return ResponseHandler.error(
                message="Invalid budget ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if budget exists and belongs to user
        existing_budget = await database[Collections.BUDGETS].find_one({
            "_id": ObjectId(budget_id),
            "user_id": str(current_user["_id"])
        })
        
        if not existing_budget:
            return ResponseHandler.not_found("Budget")
        
        # Prepare update data
        update_data = budget_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update budget
        await database[Collections.BUDGETS].update_one(
            {"_id": ObjectId(budget_id)},
            {"$set": update_data}
        )
        
        # Get updated budget
        updated_budget = await database[Collections.BUDGETS].find_one({"_id": ObjectId(budget_id)})
        updated_budget["_id"] = budget_id
        
        return ResponseHandler.success(
            data=BudgetResponse(**updated_budget),
            message="Budget updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update budget: {str(e)}")


@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: str,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete a budget
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(budget_id):
            return ResponseHandler.error(
                message="Invalid budget ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if budget exists and belongs to user
        existing_budget = await database[Collections.BUDGETS].find_one({
            "_id": ObjectId(budget_id),
            "user_id": str(current_user["_id"])
        })
        
        if not existing_budget:
            return ResponseHandler.not_found("Budget")
        
        # Delete budget
        await database[Collections.BUDGETS].delete_one({"_id": ObjectId(budget_id)})
        
        return ResponseHandler.success(
            message="Budget deleted successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to delete budget: {str(e)}")


@router.get("/stats/summary", response_model=BudgetStats)
async def get_budget_stats(
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get budget statistics and analytics
    """
    try:
        # Get all budgets for the user
        cursor = database[Collections.BUDGETS].find({"user_id": str(current_user["_id"])})
        budgets = []
        async for budget in cursor:
            budgets.append(budget)
        
        # Calculate statistics
        total_allocated = sum(budget["allocated_amount"] for budget in budgets if budget["is_active"])
        total_spent = sum(budget["spent_amount"] for budget in budgets if budget["is_active"])
        total_remaining = total_allocated - total_spent
        average_utilization = (total_spent / total_allocated * 100) if total_allocated > 0 else 0
        active_budgets = len([b for b in budgets if b["is_active"]])
        
        # Count over-budget categories
        over_budget_count = len([b for b in budgets if b["utilization_percentage"] > 100])
        
        # Category breakdown
        category_breakdown = {}
        for budget in budgets:
            category = budget["category"]
            if category not in category_breakdown:
                category_breakdown[category] = {
                    "allocated": 0,
                    "spent": 0,
                    "remaining": 0,
                    "utilization": 0
                }
            category_breakdown[category]["allocated"] += budget["allocated_amount"]
            category_breakdown[category]["spent"] += budget["spent_amount"]
            category_breakdown[category]["remaining"] += budget["remaining_amount"]
        
        # Calculate category utilization
        for category in category_breakdown:
            allocated = category_breakdown[category]["allocated"]
            spent = category_breakdown[category]["spent"]
            category_breakdown[category]["utilization"] = (spent / allocated * 100) if allocated > 0 else 0
        
        # Identify over and under budget categories
        over_budget_categories = [cat for cat, data in category_breakdown.items() if data["utilization"] > 100]
        under_budget_categories = [cat for cat, data in category_breakdown.items() if data["utilization"] < 80]
        
        # Monthly trend (simplified)
        monthly_trend = []
        # TODO: Implement proper monthly trend calculation
        
        # Category performance
        category_performance = category_breakdown
        
        stats = BudgetStats(
            total_budgets=len(budgets),
            active_budgets=active_budgets,
            total_allocated=total_allocated,
            total_spent=total_spent,
            total_saved=total_remaining,
            average_utilization=average_utilization,
            over_budget_categories=over_budget_categories,
            under_budget_categories=under_budget_categories,
            monthly_trend=monthly_trend,
            category_performance=category_performance
        )
        
        return ResponseHandler.success(
            data=stats,
            message="Budget statistics retrieved successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to get budget stats: {str(e)}")


@router.post("/bulk", response_model=List[BudgetResponse])
async def create_bulk_budgets(
    bulk_data: BudgetBulkCreate,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Create multiple budgets at once
    """
    try:
        # Prepare budget documents
        budget_docs = []
        for budget_data in bulk_data.budgets:
            budget_doc = budget_data.dict()
            budget_doc["user_id"] = str(current_user["_id"])
            budget_doc["spent_amount"] = 0.0
            budget_doc["remaining_amount"] = budget_doc["allocated_amount"]
            budget_doc["utilization_percentage"] = 0.0
            budget_doc["is_active"] = True
            budget_doc["created_at"] = datetime.utcnow()
            budget_doc["updated_at"] = datetime.utcnow()
            budget_docs.append(budget_doc)
        
        # Insert budgets
        result = await database[Collections.BUDGETS].insert_many(budget_docs)
        
        # Get created budgets
        budget_ids = [str(oid) for oid in result.inserted_ids]
        cursor = database[Collections.BUDGETS].find({"_id": {"$in": [ObjectId(oid) for oid in budget_ids]}})
        
        budgets = []
        async for budget in cursor:
            budget["_id"] = str(budget["_id"])
            budgets.append(BudgetResponse(**budget))
        
        return ResponseHandler.created(
            data=budgets,
            message=f"Successfully created {len(budgets)} budgets"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to create bulk budgets: {str(e)}")


@router.post("/{budget_id}/update-spending")
async def update_budget_spending(
    budget_id: str,
    spent_amount: float,
    current_user: dict = Depends(get_current_user),
    database: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update budget spending amount (called automatically when expenses are added/updated)
    """
    try:
        # Validate ObjectId
        if not ObjectId.is_valid(budget_id):
            return ResponseHandler.error(
                message="Invalid budget ID",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get budget
        budget = await database[Collections.BUDGETS].find_one({
            "_id": ObjectId(budget_id),
            "user_id": str(current_user["_id"])
        })
        
        if not budget:
            return ResponseHandler.not_found("Budget")
        
        # Calculate new values
        allocated_amount = budget["allocated_amount"]
        remaining_amount = allocated_amount - spent_amount
        utilization_percentage = (spent_amount / allocated_amount * 100) if allocated_amount > 0 else 0
        
        # Update budget
        await database[Collections.BUDGETS].update_one(
            {"_id": ObjectId(budget_id)},
            {
                "$set": {
                    "spent_amount": spent_amount,
                    "remaining_amount": remaining_amount,
                    "utilization_percentage": utilization_percentage,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return ResponseHandler.success(
            message="Budget spending updated successfully"
        )
    
    except Exception as e:
        return ResponseHandler.server_error(f"Failed to update budget spending: {str(e)}")


# Export for use in other modules
__all__ = ["router"]
