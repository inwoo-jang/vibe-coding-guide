// Supabase 설정이 어디까지 됐는지 확인한다.
//
//   npm run check-supabase
//
// 대시보드에서 한 단계 할 때마다 다시 돌려보면 진행 상황이 보인다.
// 뭐가 안 되는지 화면만 보고는 알기 어려워서 만든 것이다.

import { readFileSync } from 'node:fs'

// .env.local 을 직접 읽는다 (Vite 없이 도는 스크립트라서)
function loadEnv() {
  const env = {}
  for (const file of ['.env.local', '.env']) {
    try {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
        if (m && env[m[1]] === undefined) env[m[1]] = m[2].trim()
      }
    } catch {
      /* 파일이 없으면 넘어간다 */
    }
  }
  return env
}

const env = loadEnv()
const URL_ = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_ANON_KEY

const ok = (s) => `  ✓ ${s}`
const no = (s) => `  ✗ ${s}`
const todo = []

console.log('\n── Supabase 설정 점검 ──────────────────────────\n')

if (!URL_ || !KEY || URL_.includes('여기에')) {
  console.log(no('.env.local 에 Supabase 값이 없습니다'))
  console.log('\n  할 일: cp .env.example .env.local 후 값을 채우세요.')
  console.log('  자세히: docs/10-로그인-설정.md\n')
  process.exit(1)
}
console.log(ok(`.env.local 설정됨 — ${URL_}`))

const headers = { apikey: KEY, authorization: `Bearer ${KEY}` }

// ① 살아있나
let alive = false
try {
  const r = await fetch(`${URL_}/auth/v1/health`, { headers })
  alive = r.ok
  console.log(alive ? ok('프로젝트 살아있음') : no(`프로젝트 응답 ${r.status}`))
  if (!alive) todo.push('Supabase 대시보드에서 프로젝트가 일시정지됐는지 확인하고 Restore')
} catch {
  console.log(no('프로젝트에 연결할 수 없음 (주소 확인)'))
  todo.push('VITE_SUPABASE_URL 이 맞는지 확인')
}

// ② 테이블
if (alive) {
  const tables = ['profiles', 'projects', 'progress', 'ai_usage']
  const missing = []
  for (const t of tables) {
    const r = await fetch(`${URL_}/rest/v1/${t}?select=*&limit=1`, { headers })
    if (r.ok) console.log(ok(`테이블 ${t}`))
    else {
      console.log(no(`테이블 ${t} — 없음`))
      missing.push(t)
    }
  }
  if (missing.length) {
    todo.push('SQL Editor 에 supabase/schema.sql 전체를 붙여넣고 Run')
  }

  // ③ 로그인 제공자
  try {
    const r = await fetch(`${URL_}/auth/v1/settings`, { headers })
    const s = await r.json()
    const ext = s.external ?? {}
    for (const p of ['google', 'kakao']) {
      if (ext[p]) console.log(ok(`${p} 로그인 켜짐`))
      else {
        console.log(no(`${p} 로그인 꺼짐`))
        todo.push(`Authentication → Providers 에서 ${p} 켜고 키 입력`)
      }
    }
  } catch {
    console.log(no('로그인 설정을 읽지 못했습니다'))
  }
}

console.log('')
if (todo.length === 0) {
  console.log('🎉 설정 완료. npm run dev 로 로그인해보세요.\n')
} else {
  console.log('── 남은 일 ─────────────────────────────────────\n')
  todo.forEach((t, i) => console.log(`  ${i + 1}. ${t}`))
  console.log('\n  자세히: docs/10-로그인-설정.md\n')
}
