import { useState, useEffect } from "react";
import { formatDateKey, parseDateKey } from "../utils/date";

export function useSelectedDate() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const saved = localStorage.getItem("selectedDate");
    return saved ? parseDateKey(saved) : new Date();
  });

  useEffect(() => {
    localStorage.setItem("selectedDate", formatDateKey(selectedDate));
  }, [selectedDate]);

  return { selectedDate, setSelectedDate };
}
