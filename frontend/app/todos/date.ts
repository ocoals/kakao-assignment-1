// 날짜 유틸 (순수 함수 모음). 서버·클라이언트 양쪽에서 공용으로 쓴다.
// 2차 과제의 src/utils/date.js를 TypeScript로 포팅했다.

// Date → "YYYY-MM-DD" (로컬 기준).
// toISOString()은 UTC로 변환돼 한국에서 날짜가 하루 밀릴 수 있어 직접 만든다.
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "2026-06-10" → 로컬 Date.
// new Date("2026-06-10")은 UTC로 해석돼 날짜가 밀리므로, 숫자로 쪼개 로컬 Date로 만든다.
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// 주어진 날짜가 속한 주의 월요일.
export function getMonday(date: Date): Date {
  const day = date.getDay(); // 0=일, 1=월, ... 6=토
  const diff = day === 0 ? -6 : 1 - day; // 일요일이면 6일 전, 그 외엔 월요일까지
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  return monday;
}

// 그 주의 월~일 7일을 Date 배열로.
export function getWeekDates(date: Date): Date[] {
  const monday = getMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// ±n주 이동한 날짜.
export function addWeeks(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(date.getDate() + n * 7);
  return d;
}
