import { redirect } from "next/navigation";

// 루트(/) 접속 시 할 일 목록으로 이동
export default function Home() {
  redirect("/todos");
}
