import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useAiTask } from '../lib/ai'
import { useAllProgress, migrateLegacyProgress } from '../lib/progress'
import { useProjects } from '../lib/projects'
import AiPanel from '../components/AiPanel'
import LoginGate from '../components/LoginGate'

export default function Projects() {
  const { projects, activeId, create, remove, setActive, canWrite, loading } = useProjects()
  const { countFor } = useAllProgress()
  const navigate = useNavigate()

  const [idea, setIdea] = useState('')
  const kickoff = useAiTask('kickoff')

  // AI 호출은 버튼을 눌렀을 때만. useEffect 안에서 부르면 새로고침마다 돈이 나간다.
  function runKickoff() {
    if (idea.trim().length < 5) return
    kickoff.run(idea)
  }

  async function createFromPrd() {
    const prd = kickoff.result
    const project = await create({ name: prd.name, idea, oneLiner: prd.oneLiner, prd })
    if (!project) return
    migrateLegacyProgress(project.id)
    navigate(`/projects/${project.id}`)
  }

  async function createPlain() {
    if (!idea.trim()) return
    const project = await create({ name: idea.trim().slice(0, 40), idea })
    if (!project) return
    migrateLegacyProgress(project.id)
    navigate(`/projects/${project.id}`)
  }

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1>내 프로젝트</h1>
        <p className="lede">
          이 가이드는 읽는 게 아니라 <strong>만드는</strong> 게 목적입니다. 프로젝트를 하나
          만들면 8단계 진도가 그 프로젝트에 쌓입니다. 여러 개를 만들면 각각 따로 기록됩니다.
        </p>
      </header>

      {/* 로그인 안 했으면 만들기 대신 안내를 보여준다 */}
      {!canWrite ? (
        <LoginGate
          title="로그인하면 내 프로젝트를 만들 수 있습니다"
          reason="진도와 기획서가 계정에 저장돼서 다른 기기에서 열어도 그대로입니다. 챕터 본문과 프롬프트는 로그인 없이 계속 읽을 수 있습니다."
        />
      ) : (
      <>
      {/* ── 새 프로젝트 ────────────────────────────────────── */}
      <section className="new-project">
        <h2>새로 만들기</h2>
        <label className="field">
          <span>무엇을 만들고 싶나요? 한 줄이면 됩니다.</span>
          <textarea
            className="input"
            rows={3}
            placeholder="예) 동아리 회비를 누가 냈는지 총무가 한눈에 보는 웹"
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
          />
        </label>

        <AiPanel
          title="기획서 뽑기"
          hint="아이디어를 한 장짜리 기획서(PRD)로 바꿔줍니다. 첫 버전에서 뺄 기능까지 골라줍니다."
          actionLabel="AI로 기획서 뽑기"
          task={kickoff}
          onRun={runKickoff}
          disabled={idea.trim().length < 5}
          disabledReason="먼저 위에 아이디어를 적어주세요."
        >
          {(prd) => (
            <>
              <PrdView prd={prd} />
              <div className="row-actions">
                <button type="button" className="btn btn-primary" onClick={createFromPrd}>
                  이 기획서로 프로젝트 시작 →
                </button>
              </div>
            </>
          )}
        </AiPanel>

        <p className="ai-hint">
          AI 없이 그냥 시작해도 됩니다.{' '}
          <button type="button" className="linkish" onClick={createPlain} disabled={!idea.trim()}>
            아이디어만으로 만들기
          </button>
        </p>
      </section>

      {/* ── 목록 ───────────────────────────────────────────── */}
      <section>
        <h2>진행 중</h2>
        {loading ? (
          <p className="placeholder">불러오는 중…</p>
        ) : projects.length === 0 ? (
          <p className="placeholder">아직 프로젝트가 없습니다. 위에서 하나 만들어보세요.</p>
        ) : (
          <ul className="project-list">
            {projects.map((p) => {
              const done = countFor(p.id)
              const pct = Math.round((done / chapters.length) * 100)
              return (
                <li key={p.id} className={p.id === activeId ? 'project-row active' : 'project-row'}>
                  <Link to={`/projects/${p.id}`} className="project-main">
                    <span className="project-name">
                      {p.name}
                      {p.id === activeId && <span className="tag tag-done">진행 중</span>}
                    </span>
                    {p.oneLiner && <span className="chapter-summary">{p.oneLiner}</span>}
                    <span className="progress-bar">
                      <span className="progress-fill" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="meta">
                      {done} / {chapters.length} 단계 · {pct}%
                    </span>
                  </Link>
                  <span className="project-side">
                    {p.id !== activeId && (
                      <button type="button" className="btn btn-small" onClick={() => setActive(p.id)}>
                        이걸로 전환
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-small"
                      onClick={() => {
                        if (confirm(`"${p.name}" 프로젝트와 진도를 지웁니다. 되돌릴 수 없습니다.`)) {
                          remove(p.id)
                        }
                      }}
                    >
                      삭제
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* AI 사용량은 마이페이지로 옮겼다 — 계정 단위 기록이라 거기가 맞다 */}
      <p className="ai-hint">
        AI를 얼마나 썼는지는 <Link to="/me">마이페이지</Link>에서 봅니다.
      </p>
      </>
      )}
    </div>
  )
}

export function PrdView({ prd }) {
  if (!prd) return null
  return (
    <div className="prd">
      <h3>{prd.name}</h3>
      {prd.oneLiner && <p className="lede">{prd.oneLiner}</p>}
      {prd.users && (
        <p>
          <span className="prd-key">대상</span> {prd.users}
        </p>
      )}
      {prd.stack && (
        <p>
          <span className="prd-key">스택</span> {prd.stack}
        </p>
      )}

      {prd.mustHave?.length > 0 && (
        <>
          <h4>첫 버전에 넣을 것</h4>
          <ul className="prose-list">
            {prd.mustHave.map((f, i) => (
              <li key={i}>
                <strong>{f.title}</strong> — {f.why}
              </li>
            ))}
          </ul>
        </>
      )}

      {prd.notNow?.length > 0 && (
        <>
          <h4>지금은 빼는 것</h4>
          <ul className="prose-list muted">
            {prd.notNow.map((f, i) => (
              <li key={i}>
                <strong>{f.title}</strong> — {f.why}
              </li>
            ))}
          </ul>
        </>
      )}

      {prd.screens?.length > 0 && (
        <>
          <h4>화면</h4>
          <ul className="prose-list">
            {prd.screens.map((s, i) => (
              <li key={i}>
                <strong>{s.name}</strong> — {s.does}
              </li>
            ))}
          </ul>
        </>
      )}

      {prd.firstStep && <p className="notice">지금 할 일 — {prd.firstStep}</p>}
    </div>
  )
}
