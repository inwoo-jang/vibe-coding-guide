import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'

// 관리자 화면 골격.
// 지금은 "나 자신" 한 명만 보여준다. Supabase를 붙이면
// profiles + progress 테이블을 조인해서 이 표를 채우면 된다.
// 접근 제어(is_admin)는 그때 함께 건다 — 지금은 라우트만 열려 있다.

export default function Admin() {
  const { isDone, doneCount } = useProgress()

  const rows = [
    {
      email: '나 (로컬)',
      done: doneCount,
      lastChapter: chapters.filter((c) => isDone(c.id)).at(-1)?.stage ?? '-',
    },
  ]

  return (
    <div className="page">
      <header className="page-head">
        <h1>관리자</h1>
        <p className="notice">
          아직 인증이 없어 누구나 열 수 있습니다. Supabase 연결 시 관리자만 접근하도록 막아야 합니다.
        </p>
      </header>

      <section>
        <h2>사용자 진도</h2>
        <table className="table">
          <thead>
            <tr>
              <th>사용자</th>
              <th>완료 챕터</th>
              <th>마지막 단계</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.email}>
                <td>{r.email}</td>
                <td>
                  {r.done} / {chapters.length}
                </td>
                <td>{r.lastChapter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2>챕터</h2>
        <table className="table">
          <thead>
            <tr>
              <th>순서</th>
              <th>제목</th>
              <th>소요</th>
              <th>프롬프트</th>
            </tr>
          </thead>
          <tbody>
            {chapters.map((c) => (
              <tr key={c.id}>
                <td>{String(c.order).padStart(2, '0')}</td>
                <td>{c.title}</td>
                <td>{c.minutes}분</td>
                <td>{c.prompts?.length ?? 0}개</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
