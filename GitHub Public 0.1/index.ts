import type { RendererType } from '../../templates/schema'
import type { Renderer } from './shared'
import { drawWave2d } from './wave2d'
import { drawParticle } from './particle'
import { drawSuperposition } from './superposition'

/** render.type → 渲染器。三种渲染器共用同一套 DrawContext，证明通用运行时的通用性。 */
export const RENDERERS: Record<RendererType, Renderer> = {
  wave_2d: drawWave2d,
  particle: drawParticle,
  superposition: drawSuperposition,
}
