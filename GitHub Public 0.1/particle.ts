import { makeScale, drawGrid, strokeCurve, type Renderer } from './shared'

/** 抛体 / 自由落体：轨迹由模板 equation 求 y，水平位移由 v0·cosθ·t 给出。 */
export const drawParticle: Renderer = (d) => {
  const { ctx, params, t, evalAt } = d
  const v0 = params.v0
  const theta = params.theta
  const g = params.g
  const vy = v0 * Math.sin(theta)
  const vx = v0 * Math.cos(theta)
  const tLand = Math.max((2 * vy) / g, 0.001)
  const xMax = Math.max(vx * tLand * 1.15, 1)
  const yMax = Math.max((vy * vy) / (2 * g) * 1.35, 1)

  const s = makeScale(d, 0, xMax, -yMax * 0.08, yMax)
  drawGrid(d, s, 0, xMax, -yMax * 0.08, yMax, 'x / m', 'y / m')

  const pts: Array<[number, number]> = []
  for (let i = 0; i <= 220; i++) {
    const tt = (tLand * i) / 220
    pts.push([vx * tt, Math.max(0, evalAt(tt))])
  }
  strokeCurve(d, s, pts, '#7c3aed', 2.6)

  // 可拖拽的初速度矢量（从原点出发）
  const len = Math.min(Math.hypot(vx, vy) * 4, 130)
  const ex = s.sx(0) + Math.cos(theta) * len
  const ey = s.sy(0) - Math.sin(theta) * len
  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2.4
  ctx.beginPath(); ctx.moveTo(s.sx(0), s.sy(0)); ctx.lineTo(ex, ey); ctx.stroke()
  ctx.fillStyle = '#ef4444'
  ctx.beginPath(); ctx.arc(ex, ey, 5, 0, Math.PI * 2); ctx.fill()
  ctx.font = '11px system-ui, "Microsoft YaHei", sans-serif'
  ctx.fillText(`v₀ = ${v0.toFixed(1)} m/s`, ex + 8, ey - 6)

  // 当前质点（循环播放）
  const cycle = tLand * 1.25
  const tc = ((t % cycle) + cycle) % cycle
  const cx = vx * tc
  const cy = Math.max(0, evalAt(tc))
  ctx.beginPath()
  ctx.arc(s.sx(cx), s.sy(cy), 7, 0, Math.PI * 2)
  ctx.fillStyle = '#f59e0b'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#6d28d9'
  ctx.font = '12px system-ui, "Microsoft YaHei", sans-serif'
  ctx.fillText(`落点 x ≈ ${(vx * tLand).toFixed(2)} m　｜　拖动红色矢量可调 v₀ / θ`, s.px + 12, s.py + 18)
}
