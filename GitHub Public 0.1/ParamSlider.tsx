import { useEffect, useRef, useState } from 'react'
import type { SimParam } from '../../templates/schema'

interface Props {
  spec: SimParam
  value: number
  onChange: (value: number) => void
}

/**
 * 参数滑块：本地 state 保证拖动即时响应，store 写入用 requestAnimationFrame 节流，
 * 避免高频 onChange 触发整棵 React 树重绘导致掉帧（P1 链的性能设计要点）。
 */
export function ParamSlider({ spec, value, onChange }: Props) {
  const [local, setLocal] = useState(value)
  const frame = useRef<number | null>(null)
  const pending = useRef(value)

  useEffect(() => setLocal(value), [value])
  useEffect(() => () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current)
  }, [])

  const handle = (raw: number) => {
    setLocal(raw)
    pending.current = raw
    if (frame.current !== null) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      onChange(pending.current)
      frame.current = null
    })
  }

  return (
    <label className="param">
      <span className="param-head">
        <span>{spec.label}</span>
        <b>{local.toFixed(2)} <em>{spec.unit}</em></b>
      </span>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={(spec.max - spec.min) / 200}
        value={local}
        onChange={(e) => handle(Number(e.target.value))}
      />
      <span className="param-range">{spec.min} — {spec.max} {spec.unit}</span>
    </label>
  )
}
