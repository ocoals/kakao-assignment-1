// 동적 라우트 쓰기 프록시(PUT/DELETE): 클라이언트 → 이 핸들러 → FastAPI.
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.BACKEND_URL;

export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/todos/[id]">,
) {
  const { id } = await params; // Next.js 16: params는 Promise → await
  const body = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
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
  { params }: RouteContext<"/api/todos/[id]">,
) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND_URL}/todos/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/todos");

    // DELETE 성공은 204(본문 없음) → 본문 없이 상태코드만 전달
    return new Response(null, { status: res.status });
  } catch {
    return Response.json(
      { error: "백엔드에 연결할 수 없습니다." },
      { status: 502 },
    );
  }
}
