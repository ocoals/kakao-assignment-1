import { useState } from "react";

function TodoForm({ onAdd }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (trimmed === "") {
      setMessage("할 일을 입력해주세요");
      return;
    }
    onAdd(trimmed);
    setText("");
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-[15px] outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-[10px] bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-hover"
        >
          추가
        </button>
      </div>
      <p className="mt-2.5 min-h-4.5 text-[13px] text-brand">{message}</p>
    </form>
  );
}

export default TodoForm;
