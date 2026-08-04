// 로그인. 화면은 useAuth() 만 쓴다.
//
// 제공자: 구글, 카카오 (Supabase Auth 의 OAuth).
// 비밀번호는 만들지 않는다 — 초보 대상이라 분실 대응 비용이 더 크다.
//
// 로그인은 **쓰기와 AI 기능에만** 필요하다. 챕터 본문·프롬프트·용어는
// 로그인 없이 전부 읽힌다. 링크를 받자마자 로그인 벽이 뜨면 거기서 이탈한다.

import { useCallback, useEffect, useState } from 'react'
import { supabase, isCloudMode } from './supabase'

const PROVIDERS = {
  google: { id: 'google', label: '구글로 계속하기' },
  kakao: { id: 'kakao', label: '카카오로 계속하기' },
}

export const providerList = Object.values(PROVIDERS)

export function useAuth() {
  // status: 'loading' | 'signed-in' | 'signed-out' | 'local'
  //   local = Supabase 미설정. 로그인 개념 자체가 없는 모드
  const [state, setState] = useState(() =>
    isCloudMode ? { status: 'loading', user: null, profile: null } : { status: 'local', user: null, profile: null },
  )

  useEffect(() => {
    if (!isCloudMode) return
    let alive = true

    // profiles 행에서 is_admin 을 읽어온다.
    // 화면 가리기용이고, 진짜 차단은 DB 의 RLS 가 한다.
    async function loadProfile(user) {
      if (!user) return null
      const { data } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url, is_admin')
        .eq('id', user.id)
        .maybeSingle()
      return data ?? null
    }

    async function sync(session) {
      const user = session?.user ?? null
      if (!user) {
        if (alive) setState({ status: 'signed-out', user: null, profile: null })
        return
      }
      const profile = await loadProfile(user)
      if (alive) setState({ status: 'signed-in', user, profile })
    }

    supabase.auth.getSession().then(({ data }) => sync(data.session))

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      sync(session)
    })

    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

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
    ...state,
    signIn,
    signOut,
    isCloudMode,
    /** 로그인이 필요한 동작을 할 수 있는 상태인가 */
    canWrite: state.status === 'signed-in' || state.status === 'local',
    /** 로그인 안내를 띄워야 하는 상태인가 */
    needsLogin: state.status === 'signed-out',
    isAdmin: Boolean(state.profile?.is_admin),
    /** 화면에 보여줄 이름 */
    name:
      state.profile?.display_name ||
      state.user?.user_metadata?.name ||
      state.user?.email?.split('@')[0] ||
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
