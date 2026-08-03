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
          AI에게 무엇을 어떻게
          <br />
          말해야 하는가
        </h1>
        <p className="lede">
          바이브코딩은 "AI에게 시키면 알아서 해준다"가 아닙니다. 무엇을 만들지 정하고, 잘게 쪼개서
          맡기고, 결과를 확인하는 일은 여전히 사람 몫입니다. 이 가이드는 그 순서를 기획부터 배포까지
          8단계로 따라갑니다.
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

      <section className="stage-strip">
        {chapters.map((c) => (
          <Link key={c.id} to={`/learn/${c.id}`} className="stage-pill">
            <span className="stage-num">{String(c.order).padStart(2, '0')}</span>
            {c.stage}
          </Link>
        ))}
      </section>

      <section className="cards">
        <article className="card">
          <h3>내 프로젝트로 한 사이클</h3>
          <p>
            챕터를 읽는 게 아니라 만들고 싶은 걸 하나 정해서 기획부터 배포까지 끝까지 갑니다. 진도는
            프로젝트마다 따로 쌓입니다.
          </p>
          <Link to="/projects">프로젝트 만들기 →</Link>
        </article>
        <article className="card">
          <h3>단계마다 쓸 프롬프트</h3>
          <p>
            기획할 때와 디버깅할 때 필요한 말은 완전히 다릅니다. 각 챕터에 그 단계에서 그대로 복사해
            쓸 프롬프트를 붙여뒀습니다.
          </p>
          <Link to="/prompts">프롬프트 사전 →</Link>
        </article>
        <article className="card">
          <h3>막혔을 때 빠져나오는 법</h3>
          <p>
            초보가 무너지는 곳은 기능이 어려워서가 아니라 되돌리는 법을 몰라서입니다. 빌드 챕터에서
            다룹니다.
          </p>
          <Link to="/learn/build">빌드 챕터 →</Link>
        </article>
        <article className="card">
          <h3>사고 나기 전에 보안</h3>
          <p>
            API 키를 코드에 넣는 것, 남의 데이터가 보이는 것. 실제로 자주 나는 사고 몇 가지와 최소한의
            방어를 다룹니다.
          </p>
          <Link to="/learn/security">보안 챕터 →</Link>
        </article>
      </section>
    </div>
  )
}
