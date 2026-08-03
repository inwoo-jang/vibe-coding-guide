import { Link, useParams } from 'react-router-dom'
import { chapterById, neighbors } from '../data/chapters'
import { useProgress } from '../lib/progress'
import PromptCard from '../components/PromptCard'

export default function Chapter() {
  const { chapterId } = useParams()
  const chapter = chapterById[chapterId]
  const { isDone, setDone } = useProgress()

  if (!chapter) {
    return (
      <div className="page">
        <h1>없는 챕터입니다</h1>
        <Link to="/learn">커리큘럼으로 돌아가기</Link>
      </div>
    )
  }

  const { prev, next } = neighbors(chapter.id)
  const done = isDone(chapter.id)

  return (
    <article className="page page-narrow">
      <p className="eyebrow">
        <Link to="/learn">커리큘럼</Link> / {chapter.stage} · {chapter.minutes}분
      </p>
      <h1>{chapter.title}</h1>
      <p className="lede">{chapter.summary}</p>

      <section className="outline">
        <h2>이 챕터에서 다루는 것</h2>
        <ul>
          {chapter.sections.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {/* 본문은 다음 단계에서 채운다. */}
        <p className="placeholder">본문 준비 중</p>
      </section>

      {chapter.prompts?.length > 0 && (
        <section className="prompts">
          <h2>이 단계에서 쓰는 프롬프트</h2>
          {chapter.prompts.map((p) => (
            <PromptCard key={p.label} prompt={p} />
          ))}
        </section>
      )}

      <div className="chapter-done">
        <label>
          <input
            type="checkbox"
            checked={done}
            onChange={(e) => setDone(chapter.id, e.target.checked)}
          />
          이 챕터를 완료했습니다
        </label>
      </div>

      <nav className="chapter-nav">
        {prev ? (
          <Link to={`/learn/${prev.id}`} className="btn btn-ghost">
            ← {prev.stage}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/learn/${next.id}`} className="btn btn-primary">
            {next.stage} →
          </Link>
        ) : (
          <Link to="/me" className="btn btn-primary">
            내 진도 보기 →
          </Link>
        )}
      </nav>
    </article>
  )
}
