import { useEffect, useState } from 'react'
import { useSimStore } from './runtime/store'
import { getTemplate } from './templates/registry'
import { readStateFromLocation } from './export/shareLink'
import { TemplatePicker } from './ui/TemplatePicker'
import { InputPanel } from './ui/InputPanel'
import { ExportPanel } from './ui/ExportPanel'
import { ParamSlider } from './runtime/controls/ParamSlider'
import { PlaybackControls } from './runtime/controls/PlaybackControls'
import { SimRuntime } from './runtime/SimRuntime'

export default function App() {
  const templateId = useSimStore((s) => s.templateId)
  const params = useSimStore((s) => s.params)
  const warnings = useSimStore((s) => s.warnings)
  const setParam = useSimStore((s) => s.setParam)
  const setTemplate = useSimStore((s) => s.setTemplate)
  const setTime = useSimStore((s) => s.setTime)
  const [restored, setRestored] = useState(false)
  const tpl = getTemplate(templateId)
  const allOk = warnings.length > 0 && warnings.every((w) => w.ok)

  // US-3：他人打开分享链接时，从 ?s= 还原模板 / 参数 / 时间
  useEffect(() => {
    const state = readStateFromLocation(window.location.search)
    if (!state) return
    try {
      getTemplate(state.templateId) // 校验链接里的模板确实存在
      setTemplate(state.templateId)
      for (const [key, value] of Object.entries(state.params)) setParam(key, value)
      setTime(state.t)
      setRestored(true)
    } catch {
      // 非法链接静默忽略，保持默认状态
    }
  }, [setTemplate, setParam, setTime])

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◉</span>
          <div>
            <h1>原理镜 <span>ConceptLens</span></h1>
            <p>把抽象原理，变成可以动手探索的直觉</p>
          </div>
        </div>
        <div className="badges">
          <span className="badge">模板驱动 + AI 适配</span>
          <span className="badge soft">3 个 Verified 模板</span>
          <span className="badge soft">mock · 零 Key</span>
          {restored && <span className="badge restored">✓ 已从分享链接还原</span>}
        </div>
      </header>

      <div className="layout">
        <aside>
          <section className="card">
            <h2><i>1</i> 选择原理</h2>
            <TemplatePicker />
          </section>

          <section className="card">
            <h2><i>2</i> 调整参数</h2>
            <div className="params">
              {tpl.params.map((spec) => (
                <ParamSlider
                  key={spec.key}
                  spec={spec}
                  value={params[spec.key]}
                  onChange={(v) => setParam(spec.key, v)}
                />
              ))}
            </div>
            <p className="hint">拖动滑块即实时重算；抛体模板还能直接拖拽红色初速度矢量。</p>
          </section>

          <section className="card">
            <h2><i>3</i> 正确性校验</h2>
            <div className={`guard ${allOk ? 'ok' : 'bad'}`}>
              <div className="guard-head">
                {allOk ? '✓ 不变量全部通过' : '⚠ 不变量告警'}
                <span>可执行规格 · 非 AI 自评</span>
              </div>
              {warnings.map((w) => (
                <div className="guard-row" key={w.name}>
                  <span className={w.ok ? 'pass' : 'fail'}>{w.ok ? '✓' : '✗'} {w.name}</span>
                  <code>{w.detail}</code>
                </div>
              ))}
            </div>
            <p className="hint">
              方程 / invariants / render 为 AI 禁改区；任何改动都会被方程 hash 白名单与 CI 拦下。
            </p>
          </section>
        </aside>

        <main>
          <InputPanel />
          <section className="card stage">
            <div className="stage-head">
              <div>
                <h3>{tpl.title}</h3>
                <small>{tpl.subject} · 渲染器 <code>{tpl.render.type}</code> · {tpl.templateId}</small>
              </div>
              <code className="equation">{tpl.equation}</code>
            </div>
            <div className="canvas-wrap">
              <SimRuntime />
            </div>
            <PlaybackControls />
          </section>

          <ExportPanel />

          <section className="card narrative">
            <h2>原理说明</h2>
            <p>{tpl.narrative}</p>
            <div className="tags">
              {tpl.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          </section>

          <p className="footnote">
            S3 = W3：F1 概念输入 → F2 结构化解析 → F3 模板匹配 / 适配 → F4 实时交互 → F5 分享链接 / iframe / PNG 导出 已全链路闭环。
            当前为纯前端 mock 模式，无需 API Key；方程全部来自人工校验的模板库，不由大模型现场生成；教材角度自动从 deg 换算为 rad；分享状态用 lz-string + URL-safe 编码写进链接，无需服务端存储。
          </p>
        </main>
      </div>
    </div>
  )
}
