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

  // Supabase 미설정 = 로컬 모드. 로그인 개념이 없으므로 아무것도 안 그린다.
  if (!isCloudMode) return null
  if (status === 'loading') return <p className="placeholder">확인 중…</p>

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
            onClick={() => signIn(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="ai-hint">
        비밀번호를 새로 만들지 않습니다. 이미 쓰던 계정으로 들어옵니다.
      </p>
    </section>
  )
}
