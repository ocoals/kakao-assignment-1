# 과제3 구현 계획 요약

> 설계 결정의 근거·대안은 아래 **"설계 결정 근거(ADR)"** 절 참고.
> (deep-interview·합의 계획의 상세 원본은 로컬 `.omc/`에 보관 — 작업 과정 산출물이라 커밋하지 않음)

**상태:** 구현 완료 (2026-06-24)

## 핵심 설계 결정

### 1. 데이터 모델: 날짜별 Todo

```typescript
type Todo = {
  id: number;           // SQLite 자동증가 정수 (UUID 아님)
  text: string;         // 공백만 거부
  completed: boolean;
  date: string;         // "YYYY-MM-DD" 로컬 문자열 (날짜별 관리)
}
```

**특징:**
- 2차의 날짜 모델(`date` 필드)을 **복원** — 주간 캘린더(WeekStrip)로 날짜별 할 일 관리. 선택 날짜는 URL `?date=`로 관리.
- `date`는 시간·타임존 없는 날짜 문자열이라 DST 영향 없음.
- 서버 생성: POST 본문은 `{text, date}`, id는 FastAPI가 생성해 응답에 포함.

### 2. 구조: frontend + backend 분리 모노레포

```
루트/
├── frontend/     (Next.js 16 App Router)
├── backend/      (FastAPI + SQLite)
└── docs/
```

**이점:**
- 두 스택 독립 실행 (.gitignore 분리).
- 명확한 Server/Client 경계.
- 환경별 URL 관리 용이.

### 3. 데이터 흐름

**읽기:**
```
Server Component → actions.ts (getTodos)
                 ↓ cache: "no-store"
               FastAPI: GET /todos?date=...&filter=...&search=...
                 ↓
              SQLite (날짜 + 필터 + 검색)
```

- `actions.ts`는 "use server" 없는 순수 fetch 헬퍼.
- 매번 최신 데이터 (캐시 사용 안 함).

**쓰기:**
```
Client Component → fetch(NEXT_PUBLIC_API_URL)
                 ↓
            Next.js route handler
                 ↓ fetch(BACKEND_URL)
               FastAPI (쓰기)
                 ↓
          revalidatePath + router.refresh()
```

- Route handler는 프록시 역할 (백엔드 API 경로 숨김).
- 클라이언트가 `router.refresh()`로 실제 갱신 트리거 (중요).

### 4. 서버 필터링 + 검색

**FastAPI 엔드포인트:**
- `GET /todos?date=YYYY-MM-DD&filter=all|active|completed&search=키워드`
- 날짜 + 필터 + 검색 교집합 (모두 Optional, AND 결합).
- 비정상 filter 값은 `all`로 폴백.
- 공백 search는 무시. date 미지정 시 전체.

**클라이언트 URL 관리:**
- URLSearchParams 복제 후 자신의 키만 수정 (date/filter/search 공존 보장). WeekStrip은 `date`만, FilterTabs는 `filter`만, SearchBox는 `search`만 변경.
- 검색은 ~300ms 디바운스.
- 날짜/필터/검색 상태는 URL에 유지 (새로고침/공유 시 복구).

### 5. 3단계 UI 갱신 메커니즘

| 단계 | 담당 | 역할 |
|------|------|------|
| 1. cache: no-store | actions.ts fetch | 항상 최신 읽기 |
| 2. router.refresh() | 클라이언트 | **실제 갱신 트리거 (가장 중요)** |
| 3. revalidatePath | route handler | 캐시 안전망 (현 설정에선 no-op) |

**생성/수정:** `router.refresh()` → `router.push("/todos")` (순서 고정)  
**토글/삭제:** `router.refresh()`만

## 설계 결정 근거 (대안·선택 이유, ADR)

deep-interview + 합의(consensus) 과정에서 확정한 핵심 결정과 **기각한 대안**:

| 결정 | 선택 | 기각한 대안 | 이유 |
|------|------|------------|------|
| 구조 | `frontend/`+`backend/` 형제 모노레포 | 루트에 Next.js, backend만 하위 | 가이드 구조 일치, Server/Client 경계·.gitignore 분리 명확 |
| Todo id | SQLite Integer 자동증가 PK | UUID 문자열(2차 방식) | 서버가 id 생성하는 흐름과 일치, URL 간결, 정수 PK 학습 |
| 읽기/쓰기 분담 | 읽기=actions.ts(no-store), 쓰기=route.ts 프록시 | Server Action 하나로 통합 | 채점이 두 패턴 검증 기대 + 두 개념 학습. revalidate를 쓰기 경로에 일관 배치 |
| UI 갱신 | router.refresh/push가 실동력, revalidatePath는 안전망 | revalidatePath만 의존 | no-store에선 revalidatePath가 no-op → refresh가 실제 갱신 (위 5번 표) |

### 인터뷰에서 해소한 가정(트레이드오프)
- **날짜/DST**: 날짜를 "YYYY-MM-DD" 문자열로 두면 시간·타임존이 없어 섬머타임(DST) 영향 없음 → 안전.
- **검색 트리거**: 매 입력마다 호출 대신 ~300ms 디바운스로 요청 절감.
- **에러 경계**: `error.tsx`는 서버 렌더 에러 전용, 클라이언트 쓰기 실패는 인라인 처리.

### 이후 변경 (구현 후 요청 반영)
초기 계획은 **평평한 리스트 + 별도 추가 페이지**였으나, 2차 디자인을 가져오며 다음을 반영:
- **날짜 모델(WeekStrip) 복원** — Todo에 `date` 추가, 날짜별 관리 (위 1번).
- **인라인 추가 폼 추가** — 목록 화면에서 바로 추가(2차 방식). 별도 `/todos/new` 페이지도 유지(과제 요구).
- **완료 토글: 완료/취소 버튼 → 체크박스**.

## 요구사항 원점

### 백엔드 AC (합격 기준)

- [x] 4개 엔드포인트(GET/POST/PUT/DELETE `/todos`) 노출 및 동작.
- [x] POST 공백 text → 422 거부.
- [x] PUT 공백 text → 422 거부.
- [x] PUT `{}` (빈 body) → 200, 무변경.
- [x] `?date=YYYY-MM-DD` → 해당 날짜 항목만. POST 본문 `{text, date}`.
- [x] `?filter=active|completed` → 필터링.
- [x] `?filter=비정상값` → `all`로 폴백.
- [x] `?search=...` → 부분 일치.
- [x] `?date=...&filter=active&search=...` → 날짜+상태+검색 교집합(AND).
- [x] 없는 ID 조회/수정/삭제 → 404.
- [x] CORS: `localhost:3000` 허용.

### 프론트 AC

- [x] `/` → `/todos` redirect.
- [x] `/todos`는 Server Component (JS 비활성 상태에서도 HTML 렌더).
- [x] 주간 스트립(WeekStrip)에서 날짜 선택 → 해당 날짜 할 일만 표시, URL `?date=` 유지.
- [x] 인라인 폼으로 추가 → 페이지 이동 없이 그 날짜 목록에 노출. 별도 `/todos/new` 페이지도 동작.
- [x] 생성 후 새로고침 없이 목록 갱신 (네트워크 탭: GET /todos 재요청 1건).
- [x] 체크박스 토글/삭제 후 새로고침 없이 즉시 반영.
- [x] 수정 페이지 진입 시 text prefill.
- [x] 필터 탭 클릭 → URL `?filter=`, 새로고침/공유 후 유지.
- [x] 검색 입력 → ~300ms 후 URL `?search=` 1회 갱신.
- [x] 필터+검색 공존 → `?filter=...&search=...` 교집합 결과.
- [x] loading.tsx 존재 + 렌더 정상.
- [x] error.tsx: 서버 렌더 에러 폴백. 쓰기 실패는 인라인 UI.
- [x] 항목 0개 → "할 일이 없습니다" 문구.
- [x] 빈/공백 입력 → 클라이언트 거부 + 백엔드 422 (이중 방어).

## 핵심 파일

| 파일 | 역할 |
|------|------|
| `backend/main.py` | CRUD 엔드포인트 + 필터/검색 로직 + CORS |
| `backend/models.py` | Todo ORM 모델 |
| `backend/schemas.py` | Pydantic 검증 (공백 text 거부) |
| `backend/database.py` | SQLAlchemy 설정 |
| `frontend/app/todos/page.tsx` | 목록 Server Component (날짜/필터/검색 + WeekStrip + 인라인 폼) |
| `frontend/app/todos/actions.ts` | 읽기 헬퍼 `getTodos(date, filter, search)` (no-store) |
| `frontend/app/todos/date.ts` | 날짜 유틸 순수함수 (formatDateKey/parseDateKey/getWeekDates/addWeeks) |
| `frontend/app/api/todos/route.ts` | POST 프록시 |
| `frontend/app/api/todos/[id]/route.ts` | PUT/DELETE 프록시 |
| `frontend/app/todos/_components/WeekStrip.tsx` | 주간 날짜 바 (URL `?date=`, 날짜별 개수) |
| `frontend/app/todos/_components/AddTodoForm.tsx` | 인라인 추가 폼 (제출 후 router.refresh만, 머무름) |
| `frontend/app/todos/_components/TodoItem.tsx` | 체크박스 토글/삭제 (router.refresh) |
| `frontend/app/todos/new/TodoForm.tsx` | 생성 페이지 폼 (router.refresh → push) |
| `frontend/app/todos/[id]/EditForm.tsx` | 수정 (router.refresh → push) |
| `frontend/app/todos/_components/FilterTabs.tsx` | 필터 탭 (URLSearchParams 복제) |
| `frontend/app/todos/_components/SearchBox.tsx` | 검색 (디바운스) |
| `frontend/app/fonts.ts` | 제목 Lobster 폰트 (2차 보라 테마) |

## 환경변수

**frontend/.env.local:**
- `NEXT_PUBLIC_API_URL=http://localhost:3000/api` (클라이언트 fetch 베이스)
- `BACKEND_URL=http://localhost:8000` (서버→FastAPI 베이스)

**backend/.env.local:**
- `DATABASE_URL=sqlite:///./todos.db`

## 실행 방법

### 백엔드
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app      # :8000, /docs에서 API 문서
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev           # :3000
```

두 서버를 동시에 띄워야 동작합니다.

## 검증 체크리스트

- [x] 두 서버 기동 후 `/todos` 접속 → 목록 렌더.
- [x] 새 할 일 생성 → 새로고침 없이 노출.
- [x] 토글/삭제 → 새로고침 없이 반영.
- [x] 필터 탭 → URL 유지.
- [x] 검색 입력 → 디바운스 + URL 유지.
- [x] 필터+검색 동시 적용.
- [x] 에러 처리 (백엔드 다운 → error.tsx).
- [x] 콘솔 에러 0개, 정리 완료.

## 선택 사항 (본 범위 미포함)

- 통합 실행 스크립트 (각자 기동).
- 검색 대소문자 처리 (SQLite LIKE 기본값).
- 추가 기능 (태그, 우선순위 등).
