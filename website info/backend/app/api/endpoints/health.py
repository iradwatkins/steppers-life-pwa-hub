from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db
from app.core.config import settings
import time
from datetime import datetime

router = APIRouter()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint for monitoring and load balancers.
    Returns service status and basic diagnostics.
    """
    start_time = time.time()
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "version": "2025.1.0",
        "checks": {}
    }
    
    # Database connectivity check
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {
            "status": "healthy",
            "message": "Database connection successful"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        }
    
    # Application readiness check
    try:
        health_status["checks"]["application"] = {
            "status": "healthy",
            "message": "Application is ready to serve requests",
            "uptime_seconds": time.time() - start_time
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["application"] = {
            "status": "unhealthy",
            "message": f"Application check failed: {str(e)}"
        }
    
    # If any check is unhealthy, return 503
    if health_status["status"] == "unhealthy":
        raise HTTPException(status_code=503, detail=health_status)
    
    return health_status

@router.get("/health/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe endpoint.
    Returns 200 if the service is ready to accept traffic.
    """
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        raise HTTPException(
            status_code=503, 
            detail={"status": "not ready", "reason": str(e)}
        )

@router.get("/health/live")
async def liveness_check():
    """
    Kubernetes liveness probe endpoint.
    Returns 200 if the service is alive.
    """
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}