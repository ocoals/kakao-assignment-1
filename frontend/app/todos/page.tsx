import { Suspense } from "react";
import Link from "next/link";

import { getTodos } from "./actions";
import { formatDateKey } from "./date";
import { lobster } from "../fonts";
import TodoItem from "./_components/TodoItem";
import FilterTabs from "./_components/FilterTabs";
import SearchBox from "./_components/SearchBox";
import WeekStrip from "./_components/WeekStrip";
import TodoForm from "./_components/TodoForm";

// 할 일 목록 페이지 (Server Component).
// searchParams의 date/filter/search를 읽어 서버에서 필터링된 목록을 받아 렌더한다.
export default async function TodosPage({
  searchParams,
}: PageProps<"/todos">) {
  // Next.js 16: searchParams는 Promise → await
  const { date, filter, search } = await searchParams;
  const filterStr = typeof filter === "string" ? filter : undefined;
  const searchStr = typeof search === "string" ? search : undefined;

  // date 파라미터가 없으면 오늘 날짜를 선택한 것으로 본다.
  const selectedDate =
    typeof date === "string" ? date : formatDateKey(new Date());

  // 화면에 보일 목록: 선택 날짜 + 필터 + 검색을 모두 적용
  const visibleTodos = await getTodos(selectedDate, filterStr, searchStr);
  // WeekStrip의 날짜별 개수 계산용: 날짜 무관 전체 목록
  const allTodos = await getTodos();

  return (
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <h1
          className={`${lobster.className} mb-6 text-center text-4xl text-brand`}
        >
          Todo List
        </h1>

        <WeekStrip todos={allTodos} selectedDate={selectedDate} />

        {/* 인라인 추가 폼 (공용 TodoForm — 머무름 모드) */}
        <Suspense>
          <TodoForm />
        </Suspense>

        {/* 별도 생성 페이지로 가는 보조 링크 (과제 필수 페이지) */}
        <div className="mt-2 text-right">
          <Link
            href={`/todos/new?date=${selectedDate}`}
            className="text-[13px] text-brand hover:underline"
          >
            별도 페이지에서 추가 →
          </Link>
        </div>

        {/* useSearchParams를 쓰는 클라이언트 컴포넌트는 Suspense로 감싼다 (Next 빌드 요구) */}
        <Suspense>
          <FilterTabs />
          <div className="mt-4">
            <SearchBox />
          </div>
        </Suspense>

        <ul className="mt-5 flex flex-col gap-2">
          {visibleTodos.length === 0 ? (
            <p className="mt-5 text-center text-subtle">할 일이 없어요</p>
          ) : (
            visibleTodos.map((todo) => <TodoItem key={todo.id} todo={todo} />)
          )}
        </ul>
      </div>
    </div>
  );
}
