from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.db.database import get_db
from app.models.user import User
from app.models.learning import LearningPath, PathStatus
from app.models.certificate import Certificate, generate_certificate_code
from app.api.deps import get_current_user, get_current_admin

router = APIRouter(tags=["certificates"])


# ── Pydantic Schemas ─────────────────────────────────────────────────────────

class CertificateRequestIn(BaseModel):
    path_id: Optional[int] = None

class CertificateRejectIn(BaseModel):
    reason: Optional[str] = "Milestones or assessments incomplete."

class CertificateOut(BaseModel):
    id: int
    user_id: int
    path_id: int
    code: Optional[str] = None
    recipient_name: str
    path_title: str
    status: str
    rejection_reason: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    completion_stats: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


# ── Learner Endpoints ─────────────────────────────────────────────────────────

@router.post("/certificates/request", response_model=CertificateOut)
def request_certificate(
    payload: CertificateRequestIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Learner requests a course completion certificate for their learning path."""
    # Find path
    if payload.path_id:
        path = db.query(LearningPath).filter(
            LearningPath.id == payload.path_id,
            LearningPath.user_id == current_user.id
        ).first()
    else:
        path = db.query(LearningPath).filter(
            LearningPath.user_id == current_user.id
        ).order_by(LearningPath.created_at.desc()).first()

    if not path:
        raise HTTPException(status_code=404, detail="No active learning path found.")

    # Check if a certificate already exists for this path
    existing = db.query(Certificate).filter(
        Certificate.user_id == current_user.id,
        Certificate.path_id == path.id
    ).first()

    if existing:
        # If rejected, allow re-submitting for review
        if existing.status == "rejected":
            existing.status = "pending"
            existing.rejection_reason = None
            existing.completion_stats = {
                "total_weeks": path.total_weeks,
                "current_week": path.current_week,
                "overall_progress": round(path.overall_progress or 0.0, 2)
            }
            db.commit()
            db.refresh(existing)
            return existing
        return existing

    # Create new pending certificate request
    cert = Certificate(
        user_id=current_user.id,
        path_id=path.id,
        recipient_name=current_user.name,
        path_title=path.title,
        status="pending",
        completion_stats={
            "total_weeks": path.total_weeks,
            "current_week": path.current_week,
            "overall_progress": round(path.overall_progress or 0.0, 2)
        }
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@router.get("/certificates/my", response_model=List[CertificateOut])
def get_my_certificates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all certificates issued or requested by the current learner."""
    return db.query(Certificate).filter(
        Certificate.user_id == current_user.id
    ).order_by(Certificate.created_at.desc()).all()


# ── Public Verification Endpoint ──────────────────────────────────────────────

@router.get("/certificates/verify/{code}")
def verify_certificate_code(code: str, db: Session = Depends(get_db)):
    """
    Publicly verify a 5-digit certificate code.
    Accessible by anyone without authentication.
    """
    clean_code = code.strip().upper()
    cert = db.query(Certificate).filter(Certificate.code == clean_code).first()

    if not cert or cert.status != "approved":
        return {
            "valid": False,
            "code": clean_code,
            "detail": "Certificate credential code is invalid, not found, or not yet officially approved."
        }

    return {
        "valid": True,
        "code": cert.code,
        "recipient_name": cert.recipient_name,
        "path_title": cert.path_title,
        "status": "APPROVED",
        "issued_at": cert.approved_at.isoformat() if cert.approved_at else cert.created_at.isoformat(),
        "completion_stats": cert.completion_stats or {},
        "issuer": "PathMind AI Autonomous Curriculum Authority",
        "signature_verification": "DIGITALLY_VERIFIED_AUTHENTIC",
        "verification_url": f"https://path-mind-ai-xi.vercel.app/verify/{cert.code}"
    }


# ── Admin Verification & Approval Endpoints ────────────────────────────────────

@router.get("/admin/certificates")
def admin_list_certificates(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Admin retrieves all certificate requests with user details and progress."""
    query = db.query(Certificate)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Certificate.status == status_filter.lower())
    
    certs = query.order_by(Certificate.created_at.desc()).all()
    
    results = []
    for c in certs:
        learner = db.query(User).filter(User.id == c.user_id).first()
        l_path = db.query(LearningPath).filter(LearningPath.id == c.path_id).first()
        results.append({
            "id": c.id,
            "user_id": c.user_id,
            "user_name": learner.name if learner else c.recipient_name,
            "user_email": learner.email if learner else "N/A",
            "path_id": c.path_id,
            "path_title": c.path_title,
            "code": c.code,
            "status": c.status,
            "rejection_reason": c.rejection_reason,
            "approved_at": c.approved_at,
            "created_at": c.created_at,
            "completion_stats": c.completion_stats or {
                "overall_progress": l_path.overall_progress if l_path else 0.0,
                "total_weeks": l_path.total_weeks if l_path else 12,
            }
        })
    return results


@router.post("/admin/certificates/{cert_id}/approve")
def admin_approve_certificate(
    cert_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Admin approves a certificate request and generates its unique 5-char code."""
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate request not found.")

    # Generate unique 5-character collision-proof code
    if not cert.code:
        for _ in range(20):
            new_code = generate_certificate_code(5)
            existing_code = db.query(Certificate).filter(Certificate.code == new_code).first()
            if not existing_code:
                cert.code = new_code
                break

    cert.status = "approved"
    cert.approved_by = current_admin.id
    cert.approved_at = datetime.utcnow()
    cert.rejection_reason = None

    # Mark associated learning path completed
    if cert.path_id:
        path = db.query(LearningPath).filter(LearningPath.id == cert.path_id).first()
        if path:
            path.status = PathStatus.completed
            path.overall_progress = 1.0

    db.commit()
    db.refresh(cert)
    return {
        "success": True,
        "message": f"Certificate approved with code {cert.code}",
        "certificate": {
            "id": cert.id,
            "code": cert.code,
            "status": cert.status,
            "recipient_name": cert.recipient_name,
            "path_title": cert.path_title,
            "approved_at": cert.approved_at
        }
    }


@router.post("/admin/certificates/{cert_id}/reject")
def admin_reject_certificate(
    cert_id: int,
    payload: CertificateRejectIn,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Admin rejects a certificate request with feedback."""
    cert = db.query(Certificate).filter(Certificate.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate request not found.")

    cert.status = "rejected"
    cert.rejection_reason = payload.reason or "Course requirements incomplete."
    db.commit()
    db.refresh(cert)
    return {
        "success": True,
        "message": "Certificate request rejected.",
        "certificate": {
            "id": cert.id,
            "status": cert.status,
            "rejection_reason": cert.rejection_reason
        }
    }
