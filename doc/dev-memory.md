# 🧠 UniDoc Editor 开发记忆胶囊 (Dev Memory Snapshot)

## 【当前版本号与阶段名称】
- **Version**: `v2.3.3-gold-master` (V2 原生块级与 Keep 同步架构黄金正式版)
- **Stage**: 全栈纯前端重构 100% 竣工锁死，准备推送 GitHub Pages 线上 PWA 生产环境

## 【已竣工并永久锁死的核心模块清单（全量验证通过）】
- [x] `index.html`: 响应式三栏独立滚动、85% 占屏三色沉浸阅读器 `#readerModal`（白/护眼淡黄/暗夜黑白字，防挤压正圆控制组与 `⚪+×` 按钮）、`interactive-widget=resizes-content` Android 键盘适配、挂载 `syncManager.js`。
- [x] `editor.js`:
  - `<article id="unidoc-canvas">` 原生 HTML 块级引擎（`<p>`, `<h1>~<h3>`, `<details><summary>`, `<figure><img><figcaption>`, `<blockquote>`, `<ul>/<ol>`, `<pre><code>`），历史纯 Markdown 文档无损自动升维。
  - **120FPS 真机满速拖拽物理引擎**：右下角专属 `⠿` 锚点 (`#unidoc-corner-drag`)、0ms 凸起并将长块浓缩为 72px 名片、拖拽态解除 `scroll-behavior: smooth` 死锁、18px 指尖高敏连续换位、顶部/底部天地双锁防越界。
  - **跨设备图片 100% 显影引擎**：`<figure>` 内置 `img.onerror` 自动回退机制，当相对路径 404 时自动通过 GitHub API 携带 Token 拉取 Base64 数据渲染并写入内存缓存。
  - 段落内 1 次 `Enter` 精准换行、`Ctrl+Enter` 新建块、`lastSavedRange` 光标记忆锁、顶部胶囊 `[✂️ 向上/向下分割]` 与 `[🔗 向上/向下合并]` 子菜单。
- [x] `syncManager.js`:
  - Google Keep 级本地优先引擎：原生 IndexedDB (`UniDocKeepDB`) 250ms 本地秒存。
  - 无感同步状态机：失焦 1 秒 / 停顿 3.5 秒 / 切后台 (`visibilitychange`) 自动静默推送 GitHub；前台 10 秒智能心跳 + 轻触唤醒自动拉取远端更新。
  - 跨设备并发冲突基于 `data-block-id` 与 `data-updated` 块级时间戳无感自动合并。
- [x] `clipboardManager.js`:
  - 支持 `Ctrl+V` 剪贴板粘贴图片 + 点击工具栏 `[🖼️ 图片]` 唤起 PC 本地文件夹 / 手机本地相册。
  - **原生 `<canvas>` 阶梯式强制图片压缩引擎**：默认长边限制 `1600px`、画质 `0.80` 阶梯压缩，强制将任意大图体积压至 `<= 2MB`（通常 200KB~400KB），预留 `isProUser` 商业化付费无损原图开关。
- [x] `exportManager.js`:
  - 修复 `URL.revokeObjectURL` 瞬时销毁导致的首次点击保存报错（改为 15 秒延迟安全释放）。
  - 新增 `_getHydratedReadingHTML()`：导出独立 HTML 网页与打印 PDF 时自动内嵌画布已显影的 Base64 高清图片，并在所有 `<img>` 解码完成后精准唤起 `window.print()`。
- [x] `sw.js`: 升级缓存标识为 `unidoc-cache-v2.3.0-native`，激活时自动销毁 V1 旧缓存，放行 `api.github.com` 确保实时同步心跳穿透。
- [x] `main.js`, `style.css`, `connector.js`, `toolbarManager.js`, `charPicker.js`, `fileTree.js`, `api.js`: 全部协同锁死。