import { chapters } from '../data/chapters'
import { useAllProgress } from '../lib/progress'
import { useProjects } from '../lib/projects'
import { useAiUsage } from '../lib/ai'

// 관리자 화면 골격.
// 지금은 이 브라우저의 프로젝트만 보여준다. Supabase를 붙이면
// profiles + projects + progress 를 조인해서 이 표를 채우면 된다.
// 접근 제어(is_admin)는 그때 함께 건다 — 지금은 라우트만 열려 있다.

export default function Admin() {
  const { projects, activeId } = useProjects()
  const { countFor, mapFor } = useAllProgress()
  const usage = useAiUsage()

  return (
    <div className="page">
      <header className="page-head">
        <h1>관리자</h1>
        <p className="notice">
          아직 인증이 없어 누구나 열 수 있습니다. Supabase 연결 시 관리자만 접근하도록 막아야
          합니다. 화면을 숨기는 것만으로는 부족하고 RLS 로도 막아야 합니다 —{' '}
          <strong>보안 챕터에서 가르치는 내용입니다.</strong>
        </p>
      </header>

      <section>
        <h2>프로젝트 진도</h2>
        {projects.length === 0 ? (
          <p className="placeholder">아직 만들어진 프로젝트가 없습니다.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>프로젝트</th>
                <th>완료 단계</th>
                <th>마지막 단계</th>
                <th>만든 날</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const map = mapFor(p.id)
                const last = chapters.filter((c) => map[c.id]?.done).at(-1)?.stage ?? '-'
                return (
                  <tr key={p.id}>
                    <td>
                      {p.name}
                      {p.id === activeId && <span className="tag tag-done">진행 중</span>}
                    </td>
                    <td>
                      {countFor(p.id)} / {chapters.length}
                    </td>
                    <td>{last}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString('ko-KR')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>AI 사용량</h2>
        <table className="table">
          <thead>
            <tr>
              <th>호출 횟수</th>
              <th>입력 토큰</th>
              <th>출력 토큰</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{usage.calls}</td>
              <td>{usage.in.toLocaleString()}</td>
              <td>{usage.out.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <p className="ai-hint">
          이 브라우저 기준입니다. 저장된 답을 재사용한 경우는 세지 않습니다 — 요금이 나가지 않기
          때문입니다.
        </p>
      </section>

      <section>
        <h2>챕터</h2>
        <table className="table">
          <thead>
            <tr>
              <th>순서</th>
              <th>제목</th>
              <th>소요</th>
              <th>본문</th>
              <th>프롬프트</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((c) => (
              <tr key={c.id}>
                <td>{String(c.order).padStart(2, '0')}</td>
                <td>{c.title}</td>
                <td>{c.minutes}분</td>
                <td>{c.sections.filter((s) => s.blocks?.length).length}절</td>
                <td>{c.prompts?.length ?? 0}개</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
