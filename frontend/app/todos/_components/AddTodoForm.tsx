"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { formatDateKey } from "../date";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 목록 화면 안에서 바로 추가하는 인라인 폼 (2차 방식).
// 별도 페이지(new/TodoForm)와 달리 제출 후 페이지 이동 없이,
// 입력을 비우고 router.refresh()로 그 자리에서 목록만 갱신한다.
export default function AddTodoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 현재 보고 있는 날짜에 추가한다. ?date= 없으면 오늘.
  const date = searchParams.get("date") ?? formatDateKey(new Date());

  const [text, setText] = useState("");
  const [error, setError] = useState(false);
  const [empty, setEmpty] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setEmpty(false);

    // 클라이언트 1차 방어: 빈/공백 거부 (백엔드도 422로 2차 방어)
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
      // 페이지 이동 없이: 입력 비우고 목록만 새로고침
      setText("");
      router.refresh();
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
