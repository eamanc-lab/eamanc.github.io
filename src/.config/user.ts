import type { UserConfig } from '~/types'

export const userConfig: Partial<UserConfig> = {
  site: {
    title: '雾散之前',
    subtitle: '保持呼吸',
    author: 'Eaman',
    description: '用普通人能懂的语言，解析前沿 AI 技术与趋势',
    website: 'https://eamanc.github.io/',
    pageSize: 5,
    socialLinks: [
      {
        name: 'github',
        href: 'https://github.com/eamanc-lab',
      },
      {
        name: 'twitter',
        href: 'https://x.com/eamanc_',
      },
    ],
    navLinks: [
      {
        name: '文章',
        href: '/',
      },
      {
        name: '归档',
        href: '/archive',
      },
      {
        name: '分类',
        href: '/categories',
      },
      {
        name: '关于',
        href: '/about',
      },
    ],
    categoryMap: [
      { name: 'Agent 协作', path: 'agent-collaboration' },
      { name: 'Skill 评测', path: 'skill-review' },
      { name: 'AI 信息素养', path: 'info-literacy' },
      { name: '电商 × AI', path: 'ecommerce-ai' },
      { name: '信息源', path: 'info-sources' },
      { name: '杂谈', path: 'misc' },
    ],
    footer: [
      '© %year <a target="_blank" href="%website">%author</a>',
    ],
  },
  appearance: {
    theme: 'system',
    locale: 'zh-cn',
    colorsLight: {
      primary: '#2b231c',
      background: '#faf7ee',
    },
    colorsDark: {
      primary: '#d5d0cb',
      background: '#190f0a',
    },
    fonts: {
      header:
        '"Noto Serif SC", "Cormorant Garamond", "Songti SC", "STSong", "Source Han Serif SC", serif',
      ui: '"Noto Sans SC", "Inter", "PingFang SC", "Hiragino Sans GB", -apple-system, system-ui, sans-serif',
    },
  },
  comment: {},
  analytics: {
    googleAnalyticsId: '',
    umamiAnalyticsId: '',
  },
  latex: {
    katex: false,
  },
}
