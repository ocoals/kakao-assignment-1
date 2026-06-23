<!-- Generated: 2026-06-08 | Updated: 2026-06-23 -->

# todo-vanilla

## Purpose
주간 캘린더 뷰에서 날짜를 선택하고 그 날짜의 할 일을 추가·수정·완료·삭제하며, 상태(전체/진행중/완료)로 필터링하는 Todo 앱이다. 모든 데이터는 `localStorage`에 저장되어 새로고침 후에도 유지된다.

원래 1차(부트캠프) 과제는 순수 Vanilla JS였고, **2차 과제에서 React(Vite + Tailwind CSS v4)로 마이그레이션을 완료**했다(기능 AC 19개 전부 구현). 현재 앱의 실체는 `src/` 아래 React 코드다. 마이그레이션 요구사항·결정 기록은 `docs/PLAN.md` 참고(원본은 `.omc/specs/deep-interview-react-todo-migration.md`).

## Key Files

| File | Description |
|------|-------------|
| `index.html` | Vite 진입 HTML. `#root` div + `/src/main.jsx`를 로드한다. |
| `src/main.jsx` | `createRoot`로 `App`을 렌더(StrictMode). |
| `src/App.jsx` | **조립 컴포넌트.** 커스텀 훅 3개(`useTodos`/`useSelectedDate`/`useFilteredTodos`)를 조합해 자식에 props로 내려준다. `useState`/`useEffect`를 직접 두지 않는다. |
| `src/hooks/useTodos.js` | **커스텀 훅.** `todos` 상태 + CRUD 핸들러(`addTodo`/`completeTodo`/`editTodo`/`deleteTodo`) + `localStorage` 자동 저장(`useEffect`)을 묶어 반환. |
| `src/hooks/useSelectedDate.js` | **커스텀 훅.** 선택 날짜 상태 + 함수형 초기화/저장(`localStorage`). `{ selectedDate, setSelectedDate }` 반환. |
| `src/hooks/useFilteredTodos.js` | **커스텀 훅.** `currentFilter` 상태 + 날짜·상태로 거른 `visibleTodos` 계산. `(todos, dateKey)`를 받아 `{ currentFilter, setCurrentFilter, visibleTodos }` 반환. |
| `src/components/index.js` | **배럴 파일.** 컴포넌트를 모아 다시 내보내 `import { ... } from "./components"`로 쓰게 한다. 내부 전용 `TodoItem`은 제외. |
| `src/components/TodoForm.jsx` | 입력/추가. 빈 입력 시 `message` 상태로 안내 문구 표시. |
| `src/components/FilterTabs.jsx` | 전체/진행중/완료 탭. `filters` 배열을 map. |
| `src/components/WeekStrip.jsx` | 주간 스트립(월~일 7칸), 이전/다음 주, 날짜별 개수, 오늘·선택 강조. |
| `src/components/TodoList.jsx` | 목록 렌더 + 빈 상태 메시지(early return). |
| `src/components/TodoItem.jsx` | 개별 항목. `isEditing` 상태로 인라인 수정(저장/취소/Enter), 완료 토글·삭제. |
| `src/utils/date.js` | 날짜 헬퍼: `formatDateKey`/`parseDateKey`/`getMonday`/`getWeekDates`/`addWeeks`. |
| `src/index.css` | `@import "tailwindcss";` + `@theme`에 보라 테마 색 토큰 정의. |
| `vite.config.js` | `@vitejs/plugin-react` + `@tailwindcss/vite` 플러그인. |
| `.gitignore` | `.omc/`를 무시. `AGENTS.md`는 추적·커밋(공유 목적). |

## For AI Agents

### Working In This Directory
- **React 함수 컴포넌트 + Vite + Tailwind v4.** 빌드·실행은 npm 스크립트(`npm run dev` / `npm run build`).
- **상태는 커스텀 훅 3개에 나눠 있다.** `useTodos`(할 일·CRUD·영속화), `useSelectedDate`(선택 날짜·영속화), `useFilteredTodos`(필터 상태 + 보일 목록 계산). App은 이 셋을 조합만 하고 `useState`/`useEffect`를 직접 두지 않는다. 자식 컴포넌트는 props로 받은 데이터를 그리고, 이벤트는 props 콜백(`onAdd`/`onComplete`/`onEdit`/`onDelete`/`onSelectDate`/`onChange`)으로 위로 올린다. 새 상태는 함부로 자식에 두지 말고, 스테이트풀 로직을 빼낼 땐 `use~` 커스텀 훅 패턴(상태 1개 = 훅 1개)을 쓴다.
- **상태는 불변(immutable)으로 업데이트.** `setTodos([...todos, x])`, `todos.map(...)`, `todos.filter(...)`를 쓰고 기존 배열/객체를 직접 변형하지 말 것. Date도 `setDate`는 원본을 바꾸므로 항상 `new Date(date)`로 복사 후 계산.
- **파생값은 `useState`에 넣지 않는다.** 화면에 보일 목록(`visibleTodos`)·주간 날짜(`getWeekDates`)·날짜별 개수는 렌더 중에 계산한다. 저장 상태는 `todos`/`currentFilter`/`selectedDate`뿐.
- **`key`는 `todo.id`.** `id`는 `crypto.randomUUID()`로 생성(표준 UUID, 충돌 구조적 방지). 배열 인덱스를 key로 쓰지 말 것. Todo 형태는 `{ id, text, completed, date }`.
- **색은 Tailwind `@theme` 토큰으로.** `index.css`의 `--color-brand`/`-surface`/`-ink`/`-subtle`/`-line`/`-danger` 등으로 `bg-brand`·`text-ink` 같은 유틸리티를 쓴다. 색 hex를 컴포넌트에 하드코딩하지 말 것(그림자 등 일회성만 임의값 `[...]` 허용).
- **주석은 "왜(WHY)"만.** self-documenting을 우선하고 이름으로 의도를 드러낸다. 코드만으론 모를 배경(예: `getDay()` 일요일=0, `toISOString` UTC 함정)만 짧게. 주석·식별자는 한국어.

### Testing Requirements
- 자동화 테스트 없음. `npm run dev`로 띄워 브라우저에서 수동 확인.
- 변경 후 **`npm run build`로 문법/빌드 검증**(끝나면 `dist/` 정리). 빠른 검사로도 컴파일 오류를 잡는다.
- 확인 체크리스트: (1) 추가(폼 Enter·버튼), (2) 인라인 수정/완료/삭제, (3) 전체/진행중/완료 필터, (4) 주간 뷰 날짜 클릭 시 해당 날짜 항목만 + 칸별 개수, (5) 이전/다음 주, (6) 새로고침 후 todos·선택 날짜 유지.
- 빈 입력 시 안내 메시지, 항목 0개일 때 빈 상태 문구 확인.

### Common Patterns
- **입력 제출은 `<form onSubmit>` + `event.preventDefault()`.** Enter·추가 버튼을 form submit 하나로 처리한다. (한글 IME 중복 입력을 `isComposing`으로 막지 않는 이유: form submit이 브라우저 차원에서 처리하기 때문.)
- **날짜 키 `"YYYY-MM-DD"`(로컬 시간).** `formatDateKey`가 `padStart(2,"0")`로 만들고(`toISOString()`은 UTC라 금지), `parseDateKey`가 `"2026-06-10"` → 로컬 `Date`로 복원(`new Date("...")` 문자열 파싱은 UTC라 금지, 숫자 분해해 `new Date(y, m-1, d)`). 날짜 비교·저장은 이 키 기준.
- **주 시작은 월요일.** `getMonday`가 선택 날짜가 속한 주의 월요일을 구하고, `getWeekDates`가 월→일 7칸을 만든다(`setDate` 자동 넘침으로 월 경계 처리). `addWeeks(date, n)`로 이전/다음 주.
- **localStorage 동기화:** `useEffect(() => localStorage.setItem(...), [의존성])`로 자동 저장, `useState(() => localStorage.getItem(...) ...)` 함수형 초기화로 복원. 저장(`JSON.stringify`/`formatDateKey`)과 복원(`JSON.parse`/`parseDateKey`)이 짝. todos는 `useTodos`, selectedDate는 `useSelectedDate` 훅이 각각 담당. 훅 안의 `setTodos`는 `(prev) => ...` **함수형 업데이트**로 최신 상태를 받는다.
- **반복 className은 상수로.** 동일한 긴 Tailwind 클래스가 반복되면(예: `TodoItem`의 `buttonClass`) 컴포넌트 상단 상수로 빼서 한 곳에서 관리.
- **콜백은 화살표 함수로**, 목록 순회는 배열 메서드(`map`/`filter`)로.
- **컴포넌트 import는 배럴(`components/index.js`) 경유.** App은 `import { ... } from "./components"`로 가져온다. 외부에서 안 쓰는 내부 전용 컴포넌트(`TodoItem`)는 배럴에 넣지 않는다.

## Dependencies

### Internal
- `App.jsx` → `hooks/*`, `components/*`(배럴 `index.js` 경유), `utils/date.js`. 컴포넌트 간 데이터는 props로만 흐른다.

### External
- React, ReactDOM, Vite, `@vitejs/plugin-react`, Tailwind CSS v4(`@tailwindcss/vite`). 그 외 서드파티 런타임 라이브러리 없음(`Date`/`localStorage` 등 Web API 직접 사용).

<!-- MANUAL: 이 줄 아래에 수동으로 추가한 메모는 재생성 시에도 보존됩니다. -->
