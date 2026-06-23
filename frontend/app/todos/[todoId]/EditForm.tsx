"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Todo } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 할 일 수정 폼. 기존 text를 prefill하고, 수정 성공 후 그 항목의 날짜 목록으로 돌아간다.
export default function EditForm({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [text, setText] = useState(todo.text); // prefill
  const [error, setError] = useState(false);
  const [empty, setEmpty] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setEmpty(false);

    // 빈/공백 거부 (백엔드도 422로 2차 방어)
    if (!text.trim()) {
      setEmpty(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }), // text만 수정(날짜 미수정)
      });
      if (!res.ok) throw new Error();
      // 순서 고정: refresh → 그 항목의 날짜 목록으로 push
      router.refresh();
      router.push(`/todos?date=${todo.date}`);
    } catch {
      setError(true);
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
      {empty && (
        <p className="text-[13px] text-brand">할 일을 입력해 주세요.</p>
      )}
      {error && (
        <p className="text-[13px] text-danger">
          저장에 실패했습니다. 다시 시도하세요.
        </p>
      )}
    </form>
  );
}
