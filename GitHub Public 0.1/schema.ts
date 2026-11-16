/**
 * VerifiedSimTemplate —— 仿真模板的类型契约（AI 禁改区的类型层约束）
 *
 * 【AI 禁改区】`equation` / `invariants` / `render` 三个字段由人工校验并冻结，
 * AI 只可填写 `narrative` 与 `params[].default` 的建议值，越界即视为无效输出。
 * 见 CONTRIBUTING.md §9 与 docs/tech/原理镜_最终提交技术文档.md 4.7。
 */

export type RendererType = 'wave_2d' | 'particle' | 'superposition'

export interface SimParam {
  readonly key: string
  readonly label: string
  readonly min: number
  readonly max: number
  readonly default: number
  readonly unit: string
}

export interface RenderSpec {
  readonly type: RendererType
  readonly xAxis: string
  readonly yAxis: string
}

export interface VerifiedSimTemplate {
  readonly templateId: string
  readonly subject: string
  readonly tags: readonly string[]
  readonly title: string
  readonly params: readonly SimParam[]
  /** 人工校验的方程（mathjs 表达式），AI 禁改 */
  readonly equation: string
  /** 渲染方式，AI 禁改 */
  readonly render: RenderSpec
  /** 不变量 / 守恒量规格，即「可执行规格」，AI 禁改 */
  readonly invariants: readonly string[]
  /** AI 唯一可自由填写的字段 */
  readonly narrative: string
}

/** 深度冻结模板：编译期只读类型 + 运行时 Object.freeze 双重约束 */
export function freezeTemplate(t: VerifiedSimTemplate): VerifiedSimTemplate {
  return Object.freeze({
    ...t,
    tags: Object.freeze([...t.tags]),
    params: Object.freeze(t.params.map((p) => Object.freeze({ ...p }))),
    render: Object.freeze({ ...t.render }),
    invariants: Object.freeze([...t.invariants]),
  }) as VerifiedSimTemplate
}
