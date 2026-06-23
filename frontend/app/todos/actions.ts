// 읽기 전용 서버 fetch 헬퍼.
// Server Component(page.tsx)에서 직접 import해 호출하므로 "use server"를 붙이지 않는다.
// (클라이언트가 호출하는 Server Action이 아니라, 서버에서만 도는 일반 함수)
import { notFound } from "next/navigation";

import type { Todo } from "./types";

// 서버 → FastAPI 직접 호출용 베이스 URL (브라우저에 노출되지 않음)
const BACKEND_URL = process.env.BACKEND_URL;

// 할 일 목록 조회. filter/search는 그대로 FastAPI 쿼리 파라미터로 전달한다.
// no-store: 캐시에 저장하지 않아 재렌더될 때마다 항상 최신 목록을 가져온다.
export async function getTodos(filter?: string, search?: string): Promise<Todo[]> {
  const params = new URLSearchParams();
  if (filter) params.set("filter", filter);
  if (search) params.set("search", search);

  const query = params.toString();
  const url = `${BACKEND_URL}/todos${query ? `?${query}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("할 일 목록을 불러오지 못했습니다.");
  }
  return res.json();
}

// 단일 할 일 조회.
// 백엔드에 GET /todos/{id}가 없으므로, 전체 목록을 읽어 id로 찾는다.
// 못 찾으면 notFound()로 404 페이지를 보여준다.
export async function getTodo(id: string): Promise<Todo> {
  const todos = await getTodos();
  const todo = todos.find((t) => t.id === Number(id));
  if (!todo) {
    notFound();
  }
  return todo;
}
