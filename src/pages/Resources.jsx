import { useState } from 'react'
import { Link } from 'react-router-dom'
import { resourceGroups, resourceCount } from '../data/resources'
import { chapterById } from '../data/chapters'
import { inline } from '../components/inline'

export default function Resources() {
  const [q, setQ] = useState('')
  const query = q.trim().toLowerCase()

  // 그룹 안의 항목만 걸러내고, 남은 게 있는 그룹만 보여준다.
  const groups = resourceGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((it) =>
        `${it.name} ${it.what} ${it.note ?? ''} ${g.title}`.toLowerCase().includes(query),
      ),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="page">
      <header className="page-head">
        <h1>참고 소스</h1>
        <p className="lede">
          기획할 때 쓰는 도구와, 만든 결과물이 <strong>AI가 찍어낸 것처럼 보이지 않게</strong> 해줄
          레퍼런스·에셋 모음입니다. 총 {resourceCount}개.
        </p>
      </header>

      <input
        className="search"
        type="search"
        placeholder="검색 (예: 폰트, 아이콘, 팔레트, 무료)"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* 목차 — 분류가 많아서 위에서 바로 뛸 수 있게 */}
      {!query && (
        <nav className="res-toc">
          {resourceGroups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="stage-pill">
              {g.title}
              <span className="stage-num">{g.items.length}</span>
            </a>
          ))}
        </nav>
      )}

      {groups.length === 0 && <p className="placeholder">검색 결과가 없습니다.</p>}

      {groups.map((group) => {
        const chapter = group.chapter ? chapterById[group.chapter] : null
        return (
          <section key={group.id} id={group.id} className="res-group">
            <div className="res-head">
              <h2>{group.title}</h2>
              {chapter && (
                <Link to={`/learn/${chapter.id}`} className="res-chapter">
                  {chapter.stage} 챕터 →
                </Link>
              )}
            </div>
            {group.blurb && <p className="res-blurb">{group.blurb}</p>}

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
    </div>
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
