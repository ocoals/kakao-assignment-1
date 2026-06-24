"""SQLAlchemy ORM 모델."""
from sqlalchemy import Boolean, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    text: Mapped[str] = mapped_column(String, nullable=False)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    date: Mapped[str] = mapped_column(String, nullable=False, index=True)  # "YYYY-MM-DD"
