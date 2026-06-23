// 목록 데이터 로딩 중 보여줄 폴백 UI
export default function Loading() {
  return (
    <div className="flex min-h-screen justify-center bg-surface px-5 py-15">
      <div className="w-full max-w-120 rounded-3xl bg-white p-8 shadow-[0_20px_50px_rgba(103,43,224,0.12)]">
        <p className="text-center text-subtle">불러오는 중...</p>
      </div>
    </div>
  );
}
