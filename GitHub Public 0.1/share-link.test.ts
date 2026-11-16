/** W3 = F5 分享链接与适配生成单测。判据来自 URL 真实往返链路，非 AI 自评。 */
import { describe, it, expect } from 'vitest'
import {
  encodeState,
  decodeState,
  buildShareUrl,
  readStateFromLocation,
  type ShareState,
} from '../src/export/shareLink'
import { adaptContent } from '../src/ai/adaptNarrative'
import { getTemplate } from '../src/templates/registry'
import { parseConcept } from '../src/ai/parseConcept'
import { MOCK_CORPUS } from '../src/ai/mock'

const tricky: ShareState = {
  templateId: 'wave_superposition',
  params: { A1: 1.5, A2: 2, omega: 2, k: 1.5, phi: 3.14 },
  t: 0.75,
  narrative: 'y = y1 + y2（变化率 100%，含 + 与 % 与 & 和 =）',
}

/** 模拟真实浏览器：生成链接 → 打开 → 用 URLSearchParams 读取 → 还原状态 */
function roundTrip(state: ShareState): ShareState | null {
  const url = buildShareUrl('https://example.com/', state)
  return readStateFromLocation(new URL(url).search)
}

describe('F5 分享链接状态编码', () => {
  it('普通状态经 URL 往返可还原', () => {
    const plain: ShareState = { ...tricky, narrative: '拖动滑块观察波形变化' }
    expect(roundTrip(plain)).toEqual(plain)
  })

  it('特殊字符 + / % / & / = 经 URLSearchParams 往返完全可逆', () => {
    expect(roundTrip(tricky)).toEqual(tricky)
  })

  it('编码结果不含裸 % / + / & / =（URL-safe）', () => {
    expect(encodeState(tricky)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('空串与非法输入返回 null，不抛异常', () => {
    expect(readStateFromLocation('')).toBeNull()
    expect(decodeState('')).toBeNull()
    expect(decodeState('%%%broken')).toBeNull()
  })
})

describe('③段适配生成（白名单约束）', () => {
  it('只产出 narrative / suggestedParams / source，建议参数落在 schema 区间内', () => {
    const tpl = getTemplate('simple_harmonic_motion')
    const adapted = adaptContent(tpl, parseConcept(MOCK_CORPUS[0].input))
    expect(Object.keys(adapted).sort()).toEqual(['narrative', 'source', 'suggestedParams'])
    expect(adapted.source).toBe('mock')
    expect(adapted.narrative).toContain(tpl.narrative)
    for (const [k, v] of Object.entries(adapted.suggestedParams)) {
      const spec = tpl.params.find((p) => p.key === k)!
      expect(v).toBeGreaterThanOrEqual(spec.min)
      expect(v).toBeLessThanOrEqual(spec.max)
    }
  })

  it('适配结果不含 equation / invariants / render 字段', () => {
    const tpl = getTemplate('wave_superposition')
    const text = JSON.stringify(adaptContent(tpl, parseConcept(MOCK_CORPUS[2].input)))
    expect(text).not.toContain('equation')
    expect(text).not.toContain('invariants')
    expect(text).not.toContain('render')
  })
})
