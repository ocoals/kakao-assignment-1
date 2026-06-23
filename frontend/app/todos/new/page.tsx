import { Suspense } from "react";
import Link from "next/link";

import { lobster } from "../../fonts";
import TodoForm from "../_components/TodoForm";

// 새 할 일 생성 페이지 (Server 껍데기 + Client 폼)
export default function NewTodoPage() {
  return (
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <h1
          className={`${lobster.className} mb-6 text-center text-4xl text-brand`}
        >
          Todo List
        </h1>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-ink">새 할 일</p>
          <Link href="/todos" className="text-sm text-brand hover:opacity-80">
            목록으로
          </Link>
        </div>

        {/* useSearchParams를 쓰는 클라이언트 폼은 Suspense로 감싼다 (Next 빌드 요구) */}
        <Suspense>
          <TodoForm redirectToList />
        </Suspense>
      </div>
    </div>
  );
}
