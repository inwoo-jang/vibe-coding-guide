// Supabase 연결. 이 파일 하나만 supabase-js 를 직접 import 한다.
//
// 키가 없으면 client 가 null 이 되고, 앱 전체가 "로컬 모드"로 뜬다.
// (로그인 없음, 진도는 이 브라우저에만 저장)
//
// 왜 이렇게 하나:
//   - 친구가 저장소를 클론했을 때 아무 설정 없이 npm run dev 가 돌아가야 한다
//   - 개발 중에 Supabase 없이도 화면을 만질 수 있어야 한다
//   - 키를 깜빡했을 때 하얀 화면이 아니라 "로컬 모드입니다"가 떠야 한다

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 값이 있는지뿐 아니라 '자리표시자 그대로인지'도 본다.
// .env.example 를 복사만 하고 안 채운 경우가 실제로 제일 흔하다.
const looksReal =
  typeof url === 'string' &&
  url.startsWith('https://') &&
  !url.includes('여기에') &&
  typeof anonKey === 'string' &&
  anonKey.length > 40

/** Supabase 가 설정돼 있으면 client, 아니면 null. */
export const supabase = looksReal
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true, // 새로고침해도 로그인 유지
        autoRefreshToken: true,
        detectSessionInUrl: true, // OAuth 로 돌아왔을 때 주소의 토큰을 처리
      },
    })
  : null

/** 서버 저장·로그인이 켜져 있나. 화면에서 "로컬 모드" 안내를 띄울 때 쓴다. */
export const isCloudMode = supabase !== null

// anon key 는 브라우저에 나가는 게 정상이다. 숨길 수 없고 숨기는 게 목적도 아니다.
// 이 키로 무엇을 할 수 있는지는 DB 의 RLS 가 정한다 — supabase/schema.sql 참고.
// 절대 여기 두면 안 되는 건 service_role 키다. 그건 RLS 를 통째로 무시한다.
