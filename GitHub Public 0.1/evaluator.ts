import { compile } from 'mathjs'
import type { VerifiedSimTemplate } from '../templates/schema'
import { equationExpression, type ParamValues } from '../templates/invariants'

export type EvalAt = (t: number, x?: number) => number

/** mathjs compile 有多个重载，这里只取我们实际用到的最小求值接口，避免 ReturnType 落到数组重载上。 */
type CompiledExpression = { evaluate: (scope: Record<string, number>) => unknown }

const compiledCache = new Map<string, CompiledExpression>()

/**
 * 把模板 equation 编译成可高频调用的求值器（每帧 300+ 点，避免重复解析表达式）。
 * 方程字符串来自已通过 scripts/verify-templates.mjs hash 白名单的可信模板库，
 * 因此这里求值不会引入 AI 生成的数学：AI 禁改区仍在模板层。
 */
export function makeEvaluator(tpl: VerifiedSimTemplate, params: ParamValues): EvalAt {
  const expr = equationExpression(tpl)
  let compiled = compiledCache.get(expr)
  if (!compiled) {
    compiled = compile(expr) as unknown as CompiledExpression
    compiledCache.set(expr, compiled)
  }
  const fn: CompiledExpression = compiled
  return (t: number, x = 0): number => {
    const value = fn.evaluate({ ...params, t, x })
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error(`方程求值失败：${tpl.templateId} @ t=${t}, x=${x}`)
    }
    return value
  }
}
