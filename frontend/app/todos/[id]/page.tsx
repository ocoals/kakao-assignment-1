import Link from "next/link";

import { getTodo } from "../actions";
import EditForm from "./EditForm";

// 할 일 수정 페이지 (Server). id로 기존 Todo를 조회해 폼에 prefill 한다.
export default async function EditTodoPage({ params }: PageProps<"/todos/[id]">) {
  // Next.js 16: params는 Promise → await
  const { id } = await params;
  const todo = await getTodo(id); // 없으면 actions에서 notFound()

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">할 일 수정</h1>
        <Link href="/todos" className="text-sm text-blue-600 hover:underline">
          목록으로
        </Link>
      </div>
      <EditForm todo={todo} />
    </main>
  );
}
