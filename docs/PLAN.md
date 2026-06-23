# 과제3 구현 계획 요약

> 상세 계획: `.omc/plans/assignment3-nextjs-fastapi.md`  
> 스펙 문서: `.omc/specs/deep-interview-assignment3-nextjs-fastapi.md`

**상태:** 구현 완료 (2026-06-24)

## 핵심 설계 결정

### 1. 데이터 모델: 평평한 Todo

```typescript
type Todo = {
  id: number;           // SQLite 자동증가 정수 (UUID 아님)
  text: string;         // 공백만 거부
  completed: boolean;
}
```

**특징:**
- 2차의 날짜 모델(`date` 필드) 제외 (별도 브랜치 week-02 보존).
- 서버 생성: POST 본문에 id 미포함, FastAPI가 응답에 포함.

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
               FastAPI: GET /todos?filter=...&search=...
                 ↓
              SQLite (필터 + 검색)
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
- `GET /todos?filter=all|active|completed&search=키워드`
- 필터 + 검색 교집합 (둘 다 Optional).
- 비정상 filter 값은 `all`로 폴백.
- 공백 search는 무시.

**클라이언트 URL 관리:**
- URLSearchParams 복제 후 자신의 키만 수정 (파라미터 공존 보장).
- 검색은 ~300ms 디바운스.
- 필터/검색 상태는 URL에 유지 (새로고침/공유 시 복구).

### 5. 3단계 UI 갱신 메커니즘

| 단계 | 담당 | 역할 |
|------|------|------|
| 1. cache: no-store | actions.ts fetch | 항상 최신 읽기 |
| 2. router.refresh() | 클라이언트 | **실제 갱신 트리거 (가장 중요)** |
| 3. revalidatePath | route handler | 캐시 안전망 (현 설정에선 no-op) |

**생성/수정:** `router.refresh()` → `router.push("/todos")` (순서 고정)  
**토글/삭제:** `router.refresh()`만

## 요구사항 원점

### 백엔드 AC (합격 기준)

- [x] 4개 엔드포인트(GET/POST/PUT/DELETE `/todos`) 노출 및 동작.
- [x] POST 공백 text → 422 거부.
- [x] PUT 공백 text → 422 거부.
- [x] PUT `{}` (빈 body) → 200, 무변경.
- [x] `?filter=active|completed` → 필터링.
- [x] `?filter=비정상값` → `all`로 폴백.
- [x] `?search=...` → 부분 일치.
- [x] `?filter=active&search=...` → 교집합.
- [x] 없는 ID 조회/수정/삭제 → 404.
- [x] CORS: `localhost:3000` 허용.

### 프론트 AC

- [x] `/` → `/todos` redirect.
- [x] `/todos`는 Server Component (JS 비활성 상태에서도 HTML 렌더).
- [x] 생성 후 새로고침 없이 목록 갱신 (네트워크 탭: GET /todos 재요청 1건).
- [x] 토글/삭제 후 새로고침 없이 즉시 반영.
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
| `frontend/app/todos/page.tsx` | 목록 Server Component |
| `frontend/app/todos/actions.ts` | 읽기 헬퍼 (no-store) |
| `frontend/app/api/todos/route.ts` | POST 프록시 |
| `frontend/app/api/todos/[id]/route.ts` | PUT/DELETE 프록시 |
| `frontend/app/todos/_components/TodoItem.tsx` | 토글/삭제 (router.refresh) |
| `frontend/app/todos/new/TodoForm.tsx` | 생성 (router.refresh → push) |
| `frontend/app/todos/[id]/EditForm.tsx` | 수정 (router.refresh → push) |
| `frontend/app/todos/_components/FilterTabs.tsx` | 필터 탭 (URLSearchParams 복제) |
| `frontend/app/todos/_components/SearchBox.tsx` | 검색 (디바운스) |

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
