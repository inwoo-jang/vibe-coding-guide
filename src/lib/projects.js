// 프로젝트 — 이 가이드의 중심 단위.
//
// 챕터를 "읽었다"가 아니라 **내 프로젝트를 어디까지 만들었나**를 기록한다.
//
// 저장 위치는 두 가지고, 화면은 어느 쪽인지 몰라도 된다.
//   · 로컬 모드 (Supabase 미설정)  → localStorage. 로그인 개념 없음
//   · 클라우드 모드 + 로그인       → Supabase. 기기를 바꿔도 따라온다
//   · 클라우드 모드 + 비로그인     → 빈 목록. 만들려면 로그인해야 한다
//
// 이 파일과 progress.js 만 저장소를 안다. 화면은 훅만 쓴다.

import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, isCloudMode } from './supabase'
import { useAuth } from './auth'

const LOCAL_KEY = 'vcg.projects.v1'
const ACTIVE_KEY = 'vcg.activeProject.v1'
const EVENT = 'vcg:projects'

// 화면들에게 "다시 읽어라"만 알린다 (데이터는 그대로)
function notify() {
  window.dispatchEvent(new Event(EVENT))
}

// 데이터가 실제로 바뀐 경우 — 캐시를 버리고 알린다
function broadcast() {
  invalidate()
  notify()
}

// ── 로컬 저장 ──────────────────────────────────────────────────

function readLocal() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOCAL_KEY) ?? 'null')
    if (!raw || !Array.isArray(raw.items)) return { items: [] }
    return raw
  } catch {
    return { items: [] }
  }
}

function writeLocal(items) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify({ items }))
  broadcast()
}

// 어느 프로젝트를 보고 있는지는 기기별 취향이라 서버에 두지 않는다.
function readActiveId() {
  return localStorage.getItem(ACTIVE_KEY) || null
}
function writeActiveId(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id)
  else localStorage.removeItem(ACTIVE_KEY)
  // 목록 자체는 안 바뀌었으므로 캐시를 버리지 않는다.
  // 여기서 버리면 프로젝트를 전환할 때마다 목록을 다시 읽는다.
  notify()
}

function newLocalId() {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

// ── 같은 요청을 여러 번 보내지 않는다 ──────────────────────────
//
// useProjects() 는 화면·레이아웃·progress 등 여러 곳에서 불린다.
// 각자 fetch 하면 한 화면을 여는 데만 목록을 네 번씩 읽는다.
// 그래서 (1) 결과를 모듈에 caching 하고 (2) 진행 중인 요청은 같이 기다린다.
// auth.js 의 "확인 중…" 이 느렸던 것과 같은 원인이다.
let cache = null // 마지막으로 읽어온 목록
let inflight = null // 지금 날아가고 있는 요청

async function fetchProjects() {
  if (inflight) return inflight // 이미 누가 요청했으면 그걸 기다린다
  inflight = supabase
    .from('projects')
    .select('id, name, one_liner, idea, prd, created_at')
    .order('created_at', { ascending: true })
    .then(({ data, error }) => {
      if (error) console.error('[projects] 불러오기 실패', error)
      cache = (data ?? []).map(fromRow)
      return cache
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

/** 저장 후 캐시를 버린다 — 다음 조회가 새로 읽게 */
function invalidate() {
  cache = null
}

// DB 컬럼(snake_case)과 화면에서 쓰는 이름(camelCase)을 맞춰준다.
function fromRow(row) {
  return {
    id: row.id,
    name: row.name,
    oneLiner: row.one_liner ?? '',
    idea: row.idea ?? '',
    prd: row.prd ?? null,
    createdAt: row.created_at,
  }
}

export function useProjects() {
  const { status, user } = useAuth()
  const cloud = isCloudMode && status === 'signed-in'

  // 캐시가 있으면 그걸로 시작한다 — 화면을 옮길 때마다 빈 목록이 스쳐 보이지 않게
  const [items, setItems] = useState(() => (isCloudMode ? (cache ?? []) : readLocal().items))
  const [activeIdRaw, setActiveIdRaw] = useState(readActiveId)
  const [loading, setLoading] = useState(isCloudMode && cache === null)

  // 저장소에서 다시 읽어온다.
  const refresh = useCallback(async () => {
    if (!isCloudMode) {
      setItems(readLocal().items)
      setActiveIdRaw(readActiveId())
      setLoading(false)
      return
    }
    if (!cloud) {
      // 로그인 안 함 → 보여줄 게 없다
      cache = null
      setItems([])
      setLoading(false)
      return
    }
    if (cache === null) setLoading(true)
    const list = await fetchProjects()
    setItems(list)
    setActiveIdRaw(readActiveId())
    setLoading(false)
  }, [cloud])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const sync = () => refresh()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [refresh])

  const create = useCallback(
    async (fields) => {
      const draft = {
        name: fields.name?.trim() || '이름 없는 프로젝트',
        oneLiner: fields.oneLiner?.trim() || '',
        idea: fields.idea?.trim() || '',
        prd: fields.prd ?? null,
      }

      if (cloud) {
        const { data, error } = await supabase
          .from('projects')
          .insert({
            user_id: user.id,
            name: draft.name,
            one_liner: draft.oneLiner,
            idea: draft.idea,
            prd: draft.prd,
          })
          .select('id, name, one_liner, idea, prd, created_at')
          .single()
        if (error) {
          console.error('[projects] 만들기 실패', error)
          return null
        }
        const project = fromRow(data)
        invalidate()
        writeActiveId(project.id) // 만들면 바로 그 프로젝트로 전환
        return project
      }

      if (isCloudMode) return null // 로그인 필요

      const project = { id: newLocalId(), createdAt: new Date().toISOString(), ...draft }
      writeLocal([...readLocal().items, project])
      writeActiveId(project.id)
      return project
    },
    [cloud, user],
  )

  const update = useCallback(
    async (id, fields) => {
      if (cloud) {
        const patch = {}
        if (fields.name !== undefined) patch.name = fields.name
        if (fields.oneLiner !== undefined) patch.one_liner = fields.oneLiner
        if (fields.idea !== undefined) patch.idea = fields.idea
        if (fields.prd !== undefined) patch.prd = fields.prd
        const { error } = await supabase.from('projects').update(patch).eq('id', id)
        if (error) console.error('[projects] 수정 실패', error)
        broadcast()
        return
      }
      if (isCloudMode) return
      writeLocal(readLocal().items.map((p) => (p.id === id ? { ...p, ...fields } : p)))
    },
    [cloud],
  )

  const remove = useCallback(
    async (id) => {
      if (cloud) {
        // progress 는 FK on delete cascade 로 같이 지워진다 — 앱이 아니라 DB 가 한다
        const { error } = await supabase.from('projects').delete().eq('id', id)
        if (error) console.error('[projects] 삭제 실패', error)
      } else if (!isCloudMode) {
        writeLocal(readLocal().items.filter((p) => p.id !== id))
        // 로컬 모드에는 cascade 가 없으니 진도를 직접 지운다
        window.dispatchEvent(new CustomEvent('vcg:project-removed', { detail: { id } }))
      }
      if (readActiveId() === id) writeActiveId(null)
      broadcast()
    },
    [cloud],
  )

  const setActive = useCallback((id) => writeActiveId(id), [])

  // activeId 가 없거나 지워진 프로젝트를 가리키면 첫 번째로 되돌린다.
  const active = useMemo(
    () => items.find((p) => p.id === activeIdRaw) ?? items[0] ?? null,
    [items, activeIdRaw],
  )

  return {
    projects: items,
    active,
    activeId: active?.id ?? null,
    loading,
    /** 프로젝트를 만들 수 있는 상태인가 (로컬 모드거나 로그인했거나) */
    canWrite: !isCloudMode || cloud,
    create,
    update,
    remove,
    setActive,
  }
}

/**
 * AI에게 보낼 프로젝트 설명.
 *
 * 짧게 유지하는 게 중요하다 — 이 글자 수가 그대로 입력 토큰이고 요금이다.
 * PRD 전체를 통째로 붙이지 않고, AI가 판단하는 데 실제로 필요한 것만 추린다.
 */
export function projectContext(project) {
  if (!project) return ''
  const lines = [`프로젝트: ${project.name}`]
  if (project.oneLiner) lines.push(`한 줄 요약: ${project.oneLiner}`)
  else if (project.idea) lines.push(`아이디어: ${project.idea.slice(0, 200)}`)

  const prd = project.prd
  if (prd) {
    if (prd.users) lines.push(`대상: ${prd.users}`)
    if (prd.stack) lines.push(`스택: ${prd.stack}`)
    if (Array.isArray(prd.mustHave) && prd.mustHave.length > 0) {
      // 제목만. why 까지 보내면 길이가 두 배가 된다.
      lines.push(`첫 버전 기능: ${prd.mustHave.map((f) => f.title).join(', ')}`)
    }
    if (Array.isArray(prd.screens) && prd.screens.length > 0) {
      lines.push(`화면: ${prd.screens.map((s) => s.name).join(', ')}`)
    }
  }
  return lines.join('\n')
}
