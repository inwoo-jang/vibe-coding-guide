import { NavLink, Outlet, Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'
import { useProjects } from '../lib/projects'

const nav = [
  { to: '/learn', label: '학습' },
  { to: '/projects', label: '내 프로젝트' },
  { to: '/prompts', label: '프롬프트 사전' },
  { to: '/glossary', label: '용어 사전' },
]

export default function Layout() {
  const { active } = useProjects()
  const { doneCount, hasProject } = useProgress()
  const pct = Math.round((doneCount / chapters.length) * 100)

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
          {hasProject ? (
            <Link
              to={`/projects/${active.id}`}
              className="progress-chip"
              title={`${active.name} — ${doneCount}/${chapters.length} 완료`}
            >
              <span className="chip-name">{active.name}</span>
              {pct}%
            </Link>
          ) : (
            <Link to="/projects" className="btn btn-small">
              프로젝트 만들기
            </Link>
          )}
          {/* 로그인은 Supabase 붙일 때 실제 동작으로 교체 */}
          <Link to="/projects" className="btn btn-ghost">
            로그인
          </Link>
        </div>
      </header>

      <main className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <span>바이브코딩 가이드 — 초보를 위한 8단계</span>
        <Link to="/admin">관리자</Link>
      </footer>
    </div>
  )
}
