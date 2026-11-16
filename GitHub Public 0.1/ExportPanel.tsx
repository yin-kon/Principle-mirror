import { useState } from 'react'
import { useSimStore } from '../runtime/store'
import { getTemplate } from '../templates/registry'
import { buildShareUrl, type ShareState } from '../export/shareLink'
import { buildIframeCode } from '../export/iframe'
import { downloadCanvasPng } from '../export/capture'
import { streamNarrative } from '../ai/adaptNarrative'

/** F5 导出与分享：分享链接 / iframe / PNG 截图 + ③段适配文案流式生成。 */
export function ExportPanel() {
  const [link, setLink] = useState('')
  const [iframeCode, setIframeCode] = useState('')
  const [narrative, setNarrative] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [message, setMessage] = useState('')

  const generate = () => {
    const s = useSimStore.getState()
    const tpl = getTemplate(s.templateId)
    const state: ShareState = {
      templateId: s.templateId,
      params: { ...s.params },
      t: Number(s.t.toFixed(2)),
      narrative: tpl.narrative,
    }
    const url = buildShareUrl(window.location.origin + window.location.pathname, state)
    setLink(url)
    setIframeCode(buildIframeCode(url))
    setMessage('已生成分享链接；在新标签打开即可还原当前交互状态（US-3）。')
  }

  const copy = async (text: string, label: string) => {
    if (!text) {
      setMessage('请先生成分享链接。')
      return
    }
    try {
      await navigator.clipboard.writeText(text)
      setMessage(`${label}已复制到剪贴板。`)
    } catch {
      setMessage('复制失败，请手动选中下方文本复制。')
    }
  }

  const capture = () => {
    const ok = downloadCanvasPng(document.querySelector('canvas'))
    setMessage(ok ? 'PNG 截图已开始下载。' : '截图失败：未找到画布。')
  }

  const stream = async () => {
    if (streaming) return
    const tpl = getTemplate(useSimStore.getState().templateId)
    setStreaming(true)
    setNarrative('')
    for await (const chunk of streamNarrative(tpl.narrative, 10, 16)) {
      setNarrative((prev) => prev + chunk)
    }
    setStreaming(false)
    setMessage('适配文案流式生成完成（mock 模式，零 Key、零网络）。')
  }

  return (
    <section className="card export-card">
      <h2><i>4</i> 导出与分享</h2>

      <div className="export-actions">
        <button className="btn primary generate-btn" onClick={generate}>生成分享链接</button>
        <button className="btn" onClick={() => copy(link, '分享链接')}>复制链接</button>
        <button className="btn" onClick={() => copy(iframeCode, 'iframe 代码')}>复制 iframe</button>
        <button className="btn" onClick={capture}>下载 PNG 截图</button>
        <button className="btn" onClick={stream} disabled={streaming}>
          {streaming ? '生成中…' : '流式生成原理说明'}
        </button>
      </div>

      {link && (
        <label className="export-field">
          <span>分享链接（含完整状态，URL-safe 编码）</span>
          <input className="export-link" readOnly value={link} onFocus={(e) => e.target.select()} />
        </label>
      )}
      {iframeCode && (
        <label className="export-field">
          <span>iframe 嵌入代码</span>
          <textarea className="export-code" readOnly rows={2} value={iframeCode} onFocus={(e) => e.target.select()} />
        </label>
      )}
      {narrative && (
        <div className="stream-box">
          <small>③段适配生成（流式）</small>
          <p>{narrative}{streaming && <span className="caret">▍</span>}</p>
        </div>
      )}
      {message && <p className="input-msg">{message}</p>}
    </section>
  )
}
