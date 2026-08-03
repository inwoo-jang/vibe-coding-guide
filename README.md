# 바이브코딩 가이드

코딩을 처음 시작하는 사람을 위한 바이브코딩 가이드 웹.
기획 → 빌드 → 데이터 → 보안 → 배포까지 8단계로 따라가고, 각 단계에서 AI에게 줄 프롬프트를 함께 제공한다.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 생성
npm run preview  # 빌드 결과 확인
```

## 스택

| | |
|---|---|
| 프레임워크 | React 19 + Vite |
| 라우팅 | react-router-dom |
| 스타일 | 순수 CSS (`src/index.css`, CSS 변수 기반 토큰) |
| 폰트 | Instrument Serif + Gowun Batang (디스플레이), Pretendard (본문) |
| 인증·DB | Supabase (예정) |
| 배포 | Vercel (예정) |

React를 고른 이유: 이 사이트 자체를 AI 도구로 만들면서 가이드를 쓴다. AI 코딩 도구가 가장 정확한 코드를 생성하는 프레임워크를 골라야 작업이 덜 막힌다.

## 구조

```
src/
  main.jsx              라우터 정의
  index.css             스타일 시스템 전체 (디자인 토큰 + 컴포넌트 스타일)
  components/
    Layout.jsx          상단바 / 푸터 / <Outlet>
    PromptCard.jsx      복사 버튼 달린 프롬프트 블록
  data/
    chapters.js         8개 챕터 + 단계별 프롬프트  ← 콘텐츠는 전부 여기
    glossary.js         용어 사전
  lib/
    progress.js         진도 저장 (현재 localStorage)
  pages/
    Home / Learn / Chapter / Prompts / Glossary / Me / Admin / NotFound
```

## 라우트

| 경로 | 화면 |
|---|---|
| `/` | 랜딩 |
| `/learn` | 커리큘럼 목록 |
| `/learn/:chapterId` | 챕터 본문 + 완료 체크 |
| `/prompts` | 프롬프트 사전 (검색) |
| `/glossary` | 용어 사전 (검색) |
| `/me` | 내 진도 |
| `/admin` | 관리자 (진도 현황 / 챕터 목록) |

## 현재 상태

동작하는 것

- 전체 라우팅, 반응형 레이아웃, 라이트/다크
- 8개 챕터 목차와 단계별 프롬프트, 클립보드 복사
- 진도 체크 → 상단 % / 커리큘럼 / 내 진도에 즉시 반영

아직 없는 것

- **챕터 본문** — `data/chapters.js`의 `sections`는 목차만 있고 내용은 비어 있다
- **로그인** — 상단 "로그인" 버튼은 `/me`로 보낼 뿐이다
- **서버 진도 저장** — 지금은 브라우저 localStorage. 기기를 바꾸면 초기화된다
- **관리자 접근 제어** — `/admin`이 누구에게나 열려 있다

## 다음 단계 (Supabase 붙이기)

1. Supabase 프로젝트 생성 → `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
2. 테이블: `profiles(id, email, is_admin)`, `progress(user_id, chapter_id, done, updated_at)`
3. 두 테이블에 RLS 활성화 — 본인 행만 읽고 쓰기, `is_admin`만 전체 조회
4. `src/lib/progress.js`의 `read()` / `write()`를 Supabase 호출로 교체
   (화면 쪽은 `useProgress()`만 쓰고 있어서 이 파일만 바꾸면 된다)
5. `/admin`에 관리자 가드 추가

`.env`는 `.gitignore`에 들어 있다. 키를 코드에 직접 쓰지 않는다 — 보안 챕터에서 다루는 내용을 이 저장소가 먼저 지킨다.

## 콘텐츠 수정하기

챕터를 고치거나 추가하려면 `src/data/chapters.js` 하나만 건드리면 된다.
`id`는 URL이 되고, `order`는 정렬 순서다. 나중에 Supabase의 `chapters` 테이블로 옮길 때 이 객체 모양을 그대로 스키마로 쓰면 된다.
