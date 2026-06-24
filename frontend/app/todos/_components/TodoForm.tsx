"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { formatDateKey } from "../date";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function TodoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const date = searchParams.get("date") ?? formatDateKey(new Date());

  const [text, setText] = useState("");
  const [error, setError] = useState(false);
  const [empty, setEmpty] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setEmpty(false);

    if (!text.trim()) {
      setEmpty(true);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), date }),
      });
      if (!res.ok) throw new Error();

      router.refresh();
      setText("");
    } catch {
      setError(true);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="할 일"
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
      {empty && <p className="mt-2.5 text-[13px] text-brand">할 일을 입력해 주세요.</p>}
      {error && (
        <p className="mt-2.5 text-[13px] text-danger">
          저장에 실패했습니다. 다시 시도하세요.
        </p>
      )}
    </form>
  );
}
