"use client"; // 에러 바운더리는 반드시 클라이언트 컴포넌트

// 서버 렌더 에러(예: 백엔드 다운) 전용 폴백. 클라 쓰기 실패는 각 컴포넌트가 인라인 처리.
export default function Error({
  unstable_retry,
}: {
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <h2 className="text-lg font-semibold text-ink">문제가 발생했습니다</h2>
        <p className="mt-2 text-sm text-subtle">
          할 일 목록을 불러오지 못했습니다. 잠시 후 다시 시도하세요.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="mt-4 rounded bg-brand px-4 py-2 text-sm text-white hover:bg-brand-hover"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
