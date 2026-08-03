import { useState } from 'react'
import { glossary } from '../data/glossary'
import { useAiTask } from '../lib/ai'
import { projectContext, useProjects } from '../lib/projects'
import AiPanel from '../components/AiPanel'
import { inline } from '../components/inline'

export default function Glossary() {
  const [q, setQ] = useState('')
  const { active } = useProjects()
  const ask = useAiTask('glossary')

  const query = q.trim()
  const filtered = glossary.filter((g) =>
    `${g.term} ${g.short}`.toLowerCase().includes(query.toLowerCase()),
  )

  // 검색창에 타이핑할 때마다 AI를 부르면 글자 하나마다 요금이 나간다.
  // 그래서 검색과 AI 질문을 분리했다 — AI는 버튼을 눌러야만 실행된다.
  function runAsk() {
    if (!query) return
    ask.run(active ? `용어: ${query}\n\n[내 프로젝트]\n${projectContext(active)}` : `용어: ${query}`)
  }

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1>용어 사전</h1>
        <p className="lede">AI가 말할 때 자주 튀어나오는데 아무도 설명해주지 않는 단어들.</p>
      </header>

      <input
        className="search"
        type="search"
        placeholder="용어 검색"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <dl className="glossary">
        {filtered.map((g) => (
          <div key={g.term} className="glossary-row">
            <dt>{g.term}</dt>
            <dd>{inline(g.short)}</dd>
          </div>
        ))}
      </dl>

      {filtered.length === 0 && query && (
        <p className="placeholder">사전에 없는 단어입니다. 아래에서 AI에게 물어볼 수 있습니다.</p>
      )}

      <AiPanel
        title={query ? `"${query}" 물어보기` : '사전에 없는 단어 물어보기'}
        hint={
          active
            ? `검색창에 단어를 적고 누르면, "${active.name}"에서 이게 뭘 뜻하는지까지 설명해줍니다.`
            : '검색창에 단어를 적고 버튼을 누르세요.'
        }
        actionLabel="AI에게 물어보기"
        task={ask}
        onRun={runAsk}
        disabled={!query}
        disabledReason="먼저 위 검색창에 궁금한 단어를 적어주세요."
      >
        {(text) => <p className="ai-answer">{text}</p>}
      </AiPanel>
    </div>
  )
}
