"""Pydantic v2 스키마."""
import re
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator

MAX_TEXT = 200  # 프론트(TodoForm/EditForm)와 같은 값 유지
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _clean_text(v: str) -> str:
    """공백 제거 후 빈값·길이 검증. 잘못되면 422를 유발."""
    stripped = v.strip()
    if not stripped:
        raise ValueError("text는 공백만으로 이루어질 수 없습니다.")
    if len(stripped) > MAX_TEXT:
        raise ValueError(f"text는 {MAX_TEXT}자 이내여야 합니다.")
    return stripped


class TodoCreate(BaseModel):
    text: str
    date: str  # "YYYY-MM-DD"

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        return _clean_text(v)

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        # 정상 UI에선 항상 형식이 맞지만, 잘못된 직접 요청을 막는 안전망.
        if not DATE_RE.match(v):
            raise ValueError("date는 YYYY-MM-DD 형식이어야 합니다.")
        return v


class TodoUpdate(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: Optional[str]) -> Optional[str]:
        if v is None:  # 미변경
            return v
        return _clean_text(v)


class TodoRead(BaseModel):
    id: int
    text: str
    completed: bool
    date: str  # "YYYY-MM-DD"

    model_config = ConfigDict(from_attributes=True)
