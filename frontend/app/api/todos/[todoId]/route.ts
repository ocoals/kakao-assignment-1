// 쓰기 프록시(PUT/DELETE): 클라이언트 → 이 핸들러 → FastAPI
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.BACKEND_URL;

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/todos/[todoId]">,
) {
  const { todoId } = await params; // Next 16: Promise라 await
  const body = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/todos/${todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    revalidatePath("/todos");

    return Response.json(data, { status: res.status });
  } catch {
    return Response.json(
      { error: "백엔드에 연결할 수 없습니다." },
      { status: 502 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/todos/[todoId]">,
) {
  const { todoId } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/todos/${todoId}`, {
      method: "DELETE",
    });

    revalidatePath("/todos");

    return new Response(null, { status: res.status }); // 204: 본문 없음
  } catch {
    return Response.json(
      { error: "백엔드에 연결할 수 없습니다." },
      { status: 502 },
    );
  }
}
