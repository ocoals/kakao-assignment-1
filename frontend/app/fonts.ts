// 제목("Todo List")에만 쓰는 장식용 폰트.
// layout.tsx와 page.tsx 양쪽에서 import할 수 있도록 별도 파일로 분리한다.
import { Lobster } from "next/font/google";

export const lobster = Lobster({
  weight: "400",
  subsets: ["latin"],
});
