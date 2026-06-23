<!-- Generated: 2026-06-24 | Assignment: 3 (Next.js + FastAPI fullstack) -->

# todo-vanilla

## Purpose

Next.js 16 App Router 프론트엔드와 FastAPI 백엔드로 구성된 할 일 관리 웹 앱. 2차 과제(React/Vite + localStorage)에서 서버 기반 아키텍처로 재설계·재구현. 

**핵심:**
- 데이터는 FastAPI + SQLite가 관리 (로컬스토리지 제외)
- 날짜별 관리 — 주간 캘린더(WeekStrip)에서 날짜 선택, 선택 날짜는 URL ?date=로 관리
- 읽기 = Server Component + `actions.ts` (cache: no-store)
- 쓰기 = Client Component + route.ts 프록시 → FastAPI
- 서버 기반 날짜·필터(`?filter=`) + 검색(`?search=`) + 디바운스
- 날짜·필터·검색 동시 적용 + URL 파라미터 유지
- 인라인 추가 폼 (목록 화면에서 추가, 제출 후 페이지 이동 없음) + 별도 /todos/new 페이지 병행

## Key Files

| File | Purpose |
|------|---------|
| **backend/main.py** | FastAPI 앱. CRUD 엔드포인트 4개(GET/POST/PUT/DELETE /todos), 날짜·필터·검색 로직, CORS 미들웨어. |
| **backend/database.py** | SQLAlchemy 엔진/세션/Base. `.env.local`에서 DATABASE_URL 읽음. |
| **backend/models.py** | SQLAlchemy 모델 `Todo(id: int PK, text: str, completed: bool, date: str)`. date는 "YYYY-MM-DD" 로컬 문자열. |
| **backend/schemas.py** | Pydantic v2 스키마. `TodoCreate(text, date)` 공백 검증, `TodoUpdate`(Optional 필드), `TodoRead`. |
| **frontend/app/todos/page.tsx** | 할 일 목록 Server Component. searchParams(date/filter/search) await → getTodos() → 필터 결과 렌더. WeekStrip + AddTodoForm 포함. |
| **frontend/app/todos/actions.ts** | 읽기 헬퍼. `getTodos(date, filter, search)`: BACKEND_URL로 FastAPI 직접 호출, cache: no-store. "use server" 붙이지 않음 (Server Action 아님). |
| **frontend/app/todos/date.ts** | 날짜 유틸 (순수 함수). formatDateKey(Date→"YYYY-MM-DD"), parseDateKey("YYYY-MM-DD"→Date), getWeekDates(Date→[Mon~Sun]), addWeeks(Date, n→Date±n주). |
| **frontend/app/todos/_components/WeekStrip.tsx** | Client. 주간 날짜 바. 현재 주 7일, 각 날짜 우측에 할 일 개수, 이전·다음 주 버튼. 날짜 선택 시 URL ?date= 갱신 (filter/search 보존). |
| **frontend/app/todos/_components/AddTodoForm.tsx** | Client. 인라인 추가 폼. 목록 화면 안에서 할 일 추가. 제출 후 입력 비우고 router.refresh()만 (페이지 이동 없음). 현재 ?date=에 추가 (없으면 오늘). |
| **frontend/app/api/todos/route.ts** | POST 프록시. 클라 → 이 핸들러 → FastAPI POST. 성공 후 revalidatePath("/todos"). |
| **frontend/app/api/todos/[id]/route.ts** | PUT/DELETE 프록시. 동적 세그먼트 [id]. `const { id } = await params` (Promise await). 성공 후 revalidatePath. |
| **frontend/app/todos/_components/TodoItem.tsx** | Client. 체크박스 토글/삭제. 성공 후 router.refresh() (이미 /todos에 머무름). 실패는 try/catch + 인라인 UI. |
| **frontend/app/todos/new/TodoForm.tsx** | Client. 생성 폼. 성공 후 router.refresh() → router.push("/todos") (순서 고정, stale 방지). |
| **frontend/app/todos/[id]/EditForm.tsx** | Client. 수정 폼. 성공 후 router.refresh() → router.push("/todos"). |
| **frontend/app/todos/_components/FilterTabs.tsx** | Client. 필터 탭. URLSearchParams 복제 후 filter key만 set/delete → router.push (date/search 파라미터 보존). |
| **frontend/app/todos/_components/SearchBox.tsx** | Client. 검색창. ~300ms 디바운스, URLSearchParams 복제 후 search key만 set/delete. 빈 입력 시 delete (date/filter 보존). |
| **frontend/app/fonts.ts** | Lobster 제목 폰트 로드 (page.tsx의 "Todo List" 제목용). |
| **frontend/.env.local** | NEXT_PUBLIC_API_URL(클라 fetch 베이스), BACKEND_URL(서버→FastAPI 베이스). |
| **backend/.env.local** | DATABASE_URL=sqlite:///./todos.db. |

## For AI Agents

### Server/Client 경계 명확화

**Server Component / Server-only:**
- `app/todos/page.tsx` — searchParams(date/filter/search) await → getTodos() → 렌더. WeekStrip + AddTodoForm(Suspense로 감싼 Client 자식들 포함).
- `app/todos/actions.ts` — `getTodos(date, filter, search)`: 순수 fetch 헬퍼. "use server" 없음 (Server Component에서 직접 import+호출하는 일반 함수). BACKEND_URL 환경변수 사용. cache: "no-store" — 매번 최신.
- `app/todos/new/page.tsx`, `app/todos/[id]/page.tsx` — 껍데기 Server. 폼은 Client 자식.
- `app/api/todos/route.ts`, `app/api/todos/[id]/route.ts` — Route handler (서버 측). BACKEND_URL로 FastAPI 프록시. revalidatePath("/todos") 호출.

**Client Component ("use client"):**
- `app/todos/_components/WeekStrip.tsx` — 주간 날짜 바. useRouter + useSearchParams. 날짜 선택 시 URLSearchParams 복제 후 date key만 set (filter/search 보존). router.push(`/todos?${params}`).
- `app/todos/_components/AddTodoForm.tsx` — 인라인 추가 폼. useRouter + useSearchParams. 현재 ?date= 읽어 추가 (없으면 오늘). 제출 후 setText("") + router.refresh()만 (페이지 이동 없음).
- `app/todos/_components/TodoItem.tsx` — 토글/삭제. `NEXT_PUBLIC_API_URL`로 route handler 호출. 성공 후 `router.refresh()`. 실패는 try/catch + 인라인 에러 (항목 하단에 "저장에 실패했습니다. 다시 시도하세요.").
- `app/todos/new/TodoForm.tsx`, `app/todos/[id]/EditForm.tsx` — 생성/수정 폼. `NEXT_PUBLIC_API_URL`로 POST/PUT. 성공 후 `router.refresh()` 다음 `router.push("/todos")` (순서 고정).
- `app/todos/_components/FilterTabs.tsx`, `app/todos/_components/SearchBox.tsx` — 필터/검색 UI. `useSearchParams` (Suspense로 감싼 후 포함). URLSearchParams 복제 후 자신의 키만 수정 (date·상대 파라미터 보존). router.push(`/todos?...`).

### 환경변수 사용처

| 변수 | 접두사 | 사용처 | 용도 |
|------|--------|---------|------|
| `NEXT_PUBLIC_API_URL` | `NEXT_PUBLIC_` | Client (TodoItem, TodoForm, EditForm, FilterTabs, SearchBox) | 클라이언트 fetch의 베이스 URL. `${NEXT_PUBLIC_API_URL}/todos`로 route handler 호출. 브라우저에 노출됨. |
| `BACKEND_URL` | 없음 | Server (actions.ts, route.ts) | actions.ts의 getTodos() + route handler가 FastAPI를 호출할 때의 베이스 URL. 브라우저에 노출 안 됨. |
| `DATABASE_URL` | 없음 | Backend 서버 (database.py) | SQLAlchemy 엔진의 DB 연결 문자열. |

### Next.js 16 Async Params & SearchParams

**반드시 await하기:**
```typescript
// ❌ 동기 접근 (에러)
const { filter } = searchParams;

// ✅ Promise → await (올바름)
const { filter } = await searchParams;

// API 라우트 핸들러도 동일
const { id } = await params;
```

### 읽기 = actions.ts, 쓰기 = route.ts 역할 분담

| 작업 | 경로 | 메커니즘 |
|------|------|----------|
| 목록 조회 | `actions.ts` getTodos() | Server Component에서 직접 호출. cache: "no-store" (매번 최신). |
| 생성 | `app/api/todos/route.ts` POST | 클라이언트 → fetch(`${NEXT_PUBLIC_API_URL}/todos`) → route handler → FastAPI. revalidatePath 후 클라 router.refresh() + router.push. |
| 수정 | `app/api/todos/[id]/route.ts` PUT | 클라이언트 → fetch(`${NEXT_PUBLIC_API_URL}/todos/${id}`, PUT) → route handler → FastAPI. 동일하게 revalidatePath + router.refresh() + router.push. |
| 삭제 | `app/api/todos/[id]/route.ts` DELETE | 클라이언트 → fetch(`${NEXT_PUBLIC_API_URL}/todos/${id}`, DELETE) → route handler → FastAPI. router.refresh()만 (이미 `/todos`에 머무름). |

**왜 프록시인가?** 백엔드 API 경로 숨김 + CORS 간소화 + 환경별 URL 일관성.

### UI 갱신 3단계 메커니즘

**1. cache: "no-store"** (actions.ts)
- getTodos()의 fetch가 캐시에 저장되지 않음 → 재렌더될 때마다 항상 최신 데이터 가져옴.
- **갱신을 트리거하지는 않음** (읽기만 담당).

**2. router.refresh() / router.push()** (클라이언트)
- **실제 갱신 동력 (가장 중요)**.
- router.refresh() → Server Component 재렌더 → getTodos() 다시 호출 → 최신 데이터.
- 생성/수정: router.refresh() 후 router.push("/todos") (push 단독은 Router Cache 때문에 stale).
- 토글/삭제: router.refresh()만 (이미 `/todos`에 있으므로 push 불필요).

**3. revalidatePath("/todos")** (route handler)
- 캐시 무효화 안전망.
- 현 설정(no-store)에선 사실상 no-op (무효화할 캐시가 없음).
- 향후 읽기 캐싱을 켜거나 다른 진입점이 캐시를 탈 때 대비.

**핵심:** "UI가 안 바뀐다"의 원인은 거의 항상 **router.refresh() 누락** (revalidatePath 문제 아님).

### 동적 세그먼트 & Params 추출

**페이지:**
```typescript
// app/todos/[id]/page.tsx (Server Component)
export default async function EditPage({
  params,
}: PageProps<"/todos/[id]">) {
  const { id } = await params;  // Promise → await
  const todo = await getTodo(id);
  return <EditForm todo={todo} />;
}
```

**API Route:**
```typescript
// app/api/todos/[id]/route.ts
export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/todos/[id]">,
) {
  const { id } = await params;  // Promise → await (동일 패턴)
  ...
}
```

세그먼트명 `[id]`로 통일 → 혼동 방지.

### 날짜·필터·검색 URL 파라미터 관리

**3개 파라미터 공존 보장:**
```typescript
// ✅ WeekStrip: date만 변경 (filter/search 보존)
const params = new URLSearchParams(searchParams);
params.set("date", key);  // filter/search는 건드리지 않음
router.push(`/todos?${params.toString()}`);

// ✅ FilterTabs: filter만 변경 (date/search 보존)
const params = new URLSearchParams(useSearchParams());
params.set("filter", value);  // date/search는 건드리지 않음
router.push(`/todos?${params}`);

// ✅ SearchBox: search만 변경 (date/filter 보존)
const params = new URLSearchParams(useSearchParams());
if (value) {
  params.set("search", value);
} else {
  params.delete("search");  // 빈 입력 시 제거
}  // date/filter는 건드리지 않음
router.push(`/todos?${params}`);
```

**❌ 피할 것:**
```typescript
// 새 객체로 push → 기존 파라미터 손실
router.push(`/todos?filter=${value}`);  // date/search 없어짐
router.push(`/todos?date=${date}`);    // filter/search 없어짐
```

### 서버 필터링 로직 (FastAPI)

```python
# GET /todos?date=2026-06-24&filter=active&search=장
query = db.query(Todo)

# date 처리: 지정 시 해당 날짜만, 미지정이면 전체
if date and date.strip():
    query = query.filter(Todo.date == date.strip())

# filter 처리: all|active|completed 외 값은 all로 폴백
if filter == "active":
    query = query.filter(Todo.completed == False)
elif filter == "completed":
    query = query.filter(Todo.completed == True)
# else: all (조건 없음)

# search 처리: AND 적용
if search and search.strip():
    query = query.filter(Todo.text.like(f"%{search.strip()}%"))

return query.all()
```

**응답:** date == "2026-06-24" AND completed=false AND text LIKE '%장%'인 항목만 (3개 조건 AND 결합).

### Suspense Boundary

`useSearchParams()`를 쓰는 Client Component는 반드시 Suspense로 감싸기:

```typescript
// app/todos/page.tsx (Server)
<Suspense>
  <FilterTabs />
  <SearchBox />
</Suspense>
```

**이유:** 빌드·정적 생성 시 필요 (Next.js 요구사항).

### 엔드포인트 요청 예시

**POST (생성):**
```bash
curl -X POST http://localhost:8000/todos \
  -H "Content-Type: application/json" \
  -d '{"text": "사과 사기", "date": "2026-06-24"}'
# → 201, { "id": 1, "text": "사과 사기", "completed": false, "date": "2026-06-24" }
```

**GET (날짜만):**
```bash
curl "http://localhost:8000/todos?date=2026-06-24"
# → 200, [{ "id": 1, "text": "...", "completed": false, "date": "2026-06-24" }, ...]
```

**GET (날짜+필터+검색):**
```bash
curl "http://localhost:8000/todos?date=2026-06-24&filter=active&search=사과"
# → 200, 2026-06-24이면서 진행중이고 텍스트에 "사과" 포함된 항목만
```

**PUT (수정):**
```bash
curl -X PUT http://localhost:8000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
# → 200, { "id": 1, "text": "사과 사기", "completed": true }
```

**DELETE:**
```bash
curl -X DELETE http://localhost:8000/todos/1
# → 204 (No Content)
```

**공백 검증:**
```bash
curl -X POST http://localhost:8000/todos \
  -d '{"text": "   "}'
# → 422 Unprocessable Entity (공백 전용 텍스트 거부)
```

## Testing Requirements

### 백엔드 단독 검증

1. 터미널 1에서 백엔드 시작: `cd backend && source .venv/bin/activate && uvicorn main:app`
2. http://localhost:8000/docs 접속 → 4개 엔드포인트(GET/POST/PUT/DELETE /todos) 확인.
3. POST로 할 일 2~3개 생성 (date 필수) → GET으로 전체 확인 (길이 증가).
4. **날짜별 필터:** GET `?date=2026-06-24` → 해당 날짜 항목만.
5. **공백 text POST** → 422, DB 행 미생성.
6. **date 없이 POST** → 422, DB 행 미생성.
7. **GET `?filter=active`** → completed=false만.
8. **GET `?date=2026-06-24&filter=active&search=<텍스트>`** → 3개 조건 AND (날짜 AND 진행중 AND 텍스트 포함).
9. **PUT `{}`** (빈 body) → 200, 무변경.
10. **존재 안 하는 ID PUT/DELETE** → 404.

### 프론트+백엔드 E2E

1. 두 서버 모두 실행 (백: :8000, 프: :3000).
2. `/todos` 접속 → 기본값(오늘)로 할 일 목록 표시, WeekStrip 표시.
3. WeekStrip에서 다른 날짜 선택 → URL에 `?date=YYYY-MM-DD` 추가, 해당 날짜 항목만 표시, 새로고침 후 유지.
4. WeekStrip의 이전/다음 주 버튼 → 주간 변경, 각 버튼 클릭 시 해당 주의 월요일 선택.
5. 인라인 폼에서 할 일 추가 → **새로고침 없이** 목록에 노출, 입력 필드 비워짐, 선택 날짜로 추가됨.
6. `/todos/new` 페이지 접속 → 별도 폼, 제출 후 `/todos`로 이동 (페이지 이동 발생).
7. 목록 항목 체크박스 토글 → **새로고침 없이** 완료 상태 변화.
8. 삭제 버튼 → **새로고침 없이** 항목 제거.
9. 항목 클릭 → `/todos/[id]` 페이지, text prefill. 수정 → `/todos`로 이동, 변경 반영.
10. 필터 탭 → URL에 `?filter=...`, ?date= 보존, 새로고침 후 유지.
11. 검색 입력 → ~300ms 정지 후 `?search=...` 1회 갱신, ?date=·?filter= 보존.
12. 날짜·필터·검색 동시 → URL에 `?date=2026-06-24&filter=active&search=...`, 3개 조건 AND 적용.
13. 백엔드 중단 → `/todos` 재접속, `error.tsx` 폴백 + reset 버튼.
14. 토글/삭제 실패(예: 백엔드 일시 중단) → 컴포넌트 인라인 에러 (error.tsx는 뜨지 않음).
15. 네트워크 탭에서 클라이언트 → `/api/todos` → 백엔드 흐름 확인.

### 콘솔 & 정리

- 콘솔 에러 0개.
- `console.log` / 주석 코드 0개.
- `git status`로 `.env.local` / `todos.db` / `node_modules` / `.venv` 미추적 확인.

## Dependencies

### Internal (frontend)
- `app/todos/page.tsx` → `actions.ts` (getTodos), `_components/*` (Client 자식들).
- `_components/*` → `NEXT_PUBLIC_API_URL` 환경변수 + `app/api/todos/*` route handler 호출.
- `app/api/todos/*` → `BACKEND_URL` 환경변수 + FastAPI 호출.

### Internal (backend)
- `main.py` → `database.py` (엔진/세션), `models.py` (ORM), `schemas.py` (Pydantic).
- `models.py` → `database.py` (Base).
- `schemas.py` → Pydantic v2 (필드 검증).

### External
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4.
- **Backend:** FastAPI, Uvicorn, SQLAlchemy, SQLite, Pydantic v2.

<!-- MANUAL: 이 줄 아래에 수동으로 추가한 메모는 재생성 시에도 보존됩니다. -->
