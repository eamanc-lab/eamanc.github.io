import type { SEOProps } from 'astro-seo'
import type {
  AvailableLanguage,
  BooleanString,
  InputPosition,
  Loading,
  Mapping,
  Repo,
  Theme,
} from 'giscus'
import type { LANGUAGES } from '../i18n.ts'

// astro-seo 0.8.x 不再从包入口导出 `Link` / `Meta`(它们经 `@ts-ignore`
// 的 `export * from "./SEO.astro"` 暴露,tsc 不可见)。这里改为从其公开
// 导出的 `SEOProps` 中提取同款类型(`SEOProps['extend'].link/meta` 的元素),
// 与原 `Partial<Link>` / `Partial<Meta>` 语义完全一致,且不引入 any/ts-ignore。
type SEOExtend = NonNullable<SEOProps['extend']>
type Link = NonNullable<SEOExtend['link']>[number]
type Meta = NonNullable<SEOExtend['meta']>[number]

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
}

export interface ThemeConfig {
  site: ConfigSite
  appearance: ConfigAppearance
  seo: ConfigSEO
  comment: Partial<ConfigComment>
  rss: ConfigRSS
  analytics: ConfigAnalytics
  latex: ConfigLaTeX
}

export type UserConfig = DeepPartial<ThemeConfig>

export interface ConfigSite {
  title: string
  subtitle: string
  author: string
  description: string
  website: string
  pageSize: number
  socialLinks: { name: string, href: string }[]
  navLinks: { name: string, href: string }[]
  categoryMap: { name: string, path: string }[]
  footer: string[]
}

export interface ConfigAppearance {
  theme: 'light' | 'dark' | 'system'
  locale: keyof typeof LANGUAGES
  colorsDark: Colors
  colorsLight: Colors
  fonts: Fonts
}

export interface ConfigSEO {
  twitter: string
  meta: Partial<Meta>[]
  link: Partial<Link>[]
}

export interface ConfigComment {
  disqus: Disqus
  giscus: Giscus
  twikoo: Twikoo
}

export interface ConfigRSS {
  fullText?: boolean
  /** https://github.com/RSSNext/follow */
  follow?: { feedId: string, userId: string }
}

export interface ConfigAnalytics {
  /** google analytics */
  googleAnalyticsId: string
  umamiAnalyticsId: string
}

export interface ConfigLaTeX {
  katex: boolean
}

interface Colors {
  primary: string
  background: string
}

interface Fonts {
  header: string
  ui: string
  // TODO: 未实现
  _article?: string
  _code?: string
}

interface Twikoo {
  envId: string
  region?: string
  lang?: string
}

interface Disqus {
  shortname: string
}

interface Giscus {
  repo: Repo
  repoId?: string
  category?: string
  categoryId?: string
  mapping?: Mapping
  term?: string
  strict: BooleanString
  reactionsEnabled: BooleanString
  emitMetadata: BooleanString
  inputPosition: InputPosition
  theme: Theme
  lang: AvailableLanguage
  loading: Loading
}
