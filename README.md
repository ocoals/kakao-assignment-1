# Todo List (React)

주간 캘린더에서 날짜를 골라 그 날의 할 일을 관리하는 Todo 앱입니다.
1차 과제(Vanilla JS)를 **React + Vite + Tailwind CSS v4**로 마이그레이션한 2차 과제입니다.

## 기능

- **할 일 CRUD** — 추가 / 인라인 수정(저장, 취소, Enter) / 완료 토글 / 삭제
- **상태 필터** — 전체 / 진행중 / 완료
- **주간 날짜 뷰** — 월~일 주간 스트립, 오늘/선택 날짜 표시, 날짜별 개수, 이전/다음 주 이동
- **날짜별 관리** — 선택한 날짜의 할 일만 표시(상태 필터와 동시 적용)
- **localStorage 영속화** — 새로고침 후에도 할 일과 선택 날짜 유지

## 주간, 일간 통합 뷰

별도의 일간 화면을 두지 않고, **주간 스트립 안에서 하루를 선택하는 방식**으로 주간 뷰와 일간 뷰를 하나로 합쳤습니다.

- 주간 스트립은 **7일을 한눈에 보여주고(주간), 날짜별 할 일 개수**를 함께 표시합니다.
- 한 날짜를 클릭하면 `selectedDate`가 바뀌고, 목록에는 **그 하루의 할 일만(일간)** 표시됩니다.
- 즉 "주간 한눈에 보기 + 하루 선택"과 "선택한 하루의 일간 목록"이 한 화면에서 맞물려 동작합니다.

```
선택한 날짜(selectedDate) → 그 날짜의 할 일만 필터(visibleTodos) → 목록 표시
                          ↳ 상태 필터(전체/진행중/완료)도 동시 적용
```

## 기술 스택

- React 19
- Vite
- Tailwind CSS v4 (`@tailwindcss/vite`, `@theme` 색 토큰)

## 실행 방법

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 결과 미리보기
```

## 프로젝트 구조

```
src/
├── App.jsx                 # 훅 3개 조립 + 화면 렌더
├── main.jsx                # 진입점
├── index.css               # Tailwind + 색/폰트 토큰
├── hooks/
│   ├── useTodos.js         # 할 일 상태·CRUD·localStorage
│   ├── useSelectedDate.js  # 선택 날짜 상태·localStorage
│   └── useFilteredTodos.js # 필터 상태 + 보일 목록 계산
├── components/
│   ├── index.js            # 배럴(컴포넌트 모아 내보내기)
│   ├── TodoForm.jsx        # 입력/추가
│   ├── FilterTabs.jsx      # 전체/진행중/완료 탭
│   ├── WeekStrip.jsx       # 주간 스트립
│   ├── TodoList.jsx        # 목록 + 빈 상태
│   └── TodoItem.jsx        # 개별 항목(수정/완료/삭제)
└── utils/
    └── date.js             # 날짜 헬퍼(로컬 시간 기준 YYYY-MM-DD)
```
