"use client";

import { useRouter, useSearchParams } from "next/navigation";

import type { Todo } from "../types";
import {
  formatDateKey,
  parseDateKey,
  getWeekDates,
  addWeeks,
} from "../date";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

// 주간 날짜 선택 바 (Client). 선택 날짜는 URL의 ?date= 로 관리한다.
// - todos: 각 날짜의 할 일 개수 표시용 (날짜 무관 전체 목록)
// - selectedDate: 현재 선택된 날짜 키("YYYY-MM-DD")
export default function WeekStrip({
  todos,
  selectedDate,
}: {
  todos: Todo[];
  selectedDate: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selected = parseDateKey(selectedDate);
  const weekDates = getWeekDates(selected);
  const todayKey = formatDateKey(new Date());
  const rangeLabel = `${formatDateKey(weekDates[0])} ~ ${formatDateKey(weekDates[6])}`;

  // 날짜 이동: 기존 쿼리(filter/search)는 보존하고 date만 교체한다.
  function goToDate(key: string) {
    const params = new URLSearchParams(searchParams);
    params.set("date", key);
    router.push(`/todos?${params.toString()}`);
  }

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => goToDate(formatDateKey(addWeeks(selected, -1)))}
          className="text-lg text-brand"
          aria-label="이전 주"
        >
          ◀
        </button>
        <p className="text-[15px] font-semibold text-subtle">{rangeLabel}</p>
        <button
          onClick={() => goToDate(formatDateKey(addWeeks(selected, 1)))}
          className="text-lg text-brand"
          aria-label="다음 주"
        >
          ▶
        </button>
      </div>

      <div className="flex gap-1">
        {weekDates.map((date, i) => {
          const key = formatDateKey(date);
          const count = todos.filter((todo) => todo.date === key).length;
          const isSelected = key === selectedDate;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              onClick={() => goToDate(key)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-3 ${
                isSelected ? "bg-brand" : isToday ? "bg-brand-soft" : ""
              }`}
            >
              <span
                className={`text-xs ${
                  isSelected ? "text-white" : isToday ? "text-brand" : "text-subtle"
                }`}
              >
                {DAY_LABELS[i]}
              </span>
              <span
                className={`text-base font-bold ${
                  isSelected ? "text-white" : isToday ? "text-brand" : "text-ink"
                }`}
              >
                {date.getDate()}
              </span>
              <span
                className={`text-[11px] ${
                  isSelected
                    ? "text-white/70"
                    : isToday
                      ? "text-brand/60"
                      : "text-subtle"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
