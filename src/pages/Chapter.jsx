import { Link, useParams } from 'react-router-dom'
import { chapterById, neighbors } from '../data/chapters'
import { resourcesForChapter } from '../data/resources'
import { useProgress } from '../lib/progress'
import { useAiTask } from '../lib/ai'
import { projectContext, useProjects } from '../lib/projects'
import PromptCard from '../components/PromptCard'
import Prose from '../components/Prose'
import { inline } from '../components/inline'
import AiPanel from '../components/AiPanel'

export default function Chapter() {
  const { chapterId } = useParams()
  const chapter = chapterById[chapterId]
  const { isDone, setDone, hasProject, canWrite, authLoading } = useProgress()
  const { active } = useProjects()
  const review = useAiTask('review')

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

  // 버튼 클릭에만 연결한다. 챕터를 열기만 해도 호출되면 안 된다.
  function runReview() {
    if (!active) return
    review.run(
      `[지금 단계]\n${chapter.stage} — ${chapter.title}\n${chapter.summary}\n` +
        `다루는 내용: ${chapter.sections.map((s) => s.heading).join(', ')}\n\n` +
        `[내 프로젝트]\n${projectContext(active)}`,
    )
  }

  return (
    <article className="page page-narrow">
      <p className="eyebrow">
        <Link to="/learn">커리큘럼</Link> / {chapter.stage} · {chapter.minutes}분
        {active && <> · {active.name}</>}
      </p>
      <h1>{chapter.title}</h1>
      <p className="lede">{chapter.summary}</p>

      <section className="outline">
        <h2>이 챕터에서 다루는 것</h2>
        <ul>
          {chapter.sections.map((s) => (
            <li key={s.heading}>{s.heading}</li>
          ))}
        </ul>
      </section>

      <div className="chapter-body-text">
        {chapter.sections.map((section) => (
          <section key={section.heading} className="chapter-section">
            <h2>{section.heading}</h2>
            <Prose blocks={section.blocks} />
          </section>
        ))}
      </div>

      {chapter.prompts?.length > 0 && (
        <section className="prompts">
          <h2>이 단계에서 쓰는 프롬프트</h2>
          {chapter.prompts.map((p) => (
            <PromptCard key={p.label} prompt={p} />
          ))}
        </section>
      )}

      {/* 이 단계에서 쓸 만한 링크. 전체 목록은 /resources 에 있다 */}
      {resourcesForChapter(chapter.id).length > 0 && (
        <section className="prompts">
          <h2>이 단계에서 쓰는 도구·자료</h2>
          {resourcesForChapter(chapter.id).map((group) => (
            <div key={group.id} className="res-inline">
              <h3>{group.title}</h3>
              <ul className="res-inline-list">
                {group.items.slice(0, 4).map((it) => (
                  <li key={it.url}>
                    <a href={it.url} target="_blank" rel="noreferrer noopener">
                      {it.name}
                    </a>
                    <span className="chapter-summary">{inline(it.what)}</span>
                  </li>
                ))}
              </ul>
              {group.items.length > 4 && (
                <Link to={`/resources#${group.id}`} className="ai-hint">
                  {group.title} {group.items.length}개 전부 보기 →
                </Link>
              )}
            </div>
          ))}
        </section>
      )}

      <AiPanel
        title="이 단계, 제대로 한 게 맞나?"
        hint="내 프로젝트에 맞춰서 넘어가기 전 확인할 것들을 점검표로 만들어줍니다."
        actionLabel="점검표 만들기"
        task={review}
        onRun={runReview}
        disabled={!active || !canWrite || authLoading}
        disabledReason={
          !canWrite ? (
            <>
              AI 기능은 로그인한 사람만 쓸 수 있습니다 — 호출할 때마다 요금이 나가기 때문입니다.{' '}
              <Link to="/me">로그인하러 가기 →</Link>
            </>
          ) : (
            <>
              프로젝트를 만들면 이 기능을 쓸 수 있습니다.{' '}
              <Link to="/projects">프로젝트 만들기 →</Link>
            </>
          )
        }
      >
        {(r) => (
          <>
            <ul className="check-list">
              {r.checks?.map((c, i) => (
                <li key={i}>
                  <strong>{c.item}</strong>
                  <span className="chapter-summary">{c.how}</span>
                </li>
              ))}
            </ul>
            {r.nextHint && <p className="notice">{r.nextHint}</p>}
          </>
        )}
      </AiPanel>

      <div className="chapter-done">
        {authLoading ? (
          <p className="ai-hint">로그인 확인 중…</p>
        ) : !canWrite ? (
          <p className="ai-hint">
            진도를 기록하려면 로그인이 필요합니다.{' '}
            <Link to="/me">로그인하러 가기 →</Link>
          </p>
        ) : hasProject ? (
          <label>
            <input
              type="checkbox"
              checked={done}
              onChange={(e) => setDone(chapter.id, e.target.checked)}
            />
            {active ? `"${active.name}"에서 이 단계를 끝냈습니다` : '이 챕터를 완료했습니다'}
          </label>
        ) : (
          <p className="ai-hint">
            진도는 프로젝트마다 따로 기록됩니다.{' '}
            <Link to="/projects">먼저 프로젝트를 만드세요 →</Link>
          </p>
        )}
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
          <Link to="/projects" className="btn btn-primary">
            내 프로젝트 보기 →
          </Link>
        )}
      </nav>
    </article>
  )
}
