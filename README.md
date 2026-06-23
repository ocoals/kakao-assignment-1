# Todo List (Next.js + FastAPI)

Next.js 프론트엔드와 FastAPI 백엔드로 구성된 할 일 관리 웹 앱입니다. 2차 과제의 React/Vite 구조를 **Next.js 16 App Router + FastAPI 풀스택 아키텍처**로 재구현한 3차 과제입니다.

## 기능

- **할 일 CRUD** — 추가 / 수정 / 완료 토글 / 삭제
- **서버 기반 필터** — 전체 / 진행중 / 완료 (URL 파라미터 `?filter=`)
- **서버 기반 검색** — 텍스트 부분 일치 (URL 파라미터 `?search=`)
- **필터+검색 동시 적용** — `?filter=active&search=키워드` 교집합 결과
- **검색 디바운스** — 입력 후 약 300ms 정지 시점에 1회 갱신
- **URL 파라미터 유지** — 새로고침/공유 후에도 필터·검색 상태 복구

## 기술 스택

**프론트엔드:**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

**백엔드:**
- FastAPI
- SQLAlchemy (ORM)
- SQLite
- Pydantic v2

## 실행 방법

### 백엔드 시작

```bash
cd backend

# 첫 실행: 가상환경 생성 및 의존성 설치
python3 -m venv .venv
source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt

# 백엔드 실행
uvicorn main:app

# API 문서: http://localhost:8000/docs
```

### 프론트엔드 시작

```bash
cd frontend

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# http://localhost:3000/todos 접속
```

**주의:** 두 서버를 동시에 실행해야 앱이 정상 동작합니다.

## 데이터 흐름

### 읽기 (목록 조회)

```
Client (브라우저)
    ↓
Server Component (page.tsx)
    ↓ getTodos() [actions.ts]
    ↓ (cache: "no-store" — 항상 최신 데이터)
    ↓
FastAPI: GET /todos?filter=...&search=...
    ↓
SQLite DB (필터링·검색 수행)
```

**특징:** Server Component에서 `actions.ts`의 `getTodos()`를 직접 호출. 캐시를 사용하지 않으므로 재렌더될 때마다 최신 데이터를 가져옵니다.

### 쓰기 (생성/수정/삭제)

```
Client Component (TodoItem/TodoForm)
    ↓ fetch() [NEXT_PUBLIC_API_URL/todos*]
    ↓
Next.js Route Handler (app/api/todos/route.ts 또는 [id]/route.ts)
    ↓ fetch() [BACKEND_URL/todos*]
    ↓
FastAPI (쓰기 처리)
    ↓
Route Handler: revalidatePath("/todos") [캐시 무효화 안전망]
    ↓
Client: router.refresh() / router.push() [실제 UI 갱신 트리거]
```

**특징:** 클라이언트가 Next.js route handler를 프록시로 호출하므로 CORS 간소화 + 백엔드 API 경로 숨김.

## 환경 변수

### frontend/.env.local

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_URL=http://localhost:8000
```

- `NEXT_PUBLIC_API_URL` — 클라이언트 컴포넌트에서 사용. 브라우저에 노출되므로 `NEXT_PUBLIC_` 접두사 필수.
- `BACKEND_URL` — 서버 전용 (actions.ts, route handlers). 브라우저에 노출 안 됨.

### backend/.env.local

```
DATABASE_URL=sqlite:///./todos.db
```

(`.gitignore`에 포함되어 커밋 제외)

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/todos?filter=all\|active\|completed&search=` | 할 일 목록 조회 (필터/검색 적용) |
| `POST` | `/todos` | 할 일 생성 (`{ "text": "..." }`) |
| `PUT` | `/todos/{id}` | 할 일 부분 수정 (`{ "text"?: "...", "completed"?: true/false }`) |
| `DELETE` | `/todos/{id}` | 할 일 삭제 |

**쿼리 파라미터:**
- `filter` — `all` (기본) / `active` (진행중) / `completed` (완료). 미지정 또는 비정상값 시 `all`로 폴백.
- `search` — 텍스트 부분 일치 (LIKE '%...%'). 공백만 입력 시 무시.

**응답 상태:**
- `201` / `200` — 생성 성공
- `200` — 조회/수정/삭제 성공
- `204` — 삭제 성공 (본문 없음)
- `404` — 없는 ID
- `422` — 검증 실패 (공백 텍스트 등)

## 프로젝트 구조

```
todo-vanilla/
├── README.md                    # 이 파일
├── AGENTS.md                    # 에이전트 가이드
├── .gitignore
│
├── frontend/                    # Next.js 프론트엔드
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── .env.local (git 제외)
│   │
│   ├── app/
│   │   ├── layout.tsx           # 루트 레이아웃
│   │   ├── page.tsx             # /todos로 redirect
│   │   │
│   │   ├── todos/
│   │   │   ├── page.tsx         # 할 일 목록 (Server Component)
│   │   │   ├── actions.ts       # 읽기 헬퍼 (getTodos)
│   │   │   ├── loading.tsx      # 로딩 스켈레톤
│   │   │   ├── error.tsx        # 에러 폴백
│   │   │   ├── types.ts         # Todo 타입 정의
│   │   │   │
│   │   │   ├── _components/
│   │   │   │   ├── TodoItem.tsx       # 목록 항목 (토글/삭제)
│   │   │   │   ├── FilterTabs.tsx     # 필터 탭
│   │   │   │   └── SearchBox.tsx      # 검색창
│   │   │   │
│   │   │   ├── new/
│   │   │   │   ├── page.tsx           # 생성 페이지
│   │   │   │   └── TodoForm.tsx       # 생성 폼
│   │   │   │
│   │   │   └── [id]/
│   │   │       ├── page.tsx           # 수정 페이지
│   │   │       └── EditForm.tsx       # 수정 폼
│   │   │
│   │   └── api/todos/
│   │       ├── route.ts               # POST /api/todos (프록시)
│   │       └── [id]/route.ts          # PUT/DELETE /api/todos/[id] (프록시)
│   │
│   └── public/
│
├── backend/                     # FastAPI 백엔드
│   ├── requirements.txt
│   ├── .env.local (git 제외)
│   ├── .gitignore
│   │
│   ├── main.py                  # FastAPI 앱 + CRUD 엔드포인트
│   ├── database.py              # SQLAlchemy 엔진/세션/Base
│   ├── models.py                # Todo ORM 모델
│   └── schemas.py               # Pydantic 스키마 (TodoCreate/TodoUpdate/TodoRead)
│
└── docs/
    └── PLAN.md                  # 과제3 구현 계획
```

## 주요 설계 결정

### 읽기 = `actions.ts`, 쓰기 = `route.ts`

- **읽기 (`getTodos`)** — Server Component에서 직접 호출하는 순수 fetch 헬퍼. 매번 최신 데이터를 가져옴 (no-store).
- **쓰기** — 클라이언트 컴포넌트에서 HTTP 요청 → Next.js route handler → FastAPI. Route handler는 `revalidatePath("/todos")`를 호출해 캐시 무효화.

이 두 패턴의 분리로 서버/클라이언트 경계가 명확해지고, 캐싱·갱신 로직이 구조화됩니다.

### UI 갱신 메커니즘

세 가지 메커니즘이 다른 역할을 합니다:

1. **`cache: "no-store"` (actions.ts의 fetch)** — 항상 최신 읽기를 보장. 갱신을 **트리거하지는 않음**.
2. **`router.refresh()` / `router.push()` (클라이언트)** — 실제 UI 갱신 동력. 이것을 호출해야 Server Component가 재렌더되고 위의 no-store fetch가 다시 실행됨.
3. **`revalidatePath("/todos")` (route handler)** — 캐시 무효화 안전망. 향후 읽기 캐싱을 켜거나 다른 진입점이 캐시를 탈 때를 대비.

**생성/수정 후 갱신 순서:** `router.refresh()` → `router.push("/todos")` (이 순서 고정)  
**토글/삭제 후 갱신:** `router.refresh()`만 (이미 `/todos`에 머무름)

### 동적 세그먼트 통일

페이지와 API 라우트 모두 `[id]`로 동일하게 사용:
- `app/todos/[id]/page.tsx` (수정 페이지)
- `app/api/todos/[id]/route.ts` (PUT/DELETE 프록시)

`const { id } = await params` 패턴으로 일관 추출.

### 정수 ID (Integer PK)

할 일 ID는 SQLite의 자동증가 정수. (2차의 UUID 대신)  
POST 요청 본문에 id를 포함하지 않으며, 서버가 생성해 응답.

## 채점 체크포인트

다음 항목들이 구현 확인 기준:

- [ ] 두 서버 동시 기동 후 `/todos` 접속 → 할 일 목록 렌더
- [ ] 새 할 일 생성 → 새로고침 없이 목록에 노출
- [ ] 완료 토글/삭제 → 새로고침 없이 즉시 반영
- [ ] 할 일 수정 페이지 진입 → 기존 텍스트 prefill
- [ ] 필터 탭 클릭 → URL에 `?filter=` 추가, 새로고침 후 유지
- [ ] 검색 입력 → ~300ms 후 1회 갱신, URL에 `?search=` 추가
- [ ] 필터+검색 동시 → `?filter=active&search=...` URL, 교집합 결과
- [ ] 백엔드 끄기 → `error.tsx` 폴백 표시
- [ ] 쓰기 실패 → 컴포넌트 내 인라인 에러 문구 표시

## .gitignore 항목

```
frontend/node_modules
frontend/.next
frontend/.env.local

backend/.venv
backend/todos.db
backend/__pycache__
backend/.env.local

.DS_Store
```
