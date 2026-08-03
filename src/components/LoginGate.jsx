import { useState } from 'react'
import { providerList, useAuth } from '../lib/auth'

/**
 * 로그인이 필요한 자리에 끼워 넣는 안내 + 버튼.
 *
 * 벽이 아니라 안내다. 챕터 본문·프롬프트·용어는 로그인 없이 다 읽히고,
 * **저장하거나 요금이 나가는 동작**에서만 이게 나타난다.
 * 링크를 받자마자 로그인 화면이 뜨면 거기서 이탈하기 때문이다.
 */
export default function LoginGate({ title = '로그인하면 이어서 할 수 있습니다', reason }) {
  const { signIn, status, isCloudMode } = useAuth()
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  // Supabase 미설정 = 로컬 모드. 로그인 개념이 없으므로 아무것도 안 그린다.
  if (!isCloudMode) return null
  if (status === 'loading') return <p className="placeholder">확인 중…</p>

  async function go(providerId) {
    setBusy(providerId)
    setError(null)
    const { error: err } = await signIn(providerId)
    if (err) {
      // ★ 이걸 안 보여주면 버튼을 눌러도 아무 일도 안 일어난 것처럼 보인다 ★
      // 제일 흔한 원인은 Supabase 대시보드에서 그 제공자를 안 켠 것이다.
      setError({ provider: providerId, message: err.message })
      setBusy(null)
      return
    }
    // 성공하면 브라우저가 구글/카카오로 이동한다. busy 를 풀 필요가 없다.
  }

  return (
    <section className="login-gate">
      <h3>{title}</h3>
      {reason && <p className="chapter-summary">{reason}</p>}

      <div className="login-buttons">
        {providerList.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`btn btn-provider btn-${p.id}`}
            onClick={() => go(p.id)}
            disabled={busy !== null}
          >
            {busy === p.id ? '이동 중…' : p.label}
          </button>
        ))}
      </div>

      {error ? (
        <p className="ai-error">
          로그인을 시작하지 못했습니다 — {error.message}
          <span className="ai-hint">
            {' '}
            대부분 Supabase 대시보드에서 <strong>{error.provider}</strong> 제공자를 아직 안 켠
            경우입니다. Authentication → Providers 에서 켜고 다시 시도하세요.
            (터미널에서 <code className="inline-code">npm run check-supabase</code> 로 확인할 수
            있습니다.)
          </span>
        </p>
      ) : (
        <p className="ai-hint">비밀번호를 새로 만들지 않습니다. 이미 쓰던 계정으로 들어옵니다.</p>
      )}
    </section>
  )
}
