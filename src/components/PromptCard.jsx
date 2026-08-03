import { useState } from 'react'
import { useAiTask } from '../lib/ai'
import { projectContext, useProjects } from '../lib/projects'

export default function PromptCard({ prompt, context, allowTailor = true }) {
  const [copied, setCopied] = useState(false)
  const { active } = useProjects()
  const tailor = useAiTask('tailor')

  // 화면에 보이는 프롬프트. AI가 다듬은 게 있으면 그걸, 없으면 기본을 쓴다.
  const shown = tailor.result ?? prompt.body

  async function copy() {
    try {
      await navigator.clipboard.writeText(shown)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // 클립보드 권한이 없으면 조용히 넘어간다. 텍스트는 화면에 그대로 보인다.
    }
  }

  // 버튼을 눌렀을 때만 실행된다. 렌더링 중에는 절대 부르지 않는다 — 요금이 나간다.
  function runTailor() {
    if (!active) return
    tailor.run(
      `[지금 단계의 기본 프롬프트]\n${prompt.body}\n\n[내 프로젝트]\n${projectContext(active)}`,
    )
  }

  return (
    <div className="prompt-card">
      <div className="prompt-head">
        <span className="prompt-label">
          {prompt.label}
          {context && <span className="prompt-context">{context}</span>}
          {tailor.result && <span className="prompt-context">내 프로젝트 맞춤</span>}
        </span>
        <span className="prompt-actions">
          {allowTailor && active && (
            <button
              type="button"
              className="btn btn-small"
              onClick={tailor.result ? tailor.clear : runTailor}
              disabled={tailor.loading}
              title={`"${active.name}" 정보를 넣어 다듬습니다`}
            >
              {tailor.loading ? '…' : tailor.result ? '기본으로' : '내 프로젝트에 맞추기'}
            </button>
          )}
          <button type="button" className="btn btn-small" onClick={copy}>
            {copied ? '복사됨' : '복사'}
          </button>
        </span>
      </div>
      <pre className="prompt-body">{shown}</pre>
      {tailor.status === 'error' && <p className="ai-error">{tailor.error?.message}</p>}
    </div>
  )
}
