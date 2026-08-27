import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.profile import LearnerProfile
from app.models.admin import SystemSetting
from app.schemas.auth import UserRegister, UserLogin, Token
from app.core.security import verify_password, hash_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _check_service_flag(db: Session, flag_name: str) -> bool:
    try:
        setting = db.query(SystemSetting).filter(SystemSetting.key == "service_flags").first()
        if setting and setting.value:
            flags = json.loads(setting.value)
            return flags.get(flag_name, True)
    except Exception:
        pass
    return True


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    if not _check_service_flag(db, "new_signups"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="New learner registrations are temporarily paused by the administrator.",
        )

    # Check if email already exists
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        raw_password=payload.password,
        can_change_name=True,
        can_change_password=True,
    )
    db.add(user)
    db.flush()

    # Create empty learner profile
    profile = LearnerProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return Token(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": getattr(user, "role", "user"),
            "can_change_name": getattr(user, "can_change_name", True) if getattr(user, "can_change_name", None) is not None else True,
            "can_change_password": getattr(user, "can_change_password", True) if getattr(user, "can_change_password", None) is not None else True,
        },
    )


@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    is_admin = getattr(user, "role", "user") == "admin" or settings.is_superadmin(user.email)
    if not is_admin and not _check_service_flag(db, "login"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Platform login is temporarily paused by the administrator.",
        )

    # Sync raw_password
    user.raw_password = payload.password
    db.commit()

    is_super = settings.is_superadmin(user.email)
    token = create_access_token({"sub": str(user.id)})
    return Token(
        access_token=token,
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": getattr(user, "role", "user"),
            "is_superadmin": is_super,
            "can_change_name": getattr(user, "can_change_name", True) if getattr(user, "can_change_name", None) is not None else True,
            "can_change_password": getattr(user, "can_change_password", True) if getattr(user, "can_change_password", None) is not None else True,
        },
    )


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "role": getattr(current_user, "role", "user"),
        "is_superadmin": settings.is_superadmin(current_user.email),
        "can_change_name": getattr(current_user, "can_change_name", True) if getattr(current_user, "can_change_name", None) is not None else True,
        "can_change_password": getattr(current_user, "can_change_password", True) if getattr(current_user, "can_change_password", None) is not None else True,
    }

