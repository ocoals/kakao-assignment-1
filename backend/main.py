"""FastAPI Todo CRUD API."""
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models import Todo
from schemas import TodoCreate, TodoRead, TodoUpdate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    """요청마다 DB 세션을 생성하고 요청이 끝나면 닫는다."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/todos", response_model=list[TodoRead])
def list_todos(
    filter: Optional[str] = None,
    search: Optional[str] = None,
    date: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """할 일 목록 조회. filter(all|active|completed), search(부분 일치), date(YYYY-MM-DD) 적용."""
    query = db.query(Todo)

    if filter == "active":
        query = query.filter(Todo.completed == False)  # noqa: E712
    elif filter == "completed":
        query = query.filter(Todo.completed == True)  # noqa: E712

    if search and search.strip():
        query = query.filter(Todo.text.like(f"%{search.strip()}%"))

    if date and date.strip():
        query = query.filter(Todo.date == date.strip())

    return query.all()


@app.post("/todos", response_model=TodoRead, status_code=201)
def create_todo(body: TodoCreate, db: Session = Depends(get_db)):
    """할 일 생성. completed는 항상 False로 시작."""
    todo = Todo(text=body.text, completed=False, date=body.date)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, body: TodoUpdate, db: Session = Depends(get_db)):
    """할 일 부분 수정. 제공된 필드만 갱신. 빈 body {}는 no-op."""
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    if body.text is not None:
        todo.text = body.text
    if body.completed is not None:
        todo.completed = body.completed

    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """할 일 삭제. 없는 id면 404."""
    todo = db.get(Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(todo)
    db.commit()
