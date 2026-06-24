"use client";

import { useSearchParams } from "next/navigation";

import { useSetParam } from "../_hooks/useSetParam";

const TABS = [
  { value: "all", label: "전체" },
  { value: "active", label: "진행중" },
  { value: "completed", label: "완료" },
] as const;

export default function FilterTabs() {
  const searchParams = useSearchParams();
  const setParam = useSetParam();
  const current = searchParams.get("filter") ?? "all";

  function selectFilter(value: string) {
    setParam("filter", value === "all" ? null : value);
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
