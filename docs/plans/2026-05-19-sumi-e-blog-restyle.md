# 思辨录博客 → Sumi-e「砚」水墨风 1:1 迁移 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 把 Astro 个人博客（思辨录）的视觉系统从「Typography 衬线」1:1 替换为 Sumi-e「砚」水墨设计语言，保留博客信息架构，组件实现择优映射。

**Architecture:** 三处注入 sumi-e 设计系统——① `user.ts`+`uno.config.js` 让 UnoCSS 生成的基础色/字体 = sumi 纸墨色；② `global.css` 整体替换为 sumi 完整 `:root` token + SVG 滤镜 + 组件类 + 暗色桥接；③ `LayoutDefault.astro` 注入纸纹背景 `.paper-stage` 与全局 SVG 滤镜 defs，组件层改用 sumi 类。sumi 原生 `:root[data-mode="night"]` 全部桥接到博客现有 `html.dark`。所有交互 JS（鼠标墨迹/水波环/笔触描边/印章）挂 `astro:page-load` 兼容 swup 多页过渡。

**Tech Stack:** Astro 5 · UnoCSS（presetWind3 + presetTypography + unocss-preset-theme + presetAttributify + presetIcons）· TypeScript · @swup/astro · Shiki 代码高亮 · 国内镜像代理 Google Fonts

**Source spec（只读，勿改）:** `~/Documents/pe/jixiaxuegong/reports_and_ui_building/ui-ref/web/style-showroom/templates/sumi-e/showcase.html`（7621 行，下称 `SRC`）

---

## 一、关键决策记录（已与用户确认 / 已择优）

| # | 决策点 | 选定方案 | 来源 |
|---|--------|---------|------|
| D1 | 暗色模式 | **双模**：亮=米黄宣纸 / 暗=墨夜；沿用博客现有 `html.dark` 切换；覆盖 CLAUDE.md 旧暗色规范（#1a1a2e） | 用户确认 |
| D2 | 字体加载 | **国内镜像代理 Google Fonts**（字形逐像素 1:1）+ 多级 fallback（主镜像→备镜像→system serif/sans） | 用户确认 |
| D3 | 特效保真 | **全站 1:1 全特效**：含正文边缘墨晕滤镜，最忠实 showcase | 用户确认 |
| D4 | Tweaks 面板 | **去掉**（`swr-twk-*` 是 showroom 调试演示工具，非 sumi 设计语言本身） | 择优 |
| D5 | 纸张变体 | **固定 rice**（`--paper:#faf7ee`），不暴露 hemp/silk/plain 切换 | 择优 |
| D6 | 信息架构 | **保留**博客现有路由/页面（首页/文章/分类/标签/归档/关于），仅换视觉皮肤 | 择优 |
| D7 | 组件映射 | sumi 组件 → 博客 DOM 由本计划逐项指定（见第三节映射表） | 择优 |
| D8 | 代码块 | markdown 代码块走 **sumi 单色墨风**（`--font-mono`+`--paper-shade` 底+`--ink-mid` 字），关闭 Shiki 'dracula' 彩色高亮（与宣纸冲突；showcase 原生 code 即单色墨） | 择优 |

**镜像 URL（D2）：** 主用 `https://fonts.font.im/css2?...`（font.im 国内镜像），备用 `https://fonts.loli.net/css2?...`（中科大 loli.net）。两者均为 Google Fonts CSS API 完整反代，字体文件同源。`@import` 失败时浏览器自动走 `font-family` 链中的 system fallback（已含 Songti SC / PingFang SC 等）。

---

## 二、sumi-e 源码锚点表（执行子 agent 按行号精读 `SRC`，勿全文载入）

| 锚点 | 行号范围 | 内容 |
|------|---------|------|
| A1 字体 @import | 12 | Google Fonts CDN URL（6 字族）→ 改镜像 |
| A2 :root token | 138–198 | 全部 CSS 变量（paper/ink/seal/字体/间距/Tweaks 变量） |
| A3 night 模式 | 201–217 | `:root[data-mode="night"]` 墨夜色 → 桥接 `html.dark` |
| A4 纸变体 | 220–225 | 4 种纸（仅取 rice 默认，其余删） |
| A5 base/selection | 227–243 | body 基础 + `::selection` |
| A6 纸纹背景 | 245–319 | `.paper-stage`/vignette/fibers/mist + `@keyframes mist-drift` |
| A7 布局原语 | 321–346 | main/section/row/col/grid（博客用自己布局，仅借间距 token） |
| A8 section-head/分割线 | 348–444 | `.section-head`/`.brush-divider`/`@keyframes brush-draw`/`.mini-seal` |
| A9 标题/code 工具类 | 446–462 | `h1-4`/`.cal`/`code,.mono`/`.ink-edge`/`.goo-stage` |
| A10 sheet 纸张原语 | 464–541 | `.sheet`/`.sheet-2`/`.wash` 鼠标墨迹（night 变体） |
| A11 按钮 | 543–635 | `.btn`(ink/seal/outline/ghost/icon) + `.btn::before` 墨晕 + ink-drop + `@keyframes drop` |
| A12 水波环 | 21–71 | `.sumi-ring` + `@keyframes sumi-water`（JS 注入，pointerdown 触发） |
| A13 输入 | 637–703 | `.field`/笔触下划线/`textarea.field-area` |
| A14 复选/单选/开关/滑块 | 705–909 | `.check`/`.radio`/`.switch`/`.slider`/`.progress` + keyframes |
| A15 reduce-motion | 911–920 | `[data-motion]` → 改 `prefers-reduced-motion` |
| A16 组件块2 | 922–3113 | hero/ink-card/stamp/topnav/menu/modal/drawer/toast/badge/footer… 见 A16.x |
| A16.1 char-reveal/underline | 1096–1162 | `@keyframes char-reveal`/`char-underline`（标题逐字晕开） |
| A16.2 hero | 1163–1183 | `.hero` + bg-char 巨字水印 |
| A16.3 ink-card | 1184–1280 | `.ink-card`（列表/卡片核心容器，含 night） |
| A16.4 stamp | 1281–1320 | `@keyframes stamp`/`stamp-halo`（印章盖落） |
| A16.5 sidebar/menu | 1420–1660 | 侧栏/菜单/modal（博客移动菜单参考） |
| A16.6 brush-sweep/toast | 1731–1830 | drawer/`@keyframes brush-sweep`/`toast-drop`/`toast-evap` |
| A17 SVG 滤镜 defs | 3136–3165 | `#ink-bleed`(scale14)/`#ink-bleed-btn`(scale5)/`#ink-goo`/`#inkGrad`——**灵魂，全站注入** |
| A18 topnav DOM | 3167–3205 | 顶部导航结构（博客 SiteNavigation 参考） |
| A19 mode-toggle | 3196 | 明/夜切换按钮 inline onclick（博客改桥接 html.dark） |
| A20 hero DOM | 3206–3239 | 封面结构（博客首页/SiteTitle 参考） |
| A21 type 排版 DOM | 3820–3917 | 排版章（**article.prose 1:1 关键**：drop-cap/引用/列表/hr 呈现） |
| A22 text marks DOM | 3918–4032 | char-reveal/下划线标记 DOM |
| A23 stamp atom | 6346–6420 | `.stamp` 印章原子（落款） |
| A24 交互 JS | 6477–6720+ | `trackPointer`/`initPointerTracking`6497 · `initRipples`6514 · `initSwitches`6535 · `initSliders`6561 · `initSegmented`6613 · `initTabbars`6644 · brush-divider IntersectionObserver |
| A25 sumix 局部 | 4483–4560 | `.sumix .char-reveal .ch` + `@keyframes sumix-stamp`（章节级局部样式/脚本，提取通用部分） |
| A26 预加载脚本 | 3115–3123 | `localStorage` 读 mode/paper 防闪 → 改读博客主题键 |

---

## 三、组件映射表（sumi → 博客 DOM，D7）

| 博客文件 | 现状 | sumi 映射 | 源锚点 |
|---------|------|----------|--------|
| `global.css` | 232 行自定义（亚麻/进度条/dropcap/链接/引用/hr/列表淡化/gentle-rise/滚动条） | **整体替换**为 sumi 设计系统（token+滤镜引用+纸纹+组件+暗色桥接+article.prose 排版） | A2,A5,A6,A8-A16 |
| `.config/user.ts` | colorsLight/Dark + fonts | 配色改 sumi（light: `#faf7ee`/`#231d12`；dark: 墨夜）；fonts.header=display 链、fonts.ui=text 链 | A2,A3 |
| `uno.config.js` | cssExtend prose code 粉红 `#c7254e` | prose code 改 sumi 墨；prose 基础色交由 sumi article 覆盖 | A9 |
| `astro.config.ts` | Shiki 'dracula' | 关闭彩色高亮或改 sumi 单色（D8） | — |
| `LayoutDefault.astro` | grid 双列+header/main/footer | body 首注入 `.paper-stage`(fibers+mist)；注入全局 SVG 滤镜 defs；`html` 加 `data-motion`；桥接暗色 | A6,A17,A26 |
| `LayoutPost.astro` | `.reading-progress`+article.prose | 进度条改 sumi 笔触（`--seal` 朱砂 +`url(#ink-bleed)`，见 Task 6 裁定）；article 容器加 sumi 排版钩子 | A8,A21 |
| `SiteTitle.astro` | hgroup 签名式 | 站名用 `--font-cal` 书法体 + `.mini-seal` 朱印；副标题 ink-soft；char-reveal 入场 | A16.1,A16.2,A23 |
| `SiteNavigation.astro` | nav ul + social i-mdi | 链接 ink-soft→ink hover + 笔触下划线（`.field::after` 同款）；social 图标 ink 色 | A18 |
| `SiteFooter.astro` | footer p | ink-faint 小字 + `.mini-seal` 落款 | A23 |
| `PostMeta.astro` | h1.post-title + 日期/分类/标签 | 标题 display 字体 char-reveal；日期 mono；分类/标签做 sumi chip（seal 描边） | A16.1,A11 |
| `PostCategory.astro` | a.post-category | sumi seal-outline chip | A11 |
| `Pagination.astro` | footer 上/下页 + 页码 | sumi `.btn.ghost` + 笔触；页码 mono | A11 |
| `[...page].astro` 首页 | section + LayoutPost 列表 | 每篇 = `.ink-card`（hover wash 墨迹 + bleed 边）；列表悬停非焦点淡化保留并 sumi 化 | A16.3,A10 |
| `posts/[...id].astro` | .post-detail + Content + Comments + 代码复制 | 正文 1:1 sumi 排版；代码块 sumi 单色墨；复制按钮 sumi icon-btn | A21,A9,D8 |
| `categories/index.astro` | 分类列表 + 标签云 | 分类项 = sumi 列表行（hover 墨迹）；标签云 = seal chip | A16.3,A11 |
| `categories/[...category].astro`·`tags/[...tag].astro`·`archive.astro` | h2.post-title + ul 列表 | 统一 sumi 列表样式（title display 字体 + 日期 mono + hover 淡化） | A21 |
| `about.astro` | header + article.prose | 同文章正文 sumi 排版 | A21 |
| 新增 `SumiBackground.astro` | — | 封装 `.paper-stage` markup（fibers+mist），供 LayoutDefault 引用 | A6 |
| 新增 `SumiFilters.astro` | — | 封装 A17 SVG defs，供 LayoutDefault 引用（全站唯一一份） | A17 |
| 新增 `src/scripts/sumi.ts` | — | 提取 A24 交互 JS（pointer 墨迹/水波环/brush-divider observer/印章），导出 init，挂 `astro:page-load` | A24,A25 |

**暗色桥接规则（全局，D1）：** sumi 源码中所有 `:root[data-mode="night"] X` → 博客写作 `html.dark X`（或 `:root.dark X`）。`::selection`、wash、sheet、ink-card、paper-stage 的 night 变体一律照此改写。验证：博客现有暗色切换按钮（ThemeScript 控制 `html.dark`）能在宣纸 ↔ 墨夜间切换。

**reduce-motion 规则（A15）：** sumi 用 `[data-motion="off"]`。博客改为标准 `@media (prefers-reduced-motion: reduce)` 包裹，关键动画降级；同时 LayoutDefault 给 `html` 设 `data-motion="on"` 兜底属性选择器仍可用。

---

## 四、验证策略（CSS 视觉迁移的"测试"定义）

纯视觉迁移无单元测试。每个阶段的「验证」= 三道门：

1. **构建门** `pnpm build`（= `astro check && astro build`）必须 0 error；`pnpm typecheck` 0 error。
2. **视觉回归门**：`pnpm dev` 起本地（:4321），用 chrome-devtools MCP 导航对应页面截图，与 `SRC` 对应章节（用 `file://` 打开 showcase.html 截同区域）**并排比对**：纸色/墨色/字体/边缘墨晕/hover 墨迹/动画曲线逐项核对，1:1 不符即返工。
3. **健壮门**（终验）：暗色切换（宣纸↔墨夜）、移动端（≤900px）、断网字体 fallback（DevTools block 镜像域名→应回落 system serif 不崩）、长文滚动性能（Performance trace，正文滚动无明显掉帧）、Print Preview。

每个 Task 末尾 commit，message 用中文 Conventional Commits。

---

## 五、阶段化任务（bite-sized）

### Task 0：建分支 + 基线快照

**Files:** 无代码改动

**Step 1** 提交当前未提交的博客定制基线（用户已有改动 + CLAUDE.md 等是 sumi 改造的起点，需保留）：
```bash
cd ~/Documents/pe/js/eamanc.github.io
git add -A && git commit -m "chore: sumi-e 改造前基线快照"
```
**Step 2** 建分支：
```bash
git checkout -b feat/sumi-e-restyle
```
**Step 3** 起 dev server，chrome-devtools MCP 截图当前态首页/文章页/分类页/暗色，存 `docs/plans/baseline-*.png` 作回归对照。
**Step 4** Commit（截图）：`git add docs/plans && git commit -m "chore: 迁移前视觉基线截图"`

---

### Task 1：字体镜像接入

**Files:** Modify `src/.config/user.ts`（fonts），Create `src/styles/sumi-fonts.css`

**Step 1** 读 `SRC:12` 取完整 6 字族 Google Fonts URL（Noto Serif SC / Noto Sans SC / Cormorant Garamond ital / Ma Shan Zheng / JetBrains Mono / Inter）。
**Step 2** 新建 `src/styles/sumi-fonts.css`，写镜像 `@import`（font.im 主、loli.net 备注释保留），保持与 `SRC:12` 完全相同的 family/weight/ital 参数（D2 字形 1:1 的前提是参数一字不差）。
**Step 3** `user.ts` 的 `appearance.fonts.header` 改为 sumi display 链、`fonts.ui` 改为 sumi text 链（取自 `SRC:183-184`，含 system fallback）。
**Step 4** 验证：`pnpm build` 0 error。
**Step 5** Commit：`feat: 接入 sumi-e 字体（国内镜像代理 Google Fonts）`

---

### Task 2：配色 token 注入 user.ts + uno.config

**Files:** Modify `src/.config/user.ts`（colorsLight/Dark），`uno.config.js`（cssExtend）

**Step 1** 读 `SRC:138-217`（A2+A3）。`user.ts` `colorsLight` = `{ primary: 'oklch 墨色实际十六进制近似', background: '#faf7ee' }`；`colorsDark` = sumi 墨夜（paper→深墨、primary→浅墨）。注：UnoCSS theme 注入需 hex/rgb，oklch 在 `global.css` 用，base 色给近似 hex 保证原子类/prose 一致。
**Step 2** `uno.config.js` `cssExtend`：删除 prose code 的 `#c7254e/#f9f2f4` 粉红，改 `color: var(--ink-mid); background: color-mix(in oklab,var(--paper-shade) 70%,transparent)`；`--prose-borders` 改 `var(--ink-hairline)`。
**Step 3** 验证：`pnpm build` 0 error；dev 起站，确认基础文字/背景已变纸墨色（未做 global.css 前会"半成品"，正常）。
**Step 4** Commit：`feat: UnoCSS 基础色/prose 改为 sumi 纸墨 token`

---

### Task 3：global.css 整体替换为 sumi 设计系统地基

**Files:** Modify `src/styles/global.css`（**整体重写**）

> 这是最大单任务，建议执行子 agent 单独承接，精读 `SRC` A2/A5/A6/A8/A9/A15。

**Step 1** 读 `SRC:138-462`（token+base+纸纹+分割线+标题/code/滤镜工具类）+ `SRC:911-920`（reduce-motion）。
**Step 2** 重写 `global.css`：
- 完整 `:root` token（A2，**变量名一字不改**，preserve）
- `:root[data-mode="night"]` 全部改写为 `html.dark`（D1 桥接）
- 删除纸变体 hemp/silk/plain（D5），保留 rice 默认
- `body`/`::selection`（A5）
- `.paper-stage` 及 fibers/mist/`@keyframes mist-drift`（A6，data-url SVG noise 原样保留）
- `.brush-divider`/`@keyframes brush-draw`/`.mini-seal`（A8）
- `h1-4`/`.cal`/`code,.mono`/`.ink-edge`/`.goo-stage`（A9）
- reduce-motion 改 `@media (prefers-reduced-motion: reduce)`（A15）
- 删除全部旧自定义（亚麻 `html::before`、旧 dropcap、旧链接动画、旧 hr、旧滚动条等）——sumi 体系将重建
- **【Task 1 reviewer 前向提醒 I-1】** 旧 `global.css:77` drop-cap 硬编码 `font-family: "Noto Serif SC","Source Han Serif SC",serif`（独立于 theme 体系的孤儿值）必须改为 sumi `--font-cal` 书法体朱砂首字下沉，勿遗漏
- **【Task 1 reviewer 前向提醒 m-1】** 重写后 `@import './sumi-fonts.css';` 必须保持为文件**第一条规则**（其前只能有注释）——CSS 规范要求 @import 先于所有非注释规则，否则被浏览器静默忽略
- **【Task 2 reviewer 前向提醒 m-2】** `uno.config.js` cssExtend 现有 3 个 hardcode hex（Task 2 已加 sumi token 来源注释作靶点）：`--prose-borders`=#c7c3c0(`--ink-hairline`)、code `color`=#4d4641(`--ink-mid`)、code `background-color`=#ebe3cd(`--paper-shade`)。Task 3 重写 global.css 时用更高特异性的 `article.prose` 规则以 sumi CSS 变量覆盖这些静态 hex（cssExtend 由 presetTypography 注入，无法直接用运行时 var，故走 global.css 覆盖路线）
- **【Task 2 reviewer 前向提醒 m-3】** `--prose-borders` 在 dark 模式无覆盖（presetTheme dark 只覆盖 colors 不覆盖 CSS 变量，原版 `#eee` 即有此继承缺陷）。Task 3 暗色桥接时必须在 `html.dark` 块内覆盖 `--prose-borders`/prose 边框为 sumi 夜色 hairline，避免墨夜底配亮边对比反转
**Step 3** 验证：`pnpm build` 0 error；`pnpm typecheck` 0 error。
**Step 4** Commit：`feat: global.css 重写为 sumi-e 设计系统地基（token/纸纹/滤镜/暗色桥接）`

---

### Task 4：LayoutDefault 注入纸纹 + 全局 SVG 滤镜 + 暗色桥接

**Files:** Create `src/components/SumiBackground.astro`·`src/components/SumiFilters.astro`；Modify `src/layouts/LayoutDefault.astro`

**Step 1** `SumiFilters.astro`：原样封装 `SRC:3136-3165`（A17，4 个 filter/gradient，`<svg width=0 height=0 style="position:absolute" aria-hidden>`）。
**Step 2** `SumiBackground.astro`：封装 `SRC:3130-3133` 的 `.paper-stage`(fibers+mist) markup。
**Step 3** `LayoutDefault.astro`：`<body>` 首行插 `<SumiBackground/>` 与 `<SumiFilters/>`（置于 swup 不替换区域，确保切页持久）；`<html>` 加 `data-motion="on"`；确认 `class:list` 仍输出 `dark`（暗色桥接已在 global.css 由 `html.dark` 接管，ThemeScript 不动）。
**Step 4** 验证：`pnpm build` 0；dev 起站，chrome-devtools 截图：纸纹/雾气漂移/vignette 可见，与 `SRC` 背景 1:1；切暗色变墨夜。
**Step 5** Commit：`feat: 注入 sumi 纸纹背景与全局 SVG 墨晕滤镜`

---

### Task 5：article.prose 正文排版 1:1（含全特效边缘）

**Files:** Modify `src/styles/global.css`（追加 article 段），参考 `LayoutPost.astro`

**Step 1** 读 `SRC:3820-3917`（A21 排版章 DOM+局部样式）+ A9 + A16.1。
> **【Task 1 reviewer 前向提醒 m-2】** `ui`/Inter 字体链未加载 italic 变体。若正文 `<em>`/斜体用 UI 字体会触发浏览器合成斜体（faux italic，质量差）。本 Task 评估：正文斜体应走 display 衬线（Noto Serif SC 有真斜体）或 latin（Cormorant Garamond 已载 italic），勿落到 Inter faux italic。
**Step 2** `global.css` 追加 `article.prose` sumi 排版：display 字体标题、行宽（沿用 65ch 不破节奏）、行高、引用块（左笔触竖线 `url(#ink-bleed)`）、`hr`（sumi 渐变/笔触短线）、`ul/ol`、首字下沉（`--font-cal` 朱砂色 drop-cap）、`code/pre`（D8 单色墨）、链接（`.field::after` 同款笔触下划线 hover 渐展）。D3：标题/引用/hr/链接边缘**全套** `url(#ink-bleed)`。
**Step 3** 验证：构建 0；起站打开任一文章，与 `SRC` type 章并排比对：drop-cap/引用/hr/链接/代码 1:1；暗色一致。
**Step 4** Commit：`feat: 文章正文 1:1 sumi 水墨排版（全特效边缘）`

---

### Task 6：阅读进度条 → 笔触

**Files:** Modify `src/styles/global.css`（`.reading-progress`），`src/layouts/LayoutPost.astro` 按需

> **【Task 3 reviewer I-1 裁定】** 进度条用 `var(--seal)` 朱砂**而非** `var(--ink)`。理由:博客原 reading-progress 是 signature accent(旧琥珀强调色),sumi 体系对应 accent = `--seal`(template.json 明确"朱砂印作克制点缀"是 sumi DNA);`--ink` 经 color-mix 混纸底≈正文色,作顶部进度信号对比不足。属 D7 择优(博客自有 signature 特性,非 sumi showcase 元素,不违 1:1)。Task 3 已落地 `.reading-progress{background:var(--seal)}`,Task 6 在此基础上加 filter,**不得改回 --ink**。

**Step 1** 确认 `.reading-progress` 背景为 `var(--seal)`(Task 3 已落地),加 `filter:url(#ink-bleed)`（参考 A14 `.progress .bar` 的 `.seal` 变体），暗色 seal 自适应（sumi night `--seal` 已在 html.dark 桥接）。
**Step 2** 验证：构建 0；文章页滚动，进度条为**朱砂**毛边笔触；暗色正常。
**Step 3** Commit：`feat: 阅读进度条改为水墨笔触`

---

### Task 7：站点标题/导航/页脚 sumi 化

**Files:** Modify `SiteTitle.astro`·`SiteNavigation.astro`·`SiteFooter.astro`；`global.css` 追加

**Step 1** 读 A16.1/A16.2/A18/A23。
**Step 2** `SiteTitle`：站名 `--font-cal` 书法体（或 display）+ 旁置 `.mini-seal` 朱印；副标题 ink-soft 小字；首屏 char-reveal 逐字晕开（CSS 类，JS 在 Task 11 接）。保留 `<a href="/">` 结构与 swup class。
**Step 3** `SiteNavigation`：导航链接 ink-soft，hover→ink + 笔触下划线渐展；当前页 `aria-current` 加朱印点；social 图标 ink 色 hover seal。
**Step 4** `SiteFooter`：ink-faint 小字 + 末尾 `.mini-seal` 落款；保留 parseFooter。
**Step 5** 验证：构建 0；首页比对 topnav/hero 区 1:1；暗色；移动端不溢出。
**Step 6** Commit：`feat: 站点标题/导航/页脚 sumi 化（书法体+朱印+笔触）`

---

### Task 8：文章元信息 / 分类 / 分页 sumi 化

**Files:** Modify `PostMeta.astro`·`PostCategory.astro`·`Pagination.astro`；`global.css` 追加

**Step 1** 读 A11（btn/seal/outline chip）+ A16.1。
**Step 2** `PostMeta`：h1 display 字体 + char-reveal；日期 `--font-mono`；分类/标签 → sumi seal-outline chip（`.btn.outline` 缩小版，`url(#ink-bleed-btn)` 软边）。
**Step 3** `PostCategory`：同款 seal chip。
**Step 4** `Pagination`：上/下页 `.btn.ghost` + hover 墨迹；页码 mono；i-mdi chevron 保留改 ink 色。
**Step 5** 验证：构建 0；文章页/列表页元信息与 `SRC` chip/按钮 1:1；暗色。
**Step 6** Commit：`feat: 文章元信息/分类/分页 sumi 化`

---

### Task 9：首页文章列表 → ink-card

**Files:** Modify `src/pages/[...page].astro`；`global.css` 追加 `.ink-card`

**Step 1** 读 A16.3（`.ink-card` 含 night）+ A10（wash 鼠标墨迹）。
**Step 2** `global.css` 追加 `.ink-card` 全套（bleed 边/层叠纸/hover wash），night 桥接 `html.dark`。
**Step 3** `[...page].astro`：每篇 post 包进 `.ink-card`（内含 `<div class="wash">` 供鼠标墨迹）；保留 `getPostDescription` line-clamp；列表 hover 非焦点淡化改 sumi（opacity + 不破节奏）。
**Step 4** 验证：构建 0；首页与 `SRC` surfaces/卡片章 1:1：卡片毛边/层叠纸/鼠标移入墨迹晕开；暗色；移动端单列。
**Step 5** Commit：`feat: 首页文章列表改为 sumi ink-card（含鼠标墨迹）`

---

### Task 10：分类/标签/归档/关于页 sumi 化

**Files:** Modify `categories/index.astro`·`categories/[...category].astro`·`tags/[...tag].astro`·`archive.astro`·`about.astro`；`global.css` 追加列表样式

**Step 1** 读 A21 + A16.3 + A11。
**Step 2** 统一 sumi 列表样式类（标题 display 字体 + 日期/计数 mono + hover 行墨迹/淡化）；分类总览 + 标签云用 seal chip（A11）；`about.astro` 的 `article.prose` 自动继承 Task 5 排版，仅核对 header。
**Step 3** 验证：构建 0；逐页比对；空状态（无标签时）不破版；暗色。
**Step 4** Commit：`feat: 分类/标签/归档/关于页 sumi 化`

---

### Task 11：交互 JS 移植 + swup 兼容

**Files:** Create `src/scripts/sumi.ts`；Modify `LayoutDefault.astro`（引脚本）

**Step 1** 读 A24（`SRC:6477-6720+`）+ A12 水波环 + A25。提取通用交互：① `initPointerTracking` 给 `.ink-card/.btn/.sheet/.field` 设 `--mx/--my`；② `initRipples` pointerdown 生成 `.sumi-ring`×7（参数同源 `SRC:21-71`）；③ brush-divider IntersectionObserver 加 `.in-view`；④ char-reveal 逐字 span 包裹 + 入场；⑤ 印章 stamp（如落款交互）。**剔除** showcase 专属（switch/slider/seg/tabbar/Tweaks）除非博客实际用到。
**Step 2** `sumi.ts` 导出 `initSumi()`，幂等（可重复调用不重复绑定）。
**Step 3** `LayoutDefault.astro` 末尾 `<script>`：`import {initSumi} from '~/scripts/sumi'`；`document.addEventListener('astro:page-load', initSumi); initSumi()`（参考现有 reading-progress 的 swup 兼容写法）。
**Step 4** 验证：构建 0；起站点击/移动鼠标：水波墨环、卡片墨迹跟随、滚动到分割线笔触描边、标题逐字晕开均生效；**swup 跨页导航后特效仍重新初始化**（关键回归点）；reduce-motion 下降级；暗色。
**Step 5** Commit：`feat: 移植 sumi 交互 JS（墨环/墨迹/笔触描边/逐字）并兼容 swup`

---

### Task 12：代码块 sumi 单色墨 + Shiki 调整

**Files:** Modify `astro.config.ts`（shikiConfig）；`posts/[...id].astro`（复制按钮样式）；`global.css`（pre/code）

**Step 1** D8：`astro.config.ts` shikiConfig theme 改 `'github-light'`（接近单色），或设 `theme:'css-variables'` 由 sumi 接管；与 `html.dark` 联动用 dual theme（light/dark）。
**Step 2** `global.css` `pre`：`--paper-shade` 底 + `url(#ink-bleed)` 软边 + `--font-mono`；行内 code 同 Task 2。
**Step 3** `posts/[...id].astro` 内联 `.clipboard-copy` 样式由 `#30363d` 改 sumi（ink hover）；icon 用 ink 色。
**Step 4** 验证：构建 0；含代码的文章比对：代码块宣纸墨风、无 dracula 暗紫；亮/暗一致；复制按钮 sumi 风。
**Step 5** Commit：`feat: 代码块改 sumi 单色墨风`

---

### Task 13：终验 + 回归

**Files:** 无改动（仅验证 + 修复）

**Step 1** `pnpm build` + `pnpm typecheck` 全绿。
**Step 2** 视觉回归门：首页/文章/分类/标签/归档/关于逐页，与 baseline 截图及 `SRC` 对应章 1:1 核对。
**Step 3** 健壮门：暗色全站、移动端（resize ≤390/≤900）、断网字体 fallback（block font.im → system serif 不崩）、长文滚动 Performance trace（D3 全特效下正文滚动帧率，若严重掉帧记录为已知取舍并报告用户）、Print Preview。
**Step 4** 修复发现的不符项（可能回到对应 Task）。
**Step 5** 更新 `CLAUDE.md` 设计规范节（旧 Typography 色板/特性表 → sumi；D1 覆盖旧暗色规范）。
**Step 6** Commit：`feat: sumi-e 迁移终验通过 + 更新 CLAUDE.md 设计规范` + `docs: 迁移完成报告`

---

## 六、风险与回滚

| 风险 | 缓解 |
|------|------|
| swup 跨页后 SVG defs/纸纹丢失或 JS 未重绑 | defs/背景放 LayoutDefault 持久区；JS 挂 `astro:page-load`（Task 11 关键回归点） |
| D3 全特效滤镜致长文滚动卡顿 | Task 13 Performance trace 实测；若不可接受，回报用户在「1:1 保真」与「正文降级」间二次决策（不擅自降级，D3 是用户明确选择） |
| 镜像字体宕机 | 多级 fallback + system serif 兜底（Task 1/13 断网验证） |
| oklch 在旧浏览器不支持 | sumi 大量用 oklch+color-mix；目标读者现代浏览器，记录为已知约束，必要时加 `@supports` 兜底 |
| UnoCSS preset-theme 与 sumi `:root` 变量冲突 | Task 2 让 base 色同源；sumi article/组件样式特异性更高覆盖 prose 默认 |
| 改动量大、单 Task 失败阻塞 | 每 Task 独立 commit，可单点回滚；分支隔离不污染 main |

**整体回滚：** `git checkout main`（feat/sumi-e-restyle 分支隔离，main 始终是迁移前可用态）。

---

## 七、执行顺序依赖

```
Task0 → Task1 → Task2 → Task3 ┬→ Task4 → Task5 → Task6
                               ├→ Task7
                               ├→ Task8 → Task9 → Task10
                               └→ Task11（依赖 Task4 defs + Task9 ink-card）
Task12（依赖 Task3 token）→ Task13（依赖全部）
```
Task3 是地基，必须先完成。Task4–10 多数可并行（不同文件），但 Task11 需 Task4（defs）+ Task9（.ink-card 目标存在）。Task13 最后。
