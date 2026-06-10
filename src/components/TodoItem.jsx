import { useState } from "react";

const buttonClass = "rounded-lg px-2.5 py-1.5 text-[13px] font-medium hover:opacity-80";

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
      <li className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-line p-3.5">
        <input
          type="text"
          value={editText}
          onChange={(event) => setEditText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && handleSave()}
          className="flex-1 rounded-lg border-[1.5px] border-line px-2.5 py-1.5 text-[15px] outline-none focus:border-brand"
          autoFocus
        />
        <div className="flex gap-1.5">
          <button onClick={handleSave} className={`${buttonClass} bg-brand text-white`}>
            저장
          </button>
          <button onClick={handleCancel} className={`${buttonClass} bg-brand-soft text-brand`}>
            취소
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-line p-3.5">
      <span
        className={`flex-1 break-all text-[15px] ${
          todo.completed ? "text-subtle line-through" : "text-ink"
        }`}
      >
        {todo.text}
      </span>
      <div className="flex gap-1.5">
        <button onClick={() => setIsEditing(true)} className={`${buttonClass} bg-brand-soft text-brand`}>
          수정
        </button>
        <button onClick={() => onComplete(todo.id)} className={`${buttonClass} bg-brand text-white`}>
          {todo.completed ? "취소" : "완료"}
        </button>
        <button onClick={() => onDelete(todo.id)} className={`${buttonClass} bg-danger-soft text-danger`}>
          삭제
        </button>
      </div>
    </li>
  );
}

export default TodoItem;
