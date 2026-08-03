import { useState } from 'react'
import { glossary } from '../data/glossary'

export default function Glossary() {
  const [q, setQ] = useState('')
  const filtered = glossary.filter((g) =>
    `${g.term} ${g.short}`.toLowerCase().includes(q.trim().toLowerCase()),
  )

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
            <dd>{g.short}</dd>
          </div>
        ))}
      </dl>
      {filtered.length === 0 && <p className="placeholder">검색 결과가 없습니다.</p>}
    </div>
  )
}
