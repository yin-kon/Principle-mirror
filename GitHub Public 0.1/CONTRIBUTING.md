# 贡献与留痕规范（CONTRIBUTING）

> 本文件是比赛官方 2.1「代码仓库与演进记录」的**强制约束**。
> 核心理由：**细粒度提交历史与 Prompt 链是过程性产物，事后补不出来。** 必须先立规范，再写第一行业务代码。

---

## 1. 为什么有这份规范

官方明确要求：
- 保留**完整、细粒度的 Git 提交历史**，**禁止一次性提交**（`initial commit` 即包含全部功能）；
- 每次提交应对应**一次与 AI 的核心对话**或**一个功能模块的落地**；
- 导出 AI 对话历史（工具不支持导出可截图/录屏），且**至少 3 个核心功能迭代的完整 Prompt 链**，每条含「你的提问 + AI 的修改建议 + 你如何引导 AI 修复 Bug 的过程」。

这些证据只能与编码**同步产生**。一次性提交、事后补文档、倒推 Prompt 链都会直接失分。因此本规范对提交粒度、命名、快照采集时点做了硬性约定。

---

## 2. commit 粒度（硬规则）

- **一次与 AI 的核心对话 = 1 个 commit**；**一个功能模块落地 = 1 个 commit**。二者都不得合并成"大杂烩"提交。
- 单条 commit 建议 ≤ ~200 行有效改动、单一职责。
- **禁止 `git add -A` 无差别提交**；按文件/模块显式暂存。
- **显式禁止**任何包含全部功能的 `initial commit`。
- **首个 commit 白名单**（仅以下内容，不含 `src/` 业务代码）：
  `MEMORY.md`、`docs/compliance/提交合规清单.md`、`docs/ai-prompts/README.md`、
  `CONTRIBUTING.md`、`README.md`(骨架)、`PRD v1.1`、`.gitignore`、`.env.example`、
  `.gitattributes`、`LICENSE`、`package.json`(空壳)、`tsconfig.json`、`vite.config.ts`、
  `pnpm-lock.yaml`、`.github/workflows/ci.yml`。
  验收：`git show --stat <first>` 中**不得出现 `src/` 业务代码**。
- **坏 commit 必须保留**：修 Bug 时先提交一个能复现失败的中间 commit（红测试 / 失败断言 / 界面异常），再用紧随其后的独立 commit 修复，形成 `坏 commit → 诊断对话 → 修好 commit` 可审计链，**不要 squash、不要 amend 抹掉**。

---

## 3. commit message 格式

```
<type>(<scope>): <中文简述> [阶段/F#/P#/链标记]
```

- `type`：`chore` / `docs` / `feat` / `fix` / `test` / `perf` / `refactor` / `release`
- 示例：
  - `feat(runtime): 实现通用仿真运行时与 wave_2d 渲染器 [W1/F4/P1]`
  - `fix(export): 修复分享链接特殊字符解析错乱（URL-safe 编码）[W3/F5/P3/链3修Bug]`
- **修 Bug 的 commit 必须带 `[P#]` 标记**，便于 `git log --grep=P3 --oneline` 反查 hash，回填到 `docs/ai-prompts/P#-*/00-meta.md` 与合规清单附录 B。
- 所有 message 用简体中文，便于评审阅读。

---

## 4. Prompt 快照：采集时点（关键）

顺序不得颠倒：

1. **写模块之前**：先建 `docs/ai-prompts/P#-*/` 目录与 `00-meta.md`，登记预期 message、对应功能模块、阶段、采集方式。
2. **对话一结束立刻落盘**：`01-initial-prompt.md`、`02-ai-response.md`、`03-bugfix-dialogue.md`、`04-outcome.md` 与 `assets/`。
3. **快照与代码同一个 commit 提交** —— 这是证明"同步产生、非事后补"的关键，禁止"最后统一补文档"。

> 配套：CI 对「无 `docs/ai-prompts/` 变更的 `feat` commit」给出 warning，提醒补采快照。

---

## 5. Prompt 快照：三种采集方式

| 方式 | 适用场景 | 产物 |
|---|---|---|
| **导出（最佳）** | AI 工具支持导出对话，P1/P2 全链 | `assets/chat-export.json` / `.md`，可 diff、最完整 |
| **截图（替代）** | 工具不支持导出（官方 2.1 明确允许） | `assets/chat-turn-01.png`… 逐轮带时间戳，须覆盖提问与 AI 建议 |
| **录屏（必须 ≥1 条）** | 「引导 AI 修 Bug」多轮 + 演示视频素材 | `assets/bug-repro.mp4`，同时满足 2.1 与 2.3 |

- 导出/截图满足 2.1「对话历史快照」；录屏额外满足 2.3「≥2 分钟 AI 协同过程复现展示」。
- **P3 链必须录屏**，它是演示视频与技术文档的主素材。

---

## 6. 每条 Prompt 链的固定文件（齐全才算"完整"）

目录命名：`docs/ai-prompts/P<序号>-<主题>/`，序号对应开发时序；目录名进 commit message 的 `[P#]` 标记。

| 文件 | 必须包含 |
|---|---|
| `00-meta.md` | 链编号、对应功能模块、阶段、采集方式、日期、视频时间点、复核人；**commit 定位用反查命令**，不硬编码 hash |
| `01-initial-prompt.md` | **你的 Prompt 提问**全文，含注入的上下文（PRD 片段、模板 schema、AI 禁改清单） |
| `02-ai-response.md` | **AI 的修改建议**全文（方案、代码、理由），**保留被否决/未采纳的版本** |
| `03-bugfix-dialogue.md` | **引导 AI 修 Bug 全过程**：现象描述 → AI 第一轮建议 → 我补充最小复现/约束 → AI 二次修正 → 断言/测试转绿；逐轮时间戳与录屏对应 |
| `04-outcome.md` | 最终落地结果、改动文件清单、`pnpm test` 结果、经验复用点 |
| `assets/` | 逐轮截图、对话导出原文、`bug-repro.mp4` |

**hash 绑定办法**（解决"先有 hash 还是先写 meta"）：
1. 快照文件与模块代码**同 commit** 提交，message 带 `[P#]`；
2. `00-meta.md` 只写 `git log --grep=P# --oneline` 反查命令 + "见索引表"；
3. S5 用一条轻量 `docs(prompts): 回填各链 commit hash 索引` 集中回填短 hash，不破坏功能提交粒度；
4. 《提交合规清单》附录 B 维护「commit ↔ Prompt 链 ↔ 视频时间点」三向映射。

---

## 7. 三条链的分工（≥3 条，均须含提问 + AI 建议 + 引导修 Bug）

| 链 | 模块 | 阶段 | 作用 | 视频时间点 |
|---|---|---|---|---|
| **P1-runtime** | 通用仿真运行时 / 渲染器（F4） | W1 | 满足「输入 Prompt 让 AI 生成核心模块」；修 Bug 备选：滑块高频 onChange 掉帧 | 02:30–03:10 |
| **P2-parser-matcher** | 概念解析 + 模板匹配（F2/F3） | W2 | 含 1 个真实修 Bug 多轮（deg/rad 单位混用导致干涉相位错位） | — |
| **P3-adapter-export** | 适配生成 + 分享导出（F5） | W3 | **主素材：完整引导修顽固 Bug，必须录屏 ≥2 分钟** | 03:10–04:40 |

---

## 8. 刻意制造并留存「引导 AI 修 Bug」的可录屏素材

### 选材原则
Bug 必须**真实存在于某个中间 commit**（录屏里能看到界面异常 / `invariants` 断言红 / 测试失败），不是演出来的。推荐三选一（主用 B）：

- **A（P2）**：干涉模板在 φ≠0 时相位错位、能量不守恒 → 引导 AI 定位到 **deg/rad 单位混用**。
- **B（P3，主推）**：分享链接用 `encodeURIComponent(JSON)`，参数含 `+` / `%` 时还原错乱 → 引导 AI 换成 **lz-string + URL-safe 编码**。
- **C（P1）**：滑块高频 onChange 掉帧 / 闭包读到旧值 → 引导 AI 用 `requestAnimationFrame` + Zustand 选择器修复。

### 录制脚本（保证"引导过程"可见，而非只给结果）
1. 0:00 **复现现象**（打开含特殊参数的分享链接 → 状态错乱 / 断言飘红）；
2. 把现象描述给 AI —— **只给现象与最小复现，不给结论**，录到 `01`/`03`；
3. AI 给第一轮建议 → **当场验证并指出为何不够**（如"没考虑 `+` 被解析成空格"），追加约束/最小复现用例；
4. AI 二次修正 → `pnpm test` / invariant 断言**转绿**；
5. 全程录屏，逐轮时间戳与 `03-bugfix-dialogue.md` 一一对应。

### 留存闭环
`bug-repro.mp4` → `03-bugfix-dialogue.md` → 坏/好两个 `[P3]` commit → S5 剪入演示视频 03:10–04:40 → 技术文档 3.4 引用多轮对话节选 → 合规清单附录 B 登记映射。

---

## 9. AI 禁改区与技术约束

模板库是「模板驱动 + AI 适配」的信任根，**`equation` / `invariants` / `render` 为 AI 禁改区**：

1. `src/templates/schema.ts` 用 TS 只读类型 + `Object.freeze`；
2. `scripts/verify-templates.mjs` 对 `equation` 做 **hash 白名单**校验；
3. `.github/workflows/ci.yml` 卡口，越界即构建失败；
4. 运行时 `invariants` / math.js 断言（如 `x_max ≈ A`、能量守恒误差 < 阈值）。

给 AI 的每次对话须前置注入该禁改清单，并在 Prompt 中明确：
> 「你不得修改 `equation` 字段，只能返回白名单字段，越界即视为无效输出。」

这一约束同时是技术文档第 4 章「架构设计与如何约束 AI」的核心证据，也是演示视频 04:40–05:00 的点题素材。

---

## 10. 其他约定
- 全中文 message；`.gitattributes` 统一换行（Windows 评审环境注意 CRLF）。
- `.env.local` 绝不入库（`.gitignore` 忽略）；LLM Key 仅本地或服务端 proxy 持有；录屏用 mock 或脱敏 Key。
- 若多人协作：每人每模块一次 commit，需在 PR 描述中注明对应 `[P#]` 与对话快照路径。
- 每阶段结束与提交前，更新 `docs/compliance/提交合规清单.md` 并同步 `.workbuddy/memory/MEMORY.md`。
