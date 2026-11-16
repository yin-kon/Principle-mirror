import { makeScale, drawGrid, strokeCurve, type Renderer } from './shared'

/**
 * 波的叠加干涉：紫色实线 = 叠加结果，全部来自模板 equation（evalAt）。
 * 蓝/青虚线是两列分波的展示辅助线，不参与物理判定；判据由 invariants 独立断言。
 */
export const drawSuperposition: Renderer = (d) => {
  const { ctx, params, t, evalAt } = d
  const { A1, A2, omega, k, phi } = params
  const bound = (A1 + A2) * 1.2
  const xMax = 12

  const s = makeScale(d, 0, xMax, -bound, bound)
  drawGrid(d, s, 0, xMax, -bound, bound, 'x / m', 'y / m')

  const p1: Array<[number, number]> = []
  const p2: Array<[number, number]> = []
  const sum: Array<[number, number]> = []
  for (let i = 0; i <= 280; i++) {
    const x = (xMax * i) / 280
    const phase = k * x - omega * t
    p1.push([x, A1 * Math.sin(phase)])
    p2.push([x, A2 * Math.sin(phase + phi)])
    sum.push([x, evalAt(t, x)])
  }
  strokeCurve(d, s, p1, '#38bdf8', 1.6, [6, 4])
  strokeCurve(d, s, p2, '#10b981', 1.6, [6, 4])
  strokeCurve(d, s, sum, '#7c3aed', 2.8)

  const legend: Array<[string, string]> = [
    ['波 1', '#38bdf8'], ['波 2', '#10b981'], ['叠加 y = y₁ + y₂', '#7c3aed'],
  ]
  // 图例移到绘图区上方（原先与相位文字同处顶部、相互挤压）
  ctx.font = '11px system-ui, "Microsoft YaHei", sans-serif'
  let lx = s.px + 12
  for (const [label, color] of legend) {
    ctx.fillStyle = color
    ctx.fillRect(lx, s.py - 12, 12, 3)
    ctx.fillStyle = '#475569'
    ctx.fillText(label, lx + 16, s.py - 8)
    lx += label.length * 12 + 40
  }

  // 相位信息移到绘图区底部并加白底，避免压在曲线上；同相时明确提示虚线重合
  const samePhase = Math.abs(Math.sin(phi / 2)) < 0.02
  const note = `相位差 φ = ${phi.toFixed(2)} rad　｜　|y| ≤ A₁+A₂ = ${(A1 + A2).toFixed(2)}`
    + (samePhase ? '　·　两波同相，虚线重合' : '')
  ctx.font = '12px system-ui, "Microsoft YaHei", sans-serif'
  const noteWidth = ctx.measureText(note).width
  ctx.fillStyle = 'rgba(255,255,255,0.88)'
  ctx.fillRect(s.px + 8, s.py + s.ph - 28, noteWidth + 12, 20)
  ctx.fillStyle = '#6d28d9'
  ctx.fillText(note, s.px + 14, s.py + s.ph - 14)
}
