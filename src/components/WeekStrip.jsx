import { formatDateKey, getWeekDates, addWeeks } from "../utils/date";

const DAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];

function WeekStrip({ selectedDate, onSelectDate, todos }) {
  const weekDates = getWeekDates(selectedDate);
  const selectedKey = formatDateKey(selectedDate);
  const todayKey = formatDateKey(new Date());

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => onSelectDate(addWeeks(selectedDate, -1))}
          className="px-2 text-gray-500"
        >
          ‹ 이전 주
        </button>
        <button
          onClick={() => onSelectDate(addWeeks(selectedDate, 1))}
          className="px-2 text-gray-500"
        >
          다음 주 ›
        </button>
      </div>

      <div className="flex gap-1">
        {weekDates.map((date, i) => {
          const key = formatDateKey(date);
          const count = todos.filter((todo) => todo.date === key).length;
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              onClick={() => onSelectDate(date)}
              className={`flex-1 rounded py-2 text-center text-sm ${
                isSelected
                  ? "bg-blue-500 text-white"
                  : isToday
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <div>{DAY_LABELS[i]}</div>
              <div className="font-medium">{date.getDate()}</div>
              {count > 0 && <div className="text-xs">{count}개</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default WeekStrip;
