"""DB 엔진/세션/Base. python-dotenv 없이 .env.local의 KEY=VALUE를 직접 읽는다."""
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

_env_path = Path(__file__).parent / ".env.local"
if _env_path.exists():
    for _line in _env_path.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _key, _, _val = _line.partition("=")
            if _key.strip() not in os.environ:  # 기존 환경변수가 우선
                os.environ[_key.strip()] = _val.strip()

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./todos.db")

# SQLite + 멀티스레드 접근에는 check_same_thread=False 필요
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
