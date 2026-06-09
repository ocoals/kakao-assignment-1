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
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="할 일을 입력하세요"
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-500 text-white rounded px-4">
          추가
        </button>
      </div>
      {message && <p className="mt-1 text-sm text-red-500">{message}</p>}
    </form>
  );
}

export default TodoForm;
