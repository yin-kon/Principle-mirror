import type { ConceptParse } from './types'

/** mock 模式的离线预录语料：人工核定的解析结果，零 Key、零网络、可稳定重放。 */
export interface MockSample {
  readonly input: string
  readonly parse: Omit<ConceptParse, 'source'>
}

export const MOCK_CORPUS: readonly MockSample[] = [
  {
    input: '简谐运动为什么是正弦曲线',
    parse: {
      subject: '物理',
      concept: '简谐振动',
      variables: [
        { key: 'A', label: '振幅', value: 2, unit: 'm' },
        { key: 'omega', label: '角频率', value: 3, unit: 'rad/s' },
        { key: 'phi', label: '初相', value: 0, unit: 'rad' },
      ],
      relations: ['位移随时间按正弦规律变化', '峰值等于振幅'],
      level: '高中',
      confidence: 0.94,
    },
  },
  {
    // 教材语境常用「度」；模板 theta 需要「弧度」—— W2 的单位换算考点
    input: '以 45° 角斜向上抛出一个小球，初速度 15 m/s，求落点和最高点',
    parse: {
      subject: '物理',
      concept: '抛体运动',
      variables: [
        { key: 'v0', label: '初速度', value: 15, unit: 'm/s' },
        { key: 'theta', label: '抛射角', value: 45, unit: 'deg' },
        { key: 'g', label: '重力加速度', value: 9.8, unit: 'm/s²' },
      ],
      relations: ['水平方向匀速', '竖直方向匀加速', '落地时高度回到零'],
      level: '高中',
      confidence: 0.91,
    },
  },
  {
    input: '两列频率相同的波叠加会发生干涉，相位差决定加强还是减弱',
    parse: {
      subject: '物理',
      concept: '波的叠加干涉',
      variables: [
        { key: 'A1', label: '波1振幅', value: 1.5, unit: 'm' },
        { key: 'A2', label: '波2振幅', value: 1.5, unit: 'm' },
        { key: 'phi', label: '相位差', value: 0, unit: 'rad' },
      ],
      relations: ['叠加位移等于两列波位移之和', '相位差决定相长或相消'],
      level: '高中',
      confidence: 0.93,
    },
  },
]

/** 输入面板的示例按钮 */
export const EXAMPLE_PROMPTS: readonly string[] = Object.freeze(
  MOCK_CORPUS.map((s) => s.input),
)
