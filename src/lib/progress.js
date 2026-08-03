// 진도 저장. 지금은 localStorage.
//
// 다음 단계에서 Supabase로 옮길 때 이 파일만 갈아끼우면 되도록
// 화면 쪽에서는 useProgress() 훅으로만 접근하게 해뒀다.
// 서버 저장으로 바꿀 때는 아래 read/write 두 함수를 supabase 호출로 바꾸면 된다.

import { useCallback, useEffect, useState } from 'react'

const KEY = 'vcg.progress.v1'

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function write(next) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

// 같은 탭 안의 다른 컴포넌트들에게도 변경을 알리기 위한 이벤트.
// (window의 'storage' 이벤트는 다른 탭에서만 발생한다.)
const EVENT = 'vcg:progress'

export function useProgress() {
  const [map, setMap] = useState(read)

  useEffect(() => {
    const sync = () => setMap(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const setDone = useCallback((chapterId, done) => {
    const next = { ...read() }
    if (done) next[chapterId] = { done: true, at: new Date().toISOString() }
    else delete next[chapterId]
    write(next)
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const reset = useCallback(() => {
    write({})
    window.dispatchEvent(new Event(EVENT))
  }, [])

  const isDone = useCallback((chapterId) => Boolean(map[chapterId]?.done), [map])

  return { map, isDone, setDone, reset, doneCount: Object.keys(map).length }
}
