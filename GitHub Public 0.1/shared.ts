import type { VerifiedSimTemplate } from '../../templates/schema'
import type { ParamValues } from '../../templates/invariants'

/** 渲染器统一上下文。evalAt 由 SimRuntime 用 mathjs 编译后的方程求值器注入，避免每帧重复解析。 */
export interface DrawContext {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  tpl: VerifiedSimTemplate
  params: ParamValues
  t: number
  evalAt: (t: number, x?: number) => number
}

export type Renderer = (d: DrawContext) => void

export const PAD = { left: 56, right: 22, top: 26, bottom: 42 } as const

export interface Scale {
  px: number
  py: number
  pw: number
  ph: number
  sx: (v: number) => number
  sy: (v: number) => number
}

export function makeScale(
  d: DrawContext,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
): Scale {
  const pw = d.width - PAD.left - PAD.right
  const ph = d.height - PAD.top - PAD.bottom
  const spanX = xMax - xMin || 1
  const spanY = yMax - yMin || 1
  return {
    px: PAD.left,
    py: PAD.top,
    pw,
    ph,
    sx: (v) => PAD.left + ((v - xMin) / spanX) * pw,
    sy: (v) => PAD.top + ph - ((v - yMin) / spanY) * ph,
  }
}

export function drawGrid(
  d: DrawContext,
  s: Scale,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xLabel: string,
  yLabel: string,
): void {
  const { ctx } = d
  ctx.clearRect(0, 0, d.width, d.height)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, d.width, d.height)

  ctx.strokeStyle = '#eef2f7'
  ctx.lineWidth = 1
  for (let i = 0; i <= 5; i++) {
    const gx = s.px + (s.pw * i) / 5
    ctx.beginPath(); ctx.moveTo(gx, s.py); ctx.lineTo(gx, s.py + s.ph); ctx.stroke()
  }
  for (let i = 0; i <= 4; i++) {
    const gy = s.py + (s.ph * i) / 4
    ctx.beginPath(); ctx.moveTo(s.px, gy); ctx.lineTo(s.px + s.pw, gy); ctx.stroke()
  }

  if (yMin < 0 && yMax > 0) {
    const zy = s.sy(0)
    ctx.strokeStyle = '#cbd5e1'
    ctx.setLineDash([4, 4])
    ctx.beginPath(); ctx.moveTo(s.px, zy); ctx.lineTo(s.px + s.pw, zy); ctx.stroke()
    ctx.setLineDash([])
  }

  ctx.strokeStyle = '#94a3b8'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(s.px, s.py)
  ctx.lineTo(s.px, s.py + s.ph)
  ctx.lineTo(s.px + s.pw, s.py + s.ph)
  ctx.stroke()

  ctx.fillStyle = '#64748b'
  ctx.font = '11px system-ui, "Microsoft YaHei", sans-serif'
  ctx.fillText(xLabel, s.px + s.pw - 24, s.py + s.ph + 28)
  // 轴标签放到绘图区上方，与刻度数字分区，避免左上角两行文字挤叠
  ctx.fillText(yLabel, 8, Math.max(s.py - 8, 12))
  ctx.fillText(xMin.toFixed(1), s.px - 12, s.py + s.ph + 16)
  ctx.fillText(xMax.toFixed(1), s.px + s.pw - 26, s.py + s.ph + 16)
  ctx.fillText(yMax.toFixed(1), 8, s.py + 4)
  ctx.fillText(yMin.toFixed(1), 8, s.py + s.ph + 4)
}

export function strokeCurve(
  d: DrawContext,
  s: Scale,
  points: Array<[number, number]>,
  color: string,
  lineWidth = 2,
  dash: number[] = [],
): void {
  const { ctx } = d
  if (points.length < 2) return
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineJoin = 'round'
  ctx.setLineDash(dash)
  ctx.beginPath()
  ctx.moveTo(s.sx(points[0][0]), s.sy(points[0][1]))
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(s.sx(points[i][0]), s.sy(points[i][1]))
  }
  ctx.stroke()
  ctx.setLineDash([])
}
