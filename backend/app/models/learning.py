from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey,
    JSON, Boolean, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.database import Base


class PathStatus(str, enum.Enum):
    active = "active"
    completed = "completed"
    paused = "paused"


class PhaseStatus(str, enum.Enum):
    locked = "locked"
    active = "active"
    completed = "completed"


class ItemStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    skipped = "skipped"


class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    goal_id = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    status = Column(SAEnum(PathStatus), default=PathStatus.active)
    total_weeks = Column(Integer, default=12)
    current_week = Column(Integer, default=1)
    overall_progress = Column(Float, default=0.0)  # 0.0 to 1.0
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="learning_paths")
    phases = relationship("PathPhase", back_populates="path", order_by="PathPhase.phase_number")
    adaptations = relationship("PathAdaptation", back_populates="path")


class PathPhase(Base):
    __tablename__ = "path_phases"

    id = Column(Integer, primary_key=True, index=True)
    path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    phase_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    week_start = Column(Integer, nullable=False)
    week_end = Column(Integer, nullable=False)
    status = Column(SAEnum(PhaseStatus), default=PhaseStatus.locked)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    path = relationship("LearningPath", back_populates="phases")
    items = relationship("PathItem", back_populates="phase", order_by="PathItem.order_index")


class PathItem(Base):
    __tablename__ = "path_items"

    id = Column(Integer, primary_key=True, index=True)
    phase_id = Column(Integer, ForeignKey("path_phases.id"), nullable=False)
    resource_id = Column(String(20), nullable=False)     # References resources.json
    order_index = Column(Integer, nullable=False)
    status = Column(SAEnum(ItemStatus), default=ItemStatus.pending)
    score = Column(Float, nullable=True)                  # Assessment score if applicable
    is_revision = Column(Boolean, default=False)          # Added by adaptive engine
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    phase = relationship("PathPhase", back_populates="items")
    assessment_results = relationship("AssessmentResult", back_populates="path_item")


class PathAdaptation(Base):
    __tablename__ = "path_adaptations"

    id = Column(Integer, primary_key=True, index=True)
    path_id = Column(Integer, ForeignKey("learning_paths.id"), nullable=False)
    trigger_event = Column(String(50), nullable=False)   # low_score | high_score | too_easy | behind_schedule
    trigger_score = Column(Float, nullable=True)
    description = Column(Text, nullable=False)
    changes_made = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    path = relationship("LearningPath", back_populates="adaptations")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assessment_id = Column(String(50), nullable=False)  # References assessments.json
    path_item_id = Column(Integer, ForeignKey("path_items.id"), nullable=True)
    score = Column(Float, nullable=False)                # 0.0 to 1.0
    answers = Column(JSON, default=dict)                 # {question_id: selected_option_index}
    feedback = Column(Text, nullable=True)               # AI-generated feedback
    taken_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="assessment_results")
    path_item = relationship("PathItem", back_populates="assessment_results")


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # user | assistant
    content = Column(Text, nullable=False)
    metadata = Column(JSON, default=dict)      # {"phase": "onboarding", "extracted_profile": {...}}
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="chat_messages")
