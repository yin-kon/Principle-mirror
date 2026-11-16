/** F5：生成可嵌入博客 / 课件的 iframe 代码。 */
export function buildIframeCode(url: string, width = 860, height = 620): string {
  const safe = url
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return `<iframe src="${safe}" width="${width}" height="${height}" frameborder="0" loading="lazy" title="原理镜 ConceptLens 交互仿真"></iframe>`
}
