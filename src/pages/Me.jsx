import { Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useAuth } from '../lib/auth'
import { useAiUsage, useMyUsage } from '../lib/ai'
import { useProjects } from '../lib/projects'
import { useProgress } from '../lib/progress'
import LoginGate from '../components/LoginGate'

// AI 작업 이름을 사람 말로.
const TASK_LABEL = {
  kickoff: '기획서 뽑기',
  tailor: '프롬프트 맞추기',
  review: '단계 점검표',
  glossary: '용어 질문',
}

export default function Me() {
  const { status, name, user, profile, signOut, isCloudMode, isAdmin } = useAuth()
  const { projects } = useProjects()
  const { countFor } = useProgress()
  const signedIn = status === 'signed-in'

  const server = useMyUsage(signedIn)
  const local = useAiUsage()

  // 로그인했으면 서버 기록이 정답, 로컬 모드면 브라우저 카운터가 정답.
  const usage = signedIn ? server : local

  if (isCloudMode && status === 'signed-out') {
    return (
      <div className="page page-narrow">
        <header className="page-head">
          <h1>마이페이지</h1>
          <p className="lede">
            내 프로젝트와 AI 사용량을 봅니다. 기록은 계정에 저장돼서 다른 기기에서 열어도 그대로입니다.
          </p>
        </header>
        <LoginGate
          title="로그인하면 내 기록이 보입니다"
          reason="진도와 AI 사용량은 계정에 저장됩니다. 챕터 본문은 로그인 없이도 계속 읽을 수 있습니다."
        />
      </div>
    )
  }

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1>마이페이지</h1>
        {signedIn ? (
          <div className="me-id">
            {profile?.avatar_url && <img src={profile.avatar_url} alt="" className="me-avatar" />}
            <span>
              <strong>{name}</strong>
              {user?.email && <span className="meta"> {user.email}</span>}
              {isAdmin && <span className="tag tag-done">관리자</span>}
            </span>
            <button type="button" className="btn btn-small" onClick={signOut}>
              로그아웃
            </button>
          </div>
        ) : (
          <p className="notice">
            <strong>로컬 모드</strong>입니다. Supabase 가 설정되지 않아 기록이 이 브라우저에만
            저장됩니다. 기기를 바꾸면 초기화됩니다.
          </p>
        )}
      </header>

      {/* ── AI 사용량 ─────────────────────────────────────── */}
      <section>
        <h2>AI 사용량</h2>

        {usage.loading ? (
          <p className="placeholder">불러오는 중…</p>
        ) : usage.calls === 0 ? (
          <p className="placeholder">아직 AI 기능을 쓴 적이 없습니다.</p>
        ) : (
          <>
            <div className="usage-cards">
              <div className="usage-card">
                <span className="usage-num">{usage.calls.toLocaleString()}</span>
                <span className="usage-label">호출</span>
              </div>
              <div className="usage-card">
                <span className="usage-num">{usage.in.toLocaleString()}</span>
                <span className="usage-label">입력 토큰</span>
              </div>
              <div className="usage-card">
                <span className="usage-num">{usage.out.toLocaleString()}</span>
                <span className="usage-label">출력 토큰</span>
              </div>
            </div>

            {usage.byTask?.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>기능</th>
                    <th>호출</th>
                    <th>입력</th>
                    <th>출력</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.byTask.map((t) => (
                    <tr key={t.task}>
                      <td>{TASK_LABEL[t.task] ?? t.task}</td>
                      <td>{t.calls}</td>
                      <td>{t.in.toLocaleString()}</td>
                      <td>{t.out.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        <p className="ai-hint">
          {signedIn
            ? '실제로 OpenAI를 부른 호출만 세어집니다. 저장된 답을 다시 본 경우는 요금이 나가지 않아 기록에도 없습니다.'
            : '이 브라우저 기준입니다. 로그인하면 계정에 기록돼서 기기를 바꿔도 이어집니다.'}
        </p>
      </section>

      {/* ── 내 프로젝트 ───────────────────────────────────── */}
      <section>
        <h2>내 프로젝트</h2>
        {projects.length === 0 ? (
          <p className="placeholder">
            아직 프로젝트가 없습니다. <Link to="/projects">하나 만들어보세요 →</Link>
          </p>
        ) : (
          <ul className="progress-list">
            {projects.map((p) => {
              const done = countFor(p.id)
              return (
                <li key={p.id} className={done === chapters.length ? 'done' : ''}>
                  <Link to={`/projects/${p.id}`}>
                    <span className="check">{done === chapters.length ? '✓' : '○'}</span>
                    <span>{p.name}</span>
                  </Link>
                  <span className="meta">
                    {done} / {chapters.length}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {isAdmin && (
        <p className="ai-hint">
          <Link to="/admin">관리자 화면으로 →</Link>
        </p>
      )}
    </div>
  )
}
