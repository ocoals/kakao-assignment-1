"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useSetParam } from "../_hooks/useSetParam";

export default function SearchBox() {
  const searchParams = useSearchParams();
  const setParam = useSetParam();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  // 입력이 ~300ms 멈춘 뒤 한 번만 URL을 갱신한다 (디바운스)
  useEffect(() => {
    const timer = setTimeout(() => {
      setParam("search", value.trim() || null);
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
