// 학습 트랙 정의.
// 지금은 정적 데이터. 나중에 Supabase의 chapters 테이블로 옮길 때
// 이 파일의 형태를 그대로 스키마로 쓰면 된다. (id = slug, order = 정렬)

export const chapters = [
  {
    id: 'setup',
    order: 0,
    stage: '준비',
    title: '준비 — 첫 대화까지',
    summary: '바이브코딩이 뭔지, 어떤 도구를 쓸지 정하고 AI와 첫 대화를 나눈다.',
    minutes: 20,
    sections: [
      '바이브코딩은 무엇이고, 무엇이 아닌가',
      '도구 고르기: Claude Code / Cursor / 그 외',
      '설치와 최소 세팅',
      '첫 대화 — 무엇부터 말해야 하나',
    ],
    prompts: [
      {
        label: '첫 대화 열기',
        body: '나는 코딩을 처음 배우는 사람이야. 지금부터 만들고 싶은 걸 설명할 테니, 내가 빠뜨린 게 있으면 먼저 질문해줘. 코드는 아직 쓰지 마.',
      },
    ],
  },
  {
    id: 'planning',
    order: 1,
    stage: '기획',
    title: '기획 — 뭘 만들지 정하기',
    summary: '머릿속 아이디어를 AI가 읽을 수 있는 한 장짜리 문서로 만든다.',
    minutes: 30,
    sections: [
      '아이디어를 한 문장으로 줄이기',
      'PRD 한 장 쓰기',
      '화면 목록 뽑기',
      '범위를 줄이는 법 — 첫 버전에서 뺄 것들',
    ],
    prompts: [
      {
        label: 'PRD 뽑기',
        body: '아래 아이디어로 한 장짜리 PRD를 써줘. 항목은 (1) 한 문장 요약 (2) 대상 사용자 (3) 첫 버전에 반드시 있어야 하는 기능 3개 (4) 첫 버전에서 뺄 기능 (5) 화면 목록. 아이디어: ',
      },
      {
        label: '범위 줄이기',
        body: '이 기능 목록에서 첫 버전에 없어도 되는 걸 골라주고, 왜 없어도 되는지 한 줄씩 이유를 붙여줘.',
      },
    ],
  },
  {
    id: 'design',
    order: 2,
    stage: '설계',
    title: '설계 — 구조 잡기',
    summary: '화면과 데이터를 어떤 모양으로 둘지, 어떤 스택을 쓸지 정한다.',
    minutes: 30,
    sections: [
      '화면 흐름 그리기',
      '데이터 구조 먼저 정하기',
      '스택 고르기 — AI가 잘 쓰는 것을 고르는 이유',
      '폴더 구조',
    ],
    prompts: [
      {
        label: '스택 추천받기',
        body: '아래 PRD를 보고 스택을 추천해줘. 선택지를 나열만 하지 말고 하나를 고르고 이유를 말해줘. 내가 초보라는 점, 그리고 AI 도구로 개발한다는 점을 고려해줘. PRD: ',
      },
    ],
  },
  {
    id: 'build',
    order: 3,
    stage: '빌드',
    title: '빌드 — 하나씩 쌓기',
    summary: '첫 화면부터 기능 하나씩. 그리고 막혔을 때 빠져나오는 법.',
    minutes: 60,
    sections: [
      '첫 화면 띄우기',
      '기능 하나씩 요청하는 법',
      '에러를 AI에게 전달하는 법',
      '막혔을 때 탈출법 — 되돌리기, 쪼개기, 새 대화 시작하기',
    ],
    prompts: [
      {
        label: '기능 하나 요청',
        body: '지금 코드베이스에 이 기능 하나만 추가해줘. 다른 파일은 건드리지 말고, 바꾼 파일과 이유를 마지막에 요약해줘. 기능: ',
      },
      {
        label: '에러 전달',
        body: '아래 에러가 났어. 원인을 먼저 설명하고, 고치기 전에 무엇을 바꿀 건지 알려줘. 에러 전문: ',
      },
    ],
  },
  {
    id: 'data',
    order: 4,
    stage: '데이터',
    title: '데이터 — DB 붙이기',
    summary: '데이터를 어디에 어떻게 저장할지. 테이블 설계와 연결.',
    minutes: 45,
    sections: [
      '왜 localStorage로는 부족한가',
      '테이블과 관계 — 최소한의 개념',
      'Supabase 프로젝트 만들기',
      '앱에서 읽고 쓰기',
    ],
    prompts: [
      {
        label: '스키마 설계',
        body: '아래 기능 목록을 저장하려면 어떤 테이블이 필요한지 설계해줘. 각 테이블의 컬럼과 타입, 테이블 간 관계를 표로 보여주고, 마지막에 CREATE TABLE SQL을 줘. 기능: ',
      },
    ],
  },
  {
    id: 'security',
    order: 5,
    stage: '보안',
    title: '보안 — 사고 나기 전에',
    summary: '초보가 실제로 터뜨리는 사고 몇 가지와, 그걸 막는 최소한의 장치.',
    minutes: 45,
    sections: [
      '인증과 인가는 다르다',
      'API 키를 코드에 넣으면 생기는 일',
      '.env와 환경변수',
      'Row Level Security — 남의 데이터가 보이지 않게',
      '흔한 사고 5가지',
    ],
    prompts: [
      {
        label: '보안 점검',
        body: '이 프로젝트에서 외부에 노출되면 안 되는 값이 코드에 하드코딩되어 있는지 찾아줘. 찾으면 어떻게 옮겨야 하는지도 알려줘.',
      },
      {
        label: 'RLS 정책 작성',
        body: '이 테이블에 Row Level Security를 켜고, 사용자가 자기 행만 읽고 쓸 수 있게 하는 정책 SQL을 써줘. 각 정책이 무엇을 막는지 주석으로 설명해줘. 테이블: ',
      },
    ],
  },
  {
    id: 'deploy',
    order: 6,
    stage: '배포',
    title: '배포 — 남에게 보여주기',
    summary: '내 컴퓨터에서만 돌던 걸 인터넷에 올린다.',
    minutes: 30,
    sections: [
      'Git과 GitHub 최소한만',
      'Vercel에 올리기',
      '환경변수를 배포 환경에 넣기',
      '도메인 연결',
    ],
    prompts: [
      {
        label: '배포 전 점검',
        body: '지금 이 프로젝트를 Vercel에 배포하려고 해. 배포 전에 확인해야 할 것들을 체크리스트로 만들어주고, 지금 코드에서 걸리는 게 있으면 알려줘.',
      },
    ],
  },
  {
    id: 'maintain',
    order: 7,
    stage: '유지보수',
    title: '유지보수 — 그 다음',
    summary: '버그를 잡고, 기능을 더하고, 지저분해진 코드를 정리시킨다.',
    minutes: 30,
    sections: [
      '버그 리포트를 잘 쓰는 법',
      '기능 추가할 때 무너지지 않게',
      'AI에게 리팩터 시키기',
      '언제 직접 읽어야 하나',
    ],
    prompts: [
      {
        label: '리팩터 요청',
        body: '이 파일이 너무 길어졌어. 동작은 그대로 두고 구조만 정리해줘. 바꾸기 전에 어떻게 나눌 건지 먼저 설명해줘.',
      },
    ],
  },
]

export const chapterById = Object.fromEntries(chapters.map((c) => [c.id, c]))

export function neighbors(id) {
  const i = chapters.findIndex((c) => c.id === id)
  return {
    prev: i > 0 ? chapters[i - 1] : null,
    next: i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null,
  }
}
