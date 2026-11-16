import { TEMPLATES } from '../templates/registry'
import { useSimStore } from '../runtime/store'
import type { RendererType } from '../templates/schema'

const RENDER_LABEL: Record<RendererType, string> = {
  wave_2d: '曲线 · 滑块',
  particle: '轨迹 · 拖拽',
  superposition: '双波 · 联动',
}

export function TemplatePicker() {
  const templateId = useSimStore((s) => s.templateId)
  const setTemplate = useSimStore((s) => s.setTemplate)

  return (
    <div className="picker">
      {TEMPLATES.map((t, i) => (
        <button
          key={t.templateId}
          className={`picker-item ${templateId === t.templateId ? 'active' : ''}`}
          onClick={() => setTemplate(t.templateId)}
        >
          <span className="picker-index">{String(i + 1).padStart(2, '0')}</span>
          <span className="picker-body">
            <b>{t.title}</b>
            <small>{t.subject} · {RENDER_LABEL[t.render.type]} · {t.invariants.length} 条不变量</small>
          </span>
          <span className="picker-check">{templateId === t.templateId ? '✓' : ''}</span>
        </button>
      ))}
    </div>
  )
}
