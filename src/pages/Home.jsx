import { Link } from 'react-router-dom'
import { chapters } from '../data/chapters'
import { useProgress } from '../lib/progress'
import { useProjects } from '../lib/projects'

export default function Home() {
  const { doneCount, map, hasProject } = useProgress()
  const { active } = useProjects()
  const nextChapter = chapters.find((c) => !map[c.id]) ?? chapters[0]

  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">코딩을 처음 시작하는 사람을 위한</p>
        <h1>
          AI한테 뭘, 어떻게
          <br />
          시켜야 할까
        </h1>
        <p className="lede">
          무엇을 만들지 정하고, 작게 쪼개서 맡기고, 결과를 직접 확인하는 것. 바이브코딩에서 사람이
          하는 일은 이 세 가지입니다. 기획부터 배포까지 8단계를 따라가며 내 프로젝트를 하나 끝까지
          만들어 봅니다.
        </p>
        {/* 읽기만 하고 끝나지 않도록, 처음 온 사람은 프로젝트 만들기로 보낸다. */}
        <div className="hero-actions">
          {hasProject ? (
            <>
              <Link to={`/learn/${nextChapter.id}`} className="btn btn-primary">
                {doneCount > 0 ? `${active.name} 이어서 하기` : `${active.name} 시작하기`}
              </Link>
              <Link to="/projects" className="btn btn-ghost">
                내 프로젝트
              </Link>
            </>
          ) : (
            <>
              <Link to="/projects" className="btn btn-primary">
                내 프로젝트 만들고 시작하기
              </Link>
              <Link to="/learn" className="btn btn-ghost">
                먼저 커리큘럼만 보기
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="sec-title">
        <h2>8단계</h2>
        {hasProject && <small>{doneCount}단계 완료</small>}
      </div>
      <section className="steps">
        {chapters.map((c) => (
          <Link key={c.id} to={`/learn/${c.id}`} className={`step${map[c.id] ? ' done' : ''}`}>
            <span className="step-num">{String(c.order).padStart(2, '0')}</span>
            <span className="step-title">{c.stage}</span>
            <span className="step-summary">{c.summary}</span>
          </Link>
        ))}
      </section>

      <div className="sec-title">
        <h2>이 가이드에 있는 것</h2>
      </div>
      <section className="cards">
        <article className="card">
          <h3>내 프로젝트로 한 바퀴</h3>
          <p>
            만들고 싶은 걸 하나 정하고 기획부터 배포까지 끝까지 가봅니다. 진도는 프로젝트마다 따로
            남습니다.
          </p>
          <Link to="/projects">프로젝트 만들기</Link>
        </article>
        <article className="card">
          <h3>단계별 프롬프트</h3>
          <p>
            기획할 때 쓰는 말과 디버깅할 때 쓰는 말은 다릅니다. 챕터마다 그대로 복사해 쓸 프롬프트가
            있습니다.
          </p>
          <Link to="/prompts">프롬프트 사전</Link>
        </article>
        <article className="card">
          <h3>막혔을 때 되돌리기</h3>
          <p>초보가 제일 많이 포기하는 순간은 되돌리는 법을 모를 때입니다. 빌드 챕터에서 다룹니다.</p>
          <Link to="/learn/build">빌드 챕터</Link>
        </article>
        <article className="card">
          <h3>사고 나기 전에 보안</h3>
          <p>
            API 키를 코드에 넣거나 남의 데이터가 보이는 사고. 자주 나는 몇 가지와 최소한의 방어를
            다룹니다.
          </p>
          <Link to="/learn/security">보안 챕터</Link>
        </article>
      </section>
    </div>
  )
}
