// 빌드 전에 도는 안전장치.
//
// 이 사이트는 보안 챕터에서 "API 키를 코드에 넣지 마라"고 가르친다.
// 그러면 이 저장소가 먼저 지켜야 한다. 사람은 실수하니까 기계가 검사한다.
//
// 막는 것:
//   1. 비밀 키에 VITE_ 접두사를 붙이는 것 → 브라우저 번들에 그대로 박힌다
//   2. .env 파일을 커밋 목록에 올리는 것
//   3. 소스 코드에 진짜 키처럼 생긴 문자열을 하드코딩하는 것
//   4. .env.example 에 진짜 키를 적는 것  ← 실제로 당한 사고
//
// 4번을 왜 따로 막나:
//   .env.example 은 견본이라 **커밋된다**. .env.local 은 커밋되지 않는다.
//   이름이 비슷해서 진짜 값을 .env.example 에 적는 실수가 아주 쉽게 난다.
//   그러면 다음 커밋에 키가 그대로 딸려 올라간다.
//   처음엔 이 파일을 검사에서 빼뒀었는데(가짜 값이 있으니까), 바로 그 구멍으로 사고가 났다.
//   그래서 지금은 **견본 파일이야말로 제일 엄격하게** 본다.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const problems = []

// ── 1. VITE_ 가 붙으면 안 되는 이름들 ──────────────────────────
// VITE_ 로 시작하는 환경변수는 빌드 결과물에 평문으로 들어간다.
const SECRET_HINTS = ['OPENAI', 'ANTHROPIC', 'SERVICE_ROLE', 'SECRET', 'PRIVATE', 'PASSWORD']

for (const name of Object.keys(process.env)) {
  if (!name.startsWith('VITE_')) continue
  // anon key 는 공개되는 게 정상이라 예외.
  if (name === 'VITE_SUPABASE_ANON_KEY' || name === 'VITE_SUPABASE_URL') continue
  if (SECRET_HINTS.some((hint) => name.includes(hint))) {
    problems.push(
      `환경변수 ${name} 에 VITE_ 접두사가 붙어 있습니다.\n` +
        `  VITE_ 가 붙으면 이 값이 브라우저 번들에 그대로 들어가 전 세계에 공개됩니다.\n` +
        `  → ${name.replace(/^VITE_/, '')} 로 이름을 바꾸고, /api 안의 서버 코드에서만 쓰세요.`,
    )
  }
}

// ── 2. 소스에 하드코딩된 키 ────────────────────────────────────
// 실제 키 형태만 좁게 잡는다. 넓게 잡으면 오탐이 나서 아무도 안 고친다.
const KEY_SHAPES = [
  { re: /\bsk-[A-Za-z0-9_-]{20,}/, what: 'OpenAI API 키' },
  { re: /\bsk-ant-[A-Za-z0-9_-]{20,}/, what: 'Anthropic API 키' },
  { re: /\bghp_[A-Za-z0-9]{30,}/, what: 'GitHub 토큰' },
  // Supabase service_role JWT — anon 키와 달리 절대 나가면 안 된다.
  { re: /"role"\s*:\s*"service_role"/, what: 'Supabase service_role 키' },
  // 진짜 JWT (Supabase anon 키 등). anon 키 자체는 공개돼도 되지만,
  // 그게 견본 파일이나 소스에 있다는 건 .env.local 과 헷갈렸다는 뜻이다.
  // 그 옆에 비밀 키도 같이 적혀 있을 가능성이 높다.
  { re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}/, what: 'JWT 토큰' },
]

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.vercel', 'scratchpad'])
const SCAN_EXT = /\.(js|jsx|ts|tsx|html|json|md|sql)$/

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      walk(full)
      continue
    }
    if (!SCAN_EXT.test(entry) && entry !== '.env.example') continue
    // 이 파일 자신은 검사 패턴을 담고 있으므로 제외.
    if (entry === 'check-env.mjs') continue

    const text = readFileSync(full, 'utf8')
    for (const { re, what } of KEY_SHAPES) {
      if (re.test(text)) {
        problems.push(
          `${full.replace(root + '/', '')} 안에 ${what} 로 보이는 값이 있습니다.\n` +
            `  코드에서 지우고 .env.local 로 옮기세요. 이미 커밋했다면 그 키는 폐기하고 새로 발급받으세요.`,
        )
      }
    }
  }
}

walk(root)

// ── 결과 ──────────────────────────────────────────────────────
if (problems.length > 0) {
  console.error('\n🔒 빌드를 멈췄습니다. 키가 새어 나갈 수 있습니다.\n')
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`))
  console.error('  자세한 설명: docs/09-보안-키관리.md\n')
  process.exit(1)
}

console.log('🔒 키 점검 통과')
