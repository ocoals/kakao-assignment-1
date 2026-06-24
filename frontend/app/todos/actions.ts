// 서버에서만 도는 읽기 헬퍼. 클라가 호출하는 Server Action이 아니라
// Server Component가 직접 import하는 일반 함수라 "use server"를 안 붙인다.
import { notFound } from "next/navigation";

import type { Todo } from "./types";

const BACKEND_URL = process.env.BACKEND_URL; // 서버 전용(브라우저 비노출)

export async function getTodos(
  date?: string,
  filter?: string,
  search?: string,
): Promise<Todo[]> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (filter) params.set("filter", filter);
  if (search) params.set("search", search);

  const query = params.toString();
  const url = `${BACKEND_URL}/todos${query ? `?${query}` : ""}`;

  const res = await fetch(url, { cache: "no-store" }); // 매번 최신 조회
  if (!res.ok) {
    throw new Error("할 일 목록을 불러오지 못했습니다.");
  }
  return res.json();
}

// 백엔드에 GET /todos/{id}가 없어 전체를 읽어 id로 찾는다. 없으면 404.
export async function getTodo(id: string): Promise<Todo> {
  const todos = await getTodos();
  const todo = todos.find((t) => t.id === Number(id));
  if (!todo) {
    notFound();
  }
  return todo;
}
