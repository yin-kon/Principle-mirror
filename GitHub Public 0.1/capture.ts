/** F5：把当前 Canvas 画面导出为 PNG（纯前端，无需后端）。 */
export function downloadCanvasPng(
  canvas: HTMLCanvasElement | null,
  filename = 'conceptlens.png',
): boolean {
  if (!canvas) return false
  try {
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    link.remove()
    return true
  } catch {
    return false
  }
}
