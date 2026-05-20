import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import swup from '@swup/astro'
import robotsTxt from 'astro-robots-txt'
import { defineConfig } from 'astro/config'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import UnoCSS from 'unocss/astro'
import devtoolsJson from 'vite-plugin-devtools-json'
import { themeConfig } from './src/.config'

// https://astro.build/config
export default defineConfig({
  site: themeConfig.site.website,
  prefetch: true,
  base: '/',
  vite: {
    plugins: [
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      devtoolsJson(),
    ],
  },
  markdown: {
    remarkPlugins: [
      remarkMath,
    ],
    rehypePlugins: [
      rehypeKatex,
    ],
    shikiConfig: {
      // ─── Task 12 ⑫.0 — D8:代码块走 sumi 单色墨风(关 dracula 暗紫与宣纸冲突) ───
      // 取舍记录(implementer note):
      //   A 单 theme 'github-light' / 'min-light' → 简单,但 html.dark 下底偏白与暗夜失谐;
      //   B 双 theme + defaultColor:false        → 本选项;Shiki 注入 `--shiki-dark` CSS var,
      //                                            由 html.dark 段(global.css Task 12 ⑫.1)
      //                                            swap 显示色,亮/暗各自协调,克制不过度;
      //   C 'css-variables' 全自管             → 最纯但需为每个 token 单独写 var,与本博客
      //                                            仅一篇示例文档当前 ROI 不匹配。
      // 颜色对:
      //   light: 'github-light'        近单色浅 token,与米黄宣纸调最相容;
      //   dark : 'github-dark-dimmed'  低饱和暗主题,与 sumi 夜底 (#1a1a2e 系) 协调。
      // defaultColor:false → Shiki 不内联绝对 color,而是输出 `style="color:LIGHT;
      //   --shiki-dark:DARK;--shiki-dark-bg:..."`,CSS 主导切换。
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      defaultColor: false,
      wrap: true,
    },
  },
  integrations: [
    UnoCSS({ injectReset: true }),
    mdx({}),
    robotsTxt(),
    sitemap(),
    swup({
      theme: false,
      animationClass: 'transition-swup-',
      cache: true,
      preload: true,
      accessibility: true,
      smoothScrolling: true,
      updateHead: true,
      updateBodyClass: true,
    }),
  ],
})
