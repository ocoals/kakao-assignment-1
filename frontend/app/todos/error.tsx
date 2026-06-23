"use client"; // 에러 바운더리는 반드시 클라이언트 컴포넌트

// 서버 렌더 에러(예: 백엔드 다운) 전용 폴백.
// 클라이언트 쓰기 실패(토글/삭제/저장)는 각 컴포넌트의 인라인 에러로 처리한다.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h2 className="text-lg font-semibold">문제가 발생했습니다</h2>
      <p className="mt-2 text-sm text-gray-600">
        할 일 목록을 불러오지 못했습니다. 잠시 후 다시 시도하세요.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="mt-4 rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
      >
        다시 시도
      </button>
    </main>
  );
}
