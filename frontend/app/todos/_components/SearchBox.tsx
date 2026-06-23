"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 검색창. 입력을 ~300ms 디바운스한 뒤 URL의 search 파라미터만 변경한다(filter 보존).
export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    // 키 입력마다가 아니라, 입력이 ~300ms 멈춘 뒤 한 번만 URL을 갱신한다
    const timer = setTimeout(() => {
      // 기존 쿼리를 복제한 뒤 자기 키(search)만 변경
      const params = new URLSearchParams(searchParams);
      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search"); // 빈 검색은 파라미터 제거
      }
      const query = params.toString();
      router.push(`/todos${query ? `?${query}` : ""}`);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-label="검색"
      placeholder="검색"
      className="w-full rounded-[10px] border-[1.5px] border-line px-3.5 py-3 text-[15px] outline-none focus:border-brand"
    />
  );
}
