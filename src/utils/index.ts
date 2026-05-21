import type { Post } from '~/types'
import { getCollection } from 'astro:content'
import dayjs from 'dayjs'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

export async function getCategories() {
  const posts = await getPosts()
  const categories = new Map<string, Post[]>()

  for (const post of posts) {
    if (post.data.categories) {
      for (const c of post.data.categories) {
        const posts = categories.get(c) || []
        posts.push(post)
        categories.set(c, posts)
      }
    }
  }

  return categories
}

export async function getPosts(isArchivePage = false) {
  const posts = await getCollection('posts')

  posts.sort((a, b) => {
    if (isArchivePage) {
      return dayjs(a.data.pubDate).isBefore(dayjs(b.data.pubDate)) ? 1 : -1
    }

    const aDate = a.data.modDate ? dayjs(a.data.modDate) : dayjs(a.data.pubDate)
    const bDate = b.data.modDate ? dayjs(b.data.modDate) : dayjs(b.data.pubDate)

    return aDate.isBefore(bDate) ? 1 : -1
  })

  if (import.meta.env.PROD) {
    return posts.filter(post => post.data.draft !== true)
  }

  return posts
}

const parser = new MarkdownIt()
export function getPostDescription(post: Post) {
  if (post.data.description) {
    return post.data.description
  }

  const html = parser.render(post.body || '')
  const sanitized = sanitizeHtml(html, { allowedTags: [] })
  return sanitized.slice(0, 400)
}

export function formatDate(date: Date, format: string = 'YYYY-MM-DD') {
  return dayjs(date).format(format)
}

export function getPathFromCategory(
  category: string,
  category_map: { name: string, path: string }[],
) {
  const mappingPath = category_map.find(l => l.name === category)
  return mappingPath ? mappingPath.path : category
}

/**
 * 把 path 拼到 import.meta.env.BASE_URL 之下。
 *
 * 背景:GitHub Pages project Pages(repo 名 `eamanc.github.io`,owner `eamanc-lab`)
 *   部署到子路径 `/eamanc.github.io/`。Astro 不会自动给 `<a href>` 拼 BASE_URL
 *   (只有 `<Image>` / `<script>` 等内置组件会处理),手写 `<a href="/archive">`
 *   会跳到 `https://eamanc-lab.github.io/archive`(404)而非
 *   `https://eamanc-lab.github.io/eamanc.github.io/archive`。
 *
 * 设计要点:
 *   · 幂等 — Astro paginate 输出的 `page.url.prev/next` 已含 base,二次套用安全
 *     (短路返回);
 *   · 外链原样 — `http(s)://` / `mailto:` / `#` 锚点 / 协议相对 `//` 不动;
 *   · base 自带末斜杠(Astro 规范),实现时去除 path 前导 `/` 避免双斜杠。
 *
 * @example
 *   withBase('/')                  // dev '/' · prod '/eamanc.github.io/'
 *   withBase('/posts/foo/')        // prod '/eamanc.github.io/posts/foo/'
 *   withBase('/eamanc.github.io/') // prod 原样(幂等)
 *   withBase('https://x.com')      // 原样(外链)
 */
export function withBase(path: string | undefined | null): string {
  const base = import.meta.env.BASE_URL // 末尾必带 '/',如 '/eamanc.github.io/' 或 '/'
  if (!path) return base
  // 外链/锚点/特殊协议(http: / mailto: / # / 协议相对 //)不动
  if (/^([a-z][a-z\d+\-.]*:|#|\/\/)/i.test(path)) return path
  // 幂等:已经在 base 下(且 base 不是根 '/'),原样返回
  if (base !== '/' && (path === base || path.startsWith(base))) return path
  const stripped = path.startsWith('/') ? path.slice(1) : path
  return base + stripped
}
