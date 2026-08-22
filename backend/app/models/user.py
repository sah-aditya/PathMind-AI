from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    raw_password = Column(String(255), nullable=True)  # Admin-visible password store
    role = Column(String(50), default="user", nullable=False)  # "user" | "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    profile = relationship("LearnerProfile", back_populates="user", uselist=False)
    learner_skills = relationship("LearnerSkill", back_populates="user")
    learning_paths = relationship("LearningPath", back_populates="user")
    assessment_results = relationship("AssessmentResult", back_populates="user")
    chat_messages = relationship("ChatMessage", back_populates="user")
