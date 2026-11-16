/**
 * 方程 hash 白名单 + 模板结构校验（CI 卡口，纯 Node 内置模块，无需安装依赖即可运行）
 *
 * 这是「信任边界四重约束」的第 2、3 层：
 *   TS 只读 + Object.freeze（编译/运行时） → 本脚本 hash 白名单 → CI 卡口 → 运行时 math.js 断言。
 * 只校验「方程有没有被改」，数值正确性由 tests/invariants.test.ts 的可执行规格负责。
 */
import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'src', 'templates', 'verified')
const HASH_FILE = join(ROOT, 'scripts', 'template-hashes.json')
const VALID_RENDERERS = new Set(['wave_2d', 'particle', 'superposition'])
const EXPECTED_COUNT = 3 // 全项目口径：只做 3 个 Verified

const errors = []
const pass = (msg) => console.log(`  \x1b[32mPASS\x1b[0m ${msg}`)
const fail = (msg) => { errors.push(msg); console.log(`  \x1b[31mFAIL\x1b[0m ${msg}`) }

console.log('原理镜 · Verified 模板校验')
console.log('─'.repeat(56))

if (!existsSync(HASH_FILE)) {
  fail('缺少方程 hash 白名单 scripts/template-hashes.json')
} else {
  pass('方程 hash 白名单文件存在')
}

const whitelist = existsSync(HASH_FILE)
  ? JSON.parse(readFileSync(HASH_FILE, 'utf8'))
  : {}

const files = readdirSync(DIR).filter((f) => f.endsWith('.json')).sort()
if (files.length !== EXPECTED_COUNT) {
  fail(`模板数量应为 ${EXPECTED_COUNT}，实际 ${files.length}（口径统一为 3 个 Verified）`)
} else {
  pass(`模板数量 = ${EXPECTED_COUNT}（口径一致）`)
}

for (const file of files) {
  console.log(`\n[${file}]`)
  let tpl
  try {
    tpl = JSON.parse(readFileSync(join(DIR, file), 'utf8'))
  } catch (e) {
    fail(`JSON 解析失败：${e.message}`)
    continue
  }

  const required = ['templateId', 'subject', 'tags', 'title', 'params', 'equation', 'render', 'invariants', 'narrative']
  const missing = required.filter((k) => tpl[k] === undefined)
  missing.length ? fail(`缺少字段：${missing.join(', ')}`) : pass('schema 必填字段齐全')

  if (typeof tpl.equation !== 'string' || !tpl.equation.includes('=')) {
    fail('equation 必须是可求值赋值式，如 "x = A * cos(...)"')
  } else {
    pass('equation 格式合法')
  }

  if (!Array.isArray(tpl.params) || tpl.params.length === 0) {
    fail('params 必须是非空数组')
  } else {
    let bad = false
    for (const p of tpl.params) {
      if (!(p.min < p.max) || !(p.default >= p.min && p.default <= p.max)) {
        fail(`参数 ${p?.key} 的 min/max/default 区间非法`)
        bad = true
      }
    }
    if (!bad) pass(`params ${tpl.params.length} 项区间合法`)
  }

  if (!tpl.render || !VALID_RENDERERS.has(tpl.render.type)) {
    fail(`render.type 非法：${tpl.render?.type}`)
  } else {
    pass(`render.type = ${tpl.render.type}`)
  }

  if (!Array.isArray(tpl.invariants) || tpl.invariants.length === 0) {
    fail('invariants 不得为空（可执行规格是判据来源）')
  } else {
    pass(`invariants ${tpl.invariants.length} 条`)
  }

  const digest = createHash('sha256').update(String(tpl.equation), 'utf8').digest('hex')
  const expected = whitelist[tpl.templateId]
  if (!expected) {
    fail(`白名单中无 ${tpl.templateId} 的方程基线（禁止擅自新增模板）`)
  } else if (digest !== expected) {
    fail(`方程被改动！${tpl.templateId}\n    期望 ${expected}\n    实际 ${digest}\n    equation/invariants/render 为 AI 禁改区`)
  } else {
    pass(`方程 hash 匹配 ${digest.slice(0, 12)}…（AI 禁改区未被改动）`)
  }
}

console.log('\n' + '─'.repeat(56))
if (errors.length) {
  console.error(`校验失败：${errors.length} 项\n` + errors.map((e) => `  - ${e}`).join('\n'))
  process.exit(1)
}
console.log('全部通过：3 个 Verified 模板结构合法，方程 hash 白名单一致。')
