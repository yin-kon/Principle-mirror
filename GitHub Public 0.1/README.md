# 原理镜 ConceptLens

> **输入一个学科概念 / 一段教材文字 → 秒级生成「可拖拽、带滑块、实时联动」的交互式原理仿真页。**
>
> 传智杯参赛方向 5「AI 驱动的高交互教育与可视化」参赛作品 ｜ 托管：GitHub Public

---

## 0. 30 秒速览

| 项 | 内容 |
|---|---|
| 一句话 | 把抽象学科原理变成看得懂、玩得动的直觉 |
| 核心决策 | **模板驱动 + AI 适配**：方程来自人工校验的模板库，AI 只做「解析 / 匹配 / 填文案」，绝不现场写数学 |
| 赛期模板 | **3 个 Verified**：简谐振动、抛体·自由落体、波的叠加干涉 |
| 运行形态 | **双模**：默认 `mock` 零 Key 纯前端；可选 `proxy` 走 Node 云函数调真实 LLM |
| 技术栈 | React 18 + TypeScript + Vite + Zustand + Canvas2D + math.js + lz-string |
| 复现成本 | **Windows 零安装**：仓库自带 `tools/node/`（Node 22.22.2 + npm 10.9.7 + pnpm 9.15.4）与根目录 4 个 `.cmd` 转发器，`cd /d` 进仓库根后直接 `pnpm i --frozen-lockfile && pnpm dev`；其他系统仍需 Node ≥20 |
| 明确不做 | Attention / Transformer 可视化、生成考试题、替代真实实验设备 |

**当前阶段说明（重要）**：仓库已完成 **S0 + S1 = W1 + S2 = W2 + S3 = W3**，**F1→F5 全链路闭环**：概念输入 → 结构化解析 → 模板匹配 / 适配 → 实时交互 → 分享链接 / iframe / PNG 导出。`pnpm dev` 可直接体验；低置信度人工确认；教材「45°」自动换算为 `0.79 rad`；分享状态用 lz-string + base64url 写进 URL，他人打开链接即可还原（US-3 已实测）。剩余工作为 S4 校验/Demo 打磨与 S5 提交材料；完整可运行态以交付 tag `v1.0-submit` 为准。业务模块按「一次 AI 对话 / 一个功能模块 = 一次 commit」逐次提交，首个 commit 不含 `src/`，满足官方 2.1「禁止一次性提交」。

---

## 1. 10 分钟极速复现指南

> 目标：在**全新环境**下，从 clone 到跑通 ≤10 分钟。默认 `mock` 模式**不需要任何 API Key、不需要后端、不需要 Python**。

### 1.1 环境配置（≤2 分钟）

> **Windows 评审零安装**：仓库随代码分发了 `tools/node/` 便携运行时（约 116 MB，Windows x64），并在仓库根放了 4 个 `.cmd` 转发器。Windows CMD 查找命令时**优先搜索当前目录**，所以 `cd /d` 进仓库根后 `node` / `npm` / `npx` / `pnpm` 直接可用 —— 不必安装 Node、不必配 PATH、不必用 corepack。

| 依赖 | 版本要求 | 说明 |
|---|---|---|
| 便携运行时（随仓库分发） | Node `v22.22.2` / npm `10.9.7` / pnpm `9.15.4` | `tools/node/` + 根目录 `node.cmd` / `npm.cmd` / `npx.cmd` / `pnpm.cmd`；CMD 进入仓库根即生效 |
| Node.js（仅非 Windows / 运行时缺失时） | **20 LTS 及以上** | `package.json` 的 `engines.node` 为 `>=20` |
| pnpm（仅上述情况） | **9.15.4**（`packageManager` 锁定） | `npm i -g pnpm@9.15.4`；corepack 不在分发范围内 |
| Git | 2.x | 用于 clone 与查看细粒度提交历史 |
| 浏览器 | Chrome / Edge 最新版 | Canvas2D 渲染，无需 WebGL |

```cmd
cd /d "E:\传智杯作品\GitHub Public"
node -v                 # v22.22.2
npm -v                  # 10.9.7
pnpm -v                 # 9.15.4
```

> 上面三条分别命中仓库根的 `node.cmd` / `npm.cmd` / `pnpm.cmd`，再由它们转调到 `tools/node/` 里的真实可执行文件。

**Windows 评审环境提示**
- 路径含空格必须加引号（CMD 下用 `cd /d "E:\传智杯作品\GitHub Public"`）。
- `.gitattributes` 已把 `tools/node/**` 标记为原样存储（不做换行规范化），根目录转发器 `.cmd` 在 Windows 检出为 CRLF。
- 若报「`'node'` / `'npm'` / `'pnpm'` 不是内部或外部命令」：先确认当前目录是仓库根（`dir node.cmd npm.cmd pnpm.cmd`），再确认 `tools\node\node.exe` 存在。若 `tools/node/` 没随仓库复制过来（例如只拷了源码），按上表自行安装 Node 20 LTS（`.msi` 勾选 Add to PATH，或 `winget install OpenJS.NodeJS.LTS`）+ `npm i -g pnpm@9.15.4`，装完关闭并重新打开 CMD。用 `where node` 可确认命中位置。
- 整个流程**不依赖 corepack**；较新 Node 版本已不再随附它，无需修复。

### 1.2 依赖清单（≤3 分钟）

```bash
git clone https://github.com/yin-kon/Principle-mirror.git conceptlens
cd conceptlens
pnpm i --frozen-lockfile
```

> `pnpm-lock.yaml` 已随 S1 入库并冻结依赖树（官方 2.2 复现性要求）。**请勿用 `npm install` 改写锁文件。**

依赖清单（精确版本见 `package.json`）：

| 类别 | 包 | 用途 |
|---|---|---|
| 运行时 | `react` / `react-dom` 18.3.1 | UI |
| 运行时 | `zustand` 4.5.5 | 参数与仿真状态管理 |
| 运行时 | `mathjs` 12.4.2 | `invariants` 边界 / 守恒断言与方程求值 |
| 运行时 | `lz-string` 1.5.0 | 分享链接 URL-safe 状态编码（F5，已接入） |
| 构建 | `vite` 5.4.10 / `typescript` 5.6.3 / `@vitejs/plugin-react` 4.3.3 | 构建与类型约束 |
| 测试 | `vitest` 2.1.4 | 不变量 / 解析匹配 / 分享链接三类单测 |

### 1.3 环境变量模板（≤1 分钟）

```bash
cp .env.example .env.local      # Windows PowerShell: Copy-Item .env.example .env.local
```

**默认 `mock` 模式下这一步可以跳过**——不改任何字段即可跑通 F1–F5 全链路。字段逐项说明：

| 字段 | 示例 | 说明 |
|---|---|---|
| `VITE_LLM_MODE` | `mock` | **默认，无需 Key 即可跑通**；`proxy` 走云函数调真实 LLM |
| `VITE_LLM_PROXY_URL` | `/api/orchestrate` | proxy 模式的云函数地址 |
| `VITE_LLM_API_KEY` | *(空)* | BYOK，仅写在本地 `.env.local`，**绝不入库**；proxy 模式应放服务端 env |
| `VITE_SHARE_BASE_URL` | `http://localhost:5173` | F5 分享链接前缀 |
| `VITE_ENABLE_OCR` | `false` | OCR 入口开关，赛期默认关以减小复现依赖 |
| `VITE_APP_ENV` | `dev` | 环境标记 |

> `.env.local` 已被 `.gitignore` 忽略。演示视频与技术文档中的 Key 一律脱敏或使用 mock。

### 1.4 启动（≤1 分钟）

```bash
pnpm dev                # 默认 mock，零 Key，打开 http://localhost:5173
pnpm dev:proxy          # 可选：proxy 模式（需自行配置云函数与服务端 Key）
pnpm build && pnpm preview   # 生产构建预览
```

### 1.5 验证步骤（≤3 分钟，打勾式）

> **S3 结束状态**：7 项全部可用并有真实验证输出（`P1/P2/P3-runtime.../assets/verify-output.txt`）；US-3 分享链接还原经 CDP 实测通过。

- [x] 1. `pnpm dev` 启动成功，浏览器打开 `http://localhost:5173`
- [x] 2. 手动切换 **3 个模板**（简谐振动 / 抛体·自由落体 / 波的叠加干涉），均可正常渲染
- [x] 3. 拖动滑块实时重算；抛体模板拖拽红色初速度矢量；播放 / 暂停 / 重置 / 0.5×–2× 速度可用
- [x] 4. 输入「简谐运动为什么是正弦曲线」→ 自动解析并命中模板，生成交互页；教材 45° 自动换算为 0.79 rad
- [x] 5. 生成分享链接，在新标签页打开可**完整还原**模板与参数状态（US-3）；可复制 iframe、下载 PNG 截图
- [x] 6. `pnpm test` **25/25 通过**；`pnpm run verify:templates` 方程 hash 白名单通过
- [x] 7. `pnpm typecheck` 与 `pnpm build` 均无错误

### 1.6 FAQ

| 问题 | 处理 |
|---|---|
| `'node'` / `'npm'` / `'pnpm'` 不是内部或外部命令（Win11 CMD） | 先 `cd /d` 进仓库根（根目录有 4 个转发器），确认 `tools\node\node.exe` 存在；若运行时缺失，按 §1.1 装 Node 20 LTS + `npm i -g pnpm@9.15.4`。用 `where node` 查命中位置 |
| `'corepack' 不是内部或外部命令` | 无需修复：仓库不依赖 corepack，见 §1.1 |
| 端口 5173 被占用 | `pnpm dev -- --port 5174`，同时把 `VITE_SHARE_BASE_URL` 改成对应端口 |
| 想完全离线跑 | 保持 `VITE_LLM_MODE=mock`；F1–F5 全链路不需要网络与 Key |
| 测试报 `EPERM` 临时目录错误 | 仓库已配 `vitest.config.ts` 单 fork 运行，默认 `pnpm test` 不受影响 |
| 想看真实 LLM 调用 | 切 `proxy` 并部署 `api/orchestrate.ts` 云函数，Key 放服务端 env |
| 分享链接打不开 | 确认整串 `?s=` 未被截断；编码只含 `[A-Za-z0-9_-]`，不需额外转义 |
| 中文路径 / CRLF 导致 diff 异常 | 使用正斜杠 + 引号；仓库 `.gitattributes` 已统一 LF |
| 构建提示 chunk >500 KB | mathjs 是有意的数值计算依赖，已在 `vite.config.ts` 标注为非阻断项 |
| 视频 / 录屏素材在哪 | 工作台 `视频素材/` 统一存放；大文件走 Release / 外链，索引见《提交合规清单》附录 A |

### 1.7 复现性声明

1. **依赖可复现**：`package.json` 锁精确版本，`pnpm-lock.yaml` **已入库**冻结依赖树，`--frozen-lockfile` 安装。
2. **环境可复现**：单一 Node 运行时（**弃用 Python/FastAPI 与常驻 Fastify 双进程**），无 CORS/SSE 联调，环境变量模板齐全。
3. **行为可复现**：仿真方程来自固定模板而非 LLM 现场生成 → 同输入必得同结果；`mock` 离线预录；`invariants` 即**可执行规格**；教材单位经 `src/ai/unit.ts` 确定性换算；分享状态经 URL-safe 编码可逆还原。
4. **过程可复现**：细粒度 Git 提交 ↔ `docs/ai-prompts/` 三条 Prompt 链 ↔ 演示视频时间点，三向映射见《提交合规清单》附录 B。

---

## 2. 项目结构

```
conceptlens/
├── README.md                      # 本文件：10 分钟极速复现指南
├── 使用教程.txt                    # 纯文本版：应用打开方法 + 界面使用说明
├── CONTRIBUTING.md                # 【2.1】留痕规范：commit 粒度 / Prompt 快照 / AI 禁改区
├── .env.example  .gitignore  .gitattributes  LICENSE  pnpm-lock.yaml
├── package.json  tsconfig.json  vite.config.ts  vitest.config.ts  index.html
├── node.cmd  npm.cmd  npx.cmd  pnpm.cmd       # 根目录转发器（CMD 优先搜索当前目录）
├── tools/node/                     # 随仓库分发的 Windows 便携 Node/npm/npx/pnpm（零安装复现）
├── docs/
│   ├── prd/原理镜_ConceptLens_PRD技术方案.md      # PRD v1.1（模板口径 3 个）
│   ├── compliance/提交合规清单.md                   # 【2.1/2.2/2.3】逐项打勾清单
│   ├── ai-prompts/                                 # 【2.1 核心资产】P1 / P2 / P3 三条链
│   ├── tech/                                       # 技术文档源 + PDF（23 页）+ images/
│   └── video/                                      # 分镜脚本 / 口播文案 / 录屏指引（S5）
├── src/
│   ├── templates/          # 【AI 禁改区】schema / registry / invariants / verified/*.json（3 个）
│   ├── runtime/            # 通用运行时：store / evaluator / SimRuntime / renderers×3 / controls×2
│   ├── ai/                 # types / mock / parseConcept / matchTemplate / unit / prompt / adaptNarrative
│   ├── export/             # shareLink（lz-string + base64url）/ iframe / capture
│   ├── ui/                 # TemplatePicker / InputPanel / ExportPanel
│   └── App.tsx  main.tsx  styles.css  types/lz-string.d.ts
├── api/orchestrate.ts              # 可选 proxy 云函数（Key 仅服务端，不进默认复现路径）
├── scripts/{verify-templates.mjs, template-hashes.json}   # 方程 hash 白名单
├── tests/{invariants,parser-matcher,share-link}.test.ts   # 25 条可执行规格单测
└── .github/workflows/ci.yml        # frozen-lockfile → verify → typecheck → test → build
```

---

## 3. 提交合规索引（比赛官方 2.1 / 2.2 / 2.3）

| 官方条款 | 本仓库对应物 |
|---|---|
| 2.1 细粒度 Git 历史 | `git log --oneline`（≥28 条）；首个 commit 仅文档/规范/脚手架，**无 `src/` 业务代码** |
| 2.1 ≥3 条完整 Prompt 链 | `P1-runtime/` `P2-parser-matcher/` `P3-adapter-export/` 五个文件齐备；**03 均为真实单轮 fix，多轮引导待用户参与补录** |
| 2.2 复现性声明 | 本文件 §1 |
| 2.3 演示视频 | 用户自行录制 MP4 1080p；素材统一存放在工作台 `视频素材/`；AI 产出 `docs/video/` 脚本与文案 |
| 2.3 技术文档（PDF ≤30 页） | `docs/tech/`（v0.3 修订版，23 页，含 3 张真实运行截图），最终提交件另存于 `作品接提交/` |

> 逐项打勾与证据位置见 `docs/compliance/提交合规清单.md`。

---

## 4. 许可证

MIT，见 `LICENSE`。
