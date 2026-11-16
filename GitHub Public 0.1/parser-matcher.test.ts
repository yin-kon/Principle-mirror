/** W2 = F2/F3 的结构化解析与模板匹配单测。判据来自模板库与人工核定语料，非 AI 自评。 */
import { describe, it, expect } from 'vitest'
import { MOCK_CORPUS } from '../src/ai/mock'
import { parseConcept, toTemplateParams } from '../src/ai/parseConcept'
import { matchTemplate } from '../src/ai/matchTemplate'
import { PARSE_FIELDS } from '../src/ai/types'
import { getTemplate } from '../src/templates/registry'
import { checkInvariants } from '../src/templates/invariants'

describe('F2 概念解析', () => {
  it('只返回白名单结构化字段，不含自由文本结论或方程', () => {
    const parsed = parseConcept(MOCK_CORPUS[0].input)
    expect(Object.keys(parsed).sort()).toEqual([...PARSE_FIELDS].sort())
    expect(parsed.source).toBe('mock')
    expect(JSON.stringify(parsed)).not.toContain('equation')
  })

  it('空输入返回低置信度兜底，不抛异常', () => {
    const parsed = parseConcept('   ')
    expect(parsed.confidence).toBeLessThan(0.5)
    expect(parsed.variables).toEqual([])
  })

  it('解析结果可稳定重放（同输入必得同结果）', () => {
    expect(parseConcept(MOCK_CORPUS[2].input)).toEqual(parseConcept(MOCK_CORPUS[2].input))
  })
})

describe('F3 模板匹配', () => {
  it('三个预录样例分别命中对应的 Verified 模板', () => {
    expect(matchTemplate(parseConcept(MOCK_CORPUS[0].input)).best?.templateId)
      .toBe('simple_harmonic_motion')
    expect(matchTemplate(parseConcept(MOCK_CORPUS[1].input)).best?.templateId)
      .toBe('projectile_motion')
    expect(matchTemplate(parseConcept(MOCK_CORPUS[2].input)).best?.templateId)
      .toBe('wave_superposition')
  })

  it('返回 Top-K 且按分数降序', () => {
    const out = matchTemplate(parseConcept(MOCK_CORPUS[0].input))
    expect(out.topK).toHaveLength(3)
    expect(out.topK[0].score).toBeGreaterThanOrEqual(out.topK[1].score)
    expect(out.topK[1].score).toBeGreaterThanOrEqual(out.topK[2].score)
  })

  it('低置信度输入触发 needsConfirm，不自动落地', () => {
    const out = matchTemplate(parseConcept('今天天气不错'))
    expect(out.needsConfirm).toBe(true)
  })

  it('参数建议越界会被模板 min/max 截断', () => {
    const tpl = getTemplate('simple_harmonic_motion')
    const parsed = {
      ...parseConcept(MOCK_CORPUS[0].input),
      variables: [{ key: 'A', label: '振幅', value: 999, unit: 'm' }],
    }
    const params = toTemplateParams(parsed, tpl)
    expect(params.A).toBe(tpl.params.find((p) => p.key === 'A')!.max)
  })
})

describe('单位换算（W2 必修 · 教材 deg → 模板 rad）', () => {
  it('教材角度 45° 应换算为 π/4 rad 再写入模板', () => {
    const parsed = parseConcept(MOCK_CORPUS[1].input)
    const tpl = getTemplate('projectile_motion')
    const params = toTemplateParams(parsed, tpl)
    expect(params.theta).toBeCloseTo(Math.PI / 4, 6)
  })

  it('应用解析参数后不变量仍全部通过', () => {
    const tpl = getTemplate('projectile_motion')
    const params = toTemplateParams(parseConcept(MOCK_CORPUS[1].input), tpl)
    for (const r of checkInvariants(tpl, params)) {
      expect(r.ok, `${r.name}: ${r.detail}`).toBe(true)
    }
  })
})
