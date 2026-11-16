import { create } from 'zustand'
import { defaultTemplate, getTemplate } from '../templates/registry'
import {
  checkInvariants,
  defaultParams,
  type InvariantResult,
  type ParamValues,
} from '../templates/invariants'

function initial(id: string) {
  const tpl = getTemplate(id)
  const params = defaultParams(tpl)
  return { params, warnings: checkInvariants(tpl, params) }
}

const boot = initial(defaultTemplate().templateId)

export interface SimState {
  templateId: string
  params: ParamValues
  t: number
  playing: boolean
  speed: number
  warnings: InvariantResult[]
  dragging: boolean
  setTemplate: (id: string) => void
  setParam: (key: string, value: number) => void
  setVector: (v0: number, theta: number) => void
  setTime: (t: number) => void
  setPlaying: (v: boolean) => void
  setSpeed: (v: number) => void
  setDragging: (v: boolean) => void
  reset: () => void
}

export const useSimStore = create<SimState>((set, get) => ({
  templateId: defaultTemplate().templateId,
  params: boot.params,
  t: 0,
  playing: true,
  speed: 1,
  warnings: boot.warnings,
  dragging: false,

  setTemplate: (id) => {
    const tpl = getTemplate(id)
    const params = defaultParams(tpl)
    set({
      templateId: id,
      params,
      t: 0,
      warnings: checkInvariants(tpl, params),
    })
  },

  setParam: (key, value) => {
    const { templateId, params } = get()
    const tpl = getTemplate(templateId)
    const spec = tpl.params.find((p) => p.key === key)
    const clamped = spec
      ? Math.min(spec.max, Math.max(spec.min, value))
      : value
    const next = { ...params, [key]: clamped }
    set({ params: next, warnings: checkInvariants(tpl, next) })
  },

  setVector: (v0, theta) => {
    const { templateId } = get()
    const tpl = getTemplate(templateId)
    const next = { ...get().params }
    for (const spec of tpl.params) {
      if (spec.key === 'v0') next.v0 = Math.min(spec.max, Math.max(spec.min, v0))
      if (spec.key === 'theta') next.theta = Math.min(spec.max, Math.max(spec.min, theta))
    }
    set({ params: next, warnings: checkInvariants(tpl, next) })
  },

  setTime: (t) => set({ t }),
  setPlaying: (playing) => set({ playing }),
  setSpeed: (speed) => set({ speed }),
  setDragging: (dragging) => set({ dragging }),

  reset: () => {
    const { templateId } = get()
    const tpl = getTemplate(templateId)
    const params = defaultParams(tpl)
    set({ params, t: 0, playing: true, warnings: checkInvariants(tpl, params) })
  },
}))
