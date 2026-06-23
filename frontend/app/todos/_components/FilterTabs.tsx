"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
] as const;

// 필터 탭. 클릭 시 URL의 filter 파라미터만 변경한다(date·search는 보존).
export default function FilterTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("filter") ?? "all";

  function selectFilter(value: string) {
    // 기존 쿼리를 복제한 뒤 자기 키(filter)만 변경
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("filter");
    } else {
      params.set("filter", value);
    }
    const query = params.toString();
    router.push(`/todos${query ? `?${query}` : ""}`);
  }

  return (
    <div className="mt-4 flex gap-1.5">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => selectFilter(tab.value)}
          className={`flex-1 rounded-full py-2.5 text-sm font-medium ${
            current === tab.value
              ? "bg-brand text-white"
              : "bg-brand-soft text-brand"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
