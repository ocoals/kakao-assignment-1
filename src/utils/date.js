export function formatDateKey(date) {
  // toISOString()은 UTC로 변환돼 한국에서 날짜가 하루 밀릴 수 있어 직접 만든다.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key) {
  // new Date("2026-06-10")은 UTC로 해석돼 날짜가 밀리므로, 숫자로 쪼개 로컬 Date로 만든다.
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getMonday(date) {
  const day = date.getDay(); // 0=일, 1=월, ... 6=토
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
}

export function getWeekDates(date) {
  const monday = getMonday(date);
  return [0, 1, 2, 3, 4, 5, 6].map((i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function addWeeks(date, n) {
  const d = new Date(date);
  d.setDate(date.getDate() + n * 7);
  return d;
}
