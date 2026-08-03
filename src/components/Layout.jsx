import { NavLink, Outlet, Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'

const nav = [
  { to: '/learn', label: '학습' },
  { to: '/prompts', label: '프롬프트 사전' },
  { to: '/glossary', label: '용어 사전' },
  { to: '/me', label: '내 진도' },
]

export default function Layout() {
  const { doneCount } = useProgress()
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
          <span className="progress-chip" title={`${doneCount}/${chapters.length} 완료`}>
            {pct}%
          </span>
          {/* 로그인은 Supabase 붙일 때 실제 동작으로 교체 */}
          <Link to="/me" className="btn btn-ghost">
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
