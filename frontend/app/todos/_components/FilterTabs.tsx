"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
] as const;

// 필터 탭. 클릭 시 URL의 filter 파라미터만 변경한다(search는 보존 → 공존 보장).
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
    <div className="flex gap-2">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => selectFilter(tab.value)}
          className={`rounded px-3 py-1 text-sm ${
            current === tab.value
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
