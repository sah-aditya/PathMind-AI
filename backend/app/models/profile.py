from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, ForeignKey,
    JSON, Boolean, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.db.database import Base


class ExperienceLevel(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class LearningStyle(str, enum.Enum):
    video = "video"
    reading = "reading"
    project = "project"
    mixed = "mixed"


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    goal_id = Column(String(100), nullable=True)          # e.g. "machine-learning-engineer"
    goal_title = Column(String(255), nullable=True)
    goal_description = Column(Text, nullable=True)
    experience_level = Column(SAEnum(ExperienceLevel), default=ExperienceLevel.beginner)
    hours_per_week = Column(Integer, default=8)
    target_weeks = Column(Integer, default=12)
    learning_style = Column(SAEnum(LearningStyle), default=LearningStyle.mixed)
    interests = Column(JSON, default=list)                # ["computer-vision", "nlp"]
    onboarding_complete = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")


class LearnerSkill(Base):
    __tablename__ = "learner_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(String(100), nullable=False)        # e.g. "python-basics"
    level = Column(Float, default=0.0)                    # 0.0 to 1.0
    source = Column(String(50), default="self_assessed")  # self_assessed | assessment | course_completed
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="learner_skills")
