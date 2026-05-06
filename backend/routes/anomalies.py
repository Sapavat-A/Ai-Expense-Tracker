import logging
from datetime import datetime
from typing import Dict, List, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from auth import get_current_active_user
from database import get_db
from models import User, Expense
from anomaly_service import detect_expense_anomalies

router = APIRouter(prefix="/anomalies", tags=["Anomaly Detection"])
logger = logging.getLogger(__name__)


@router.post("/detect")
async def detect_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Detect anomalies in user's expenses.
    
    Returns:
        Dictionary with detected anomalies and summary
    """
    try:
        # Get user's expenses
        expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
        
        # Convert to dict format for analysis
        expense_data = []
        for expense in expenses:
            expense_data.append({
                'id': expense.id,
                'amount': float(expense.amount),
                'category': expense.category,
                'date': expense.date.isoformat() if expense.date else None,
                'is_anomaly': expense.is_anomaly,
                'anomaly_type': expense.anomaly_type,
                'anomaly_severity': expense.anomaly_severity,
            })
        
        # Detect anomalies
        anomaly_result = detect_expense_anomalies(expense_data)
        
        # Update expense records with anomaly flags
        anomalies_to_update = []
        for anomaly in anomaly_result['anomalies']:
            expense_id = anomaly.get('expense_id')
            if expense_id:
                # Find the expense record
                expense_record = db.query(Expense).filter(
                    Expense.id == expense_id,
                    Expense.user_id == current_user.id
                ).first()
                
                if expense_record:
                    # Update anomaly fields
                    expense_record.is_anomaly = True
                    expense_record.anomaly_type = anomaly.get('type')
                    expense_record.anomaly_score = anomaly.get('z_score', 0)
                    expense_record.anomaly_severity = anomaly.get('severity')
                    expense_record.anomaly_description = anomaly.get('description')
                    expense_record.anomaly_detected_at = datetime.now()
                    
                    anomalies_to_update.append(expense_record)
        
        # Commit all updates
        if anomalies_to_update:
            db.add_all(anomalies_to_update)
            db.commit()
            logger.info(f"Updated {len(anomalies_to_update)} expense records with anomaly flags")
        
        logger.info(f"Anomaly detection completed for user {current_user.id}: {anomaly_result['summary']['anomaly_count']} anomalies found")
        
        return {
            "anomalies": anomaly_result['anomalies'],
            "summary": anomaly_result['summary'],
            "updated_expenses": len(anomalies_to_update),
            "detection_timestamp": anomaly_result['summary']['detection_timestamp']
        }
        
    except Exception as e:
        logger.error(f"Anomaly detection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to detect anomalies: {str(e)}"
        )


@router.get("/list")
async def get_anomalies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get all flagged anomalies for the user.
    
    Returns:
        Dictionary with user's anomalies
    """
    try:
        # Get user's anomalous expenses
        anomalies = db.query(Expense).filter(
            Expense.user_id == current_user.id,
            Expense.is_anomaly == True
        ).order_by(desc(Expense.anomaly_detected_at)).all()
        
        # Convert to response format
        anomaly_list = []
        for expense in anomalies:
            anomaly_list.append({
                'id': expense.id,
                'amount': float(expense.amount),
                'category': expense.category,
                'date': expense.date.isoformat() if expense.date else None,
                'anomaly_type': expense.anomaly_type,
                'anomaly_severity': expense.anomaly_severity,
                'anomaly_score': expense.anomaly_score,
                'anomaly_description': expense.anomaly_description,
                'detected_at': expense.anomaly_detected_at.isoformat() if expense.anomaly_detected_at else None,
            })
        
        logger.info(f"Retrieved {len(anomaly_list)} anomalies for user {current_user.id}")
        
        return {
            "anomalies": anomaly_list,
            "count": len(anomaly_list),
            "summary": {
                "critical_count": len([a for a in anomaly_list if a.get('anomaly_severity') == 'critical']),
                "high_count": len([a for a in anomaly_list if a.get('anomaly_severity') == 'high']),
                "medium_count": len([a for a in anomaly_list if a.get('anomaly_severity') == 'medium']),
                "low_count": len([a for a in anomaly_list if a.get('anomaly_severity') == 'low']),
            }
        }
        
    except Exception as e:
        logger.error(f"Error retrieving anomalies: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve anomalies: {str(e)}"
        )


@router.post("/clear/{expense_id}")
async def clear_anomaly(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, str]:
    """
    Clear anomaly flag from a specific expense.
    
    Args:
        expense_id: ID of expense to clear anomaly from
        
    Returns:
        Success message
    """
    try:
        # Find the expense
        expense = db.query(Expense).filter(
            Expense.id == expense_id,
            Expense.user_id == current_user.id
        ).first()
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        
        # Clear anomaly flags
        expense.is_anomaly = False
        expense.anomaly_type = None
        expense.anomaly_score = None
        expense.anomaly_severity = None
        expense.anomaly_description = None
        expense.anomaly_detected_at = None
        
        db.commit()
        logger.info(f"Cleared anomaly flag for expense {expense_id} by user {current_user.id}")
        
        return {"message": "Anomaly flag cleared successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error clearing anomaly: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to clear anomaly: {str(e)}"
        )


@router.get("/stats")
async def get_anomaly_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Dict[str, Any]:
    """
    Get anomaly detection statistics for the user.
    
    Returns:
        Dictionary with anomaly statistics
    """
    try:
        # Get all user expenses
        total_expenses = db.query(Expense).filter(Expense.user_id == current_user.id).count()
        anomalous_expenses = db.query(Expense).filter(
            Expense.user_id == current_user.id,
            Expense.is_anomaly == True
        ).count()
        
        # Calculate statistics
        anomaly_percentage = (anomalous_expenses / total_expenses * 100) if total_expenses > 0 else 0
        
        # Get severity breakdown
        severity_stats = db.query(
            Expense.anomaly_severity,
            db.func.count(Expense.id)
        ).filter(
            Expense.user_id == current_user.id,
            Expense.is_anomaly == True
        ).group_by(Expense.anomaly_severity).all()
        
        severity_breakdown = {}
        for severity, count in severity_stats:
            severity_breakdown[severity[0] or 'unknown'] = count[1]
        
        logger.info(f"Anomaly stats retrieved for user {current_user.id}")
        
        return {
            "total_expenses": total_expenses,
            "anomalous_expenses": anomalous_expenses,
            "normal_expenses": total_expenses - anomalous_expenses,
            "anomaly_percentage": round(anomaly_percentage, 2),
            "severity_breakdown": severity_breakdown,
            "last_detection": db.query(Expense).filter(
                Expense.user_id == current_user.id,
                Expense.is_anomaly == True
            ).order_by(desc(Expense.anomaly_detected_at)).first().anomaly_detected_at.isoformat() if db.query(Expense).filter(
                Expense.user_id == current_user.id,
                Expense.is_anomaly == True
            ).order_by(desc(Expense.anomaly_detected_at)).first() else None
        }
        
    except Exception as e:
        logger.error(f"Error getting anomaly stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get anomaly stats: {str(e)}"
        )
