import { useState } from 'react'
import { EXAMPLE_PROMPTS } from '../ai/mock'
import { parseConcept, toTemplateParams } from '../ai/parseConcept'
import { matchTemplate } from '../ai/matchTemplate'
import type { ConceptParse, MatchOutcome } from '../ai/types'
import { getTemplate } from '../templates/registry'
import { useSimStore } from '../runtime/store'

/** F1 概念输入 → F2 结构化解析 → F3 模板匹配 → 自动落地（低置信度时人工确认）。 */
export function InputPanel() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ConceptParse | null>(null)
  const [outcome, setOutcome] = useState<MatchOutcome | null>(null)
  const [message, setMessage] = useState('')
  const setTemplate = useSimStore((s) => s.setTemplate)
  const setParam = useSimStore((s) => s.setParam)

  const applyTemplate = (id: string, parse: ConceptParse | null) => {
    setTemplate(id)
    if (parse) {
      const tpl = getTemplate(id)
      const params = toTemplateParams(parse, tpl)
      for (const [key, value] of Object.entries(params)) setParam(key, value)
    }
    setOutcome(null)
    setMessage(`已生成「${getTemplate(id).title}」交互仿真，参数已按教材单位换算后应用。`)
  }

  const run = () => {
    if (!input.trim()) {
      setMessage('请先输入一个学科概念或粘贴一段教材文字。')
      return
    }
    const p = parseConcept(input)
    const o = matchTemplate(p)
    setParsed(p)
    setOutcome(o)
    if (!o.needsConfirm && o.best) {
      applyTemplate(o.best.templateId, p)
    } else {
      setMessage('置信度偏低，未自动落地。请从下方候选模板中手动确认。')
    }
  }

  return (
    <section className="card input-card">
      <h2><i>0</i> 概念输入 · 自动解析匹配</h2>

      <textarea
        className="concept-input"
        rows={3}
        value={input}
        placeholder="输入学科概念或粘贴教材片段，例如：简谐运动为什么是正弦曲线"
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="examples">
        <span>试试：</span>
        {EXAMPLE_PROMPTS.map((text, i) => (
          <button
            key={text}
            className="example-chip"
            onClick={() => setInput(text)}
            title={text}
          >
            示例 {i + 1}
          </button>
        ))}
      </div>

      <div className="input-actions">
        <button className="btn primary run-btn" onClick={run}>解析并生成仿真</button>
        <button className="btn" disabled title="OCR 入口为赛期占位，默认关闭以减小复现依赖">
          拍照 OCR（占位）
        </button>
        <span className="mode-tag">mock · 零 Key</span>
      </div>

      {parsed && (
        <div className="parse-result">
          <div className="parse-head">
            结构化解析结果 <code>source={parsed.source}</code>
            <span>置信度 {(parsed.confidence * 100).toFixed(0)}%</span>
          </div>
          <div className="parse-grid">
            <span>学科</span><b>{parsed.subject}</b>
            <span>概念</span><b>{parsed.concept}</b>
            <span>难度</span><b>{parsed.level}</b>
            <span>变量</span>
            <b>{parsed.variables.length
              ? parsed.variables.map((v) => `${v.label}${v.value !== undefined ? `=${v.value}${v.unit ?? ''}` : ''}`).join('、')
              : '（未识别）'}</b>
            <span>关系</span><b>{parsed.relations.join('；') || '（无）'}</b>
          </div>
        </div>
      )}

      {outcome?.needsConfirm && (
        <div className="confirm">
          <p>匹配置信度偏低，请人工确认模板（AI 不会自动落地）：</p>
          {outcome.topK.map((r) => (
            <button key={r.templateId} className="chip" onClick={() => applyTemplate(r.templateId, parsed)}>
              {getTemplate(r.templateId).title} · {r.score.toFixed(2)}
            </button>
          ))}
        </div>
      )}

      {message && <p className="input-msg">{message}</p>}
    </section>
  )
}
