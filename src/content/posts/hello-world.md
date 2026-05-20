---
title: 你好，世界
pubDate: 2026-04-06
categories: ['杂谈']
tags: ['博客', '占位']
description: '这是一篇占位文章，用于验证博客模板的样式和功能是否正常。'
---

这是一篇占位文章。

当你看到这篇文章时，说明博客已经成功部署。这篇文章会在第一篇正式内容发布后删除。

## 标题示例

正文段落。用来确认排版参数（行高、字间距、段间距）是否符合预期。

> 引用块示例。用来确认左侧细线和缩进样式。

## 代码块示例

行内 `code` 走 sumi 单色墨。

```ts
// Astro 5 + Shiki 双 theme:sumi 单色墨
import { defineConfig } from 'astro/config'

export default defineConfig({
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
      defaultColor: false,
      wrap: true,
    },
  },
})
```

---

分割线上下的间距也在确认范围内。
