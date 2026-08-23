from sqlalchemy import (
    Column, Integer, String, Text, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import secrets
import string

from app.db.database import Base


def generate_certificate_code(length: int = 5) -> str:
    """Generate a unique, easily readable uppercase alphanumeric 5-character code."""
    # Exclude easily confused characters like 0, O, 1, I
    charset = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
    return "".join(secrets.choice(charset) for _ in range(length))


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    
    # 5-character unique verification code, e.g. "8K9A2"
    code = Column(String(20), unique=True, index=True, nullable=True)
    
    recipient_name = Column(String(255), nullable=False)
    path_title = Column(String(255), nullable=False)
    
    # status: pending, approved, rejected
    status = Column(String(20), default="pending", nullable=False)
    rejection_reason = Column(Text, nullable=True)
    
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Completion metadata snapshot
    completion_stats = Column(JSON, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    approver = relationship("User", foreign_keys=[approved_by])
    learning_path = relationship("LearningPath")
