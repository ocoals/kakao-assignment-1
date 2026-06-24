"use client";

import { useRouter, useSearchParams } from "next/navigation";

// 현재 쿼리를 보존한 채 한 키만 교체해 /todos로 이동. 값이 비면 키 제거.
export function useSetParam() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const query = params.toString();
    router.push(`/todos${query ? `?${query}` : ""}`);
  };
}
