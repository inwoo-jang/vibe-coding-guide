// 진도 저장.
//
// 진도는 **프로젝트마다 따로** 쌓인다. 챕터를 읽었는지가 아니라
// "이 프로젝트를 어디까지 만들었나"를 기록하는 것이기 때문이다.
//
// 저장 위치는 projects.js 와 같은 규칙을 따른다.
//   · 로컬 모드            → localStorage
//   · 클라우드 + 로그인    → Supabase (기기를 바꿔도 따라온다)
//   · 클라우드 + 비로그인  → 빈 상태. 체크하려면 로그인해야 한다

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, isCloudMode } from './supabase'
import { useAuth } from './auth'
import { useProjects } from './projects'

const KEY = 'vcg.progress.v2'
const LEGACY_KEY = 'vcg.progress.v1' // 프로젝트 개념이 없던 시절
const EVENT = 'vcg:progress'
const EMPTY = {} // 참조가 바뀌지 않는 빈 값

// ── 로컬 저장 ──────────────────────────────────────────────────
// 모양: { [projectId]: { [chapterId]: { done: true, at: '...' } } }

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function writeLocal(next) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(EVENT))
}

/**
 * 프로젝트 개념이 생기기 전에 저장된 진도를 첫 프로젝트로 옮긴다.
 * 이미 쓰던 사람의 기록이 사라지지 않게 하는 것 — 한 번만 실행되고 흔적을 지운다.
 * (로컬 모드에서만 의미가 있다. 서버 저장을 쓰면 옛 기록이 없다.)
 */
export function migrateLegacyProgress(projectId) {
  if (!projectId || isCloudMode) return
  const raw = localStorage.getItem(LEGACY_KEY)
  if (!raw) return
  try {
    const old = JSON.parse(raw)
    if (old && Object.keys(old).length > 0) {
      const all = readLocal()
      all[projectId] = { ...old, ...(all[projectId] ?? {}) }
      writeLocal(all)
    }
  } catch {
    // 옛 데이터가 깨져 있으면 그냥 버린다. 여기서 앱이 멈추면 안 된다.
  }
  localStorage.removeItem(LEGACY_KEY)
}

/**
 * @param {string} [projectId] 지정하지 않으면 현재 선택된 프로젝트를 쓴다.
 */
export function useProgress(projectId) {
  const { status, user } = useAuth()
  const { activeId } = useProjects()
  const cloud = isCloudMode && status === 'signed-in'
  const id = projectId ?? activeId

  // 모양: { [projectId]: { [chapterId]: {done, at} } }
  const [all, setAll] = useState(() => (isCloudMode ? {} : readLocal()))

  const refresh = useCallback(async () => {
    if (!isCloudMode) {
      setAll(readLocal())
      return
    }
    if (!cloud) {
      setAll({})
      return
    }
    const { data, error } = await supabase
      .from('progress')
      .select('project_id, chapter_id, done, updated_at')
    if (error) {
      console.error('[progress] 불러오기 실패', error)
      return
    }
    const next = {}
    for (const row of data ?? []) {
      if (!row.done) continue
      ;(next[row.project_id] ??= {})[row.chapter_id] = { done: true, at: row.updated_at }
    }
    setAll(next)
  }, [cloud])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const sync = () => refresh()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)

    // 로컬 모드에서 프로젝트를 지우면 그 진도도 함께 지운다.
    // (클라우드는 DB 의 on delete cascade 가 처리한다.)
    const drop = (e) => {
      if (isCloudMode) return
      const next = readLocal()
      delete next[e.detail.id]
      writeLocal(next)
    }
    window.addEventListener('vcg:project-removed', drop)

    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
      window.removeEventListener('vcg:project-removed', drop)
    }
  }, [refresh])

  const map = useMemo(() => (id && all[id]) || EMPTY, [id, all])

  const setDone = useCallback(
    async (chapterId, done) => {
      if (!id) return

      if (cloud) {
        if (done) {
          // (project_id, chapter_id) 가 기본키라 upsert 로 중복이 안 생긴다.
          const { error } = await supabase.from('progress').upsert(
            {
              project_id: id,
              user_id: user.id,
              chapter_id: chapterId,
              done: true,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'project_id,chapter_id' },
          )
          if (error) console.error('[progress] 저장 실패', error)
        } else {
          const { error } = await supabase
            .from('progress')
            .delete()
            .eq('project_id', id)
            .eq('chapter_id', chapterId)
          if (error) console.error('[progress] 삭제 실패', error)
        }
        window.dispatchEvent(new Event(EVENT))
        return
      }

      if (isCloudMode) return // 로그인 필요

      const next = readLocal()
      const mine = { ...(next[id] ?? {}) }
      if (done) mine[chapterId] = { done: true, at: new Date().toISOString() }
      else delete mine[chapterId]
      next[id] = mine
      writeLocal(next)
    },
    [id, cloud, user],
  )

  const reset = useCallback(async () => {
    if (!id) return
    if (cloud) {
      const { error } = await supabase.from('progress').delete().eq('project_id', id)
      if (error) console.error('[progress] 초기화 실패', error)
      window.dispatchEvent(new Event(EVENT))
      return
    }
    if (isCloudMode) return
    const next = readLocal()
    delete next[id]
    writeLocal(next)
  }, [id, cloud])

  const isDone = useCallback((chapterId) => Boolean(map[chapterId]?.done), [map])

  return {
    map,
    isDone,
    setDone,
    reset,
    doneCount: Object.keys(map).length,
    hasProject: Boolean(id),
    /** 체크할 수 있는 상태인가 */
    canWrite: !isCloudMode || cloud,
    /** 여러 프로젝트의 완료 개수 — 목록·관리자 화면용 */
    countFor: (pid) => Object.keys(all[pid] ?? {}).length,
    mapFor: (pid) => all[pid] ?? EMPTY,
  }
}

/** 여러 프로젝트의 완료 개수를 한 번에 — 목록 화면과 관리자 화면용. */
export function useAllProgress() {
  const { countFor, mapFor } = useProgress()
  return { countFor, mapFor }
}
