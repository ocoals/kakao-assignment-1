// 클라이언트의 모든 쓰기 요청을 한 곳으로 모은 모듈.
// fetch를 직접 쓰지 않고 여기를 거치면, 나중에 헤더를 바꾸거나
// fetch를 다른 라이브러리로 교체할 때 이 파일만 고치면 된다.
import type { Todo } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 응답이 실패(2xx 아님)일 때 던지는 에러. status로 종류를 구분할 수 있다.
export class ApiError extends Error {
  status: number;
  constructor(status: number) {
    super(`요청 실패 (${status})`);
    this.status = status;
  }
}

async function request(path: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new ApiError(res.status);
  }
  return res.status === 204 ? null : res.json(); // 204(삭제)는 본문 없음
}

export const todoApi = {
  create: (text: string, date: string): Promise<Todo> =>
    request("/todos", {
      method: "POST",
      body: JSON.stringify({ text, date }),
    }),

  update: (
    id: number,
    patch: { text?: string; completed?: boolean },
  ): Promise<Todo> =>
    request(`/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    }),

  remove: (id: number): Promise<null> =>
    request(`/todos/${id}`, { method: "DELETE" }),
};
