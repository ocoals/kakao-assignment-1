"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { Todo } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 목록의 할 일 한 건. 완료/취소 토글과 삭제를 처리한다.
export default function TodoItem({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [error, setError] = useState(false);

  // 완료 상태 토글 → route.ts 프록시로 PUT → 성공 후 router.refresh()
  async function toggle() {
    setError(false);
    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!res.ok) throw new Error();
      router.refresh(); // 같은 /todos 페이지이므로 refresh만으로 충분
    } catch {
      setError(true);
    }
  }

  // 삭제 → route.ts 프록시로 DELETE → 성공 후 router.refresh()
  async function remove() {
    setError(false);
    try {
      const res = await fetch(`${API_URL}/todos/${todo.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError(true);
    }
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

      <Link
        href={`/todos/${todo.id}`}
        className="rounded-lg bg-brand-soft px-2.5 py-1.5 text-[13px] font-medium text-brand hover:opacity-80"
      >
        수정
      </Link>
      <button
        onClick={toggle}
        className="rounded-lg bg-brand px-2.5 py-1.5 text-[13px] font-medium text-white hover:opacity-80"
      >
        {todo.completed ? "취소" : "완료"}
      </button>
      <button
        onClick={remove}
        className="rounded-lg bg-danger-soft px-2.5 py-1.5 text-[13px] font-medium text-danger hover:opacity-80"
      >
        삭제
      </button>

      {error && (
        <p className="mt-2 text-sm text-danger">
          저장에 실패했습니다. 다시 시도하세요.
        </p>
      )}
    </li>
  );
}
