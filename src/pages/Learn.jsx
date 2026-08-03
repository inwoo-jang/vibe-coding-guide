import { Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'

export default function Learn() {
  const { isDone, doneCount } = useProgress()
  const totalMinutes = chapters.reduce((sum, c) => sum + c.minutes, 0)

  return (
    <div className="page">
      <header className="page-head">
        <h1>커리큘럼</h1>
        <p className="lede">
          위에서부터 순서대로 따라가면 아이디어 하나가 인터넷에 올라간 웹사이트가 됩니다. 전체 약{' '}
          {Math.round(totalMinutes / 60)}시간.
        </p>
        <p className="meta">
          {doneCount} / {chapters.length} 챕터 완료
        </p>
      </header>

      <ol className="chapter-list">
        {chapters.map((c) => (
          <li key={c.id} className={isDone(c.id) ? 'chapter-row done' : 'chapter-row'}>
            <Link to={`/learn/${c.id}`}>
              <span className="chapter-num">{String(c.order).padStart(2, '0')}</span>
              <span className="chapter-body">
                <span className="chapter-title">
                  {c.title}
                  {isDone(c.id) && <span className="tag tag-done">완료</span>}
                </span>
                <span className="chapter-summary">{c.summary}</span>
              </span>
              <span className="chapter-time">{c.minutes}분</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}
