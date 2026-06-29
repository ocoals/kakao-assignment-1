"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Todo } from "../types";
import { todoApi } from "../_lib/api";

const MAX_TEXT = 200; // 백엔드 검증과 같은 값 유지

export default function EditForm({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [text, setText] = useState(todo.text); // prefill
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) {
      setError("할 일을 입력해 주세요.");
      return;
    }
    if (trimmed.length > MAX_TEXT) {
      setError(`할 일은 ${MAX_TEXT}자 이내로 입력해 주세요.`);
      return;
    }
    setError(null);

    try {
      await todoApi.update(todo.id, { text: trimmed }); // text만 수정
      router.refresh();
      router.push(`/todos?date=${todo.date}`);
    } catch {
      setError("잠시 후 다시 시도해 주세요.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="할 일 수정"
          className="flex-1 rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-[15px] outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="rounded-[10px] bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-hover"
        >
          저장
        </button>
      </div>
      {error && <p className="text-[13px] text-danger">{error}</p>}
    </form>
  );
}
