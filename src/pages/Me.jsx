import { Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'

export default function Me() {
  const { map, isDone, doneCount, reset } = useProgress()
  const pct = Math.round((doneCount / chapters.length) * 100)

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1>내 진도</h1>
        {/* 로그인 붙기 전까지는 이 브라우저에만 저장된다. */}
        <p className="notice">
          아직 로그인 기능이 없어서 진도는 <strong>이 브라우저에만</strong> 저장됩니다. 다른 기기에서
          열면 처음부터 보입니다.
        </p>
      </header>

      <div className="progress-bar" role="img" aria-label={`${pct}퍼센트 완료`}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="meta">
        {doneCount} / {chapters.length} 챕터 · {pct}%
      </p>

      <ul className="progress-list">
        {chapters.map((c) => (
          <li key={c.id} className={isDone(c.id) ? 'done' : ''}>
            <Link to={`/learn/${c.id}`}>
              <span className="check">{isDone(c.id) ? '✓' : '○'}</span>
              <span>{c.title}</span>
            </Link>
            {map[c.id]?.at && (
              <time dateTime={map[c.id].at}>
                {new Date(map[c.id].at).toLocaleDateString('ko-KR')}
              </time>
            )}
          </li>
        ))}
      </ul>

      <button type="button" className="btn btn-ghost" onClick={reset}>
        진도 초기화
      </button>
    </div>
  )
}
