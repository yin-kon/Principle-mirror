import { useSimStore } from '../store'

const SPEEDS = [0.5, 1, 2]

export function PlaybackControls() {
  const playing = useSimStore((s) => s.playing)
  const speed = useSimStore((s) => s.speed)
  const t = useSimStore((s) => s.t)
  const setPlaying = useSimStore((s) => s.setPlaying)
  const setSpeed = useSimStore((s) => s.setSpeed)
  const reset = useSimStore((s) => s.reset)

  return (
    <div className="playback">
      <button className="btn primary" onClick={() => setPlaying(!playing)}>
        {playing ? '⏸ 暂停' : '▶ 播放'}
      </button>
      <button className="btn" onClick={reset}>↺ 重置</button>
      <div className="speeds">
        {SPEEDS.map((v) => (
          <button
            key={v}
            className={`chip ${speed === v ? 'active' : ''}`}
            onClick={() => setSpeed(v)}
          >
            {v}×
          </button>
        ))}
      </div>
      <span className="clock">t = {t.toFixed(2)} s</span>
    </div>
  )
}
