// 프로젝트 — 이 가이드의 중심 단위.
//
// 챕터를 "읽었다"가 아니라 **내 프로젝트를 어디까지 만들었나**를 기록한다.
// 그래야 기획부터 배포까지 한 사이클을 실제로 돌 수 있다.
// 프로젝트를 여러 개 만들면 각각 따로 진도가 쌓인다.
//
// 지금은 localStorage. 나중에 Supabase 로 옮길 때 read()/write() 만 바꾸면 되도록
// 화면 쪽은 useProjects() 로만 접근하게 해뒀다. (progress.js 와 같은 원칙)

import { useCallback, useEffect, useState } from 'react'

const KEY = 'vcg.projects.v1'
const EVENT = 'vcg:projects'

// 저장 모양:
//   { activeId: 'p_xxx', items: [{ id, name, oneLiner, idea, prd, createdAt }] }
function read() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (!raw || !Array.isArray(raw.items)) return { activeId: null, items: [] }
    return raw
  } catch {
    return { activeId: null, items: [] }
  }
}

function write(next) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(EVENT))
}

function newId() {
  return `p_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function useProjects() {
  const [state, setState] = useState(read)

  useEffect(() => {
    const sync = () => setState(read())
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const create = useCallback((fields) => {
    const now = read()
    const project = {
      id: newId(),
      name: fields.name?.trim() || '이름 없는 프로젝트',
      idea: fields.idea?.trim() || '',
      oneLiner: fields.oneLiner?.trim() || '',
      prd: fields.prd ?? null,
      createdAt: new Date().toISOString(),
    }
    // 새로 만들면 바로 그 프로젝트로 전환한다. 만들고 나서 또 고르게 하지 않는다.
    write({ activeId: project.id, items: [...now.items, project] })
    return project
  }, [])

  const update = useCallback((id, fields) => {
    const now = read()
    write({
      ...now,
      items: now.items.map((p) => (p.id === id ? { ...p, ...fields } : p)),
    })
  }, [])

  const remove = useCallback((id) => {
    const now = read()
    const items = now.items.filter((p) => p.id !== id)
    write({ activeId: now.activeId === id ? (items[0]?.id ?? null) : now.activeId, items })
    // 진도도 같이 지운다. 안 지우면 유령 데이터가 남는다.
    window.dispatchEvent(new CustomEvent('vcg:project-removed', { detail: { id } }))
  }, [])

  const setActive = useCallback((id) => {
    write({ ...read(), activeId: id })
  }, [])

  const items = state.items
  // activeId 가 없거나 지워진 프로젝트를 가리키면 첫 번째로 되돌린다.
  const active = items.find((p) => p.id === state.activeId) ?? items[0] ?? null

  return { projects: items, active, activeId: active?.id ?? null, create, update, remove, setActive }
}

export function useProject(id) {
  const { projects } = useProjects()
  return projects.find((p) => p.id === id) ?? null
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
