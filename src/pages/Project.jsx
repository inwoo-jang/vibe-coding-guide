import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'
import { useProjects } from '../lib/projects'
import { PrdView } from './Projects'

// 프로젝트 하나의 대시보드.
// "지금 뭘 해야 하나"에 한 줄로 답하는 게 이 화면의 유일한 일이다.
export default function Project() {
  const { projectId } = useParams()
  const { projects, activeId, setActive } = useProjects()
  const { map, isDone, doneCount, reset } = useProgress(projectId)

  const project = projects.find((p) => p.id === projectId)

  // 이 프로젝트 화면을 열면 진행 중인 프로젝트로 전환한다.
  // (열어놓고 챕터로 넘어갔을 때 다른 프로젝트에 체크되는 걸 막는다.)
  useEffect(() => {
    if (project && activeId !== project.id) setActive(project.id)
  }, [project, activeId, setActive])

  if (!project) {
    return (
      <div className="page page-narrow">
        <h1>없는 프로젝트입니다</h1>
        <p className="lede">지웠거나, 다른 브라우저에서 만든 프로젝트일 수 있습니다.</p>
        <Link to="/projects" className="btn btn-primary">
          내 프로젝트로
        </Link>
      </div>
    )
  }

  const pct = Math.round((doneCount / chapters.length) * 100)
  const next = chapters.find((c) => !isDone(c.id))

  return (
    <div className="page page-narrow">
      <p className="eyebrow">
        <Link to="/projects">내 프로젝트</Link> / 대시보드
      </p>
      <h1>{project.name}</h1>
      {project.oneLiner && <p className="lede">{project.oneLiner}</p>}

      <div className="progress-bar" role="img" aria-label={`${pct}퍼센트 완료`}>
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="meta">
        {doneCount} / {chapters.length} 단계 · {pct}%
      </p>

      {/* 이 화면의 핵심 — 다음에 뭘 할지 하나만 말한다 */}
      {next ? (
        <div className="next-step">
          <span className="eyebrow">다음 단계</span>
          <h2>{next.title}</h2>
          <p className="chapter-summary">{next.summary}</p>
          <Link to={`/learn/${next.id}`} className="btn btn-primary">
            {next.stage} 시작하기 →
          </Link>
        </div>
      ) : (
        <div className="next-step">
          <span className="eyebrow">완주</span>
          <h2>8단계를 모두 끝냈습니다</h2>
          <p className="chapter-summary">
            한 사이클을 돈 겁니다. 두 번째 프로젝트는 훨씬 빠릅니다.
          </p>
          <Link to="/projects" className="btn btn-primary">
            새 프로젝트 만들기 →
          </Link>
        </div>
      )}

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

      {project.prd ? (
        <section className="outline">
          <h2>이 프로젝트의 기획서</h2>
          <PrdView prd={project.prd} />
          <p className="ai-hint">
            AI가 뽑은 초안입니다. 실제로 만들다 보면 달라집니다 — 그게 정상입니다.
          </p>
        </section>
      ) : (
        project.idea && (
          <section className="outline">
            <h2>아이디어</h2>
            <p>{project.idea}</p>
            <p className="ai-hint">
              기획 단계에서 이걸 한 장짜리 기획서로 바꿉니다.{' '}
              <Link to="/learn/planning">기획 챕터로 →</Link>
            </p>
          </section>
        )
      )}

      <p className="ai-hint">
        <button
          type="button"
          className="linkish"
          onClick={() => {
            if (confirm(`"${project.name}"의 진도만 초기화합니다. 프로젝트는 남습니다.`)) reset()
          }}
        >
          이 프로젝트 진도 초기화
        </button>
      </p>
    </div>
  )
}
