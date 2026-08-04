import { useEffect, useState } from 'react'
import { supabase, isCloudMode } from '../lib/supabase'

// 개발 중에만 뜨는 설정 점검 띠.
//
// ★ 왜 만들었나 ★
// Supabase 키는 넣었는데 테이블을 안 만들었거나 로그인 제공자를 안 켜면,
// 화면은 멀쩡히 뜨는데 로그인만 조용히 실패한다. 그러면 "코드가 미완성인가?"
// 하고 엉뚱한 곳을 찾게 된다. 실제로 그 일이 있었다.
//
// 그래서 **무엇이 빠졌는지 화면이 직접 말하게** 했다.
//
// 배포본에는 나오지 않는다 (import.meta.env.DEV). 사용자에게 보여줄 정보가 아니다.

const CACHE_KEY = 'vcg.setup.v1'

export default function SetupNotice() {
  const [missing, setMissing] = useState(null)

  useEffect(() => {
    // 개발 중 + Supabase 설정됨 일 때만 확인한다
    if (!import.meta.env.DEV || !isCloudMode) return

    // 화면을 옮길 때마다 다시 물어보지 않는다
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) {
      setMissing(JSON.parse(cached))
      return
    }

    let alive = true
    ;(async () => {
      const gaps = []

      // ① 테이블이 있나 — 하나만 찍어봐도 안다
      const { error } = await supabase.from('profiles').select('id').limit(1)
      // 42P01 = 그런 테이블 없음
      if (error && /does not exist|42P01/i.test(`${error.message} ${error.code}`)) {
        gaps.push({
          what: '테이블이 없습니다',
          how: 'supabase/schema.sql 을 SQL Editor 에 붙여넣고 Run (또는 npm run db:push)',
        })
      }

      // ② 로그인 제공자가 켜져 있나
      try {
        const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
        })
        const s = await r.json()
        const off = ['google', 'kakao'].filter((p) => !s.external?.[p])
        if (off.length === 2) {
          gaps.push({
            what: '로그인 제공자가 하나도 안 켜져 있습니다',
            how: 'Supabase → Authentication → Providers 에서 구글이나 카카오를 켜세요',
          })
        } else if (off.length === 1) {
          gaps.push({ what: `${off[0]} 로그인이 꺼져 있습니다`, how: '나머지 하나로는 로그인됩니다' })
        }
      } catch {
        /* 못 읽으면 조용히 넘어간다 */
      }

      if (!alive) return
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(gaps))
      setMissing(gaps)
    })()

    return () => {
      alive = false
    }
  }, [])

  if (!missing || missing.length === 0) return null

  return (
    <aside className="setup-notice">
      <strong>설정이 덜 끝났습니다</strong>
      <span className="setup-dev">개발 중에만 보입니다</span>
      <ul>
        {missing.map((m) => (
          <li key={m.what}>
            <b>{m.what}</b> — {m.how}
          </li>
        ))}
      </ul>
      <span className="ai-hint">
        터미널에서 <code className="inline-code">npm run check-supabase</code> 로도 확인할 수
        있습니다. 자세히는 docs/10-로그인-설정.md
      </span>
    </aside>
  )
}
