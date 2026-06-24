import { Suspense } from "react";

import { getTodos } from "./actions";
import { formatDateKey } from "./date";
import { lobster } from "../fonts";
import TodoItem from "./_components/TodoItem";
import FilterTabs from "./_components/FilterTabs";
import SearchBox from "./_components/SearchBox";
import WeekStrip from "./_components/WeekStrip";
import TodoForm from "./_components/TodoForm";

export default async function TodosPage({
  searchParams,
}: PageProps<"/todos">) {
  const { date, filter, search } = await searchParams; // Next 16: Promise라 await
  const filterStr = typeof filter === "string" ? filter : undefined;
  const searchStr = typeof search === "string" ? search : undefined;
  const selectedDate =
    typeof date === "string" ? date : formatDateKey(new Date());

  const visibleTodos = await getTodos(selectedDate, filterStr, searchStr);
  const allTodos = await getTodos(); // 날짜별 개수 계산용(날짜 무관 전체)

  return (
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <h1
          className={`${lobster.className} mb-6 text-center text-4xl text-brand`}
        >
          Todo List
        </h1>

        <WeekStrip todos={allTodos} selectedDate={selectedDate} />

        {/* useSearchParams를 쓰는 컴포넌트는 Suspense로 감싼다 (Next 빌드 요구) */}
        <Suspense>
          <TodoForm />
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
