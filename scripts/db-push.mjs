// supabase/schema.sql 을 DB에 직접 적용한다.
//
//   npm run db:push
//
// 대시보드 SQL Editor 에 붙여넣는 것과 똑같은 일을 터미널에서 한다.
// 스키마를 고칠 때마다 복사·붙여넣기를 반복하지 않으려고 만든 것이다.
//
// 필요한 것: .env.local 에 SUPABASE_DB_URL
//   Supabase → Project Settings → Database → Connection string → URI 를 복사하고
//   [YOUR-PASSWORD] 자리에 프로젝트 만들 때 정한 비밀번호를 넣으면 된다.
//
// ⚠️ 이 주소에는 DB 비밀번호가 들어 있다. .env.local 에만 두고 절대 커밋하지 않는다.
//    (VITE_ 를 붙이면 브라우저에 노출되므로 절대 붙이지 말 것. 서버에서도 안 쓴다 —
//     이 스크립트는 내 컴퓨터에서 수동으로 돌리는 용도다.)

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

function loadEnv() {
  const env = {}
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
        if (m && env[m[1]] === undefined) env[m[1]] = m[2].trim()
      }
    } catch {
      /* 없으면 넘어간다 */
    }
  }
  return env
}

const env = loadEnv()
const url = env.SUPABASE_DB_URL

if (!url || url.includes('YOUR-PASSWORD') || url.includes('여기에')) {
  console.error(`
  SUPABASE_DB_URL 이 필요합니다.

  1. Supabase → Project Settings → Database → Connection string → URI 복사
  2. [YOUR-PASSWORD] 를 프로젝트 만들 때 정한 비밀번호로 바꾸기
  3. .env.local 에 아래 한 줄 추가

     SUPABASE_DB_URL=postgresql://postgres.xxxx:비밀번호@...pooler.supabase.com:5432/postgres

  대시보드 SQL Editor 에 supabase/schema.sql 을 붙여넣어도 결과는 같습니다.
`)
  process.exit(1)
}

if (!existsSync('supabase/schema.sql')) {
  console.error('  supabase/schema.sql 을 찾을 수 없습니다.')
  process.exit(1)
}

console.log('\n  supabase/schema.sql 적용 중…\n')

try {
  // ON_ERROR_STOP=1 — 중간에 오류가 나면 멈춘다. 반쯤 적용된 상태가 제일 나쁘다.
  const out = execFileSync(
    'psql',
    ['-v', 'ON_ERROR_STOP=1', '-X', '-f', 'supabase/schema.sql', url],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  )
  // NOTICE 는 "없으면 넘어감"이라 정상이다. 조용히 지운다.
  const noisy = out
    .split('\n')
    .filter((l) => l.trim() && !/^(CREATE|ALTER|DROP|GRANT|NOTICE:)/.test(l.trim()))
  if (noisy.length) console.log(noisy.join('\n'))
  console.log('  ✓ 적용 완료. npm run check-supabase 로 확인하세요.\n')
} catch (err) {
  const msg = String(err.stderr || err.message)
  console.error('  ✗ 실패\n')
  console.error(
    msg
      .split('\n')
      .filter((l) => !/^NOTICE:/.test(l))
      .slice(0, 15)
      .join('\n'),
  )
  if (/psql.*ENOENT|command not found/.test(msg)) {
    console.error('\n  psql 이 없습니다. brew install postgresql 로 설치하거나,')
    console.error('  대시보드 SQL Editor 에 supabase/schema.sql 을 붙여넣으세요.')
  }
  console.error('')
  process.exit(1)
}
