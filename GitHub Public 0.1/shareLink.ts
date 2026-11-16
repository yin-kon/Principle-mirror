/**
 * F5 分享链接：把交互状态编码进 URL，无需服务端存储。
 *
 * 修复记录（P3 链）：第一版用 encodeURIComponent(JSON) + decodeURIComponent，
 * 经 URLSearchParams 读取会双重解码，状态文本含 `%` / `+` / `&` / `=` 时还原错乱或抛 URIError；
 * 现改为 lz-string 压缩 + base64url，结果只含 `[A-Za-z0-9_-]`，不做二次解码。
 * 坏 commit `87adea1` 保留失败断言，详见 P3 链 03-bugfix-dialogue.md。
 */
import { compressToBase64, decompressFromBase64 } from 'lz-string'

export interface ShareState {
  templateId: string
  params: Record<string, number>
  t: number
  narrative: string
}

export const SHARE_PARAM = 's'

/**
 * URL-safe 可逆编码：lz-string 压缩为 base64，再做 base64url 替换。
 * 标准 base64 字符集不含 `-` / `_`，因此 `+→-`、`/→_` 可逆；去掉尾部 `=` 后
 * 结果只含 `[A-Za-z0-9_-]`，不会再被 URLSearchParams / decodeURIComponent 二次解释。
 */
export function encodeState(state: ShareState): string {
  return compressToBase64(JSON.stringify(state))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export function decodeState(raw: string): ShareState | null {
  if (!raw) return null
  try {
    const b64 = raw.replace(/-/g, '+').replace(/_/g, '/')
    const json = decompressFromBase64(b64)
    if (!json) return null
    return JSON.parse(json) as ShareState
  } catch {
    return null
  }
}

export function buildShareUrl(base: string, state: ShareState): string {
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}${SHARE_PARAM}=${encodeState(state)}`
}

export function readStateFromLocation(search: string): ShareState | null {
  const raw = new URLSearchParams(search).get(SHARE_PARAM)
  return raw ? decodeState(raw) : null
}
