import { Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'
import { useProjects } from '../lib/projects'

export default function Learn() {
  const { isDone, doneCount, hasProject } = useProgress()
  const { active } = useProjects()
  const totalMinutes = chapters.reduce((sum, c) => sum + c.minutes, 0)

  return (
    <div className="page">
      <header className="page-head">
        <h1>커리큘럼</h1>
        <p className="lede">
          위에서부터 순서대로 따라가면 아이디어 하나가 인터넷에 올라간 웹사이트가 됩니다. 전체 약{' '}
          {Math.round(totalMinutes / 60)}시간.
        </p>
        {/* 어느 프로젝트의 진도인지 항상 밝힌다. 안 그러면 체크가 어디에 남는지 모른다. */}
        {hasProject ? (
          <p className="meta">
            <Link to={`/projects/${active.id}`}>{active.name}</Link> — {doneCount} /{' '}
            {chapters.length} 단계 완료
          </p>
        ) : (
          <p className="notice">
            진도는 <strong>프로젝트마다 따로</strong> 기록됩니다. 읽기만 하려면 그냥 보셔도 되지만,
            실제로 하나를 만들어보려면 <Link to="/projects">프로젝트를 먼저 만드세요</Link>.
          </p>
        )}
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
