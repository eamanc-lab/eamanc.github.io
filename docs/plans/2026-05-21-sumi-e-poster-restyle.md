# sumi-e v3 海报式布局重做 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 把博客的基座右侧栏布局整套替换为 sumi-e showcase 的海报式构图(顶部 nav bar + hero 大字 + 巨型背景"墨"字 + section grid + widget card),让"墨"的味儿真正成画。

**Architecture:** 重做 `LayoutDefault.astro` 骨架(去 `.paper-stage` 的右栏依赖),新建 `TopNav.astro`、`Hero.astro`、`SectionHead.astro` 三个 sumi-e 原生组件;5 个页面(首页/归档/分类索引/单分类/单标签/关于/文章详情)按"hero + grid sections"模式重排;article.prose 1:1 锚(D5 byte-equality)与 token 系统(D1-D8)整套**不动**。

**Tech Stack:** Astro 5 + UnoCSS + TypeScript + Shiki dual theme + swup;复用 v2 已有的 SVG defs(#ink-bleed / #ink-bleed-btn / #ink-goo / #inkGrad)+ token + sumi.ts 5 项 init。

---

## 决策记录(承接 D1-D8,新增 D9-D11)

| ID | 决策 | 落点 |
|----|------|------|
| **D9** | **不抄 SRC 的 widget showcase 内容**(lockscreen tiles / sliders / inputs / check & radio 等都是组件库展示用,博客不需要);**只抄 SRC 的布局骨架 + hero 美学 + section 节奏**(`.topnav` / `.hero` / `.bg-char` / `.section-head` / `.ink-card` / `.grid-3` 这一组)。SRC 文学标签"起承转字文合序分尾"映射为博客自有语义(起·近作 / 承·分类 / 转·关于 / 尾·订阅)。 | 本 plan 全 Task |
| **D10** | **D5 byte-equality 锚不动** — Task 5 article.prose 1:1 镜像段(md5 `490feea01ab52416593d029d431035de`)是文章详情页正文排版的唯一权威。本次重做只在 article.prose **外**(`.hero` / `.topnav` / `.section-head` / widget card 包装层)做骨架替换,prose 内部不碰一行。 | 全 Task hard 约束 |
| **D11** | **基座 SiteTitle/SiteNavigation/SiteFooter 组件保留但脱钩** — 旧三件套不再被新 LayoutDefault 引用(由 TopNav + 新 footer 替代),但文件留在 repo 内不删,因为 v2 设计规范文档仍引用它们做对比基线。下次清仓 commit 再删。 | Task 1 + LayoutDefault.astro |

---

## 关键文件锚点表

| 文件 | 类型 | Task | 说明 |
|------|------|------|------|
| `src/layouts/LayoutDefault.astro` | 重写 | 1 | 去基座右栏,变 `<TopNav /> <main class="page-stage"> <slot /> </main> <SiteFooter />`;SVG defs + ThemeScript + paper-stage 三层纸保留 |
| `src/components/TopNav.astro` | **新建** | 2 | SRC `.topnav` 1:1(brand glyph + 横向 links + search-trigger placeholder + aria-current 走当前 path) |
| `src/components/Hero.astro` | **新建** | 3 | SRC `.hero` 1:1(可配置 props:eyebrow / title / sub / cta / marquee / bg-char,h1 接 `.char` 逐字入场) |
| `src/components/SectionHead.astro` | **新建** | 4 | SRC `.section-head` 1:1(eyebrow 文学标签 + h2 + p);后续每个 section 内容自定义 |
| `src/components/PostCard.astro` | **新建** | 5 | 替换现有 `<article class="ink-card layered">` 内联,封装 SRC `.ink-card` widget 风格(h3 标题 + 元信息 row + 描述 line-clamp-3) |
| `src/styles/global.css` | 增量 | 1-5 | 新增 `.topnav / .hero / .bg-char / .section-head / .grid-3 / .grid-2` 段(全 1:1 镜像 SRC line 948-1310),不动 Task 3-12 既有段(article.prose / .ink-card 老规则等) |
| `src/pages/[...page].astro` | 重写 | 6 | 首页:`<Hero ...>` + "起·近作" `<SectionHead>` + `<PostCard grid-3>` + "承·分类" chip 行 + "转·关于" 简短 |
| `src/pages/archive.astro` | 重写 | 7 | mini-Hero("尾·归档"小标)+ 按年 SectionHead + 列表(行式,保留现风格) |
| `src/pages/categories/index.astro` | 重写 | 7 | mini-Hero("承·分类")+ 分类 grid + 标签云保留 |
| `src/pages/categories/[...category].astro` | 重写 | 7 | mini-Hero(分类名)+ PostCard grid-3 |
| `src/pages/tags/[...tag].astro` | 重写 | 7 | mini-Hero(标签名)+ PostCard grid-3 |
| `src/pages/about.astro` | 重写 | 7 | Hero(大字"关于")+ manifesto 长文 article.prose |
| `src/pages/posts/[...id].astro` | 微调 | 8 | 文章详情 hero:把 `.post-meta__title` 升 hero 字阶(`clamp(40px, 5.6vw, 72px)`)+ 加 `.bg-char` 取首字(如"你");prose 内部不动 |
| `src/components/SiteTitle.astro` / `SiteNavigation.astro` / `SiteFooter.astro` | 脱钩 | 1 | 文件保留但不再被引用(D11) |

---

## Task 1: LayoutDefault 骨架重写 + 三件套脱钩

**Files:**
- Modify: `src/layouts/LayoutDefault.astro`
- Reference (不动): `src/components/SiteTitle.astro` / `SiteNavigation.astro` / `SiteFooter.astro` / `SumiBackground.astro` / `SumiFilters.astro`

**Steps:**

1. 备份当前 LayoutDefault.astro 的 head + 主体结构(SVG defs / ThemeScript / fonts <link> / paper-stage / sumi.ts 内联 module 不动)。
2. 删除 main 区域内的 `<aside class="...">` 右侧栏(SiteTitle/SiteNavigation/SiteFooter)+ 文章列表 `<section>` 嵌套结构。
3. 替换为骨架:
   ```astro
   <body>
     <SumiBackground />
     <SumiFilters />
     <TopNav />
     <main class="page-stage" id="swup">
       <slot />
     </main>
     <footer class="site-footer">...</footer>
   </body>
   ```
4. `.page-stage` 容器 CSS(global.css 新增):`max-width: 1200px / margin: 0 auto / padding: 0 var(--sp-6)`,desktop 居中。
5. 保留 `.paper-stage` + SVG defs + sumi.ts module 不动。

**Verify:**
- `pnpm typecheck` 0 error
- `pnpm build` 8 page 全产出
- 旧三件套文件仍存在但不被任何 page 引用(grep `import.*SiteTitle\|SiteNavigation\|SiteFooter` 0 命中)

**Commit message:** `refactor(layout): LayoutDefault 骨架重写,去基座右栏 + 三件套脱钩(D11)`

---

## Task 2: TopNav 组件(SRC .topnav 1:1)

**Files:**
- Create: `src/components/TopNav.astro`
- Modify: `src/styles/global.css`(新增 `.topnav` 段,镜像 SRC 948-1042)

**Steps:**

1. `<TopNav>` SSR 计算 `Astro.url.pathname` → 拿当前页路径,给对应 nav link 加 `aria-current="page"`(替代 sumi.ts initAriaCurrent 的运行时逻辑,SSR 一次到位更稳)。
2. DOM 结构(1:1 SRC line 3197-3201 + 自有路由表):
   ```astro
   <header class="topnav">
     <a class="brand" href={withBase('/')}>
       <span class="glyph" aria-hidden="true">墨</span>
       <span class="name">雾散之前 <span class="sub">FROM-MIST</span></span>
     </a>
     <div class="spacer"></div>
     <nav class="links">
       {navLinks.map(...)}
     </nav>
     <button class="search-trigger" disabled title="搜索(暂未启用)">
       <svg ...></svg>
       <span>搜索文章 …</span>
       <span class="kbd">⌘ K</span>
     </button>
   </header>
   ```
3. CSS 段镜像 SRC line 948-1039(无改动),作用域裹在 `.topnav` 里不污染基座。
4. mobile 适配:`<375px` 时 `.search-trigger` 隐藏,nav links gap 缩小。
5. 删除 `LayoutDefault.astro` 内对 SiteNavigation 的引用,改为 `<TopNav />`。

**Verify:**
- 5 页 desktop 1440 / mobile 375 — `.topnav` 顶部 sticky + backdrop-blur 生效
- aria-current 在当前页对应 link 上 + 笔触下划线生效
- 0 console error
- 点击导航 swup 过渡仍工作

**Commit:** `feat(topnav): TopNav 组件,SRC .topnav 1:1 镜像 + SSR aria-current`

---

## Task 3: Hero 组件(SRC .hero 1:1)

**Files:**
- Create: `src/components/Hero.astro`
- Modify: `src/styles/global.css`(新增 `.hero / .bg-char` 段,镜像 SRC 1041-1166)

**Steps:**

1. Props 接口(可配置不同页面 hero 强度):
   ```ts
   interface Props {
     eyebrow?: { seal?: string, label: string }   // {seal:'砚', label:'雾散之前 · 二〇二六'}
     title: string                                // "雾散之前" 或 "归档"
     titleAccent?: string                         // optional em 内嵌斜体片段(SRC 用 <em>在纸上</em>)
     sub?: string                                 // 副本段
     cta?: { label: string, href: string, variant?: 'primary' | 'seal' | 'outline' }[]
     marquee?: string[]                           // 底部 chip 行
     bgChar?: string                              // 巨型背景字,默认 '墨';归档可 '尾',分类可 '承'
     compact?: boolean                            // mini-hero 模式(min-height 36vh 而非 72vh,字号 clamp(36, 4vw, 64))
   }
   ```
2. h1 字符拆分:SSR 时按 `Array.from(title)` 拆 char,wrap 在 `<span class="char">{ch}</span>`(SRC 1087-1115 .char 逐字入场),sumi.ts initCharReveal 接管入场动画。
3. CSS 段:镜像 SRC line 1043-1166 全段(`.hero / .hero .eyebrow / .hero h1 / .hero p.sub / .hero .cta / .hero .marquee / .hero .bg-char`)+ 加 compact 变体规则。
4. 暗模 `.bg-char` opacity 0.08(`:root[data-mode="night"]` → 改为 `html.dark`,对应 D4 桥接)。

**Verify:**
- Hero 渲染 desktop 100vh 视野满字感(`min-height: 72vh`)
- bg-char "墨"在右侧巨大半透明,亮 0.045 / 暗 0.08
- char-reveal 入场动画生效(sumi.ts 接管)
- 0 console error

**Commit:** `feat(hero): Hero 组件,SRC .hero 1:1 + props 化(compact/marquee/cta/bg-char)`

---

## Task 4: SectionHead 组件(SRC .section-head 1:1)

**Files:**
- Create: `src/components/SectionHead.astro`
- Modify: `src/styles/global.css`(新增 `.section-head` 段,镜像 SRC 350-405)

**Props:**
```ts
{
  eyebrow: { cal: string, label: string }    // {cal:'起', label:'01 / Recent'}
  title: string                              // "起·近作" / "承·分类" / "转·关于"
  sub?: string                               // 子标说明段
}
```

**Verify:**
- 3 处使用点(首页"起·近作"/"承·分类"/"转·关于")外观与 SRC 完全一致
- `.cal` 朱印书法体字 + 小数字标签

**Commit:** `feat(section-head): SectionHead 组件 + .section-head CSS 1:1`

---

## Task 5: PostCard widget 组件 + grid-3

**Files:**
- Create: `src/components/PostCard.astro`
- Modify: `src/styles/global.css`(`.ink-card` 段对齐 SRC widget 风,加 `.grid-3` 容器 + `.post-card__title` 等 BEM)

**Steps:**

1. 现有 `.ink-card` 规则(global.css ~1170 段)对照 SRC line 1169-1310 检查:目前实现已基本对齐(layered + wash hook + cubic-bezier hover),但元信息布局需调整为 SRC widget 风(h3 + meta row + 描述,而非现在的 h1.post-title)。
2. PostCard 组件 props:`{ post: Post }`,内部渲染 h3 标题(`var(--font-display)` 1.32rem)+ row(date + category chip + tags 折叠为 +N)+ 描述 line-clamp-3。
3. `.grid-3` 容器(SRC 342):`display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4)` + `<992px` 折 2 列 + `<640px` 折 1 列。
4. 不破坏现有 `.wash` 鼠标墨迹 + char-reveal 钩子(sumi.ts 不动)。

**Verify:**
- 首页 grid-3 渲染(假设 ≥3 篇文章;只 1 篇时降级 grid-1 居中卡片)
- 文章卡 hover wash 工作(`--mx/--my` 更新)
- 移动 375 折叠 1 列

**Commit:** `feat(post-card): PostCard widget 组件 + grid-3 容器`

---

## Task 6: 首页重做(Hero + 起·近作 grid + 承·分类 chips + 转·关于)

**Files:**
- Modify: `src/pages/[...page].astro`

**结构:**
```astro
<LayoutDefault>
  <Hero
    eyebrow={{seal: '砚', label: '雾散之前 · 二〇二六'}}
    title="雾散之前"
    sub="一份个人博客 — 用普通人的语言,把 AI 解析给非技术读者。慢思考,克制写,水墨气。"
    cta={[
      { label: '开始阅读 →', href: withBase('/posts/...'), variant: 'primary' },
      { label: '关于我', href: withBase('/about'), variant: 'outline' },
    ]}
    marquee={['AI 解析', '中文写作', '克制设计', '慢思考']}
    bgChar="墨"
  />

  <section class="page-section">
    <SectionHead eyebrow={{cal:'起',label:'01 / Recent'}} title="近作" sub="最近的几篇文章。" />
    <div class="grid-3">
      {page.data.map((post) => <PostCard post={post} />)}
    </div>
    <Pagination ... />
  </section>

  <section class="page-section">
    <SectionHead eyebrow={{cal:'承',label:'02 / Categories'}} title="分类" sub="按主题聚合的写作脉络。" />
    <div class="chip-row">{categoryList.map(cat => <a class="chip">{cat}</a>)}</div>
  </section>

  <section class="page-section">
    <SectionHead eyebrow={{cal:'转',label:'03 / About'}} title="关于" sub="Eaman · 一个 AI 应用探索的工程师。" />
    <p>...</p>
    <a class="btn outline" href={withBase('/about')}>了解更多</a>
  </section>
</LayoutDefault>
```

**Verify:**
- desktop 1440 hero 占满视野
- 3 section 节奏清晰
- mobile 375 各 section 正常折叠

**Commit:** `feat(home): 首页重做,Hero + 起·近作 + 承·分类 + 转·关于`

---

## Task 7: 列表页统一(归档/分类索引/单分类/单标签/关于)

**Files:**
- Modify: `src/pages/archive.astro` / `src/pages/categories/index.astro` / `src/pages/categories/[...category].astro` / `src/pages/tags/[...tag].astro` / `src/pages/about.astro`

**统一模式:**
```astro
<LayoutDefault>
  <Hero compact title="归档" sub="按年时间索引。" bgChar="尾" />
  <section class="page-section">
    <SectionHead eyebrow={{cal:'尾',label:'Archive'}} title="按年" />
    {yearMap.map(...)}
  </section>
</LayoutDefault>
```

- archive: `bgChar="尾"`,按年分组保留行式列表
- categories/index: `bgChar="承"`,分类 grid + tag-cloud 在第二 section
- categories/[...category]: `bgChar="承"`,title 用分类名,PostCard grid-3
- tags/[...tag]: `bgChar="文"`,title 用 `#标签`,PostCard grid-3
- about: 完整 Hero(非 compact),title="关于",markdown 内容渲染在 article.prose 内

**Verify:**
- 5 页结构统一
- 各页 bgChar 字符不同,语义匹配
- swup 切页流畅

**Commit:** `feat(list-pages): 5 个列表/关于页统一为 Hero(compact) + Section grid`

---

## Task 8: 文章详情页 hero 升级

**Files:**
- Modify: `src/pages/posts/[...id].astro` + `src/layouts/LayoutPost.astro` + `src/components/PostMeta.astro`

**改动:**

- `.post-meta__title` 升 hero 字阶(从 2.1rem → `clamp(40px, 5.6vw, 72px)`),加 bg-char 取文章首字(如"你"对应 hello-world)
- `.post-meta` 容器从 article.prose 内部 header 移到 article.prose **外**,变成详情页的 hero 区
- article.prose 保留 1:1 锚(D5 byte-equality) — 改前重新对 md5 验证锚段未动

**Verify:**
- 文章详情页打开第一屏占满 hero(标题大字 + 元信息行)
- 滚动后正文 article.prose 与之前完全一致(byte-equality 验证)
- 阅读进度条朱砂笔触保留

**Commit:** `feat(post-detail): 文章详情页 hero 化,标题升 clamp(40-72px) + 首字 bg-char`

---

## Task 9: TopNav 路由表 + aria-current

**Files:**
- Modify: `src/.config/user.ts`(navLinks 增加首页 link,与 TopNav 一致)
- Modify: `src/components/TopNav.astro`(完善 SSR aria-current 匹配逻辑,边界 case:trailing slash / 子路径 / 通配)

**Steps:**

1. user.ts navLinks 重排:`首页(/) / 文章(/posts) / 归档(/archive) / 分类(/categories) / 关于(/about)`
2. TopNav SSR match:`Astro.url.pathname` 去尾斜杠,与 nav.href 去 base 去尾斜杠对比;`/` 和 `/posts/*` 都视为"首页/文章"组的匹配
3. 删除 sumi.ts 的 initAriaCurrent(SSR 一次到位,不需要运行时切换)
4. swup `page:view` 不需要重跑 aria-current(每页 SSR 已正确)

**Verify:**
- 5 页面分别在 TopNav 高亮对应链接
- swup 切页时高亮自动更新(因为 swup 替换 `<main>` 但 `<header>` 不变 → 这里需要手动加 swup hook 切换 aria-current,或者 swup `updateHead: true` 已替换 head — 但 topnav 在 body 里,需要 swup 配置 `containers: ['#swup', 'header.topnav']` 让 topnav 也被替换)
- 建议方式:把 topnav 加入 swup containers(更稳)

**Commit:** `feat(topnav): aria-current SSR + swup containers 包含 topnav`

---

## Task 10: 设计 review + Playwright headless 视觉验证

**Verify 矩阵:**

- desktop 1440 × light/dark × 6 页(首/归档/分类索引/单分类/单标签/关于/文章详情) = 14 截图
- mobile 375 × light/dark × 6 页 = 14 截图
- swup 过渡(点击 nav 切换 5 路径)0 error
- 鼠标墨迹 wash on PostCard hover
- ripple 水波 on chip pointerdown
- char-reveal hero h1 入场
- console 0 error 全程
- 网络请求 0 404
- Lighthouse SEO / a11y / best-practice 三项 ≥90

**生成 `.testshots/v3-*.png` 全套,纳入完工 commit 用,但 .testshots/ 已 gitignore。**

**Commit:** `chore(test): v3 海报式布局视觉验证矩阵全过`

---

## Task 11: 部署 + 线上验证 + 文档更新

**Files:**
- Modify: `CLAUDE.md`(更新设计语言节,新增 v3 海报式构图段 + D9-D11 决策记录)
- Modify: `docs/plans/2026-05-21-sumi-e-poster-restyle.md` → 重命名为 `-COMPLETED.md` + 加完成报告

**Steps:**

1. `git push origin main` 触发 GitHub Actions
2. 等 deploy run 完成
3. curl 实测 `https://eamanc-lab.github.io/eamanc.github.io/` 返回 HTTP 200
4. Chrome devtools 实测线上 5 路径每页都正确显示新海报布局
5. CLAUDE.md 更新"当前状态"段 + 设计规范节(加 D9-D11 + 海报美学描述 + 关键文件锚表)
6. 完工报告生成

**Commit:** `docs: v3 sumi-e 海报式布局重做完工 + CLAUDE.md 更新`

---

## 风险 & 回滚

| 风险 | 概率 | 缓解 |
|------|------|------|
| article.prose D5 byte-equality 锚被意外触碰 | 中 | 每 Task implementer 跑前必先 `md5 <(sed -n '1,1937p' src/styles/global.css)` 锁基线,跑后再 md5 对比;Task 5 跨 commit 锚校验仍执行 |
| Hero h1 char-reveal 与 sumi.ts initCharReveal 选择器冲突 | 低 | 复用 SRC `.char` 类名(与 sumi.ts 已支持的钩子一致),不引入新选择器 |
| TopNav sticky 与 swup containers 冲突(swup 替换 `<main>` 后 sticky 状态可能丢) | 中 | 把 `.topnav` 排除 swup containers,只替换 `<main>` 内容;aria-current 走 swup `page:view` hook 手动切 |
| GitHub Pages 子路径 `/eamanc.github.io/` 导致 hero CTA href 错 | 低 | 全套用 `withBase()` helper(v2 已有,a51b2d9 commit) |
| 文章数量少(目前 1 篇)首页 grid-3 视觉空旷 | 高 | grid-3 自动降级 grid-1 + 加占位卡片 "更多正在路上 …"(Task 5 内实现) |
| 完工后用户仍觉得"不够 sumi-e" | 中 | Task 10 review 阶段做 SRC vs 当前并排截图对比,差异点逐条排查 |

**回滚策略:** 每 Task commit 独立,如果某 Task 评审不通过 → 回到上一 commit 重做该 Task,不影响其他 Task。最坏情况整体 revert 到 `4bf643c`(本 plan 启动前的 last commit)。

---

## 时间预估

| Task | 工时(含 spec/quality review loop)|
|------|-----|
| 1 LayoutDefault 骨架 | 30-45min |
| 2 TopNav 组件 | 60-90min |
| 3 Hero 组件 | 60-90min |
| 4 SectionHead 组件 | 30min |
| 5 PostCard widget | 45-60min |
| 6 首页重做 | 45-60min |
| 7 5 个列表/关于页 | 90-120min |
| 8 文章详情 hero | 30-45min |
| 9 TopNav 路由 + swup | 30-45min |
| 10 视觉验证矩阵 | 45-60min |
| 11 部署 + 文档 | 30min |
| **总计** | **8-12h**(连续工作),实际 1.5-2 个工作日 |

---

## 执行方式

按 superpowers:subagent-driven-development:每 Task 走 implementer → spec review → quality review,review 不通过则回 implementer 修,过了才推进下一 Task。
