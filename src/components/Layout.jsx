import { NavLink, Outlet, Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'
import { useProjects } from '../lib/projects'
import { useAuth } from '../lib/auth'

const nav = [
  { to: '/learn', label: '학습' },
  { to: '/projects', label: '내 프로젝트' },
  { to: '/prompts', label: '프롬프트 사전' },
  { to: '/resources', label: '참고 자료' },
  { to: '/glossary', label: '용어 사전' },
]

export default function Layout() {
  const { active } = useProjects()
  const { doneCount, hasProject } = useProgress()
  const { status, name, profile, isAdmin, isCloudMode } = useAuth()
  const pct = Math.round((doneCount / chapters.length) * 100)

  const signedIn = status === 'signed-in'
  const signedOut = isCloudMode && status === 'signed-out'

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          바이브코딩 가이드
        </Link>
        <nav className="nav">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-right">
          {/* 진도는 프로젝트별이라, 어느 프로젝트의 %인지 항상 같이 보여준다. */}
          {hasProject && (
            <Link
              to={`/projects/${active.id}`}
              className="progress-chip"
              title={`${active.name} — ${doneCount}/${chapters.length} 완료`}
            >
              <span className="chip-name">{active.name}</span>
              {pct}%
            </Link>
          )}

          {signedIn ? (
            <Link to="/me" className="me-chip" title={isAdmin ? '관리자' : '마이페이지'}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="me-avatar-sm" />
              ) : (
                <span className="me-avatar-sm me-avatar-fallback">{name.slice(0, 1)}</span>
              )}
              <span className="chip-name">{name}</span>
            </Link>
          ) : signedOut ? (
            <Link to="/me" className="btn btn-ghost">
              로그인
            </Link>
          ) : (
            // 로컬 모드 — 로그인 개념이 없다
            <Link to="/me" className="btn btn-ghost">
              마이페이지
            </Link>
          )}
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <span>바이브코딩 가이드 — 초보를 위한 8단계</span>
        <span className="footer-links">
          <Link to="/me">마이페이지</Link>
          {(isAdmin || !isCloudMode) && <Link to="/admin">관리자</Link>}
        </span>
      </footer>
    </div>
  )
}
