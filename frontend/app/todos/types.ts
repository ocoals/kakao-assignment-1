// 할 일 한 건을 나타내는 공통 타입 (백엔드 TodoRead와 동일한 모양)
export type Todo = {
  id: number;
  text: string;
  completed: boolean;
  date: string; // "YYYY-MM-DD" (로컬 기준 날짜 키)
};
