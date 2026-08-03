// 문장 안의 **강조** 와 `코드` 를 화면 요소로 바꾼다.
//
// 초보용 글에서는 `⌘ + V` 나 `node -v` 처럼 "그대로 입력하는 것"을 본문 글자와
// 구별해주는 게 중요하다. 안 그러면 어디까지가 설명이고 어디부터가 명령인지 모른다.
// 마크다운 라이브러리를 통째로 넣을 만큼은 아니라서 이 둘만 지원한다.
//
// 컴포넌트가 아니라 함수라서 파일을 따로 뒀다.
// (컴포넌트 파일에서 함수를 export 하면 개발 중 자동 새로고침이 깨진다.)

export function inline(text) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={i} className="inline-code">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}
