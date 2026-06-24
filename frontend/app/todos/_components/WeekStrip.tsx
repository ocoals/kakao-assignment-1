"use client";

import type { Todo } from "../types";
import {
  formatDateKey,
  parseDateKey,
  getWeekDates,
  addWeeks,
} from "../date";
import { useSetParam } from "../_hooks/useSetParam";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

export default function WeekStrip({
  todos,
  selectedDate,
}: {
  todos: Todo[]; // 날짜별 개수 표시용 (전체)
  selectedDate: string;
}) {
  const setParam = useSetParam();

  const selected = parseDateKey(selectedDate);
  const weekDates = getWeekDates(selected);
  const todayKey = formatDateKey(new Date());
  const rangeLabel = `${formatDateKey(weekDates[0])} ~ ${formatDateKey(weekDates[6])}`;

  function goToDate(key: string) {
    setParam("date", key); // filter/search 보존, date만 교체
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
