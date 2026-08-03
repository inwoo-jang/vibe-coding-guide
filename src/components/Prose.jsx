// 챕터 본문을 그리는 컴포넌트.
// chapters.js 의 blocks 배열을 화면으로 바꾼다. 블록 종류를 늘리려면
// 여기에 case 하나와 index.css 에 스타일 하나를 추가하면 된다.

import { inline } from './inline'

export default function Prose({ blocks }) {
  if (!blocks?.length) return <p className="placeholder">본문 준비 중</p>

  return blocks.map((block, i) => {
    switch (block.t) {
      case 'p':
        return <p key={i}>{inline(block.text)}</p>
      case 'list':
        return (
          <ul key={i} className="prose-list">
            {block.items.map((item, j) => (
              <li key={j}>{inline(item)}</li>
            ))}
          </ul>
        )
      case 'note':
        return (
          <p key={i} className="notice">
            {inline(block.text)}
          </p>
        )
      case 'code':
        return (
          <pre key={i} className="code">
            <code>{block.text}</code>
          </pre>
        )
      default:
        return null
    }
  })
}
