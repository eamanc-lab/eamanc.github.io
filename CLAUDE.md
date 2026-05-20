# 雾散之前 — 个人博客

## 项目概况

| 项 | 值 |
|---|---|
| **名称** | 雾散之前（site.title）/ 副标题「保持呼吸」 |
| **定位** | 中文 AI 内容解析博客，面向普通读者 |
| **设计语言** | Sumi-e 水墨「砚」（参考 lab-room.dev `sumi-e` 系列模板，1:1 全特效迁移） |
| **基座主题** | [Astro Theme Typography](https://github.com/moeyua/astro-theme-typography)（结构基座，视觉已整套替换） |
| **技术栈** | Astro 5 + TypeScript + UnoCSS + Shiki(dual theme) + swup |
| **部署** | GitHub Pages → `eamanc.github.io` |
| **仓库** | `git@github.com:eamanc-lab/eamanc.github.io.git` |

## 背景

2026-04-05 启动。目标是搭建一个部署在 GitHub Pages 上的个人博客，用于发布中文 AI 内容解析文章，面向普通读者。

### 设计决策演进

**v1（2026-04 ~ 05 上旬）**：调研 30+ 主题后选 [Astro Theme Typography](https://github.com/moeyua/astro-theme-typography) 作为基座（中文排版友好 + 衬线体格调），自定义为「亚麻纹理 + 琥珀 accent + 首字下沉」的克制衬线版。

**v2（2026-05，sumi-e 迁移）**：在 v1 基础上整套替换为 sumi-e 水墨语言（参考 lab-room.dev `sumi-e` 系列），13 个 Task（+ Task 1.5 typecheck 技术债修复）完成全套 1:1 迁移：
- 设计灵感从「克制衬线西方排版」迁移到「东方水墨 × 宣纸感」
- 配色从「米白 + 琥珀」迁移到「宣纸 + 单色墨 + 朱印 signature」
- 视觉特效从「静态克制」迁移到「SVG 滤镜墨晕 + 鼠标墨迹 + 水波环 + 逐字入场」全特效（D3 决策）

迁移完成报告见 `docs/plans/2026-05-19-sumi-e-blog-restyle-COMPLETED.md`。

### 设计语言（v2 sumi-e 后）

**核心原则：单色水墨即克制，宣纸朱印即签名。**

- **东方克制**：宣纸暖色 + 单色墨（不引入彩色），通过浓淡而非色相传递层次
- **artistic intent**：每个 SVG 滤镜（`#ink-bleed`/`#ink-bleed-btn`/`#ink-goo`/`#inkGrad`）都有「墨与纸的物理关系」表达目的（晕染/融墨/笔触/渐变）
- **signature accent**：朱印（朱砂红 var(--seal)）作为唯一非墨色 accent，用于阅读进度条、首字下沉、`.mini-seal` 落款、`.post-category` chip outline——「画押」式签名感
- **全特效保真**（D3）：标题/引用/hr/链接/卡片边缘/列表点缀全套挂 url(#ink-bleed)，不为长文性能擅自降级

### 风格参考坐标系

| 参考 | 借鉴点 |
|------|--------|
| Astro Theme Typography 原版 | 结构 / 中文排版基础 / 内容模型 |
| lab-room.dev `sumi-e` 模板 | sumi-e 视觉地基（token / SVG defs / 滤镜技法 / 朱印） |
| 中国传统水墨 | 浓淡墨韵 / 朱印落款 / 宣纸感 |
| Hugo Paper / Aesop | 暖色调克制传统 |

### 当前状态

- ✅ v2 sumi-e 设计语言全套落地（13 Task 完结）
- ✅ 13 Task commit 链清晰（`3ae4fab` BASE → Task 13 终验 commit）
- ✅ 构建门：`pnpm typecheck` / `pnpm build` 双零错（8 page 全产出）
- ✅ 视觉门：7 页 × 亮/暗/移动 × Playwright headless 全过，交互/swup 全过
- ✅ 健壮门：暗色全站 / 移动 / 断网字体 fallback / 长文滚动 / 打印
- ✅ GitHub Actions 自动部署配置
- ⏳ 替换示例文章为真实内容
- ⏳ 首次推送部署

---

## 设计规范（sumi-e v2）

> 历史 v1（米白 + 琥珀 + 亚麻）已整套被 v2 sumi-e 替换，本节为当前生效规范。

### 设计决策记录（D1-D8）

| ID | 决策 | 落点 |
|----|------|------|
| **D1** | 双模（亮宣纸 / 暗墨夜），暗模不用纯黑而用 `oklch(18% .020 50)` 暖墨 | `global.css` `:root` / `html.dark` token 段 |
| **D2** | 字体走国内镜像 Google Fonts（`fonts.googleapis.cn`），多级 fallback（Noto / Cormorant / Songti / STSong / Source Han / serif） | `LayoutDefault.astro` `<link>` + `user.ts` `fonts.header/ui` |
| **D3** | 全站 1:1 全特效（不为长文性能擅自降级），SVG 滤镜 `url(#ink-bleed)` 全套挂在标题/引用/hr/链接/卡片边缘 | `global.css` 全段 + `LayoutDefault.astro` `<svg>` defs |
| **D4** | 暗色桥接走 `html.dark` 而非 `prefers-color-scheme` 媒体查询（与基座 `ThemeScript` 一致，user 可手切） | `LayoutDefault.astro` / `ThemeScript.astro` |
| **D5** | article.prose 排版与 SRC 模板 byte-equality（md5 `490feea01ab52416593d029d431035de` 跨 `head -n 1937` 锚） | `global.css` Task 5 段 |
| **D6** | 站点框架走 BEM（`.site-title__name` / `.site-nav__link` / `.site-footer__seal` 等），与基座 layout 解耦 | `SiteTitle.astro` / `SiteNavigation.astro` / `SiteFooter.astro` |
| **D7** | 朱印 signature accent：阅读进度条 / 首字下沉 / `.mini-seal` / `.post-category` outline 全用 `var(--seal)` 朱砂色而非 ink | `global.css` 多段 + `LayoutPost.astro` reading-progress |
| **D8** | 代码块走 Shiki dual theme（github-light + github-dark-dimmed），`defaultColor:false` 输出 `--shiki-light/dark` CSS vars，由 sumi 容器壳（`var(--paper-shade)` 底 + `var(--ink-hairline)` 边 + `url(#ink-bleed)`）接管视觉感 | `astro.config.ts` shikiConfig + `global.css` Task 12 段 |

### Token 体系（sumi v2）

亮模式（`:root`）+ 暗模式（`html.dark` override），全部 OKLCH（除 `--paper`/`--paper-edge`/`--paper-shade` 亮模 hex 起点 + `--paper` 暗模 oklch）。

| Token | 亮模式 | 暗模式 | 用途 |
|-------|--------|--------|------|
| `--paper` | `#faf7ee` | `oklch(18% .020 50)` | 页面 / `<body>` 底色（宣纸 ↔ 墨夜） |
| `--paper-edge` | `#f4eede` | `oklch(15% .020 50)` | `.paper-stage` 顶部光斑 |
| `--paper-shade` | `#ebe3cd` | `oklch(12% .020 50)` | 卡片底 / `<pre>` 容器底 |
| `--ink-base` | `oklch(20% .018 60)` | `oklch(92% .008 70)` | 墨基色，与 paper color-mix 得 `--ink` |
| `--ink` | mix(base 92%, paper) | mix(base 92%, paper) | 正文文字 |
| `--ink-strong` | mix(`oklch(14% .022 60)` 92%, paper) | mix(`oklch(98% .005 70)` 92%, paper) | 标题/强调（最浓墨） |
| `--ink-mid` | `oklch(40% .012 60)` | `oklch(75% .012 70)` | 副文 / chip 文字 |
| `--ink-soft` | `oklch(58% .010 60)` | `oklch(58% .012 70)` | meta / footer |
| `--ink-faint` | `oklch(72% .008 60)` | `oklch(42% .012 70)` | 次要文字 / hairline 文字 |
| `--ink-hairline` | `oklch(82% .006 60)` | `oklch(30% .012 70)` | 1px 描边 / 分隔 / 边缘 |
| `--seal` | `oklch(56% .165 28)` | `oklch(70% .170 32)` | **朱印 signature accent**（D7） |
| `--seal-deep` | `oklch(46% .165 28)` | `oklch(60% .170 32)` | 朱印强压（hover/active） |
| `--seal-soft` | `oklch(70% .140 30)` | `oklch(80% .130 32)` | 朱印淡 outline |

**规则（D3 续）**：全站只用这套墨 + 朱印 + paper 三相系统，**不引入任何彩色**（Shiki dual theme 是 7 色 github-light/dark-dimmed 例外——D8 决策接受）。

### 字体体系（D2）

| Var | 字体栈 | 用途 |
|-----|--------|------|
| `--font-display` | `"Noto Serif SC", "Cormorant Garamond", "Songti SC", "STSong", "Source Han Serif SC", serif` | 标题（衬线水墨） |
| `--font-text` | `"Noto Sans SC", "Inter", "PingFang SC", "Hiragino Sans GB", -apple-system, system-ui, sans-serif` | 正文 / UI |
| `--font-mono` | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` | 代码 / 等宽 |
| `--font-cal` | `"Ma Shan Zheng", "Noto Serif SC", "Songti SC", serif` | **书法体**（站点标题 `.site-title__name` / 朱印） |
| `--font-latin` | `"Cormorant Garamond", "Noto Serif SC", serif` | 拉丁衬线（小范围装饰，无 CJK 自动降级到 Noto） |

镜像源：`https://fonts.googleapis.cn`（D2，国内可达）。**降级保障**：断网/拦截 `fonts.googleapis.cn` 时退回系统 serif/sans（Songti SC / PingFang SC），布局不崩、可读（Playwright route block 验证已通过）。

### 排版参数

article.prose 与 SRC 模板 1:1 byte-equality（D5）。关键值：

| 参数 | 值 |
|------|---|
| 正文行宽 | SRC 模板原值（继承 sumi-e SRC 锚） |
| 字体 | `var(--font-text)` 正文 / `var(--font-display)` 标题 / `var(--font-cal)` 站点大标题 |
| 颜色 | 正文 `var(--ink)` / 标题 `var(--ink-strong)` / meta `var(--ink-soft)` |
| 首字下沉 | `.post-meta + article.prose > p:first-of-type::first-letter`，朱印色 `var(--seal)`（D7） |

### 背景与滤镜（D3）

**`.paper-stage` 三层纸**（`LayoutDefault.astro`）：
- 顶层 `.fibers` — 纸纤维微噪点
- 中层 `.mist` — `mist-drift 60s` 漂移（极慢，让 paper 呼吸）
- 底层 `--paper` 平铺

**全局 SVG defs**（`LayoutDefault.astro` 顶层 `<svg>`，所有页面共享）：
- `#ink-bleed` — feTurbulence `0.018 0.022` 2 octaves + feDisplacementMap `scale=14`：标题/卡片边缘墨晕
- `#ink-bleed-btn` — 同结构 `scale=5`：按钮/chip/toast 弱晕（避免小元素扭曲过强）
- `#ink-goo` — feGaussianBlur stdDev=6 + feColorMatrix threshold：水波融墨（`.sumi-ring` 多环融合）
- `#inkGrad` — `linearGradient` currentColor 0→0.9：留给未来 sparkline（暂无消费者，与 SRC 锚 1:1 保留）

### 自定义特性表（v2 sumi-e，区别于 SRC 锚 + 区别于 v1）

| 特性 | 实现位置 | Task | 说明 |
|------|---------|------|------|
| 字体镜像 | `LayoutDefault.astro` `<link>` | 1 | `fonts.googleapis.cn` 国内镜像，含 Noto/Cormorant/MaShan |
| 配色 token | `user.ts` `colorsLight/Dark` + `uno.config.js` | 2 | sumi 纸墨 + 朱印基础注入到 UnoCSS / Astro 系统色 |
| 全站 sumi 地基 | `global.css` `:root` / `html.dark` | 3 | token + 字体 + base reset，全文档锚点 |
| 纸纹 + SVG defs + 暗色桥接 | `LayoutDefault.astro` | 4 | `.paper-stage` 三层纸 + 4 个 SVG filter defs + `ThemeScript` 兼容 |
| article.prose 1:1 | `global.css` 中段（md5 锚） | 5 | 与 SRC 模板 byte-equality 镜像（D5） |
| 阅读进度条朱砂笔触 | `LayoutPost.astro` + `global.css` | 6 | 顶部 2px 朱印渐变 + url(#ink-bleed-btn) 笔触 |
| `.site-title` 书法体 + 朱印 | `SiteTitle.astro` + `global.css` | 7 | `--font-cal` Ma Shan Zheng + `.mini-seal` 落款 |
| `.site-nav__link` 笔触下划线 | `SiteNavigation.astro` + `global.css` | 7 | 悬停展开为墨笔触，aria-current 切换 |
| `.site-footer` 朱印落款 | `global.css` | 7 | `--ink-faint` 文字 + `.site-footer__seal` 角印 |
| `.post-meta__title` + chip | `PostMeta.astro` + `global.css` | 8 | seal-outline 分类 chip + ghost 翻页按钮 |
| `.ink-card` 首页列表 | `[...page].astro` + `global.css` | 9 | 毛边层叠卡 + `.wash` 鼠标墨迹 hook + 字体 stagger 入场 |
| 分类/标签云/归档/关于 | 多 page + `global.css` | 10 | 行式列表 + `.tag-cloud__item` seal 印章 + about 独立 header |
| sumi.ts 交互 JS | `[...id].astro` 等内联 module | 11 | 5 个 init（pointerTracking/ripple/brushDivider/charReveal/ariaCurrent）+ `astro:page-load` swup 兼容 |
| Shiki 双 theme + 复制按钮 | `astro.config.ts` + `global.css` + `[...id].astro` | 12 | github-light/dark-dimmed + sumi 容器壳 + `.clipboard-copy` 朱印 ink |

### 关键 sumi 选择器

- `.paper-stage` / `.fibers` / `.mist` — 三层纸纹（`LayoutDefault.astro` 内）
- `.brush-divider` — 笔触分隔线（IntersectionObserver in-view 触发）
- `.mini-seal` — 朱印落款方块（站点标题 + footer）
- `.ink-card` — 首页卡片（带 `.wash` 鼠标墨迹 + 字体入场 stagger）
- `.sumi-ring` — pointerdown 水波环（× 3 多环融合，`#ink-goo` 滤镜合成）
- `.ch` — char-reveal 逐字 span（`--i` 索引 stagger 入场）
- `.post-category` / `.pagination__link` / `.tag-cloud__item` — 朱印 ripple target（pointerdown 生水波）

### 暗色策略（D1 + D4）

`html.dark` 类名切换（不依赖 `prefers-color-scheme`，与基座 `ThemeScript` 协同）。token 在 `html.dark` 段全套 override，paper 转 `oklch(18% .020 50)` 暖墨夜（**不用纯黑** `#000` 也**不用旧版深靛蓝** `#1a1a2e`），ink 反相为冷暖白，朱印转 `oklch(70% .170 32)` 提亮以保留可见性。

---

## 内容规范

### 文章分类

| 分类 | path | 内容方向 |
|------|------|---------|
| Agent 协作 | `agent-collaboration` | 多 Agent 协同、编排、分工实战 |
| Skill 评测 | `skill-review` | Skill 使用体验、对比、推荐 |
| AI 信息素养 | `info-literacy` | AI 时代如何筛选、过滤、消化信息 |
| 电商 × AI | `ecommerce-ai` | 电商场景下的 AI 应用与实践 |
| 信息源 | `info-sources` | 优质信息源的分享与记录 |
| 杂谈 | `misc` | 未归类的思考和记录 |

### 文章 frontmatter 模板

```markdown
---
title: 文章标题
pubDate: YYYY-MM-DD
categories: ['Agent 协作']
description: '一句话描述，会显示在列表页'
---
```

> `categories` 的值必须使用上表中的**分类名称**（中文），不是 path。

### 写作原则

- 一个类比胜过十段解释
- 克制比炫技更难，也更有价值
- 每篇文章至少有一个其他地方看不到的视角
- 面向普通人，不堆术语

---

## 发布流程

**本工作台是个人博客内容的唯一发布入口。** 无论在哪个工作台产出的文章，发布时都应路由到这里执行。

### 流程

1. 将文章 markdown 复制到 `src/content/posts/`，文件名用英文短横线格式（如 `my-article-title.md`）
2. 确保 frontmatter 完整（title / pubDate / categories / description）
3. 运行 `pnpm build` 验证构建无报错
4. git commit + push，GitHub Actions 自动部署到 `eamanc.github.io`

---

## 开发命令

```bash
cd ~/Documents/pe/js/eamanc.github.io

pnpm dev          # 本地开发 → localhost:4321
pnpm build        # 构建静态文件
pnpm preview      # 预览构建结果
pnpm theme:create # 创建新文章（交互式）
```

## 关键文件

按 Task 段索引，便于查阅各次迁移落点。

| 文件 | Task | 用途 |
|------|------|------|
| `src/.config/user.ts` | 1/2 | 站点 site + appearance.colorsLight/Dark + fonts（sumi token 系统级注入） |
| `src/.config/default.ts` | — | 主题默认配置（不要直接改） |
| `uno.config.js` | 2 | UnoCSS theme 桥接（sumi token 映射） |
| `astro.config.ts` | 12 | Shiki dual theme（`github-light` / `github-dark-dimmed`）+ `defaultColor:false` |
| `src/styles/global.css` | 3-12 | 全部自定义样式（按 Task 段块状组织，每段顶部有 `═══` 节标识 + Task 注释） |
| `src/layouts/LayoutDefault.astro` | 4 | `.paper-stage` 三层纸 + SVG filter defs + `ThemeScript` |
| `src/layouts/LayoutPost.astro` | 6 | 文章详情页 + 阅读进度条朱砂笔触 + 内联 sumi.ts |
| `src/components/SiteTitle.astro` | 7 | 书法体大标题 + 副标 + `.mini-seal` 朱印 |
| `src/components/SiteNavigation.astro` | 7 | 导航笔触下划线（aria-current 由 sumi.ts 切换） |
| `src/components/PostMeta.astro` | 8 | 文章元信息（date + category chip + tags） |
| `src/components/PostCategory.astro` | 8 | 单独的分类 chip（seal-outline + ripple target） |
| `src/pages/[...page].astro` | 9 | 首页 `.ink-card` 列表 |
| `src/pages/categories/index.astro` | 10 | 分类总览 + 标签云 |
| `src/pages/categories/[...category].astro` | 10 | 单分类 |
| `src/pages/tags/[...tag].astro` | 10 | 单标签 |
| `src/pages/archive.astro` | 10 | 按年归档 |
| `src/pages/about.astro` | 10 | 关于页（独立 header） |
| `src/pages/posts/[...id].astro` | 11/12 | 文章详情 + 内联 sumi.ts（pointerTracking/ripple/brushDivider/charReveal/ariaCurrent）+ `.clipboard-copy` 朱印 |
| `src/content/posts/*.md` | — | 博客文章 |
| `src/content/spec/about.md` | — | 关于页面内容 |
| `docs/plans/2026-05-19-sumi-e-blog-restyle.md` | 0-12 | 迁移计划（13 Task spec + reviewer 决议） |
| `docs/plans/2026-05-19-sumi-e-blog-restyle-COMPLETED.md` | 13 | 迁移完成报告（commit 链 + D1-D8 + 不修项理由 + 已知约束） |
| `.github/workflows/deploy.yml` | — | GitHub Actions 自动部署 |

### sumi 注释惯例（维护指引）

- `global.css` 各 Task 段顶部用 `═══════════════════════════` 包裹的标题行，写明 `Task N — 主题`
- 1:1 镜像段（D5 article.prose）有 `byte-equality / md5 / head -n 1937` 锚注释，**修改前必须先改 SRC 再重新 head -n 1937 镜像**（BSD `head` 必须带 `-n`，否则 `1937` 不被当行数）
- 双向同步护栏：Task 11 sumi.ts 与 `[...id].astro` 内联是单向镜像（SRC → 本仓库），不双向编辑
- 局部镜像（Task 7 `.mini-seal`）不污染 Task 3 全局 token，作用域用 `.site-*` BEM 前缀隔离
