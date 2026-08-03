// 서버리스 함수 — Vercel 이 이 파일 하나를 /api/ai 주소로 띄운다.
//
// ★ 이 파일이 존재하는 이유 ★
// OPENAI_API_KEY 는 브라우저에 나가면 안 된다. 나가는 순간 아무나 내 돈으로
// API를 쓸 수 있다. 그래서 키를 아는 코드는 여기(서버)에만 두고,
// 브라우저는 이 주소로 "무엇을 해달라"만 보낸다. 키는 브라우저를 거치지 않는다.
//
// 로컬에서도 그냥 `npm run dev` 로 동작한다 — vite.config.js 가 이 파일을
// 개발 서버에 물려준다. 배포하면 Vercel 이 같은 파일을 서버리스 함수로 띄운다.

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
const ENDPOINT = 'https://api.openai.com/v1/chat/completions'

// Supabase — 로그인 확인과 사용량 기록에 쓴다.
// VITE_ 붙은 이름도 받아준다. 서버 함수에서는 둘 다 읽히므로 중복 설정을 만들지 않는다.
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
const AUTH_ON = Boolean(SUPABASE_URL && SUPABASE_ANON)

// ── 요금을 지키는 규칙 ─────────────────────────────────────────
// 이 값들이 "요금 폭탄"을 막는 실제 장치다. 숫자를 올릴 때는 이유가 있어야 한다.
//
//  maxTokens   작업마다 필요한 만큼만. 넉넉하게 잡으면 그만큼 그대로 돈이다.
//  MAX_INPUT   길게 붙여넣어도 잘라서 보낸다. 입력도 과금 대상이다.
//  RATE_*      같은 사람이 짧은 시간에 반복 호출하는 걸 막는다.
//              (실수로 만든 반복문, 새로고침 연타, 버튼 연타)
const MAX_INPUT = 4000 // 글자
const RATE_MAX = 10 // 이 횟수를
const RATE_WINDOW_MS = 60_000 // 1분 안에 넘으면 거절

// 프롬프트를 서버에 두는 이유: 브라우저 번들에 안 들어가고, 사용자가 바꿀 수 없다.
// (바꿀 수 있으면 "이전 지시 무시하고 ~" 같은 걸로 조종당한다.)
const TASKS = {
  // 아이디어 한 줄 → 한 장짜리 PRD
  kickoff: {
    json: true,
    maxTokens: 900, // PRD 한 장. 이보다 길면 오히려 초보가 안 읽는다.
    system: `너는 코딩을 처음 하는 사람의 기획을 도와주는 사람이다.
사용자가 만들고 싶은 것을 한두 문장으로 말하면, 첫 버전 기획서를 만들어준다.

규칙:
- 한국어로 쓴다. 초보가 읽을 수 있는 쉬운 말을 쓴다.
- 기능은 첫 버전에 정말 필요한 것만 3~5개로 줄인다. 욕심내지 않는다.
- 뺀 기능도 왜 뺐는지 한 줄로 적는다. 이게 제일 중요한 부분이다.
- 화면은 5개를 넘기지 않는다.
- 사용자가 말한 것 이상으로 범위를 넓히지 않는다.

반드시 아래 JSON 형태로만 답한다:
{
  "name": "프로젝트 이름 (짧게)",
  "oneLiner": "한 문장 요약",
  "users": "누가 쓰나 (한 문장)",
  "mustHave": [{ "title": "기능 이름", "why": "왜 첫 버전에 필요한지 한 줄" }],
  "notNow": [{ "title": "기능 이름", "why": "왜 지금은 빼는지 한 줄" }],
  "screens": [{ "name": "화면 이름", "does": "이 화면이 하는 일 한 줄" }],
  "stack": "추천 스택 한 줄과 그 이유",
  "firstStep": "지금 당장 할 첫 번째 행동 한 문장"
}`,
  },

  // 챕터의 기본 프롬프트 + 내 프로젝트 → 그대로 복사해 쓸 프롬프트
  tailor: {
    json: false,
    maxTokens: 500, // 프롬프트 한 덩어리
    system: `너는 사용자가 AI 코딩 도구에게 붙여넣을 프롬프트를 다듬어주는 사람이다.

아래에 (1) 지금 단계의 기본 프롬프트와 (2) 사용자의 프로젝트 정보가 주어진다.
기본 프롬프트에 프로젝트 정보를 녹여서, 그대로 복사해 쓸 수 있는 완성된 프롬프트로 만든다.

규칙:
- 결과는 프롬프트 본문만 출력한다. 설명, 인사, 따옴표, 코드블록 표시를 붙이지 않는다.
- 기본 프롬프트의 의도와 구조를 유지한다. 새로운 요구사항을 지어내지 않는다.
- 프로젝트 정보에 없는 내용은 추측해서 채우지 않는다.
- 한국어로 쓴다.`,
  },

  // 이 챕터 제대로 한 게 맞나?
  review: {
    json: true,
    maxTokens: 600, // 점검표 4~6줄
    system: `너는 초보 개발자가 한 단계를 마쳤는지 점검해주는 사람이다.
지금 단계와 사용자의 프로젝트 정보를 보고, 넘어가기 전에 확인할 것을 점검표로 만든다.

규칙:
- 항목은 4~6개. 이 프로젝트에 실제로 해당하는 것만 쓴다. 일반론을 늘어놓지 않는다.
- 각 항목은 사용자가 직접 눈으로 확인할 수 있는 행동이어야 한다.
  ("코드 구조가 좋다" ✗ / "브라우저를 새로고침해도 데이터가 남아 있다" ✓)
- 겁주지 않는다. 못 한 게 있어도 다음에 하면 된다고 말한다.
- 한국어로 쓴다.

반드시 아래 JSON 형태로만 답한다:
{
  "checks": [{ "item": "확인할 것", "how": "어떻게 확인하는지 한 줄" }],
  "nextHint": "다음 단계로 넘어가기 전 한마디"
}`,
  },

  // 모르는 단어 물어보기
  glossary: {
    json: false,
    maxTokens: 300, // 3~5문장이면 충분하다
    system: `너는 코딩 용어를 초보에게 설명해주는 사람이다.

규칙:
- 3~5문장으로 짧게. 길게 쓰지 않는다.
- 비유를 하나 쓴다.
- 사용자의 프로젝트 정보가 주어졌다면, 그 프로젝트에서 이게 어디에 해당하는지 한 문장 덧붙인다.
- 모르면 모른다고 한다. 지어내지 않는다.
- 한국어로 쓴다. 마크다운 제목이나 목록을 쓰지 않고 문단으로 쓴다.`,
  },
}

// 아주 단순한 호출 빈도 제한.
// 서버리스 함수는 잠깐 살았다 죽으므로 이 기억은 완벽하지 않다. 그래도
// "반복문에 넣어놓고 자리 비운" 같은 최악의 경우를 실제로 막아준다.
const hits = new Map()

function tooManyRequests(who) {
  const now = Date.now()
  const recent = (hits.get(who) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) return true
  recent.push(now)
  hits.set(who, recent)
  if (hits.size > 500) hits.clear() // 메모리가 무한히 늘지 않게
  return false
}

/**
 * 토큰이 진짜인지 Supabase 에게 물어본다.
 *
 * 브라우저가 보낸 user_id 를 그냥 믿으면 안 된다 — 아무 값이나 적어 보낼 수 있다.
 * 토큰을 Supabase 에 넘겨서 "이거 누구 거냐"고 확인받아야 한다.
 * 이게 인증(authentication)이고, 보안 챕터에서 인가와 구별해 가르치는 그것이다.
 */
async function verifyUser(token) {
  if (!token) return null
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { authorization: `Bearer ${token}`, apikey: SUPABASE_ANON },
    })
    if (!res.ok) return null
    const user = await res.json()
    return user?.id ? user : null
  } catch {
    return null
  }
}

/**
 * 사용량 한 줄 기록. 사용자 본인의 토큰으로 넣으므로 RLS 가 그대로 적용된다.
 * (service_role 키는 쓰지 않는다 — 그건 RLS 를 통째로 무시한다.)
 *
 * 실패해도 조용히 넘어간다. 기록 실패 때문에 사용자가 받을 답이 사라지면 안 된다.
 */
async function recordUsage(token, userId, task, usage) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/ai_usage`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        apikey: SUPABASE_ANON,
        authorization: `Bearer ${token}`,
        prefer: 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        task,
        model: MODEL,
        input_tokens: usage.in,
        output_tokens: usage.out,
      }),
    })
  } catch (err) {
    console.error('[api/ai] 사용량 기록 실패 (요청 자체는 성공)', err)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'POST 로만 호출하세요.' })
  }

  // ── 로그인 확인 ──────────────────────────────────────────────
  // AI 기능은 호출할 때마다 돈이 나간다. 로그인한 사람만 쓸 수 있어야
  // 누가 얼마나 썼는지 알 수 있고, 문제가 생겼을 때 막을 수 있다.
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  let user = null
  if (AUTH_ON) {
    user = await verifyUser(token)
    if (!user) {
      return json(res, 401, {
        error: '로그인이 필요합니다.',
        hint: 'AI 기능은 로그인한 사람만 쓸 수 있습니다. 요금이 나가는 기능이라 그렇습니다.',
      })
    }
  }
  // AUTH_ON 이 false = Supabase 미설정 = 로컬 개발 모드.
  // 이때는 로그인 없이 통과시킨다. 안 그러면 키만 넣고는 테스트를 못 한다.

  const who = AUTH_ON
    ? user.id // 로그인 상태에서는 사람 단위로 센다 (IP 를 공유해도 정확)
    : req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  if (tooManyRequests(String(who))) {
    return json(res, 429, {
      error: '너무 자주 요청했습니다. 잠시 후 다시 시도해 주세요.',
      hint: 'AI 호출은 1분에 10번까지만 됩니다. 요금이 나가는 기능이라 일부러 막아뒀습니다.',
    })
  }

  const key = process.env.OPENAI_API_KEY
  if (!key) {
    // 키가 없으면 조용히 실패하는 게 아니라, 무엇을 해야 하는지 알려준다.
    return json(res, 503, {
      error: 'AI 기능이 꺼져 있습니다.',
      hint: '.env.local 에 OPENAI_API_KEY 를 넣으면 켜집니다. (.env.example 참고)',
    })
  }

  let body = req.body
  if (typeof body === 'string') body = safeParse(body)
  if (!body) body = safeParse(await readBody(req))
  if (!body) return json(res, 400, { error: '요청 형식이 잘못되었습니다.' })

  const task = TASKS[body.task]
  if (!task) {
    return json(res, 400, {
      error: `모르는 작업입니다: ${body.task}`,
      hint: `가능한 값: ${Object.keys(TASKS).join(', ')}`,
    })
  }

  const input = String(body.input ?? '').slice(0, MAX_INPUT)
  if (!input.trim()) return json(res, 400, { error: '내용이 비어 있습니다.' })

  try {
    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        // 키는 여기서만 쓰인다. 이 줄은 서버에서만 실행된다.
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        // 작업마다 정해둔 만큼만. 출력 토큰이 제일 비싸다.
        max_tokens: task.maxTokens,
        messages: [
          { role: 'system', content: task.system },
          { role: 'user', content: input },
        ],
        ...(task.json ? { response_format: { type: 'json_object' } } : {}),
      }),
    })

    if (!upstream.ok) {
      const detail = await upstream.text()
      // 에러 본문에 키가 섞여 나가지 않도록 상태만 전달한다.
      console.error('[api/ai] OpenAI 응답 실패', upstream.status, detail.slice(0, 500))
      return json(res, 502, {
        error: 'AI 서버가 응답하지 않았습니다.',
        hint: upstream.status === 401 ? 'OPENAI_API_KEY 가 올바른지 확인하세요.' : undefined,
      })
    }

    const data = await upstream.json()
    const text = data.choices?.[0]?.message?.content ?? ''

    // 얼마나 썼는지 눈에 보이게 한다. 안 보이면 관리도 안 된다.
    const usage = {
      in: data.usage?.prompt_tokens ?? 0,
      out: data.usage?.completion_tokens ?? 0,
    }
    console.log(`[api/ai] ${body.task} 입력 ${usage.in} / 출력 ${usage.out} 토큰`)

    // 로그인 상태면 DB 에 남긴다. 마이페이지와 관리자 화면이 이걸 읽는다.
    if (AUTH_ON && user) await recordUsage(token, user.id, body.task, usage)

    if (task.json) {
      const parsed = safeParse(text)
      if (!parsed) return json(res, 502, { error: 'AI 응답을 이해하지 못했습니다. 다시 시도해 주세요.' })
      return json(res, 200, { result: parsed, usage })
    }
    return json(res, 200, { result: text.trim(), usage })
  } catch (err) {
    console.error('[api/ai]', err)
    return json(res, 500, { error: '요청을 처리하지 못했습니다.' })
  }
}

function json(res, status, payload) {
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(payload))
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// Vercel 은 req.body 를 채워주지만, 로컬 Vite 개발 서버는 안 채워준다.
// 두 환경에서 같은 파일이 돌아야 하므로 직접 읽는 경로도 둔다.
function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 100_000) req.destroy() // 무한히 받지 않는다
    })
    req.on('end', () => resolve(raw))
    req.on('error', () => resolve(''))
  })
}
