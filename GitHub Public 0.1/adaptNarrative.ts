import type { ConceptParse } from './types'
import type { VerifiedSimTemplate } from '../templates/schema'

/**
 * 三段式 AI 编排的第 ③ 段：适配生成。
 * 【只做白名单】产出 narrative 与建议默认参数；绝不生成 equation / invariants / render。
 * W3 的 mock 模式用人工核定文案 + 定时器模拟 SSE 流式；proxy 模式经 api/orchestrate.ts。
 */
export interface AdaptedContent {
  readonly narrative: string
  readonly suggestedParams: Readonly<Record<string, number>>
  readonly source: 'mock' | 'proxy'
}

export function adaptContent(
  tpl: VerifiedSimTemplate,
  parse: ConceptParse,
): AdaptedContent {
  const suggestedParams: Record<string, number> = {}
  for (const spec of tpl.params) {
    const found = parse.variables.find((v) => v.key === spec.key)
    if (!found || found.value === undefined) continue
    // 建议值必须落在 schema 区间内；单位换算由 toTemplateParams 统一负责
    suggestedParams[spec.key] = Math.min(spec.max, Math.max(spec.min, found.value))
  }
  const context = parse.concept && parse.concept !== '未识别概念'
    ? `结合「${parse.concept}」的教材语境：` : ''
  return {
    narrative: `${context}${tpl.narrative}`,
    suggestedParams,
    source: 'mock',
  }
}

/** mock SSE：把叙事文本分片异步产出，让界面具备「生成中」的流式观感，零网络零 Key。 */
export async function* streamNarrative(
  text: string,
  chunkSize = 12,
  delayMs = 18,
): AsyncGenerator<string> {
  for (let i = 0; i < text.length; i += chunkSize) {
    await new Promise((r) => setTimeout(r, delayMs))
    yield text.slice(i, i + chunkSize)
  }
}
