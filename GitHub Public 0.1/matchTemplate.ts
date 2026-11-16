import { TEMPLATES } from '../templates/registry'
import type { ConceptParse, MatchOutcome, MatchResult } from './types'

/** 规则 / 关键词匹配表（人工维护，属于「AI 适配」之外的确定性逻辑）。 */
const KEYWORDS: Record<string, readonly string[]> = {
  simple_harmonic_motion: ['简谐', '振动', '正弦', '周期', '振幅'],
  projectile_motion: ['抛', '落', '重力', '轨迹', '初速度', '斜'],
  wave_superposition: ['波', '叠加', '干涉', '相位', '频率'],
}

const CONFIRM_THRESHOLD = 0.45
const CONFIDENCE_FLOOR = 0.5

/**
 * F3 模板匹配：返回 Top-K + 置信度 + 是否需要人工确认。
 * 只从 3 个 Verified 模板里「选」，绝不生成新模板、绝不改方程。
 */
export function matchTemplate(
  parse: ConceptParse,
  threshold = CONFIRM_THRESHOLD,
): MatchOutcome {
  const text = [
    parse.concept,
    ...parse.relations,
    ...parse.variables.map((v) => v.label),
  ].join(' ')

  const scored: MatchResult[] = TEMPLATES.map((t) => {
    const keywords = KEYWORDS[t.templateId] ?? []
    const hits = keywords.filter((k) => text.includes(k)).length
    const titleHit =
      t.title.includes(parse.concept) ||
      parse.concept.includes(t.title.split(' ')[0])
        ? 1
        : 0
    const score = Math.min(
      1,
      (hits / Math.max(keywords.length, 1)) * 0.75 + titleHit * 0.25,
    )
    return {
      templateId: t.templateId,
      score: Number(score.toFixed(3)),
      reason: `命中关键词 ${hits}/${keywords.length}${titleHit ? '，标题匹配' : ''}`,
    }
  }).sort((a, b) => b.score - a.score)

  const best = scored[0] ?? null
  const needsConfirm =
    !best || best.score < threshold || parse.confidence < CONFIDENCE_FLOOR

  return { topK: scored, best, needsConfirm }
}
