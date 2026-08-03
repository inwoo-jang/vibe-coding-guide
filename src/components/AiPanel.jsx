// AI 기능의 공통 껍데기.
//
// 모든 AI 호출이 이 컴포넌트를 거치게 해서 세 가지를 강제한다.
//
//  1. 반드시 버튼을 눌러야 실행된다. 화면이 뜰 때 자동으로 부르는 경로가 없다.
//     (자동 호출은 새로고침할 때마다 돈이 나가는 가장 흔한 실수다.)
//  2. 실행 중에는 버튼이 잠긴다. 연타로 여러 번 나가지 않는다.
//  3. 저장된 결과를 쓴 경우 "저장된 답"이라고 표시한다.
//     사용자가 무료로 재사용했다는 걸 알아야 다시 부르지 않는다.

export default function AiPanel({
  title,
  hint,
  actionLabel = 'AI에게 물어보기',
  task, // useAiTask(...) 의 반환값
  onRun, // () => void — 버튼을 눌렀을 때만 호출된다
  disabled,
  disabledReason,
  children, // 결과를 그리는 함수 또는 노드
}) {
  const { status, result, error, cached, loading } = task
  const blocked = disabled || loading

  return (
    <section className="ai-panel">
      <div className="ai-head">
        <span className="ai-label">
          {title}
          <span className="ai-badge">AI</span>
        </span>
        <button type="button" className="btn btn-small" onClick={onRun} disabled={blocked}>
          {loading ? '생각하는 중…' : status === 'done' ? '다시 물어보기' : actionLabel}
        </button>
      </div>

      {hint && status === 'idle' && <p className="ai-hint">{hint}</p>}

      {disabled && disabledReason && <p className="ai-hint">{disabledReason}</p>}

      {status === 'error' && (
        <p className="ai-error">
          {error?.message}
          {error?.hint && <span className="ai-hint"> {error.hint}</span>}
        </p>
      )}

      {status === 'done' && (
        <div className="ai-result">
          {cached && (
            <p className="ai-cached">
              저장된 답을 다시 보여줍니다 — 이번엔 요금이 나가지 않았습니다.
            </p>
          )}
          {typeof children === 'function' ? children(result) : children}
        </div>
      )}
    </section>
  )
}
