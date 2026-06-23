"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Todo } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 할 일 수정 폼. 기존 text를 prefill하고, 수정 성공 후 목록으로 이동한다.
export default function EditForm({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [text, setText] = useState(todo.text); // prefill
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);

    // 빈/공백 거부 (백엔드도 422로 2차 방어)
    if (!text.trim()) return;

    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error();
      // 순서 고정: refresh → push
      router.refresh();
      router.push("/todos");
    } catch {
      setError(true);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="할 일 수정"
        className="rounded border border-gray-300 px-3 py-2"
      />
      <button
        type="submit"
        className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
      >
        저장
      </button>
      {error && (
        <p className="text-sm text-red-600">
          저장에 실패했습니다. 다시 시도하세요.
        </p>
      )}
    </form>
  );
}
