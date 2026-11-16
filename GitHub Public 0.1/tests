/**
 * 3 个 Verified 模板的「可执行规格」单测。
 * 判据来自模板库（AI 禁改区），不由 AI 自评；本文件只断言这些判据成立。
 */
import { describe, it, expect } from 'vitest'
import { TEMPLATES, getTemplate } from '../src/templates/registry'
import {
  checkInvariants,
  defaultParams,
  evalEquation,
  equationExpression,
} from '../src/templates/invariants'

describe('模板库口径', () => {
  it('恰好 3 个 Verified，且 templateId 唯一', () => {
    expect(TEMPLATES).toHaveLength(3)
    expect(new Set(TEMPLATES.map((t) => t.templateId)).size).toBe(3)
  })

  it('模板对象已深度冻结（AI 禁改区运行时约束）', () => {
    for (const t of TEMPLATES) {
      expect(Object.isFrozen(t)).toBe(true)
      expect(Object.isFrozen(t.params)).toBe(true)
      expect(Object.isFrozen(t.render)).toBe(true)
      expect(Object.isFrozen(t.invariants)).toBe(true)
    }
  })

  it('每个模板的默认值都在 min/max 区间内', () => {
    for (const t of TEMPLATES) {
      for (const p of t.params) {
        expect(p.min).toBeLessThan(p.max)
        expect(p.default).toBeGreaterThanOrEqual(p.min)
        expect(p.default).toBeLessThanOrEqual(p.max)
      }
    }
  })
})

describe('invariants 可执行规格', () => {
  it('简谐振动：max(|x|) ≈ A', () => {
    const t = getTemplate('simple_harmonic_motion')
    const results = checkInvariants(t, defaultParams(t))
    expect(results).toHaveLength(1)
    expect(results[0].ok).toBe(true)
    expect(results[0].error).toBeLessThan(1e-3)
  })

  it('简谐振动：参数变更后峰值仍跟随 A', () => {
    const t = getTemplate('simple_harmonic_motion')
    const params = { ...defaultParams(t), A: 4.25, omega: 7, phi: 1.2 }
    expect(checkInvariants(t, params)[0].ok).toBe(true)
  })

  it('抛体：落地高度为 0，最高点符合解析解', () => {
    const t = getTemplate('projectile_motion')
    const results = checkInvariants(t, defaultParams(t))
    expect(results).toHaveLength(2)
    for (const r of results) expect(r.ok).toBe(true)
  })

  it('抛体：改变 g / 角度后不变量仍成立', () => {
    const t = getTemplate('projectile_motion')
    const params = { ...defaultParams(t), v0: 22, theta: 1.1, g: 3.7 }
    for (const r of checkInvariants(t, params)) expect(r.ok).toBe(true)
  })

  it('波的叠加：y ≡ y1 + y2 且 |y| ≤ A1 + A2', () => {
    const t = getTemplate('wave_superposition')
    const results = checkInvariants(t, defaultParams(t))
    expect(results).toHaveLength(2)
    for (const r of results) expect(r.ok).toBe(true)
  })

  it('波的叠加：相位差 π 时接近相消干涉', () => {
    const t = getTemplate('wave_superposition')
    const params = { ...defaultParams(t), phi: Math.PI, A1: 1, A2: 1 }
    const y = evalEquation(t, params, 0.7, 2.3)
    expect(Math.abs(y)).toBeLessThan(1e-9)
    for (const r of checkInvariants(t, params)) expect(r.ok).toBe(true)
  })
})

describe('方程求值器', () => {
  it('能从 "y = 表达式" 中取出 mathjs 可解析的右半部分', () => {
    for (const t of TEMPLATES) {
      const expr = equationExpression(t)
      expect(expr.length).toBeGreaterThan(0)
      expect(expr).not.toContain('=')
      expect(Number.isFinite(evalEquation(t, defaultParams(t), 0.5, 1))).toBe(true)
    }
  })
})
