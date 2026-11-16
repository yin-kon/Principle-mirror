/**
 * 不变量求值 —— 「可执行规格」。
 *
 * 【AI 禁改区】本文件的断言逻辑与模板 JSON 的 equation / invariants 同属信任根，
 * 由人工校验；AI 不得改写判据，也不得自评正确性。
 * 方程用 mathjs evaluate 对「已通过 hash 白名单校验」的可信模板字符串求值。
 */
import { evaluate } from 'mathjs'
import type { VerifiedSimTemplate } from './schema'

export type ParamValues = Readonly<Record<string, number>>

export function defaultParams(tpl: VerifiedSimTemplate): ParamValues {
  const out: Record<string, number> = {}
  for (const p of tpl.params) out[p.key] = p.default
  return out
}

/** 从 "y = 表达式" 中取出 mathjs 可求值的右半部分 */
export function equationExpression(tpl: VerifiedSimTemplate): string {
  const i = tpl.equation.indexOf('=')
  return (i >= 0 ? tpl.equation.slice(i + 1) : tpl.equation).trim()
}

export function evalEquation(
  tpl: VerifiedSimTemplate,
  params: ParamValues,
  t: number,
  x = 0,
): number {
  const scope: Record<string, number> = { ...params, t, x }
  const value = evaluate(equationExpression(tpl), scope)
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`方程求值失败：${tpl.templateId} @ t=${t}, x=${x}`)
  }
  return value
}

export interface InvariantResult {
  name: string
  ok: boolean
  error: number
  detail: string
}

const TOL = 1e-6

/** 对当前参数做边界 / 守恒量断言。返回逐条结果，供 UI 显示告警。 */
export function checkInvariants(
  tpl: VerifiedSimTemplate,
  params: ParamValues,
): InvariantResult[] {
  const v = (k: string) => params[k]

  switch (tpl.templateId) {
    case 'simple_harmonic_motion': {
      const { A, omega } = { A: v('A'), omega: v('omega') }
      const period = (2 * Math.PI) / omega
      let peak = 0
      for (let i = 0; i <= 512; i++) {
        peak = Math.max(peak, Math.abs(evalEquation(tpl, params, (period * i) / 512)))
      }
      const error = Math.abs(peak - A)
      return [{
        name: 'max(|x|) ≈ A',
        ok: error < 1e-3,
        error,
        detail: `采样峰值 ${peak.toFixed(6)}，振幅 A=${A}`,
      }]
    }

    case 'projectile_motion': {
      const vy = v('v0') * Math.sin(v('theta'))
      const g = v('g')
      const tLand = (2 * vy) / g
      const yLand = evalEquation(tpl, params, tLand)
      const tApex = vy / g
      const yMax = evalEquation(tpl, params, tApex)
      const yMaxTheory = (vy * vy) / (2 * g)
      return [
        {
          name: 'y(t_land) ≈ 0',
          ok: Math.abs(yLand) < TOL,
          error: Math.abs(yLand),
          detail: `落地时刻 ${tLand.toFixed(4)}s，y=${yLand.toFixed(9)}`,
        },
        {
          name: 'y_max ≈ (v0·sinθ)²/(2g)',
          ok: Math.abs(yMax - yMaxTheory) < TOL,
          error: Math.abs(yMax - yMaxTheory),
          detail: `实测 ${yMax.toFixed(6)}，解析解 ${yMaxTheory.toFixed(6)}`,
        },
      ]
    }

    case 'wave_superposition': {
      const { A1, A2, omega, k, phi } = {
        A1: v('A1'), A2: v('A2'), omega: v('omega'), k: v('k'), phi: v('phi'),
      }
      let maxIdentityError = 0
      let maxAbs = 0
      for (let i = 0; i <= 256; i++) {
        const t = (i / 256) * 4
        for (let j = 0; j <= 32; j++) {
          const x = (j / 32) * 12
          const y = evalEquation(tpl, params, t, x)
          const y1 = A1 * Math.sin(k * x - omega * t)
          const y2 = A2 * Math.sin(k * x - omega * t + phi)
          maxIdentityError = Math.max(maxIdentityError, Math.abs(y - (y1 + y2)))
          maxAbs = Math.max(maxAbs, Math.abs(y))
        }
      }
      return [
        {
          name: 'y ≈ y1 + y2',
          ok: maxIdentityError < 1e-9,
          error: maxIdentityError,
          detail: `257×33 采样点最大偏差 ${maxIdentityError.toExponential(3)}`,
        },
        {
          name: '|y| ≤ A1 + A2',
          ok: maxAbs <= A1 + A2 + TOL,
          error: Math.max(0, maxAbs - A1 - A2),
          detail: `实测峰值 ${maxAbs.toFixed(6)}，上界 ${(A1 + A2).toFixed(6)}`,
        },
      ]
    }

    default:
      return [{ name: '未知模板', ok: false, error: Infinity, detail: tpl.templateId }]
  }
}
