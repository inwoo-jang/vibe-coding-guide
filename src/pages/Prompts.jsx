import { useMemo, useState } from 'react'
import { chapters } from '../data/chapters'
import PromptCard from '../components/PromptCard'

export default function Prompts() {
  const [q, setQ] = useState('')

  const all = useMemo(
    () => chapters.flatMap((c) => (c.prompts ?? []).map((p) => ({ ...p, stage: c.stage }))),
    [],
  )

  const filtered = all.filter((p) => {
    const hay = `${p.label} ${p.body} ${p.stage}`.toLowerCase()
    return hay.includes(q.trim().toLowerCase())
  })

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1>프롬프트 사전</h1>
        <p className="lede">
          각 챕터에 흩어져 있는 프롬프트를 한곳에 모았습니다. 그대로 복사해서 뒤에 내 상황을 붙여
          쓰세요.
        </p>
      </header>

      <input
        className="search"
        type="search"
        placeholder="검색 (예: 보안, 에러, PRD)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="placeholder">검색 결과가 없습니다.</p>
      ) : (
        filtered.map((p) => <PromptCard key={p.label} prompt={p} context={p.stage} />)
      )}
    </div>
  )
}
