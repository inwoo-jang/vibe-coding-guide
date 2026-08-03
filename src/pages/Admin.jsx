import { Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useAuth } from '../lib/auth'
import { useAllUsage } from '../lib/ai'
import { useProjects } from '../lib/projects'
import { useProgress } from '../lib/progress'
import LoginGate from '../components/LoginGate'

const TASK_LABEL = {
  kickoff: '기획서 뽑기',
  tailor: '프롬프트 맞추기',
  review: '단계 점검표',
  glossary: '용어 질문',
}

export default function Admin() {
  const { status, isAdmin, isCloudMode } = useAuth()
  const { projects, activeId } = useProjects()
  const { countFor, mapFor } = useProgress()

  // ★ 가드는 두 겹이다 ★
  //  ① 화면 — 아래 조건문. 관리자가 아니면 아예 안 그린다
  //  ② DB   — RLS. 화면을 뚫고 직접 조회해도 남의 데이터는 안 나온다
  //
  //  ①만 있으면 F12 열고 몇 줄이면 뚫린다. 화면 가리기는 보안이 아니다.
  //  useAllUsage 에 isAdmin 을 넘기지만, 설령 true 로 조작해도
  //  RLS 가 빈 배열을 돌려준다. 그게 진짜 방어선이다.
  const usage = useAllUsage(isAdmin)

  if (isCloudMode && status === 'loading') {
    return (
      <div className="page page-narrow">
        <p className="placeholder">확인 중…</p>
      </div>
    )
  }

  if (isCloudMode && status === 'signed-out') {
    return (
      <div className="page page-narrow">
        <header className="page-head">
          <h1>관리자</h1>
        </header>
        <LoginGate title="관리자 로그인" reason="관리자 계정으로 로그인해야 볼 수 있습니다." />
      </div>
    )
  }

  if (isCloudMode && !isAdmin) {
    return (
      <div className="page page-narrow">
        <header className="page-head">
          <h1>접근 권한이 없습니다</h1>
          <p className="lede">
            이 화면은 관리자만 볼 수 있습니다. 화면을 가리는 것뿐 아니라 데이터베이스에서도
            막혀 있어서, 직접 조회해도 남의 기록은 나오지 않습니다.
          </p>
        </header>
        <Link to="/me" className="btn btn-primary">
          마이페이지로
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1>관리자</h1>
        {!isCloudMode && (
          <p className="notice">
            <strong>로컬 모드</strong>입니다. Supabase 를 붙이기 전이라 이 브라우저의 데이터만
            보입니다. 연결하면 전체 사용자가 보이고, 이 화면은 관리자만 열 수 있게 됩니다.
          </p>
        )}
      </header>

      {/* ── AI 사용량 (요금) ──────────────────────────────── */}
      <section>
        <h2>AI 사용량 — 전체</h2>
        {usage.loading ? (
          <p className="placeholder">불러오는 중…</p>
        ) : (
          <>
            <div className="usage-cards">
              <div className="usage-card">
                <span className="usage-num">{usage.calls.toLocaleString()}</span>
                <span className="usage-label">총 호출</span>
              </div>
              <div className="usage-card">
                <span className="usage-num">{usage.in.toLocaleString()}</span>
                <span className="usage-label">입력 토큰</span>
              </div>
              <div className="usage-card">
                <span className="usage-num">{usage.out.toLocaleString()}</span>
                <span className="usage-label">출력 토큰</span>
              </div>
              <div className="usage-card">
                <span className="usage-num">{usage.byUser?.length ?? 0}</span>
                <span className="usage-label">쓴 사람</span>
              </div>
            </div>

            {usage.byTask?.length > 0 && (
              <>
                <h3>기능별</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>기능</th>
                      <th>호출</th>
                      <th>입력 토큰</th>
                      <th>출력 토큰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.byTask.map((t) => (
                      <tr key={t.task}>
                        <td>{TASK_LABEL[t.task] ?? t.task}</td>
                        <td>{t.calls}</td>
                        <td>{t.in.toLocaleString()}</td>
                        <td>{t.out.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {usage.byUser?.length > 0 && (
              <>
                <h3>사용자별</h3>
                <table className="table">
                  <thead>
                    <tr>
                      <th>사용자</th>
                      <th>호출</th>
                      <th>입력 토큰</th>
                      <th>출력 토큰</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usage.byUser.map((u) => (
                      <tr key={u.user_id}>
                        {/* 이메일 대신 id 앞자리만 — 관리자 화면에도 필요 이상의 정보를 두지 않는다 */}
                        <td className="mono">{u.user_id.slice(0, 8)}…</td>
                        <td>{u.calls}</td>
                        <td>{u.in.toLocaleString()}</td>
                        <td>{u.out.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            {usage.calls === 0 && <p className="placeholder">아직 AI 호출 기록이 없습니다.</p>}
          </>
        )}
        <p className="ai-hint">
          캐시로 재사용한 호출은 세지 않습니다 — OpenAI 를 부르지 않아 요금이 나가지 않았기
          때문입니다. 그래서 이 합이 실제 청구액에 비례합니다.
        </p>
      </section>

      {/* ── 프로젝트 진도 ─────────────────────────────────── */}
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

      {/* ── 챕터 ─────────────────────────────────────────── */}
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
