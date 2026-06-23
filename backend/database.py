"""
데이터베이스 엔진/세션/Base 설정.

.env.local 파일을 표준 라이브러리만으로 파싱한다.
python-dotenv 없이 간단하게: 파일의 KEY=VALUE 줄을 읽어
os.environ에 없는 키만 설정(환경변수가 우선).
"""
import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# --- .env.local 로드 (표준 라이브러리만 사용) ---
_env_path = Path(__file__).parent / ".env.local"
if _env_path.exists():
    for _line in _env_path.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _key, _, _val = _line.partition("=")
            if _key.strip() not in os.environ:          # 환경변수가 우선
                os.environ[_key.strip()] = _val.strip()

# --- DB URL ---
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./todos.db")

# SQLite는 멀티스레드 접근을 위해 check_same_thread=False 필요
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass
