"""Pydantic v2 스키마."""
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator


class TodoCreate(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("text는 공백만으로 이루어질 수 없습니다.")
        return stripped  # 앞뒤 공백 제거된 값 저장


class TodoUpdate(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None

    @field_validator("text")
    @classmethod
    def text_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v  # None은 미변경 → 통과
        stripped = v.strip()
        if not stripped:
            raise ValueError("text는 공백만으로 이루어질 수 없습니다.")
        return stripped


class TodoRead(BaseModel):
    id: int
    text: str
    completed: bool

    model_config = ConfigDict(from_attributes=True)
