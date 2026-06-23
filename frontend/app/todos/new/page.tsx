import Link from "next/link";

import TodoForm from "./TodoForm";

// 새 할 일 생성 페이지 (Server 껍데기 + Client 폼)
export default function NewTodoPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">새 할 일</h1>
        <Link href="/todos" className="text-sm text-blue-600 hover:underline">
          목록으로
        </Link>
      </div>
      <TodoForm />
    </main>
  );
}
