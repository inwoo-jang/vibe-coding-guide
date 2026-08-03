import { useState } from 'react'

export default function PromptCard({ prompt, context }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt.body)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 권한이 없으면 조용히 넘어간다. 텍스트는 화면에 그대로 보인다.
    }
  }

  return (
    <div className="prompt-card">
      <div className="prompt-head">
        <span className="prompt-label">
          {prompt.label}
          {context && <span className="prompt-context">{context}</span>}
        </span>
        <button type="button" className="btn btn-small" onClick={copy}>
          {copied ? '복사됨' : '복사'}
        </button>
      </div>
      <pre className="prompt-body">{prompt.body}</pre>
    </div>
  )
}
