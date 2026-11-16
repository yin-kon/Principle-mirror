import shm from './verified/simple_harmonic_motion.json'
import projectile from './verified/projectile_motion.json'
import superposition from './verified/wave_superposition.json'
import { freezeTemplate, type VerifiedSimTemplate } from './schema'

/**
 * 模板库（唯一事实来源）。赛期只做 3 个 Verified，口径见 PRD v1.1 §7.4。
 * JSON 的结构合法性由 scripts/verify-templates.mjs 在 CI 中独立校验，
 * 因此这里用一次显式断言把 JSON 收敛到只读契约上。
 */
const RAW = [shm, projectile, superposition] as unknown as VerifiedSimTemplate[]

export const TEMPLATES: readonly VerifiedSimTemplate[] = Object.freeze(
  RAW.map(freezeTemplate),
)

export const TEMPLATE_IDS: readonly string[] = Object.freeze(
  TEMPLATES.map((t) => t.templateId),
)

export function getTemplate(id: string): VerifiedSimTemplate {
  const found = TEMPLATES.find((t) => t.templateId === id)
  if (!found) throw new Error(`未找到 Verified 模板：${id}`)
  return found
}

export function defaultTemplate(): VerifiedSimTemplate {
  return TEMPLATES[0]
}
