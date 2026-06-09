import { useState } from "react";

function TodoItem({ todo, onComplete, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = () => {
    const trimmed = editText.trim();
    if (trimmed === "") return;
    onEdit(todo.id, trimmed);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(todo.text);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <li className="flex items-center gap-2 rounded border px-3 py-2">
        <input
          type="text"
          value={editText}
          onChange={(event) => setEditText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSave()}
          className="flex-1 rounded border px-2 py-1"
          autoFocus
        />
        <button onClick={handleSave} className="text-blue-500">
          저장
        </button>
        <button onClick={handleCancel} className="text-gray-500">
          취소
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 rounded border px-3 py-2">
      <span
        className={`flex-1 ${todo.completed ? "text-gray-400 line-through" : ""}`}
      >
        {todo.text}
      </span>
      <button onClick={() => setIsEditing(true)} className="text-gray-600">
        수정
      </button>
      <button onClick={() => onComplete(todo.id)} className="text-green-600">
        {todo.completed ? "취소" : "완료"}
      </button>
      <button onClick={() => onDelete(todo.id)} className="text-red-500">
        삭제
      </button>
    </li>
  );
}

export default TodoItem;
