"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { Todo } from "../types";
import { todoApi } from "../_lib/api";

export default function TodoItem({ todo }: { todo: Todo }) {
  const router = useRouter();
  const [error, setError] = useState(false);

  async function toggle() {
    setError(false);
    try {
      await todoApi.update(todo.id, { completed: !todo.completed });
      router.refresh();
    } catch {
      setError(true);
    }
  }

  async function remove() {
    setError(false);
    try {
      await todoApi.remove(todo.id);
      router.refresh();
    } catch {
      setError(true);
    }
  }

  return (
    <li className="flex items-center gap-2.5 rounded-[10px] border-[1.5px] border-line p-3.5">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={toggle}
        aria-label={todo.completed ? "완료 취소" : "완료"}
        className="h-4 w-4 accent-brand"
      />
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
