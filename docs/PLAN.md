# Deep Interview Spec: Vanilla JS Todo → React 마이그레이션

## Metadata
- Interview ID: react-todo-migration
- Rounds: 6
- Final Ambiguity Score: 12%
- Type: brownfield (1차 `app.js` 기반)
- Generated: 2026-06-09
- Threshold: 0.2 (20%)
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED
- 구현 진행 (2026-06-10): CRUD(AC-1~7) ✅, 상태 필터(AC-8~10) ✅, 주간 날짜 뷰(AC-11~16) ✅, localStorage(AC-17~19) ✅ — **기능 19개 전부 완료**
- 후속 작업 (2026-06-10): ① 과제1 보라 테마 디자인 이식 완료(@theme 토큰 + Lobster 폰트 + WeekStrip 리디자인). ② 1차 잔재(app.js/style.css/App.css)·미사용 템플릿 에셋 삭제. ③ 상태 로직을 커스텀 훅 3개(`useTodos`/`useSelectedDate`/`useFilteredTodos`)로 분리하고 컴포넌트는 배럴(`components/index.js`)로 정리 → App.jsx는 조립만 담당. ④ README/AGENTS.md 2차 기준 갱신. ※ 디자인·리팩토링은 본 명세의 기능 AC 범위 밖
- 과제2 피드백 반영 (2026-06-23): ① `id` 생성을 `Date.now()` → `crypto.randomUUID()`(표준 + 같은 밀리초 충돌 구조적 방지). ② 주간 7칸 생성을 `[0,1,2,3,4,5,6]` 매직넘버 → `Array.from({ length: DAYS_IN_WEEK })`(상수로 의도 노출). ③ 이 계획서를 `docs/PLAN.md`로 추적 위치에 노출(튜터 "플랜 문서 없음" 피드백).

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.88 | 0.35 | 0.308 |
| Constraint Clarity | 0.90 | 0.25 | 0.225 |
| Success Criteria | 0.85 | 0.25 | 0.213 |
| Context Clarity | 0.90 | 0.15 | 0.135 |
| **Total Clarity** | | | **0.881** |
| **Ambiguity** | | | **0.119 (12%)** |

## Topology
범위 결정: **주간 뷰 통합(A)** — 1차에 이미 있던 주간 스트립을 메인 날짜 UI로 유지하고, 일간 뷰는 그 안에 포함된 것으로 본다.

| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Todo CRUD | active | 추가 / 인라인 수정 / 완료 토글 / 삭제 | AC-1~AC-7 |
| 상태 필터 | active | 전체·진행중·완료 탭 + 빈 상태 | AC-8~AC-10 |
| 주간 날짜 뷰 | active | 주간 스트립, 선택 날짜, 오늘 표시, 날짜별 개수, 이전/다음 주, 날짜 연동 (일간 포함) | AC-11~AC-16 |
| localStorage 영속화 | active | todos + 선택 날짜 저장/복원, 새로고침 유지 | AC-17~AC-19 |

> Vite/Tailwind 세팅은 컴포넌트가 아니라 전제조건으로 "기술 컨텍스트"에 기록.

## Goal
1차 Vanilla JS Todo 앱을 **React(Vite + Tailwind v4) Function Component 구조**로 마이그레이션한다. 기존 기능(추가/수정/완료/삭제, 상태 필터, 주간 날짜 뷰, localStorage 영속화)을 보존하되, DOM 직접 조작 방식을 **state 기반 선언적 렌더링**으로 전환하고, `prompt()` 수정을 **인라인 입력창**으로 바꾼다. 학습 목적상 AI가 통째로 구현하지 않고, 사용자가 직접 읽고 수정하며 진행한다.

## Constraints
- React 19, Vite 8, Tailwind CSS v4 (PostCSS 미사용, `@tailwindcss/vite` 플러그인 방식), JavaScript
- 파일 구조는 `src/components/` 기준으로 분리
- 각 Todo는 `{ id, text, completed, date }` 형태. `id`는 `crypto.randomUUID()`로 생성하여 React `key`로 사용 (처음엔 `Date.now()`로 했으나 과제2 피드백으로 표준 방식 + 같은 밀리초 충돌의 구조적 방지를 위해 UUID로 전환)
- 날짜 키 형식은 `"YYYY-MM-DD"` (예: `"2026-06-03"`). **로컬 시간 기준 + 직접 `padStart(2,"0")`** 으로 생성 (`toISOString()`은 UTC 변환으로 한국에서 날짜가 밀리므로 금지)
- 1차 localStorage 데이터와의 호환은 포기하고 새로 시작 (id 부재 + 날짜 키 형식 차이)
- 인라인 수정: 저장/취소 버튼 + Enter 저장, 빈 값이면 저장하지 않음
- 빈 입력 추가 시: `message` 상태로 안내 문구 표시, 정상 추가되면 제거
- 빈 목록 상태: 필터별 3종이 아닌 **통일된 빈 상태 메시지 하나**
- 선택 날짜(`selectedDate`)도 localStorage에 저장하여 새로고침 후 유지
- 제출 마감: 2026-06-10(수) 23:59

## Non-Goals
- 1차 localStorage 데이터 마이그레이션(자동 변환) — 하지 않음
- 필터별로 다른 빈 상태 문구 — 통일된 하나로 단순화
- 명세에 없는 추가 기능(태그, 우선순위, 검색 등) — 범위 외
- 계획 단계 자체에서는 코드 구현 제외 (문서 우선·피드백 2번) — 구현은 이후 완료(상단 Metadata 참고)

## Acceptance Criteria
**Todo CRUD**
- [x] AC-1: 텍스트 입력 + 추가 버튼(또는 Enter)으로 새 Todo 생성
- [x] AC-2: 빈 입력 제출 시 Todo가 생성되지 않고 안내 메시지 표시, 정상 추가 시 메시지 사라짐
- [x] AC-3: 생성된 Todo는 목록으로 렌더링되며 각 항목은 고유 `id`를 `key`로 가짐
- [x] AC-4: 수정 버튼 클릭 시 해당 항목이 인라인 입력창으로 전환(`isEditing`)
- [x] AC-5: 수정 중 저장 버튼/Enter로 저장, 취소 버튼으로 원복, 빈 값은 저장 안 됨
- [x] AC-6: 완료 토글 시 시각적 구분(취소선) + 버튼 라벨 "완료↔취소" 전환
- [x] AC-7: 삭제 버튼으로 항목 제거

**상태 필터**
- [x] AC-8: 전체/진행 중/완료 탭으로 해당 상태의 Todo만 표시
- [x] AC-9: 현재 선택된 탭이 시각적으로 구분됨
- [x] AC-10: 보일 항목이 0개일 때 통일된 빈 상태 메시지 표시

**주간 날짜 뷰**
- [x] AC-11: 주간 스트립(월~일 7칸) 표시, 선택 날짜 강조, 오늘 날짜 별도 표시
- [x] AC-12: 각 날짜 칸에 해당 날짜의 Todo 개수 표시
- [x] AC-13: 이전 주 / 다음 주 이동 버튼 동작
- [x] AC-14: 날짜 칸 클릭 시 해당 날짜로 선택 전환
- [x] AC-15: 선택된 날짜의 Todo만 목록에 표시 (날짜 + 필터 동시 적용)
- [x] AC-16: Todo 생성 시 현재 선택된 날짜가 자동 저장됨

**localStorage 영속화**
- [x] AC-17: todos 변경 시 `useEffect`로 자동 저장 (JSON.stringify/parse)
- [x] AC-18: 새로고침 후에도 todos 유지 (함수형 초기화로 초기값 로드)
- [x] AC-19: 새로고침 후에도 선택했던 날짜/주 유지

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| Todo에 id가 없어도 된다 (1차) | React map은 고유 key 필요 | `crypto.randomUUID()`로 id 부여 (과제2 피드백 — 표준 + 충돌 구조적 방지) |
| 날짜 키는 1차의 "2026-6-3" 형식 | 정렬·표준성 약함 | `"YYYY-MM-DD"` (로컬 padStart) |
| `toISOString()`으로 짧게 쓰면 됨 | UTC 변환으로 한국 날짜 밀림 | 직접 padStart로 로컬 시간 유지 |
| 수정은 prompt() | 명세가 인라인 입력창 요구 | isEditing 상태 + 저장/취소 버튼 + Enter |
| 빈 목록은 필터별 3종 문구 (1차) | 사용자에겐 "없음"만 알면 충분 | 통일된 빈 상태 하나 (Contrarian) |
| 선택 날짜는 새로고침 시 오늘로 리셋 (1차) | 도전 미션이 주차 유지 요구 | selectedDate도 localStorage 저장 (Simplifier 검토 후 유지 선택) |

## Technical Context
- **마이그레이션 출발점이던 1차 코드**(`app.js`, 287줄, 현재 브랜치에선 제거됨): DOM 직접 조작 방식. 주요 함수 — `formatDateKey`(31), `getMonday`(34), `renderWeek`(49), `applyFilter`(137), `createTodoElement`(194), `addTodo`(250), `saveTodos`/`loadTodos`(112/123). 이미 form submit, 배열 메서드 리팩토링(피드백 4·5번) 반영됨.
- **세팅**: 현 폴더(브랜치 `week-03-오채민`) 루트에 직접 스캐폴딩. `npm create vite@latest . -- --template react` (비어있지 않은 폴더 프롬프트에서 **"Ignore files and continue"** 선택 — "Remove"는 1차 파일 삭제하니 금지) → `npm install` → `npm i -D tailwindcss @tailwindcss/vite` → `vite.config.js`에 `tailwindcss()` 플러그인 추가 → `src/index.css`에 `@import "tailwindcss";`. 주의: Vite 템플릿이 `.gitignore`를 덮어쓰므로 `.omc/`·`AGENTS.md` 무시 규칙을 다시 추가해야 함. 1차 원본(index.html 등)은 `week-02-오채민` 브랜치에 보존됨.
- **제안 컴포넌트 구조** (참고용, 구현 시 확정):
  - `App.jsx` — state 소유(todos, currentFilter, selectedDate, message), localStorage useEffect
  - `TodoForm.jsx` — 입력/추가, 빈 입력 메시지
  - `FilterTabs.jsx` — 전체/진행중/완료 탭
  - `WeekStrip.jsx` — 주간 스트립, 이전/다음 주, 날짜별 개수
  - `TodoList.jsx` + `TodoItem.jsx` — 목록 / 개별 항목(수정·완료·삭제, isEditing)
- **React 개념(초보자 학습 포인트)**: `useState`, `useEffect`(의존성 배열 `[todos]`), 함수형 초기화 `useState(() => ...)`, props로 데이터/콜백 전달, 조건부 렌더링(`isEditing`), `map`의 `key`

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Todo | core domain | id, text, completed, date | App이 todos 배열로 소유 |
| Filter | supporting (UI state) | "all" / "active" / "completed" | App이 currentFilter로 소유 |
| SelectedDate | supporting (UI state) | Date (키: "YYYY-MM-DD") | Todo.date와 매칭, 주간뷰 기준 |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 1 (Todo) | 1 | - | - | N/A |
| 2 | 2 (+SelectedDate) | 1 | 0 | 1 | 50% |
| 3 | 2 | 0 | 0 | 2 | 100% |
| 4 | 3 (+Filter) | 1 | 0 | 2 | 67% |
| 5 | 3 | 0 | 0 | 3 | 100% |
| 6 | 3 | 0 | 0 | 3 | 100% |

## Interview Transcript
<details>
<summary>Full Q&A (6 rounds)</summary>

### Round 0 (Topology)
**Q:** 4개 최상위 컴포넌트(Todo CRUD / 상태 필터 / 주간 날짜 뷰 / localStorage)로 읽었는데 맞나요?
**A:** 추천대로 → 4개 컴포넌트 확정.

### Round 1
**Q:** 각 Todo를 React에서 어떻게 구별(key)할까요?
**A:** 새 id 필드 추가 → `{ id, text, completed, date }`.
**Ambiguity:** 38%

### Round 2
**Q:** 날짜 저장 키 문자열 형식은?
**A:** ISO "2026-06-03" (직접 padStart, 로컬 시간). toISOString UTC 함정 회피.
**Ambiguity:** 33%

### Round 3
**Q:** 인라인 수정 저장/취소 트리거는?
**A:** 저장/취소 버튼 + Enter 저장, 빈 값 저장 안 함.
**Ambiguity:** 28%

### Round 4 (Contrarian)
**Q:** 빈 목록일 때 필터별 3종 문구가 정말 필요한가?
**A:** 통일된 빈 상태 메시지 하나.
**Ambiguity:** 22.5%

### Round 5
**Q:** 빈 입력 추가 시 안내 처리는?
**A:** 1차처럼 message 상태로 표시/제거.
**Ambiguity:** 17.5%

### Round 6 (Simplifier)
**Q:** 새로고침 시 선택 날짜/주를 유지할까?
**A:** 선택 날짜도 localStorage에 유지 (도전 미션).
**Ambiguity:** 12%

</details>
