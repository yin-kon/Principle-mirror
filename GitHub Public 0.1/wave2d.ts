import { makeScale, drawGrid, strokeCurve, type Renderer } from './shared'

/** 简谐振动：位移—时间曲线。曲线全部来自模板 equation（evalAt），不另写公式。 */
export const drawWave2d: Renderer = (d) => {
  const { ctx, params, t, evalAt } = d
  const A = params.A
  const omega = params.omega
  const T = (4 * Math.PI) / omega
  const bound = A * 1.25

  const s = makeScale(d, 0, T, -bound, bound)
  drawGrid(d, s, 0, T, -bound, bound, 't / s', 'x / m')

  const pts: Array<[number, number]> = []
  for (let i = 0; i <= 320; i++) {
    const tt = (T * i) / 320
    pts.push([tt, evalAt(tt)])
  }
  strokeCurve(d, s, pts, '#2563eb', 2.6)

  // 当前时刻的振动质点
  const tc = ((t % T) + T) % T
  const x = evalAt(tc)
  ctx.beginPath()
  ctx.arc(s.sx(tc), s.sy(x), 6, 0, Math.PI * 2)
  ctx.fillStyle = '#f59e0b'
  ctx.fill()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = '#1e40af'
  ctx.font = '12px system-ui, "Microsoft YaHei", sans-serif'
  ctx.fillText(`x(t) = ${x.toFixed(3)} m　｜　峰值 ≈ A = ${A.toFixed(2)} m`, s.px + 12, s.py + 18)
}
