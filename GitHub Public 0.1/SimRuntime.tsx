import {
  useEffect,
  useMemo,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useSimStore } from './store'
import { getTemplate } from '../templates/registry'
import { makeEvaluator } from './evaluator'
import { RENDERERS } from './renderers'
import { PAD } from './renderers/shared'

/**
 * 通用仿真运行时：一份配置 JSON → 渲染器 + 控件 + 状态机。
 * rAF 循环直接读 Zustand getState()，不通过 React 重渲染驱动 Canvas，
 * 保证 60fps 联动；参数变化时只重建编译后的求值器。
 */
export function SimRuntime() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const draggingRef = useRef(false)
  const templateId = useSimStore((s) => s.templateId)
  const params = useSimStore((s) => s.params)

  const tpl = useMemo(() => getTemplate(templateId), [templateId])
  const evaluator = useMemo(() => makeEvaluator(tpl, params), [tpl, params])
  const tplRef = useRef(tpl)
  const evalRef = useRef(evaluator)
  tplRef.current = tpl
  evalRef.current = evaluator

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let last = performance.now()

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const state = useSimStore.getState()
      if (state.playing && !state.dragging) {
        useSimStore.setState({ t: state.t + dt * state.speed })
      }
      const cur = tplRef.current
      RENDERERS[cur.render.type]({
        ctx,
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        tpl: cur,
        params: state.params,
        t: state.t,
        evalAt: evalRef.current,
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  const applyVector = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const dx = Math.max(e.clientX - rect.left - PAD.left, 1)
    const dy = Math.max(rect.height - PAD.bottom - (e.clientY - rect.top), 0)
    const v0 = Math.hypot(dx, dy) / 4
    const theta = Math.atan2(dy, dx)
    useSimStore.getState().setVector(v0, theta)
  }

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (tplRef.current.render.type !== 'particle') return
    draggingRef.current = true
    useSimStore.getState().setDragging(true)
    e.currentTarget.setPointerCapture(e.pointerId)
    applyVector(e)
  }

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (draggingRef.current) applyVector(e)
  }

  const onPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    useSimStore.getState().setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <canvas
      ref={canvasRef}
      className={`sim-canvas ${tpl.render.type === 'particle' ? 'draggable' : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}
