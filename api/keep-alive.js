// Supabase 무료 플랜이 잠들지 않게 하루 한 번 깨우는 함수.
//
// ★ 왜 필요한가 ★
// Supabase 무료 플랜은 **7일간 아무 접속이 없으면 프로젝트를 일시정지**한다.
// 정지되면 로그인과 진도 저장이 안 되고, 대시보드에서 직접 Restore 를 눌러야 한다.
// 친구 몇 명에게 보내는 사이트라 일주일 방치는 실제로 자주 생긴다.
//
// 해결은 단순하다 — 하루에 한 번 DB에 아무 질문이나 던지면 "활동 중"으로 친다.
// Vercel 이 vercel.json 의 crons 설정을 보고 이 주소를 매일 한 번 호출한다.
//
// 이걸 안 쓰고 싶으면 vercel.json 의 crons 항목만 지우면 된다.

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

export default async function handler(req, res) {
  // Vercel 은 크론 호출에 CRON_SECRET 을 붙여준다 (설정해둔 경우).
  // 설정해뒀다면 그것만 통과시킨다 — 남이 이 주소를 계속 두드리는 걸 막는다.
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.statusCode = 401
    return res.end('unauthorized')
  }

  if (!SUPABASE_URL || !SUPABASE_ANON) {
    res.statusCode = 200
    return res.end('supabase 미설정 — 할 일 없음')
  }

  try {
    // 아무 표에나 가볍게 한 번 물어본다.
    // RLS 때문에 로그인 안 한 상태에서는 빈 배열이 오는데, 그래도 상관없다.
    // **DB가 한 번 깨어났다는 사실**이 중요한 것이지 결과가 필요한 게 아니다.
    const r = await fetch(`${SUPABASE_URL}/rest/v1/progress?select=chapter_id&limit=1`, {
      headers: { apikey: SUPABASE_ANON, authorization: `Bearer ${SUPABASE_ANON}` },
    })
    console.log(`[keep-alive] Supabase ${r.status}`)
    res.statusCode = 200
    res.end(`ok ${r.status}`)
  } catch (err) {
    // 실패해도 500 을 내지 않는다. 크론이 실패로 기록되면 알림만 시끄럽고
    // 다음 날 다시 시도하면 그만이다.
    console.error('[keep-alive]', err)
    res.statusCode = 200
    res.end('실패 — 내일 다시 시도합니다')
  }
}
