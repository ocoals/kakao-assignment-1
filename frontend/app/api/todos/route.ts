// 쓰기 프록시(POST): 클라이언트 → 이 핸들러 → FastAPI.
import { revalidatePath } from "next/cache";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const res = await fetch(`${BACKEND_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    // 캐시 무효화 안전망 (실제 UI 갱신 동력은 클라이언트의 router.refresh)
    revalidatePath("/todos");

    return Response.json(data, { status: res.status });
  } catch {
    // 백엔드(FastAPI)가 꺼져 있으면 fetch가 throw → 502로 정리(처리되지 않은 500 방지)
    return Response.json(
      { error: "백엔드에 연결할 수 없습니다." },
      { status: 502 },
    );
  }
}
