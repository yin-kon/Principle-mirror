/** 教材单位 → 模板单位换算（确定性逻辑，人工校验；不依赖 LLM）。
 * 教材常用「45° / deg」，而模板 theta 的 unit 是 rad；
 * 不做换算会被 schema 的 min/max 截断成 1.52 rad（≈87°），导致轨迹明显错位。 */

export function toRadians(value: number, unit?: string): number {
  if (!unit) return value
  const u = unit.toLowerCase().replace(/[°度]/g, 'deg').trim()
  if (u === 'deg' || u === 'degree' || u === 'degrees') {
    return (value * Math.PI) / 180
  }
  if (u === 'rad' || u === 'radian' || u === 'radians') return value
  return value
}

/** 按模板参数声明的目标单位换算；未声明目标单位时原样返回。 */
export function convertValue(
  value: number,
  fromUnit: string | undefined,
  toUnit: string | undefined,
): number {
  const target = (toUnit ?? '').toLowerCase()
  if (target.includes('rad')) return toRadians(value, fromUnit)
  return value
}
