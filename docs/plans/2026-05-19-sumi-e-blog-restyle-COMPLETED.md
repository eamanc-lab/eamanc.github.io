# Sumi-e 水墨「砚」迁移 — 完成报告

| 项 | 值 |
|----|----|
| **计划文档** | `docs/plans/2026-05-19-sumi-e-blog-restyle.md` |
| **分支** | `feat/sumi-e-restyle` |
| **基线 commit** | `3ae4fab` (BASE) |
| **完成 commit** | Task 13 终验 commit（见下文 commit 链） |
| **总 Task 数** | 13 个实质 Task + 1 个技术债微修（Task 1.5） |
| **总 commit 数** | 28 个（含 Task 主 commit + reviewer fix commit + plan 同步 docs commit） |
| **门禁** | typecheck / build / Playwright 视觉 / 交互 / swup / 健壮 5 项全过 |

---

## 1. 迁移概况

将原 Astro Theme Typography（v1：米白 + 琥珀 accent + 亚麻纹理 + 衬线克制西方排版）整套替换为 **sumi-e 水墨「砚」设计语言**（v2：宣纸 + 单色墨 + 朱印 signature + 全特效 SVG 滤镜 + 东方书法体）。

**核心特征：**
- 双模 OKLCH token 体系（亮宣纸 `#faf7ee` ↔ 暗墨夜 `oklch(18% .020 50)`）
- 4 个 SVG filter defs（`#ink-bleed` / `#ink-bleed-btn` / `#ink-goo` / `#inkGrad`）全站共享
- 朱印（`var(--seal)` 朱砂红）作为唯一非墨色 accent
- 5 个交互（mouse-tracking ink wash / sumi-ring × 3 ripple / char-reveal stagger / brushDivider in-view / aria-current）
- Shiki dual theme（github-light + github-dark-dimmed）+ sumi 容器壳
- swup 跨页：纸纹 / SVG defs / aria-current / char-reveal 全套持久

**1:1 保真锚点：** Task 5 article.prose 与 SRC 模板 byte-equality（md5 `490feea01ab52416593d029d431035de` 跨 `head -n 1937` 锚（BSD/macOS `head` 注意要带 `-n` flag,否则 `1937` 被当作其他参数）），任何后续修改必须先改 SRC 再 head 镜像。

---

## 2. 13 Task Commit 链总览

| Task | 内容 | 主 commit | Fix/Refactor commit | Docs/Plan commit |
|------|------|-----------|---------------------|-------------------|
| **1** | 字体镜像接入（国内镜像 Google Fonts） | `ee60103` | — | `a81bfce` |
| **1.5** | 修复预存 typecheck error（astro-seo 类型导入） | `5652267` | `1e732f5` | — |
| **2** | user.ts / uno.config 基础色注入 sumi 纸墨 token | `4fcae5e` | — | `3398fc6` / `3db6db0` |
| **3** | global.css 重写为 sumi-e 设计系统地基 | `d53d0c3` | `7c90b60` | `84f3dbe` |
| **4** | LayoutDefault 注入纸纹 + SVG 滤镜 + 暗色桥接 | `683efe9` | — | `d500c1d` |
| **5** | article.prose 正文排版 1:1（byte-equality 锚） | `2463c3c` | `40777b2` | — |
| **6** | 阅读进度条改朱砂水墨笔触 | `79c90bf` | — | — |
| **7** | 站点标题 / 导航 / 页脚 sumi 化（书法体 + 朱印 + 笔触下划线） | `de9b14e` | `faaa2d0` / `addf453` | — |
| **8** | 文章元信息 / 分类 / 分页 sumi 化（seal-outline chip + ghost 按钮 + 笔触） | `cb79ac6` | `558ae97` | — |
| **9** | 首页文章列表改 sumi ink-card（毛边 + 层叠 + wash 钩子） | `7ff8d6f` | `3134b3b` | — |
| **10** | 分类 / 标签 / 归档 / 关于页 sumi 化（行式列表 + seal 标签云 + about 独立 header） | `f193b65` | `67c84da` | — |
| **11** | 交互 JS 移植（墨迹 / 水波环 / 逐字 / aria-current / swup 兼容） | `d3d7209` | `ab89e42` | — |
| **12** | 代码块 sumi 单色墨（Shiki 双 theme + 复制按钮 sumi 化） | `4d0a6fa` | `16e81a5` | — |
| **13** | 终验 + 回归 + CLAUDE.md 更新 + 完成报告 | 本次 commit | — | — |

完整链（`git log --oneline 3ae4fab..HEAD --reverse`）：
```
ee60103 → 5652267 → a81bfce → 1e732f5 → 4fcae5e → 3398fc6 → 3db6db0 → d53d0c3 →
84f3dbe → 7c90b60 → 683efe9 → d500c1d → 2463c3c → 40777b2 → 79c90bf → de9b14e →
faaa2d0 → addf453 → cb79ac6 → 558ae97 → 7ff8d6f → 3134b3b → f193b65 → 67c84da →
d3d7209 → ab89e42 → 4d0a6fa → 16e81a5 → <Task 13 commit>
```

---

## 3. 关键决策记录（D1-D8）

| ID | 决策 | 落点 | 反向被拒方案 |
|----|------|------|---------------|
| **D1** | 双模（亮宣纸 + 暗墨夜），暗模用 `oklch(18% .020 50)` 暖墨夜而非纯黑或冷靛蓝 | `global.css` `:root` / `html.dark` | 旧 v1 `#1a1a2e` 深靛蓝；纯黑 `#000` |
| **D2** | 字体走 `fonts.googleapis.cn` 国内镜像，多级 fallback 含系统衬线 | `LayoutDefault.astro` `<link>` + `user.ts` `fonts.header/ui` | 自托管 woff2（首屏 LCP 风险）；原 Google CDN（国内不可达） |
| **D3** | 全站 1:1 全特效（SVG 滤镜 `url(#ink-bleed)` 全套挂在标题/引用/hr/链接/卡片），不为长文性能擅自降级 | `global.css` 全段 | 段落级 ink-bleed 部分关闭以提 fps；选择性挂载 |
| **D4** | 暗色桥接走 `html.dark` 类名而非 `prefers-color-scheme` 媒体查询 | `LayoutDefault.astro` / `ThemeScript.astro` | 媒体查询自动跟随（不支持用户手切） |
| **D5** | article.prose 与 SRC 模板 byte-equality（md5 `490feea01ab52416593d029d431035de` 跨 `head -n 1937` 锚（BSD/macOS `head` 注意要带 `-n` flag,否则 `1937` 被当作其他参数）） | `global.css` Task 5 段 | 局部改写为自家 prose 风格 |
| **D6** | 站点框架走 BEM（`.site-title__name` / `.site-nav__link` / `.site-footer__seal`） | `SiteTitle.astro` / `SiteNavigation.astro` / `SiteFooter.astro` | 全局类名 + descendant selector |
| **D7** | 朱印 signature accent：reading-progress / drop-cap / `.mini-seal` / `.post-category` outline 用 `var(--seal)` 而非 ink | `global.css` 多段 + `LayoutPost.astro` | 全墨色（v1 风格）；多 accent 色 |
| **D8** | 代码块 Shiki dual theme（github-light + github-dark-dimmed）+ sumi 容器壳（`var(--paper-shade)` 底 + `var(--ink-hairline)` 边 + `url(#ink-bleed)`） | `astro.config.ts` + `global.css` Task 12 段 | 严格单色墨自管色（`css-variables` theme + 自定义 token 表，复杂度高） |

---

## 4. Reviewer 累积前向提醒（I-1 / m-1 / m-2 / m-3 等）

reviewer 在前序 Task 提的可推迟到 Task 13 议题及处理：

### 已在 Task 13 修复

- **Task 12 终审 I-1（建议 Task 13 准备阶段顺手修）**：`global.css:1945` Task 12 注释段 `--shiki-light-bg`/`--shiki-dark-bg` 缺 `:VALUE` 占位符，与同段 line 1957 `#fff`/`#22272e` 不自洽 → **本次已修**（补 `:LIGHT-BG`/`:DARK-BG` 占位符，零运行时影响，纯注释精确度）。

### 推后到本次但 reviewer 已多次裁定不修

- **Task 8 M-3 / Task 9 M-4 / Task 12 M-4** 等历史 commit message 断句 / `class=` 缺 `"`/cosmetic 等 reviewer 自评 "cosmetic" 的问题 → **不修**，保 byte-equality 证据链完整性，已多次裁定。

### 设计取舍延续

- **Task 12 D8 reviewer 复审**："严格单色墨" vs "近单色墨 + 与宣纸协调" → **保留 Shiki dual theme**（D8 用户决策已明确"近单色墨"，github 7 色 token import/string/comment 与 sumi 主调可接受共存，Playwright 视觉抽查无突兀感）。

### Task 13 期间主动新建

- **Task 12 hello-world.md ts 代码块视觉锚** → **保留**，作为 Shiki dual theme 长期演示锚；hello-world.md 本就是占位内容。

---

## 5. 累积"不修"项及理由

| 项 | 来源 | 不修理由 |
|----|------|---------|
| Task 8/9/12 历史 commit message 断句 | reviewer M-x | reviewer 自评 cosmetic + byte-equality 证据链保护，多次裁定 |
| Task 11 `.brush-divider` 0-DOM 消费者 | Task 11 reviewer | 0-DOM future-proof：未来文章可手动加 class 触发 in-view 动画（与 SRC 锚一致） |
| Task 4 `#inkGrad` 0 消费者 | Task 4 reviewer | 与 SRC 锚 1:1 完整性，备未来 sparkline / 数据组件消费者 |
| hello-world.md ts 代码块（Shiki 演示锚） | Task 12 implementer 主动补 | 视觉演示 + 后续 maintainer 查阅价值 > 删除恢复占位 |
| `min-w-390px` 移动端 15px 溢出（375 viewport） | 基座 Typography 主题 `LayoutDefault.astro:27` | **upstream baseline**，git blame 追溯到 `baa1b02` / `fde5c13` upstream commit，非 sumi-e 迁移引入；iPhone SE viewport 仍可读 |

---

## 6. 已知约束 / 取舍

### D3 全特效长文性能（trade-off accepted）

- Playwright 长文滚动 3s 测得 **fps ≈ 49**（目标 ≥55，spec 阈值 ≥30 为硬底线）
- 原因：D3 全站 `url(#ink-bleed)` 滤镜叠加（feTurbulence + feDisplacementMap），WebKit 内合成时段落级 reflow
- **接受理由**：spec 明确"若严重掉帧 <30fps 才记录取舍，不擅自降级 D3"；当前 49 fps **未触发降级阈值**且日常滚动流畅；D3 用户决策权重 > 数值 fps 偏差
- **未来选项**（不在本次执行）：若长文消费者反馈感觉卡顿，可在段落级（不在 .ink-card / 标题级）局部去掉 `filter: url(#ink-bleed)`，预计可提到 60 fps

### Shiki 7 色 token 与 sumi 单色墨调

- D8 决策：保留 github-light/github-dark-dimmed 双 theme（7 色 import 红 / string 蓝 / comment 灰可见）
- Playwright 视觉抽查（亮 + 暗 + 移动 hello-world.md）确认与宣纸 / 墨夜底色调可共存，不突兀
- **接受理由**：'css-variables' theme 自管色复杂度高 + sumi 容器壳（paper-shade 底 + ink-hairline 边 + url(#ink-bleed) 边缘）已担纲主沟通感

### 镜像字体首屏

- `fonts.googleapis.cn` 国内镜像首次加载 200-500ms（已加 `<link rel="preconnect">`）
- 断网/拦截测试通过：系统 serif/sans fallback 可读、布局不崩
- 站点首屏可能短暂出现 FOUT（Flash of Unstyled Text），用户实际无感

### Cormorant Garamond 无 CJK 自动降级

- `--font-latin` 拉丁衬线字体 Cormorant Garamond 不含 CJK，浏览器对 CJK 字符自动 fallback 到栈中后续 `"Noto Serif SC", "Songti SC", serif`
- 设计意图：拉丁字符走 Cormorant 优雅斜体（如 italic 装饰、`<em>` ），CJK 走 Noto Serif SC（不混排突兀）

### 移动端 ≤375 viewport 横向溢出 15px

- 基座 Typography `LayoutDefault.astro` `min-w-390px` 给的硬下限，非 sumi-e 引入
- iPhone SE (375x667) 在视觉上不可察（layout 完整呈现），仅 `document.scrollWidth` 数字层面 +15px
- **可选**：若未来锁定 ≥iPhone SE 用户群，可改 `min-w-375px`（独立 cosmetic chore，不在 sumi-e 迁移范畴）

---

## 7. 给后续维护者的指引

### Task 段索引

`global.css` / `src/styles/*` 修改时按 `Task N — 主题` 注释段定位（每段顶部用 `═══` 包裹标识）。修改前阅读对应 Task 在 `docs/plans/2026-05-19-sumi-e-blog-restyle.md` 的 spec 与 reviewer 决议。

### sumi token 命名约定

- **paper 系**（`--paper` / `--paper-edge` / `--paper-shade`）→ 仅做 background / 容器底
- **ink 系**（`--ink-base` / `--ink` / `--ink-strong` / `--ink-mid` / `--ink-soft` / `--ink-faint` / `--ink-hairline`）→ 文字 / 边 / 描线，按重要性梯度
- **seal 系**（`--seal` / `--seal-deep` / `--seal-soft`）→ 仅做 signature accent（朱印 / 进度条 / drop-cap / 关键 chip），**不可滥用为通用 hover 强调色**

### BEM 命名约定

站点框架（Task 7-10）全部走 BEM：`.site-*` / `.post-*` / `.ink-card` / `.tag-cloud__item` 等。新增组件继续延续，不引入全局 class。

### 1:1 镜像 + 双向同步护栏

- **Task 5 article.prose** 是与 SRC 模板的 byte-equality 1:1 镜像段，**改动必须先改 SRC 再 head -1937 重新镜像本仓库**（任何手改本仓库都会破坏 md5 锚）
- **Task 11 sumi.ts** 内联在 `[...id].astro` 等页面，是 SRC → 本仓库单向镜像，**不可双向编辑**
- **Task 7 `.mini-seal`** 等 BEM 类是「局部镜像」，作用域用 `.site-*` 前缀隔离，**不污染** Task 3 全局 token 段

### 注释惯例

- 每个 Task 段顶部带 `═══` 包裹标题行写明 `Task N — 主题`
- 1:1 镜像段标 `byte-equality / md5 / head -1937` 锚
- 反向选择性决议（如 `inkGrad` 0 消费者保留）必写明"未来消费者"原因，**不要随意删除**

### 命名空间

- SVG defs id：`ink-bleed` / `ink-bleed-btn` / `ink-goo` / `inkGrad`（与 SRC 锚 1:1，**不要重命名**）
- 全局类：`.paper-stage` / `.fibers` / `.mist` / `.brush-divider` / `.mini-seal` / `.ink-card` / `.sumi-ring` / `.ch` / `.wash`
- CSS 自定义属性：`--mx` / `--my`（mouse 跟随）/ `--i`（char index stagger）/ `--peak`、`--bw`（sumi-ring 参数）

### 性能监控

若未来加复杂动效或长文消费者，建议先用 Playwright 重跑 `/tmp/sumi-verify/scripts/robust-gate.mjs` 的 perf 段（fps trace），目标 ≥55 fps；<30 fps 视为严重，需评估是否在段落级局部降级 D3。

### 终验回归脚本

`/tmp/sumi-verify/scripts/` 下有 3 个 Playwright 脚本（visual-gate / interaction-gate / robust-gate），可在后续大改后整套重跑作回归（依赖全局 `playwright` 1.58.2 + 本地 chromium-headless-shell-1208 + 本地 `pnpm preview` 4321 端口）。

---

## 8. 验证证据链

### 构建门
- `pnpm typecheck` → 0 error
- `pnpm build` → 0 error / 0 warning，8 page 全产出

### 视觉门（Playwright headless × chromium-headless-shell 1208）
- **7 页 × 亮 / 暗 / 移动** = 21 张全页截图，全部存于 `/tmp/sumi-verify/{light,dark,mobile}/*.png`
- 每页跨断言：`paperToken` / `inkStrong` / `seal` / `fontDisplay/Text/Cal` / `paperStage` / `fibers` / `mist` / `inkBleedDef` / `inkBleedBtnDef` / `inkGooDef` / `inkGradDef` / `siteTitle` / `siteNav` / `siteFooter` / `miniSealCount` / `bodyBg` / `activeNavHref` → 全部符合预期
- `pageerror` + `console.error` = 0 跨所有 21 次加载

### 交互门
- `.ink-card` pointer 跟随 `--mx`/`--my`：✓ 设置成功（mx=30%、my=40%）
- `.post-category` pointerdown → `.sumi-ring × 3` 生成：✓
- `.post-meta__title` char-reveal `.ch` 数：5（"你好，世界" 5 chars，含 `，`）✓
- swup `/` → `/archive` 跨页：paper-stage / `#ink-bleed` / `#ink-bleed-btn` / `#ink-goo` 全持久 ✓，aria-current 切换 `/` → `/archive` ✓，char-reveal 重触发（9 ch on archive）✓

### 健壮门
- **暗色全站**：7 页 × 暗色 = 7 张全页截图，paperToken `oklch(18% .020 50)`、ink-strong 反相、seal 提亮 `oklch(70% .170 32)` 全套切换自洽
- **移动端**：375x667 + 768x1024 各 1 套截图，layout 单列堆叠正常；375 viewport `min-w-390px` 基座 15px 溢出确认是 upstream 行为
- **断网字体 fallback**：Playwright route block `fonts.googleapis.cn` + `fonts.gstatic.cn` 域后访问 `/`，paper bg 保持、layout 不崩、mini-seal × 2 仍渲染、字体降级到 PingFang SC 系统 fallback；console 仅 ERR_FAILED（拦截本身产生）
- **长文滚动 perf**：3 秒滚动 fps = 49.1，longest frame = 49.9ms（<30 fps 阈值未触发，记入"已知取舍"不降级）
- **Print preview**：`emulateMedia({media:'print'})`，paper bg 保持、article 可见、code block 完整，无破版

---

## 9. 整体迁移完成度评估

| 维度 | 完成度 | 备注 |
|------|--------|------|
| 字体地基（D2） | 100% | 镜像 + 多级 fallback + 断网验证 |
| Token 体系（D1） | 100% | 双模 OKLCH + uno.config 桥接 + ThemeScript 协同 |
| Global.css sumi 地基（D5） | 100% | byte-equality 锚 + Task 5 全段 1:1 |
| SVG 滤镜 + 纸纹（D3） | 100% | 4 defs 全站共享 + 三层纸 paper-stage |
| article.prose（D5） | 100% | byte-equality md5 锚验证 |
| 进度条（D7） | 100% | 朱砂笔触 + url(#ink-bleed-btn) |
| 站点框架（D6） | 100% | BEM .site-* + 书法体 + 朱印 |
| Post meta / 分类 / 分页 | 100% | seal-outline chip + ghost 翻页 + 笔触 |
| 首页 ink-card | 100% | 毛边 + 层叠 + wash 鼠标墨迹 hook |
| 分类 / 标签 / 归档 / 关于 | 100% | 行式列表 + seal 标签云 + about 独立 header |
| 交互 JS（Task 11） | 100% | 5 init + swup 兼容验证 |
| 代码块 Shiki（D8） | 100% | dual theme + sumi 容器壳 + 朱印复制按钮 |
| 终验 + 文档 | 100% | 本次 Task 13 完成 |

**总体加权完成度：100%。**

---

## 10. 可合入 main 结论

**所有门禁通过，迁移完整，可合入 main。**

合入路径建议：

```bash
git checkout main
git merge --no-ff feat/sumi-e-restyle -m "feat: 接入 sumi-e 水墨「砚」设计语言(13 Task 完成)"
git push origin main
# GitHub Actions 将自动构建并部署到 eamanc.github.io
```

或经 PR 合入（推荐）：

```bash
gh pr create --base main --head feat/sumi-e-restyle --title "feat: 接入 sumi-e 水墨「砚」设计语言" --body "13 Task 完整迁移完成,见 docs/plans/2026-05-19-sumi-e-blog-restyle-COMPLETED.md"
```

**合入后首要任务：替换 `src/content/posts/hello-world.md` 为真实文章**（保留 ts 代码块视觉锚或迁移到独立 demo 文章）。

---

**报告生成日期**：2026-05-19
**报告作者**：implementer（Task 13 终验）
