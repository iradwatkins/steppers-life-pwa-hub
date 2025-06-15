from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from decimal import Decimal

from app.core.database import get_db
from app.core.auth import get_current_active_user
from app.models.user import User, UserRole
from app.models.payment_disbursement import PaymentDisbursement, DisbursementStatus, DisbursementType
from app.schemas.disbursement import (
    CreateDisbursementRequest,
    PaymentDisbursement as PaymentDisbursementSchema,
    DisbursementSummary,
    ProcessDisbursementRequest,
    MarkCompletedRequest,
    DisbursementStats
)
from app.services.disbursement_service import disbursement_service, DisbursementError

router = APIRouter()

@router.post("/", response_model=PaymentDisbursementSchema)
async def create_disbursement(
    disbursement_request: CreateDisbursementRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new disbursement (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        disbursement = await disbursement_service.create_disbursement(
            db=db,
            recipient_id=disbursement_request.recipient_id,
            amount=disbursement_request.amount,
            disbursement_type=disbursement_request.disbursement_type,
            payment_method=disbursement_request.payment_method,
            description=disbursement_request.description,
            reference_type=disbursement_request.reference_type,
            reference_id=disbursement_request.reference_id,
            initiated_by=current_user.id,
            auto_process=disbursement_request.auto_process
        )
        return disbursement
    except DisbursementError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )

@router.get("/", response_model=List[DisbursementSummary])
async def list_disbursements(
    recipient_id: Optional[int] = Query(None, description="Filter by recipient user ID"),
    status_filter: Optional[DisbursementStatus] = Query(None, description="Filter by status"),
    disbursement_type: Optional[DisbursementType] = Query(None, description="Filter by type"),
    limit: int = Query(50, le=100, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List disbursements with filtering options"""
    # Regular users can only see their own disbursements
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        recipient_id = current_user.id
    
    query = db.query(PaymentDisbursement)
    
    if recipient_id:
        query = query.filter(PaymentDisbursement.recipient_id == recipient_id)
    
    if status_filter:
        query = query.filter(PaymentDisbursement.status == status_filter)
    
    if disbursement_type:
        query = query.filter(PaymentDisbursement.disbursement_type == disbursement_type)
    
    disbursements = query.order_by(PaymentDisbursement.created_at.desc())\
                          .limit(limit)\
                          .offset(offset)\
                          .all()
    
    # Convert to summary format
    return [
        DisbursementSummary(
            id=d.id,
            recipient_id=d.recipient_id,
            amount=d.amount,
            net_amount=d.net_amount,
            status=d.status,
            disbursement_type=d.disbursement_type,
            payment_method=d.payment_method,
            payment_account_info=d.payment_account_info,
            created_at=d.created_at,
            completed_at=d.completed_at
        ) for d in disbursements
    ]

@router.get("/me", response_model=List[DisbursementSummary])
async def get_my_disbursements(
    limit: int = Query(50, le=100, description="Number of results to return"),
    offset: int = Query(0, description="Number of results to skip"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get disbursements for the current user"""
    disbursements = disbursement_service.get_user_disbursements(
        db=db,
        user_id=current_user.id,
        limit=limit,
        offset=offset
    )
    
    return [
        DisbursementSummary(
            id=d.id,
            recipient_id=d.recipient_id,
            amount=d.amount,
            net_amount=d.net_amount,
            status=d.status,
            disbursement_type=d.disbursement_type,
            payment_method=d.payment_method,
            payment_account_info=d.payment_account_info,
            created_at=d.created_at,
            completed_at=d.completed_at
        ) for d in disbursements
    ]

@router.get("/pending", response_model=List[DisbursementSummary])
async def get_pending_disbursements(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all pending disbursements requiring manual processing (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    disbursements = disbursement_service.get_pending_disbursements(db)
    
    return [
        DisbursementSummary(
            id=d.id,
            recipient_id=d.recipient_id,
            amount=d.amount,
            net_amount=d.net_amount,
            status=d.status,
            disbursement_type=d.disbursement_type,
            payment_method=d.payment_method,
            payment_account_info=d.payment_account_info,
            created_at=d.created_at,
            completed_at=d.completed_at
        ) for d in disbursements
    ]

@router.get("/{disbursement_id}", response_model=PaymentDisbursementSchema)
async def get_disbursement(
    disbursement_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific disbursement"""
    disbursement = db.query(PaymentDisbursement).filter(PaymentDisbursement.id == disbursement_id).first()
    
    if not disbursement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disbursement not found"
        )
    
    # Users can only see their own disbursements unless they're admin
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        if disbursement.recipient_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
    
    return disbursement

@router.post("/{disbursement_id}/process")
async def process_disbursement(
    disbursement_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Process a pending disbursement (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        result = await disbursement_service.process_disbursement(db, disbursement_id)
        return result
    except DisbursementError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )

@router.post("/{disbursement_id}/complete")
async def mark_disbursement_completed(
    disbursement_id: int,
    completed_request: MarkCompletedRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Manually mark a disbursement as completed (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    try:
        disbursement = disbursement_service.mark_disbursement_completed(
            db=db,
            disbursement_id=disbursement_id,
            external_transaction_id=completed_request.external_transaction_id,
            completed_by=current_user.id
        )
        return {
            "success": True,
            "message": "Disbursement marked as completed",
            "disbursement_id": disbursement.id,
            "status": disbursement.status.value
        }
    except DisbursementError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message
        )

@router.get("/stats/overview", response_model=DisbursementStats)
async def get_disbursement_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get disbursement statistics (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    from sqlalchemy import func, extract
    from datetime import datetime
    
    # Get total disbursements
    total_query = db.query(
        func.count(PaymentDisbursement.id).label('count'),
        func.coalesce(func.sum(PaymentDisbursement.amount), 0).label('amount')
    ).first()
    
    # Get pending disbursements
    pending_query = db.query(
        func.count(PaymentDisbursement.id).label('count'),
        func.coalesce(func.sum(PaymentDisbursement.amount), 0).label('amount')
    ).filter(PaymentDisbursement.status == DisbursementStatus.PENDING).first()
    
    # Get completed disbursements
    completed_query = db.query(
        func.count(PaymentDisbursement.id).label('count'),
        func.coalesce(func.sum(PaymentDisbursement.amount), 0).label('amount')
    ).filter(PaymentDisbursement.status == DisbursementStatus.COMPLETED).first()
    
    # Get failed disbursements
    failed_count = db.query(func.count(PaymentDisbursement.id))\
                    .filter(PaymentDisbursement.status == DisbursementStatus.FAILED)\
                    .scalar()
    
    # Get this month's amount
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    this_month_amount = db.query(func.coalesce(func.sum(PaymentDisbursement.amount), 0))\
                          .filter(
                              extract('month', PaymentDisbursement.created_at) == current_month,
                              extract('year', PaymentDisbursement.created_at) == current_year
                          ).scalar()
    
    # Get this year's amount
    this_year_amount = db.query(func.coalesce(func.sum(PaymentDisbursement.amount), 0))\
                         .filter(extract('year', PaymentDisbursement.created_at) == current_year)\
                         .scalar()
    
    return DisbursementStats(
        total_disbursements=total_query.count or 0,
        total_amount=Decimal(str(total_query.amount or 0)),
        pending_count=pending_query.count or 0,
        pending_amount=Decimal(str(pending_query.amount or 0)),
        completed_count=completed_query.count or 0,
        completed_amount=Decimal(str(completed_query.amount or 0)),
        failed_count=failed_count or 0,
        this_month_amount=Decimal(str(this_month_amount or 0)),
        this_year_amount=Decimal(str(this_year_amount or 0))
    )

@router.get("/user/{user_id}/available-methods")
async def get_user_available_methods(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get available payment methods for a user (admin only)"""
    if current_user.role not in [UserRole.ADMIN, UserRole.MODERATOR]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    methods = disbursement_service.get_available_methods(user_id, db)
    
    return {
        "user_id": user_id,
        "available_methods": methods,
        "count": len(methods)
    } 