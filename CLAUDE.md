# 思辨录 — 个人博客

## 项目概况

| 项 | 值 |
|---|---|
| **名称** | 思辨录 / AI Perspectives |
| **定位** | 中文 AI 内容解析博客，面向普通读者 |
| **基座主题** | [Astro Theme Typography](https://github.com/moeyua/astro-theme-typography) |
| **技术栈** | Astro + TypeScript + UnoCSS |
| **部署** | GitHub Pages → `eamanc.github.io` |
| **仓库** | `git@github.com:eamanc-lab/eamanc.github.io.git` |

## 背景

2026-04-05 启动。目标是搭建一个部署在 GitHub Pages 上的个人博客，用于发布中文 AI 内容解析文章，面向普通读者。

### 设计决策过程

1. **主题选型**：调研了 30+ 个 GitHub Pages 博客和主题（Lil'Log、colah's blog、Karpathy、Gwern.net、Tonsky 等），最终选择 [Astro Theme Typography](https://github.com/moeyua/astro-theme-typography) 作为基座——它是极少数从一开始就为中文排版优化的主题，衬线体风格符合「高级 + 艺术」的定位。

2. **设计语言定义**：基于 Lavie & Tractinsky (2004) 的经典/表现性美学双维度模型和 Quiet Luxury 设计理论，建立了评估框架：
   - **高级感** = 经典美学 × 克制（删减到只剩必要）
   - **艺术感** = 表现性美学 × 意图性（每个元素都有表达目的）
   - 交集 = 克制的衬线排版传递文化品味

3. **定制方向**：保留原版主题的灵魂（衬线体 + 克制 + 呼吸感），但所有视觉实现重新设计，避免直接复制。核心差异点：亚麻纹理背景、首字下沉、链接悬停展开动画、阅读进度条、签名式标题。

### 风格参考坐标系

以下参考在同一个设计语言内，可组合借鉴：

| 参考 | 借鉴点 |
|------|--------|
| Astro Theme Typography 原版 | 衬线体 + 中文排版基础 |
| Hugo Paper | 米白暖色调 |
| Zaduma | 行宽 65ch、悬停淡化 |
| Aesop 官网 | 「克制 + 有性格」的工业标杆 |
| Toteme 官网 | 柔和单色系、慢节奏滚动 |

### 当前状态

- ✅ 设计定稿（色彩/字体/纹理/布局/交互）
- ✅ 5 篇示例文章（AI 解析 / 行业观察 / 思考）
- ✅ 静态构建通过（`pnpm build` → `dist/`）
- ✅ GitHub Actions 自动部署配置
- ⏳ 替换示例文章为真实内容
- ⏳ 首次推送部署

---

## 设计规范

### 设计语言

**核心原则：克制即高级，排版即艺术。**

- 高级感 = 经典美学 × 克制（通过删减而非堆积传递力量）
- 艺术感 = 表现性美学 × 意图性（每个设计选择都有明确的「为什么」）
- 签名细节 = 衬线体（传递古典印刷品味）

### 色彩系统

| 变量 | 亮色模式 | 暗色模式 | 用途 |
|------|---------|---------|------|
| `primary` | `#2c3e50` | `#e8e6e3` | 正文文字 |
| `background` | `#fafaf8`（米白） | `#1a1a2e`（深靛蓝） | 页面背景 |
| `--accent-color` | `#8b7355`（琥珀） | `#c4a882`（金色） | 链接、强调、首字下沉、进度条 |
| `--accent-light` | `#b8a088` | `#8a7560` | 链接下划线、滚动条 |

**规则：全站只用这套色板，不引入其他颜色。**

### 字体

| 用途 | 字体族 | 说明 |
|------|--------|------|
| 标题 (header) | Noto Serif SC → Source Han Serif SC → serif | 衬线体，传递品味 |
| 正文/UI (ui) | Noto Sans SC → Source Han Sans SC → PingFang SC → sans-serif | 无衬线，保证可读性 |

### 排版参数

| 参数 | 值 | 来源 |
|------|---|------|
| 正文行宽 | `65ch` | 排版学黄金阅读宽度 |
| 正文行高 | `1.85` | 中文汉字笔画密度需要更大行高 |
| 字间距 | `0.02em` | 微调 |
| 段间距 | `1.5em` | |
| h2 上边距 | `2.5em` | 章节间呼吸感 |

### 背景纹理

- **类型**：亚麻编织纹（`public/linen.png`，800×800px）
- **亮色 opacity**：`0.3`
- **暗色 opacity**：`0.25`（+ `filter: invert(1)`）
- **纤维间距**：横 8px / 纵 10px，明暗差 ~30

### 自定义特性（区别于原版主题）

| 特性 | 实现位置 | 说明 |
|------|---------|------|
| 亚麻纹理背景 | `global.css` `html::before` | 替代原版网格线 |
| 首字下沉 (Drop Cap) | `global.css` `.post-detail` | 仅文章详情页，琥珀色衬线体 |
| 链接悬停展开 | `global.css` `background-size` 动画 | 下划线渐展为背景填充 |
| 阅读进度条 | `LayoutPost.astro` | 文章页顶部 2px 琥珀色进度线 |
| 文字选中色 | `global.css` `::selection` | 琥珀色选中 |
| 渐变分割线 | `global.css` `article.prose hr` | 居中渐变短线，max-width 160px |
| 列表悬停淡化 | `global.css` | 非焦点项 opacity 0.5 |
| 缓出入场动画 | `global.css` `gentle-rise` | cubic-bezier(0.23, 1, 0.32, 1) |
| 细滚动条 | `global.css` `::-webkit-scrollbar` | 4px 宽 + 强调色 |
| 标题签名式 | `SiteTitle.astro` | 居中大字 + 短横线 + 小字副标题 |
| 暗色非纯黑 | `user.ts` | `#1a1a2e` 深靛蓝 |

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

| 文件 | 用途 |
|------|------|
| `src/.config/user.ts` | 站点配置（标题、色彩、字体、社交链接） |
| `src/.config/default.ts` | 主题默认配置（不要直接改） |
| `src/styles/global.css` | 所有自定义样式 |
| `src/components/SiteTitle.astro` | 博客标题组件 |
| `src/layouts/LayoutPost.astro` | 文章详情页布局（含进度条） |
| `src/content/posts/*.md` | 博客文章 |
| `src/content/spec/about.md` | 关于页面 |
| `public/linen.png` | 亚麻纹理背景图 |
| `.github/workflows/deploy.yml` | GitHub Actions 自动部署 |
