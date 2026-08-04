# 바이브코딩 가이드

코딩을 처음 시작하는 사람을 위한 바이브코딩 가이드 웹.

**만들고 싶은 것을 프로젝트로 등록하고**, 기획 → 빌드 → 데이터 → 보안 → 배포까지
8단계를 그 프로젝트에 기록하며 한 사이클을 완주합니다.
각 단계에서 AI에게 줄 프롬프트를 함께 제공하고, AI가 내 프로젝트에 맞춰 다듬어줍니다.

## 실행

```bash
npm install
cp .env.example .env.local   # 키를 채웁니다 (없어도 실행은 됩니다)
npm run dev                  # http://localhost:5173
```

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버. `/api/ai` 까지 같이 동작합니다 |
| `npm run build` | **키 유출 검사 후** `dist/` 생성 |
| `npm run check-env` | 키 유출 검사만 |
| `npm run lint` | oxlint |
| `npm run preview` | 빌드 결과 확인 |

`.env.local` 없이도 사이트는 정상 동작합니다 — AI 기능만 꺼진 채로 뜹니다.

## 스택

| | |
|---|---|
| 프레임워크 | React 19 + Vite |
| 라우팅 | react-router-dom |
| 스타일 | 순수 CSS (`src/index.css`, CSS 변수 기반 토큰) |
| 폰트 | Instrument Serif + Gowun Batang (디스플레이), Pretendard (본문) |
| AI | OpenAI — **서버리스 함수에서만** 호출 (`api/ai.js`) |
| 인증·DB | Supabase (스키마 준비됨, 미연결) |
| 배포 | Vercel (예정) |

React를 고른 이유: 이 사이트 자체를 AI 도구로 만들면서 가이드를 씁니다.
AI 코딩 도구가 가장 정확한 코드를 생성하는 프레임워크를 골라야 작업이 덜 막힙니다.

## 구조

```
api/
  ai.js                 서버리스 함수. ★ OPENAI_API_KEY 를 아는 유일한 곳
scripts/
  check-env.mjs         빌드 전 키 유출 검사
supabase/
  schema.sql            테이블 + RLS + 트리거 전문 (붙여넣어 실행)
docs/                   기획 문서 — PRD, 기능범위, 결정 로그 등
src/
  main.jsx              라우터 정의
  index.css             스타일 시스템 전체 (디자인 토큰 + 컴포넌트 스타일)
  components/
    Layout.jsx          상단바 / 푸터 / <Outlet>
    PromptCard.jsx      복사 버튼 + "내 프로젝트에 맞추기"
    Prose.jsx           챕터 본문 블록 렌더링
    inline.jsx          문장 안 **강조** / `코드` 처리 (본문·용어사전 공용)
    AiPanel.jsx         AI 기능 공통 껍데기 (버튼으로만 실행되게 강제)
  data/
    chapters.js         8개 챕터 본문 + 프롬프트  ← 콘텐츠는 전부 여기
    glossary.js         용어 사전
    resources.js        참고 링크 모음  ← 링크 추가는 여기만 고치면 됩니다
  lib/
    projects.js         프로젝트 (진도의 주인)
    progress.js         프로젝트별 진도
    ai.js               AI 호출 통로 — 캐시 / 단일 실행 / 사용량
  pages/
    Home / Learn / Chapter / Projects / Project / Prompts / Glossary / Admin / NotFound
```

**화면 컴포넌트는 `localStorage`도 `supabase`도 `openai`도 직접 부르지 않습니다.**
전부 `lib/` 아래 훅을 거칩니다. 저장 방식이나 AI 제공자를 바꿀 때 한 파일만
고치면 되게 하려는 경계입니다.

## 라우트

| 경로 | 화면 |
|---|---|
| `/` | 랜딩 |
| `/learn` | 커리큘럼 목록 |
| `/learn/:chapterId` | 챕터 본문 + 프롬프트 + 완료 체크 + AI 점검표 |
| `/projects` | 내 프로젝트 + 새로 만들기 + AI 사용량 |
| `/projects/:projectId` | 프로젝트 대시보드 (다음에 할 일 / PRD / 진도) |
| `/prompts` | 프롬프트 사전 (검색) |
| `/resources` | 참고 소스 — 기획 도구·레퍼런스·폰트·아이콘 링크 |
| `/glossary` | 용어 사전 (검색 + AI 질문) |
| `/admin` | 관리자 (프로젝트 진도 / AI 사용량 / 챕터 목록) |

## AI 기능

키가 있으면 네 곳에서 동작합니다. 없으면 조용히 꺼집니다.

| 기능 | 어디서 |
|---|---|
| 아이디어 → 한 장짜리 PRD | 새 프로젝트 만들기 |
| 기본 프롬프트를 내 프로젝트에 맞추기 | 모든 프롬프트 카드 |
| 이 단계 제대로 했는지 점검표 | 각 챕터 하단 |
| 모르는 용어를 내 맥락으로 설명 | 용어 사전 |

### 요금이 새지 않게 하는 장치

AI는 호출할 때마다 실제로 돈이 나갑니다. 그래서 아래가 코드에 박혀 있습니다.

- **자동 호출 경로가 없습니다.** 모든 AI 호출은 버튼을 눌러야만 실행됩니다.
  `useEffect` 안에서 부르는 코드는 한 줄도 없습니다 — 새로고침마다 돈이 나가는
  가장 흔한 사고입니다
- **같은 요청은 캐시된 답을 씁니다.** 재사용 시 화면에 "요금이 나가지 않았습니다"라고 표시
- **버튼 연타로 여러 번 나가지 않습니다** (단일 실행 + 버튼 잠금)
- **입력 4000자 / 출력은 작업별 상한**, 프로젝트 정보도 필요한 줄만 보냅니다
- **1분에 10회** 넘으면 서버가 거절합니다
- **사용량이 화면에 보입니다** (`/projects`, `/admin`)

자세한 내용: [docs/08-AI기능.md](docs/08-AI기능.md)

## 보안

> **`VITE_` 가 붙으면 전 세계에 공개됩니다. 안 붙으면 서버에만 남습니다.**

- `OPENAI_API_KEY` 는 `api/ai.js` 안에서만 쓰입니다. 브라우저 번들에 들어가지 않습니다
- `npm run build` 는 **키 유출 검사를 먼저 돌리고, 걸리면 빌드를 중단합니다**
  (`scripts/check-env.mjs`)
- `.env.local` 은 `.gitignore` 에 있습니다. `.env.example` 만 커밋됩니다

보안 챕터에서 가르치는 걸 이 저장소가 먼저 지킵니다.
전체 규칙과 유출 대응: [docs/09-보안-키관리.md](docs/09-보안-키관리.md)

## 콘텐츠 수정하기

챕터를 고치거나 추가하려면 `src/data/chapters.js` 하나만 건드리면 됩니다.
`id`는 URL이 되고, `order`는 정렬 순서입니다.

⚠️ **`id`는 바꾸지 마세요** — 저장된 진도가 챕터 `id`로 연결돼 있어서 끊깁니다.

### 참고 링크 추가하기

`src/data/resources.js` **한 파일만** 고치면 됩니다. 화면·검색·목차는 이 파일을 보고
알아서 그려집니다.

```js
// 링크 하나 추가 — 해당 그룹의 items 에 한 줄
{ name: '이름', url: 'https://...', what: '언제 쓰는지 한 줄' }

// 새 분류 추가 — 배열에 객체 하나
{ id: 'english-slug', title: '분류 이름', blurb: '언제 여는지', items: [] }
```

`chapter: 'design'` 처럼 챕터 `id`를 넣으면 그 챕터 하단에도 자동으로 링크가 붙습니다.

## 기획 문서

왜 이렇게 만들었는지는 [`docs/`](docs/)에 있습니다.
특히 [결정 로그](docs/06-결정-로그.md)는 이미 끝난 논의를 다시 하지 않으려고 쌓는 기록입니다.
AI 도구에게 작업을 시킬 때 통째로 붙여넣으면 좋습니다.
