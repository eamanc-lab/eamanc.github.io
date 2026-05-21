/* ═══════════════════════════════════════════════════════════════════════════
   Task 11 — Sumi-e 交互 JS 移植 + swup 兼容
   ----------------------------------------------------------------------------
   把 Task 7-10 已落地的 CSS 钩子("等 JS")真正接通,核心交付五个 init 函数 +
   一个总入口 initSumi(),由 LayoutDefault.astro 末尾 <script> 在 `astro:page-load`
   事件(swup 软切换 + 首屏硬加载共同触发,Astro 官方契约)上重复调用。

   ── SRC 锚点(showcase.html) ──
     · trackPointer + initPointerTracking → SRC:6497-6510  (mouse-tracked highlight)
     · sumi-ring 水波环                    → SRC:21-71 CSS + SRC:7581-7619 JS
       (注:SRC 注释自标"N=7",实际 JS 移植仅 3 环 + 物理衰减 stagger 320ms;
        本 Task 1:1 保留 SRC 实现的 3 环而非注释里的 7 环——SRC 实现是真实参考)
     · char-reveal 逐字 keyframe          → SRC:4483-4495 `.sumix .char-reveal` +
       `.sumix-char-in` keyframe;本 Task 在 global.css ⑪ 段独立加 `@keyframes
        char-reveal` + `.ch` CSS(Task 3 无此 keyframe,新增不冲突)
     · brush-divider .in-view             → Task 3 已含 CSS(global.css:210-216),
       本 Task 仅写 IntersectionObserver 触发器(博客当前无 .brush-divider DOM 消费,
       0-target observer 不报错,留作未来内容接口)

   ── 三大设计约束 ──
     1. **幂等 idempotent**:重复调 initSumi() 不双绑事件。
        - 元素级:`dataset.sumiInit = '1'` 标记;已标记跳过。
        - 文档级(delegated):`documentElement.dataset.sumiRippleInit` 标记 ripple
          已绑一次到 document(ripple 用事件委托,document 是持久元素,只绑一次)。
        - char-reveal:已 wrap 过 <span class="ch"> 的标题 dataset.sumiInit='1' 标记,
          二次调用不会把已经拆字的标题再次拆字。
     2. **swup 兼容**:挂 `astro:page-load`(Astro 官方事件,swup `@swup/astro`
        integration 在每次软切换后自动派发,与首屏 DOMContentLoaded 行为统一)。
        - `<main>` 内是新 DOM(swup 替换 main):新 .ink-card / .post-meta__title
          自动重新绑事件 / 拆字(因为新元素无 dataset 标记)。
        - `<header>`/`<footer>` 持久(swup `animationClass:'transition-swup-'`
          替换 main 不替换 header/footer):dataset 标记保持 → 不重复绑事件;但
          `initAriaCurrent` 每次都跑(reset + set,无副作用 idempotent by nature)。
     3. **reduce-motion 降级**(`prefers-reduced-motion: reduce`):
        - pointer tracking:保留(无动画,只是 CSS 变量随鼠标流动,功能性 hover);
          CSS transition 已在 Task 9 global.css .ink-card>.wash 内是 .8s ease,
          motion-reduce 全局 transition * 1ms 由用户系统/UnoCSS reset 兜底,不破。
        - ripple:跳过(纯装饰,3 环水波环为体感动效,reduce 时不生成 DOM 也不浪费);
        - char-reveal:即时显示(直接 wrap 字但不加 stagger inline style 也不加
          `.char-reveal-stagger` 类,使 .ch 默认 opacity:1 transform:none);
        - brush-divider:仍加 `.in-view` 类(CSS keyframe brush-draw 在 reduce
          下由系统 prefers-reduced-motion media query 自然降级——但本 Task 不为
          它加 motion-reduce CSS 规则,brush-draw 是仅 900ms 一次性入场,
          可接受;若需进一步降级在 Task 3 段处理,本 Task 不破边界)。
        - aria-current:无关动画,正常运行(关键导航不破)。

   ── 边界遵守 ──
     · 不改 Task 3-10 的 global.css 既有段(byte-untouched);
     · 仅在 global.css 末尾(`end Functional skeleton` 闭区前)新增一独立 ⑪ 段,
       包含 `@keyframes char-reveal` + `.ch` 默认隐藏 + stagger reveal CSS;
     · 不改 Site* 系列(SiteFooter/SiteNavigation/SiteTitle/SiteSeo)与 PostMeta/
       PostCategory/Pagination/LayoutPost/SumiBackground/SumiFilters/Analytics/
       LaTeX/Comments 任一组件;
     · 不改任何 pages/* 文件;
     · 不引新依赖(无 npm install,无新包);
     · 不重写 LayoutPost 阅读进度条 JS(博客原有,工作正常,不在本 Task 范围)。

   ── 命名/选择器 ──
     按 Task 7-10 BEM 钩子选择器精确挂载,见各 init 函数内注释。
   ═══════════════════════════════════════════════════════════════════════════ */

// 元素级 dataset 标记键:`data-sumi-init` 表示该元素已被本脚本绑定/处理过。
// 同 key(`sumiInit`)在不同 init 函数中用不同**值**区分用途(并非 key 后缀变体):
//   · initPointerTracking 在 .ink-card 上写 `'1'`
//   · initBrushDividers 在 .brush-divider 上写 `'divider'`
// 因 .ink-card 与 .brush-divider 是不同元素,同 key 不会冲突;读取时各 init
// 函数比对自家约定的 value(如 `=== '1'` / `=== 'divider'`),非自家不跳过,
// 仍可被别的 init 处理。char-reveal 拆字会改 innerHTML,与 pointer 事件绑定
// 语义差异大,独立用 `sumiReveal` key 隔离(见下行)。
const DATA_INIT = 'sumiInit' // dataset.sumiInit(value: '1' = pointer 已绑;'divider' = IO 已 observe)
const DATA_INIT_REVEAL = 'sumiReveal' // dataset.sumiReveal(char-reveal 独占,避免与 pointer 冲突)

/** 判断当前是否启用 reduce-motion 偏好(用户系统/浏览器设置)。 */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/* ─── ① initPointerTracking ───────────────────────────────────────────────
   挂载选择器:`.ink-card`
   ----------------------------------------------------------------------------
   等待 Task 9 ⑨.2 钩子的 JS 接入点(global.css:1310-1336)。每张卡片绑
   pointermove 监听器,把鼠标相对卡片 bounds 的百分比写入 --mx/--my CSS 变量,
   驱动 `.ink-card > .wash` radial-gradient 中心点跟随鼠标。
   - SRC:6497-6510 trackPointer 1:1 复刻(用 `%` 与 :root 初始 50%/50% 单位一致)。
   - pointerleave 时不 reset(让墨迹"停留"在离开点,sumi 韵味:墨迹不立即消散;
     Task 9 ⑨.2 既有规则 `.ink-card > .wash { opacity:0; transition: opacity .8s
     ease; }` + `.ink-card:hover > .wash { opacity:1; }`(global.css:1320-1335)
     让 wash 在 :hover 失效时由 opacity:1 → opacity:0 自动 .8s 淡出,--mx/--my
     位置不变但视觉消失,达成"墨迹原地隐去"效果;若 reset 反而显得机械)。
   - reduce-motion 下仍挂(pointer tracking 是功能性的 hover 反馈,不是动效)。
   - 幂等:dataset.sumiInit === '1' 跳过。 */
function initPointerTracking(): void {
  const cards = document.querySelectorAll<HTMLElement>('.ink-card')
  cards.forEach((card) => {
    if (card.dataset[DATA_INIT] === '1')
      return
    card.dataset[DATA_INIT] = '1'

    card.addEventListener('pointermove', (e: PointerEvent) => {
      const r = card.getBoundingClientRect()
      if (r.width === 0 || r.height === 0)
        return
      const x = ((e.clientX - r.left) / r.width) * 100
      const y = ((e.clientY - r.top) / r.height) * 100
      card.style.setProperty('--mx', `${x}%`)
      card.style.setProperty('--my', `${y}%`)
    })
  })
}

/* ─── ② initRipples ───────────────────────────────────────────────────────
   挂载选择器(closest):`.post-category, .pagination__link, .tag-cloud__item`
   ----------------------------------------------------------------------------
   博客无 sumi `.btn` 全局类,但有 chip 与 link-button 性质的元素:
     · .post-category   分类 chip(Task 8 ⑧.2,seal-outline)
     · .pagination__link 上下篇翻页链接(Task 8 ⑧.3,ghost 风)
     · .tag-cloud__item  标签云 chip(Task 10)
   这些视觉/语义上都是 button-like,水波环点击反馈合适。
   .site-nav__link / .post-list__title 是导航文字链接,字号小且无 chip 容器,
   不挂(7619 SRC `.btn:not(.ghost)` 选择思路:挂在有"按下感"的实体上)。

   实现:1:1 移植 SRC:7581-7619 的 3 环物理衰减 stagger 实现。
   注:SRC 注释自标"N=7",但实际 JS PARAMS 数组只 3 项,本移植忠实 SRC 实现而非
   注释——3 环已是物理上的"主/中/尾"完整水波,过密反而失韵。

   委托模式:绑在 document 上(单次绑定,event delegation closest 找按下元素),
   因此 idempotent 标记用 documentElement.dataset.sumiRippleInit(全局只绑一次)。
   - reduce-motion 下跳过整个 ripple 函数(装饰动效,不影响点击可达性)。 */
function initRipples(): void {
  if (prefersReducedMotion())
    return
  if (document.documentElement.dataset.sumiRippleInit === '1')
    return
  document.documentElement.dataset.sumiRippleInit = '1'

  const SELECTOR = '.post-category, .pagination__link, .tag-cloud__item'

  document.addEventListener('pointerdown', (e: PointerEvent) => {
    const target = e.target as Element | null
    if (!target || !target.closest)
      return
    const btn = target.closest<HTMLElement>(SELECTOR)
    if (!btn)
      return

    const r = btn.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const baseSize = Math.max(r.width, r.height) * 0.95

    // 确保宿主 positioned,否则 ring 绝对定位会跳出布局上下文(SRC:7590-7591)
    const cs = getComputedStyle(btn)
    if (cs.position === 'static')
      btn.style.position = 'relative'

    // 物理梯度参数:每环 size / life / peak / border / 不规则度都衰减(后波能量低)
    // SRC:7595-7599 PARAMS 1:1
    const PARAMS: Array<{
      sizeMul: number
      life: number
      peak: number
      bw: number
      filter: string
    }> = [
      { sizeMul: 1.00, life: 1800, peak: 0.62, bw: 32, filter: 'url(#ink-bleed-btn)' }, // 主
      { sizeMul: 0.78, life: 1500, peak: 0.42, bw: 24, filter: 'url(#ink-bleed-btn)' }, // 中
      { sizeMul: 0.60, life: 1200, peak: 0.26, bw: 18, filter: 'url(#ink-bleed)' }, // 尾(更碎)
    ]
    const stagger = 320

    // --brush-speed 来自 :root,Task 3 段已注入;无则 fallback 1
    const speedRaw = getComputedStyle(document.documentElement)
      .getPropertyValue('--brush-speed')
      .trim()
    const speed = Number.parseFloat(speedRaw) || 1

    PARAMS.forEach((p, i) => {
      const ringSize = baseSize * p.sizeMul
      const ring = document.createElement('span')
      ring.className = 'sumi-ring'
      ring.style.width = `${ringSize}px`
      ring.style.height = `${ringSize}px`
      ring.style.left = `${x - ringSize / 2}px`
      ring.style.top = `${y - ringSize / 2}px`
      ring.style.animationDelay = `${(i * stagger) / speed}ms`
      ring.style.animationDuration = `${p.life / speed}ms`
      ring.style.filter = p.filter
      ring.style.setProperty('--peak', String(p.peak))
      ring.style.setProperty('--bw', `${p.bw}px`)
      btn.appendChild(ring)
      window.setTimeout(() => ring.remove(), (p.life + i * stagger + 200) / speed)
    })
  }, true)
}

/* ─── ③ initBrushDividers ─────────────────────────────────────────────────
   挂载选择器:`.brush-divider`
   ----------------------------------------------------------------------------
   Task 3(global.css:188-216)已为 .brush-divider svg path 写好 CSS:
   stroke-dasharray:1600 / stroke-dashoffset:1600 初值 +
   `.brush-divider.in-view svg path { animation: brush-draw ... forwards; }`
   本 init 提供 IntersectionObserver 触发器:元素进视口加 .in-view → CSS keyframe 运行。

   博客当前 DOM 无 .brush-divider 实物(SiteTitle/Footer/PostMeta 用静态 .mini-seal
   不嵌 brush-divider 容器),IntersectionObserver 对 0 个目标不报错只是无事发生。
   将来 Task 12/13 或文章内容引入 .brush-divider 自动激活。

   - 一次性触发(once: observer.unobserve 后不再观察,节流)。
   - 幂等:已加 .in-view 的不再二次 observe(dataset.sumiInit === 'divider')。
   - reduce-motion 下仍加 .in-view(CSS 自身可加 motion-reduce 覆盖,本 Task 不破
     Task 3 段;brush-draw 是一次性 900ms 入场,可接受)。 */
function initBrushDividers(): void {
  if (typeof IntersectionObserver === 'undefined')
    return

  const dividers = document.querySelectorAll<HTMLElement>('.brush-divider')
  if (dividers.length === 0)
    return

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting)
        return
      const el = entry.target as HTMLElement
      el.classList.add('in-view')
      io.unobserve(el)
    })
  }, { threshold: 0.15 })

  dividers.forEach((el) => {
    if (el.dataset[DATA_INIT] === 'divider')
      return
    el.dataset[DATA_INIT] = 'divider'
    io.observe(el)
  })
}

/* ─── ④ initCharReveal ────────────────────────────────────────────────────
   挂载选择器:`.post-meta__title, .about__title, .post-list__title,
              .post-category__label, .site-title__name`
   ----------------------------------------------------------------------------
   等待 Task 8/10 CSS 钩子注释("供 Task 11 char-reveal 引用",见 global.css:880,
   923-932, 993-1004, 1452 等)的 JS 接入。把元素 textContent 拆成 <span class="ch">,
   每 span 注入 inline CSS 变量 --i(字索引),由 global.css ⑪ 段
   `@keyframes char-reveal` + `.ch` 默认隐藏 + `animation-delay: calc(var(--i) * 38ms)`
   驱动逐字 fade-in + 上滑入场。

   - 38ms stagger(SRC:4490 的 50ms 稍快一档,博客标题字数多 50ms 时长溢出,
     38ms 即视觉上的"等距连续";总时长 = N*38 + 700ms keyframe duration)。
   - 1:1 移植 SRC:4489 keyframe `sumix-char-in`(opacity 0/translateY 0.4em/blur 2px
     → 1/0/none,700ms cubic-bezier(.16,1,.3,1)),本 Task 在 global.css ⑪ 段独立
     重命名为 `char-reveal`(避免 .sumix 父类选择器依赖,博客无 .sumix 命名空间)。
   - 拆字策略:仅拆 textContent 直接子文本节点中的字符(避免破坏嵌套 <a> /
     <span class="post-category__label"> 等内部结构)。.post-meta__title 内是
     <a>{title}</a>,需深入 <a>.firstChild 拆;.post-category__label 内是直接
     {category} 文本;统一通过递归 textContent 拆字 + 重建 innerHTML 解决,但
     该方法破坏 <a> 锚点——改采:**只对纯文本子节点拆字,保留其它元素结构**
     (TreeWalker filter:TEXT_NODE,只拆该元素直接的文本节点,文本节点拆完后
     原节点替换为多个 <span>;同时保留兄弟元素节点不动)。
     特殊:.post-meta__title 内是 `<a class="not-prose" href="...">{title}</a>`
     纯文本在 <a> 内,递归 textContent 走 <a> 子节点,拆字写回 <a>.innerHTML,
     这样保留 <a href> 锚点行为,只视觉拆字。
   - 空格:保留原始空格作为   nbsp 在 span 内,避免 inline-block span 碰
     连续空格折叠问题(虽然中文标题极少多空格,英文混排时仍需)。
   - 幂等:dataset.sumiReveal === '1' 跳过(避免二次拆字把已经包好的 .ch 再
     当文本节点拆,导致嵌套破坏)。
   - reduce-motion 下:仍拆字(让 CSS 钩子 .ch 类生效以保持视觉一致),但 ⑪ CSS
     段为 .ch 默认 opacity:1 / transform:none(media query motion-reduce 兜底),
     无延迟无动画即时显示。 */
function initCharReveal(): void {
  const reduce = prefersReducedMotion()
  const SELECTORS = [
    '.post-meta__title',
    '.about__title',
    '.post-list__title',
    '.post-category__label',
    '.site-title__name',
  ]
  const targets = document.querySelectorAll<HTMLElement>(SELECTORS.join(', '))

  targets.forEach((el) => {
    if (el.dataset[DATA_INIT_REVEAL] === '1')
      return
    el.dataset[DATA_INIT_REVEAL] = '1'

    // 优先在最深的"叶子可锚定"容器内拆字,保留 <a href> / 其它结构。
    // 策略:找出元素内所有 Text 节点(深度优先),逐个替换为 .ch <span> 序列。
    // 这样无论 .post-meta__title > a > "文字" 还是 .post-category__label > "文字"
    // 都正确处理。
    let charIndex = 0
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
    const textNodes: Text[] = []
    let n: Node | null = walker.nextNode()
    while (n) {
      // 仅处理非空(去掉首尾空白)文本节点,避免拆出无意义 .ch 包裹纯空白
      if (n.nodeValue && n.nodeValue.trim().length > 0)
        textNodes.push(n as Text)
      n = walker.nextNode()
    }

    textNodes.forEach((textNode) => {
      const parent = textNode.parentNode
      if (!parent)
        return
      const text = textNode.nodeValue ?? ''
      const frag = document.createDocumentFragment()
      // Array.from 处理多字节(emoji / 中文 surrogate pair 在中文范围一般无,
      // 但保持 unicode 安全)。
      const chars = Array.from(text)
      chars.forEach((ch) => {
        // 空格转 nbsp 保留宽度(inline-block 下连续 ' ' 折叠)
        const span = document.createElement('span')
        span.className = 'ch'
        span.textContent = ch === ' ' ? ' ' : ch
        if (!reduce)
          span.style.setProperty('--i', String(charIndex))
        // reduce 模式:不设 --i,CSS ⑪ 段 .ch 默认 opacity:1(motion-reduce 兜底)
        frag.appendChild(span)
        charIndex++
      })
      parent.replaceChild(frag, textNode)
    })
  })
}

/* ─── ⑤ initAriaCurrent ───────────────────────────────────────────────────
   挂载选择器:`.topnav nav.links a`(TopNav v3 笔触下划线激活态)
   ----------------------------------------------------------------------------
   SSR 注入 aria-current 会被 swup 软切换破坏(header 持久不更换 DOM,但 URL
   切换后 SSR 标记已成"过去");每次 `astro:page-load` 触发时重新标记。
   global.css `.topnav nav.links a[aria-current="page"]::after` 段负责视觉。

   实现:每次 `astro:page-load` 触发时:
     1. 取当前 location.pathname 并归一化(去尾斜杠,以根 '/' 兜底)
     2. 遍历所有 .topnav nav.links a,比较 href.pathname 与当前 pathname
     3. 完全相等 → 高亮;非根 link 且 currentPath 以其 path 开头 → 子路径高亮
        (如 /posts/foo 算"文章"高亮;根 link 不做前缀匹配,否则任何页都高亮首页)
     4. 匹配则 setAttribute('aria-current', 'page'),其它 removeAttribute
   - 归一化:link.href 是浏览器解析的绝对 URL,提取 .pathname;base subpath
     在浏览器侧两边统一携带,直接比较即可,无需额外 strip。
   - "根 link"基线:取所有 link 中最短 pathname 长度;只有长度更长的 link 才
     做子路径前缀匹配,与 TopNav.astro SSR isCurrent() 同语义。
   - 幂等性 by nature:每次都先清后设,无累积副作用。
   - reduce-motion 不影响(无动画,纯属性)。 */
function initAriaCurrent(): void {
  const links = document.querySelectorAll<HTMLAnchorElement>('.topnav nav.links a')
  if (links.length === 0)
    return

  const stripSlash = (p: string): string => {
    if (p.length > 1 && p.endsWith('/'))
      return p.slice(0, -1)
    return p
  }
  const currentPath = stripSlash(window.location.pathname)

  // 取所有 link 中最短 pathname 长度,作"首页/根 link"基线
  const shortestLen = Math.min(
    ...Array.from(links).map((l) => {
      try { return stripSlash(new URL(l.href).pathname).length }
      catch { return Infinity }
    }),
  )

  links.forEach((link) => {
    let linkPath: string
    try {
      // 浏览器解析 link.href 已含 base subpath,直接取 .pathname
      linkPath = stripSlash(new URL(link.href).pathname)
    }
    catch {
      // 异常 href(极少情况)兜底 fallback 取原 attribute 字符串
      linkPath = stripSlash(link.getAttribute('href') ?? '')
    }

    // 与 TopNav.astro SSR 的 isCurrent() 同语义:
    //   完全相等 → 当前页
    //   非根 link(length > shortestLen) 且 currentPath 以 link path 为前缀 → 子路径段高亮
    let isMatch = linkPath === currentPath
    if (!isMatch && linkPath.length > shortestLen) {
      isMatch = currentPath.startsWith(`${linkPath}/`) || currentPath === linkPath
    }

    if (isMatch)
      link.setAttribute('aria-current', 'page')
    else
      link.removeAttribute('aria-current')
  })
}

/* ─── 主入口 initSumi ─────────────────────────────────────────────────────
   顺序:由静到动、由结构到反馈
     1. initAriaCurrent  — 关键导航态(优先,即使后续报错也不破导航)
     2. initBrushDividers — 进视口动画触发器(被动观察,无副作用)
     3. initCharReveal   — 拆字结构化(影响后续 querySelector,优先于 pointer)
     4. initPointerTracking — 卡片墨迹跟随(无干扰其它 init)
     5. initRipples     — 全局事件委托(最末,装饰反馈)
   每个 init 用 try/catch 隔离:单个失败不阻塞其它,保证至少 ariaCurrent /
   pointer tracking 不被装饰性 init 异常拖累(防 prod 偶发 console error)。 */
export function initSumi(): void {
  try { initAriaCurrent() }
  catch (e) { console.warn('[sumi] initAriaCurrent failed:', e) }

  try { initBrushDividers() }
  catch (e) { console.warn('[sumi] initBrushDividers failed:', e) }

  try { initCharReveal() }
  catch (e) { console.warn('[sumi] initCharReveal failed:', e) }

  try { initPointerTracking() }
  catch (e) { console.warn('[sumi] initPointerTracking failed:', e) }

  try { initRipples() }
  catch (e) { console.warn('[sumi] initRipples failed:', e) }
}
