/** 概念解析 / 模板匹配的结构化契约（W2 = F2/F3）。
 * AI 只被允许返回这些白名单字段，不得返回自由文本结论或任何方程。 */

export type EducationLevel = '初中' | '高中' | '大学' | '通识'

export interface ConceptVariable {
  readonly key: string
  readonly label: string
  readonly value?: number
  /** 教材原始单位，如 deg / rad / m / m·s⁻¹；写入模板前必须换算 */
  readonly unit?: string
}

export interface ConceptParse {
  readonly subject: string
  readonly concept: string
  readonly variables: readonly ConceptVariable[]
  readonly relations: readonly string[]
  readonly level: EducationLevel
  readonly confidence: number
  readonly source: 'mock' | 'proxy'
}

export const PARSE_FIELDS = [
  'subject', 'concept', 'variables', 'relations', 'level', 'confidence', 'source',
] as const

export interface MatchResult {
  readonly templateId: string
  readonly score: number
  readonly reason: string
}

export interface MatchOutcome {
  readonly topK: readonly MatchResult[]
  readonly best: MatchResult | null
  /** 低置信度：不自动落地，须由用户确认 */
  readonly needsConfirm: boolean
}
