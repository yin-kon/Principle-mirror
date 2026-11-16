import { MOCK_CORPUS } from './mock'
import { convertValue } from './unit'
import { defaultParams } from '../templates/invariants'
import type { VerifiedSimTemplate } from '../templates/schema'
import type { ConceptParse } from './types'

/** 中文 bigram 重合度，用于在 mock 语料里找最相近的输入。 */
function bigrams(s: string): Set<string> {
  const out = new Set<string>()
  const clean = s.replace(/[\s，。？！、；：""''（）()]/g, '')
  for (let i = 0; i < clean.length - 1; i++) out.add(clean.slice(i, i + 2))
  return out
}

function overlap(a: string, b: string): number {
  const A = bigrams(a)
  const B = bigrams(b)
  if (A.size === 0 || B.size === 0) return 0
  let hit = 0
  for (const g of A) if (B.has(g)) hit++
  return hit / Math.max(A.size, B.size)
}

/** 未命中预录语料时的低置信度兜底：只抽结构化字段，绝不猜方程。 */
function fallbackParse(text: string): ConceptParse {
  const has = (k: string) => text.includes(k)
  return {
    subject: '物理',
    concept: has('波') ? '波动现象' : has('抛') ? '抛体现象' : '未识别概念',
    variables: [],
    relations: [],
    level: '通识',
    confidence: 0.2,
    source: 'mock',
  }
}

/**
 * F2 概念解析（mock 模式）。
 * proxy 模式的真实 LLM 调用在 W3 由 `api/orchestrate.ts` 承担；
 * 这里保持同一份结构化输出契约，使两种模式可无缝切换。
 */
export function parseConcept(input: string): ConceptParse {
  const text = input.trim()
  if (!text) return fallbackParse('')

  let best = MOCK_CORPUS[0]
  let bestScore = 0
  for (const sample of MOCK_CORPUS) {
    const score = overlap(text, sample.input)
    if (score > bestScore) {
      bestScore = score
      best = sample
    }
  }
  if (bestScore >= 0.12) {
    return { ...best.parse, source: 'mock' }
  }
  return fallbackParse(text)
}

/**
 * 把解析出的变量写入模板默认参数。
 * 先按模板声明的目标单位换算（如教材 deg → 模板 rad），
 * 再按 schema 的 min/max 截断（AI 给出的建议值不得越界）。
 */
export function toTemplateParams(
  parse: ConceptParse,
  tpl: VerifiedSimTemplate,
): Record<string, number> {
  const out: Record<string, number> = { ...defaultParams(tpl) }
  for (const spec of tpl.params) {
    const found = parse.variables.find((v) => v.key === spec.key)
    if (!found || found.value === undefined) continue
    const converted = convertValue(found.value, found.unit, spec.unit)
    out[spec.key] = Math.min(spec.max, Math.max(spec.min, converted))
  }
  return out
}
