"""
Seed script — creates tables and optionally seeds a demo user.
Run with: python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import engine, SessionLocal, Base
from app.models import *  # noqa - import all models so Base knows about them
from app.core.security import hash_password
from app.models.user import User
from app.models.profile import LearnerProfile, LearnerSkill


def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created.")


def seed_demo_user(db):
    existing = db.query(User).filter(User.email == "demo@pathmind.ai").first()
    if existing:
        print("Demo user already exists, skipping.")
        return

    user = User(
        email="demo@pathmind.ai",
        name="Alex (Demo User)",
        hashed_password=hash_password("Demo@1234"),
    )
    db.add(user)
    db.flush()

    profile = LearnerProfile(
        user_id=user.id,
        goal_id="machine-learning-engineer",
        goal_title="Machine Learning Engineer",
        goal_description="I want to become a machine learning engineer and build AI products.",
        experience_level="beginner",
        hours_per_week=8,
        learning_style="mixed",
        interests=["computer-vision", "generative-ai"],
        onboarding_complete=True,
    )
    db.add(profile)
    db.flush()

    # Seed some starting skills for the demo user
    starter_skills = [
        ("python-basics", 0.80),
        ("sql-basics", 0.65),
        ("git-basics", 0.60),
    ]
    for skill_id, level in starter_skills:
        db.add(LearnerSkill(
            user_id=user.id,
            skill_id=skill_id,
            level=level,
            source="self_assessed",
        ))

    db.commit()
    print(f"✅ Demo user created: demo@pathmind.ai / Demo@1234")


if __name__ == "__main__":
    create_tables()
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()
    print("✅ Seed complete.")
