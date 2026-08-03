# 바이브코딩 가이드 — 작업 컨텍스트

코딩 초보를 위한 바이브코딩 가이드 웹. 친구 2~3명에게 배포할 목적.

> **기획 문서는 `docs/` 에 있다.** 작업 전에 관련 문서를 읽을 것.
> 특히 `docs/06-결정-로그.md` — 여기 있는 항목은 **다시 논의하지 않는다.**

## 이미 내린 결정 (다시 논의하지 말 것)

- **스택: React + Vite + Supabase, 배포는 Vercel.** (D-001)
- **DB는 Supabase (Firebase 아님).** 가이드의 "DB 설계 / RLS 보안" 챕터가
  이 프로젝트의 실제 구현과 1:1로 맞아야 하므로 SQL/Postgres여야 한다. (D-002)
- **콘텐츠는 `src/data/chapters.js` 한 파일에 모은다.** (D-005)
  `id`가 URL, `order`가 정렬. **`id`는 절대 바꾸지 않는다** — 저장된 진도가 끊긴다.
- **프롬프트는 챕터 안에 심는다.** `/prompts`는 색인일 뿐 원본이 아니다. (D-004)
- **진도는 프로젝트 단위다.** 챕터 체크가 아니라 "내 프로젝트를 어디까지 만들었나"를
  기록한다. 여러 프로젝트 가능, 각각 따로 집계. (D-010)
- **AI 제공자는 OpenAI.** 사용자가 이미 키를 가지고 있다. (D-011)
- **AI 키는 서버리스 함수(`api/ai.js`)에만 둔다.** 브라우저에서 직접 호출하지 않는다. (D-012)

## 커리큘럼 (8단계)

`00 준비 · 01 기획 · 02 설계 · 03 빌드 · 04 데이터 · 05 보안 · 06 배포 · 07 유지보수`

사용자가 처음 제안한 건 `기획 → 빌드 → DB/보안` 세 단계였다. 앞(도구 세팅·첫 대화),
뒤(배포), 그리고 "막혔을 때 빠져나오는 법"을 더해 8단계가 됐다. 이 셋은 초보가
실제로 무너지는 지점이라 빼지 않는다. (D-003)

## 아키텍처 경계 — 깨지 말 것

```
화면(pages/, components/)
      │  훅으로만 접근. 아래를 직접 부르지 않는다
      ▼
lib/projects.js   프로젝트 (진도의 주인)
lib/progress.js   프로젝트별 진도 (projects.js 에 의존)
lib/ai.js         AI 통로 — 캐시 / 단일 실행 / 사용량
      │
      ▼  fetch('/api/ai')
api/ai.js         ★ OPENAI_API_KEY 를 아는 유일한 곳 ★ ──▶ OpenAI
```

화면에서 `localStorage` / `supabase` / `fetch('/api/ai')` 를 직접 부르지 않는다.
저장 방식이나 AI 제공자를 갈아끼울 때 한 파일만 고치면 되게 하려는 경계다. (D-006, D-012)

## ⚠️ AI 기능 — 요금이 나가는 코드다

**새 AI 기능을 만들 때 `docs/08-AI기능.md` 의 체크리스트를 따를 것.** 핵심:

- **`useEffect` 안에서 AI를 호출하지 않는다.** 버튼 `onClick` 만 허용.
  자동 호출은 새로고침·뒤로가기마다 요금이 나가고, StrictMode 는 개발 중 두 배로 부른다.
  이게 초보가 요금 폭탄 맞는 1번 원인이다. `AiPanel` 컴포넌트가 이 규칙을 구조로 강제한다
- **작업마다 `maxTokens` 를 반드시 정한다** (`api/ai.js` 의 `TASKS`). 이 숫자가 요금 상한이다
- **검색어 입력 등 타이핑에 반응해 호출하지 않는다.** 반드시 버튼으로 분리
- 캐시(`lib/ai.js`)·단일 실행·1분 10회 제한·사용량 표시는 이미 들어 있다. 빼지 말 것
- 프로젝트 정보는 `projectContext()` 로 추려서 보낸다. PRD 전체를 붙이지 않는다

## 보안 — 이 저장소가 먼저 지킨다

> **`VITE_` 가 붙으면 전 세계에 공개된다. 안 붙으면 서버에만 남는다.**

- 비밀 키에 `VITE_` 를 붙이지 않는다. `npm run build` 가 검사하고 걸리면 중단한다
  (`scripts/check-env.mjs`, D-014)
- `.env.local` 은 커밋하지 않는다. `.env.example` 만 커밋한다
- `service_role` 키는 이 프로젝트에서 쓰지 않는다
- 상세: `docs/09-보안-키관리.md`

## 디자인 무드

레퍼런스: https://paysages.studio (minimal.gallery 등재)

- 따뜻한 종이 톤 오프화이트 배경 + 숲 그늘 세이지 + 클레이 포인트
- 디스플레이는 명조: `Instrument Serif`(라틴) + `Gowun Batang`(한글), 본문은 `Pretendard`
- 넉넉한 여백, 얇은 1px 구분선, 작은 대문자 레터스페이싱 라벨, 장식 최소
- 토큰은 전부 `src/index.css` 상단 `:root`에 있다. **하드코딩된 색을 새로 쓰지 말고
  변수를 쓴다.** 라이트/다크 둘 다 정의되어 있다.
- 한글 줄바꿈이 어색해지지 않게 텍스트 블록에 `word-break: keep-all`을 유지한다.

## 현재 상태

동작함: 전체 라우팅·반응형·라이트/다크, **8챕터 본문 전체**, 단계별 프롬프트(복사),
**프로젝트 단위 진도**, **AI 기능 4종**(PRD 뽑기 / 프롬프트 맞추기 / 단계 점검표 / 용어 질문),
**키 유출 방지 빌드 검사**, `npm run dev` 하나로 `/api/ai` 까지 동작.

**아직 없음:**
- Supabase 실물 — `supabase/schema.sql` 과 코드 경로는 준비됐지만 켜본 적이 없다
- 로그인 (매직 링크) / 서버 진도 저장 — 지금은 localStorage
- `/admin` 접근 제어 — 누구나 열 수 있다
- 배포 (Vercel), 원격 저장소 (GitHub)

## 다음에 할 일

순서와 완료 조건은 **`docs/07-로드맵.md`** 에 있다. 요약:

1. `.env.local` 에 `OPENAI_API_KEY` 넣고 AI 기능 확인 (+ OpenAI 대시보드에서 사용 한도 걸기)
2. Supabase 프로젝트 생성 → `schema.sql` 실행 → `.env.local` 채우기
3. `lib/projects.js` / `lib/progress.js` 의 read/write 를 Supabase 호출로 교체.
   **화면은 훅만 쓰므로 이 두 파일만 바꾸면 된다. 이 경계를 깨지 말 것**
4. `/admin` 관리자 가드
5. GitHub + Vercel 배포 (Supabase Auth 의 Site URL 에 배포 주소 추가하는 걸 빼먹지 말 것)

## 주의

- 원격 저장소는 아직 없다. 로컬 repo.
- `dist/` 는 커밋하지 않는다 (`.gitignore` 에 있음).

## 명령

```bash
npm run dev        # http://localhost:5173 (/api/ai 포함)
npm run build      # 키 검사 후 빌드
npm run check-env  # 키 검사만
npm run lint
```
