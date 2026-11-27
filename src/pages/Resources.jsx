import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { resourceGroups, resourceTabs, refDims } from '../data/resources'
import { chapterById } from '../data/chapters'
import { inline } from '../components/inline'

// 참고 소스는 탭 세 개다.
//   레퍼런스   보고 따라 할 것. 그룹이 아니라 태그(용도·화면·부품·스타일·분류)로 걸러 본다
//   디자인 에셋 / 도구·서비스   가져다 쓰는 것. 지금처럼 분류별 목록
// 한 사이트가 여러 화면·여러 플랫폼을 다루므로, 레퍼런스는 폴더처럼 한 곳에 넣지 않고 태그를 여러 개 붙인다.

const EMPTY_SEL = () => ({
  group: new Set(),
  platform: new Set(),
  parts: new Set(),
  comp: new Set(),
  style: new Set(),
})

export default function Resources() {
  const location = useLocation()
  const [tab, setTab] = useState('refs')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(EMPTY_SEL)
  const query = q.trim().toLowerCase()

  // 챕터에서 /resources#그룹id 로 들어오면 그 그룹이 있는 탭을 열고, 레퍼런스면 분류 필터를 건다.
  useEffect(() => {
    const id = location.hash.slice(1)
    const g = resourceGroups.find((x) => x.id === id)
    if (!g) return
    setTab(g.tab)
    if (g.tab === 'refs') {
      const next = EMPTY_SEL()
      next.group.add(g.id)
      setSel(next)
      window.scrollTo(0, 0)
    } else {
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView())
    }
  }, [location.hash])

  const refGroups = resourceGroups.filter((g) => g.tab === 'refs')
  const refs = refGroups.flatMap((g) =>
    g.items.map((it) => ({ ...it, group: g.id, groupTitle: g.short ?? g.title })),
  )

  const counts = Object.fromEntries(
    resourceTabs.map((t) => [
      t.id,
      resourceGroups.filter((g) => g.tab === t.id).reduce((n, g) => n + g.items.length, 0),
    ]),
  )

  const toggle = (dim, v) =>
    setSel((prev) => {
      const next = { ...prev, [dim]: new Set(prev[dim]) }
      if (next[dim].has(v)) next[dim].delete(v)
      else next[dim].add(v)
      return next
    })

  const reset = () => {
    setSel(EMPTY_SEL())
    setQ('')
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>참고 소스</h1>
        <p className="lede">
          만들 화면을 찾을 때는 레퍼런스, 가져다 쓸 재료는 디자인 에셋, 계정을 만들거나 키를 받을 곳은
          도구·서비스에 있습니다.
        </p>

        <div className="res-tabs" role="tablist">
          {resourceTabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <small>{counts[t.id]}</small>
            </button>
          ))}
        </div>

        <input
          className="search"
          type="search"
          placeholder="이름이나 설명으로 검색 (예: 대시보드, 아이콘, 무료)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </header>

      {tab === 'refs' ? (
        <RefView refs={refs} refGroups={refGroups} sel={sel} toggle={toggle} reset={reset} query={query} />
      ) : (
        <ListView tab={tab} query={query} />
      )}
    </div>
  )
}

// ── 레퍼런스: 태그 필터 ────────────────────────────────────

function textOf(r) {
  return `${r.name} ${r.what} ${r.note ?? ''} ${r.kw ?? ''} ${r.groupTitle} ${(r.parts ?? []).join(' ')} ${(r.comp ?? []).join(' ')} ${(r.style ?? []).join(' ')}`.toLowerCase()
}

// except: 칩 숫자를 셀 때 자기 줄의 선택은 빼고 센다. 그래야 "이걸 누르면 몇 개가 되나"가 맞다.
function matches(r, sel, query, except) {
  if (query && !textOf(r).includes(query)) return false
  for (const dim of Object.keys(sel)) {
    if (dim === except || sel[dim].size === 0) continue
    if (dim === 'group') {
      if (!sel.group.has(r.group)) return false
      continue
    }
    const vals = r[dim] ?? []
    if (dim === 'style' && vals.length === 0) continue // 여러 스타일이 섞인 아카이브는 어느 스타일에도 보인다
    if (![...sel[dim]].some((v) => vals.includes(v))) return false
  }
  return true
}

function hasValue(r, dim, v) {
  if (dim === 'group') return r.group === v
  const vals = r[dim] ?? []
  return vals.includes(v) || (dim === 'style' && vals.length === 0)
}

function RefView({ refs, refGroups, sel, toggle, reset, query }) {
  const rows = [
    { dim: 'platform', label: '용도', values: refDims.platform.map((v) => [v, v]) },
    { dim: 'parts', label: '화면', values: refDims.parts.map((v) => [v, v]) },
    { dim: 'comp', label: '부품', values: refDims.comp.map((v) => [v, v]) },
    { dim: 'style', label: '스타일', values: refDims.style.map((v) => [v, v]) },
    { dim: 'group', label: '분류', values: refGroups.map((g) => [g.id, g.short ?? g.title]) },
  ]

  const list = refs
    .filter((r) => matches(r, sel, query))
    .sort((a, b) => (b.pick ? 1 : 0) - (a.pick ? 1 : 0))

  const picked = rows.flatMap((row) => row.values.filter(([v]) => sel[row.dim].has(v)).map(([, l]) => l))
  const groupBlurbs = refGroups.filter((g) => sel.group.has(g.id) && g.blurb)

  return (
    <section>
      <div className="res-filters">
        {rows.map((row) => (
          <div className="res-frow" key={row.dim}>
            <b>{row.label}</b>
            <div className="res-chips">
              {row.values.map(([v, label]) => {
                const n = refs.filter((r) => matches(r, sel, query, row.dim) && hasValue(r, row.dim, v)).length
                const on = sel[row.dim].has(v)
                return (
                  <button
                    key={v}
                    className="res-chip"
                    aria-pressed={on}
                    disabled={n === 0 && !on}
                    onClick={() => toggle(row.dim, v)}
                  >
                    {label}
                    <span>{n}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="res-bar">
        <span>
          <strong>{list.length}곳</strong> <span>{picked.length ? picked.join(' · ') : '전체 레퍼런스'}</span>
        </span>
        {(picked.length > 0 || query) && (
          <button className="res-reset" onClick={reset}>
            필터 지우기
          </button>
        )}
      </div>

      {groupBlurbs.map((g) => (
        <p className="res-blurb" key={g.id}>
          {inline(g.blurb)}
        </p>
      ))}

      {list.length === 0 ? (
        <p className="res-empty">조건에 맞는 레퍼런스가 없습니다. 필터를 하나 빼보세요.</p>
      ) : (
        <div className="ref-grid">
          {list.map((r) => (
            <article className="ref-card" key={`${r.group}-${r.url}`}>
              <div className="ref-top">
                <a href={r.url} target="_blank" rel="noreferrer noopener" className="ref-name">
                  {r.name}
                </a>
                {r.pick && <span className="tag tag-done">추천</span>}
                <span className="res-host">{hostOf(r.url)}</span>
                <span className="ref-kind">{r.groupTitle}</span>
              </div>
              <p className="ref-what">
                {inline(r.what)}
                {r.note && <span className="ref-note"> ({r.note})</span>}
              </p>
              {r.code && (
                <p className="ref-code">
                  코드{' '}
                  <a href={r.code} target="_blank" rel="noreferrer noopener">
                    {hostOf(r.code) === 'github.com' ? r.code.replace(/^https:\/\/github\.com\//, '') : hostOf(r.code)}
                  </a>
                  {r.license && <span className="ref-note"> · {r.license}</span>}
                </p>
              )}
              {r.kw && (
                <p className="ref-kw">
                  검색어 <code>{r.kw}</code>
                </p>
              )}
              <div className="ref-tags">
                <span>
                  <b>용도</b>
                  {(r.platform ?? []).join(', ')}
                </span>
                <span>
                  <b>화면</b>
                  {(r.parts ?? []).join(', ')}
                </span>
                {r.comp?.length > 0 && (
                  <span>
                    <b>부품</b>
                    {r.comp.join(', ')}
                  </span>
                )}
                <span>
                  <b>스타일</b>
                  {r.style?.length ? r.style.join(', ') : '여러 스타일'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

// ── 에셋·도구: 분류별 목록 ─────────────────────────────────

function ListView({ tab, query }) {
  const groups = resourceGroups
    .filter((g) => g.tab === tab)
    .map((g) => ({
      ...g,
      items: g.items.filter((it) =>
        `${it.name} ${it.what} ${it.note ?? ''} ${g.title}`.toLowerCase().includes(query),
      ),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <section>
      {!query && (
        <nav className="res-toc">
          {groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="stage-pill">
              {g.title}
              <span className="stage-num">{g.items.length}</span>
            </a>
          ))}
        </nav>
      )}

      {groups.length === 0 && <p className="res-empty">검색 결과가 없습니다.</p>}

      {groups.map((group) => {
        const chapter = group.chapter ? chapterById[group.chapter] : null
        return (
          <section key={group.id} id={group.id} className="res-group">
            <div className="res-head">
              <h2>{group.title}</h2>
              {chapter && (
                <Link to={`/learn/${chapter.id}`} className="res-chapter">
                  {chapter.stage} 챕터
                </Link>
              )}
            </div>
            {group.blurb && <p className="res-blurb">{inline(group.blurb)}</p>}

            <ul className="res-list">
              {group.items.map((it) => (
                <li key={it.url}>
                  <a href={it.url} target="_blank" rel="noreferrer noopener" className="res-item">
                    <span className="res-name">
                      {it.name}
                      {it.pick && <span className="tag tag-done">추천</span>}
                      {it.note && <span className="res-note">{it.note}</span>}
                    </span>
                    <span className="res-what">{inline(it.what)}</span>
                    <span className="res-host">{hostOf(it.url)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </section>
  )
}

// 주소창에 뜨는 도메인만 짧게. 어디로 가는 링크인지 눌러보기 전에 알 수 있게 한다.
function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
