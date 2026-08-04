// 참고 소스 — 링크 모음.
//
// ★ 여기에 계속 이어 붙이면 됩니다 ★
//
// 새 링크 하나 추가하려면:
//   해당 그룹의 items 에 { name, url, what } 한 줄만 넣으면 됩니다.
//
// 새 분류를 만들려면:
//   아래 배열에 { id, title, blurb, items: [] } 를 하나 추가하면 됩니다.
//   화면·검색·목차는 이 파일을 보고 알아서 그려집니다. 다른 파일은 안 건드려도 됩니다.
//
// 항목 모양:
//   name    보이는 이름 (필수)
//   url     링크 (필수)
//   what    한 줄 설명 — "이걸 언제 쓰나" (필수)
//   note    라이선스나 주의사항 같은 꼬리표 (선택)
//   pick    true 면 '추천' 표시. 그룹당 1~2개만
//
// 그룹 모양:
//   id      URL 앵커 겸 열쇠 (필수, 영문)
//   title   보이는 제목 (필수)
//   blurb   이 분류를 언제 여는지 한 줄 (선택)
//   chapter 관련 챕터 id — 챕터에서 이 그룹으로 링크가 걸린다 (선택)

export const resourceGroups = [
  {
    id: 'services',
    title: '개발 서비스 — 계정 만들고 키 받는 곳',
    blurb:
      '대시보드에 들어가서 계정을 만들거나 키를 받아오는 곳들. 코드로는 못 하고 사람이 클릭해야 하는 일들입니다.',
    chapter: 'deploy',
    items: [
      {
        name: 'GitHub',
        url: 'https://github.com',
        what: '코드를 인터넷에 보관하고 되돌릴 수 있게 합니다. 배포도 여기 연결해서 합니다',
        note: '무료',
        pick: true,
      },
      {
        name: 'Vercel',
        url: 'https://vercel.com/dashboard',
        what: 'GitHub 저장소를 연결하면 push 할 때마다 자동 배포. 환경변수도 여기서 넣습니다',
        note: '무료',
        pick: true,
      },
      {
        name: 'Supabase',
        url: 'https://supabase.com/dashboard',
        what: 'DB·로그인·파일저장. SQL Editor, 로그인 제공자 설정, 사용자 목록이 다 여기 있습니다',
        note: '무료 시작',
      },
      {
        name: 'OpenAI Platform',
        url: 'https://platform.openai.com/api-keys',
        what: 'AI 기능용 API 키를 발급받는 곳. **월 사용 한도를 꼭 걸어두세요** — 마지막 안전장치입니다',
        note: '유료',
      },
      {
        name: 'Google Cloud Console',
        url: 'https://console.cloud.google.com/apis/credentials',
        what: '구글 로그인을 붙일 때 OAuth 클라이언트를 만드는 곳. 여기서 받은 ID·Secret 을 Supabase 에 넣습니다',
      },
      {
        name: 'Kakao Developers',
        url: 'https://developers.kakao.com/console/app',
        what: '카카오 로그인용. 앱 키의 **REST API 키**를 씁니다 (앱 ID 숫자가 아닙니다)',
      },
      {
        name: 'Cloudflare',
        url: 'https://dash.cloudflare.com',
        what: '도메인을 샀을 때 연결하는 곳. 무료 플랜으로도 속도·보안이 붙습니다',
      },
    ],
  },

  {
    id: 'devtools',
    title: '개발 도구',
    blurb: '만들면서 확인하고 시험할 때 쓰는 것들.',
    chapter: 'build',
    items: [
      {
        name: 'Postman',
        url: 'https://www.postman.com',
        what: 'API 를 화면 없이 직접 호출해보는 도구. "서버가 잘못인가 화면이 잘못인가"를 가릅니다. 회원가입 없이 쓰는 데스크톱 앱도 있습니다',
        note: '무료',
        pick: true,
      },
      {
        name: 'Hoppscotch',
        url: 'https://hoppscotch.io',
        what: 'Postman 과 같은 일을 브라우저에서 바로. 설치가 부담스러우면 이쪽',
        note: '무료·오픈소스',
      },
      {
        name: 'JSON Formatter',
        url: 'https://jsonformatter.org',
        what: '한 줄로 뭉친 JSON 을 읽을 수 있게 펴줍니다. API 응답 볼 때',
      },
      {
        name: 'regex101',
        url: 'https://regex101.com',
        what: '정규식이 뭘 잡는지 눈으로 확인. AI가 준 정규식을 검증할 때 유용합니다',
      },
      {
        name: 'Squoosh',
        url: 'https://squoosh.app',
        what: '이미지 용량 줄이기. 사진을 그대로 올리면 사이트가 느려집니다',
      },
      {
        name: 'TinyPNG',
        url: 'https://tinypng.com',
        what: 'PNG·JPG 를 여러 장 한 번에 줄일 때',
      },
    ],
  },

  {
    id: 'planning',
    title: '기획 도구',
    blurb: '아이디어를 문서로 만들 때. 01 기획 단계에서 씁니다.',
    chapter: 'planning',
    items: [
      {
        name: 'Manifest',
        url: 'https://manyfast.io',
        what: 'PRD·기능명세·유저플로우·와이어프레임을 한 화면에서. AI와 대화하며 다듬고 Cursor·Claude Code에 MCP로 바로 연결됩니다',
        note: '한국어',
        pick: true,
      },
      {
        name: 'Excalidraw',
        url: 'https://excalidraw.com',
        what: '화면 흐름을 손그림처럼 빠르게. 계정 없이 바로 그릴 수 있습니다',
      },
      {
        name: 'Figma',
        url: 'https://www.figma.com',
        what: '화면을 제대로 그릴 때. 무료 플랜으로 충분합니다',
      },
    ],
  },

  {
    id: 'docs',
    title: '문법 찾아보기',
    blurb:
      'AI가 쓴 코드에 모르는 게 나왔을 때 검색하는 곳. 전부 외울 필요는 없고, 찾는 법만 알면 됩니다.',
    chapter: 'build',
    items: [
      {
        name: 'MDN Web Docs',
        url: 'https://developer.mozilla.org/ko/',
        what: 'HTML·CSS·JavaScript 의 표준 설명서. 태그·속성·함수 이름을 그대로 검색하면 됩니다. 브라우저 만드는 곳들이 함께 관리해서 가장 정확합니다',
        pick: true,
      },
      {
        name: 'Can I use',
        url: 'https://caniuse.com',
        what: '"이 기능 써도 되나?" 를 확인합니다. 어떤 브라우저에서 되는지 표로 보여줍니다',
      },
      {
        name: 'DevDocs',
        url: 'https://devdocs.io',
        what: 'MDN·React·Node 등 여러 문서를 한 곳에서 빠르게 검색. 인터넷 없이도 쓸 수 있게 저장됩니다',
      },
    ],
  },

  {
    id: 'database',
    title: 'DB·백엔드',
    blurb:
      '초보는 "백엔드 통째로(BaaS)" 쪽에서 고르세요 — 로그인까지 들어 있습니다. 04 데이터 단계.',
    chapter: 'data',
    items: [
      {
        name: 'Supabase',
        url: 'https://supabase.com',
        what: 'SQL(Postgres) + 로그인 + 파일저장. 이 가이드가 쓰는 것. 표로 생각하는 방식이 그대로 통합니다',
        note: '무료 시작',
        pick: true,
      },
      {
        name: 'Firebase',
        url: 'https://firebase.google.com',
        what: 'NoSQL + 로그인. 구글. 실시간 동기화가 강하고 자료가 가장 많습니다',
        note: '무료 시작',
      },
      {
        name: 'Appwrite',
        url: 'https://appwrite.io',
        what: '오픈소스 BaaS. 직접 서버에 설치할 수도 있습니다',
        note: '오픈소스',
      },
      {
        name: 'Pocketbase',
        url: 'https://pocketbase.io',
        what: '파일 하나로 돌아가는 초경량 백엔드. 작은 프로젝트에 좋습니다',
        note: '오픈소스',
      },
      {
        name: 'Neon',
        url: 'https://neon.tech',
        what: '서버리스 Postgres. DB만 필요할 때. 안 쓰면 잠들어서 무료 한도가 넉넉합니다',
        note: '무료 시작',
      },
      {
        name: 'Turso',
        url: 'https://turso.tech',
        what: 'SQLite 기반. 가볍고 빠릅니다',
        note: '무료 시작',
      },
      {
        name: 'Vercel Storage',
        url: 'https://vercel.com/docs/storage',
        what: 'Vercel에 배포한다면 연결이 제일 간단합니다 (Postgres·Blob·KV)',
      },
      {
        name: 'MongoDB Atlas',
        url: 'https://www.mongodb.com/atlas',
        what: 'NoSQL. 데이터 모양이 제각각일 때',
        note: '무료 시작',
      },
      {
        name: 'Airtable',
        url: 'https://www.airtable.com',
        what: '엑셀처럼 쓰는 DB. 코드를 거의 안 쓰고 시작할 때. 사용자가 늘면 한계가 옵니다',
      },
    ],
  },

  {
    id: 'infra-pro',
    title: 'DB — 유료·실무용',
    blurb:
      '지금 볼 필요는 없습니다. 사용자가 늘거나 회사에서 쓸 때 여는 칸입니다. Supabase·Neon도 결국 이 위에서 돌아갑니다.',
    chapter: 'data',
    items: [
      {
        name: 'AWS RDS',
        url: 'https://aws.amazon.com/rds/',
        what: '관리형 Postgres·MySQL. 실무에서 가장 많이 쓰입니다. 설정할 게 많은 만큼 통제력도 큽니다',
        note: '유료',
      },
      {
        name: 'AWS Aurora',
        url: 'https://aws.amazon.com/rds/aurora/',
        what: 'AWS가 다시 만든 고성능 Postgres·MySQL. 규모가 커졌을 때',
        note: '유료',
      },
      {
        name: 'AWS DynamoDB',
        url: 'https://aws.amazon.com/dynamodb/',
        what: 'NoSQL. 아주 큰 트래픽에 강합니다',
        note: '유료',
      },
      {
        name: 'Google Cloud SQL',
        url: 'https://cloud.google.com/sql',
        what: '구글의 관리형 Postgres·MySQL',
        note: '유료',
      },
      {
        name: 'Supabase Pro',
        url: 'https://supabase.com/pricing',
        what: '월 $25. 일시정지 없음, 용량·백업 확대. 무료에서 가장 자연스러운 다음 단계',
        note: '$25/월',
        pick: true,
      },
      {
        name: 'Neon 유료 플랜',
        url: 'https://neon.com/pricing',
        what: 'Postgres만 필요할 때. 브랜치 기능이 강점 (DB를 git처럼 복제)',
        note: '$19~/월',
      },
      {
        name: 'PlanetScale',
        url: 'https://planetscale.com',
        what: 'MySQL. 서비스를 멈추지 않고 스키마를 바꾸는 기능이 강점',
        note: '$39~/월',
      },
      {
        name: 'Firebase Blaze',
        url: 'https://firebase.google.com/pricing',
        what: '종량제. 쓴 만큼만 냅니다. 트래픽이 들쭉날쭉할 때',
        note: '종량제',
      },
    ],
  },

  {
    id: 'reference',
    title: '레퍼런스 — 무드 잡을 때',
    blurb: '"어떤 느낌으로 만들지" 정할 때. AI에게 보여줄 예시를 여기서 고릅니다.',
    chapter: 'design',
    items: [
      {
        name: 'SiteInspire',
        url: 'https://www.siteinspire.com',
        what: '웹 디자인 큐레이션',
      },
      {
        name: 'Minimal Gallery',
        url: 'https://minimal.gallery',
        what: '미니멀 사이트 모음',
        note: '이 사이트의 무드도 여기서 골랐습니다',
        pick: true,
      },
      { name: 'Godly', url: 'https://godly.website', what: '고퀄 웹사이트 큐레이션' },
      { name: 'Land-book', url: 'https://land-book.com', what: '실제 웹 스크린샷 아카이브' },
      { name: 'Refero', url: 'https://refero.design', what: 'UI 패턴별 실사례 검색' },
      { name: 'Awwwards', url: 'https://www.awwwards.com', what: '인터랙션 강한 사이트' },
      { name: 'Lapa Ninja', url: 'https://www.lapa.ninja', what: '랜딩페이지 모음' },
    ],
  },

  {
    id: 'color',
    title: '색 조합',
    blurb: '색을 세 개만 고르면 됩니다. 많을수록 어려워집니다.',
    chapter: 'design',
    items: [
      {
        name: 'Coolors',
        url: 'https://coolors.co/palettes/trending',
        what: '팔레트는 여기서 고르세요. 스페이스바로 계속 새 조합을 뽑고, 마음에 드는 색은 잠가두고 나머지만 다시 뽑을 수 있습니다',
        pick: true,
      },
      {
        name: 'HTML Color Codes',
        url: 'https://htmlcolorcodes.com',
        what: '색 하나의 코드값이 필요할 때. 색 이름·HEX·RGB를 서로 바꿔주고, 밝기 단계도 보여줍니다',
      },
      {
        name: 'Happy Hues',
        url: 'https://www.happyhues.co',
        what: '팔레트를 실제 화면에 적용한 예시와 함께 보여줍니다. "이 색을 어디에 쓰지?"가 막힐 때',
      },
      { name: 'Adobe Color', url: 'https://color.adobe.com', what: '컬러휠 기반 조합' },
      { name: 'Color Hunt', url: 'https://colorhunt.co', what: '큐레이션 팔레트' },
    ],
  },

  {
    id: 'font-pairing',
    title: '폰트 조합 찾기',
    chapter: 'design',
    items: [
      {
        name: 'Typewolf',
        url: 'https://www.typewolf.com',
        what: '실제 사이트가 쓴 폰트 조합을 분석해서 보여줍니다',
        pick: true,
      },
      { name: 'Fontpair', url: 'https://www.fontpair.co', what: '구글폰트 조합 추천' },
      { name: 'Fonts in Use', url: 'https://fontsinuse.com', what: '실사용 사례 아카이브' },
    ],
  },

  {
    id: 'font-ko',
    title: '무료 폰트 — 한글',
    blurb: '추천: 프리텐다드, 고운바탕, 마루부리, 온글잎 시리즈, 학교안심',
    chapter: 'design',
    items: [
      {
        name: '눈누',
        url: 'https://noonnu.cc',
        what: '상업용 무료 한글폰트 총집합. 여기부터 보면 됩니다',
        pick: true,
      },
      { name: '산돌구름', url: 'https://www.sandollcloud.com', what: '무료 폰트 섹션' },
      {
        name: '프리텐다드',
        url: 'https://github.com/orioncactus/pretendard',
        what: '범용 산세리프. 이 사이트 본문도 이걸 씁니다',
      },
    ],
  },

  {
    id: 'font-en',
    title: '무료 폰트 — 영문',
    blurb:
      'AI가 잘 안 고르는 것 추천: Instrument Serif, Fraunces, Newsreader, Bricolage Grotesque, Karla, Sora, Schibsted Grotesk',
    chapter: 'design',
    items: [
      { name: 'Google Fonts', url: 'https://fonts.google.com', what: '기본' },
      {
        name: 'Fontshare',
        url: 'https://www.fontshare.com',
        what: '유료급 무료 폰트 (Satoshi, Clash Display)',
        pick: true,
      },
      { name: 'Velvetyne', url: 'https://velvetyne.fr', what: '실험적 오픈소스' },
      { name: 'Collletttivo', url: 'https://www.collletttivo.it', what: '이탈리아 오픈소스' },
      { name: 'Uncut', url: 'https://uncut.wtf', what: '큐레이션된 무료 폰트' },
    ],
  },

  {
    id: 'icons',
    title: '아이콘',
    blurb: '피할 것: Lucide, Feather, Heroicons — AI가 기본으로 고르는 3대장이라 티가 납니다.',
    chapter: 'design',
    items: [
      {
        name: 'Phosphor',
        url: 'https://phosphoricons.com',
        what: '6가지 굵기. 흔치 않아서 티가 덜 납니다',
        note: 'MIT',
        pick: true,
      },
      { name: 'Iconoir', url: 'https://iconoir.com', what: '깔끔하고 통일감 있음', note: 'MIT' },
      { name: 'Remix Icon', url: 'https://remixicon.com', what: '2,800개', note: 'Apache 2.0' },
      { name: 'Tabler Icons', url: 'https://tabler.io/icons', what: '4,900개 선 아이콘', note: 'MIT' },
      {
        name: 'OpenMoji',
        url: 'https://openmoji.org',
        what: '오픈소스 이모지, 손그림톤',
        note: 'CC BY-SA',
      },
      {
        name: 'The Noun Project',
        url: 'https://thenounproject.com',
        what: '압도적 물량, 손그림 다수',
        note: '무료는 출처표기',
      },
      {
        name: 'Flaticon',
        url: 'https://www.flaticon.com',
        what: '3D·손그림 스타일',
        note: '무료는 출처표기',
      },
      {
        name: 'Line Awesome',
        url: 'https://icons8.com/line-awesome',
        what: '다양한 스타일',
        note: '무료는 링크백',
      },
    ],
  },

  {
    id: 'photo',
    title: '이미지·사진',
    blurb: '실사 이미지나 판화가 하나라도 들어가면 AI티가 확 줄어듭니다.',
    chapter: 'design',
    items: [
      {
        name: 'Unsplash',
        url: 'https://unsplash.com',
        what: '범용. 인기 순위 상위 사진은 너무 흔해서 피하는 게 좋습니다',
      },
      { name: 'Pexels', url: 'https://www.pexels.com', what: '범용' },
      {
        name: 'Rawpixel',
        url: 'https://www.rawpixel.com',
        what: '빈티지 퍼블릭 도메인. 식물도감·우키요에 같은 게 있습니다',
        pick: true,
      },
      { name: 'Artvee', url: 'https://artvee.com', what: '명화·고서 삽화' },
      {
        name: 'Public Domain Review',
        url: 'https://publicdomainreview.org',
        what: '아카이브 이미지',
      },
      {
        name: 'Old Book Illustrations',
        url: 'https://www.oldbookillustrations.com',
        what: '19세기 판화',
      },
      {
        name: 'Smithsonian Open Access',
        url: 'https://www.si.edu/openaccess',
        what: '박물관 소장품',
      },
    ],
  },

  {
    id: 'illustration',
    title: '일러스트·3D',
    chapter: 'design',
    items: [
      { name: 'Blush', url: 'https://blush.design', what: '조합형 일러스트' },
      { name: 'Open Doodles', url: 'https://www.opendoodles.com', what: '손그림 인체' },
      { name: 'Shapefest', url: 'https://www.shapefest.com', what: '3D 오브젝트 무료' },
      { name: 'unDraw', url: 'https://undraw.co', what: '컬러 커스텀 가능' },
      { name: 'Unblast', url: 'https://unblast.com', what: '목업·텍스처·에셋' },
    ],
  },

  {
    id: 'texture',
    title: '텍스처·패턴',
    chapter: 'design',
    items: [
      {
        name: 'Transparent Textures',
        url: 'https://www.transparenttextures.com',
        what: 'CSS 배경 패턴',
      },
      { name: 'Lost and Taken', url: 'https://lostandtaken.com', what: '종이·먼지 텍스처' },
      { name: 'Hero Patterns', url: 'https://heropatterns.com', what: 'SVG 패턴' },
    ],
  },

  {
    id: 'interaction',
    title: '인터랙션·코드',
    blurb: '움직임을 붙이고 싶을 때. 03 빌드 단계에서 씁니다.',
    chapter: 'build',
    items: [
      { name: 'CodePen Trending', url: 'https://codepen.io/trending', what: '인터랙션 실험' },
      {
        name: 'Rauno — Craft',
        url: 'https://rauno.me/craft',
        what: '마이크로 인터랙션 디테일',
        pick: true,
      },
      { name: 'Easings.net', url: 'https://easings.net', what: '이징 커브 참고' },
      { name: 'GSAP Docs', url: 'https://gsap.com/docs', what: '스크롤 애니메이션' },
      { name: 'Motion (Framer)', url: 'https://motion.dev', what: 'React 애니메이션' },
      {
        name: 'Layout Patterns',
        url: 'https://layout.bradwoods.io',
        what: 'CSS 레이아웃 레시피',
      },
    ],
  },

  {
    id: 'examples',
    title: '예시 사이트',
    blurb: '"이런 느낌으로"라고 AI에게 보여줄 때 좋습니다.',
    chapter: 'design',
    items: [
      { name: 'Brittany Chiang', url: 'https://brittanychiang.com', what: '개발자 포트폴리오 정석' },
      { name: 'Bruno Simon', url: 'https://bruno-simon.com', what: '3D 인터랙션 극단' },
      { name: 'Josh Comeau', url: 'https://www.joshwcomeau.com', what: '포트폴리오 + 블로그 결합' },
      {
        name: 'Maggie Appleton',
        url: 'https://maggieappleton.com',
        what: '일러스트 에세이. 인간미가 있습니다',
      },
      { name: 'Rauno', url: 'https://rauno.me', what: '인터랙션 디테일' },
      { name: 'Paco Coursey', url: 'https://paco.me', what: '미니멀 + 부드러운 전환' },
    ],
  },
]

/** 특정 챕터와 연결된 그룹들 — 챕터 화면 하단에 보여준다. */
export function resourcesForChapter(chapterId) {
  return resourceGroups.filter((g) => g.chapter === chapterId)
}

export const resourceCount = resourceGroups.reduce((n, g) => n + g.items.length, 0)
