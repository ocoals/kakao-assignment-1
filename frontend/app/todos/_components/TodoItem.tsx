"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { Todo } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 목록의 할 일 한 건. 완료 토글/삭제를 처리한다.
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
    <li className="rounded border border-gray-200 p-3">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={toggle}
          className="h-4 w-4"
        />
        <span
          className={`flex-1 ${
            todo.completed ? "text-gray-400 line-through" : ""
          }`}
        >
          {todo.text}
        </span>
        <Link
          href={`/todos/${todo.id}`}
          className="text-sm text-blue-600 hover:underline"
        >
          수정
        </Link>
        <button
          onClick={remove}
          className="text-sm text-red-600 hover:underline"
        >
          삭제
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">
          저장에 실패했습니다. 다시 시도하세요.
        </p>
      )}
    </li>
  );
}
