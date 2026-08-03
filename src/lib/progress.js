// 진도 저장. 지금은 localStorage.
//
// 진도는 **프로젝트마다 따로** 쌓인다. 챕터를 읽었는지가 아니라
// "이 프로젝트를 어디까지 만들었나"를 기록하는 것이기 때문이다.
// 프로젝트를 두 개 만들면 각각 0%부터 시작한다.
//
// 다음 단계에서 Supabase 로 옮길 때 이 파일만 갈아끼우면 되도록
// 화면 쪽에서는 useProgress() 훅으로만 접근하게 해뒀다.
// 서버 저장으로 바꿀 때는 아래 read/write 두 함수를 supabase 호출로 바꾸면 된다.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useProjects } from './projects'

const EMPTY = {} // 참조가 바뀌지 않는 빈 값 — 불필요한 재계산을 막는다

const KEY = 'vcg.progress.v2'
const LEGACY_KEY = 'vcg.progress.v1' // 프로젝트 개념이 없던 시절

// 저장 모양: { [projectId]: { [chapterId]: { done: true, at: '...' } } }
function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function write(next) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

/**
 * 프로젝트 개념이 생기기 전에 저장된 진도를 첫 프로젝트로 옮긴다.
 * 이미 쓰던 사람의 기록이 사라지지 않게 하는 것 — 한 번만 실행되고 흔적을 지운다.
 */
export function migrateLegacyProgress(projectId) {
  if (!projectId) return
  const raw = localStorage.getItem(LEGACY_KEY)
  if (!raw) return
  try {
    const old = JSON.parse(raw)
    if (old && Object.keys(old).length > 0) {
      const all = read()
      all[projectId] = { ...old, ...(all[projectId] ?? {}) }
      write(all)
    }
  } catch {
    // 옛 데이터가 깨져 있으면 그냥 버린다. 여기서 앱이 멈추면 안 된다.
  }
  localStorage.removeItem(LEGACY_KEY)
}

const EVENT = 'vcg:progress'

/**
 * @param {string} [projectId] 지정하지 않으면 현재 선택된 프로젝트를 쓴다.
 */
export function useProgress(projectId) {
  const { activeId } = useProjects()
  const id = projectId ?? activeId
  const [all, setAll] = useState(read)

  useEffect(() => {
    const sync = () => setAll(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)

    // 프로젝트를 지우면 그 진도도 함께 지운다.
    const drop = (e) => {
      const next = read()
      delete next[e.detail.id]
      write(next)
      setAll(next)
    }
    window.addEventListener('vcg:project-removed', drop)

    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
      window.removeEventListener('vcg:project-removed', drop)
    }
  }, [])

  // 매 렌더마다 새 객체를 만들면 아래 useCallback 들이 계속 새로 만들어진다.
  const map = useMemo(() => (id && all[id]) || EMPTY, [id, all])

  const setDone = useCallback(
    (chapterId, done) => {
      if (!id) return // 프로젝트 없이는 진도를 기록하지 않는다
      const next = read()
      const mine = { ...(next[id] ?? {}) }
      if (done) mine[chapterId] = { done: true, at: new Date().toISOString() }
      else delete mine[chapterId]
      next[id] = mine
      write(next)
      window.dispatchEvent(new Event(EVENT))
    },
    [id],
  )

  const reset = useCallback(() => {
    if (!id) return
    const next = read()
    delete next[id]
    write(next)
    window.dispatchEvent(new Event(EVENT))
  }, [id])

  const isDone = useCallback((chapterId) => Boolean(map[chapterId]?.done), [map])

  return {
    map,
    isDone,
    setDone,
    reset,
    doneCount: Object.keys(map).length,
    hasProject: Boolean(id),
  }
}

/** 여러 프로젝트의 완료 개수를 한 번에 — 목록 화면과 관리자 화면용. */
export function useAllProgress() {
  const [all, setAll] = useState(read)
  useEffect(() => {
    const sync = () => setAll(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return {
    countFor: (projectId) => Object.keys(all[projectId] ?? {}).length,
    mapFor: (projectId) => all[projectId] ?? {},
  }
}
