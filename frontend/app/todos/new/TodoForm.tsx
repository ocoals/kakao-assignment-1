"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 할 일 생성 폼. 빈/공백 입력은 거부하고, 제출 성공 후 목록으로 이동한다.
export default function TodoForm() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);

    // 클라이언트 1차 방어: 빈/공백 거부 (백엔드도 422로 2차 방어)
    if (!text.trim()) return;

    try {
      const res = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (!res.ok) throw new Error();
      // 순서 고정: refresh로 서버 데이터 무효화 → push로 목록 이동
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
        aria-label="할 일"
        placeholder="할 일을 입력하세요"
        className="rounded border border-gray-300 px-3 py-2"
      />
      <button
        type="submit"
        className="rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-700"
      >
        추가
      </button>
      {error && (
        <p className="text-sm text-red-600">
          저장에 실패했습니다. 다시 시도하세요.
        </p>
      )}
    </form>
  );
}
