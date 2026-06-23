import { Suspense } from "react";
import Link from "next/link";

import { getTodos } from "./actions";
import TodoItem from "./_components/TodoItem";
import FilterTabs from "./_components/FilterTabs";
import SearchBox from "./_components/SearchBox";

// 할 일 목록 페이지 (Server Component).
// searchParams의 filter/search를 읽어 서버에서 필터링된 목록을 받아 렌더한다.
export default async function TodosPage({
  searchParams,
}: PageProps<"/todos">) {
  // Next.js 16: searchParams는 Promise → await
  const { filter, search } = await searchParams;
  const filterStr = typeof filter === "string" ? filter : undefined;
  const searchStr = typeof search === "string" ? search : undefined;

  const todos = await getTodos(filterStr, searchStr);

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">할 일</h1>
        <Link
          href="/todos/new"
          className="rounded bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-700"
        >
          새 할 일
        </Link>
      </div>

      {/* useSearchParams를 쓰는 클라이언트 컴포넌트는 Suspense로 감싼다 (Next 빌드 요구) */}
      <Suspense>
        <div className="mt-4 flex flex-col gap-3">
          <FilterTabs />
          <SearchBox />
        </div>
      </Suspense>

      <ul className="mt-6 flex flex-col gap-2">
        {todos.length === 0 ? (
          <li className="rounded border border-dashed border-gray-300 p-6 text-center text-gray-500">
            할 일이 없습니다
          </li>
        ) : (
          todos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
        )}
      </ul>
    </main>
  );
}
