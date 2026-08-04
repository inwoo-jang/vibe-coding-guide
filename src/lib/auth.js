// 로그인. 화면은 useAuth() 만 쓴다.
//
// 제공자: 구글, 카카오 (Supabase Auth 의 OAuth).
// 비밀번호는 만들지 않는다 — 초보 대상이라 분실 대응 비용이 더 크다.
//
// 로그인은 **쓰기와 AI 기능에만** 필요하다. 챕터 본문·프롬프트·용어는
// 로그인 없이 전부 읽힌다. 링크를 받자마자 로그인 벽이 뜨면 거기서 이탈한다.

import { useCallback, useSyncExternalStore } from 'react'
import { supabase, isCloudMode } from './supabase'

const PROVIDERS = {
  google: { id: 'google', label: '구글로 계속하기' },
  kakao: { id: 'kakao', label: '카카오로 계속하기' },
}

export const providerList = Object.values(PROVIDERS)

// ── 로그인 상태는 앱 전체에서 하나만 둔다 ──────────────────────
//
// 처음에는 useAuth() 안에서 useState + useEffect 로 각자 관리했다.
// 그런데 이 훅을 화면·레이아웃·projects·progress 등 여러 곳에서 부르다 보니
// **한 화면에서만 8~10개의 사본**이 생겼고, 각각이 세션 조회와 profiles 질의를
// 따로 날렸다. 그게 다 끝나야 "확인 중…" 이 사라져서 체감이 아주 느렸다.
//
// 그래서 모듈 수준에 하나만 두고 모두가 구독한다.
// 네트워크 호출은 앱 전체에서 한 번뿐이다.

// status: 'loading' | 'signed-in' | 'signed-out' | 'local'
//   local = Supabase 미설정. 로그인 개념 자체가 없는 모드
let state = isCloudMode
  ? { status: 'loading', user: null, profile: null }
  : { status: 'local', user: null, profile: null }

const listeners = new Set()

function setState(next) {
  state = { ...state, ...next }
  listeners.forEach((fn) => fn())
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

// profiles 행에서 is_admin 과 표시 이름을 읽어온다.
// 화면 가리기용이고, 진짜 차단은 DB 의 RLS 가 한다.
async function loadProfile(user) {
  const { data } = await supabase
    .from('profiles')
    .select('id, email, display_name, is_admin')
    .eq('id', user.id)
    .maybeSingle()
  return data ?? null
}

function sync(session) {
  const user = session?.user ?? null
  if (!user) {
    setState({ status: 'signed-out', user: null, profile: null })
    return
  }

  // ★ 프로필을 기다리지 않고 먼저 로그인 상태로 바꾼다 ★
  // 세션만 있으면 로그인은 이미 끝난 것이다. profiles 질의는 이름과
  // 관리자 여부를 채우는 부가 정보라, 이걸 기다리면 화면이 괜히 멈춰 보인다.
  setState({ status: 'signed-in', user })

  loadProfile(user)
    .then((profile) => {
      // 그 사이 로그아웃했으면 덮어쓰지 않는다
      if (state.user?.id === user.id) setState({ profile })
    })
    .catch(() => {
      /* 프로필을 못 읽어도 로그인 자체는 유효하다 */
    })
}

if (isCloudMode) {
  supabase.auth.getSession().then(({ data }) => sync(data.session))
  supabase.auth.onAuthStateChange((_event, session) => sync(session))
}

export function useAuth() {
  const snap = useSyncExternalStore(
    subscribe,
    () => state,
    () => state, // 서버 렌더링은 하지 않지만 형식을 맞춰둔다
  )

  const signIn = useCallback(async (provider) => {
    if (!isCloudMode) return { error: new Error('Supabase 가 설정되지 않았습니다.') }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // 로그인 후 돌아올 주소. 배포 주소가 자동으로 들어가므로
        // 로컬과 배포에서 각각 알아서 맞는 곳으로 돌아온다.
        redirectTo: `${window.location.origin}${window.location.pathname}`,
      },
    })
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    if (!isCloudMode) return
    await supabase.auth.signOut()
  }, [])

  return {
    ...snap,
    signIn,
    signOut,
    isCloudMode,
    /** 로그인이 필요한 동작을 할 수 있는 상태인가 */
    canWrite: snap.status === 'signed-in' || snap.status === 'local',
    /** 로그인 안내를 띄워야 하는 상태인가 */
    needsLogin: snap.status === 'signed-out',
    isAdmin: Boolean(snap.profile?.is_admin),
    /** 화면에 보여줄 이름 */
    name:
      snap.profile?.display_name ||
      snap.user?.user_metadata?.name ||
      snap.user?.email?.split('@')[0] ||
      '나',
  }
}

/**
 * 로그인하고 돌아왔을 때 주소에 붙어 오는 오류를 읽는다.
 *
 * 구글에서 돌아오는 길이 막히면 Supabase 가 주소에 ?error=... 를 붙여서 보낸다.
 * 이걸 안 읽으면 화면은 멀쩡한데 로그인만 안 된 것처럼 보인다.
 * (오류가 물음표 뒤에 올 때도 있고 # 뒤에 올 때도 있어서 둘 다 본다.)
 *
 * 한 번 읽고 나면 주소를 깨끗하게 지운다 — 새로고침할 때마다 다시 뜨면 곤란하다.
 */
export function readRedirectError() {
  if (typeof window === 'undefined') return null
  const q = new URLSearchParams(window.location.search)
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const code = q.get('error') ?? h.get('error')
  if (!code) return null

  const desc = q.get('error_description') ?? h.get('error_description') ?? ''

  // 주소에서 오류 흔적을 지운다 (뒤로가기 기록도 더럽히지 않게 replaceState)
  const clean = window.location.pathname
  window.history.replaceState({}, '', clean)

  // 자주 나오는 것들은 사람 말로 바꿔준다
  let hint = ''
  if (/exchange external code/i.test(desc)) {
    hint = 'Supabase 의 Client Secret 이 구글에 등록된 값과 다릅니다. 새로 발급받아 교체하세요.'
  } else if (/redirect/i.test(desc) || code === 'access_denied') {
    hint =
      'Supabase → Authentication → URL Configuration 의 Redirect URLs 에 이 주소를 추가하세요.'
  }

  return { code, description: desc.replace(/\+/g, ' '), hint }
}

/** 지금 로그인한 사용자의 액세스 토큰. /api/ai 호출에 붙인다. */
export async function getAccessToken() {
  if (!isCloudMode) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
