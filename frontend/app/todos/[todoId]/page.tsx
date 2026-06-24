import Link from "next/link";

import { getTodo } from "../actions";
import { lobster } from "../../fonts";
import EditForm from "./EditForm";

export default async function EditTodoPage({
  params,
}: PageProps<"/todos/[todoId]">) {
  const { todoId } = await params; // Next 16: Promise라 await
  const todo = await getTodo(todoId);

  return (
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <h1
          className={`${lobster.className} mb-6 text-center text-4xl text-brand`}
        >
          Todo List
        </h1>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-lg font-semibold text-ink">할 일 수정</p>
          <Link href="/todos" className="text-sm text-brand hover:opacity-80">
            목록으로
          </Link>
        </div>

        <EditForm todo={todo} />
      </div>
    </div>
  );
}
