---
title: UniDoc Editor 系统架构蓝图 (V2.4.6 Decoupled-Vault & LLM-Ready 架构)
project: UniDoc Editor
current_snapshot: v2.4.6-ux-polished
architecture: Serverless Frontend-Only PWA (App Code Repo + Dedicated Notes Data Repo)
core_engine: Native HTML5 Block Canvas (<article> + ContentEditable Blocks + 120FPS Pointer Drag)
state_management: Middleware Bus (connector.js)
sync_engine: Google Keep Style (IndexedDB Local-First + 10s Smart Heartbeat + Block-Level Timestamp Merge + Smart Sync Pill)
media_engine: HTML5 Canvas Auto-Compression (<=2MB Freemium Cap) + Direct GitHub API Base64 Hydration
---

# 🧩 一、 系统全局架构与模块职责 (Single Source of Truth)

## 1. 运行环境与双仓库分离铁律
- **零构建依赖**：严禁引入 Vite、Webpack、NPM 等重型构建工具；全部采用 Vanilla JS (ES6+) + 原生 DOM API，通过 `index.html` 原生 `<script>` 挂载。
- **双仓库物理分离 (Code & Data Decoupling)**：
  - **应用代码仓 (`unidoc-editor`)**：部署 GitHub Pages PWA，通过 `.gitignore` 永久屏蔽 `notes/`。
  - **私人数据仓 (`unidoc-notes`)**：独立存储 `notes/*.md`、`notes/.unidoc-settings.json` 与 `notes/images/*`，赋予完整数字资产主权与跨应用（含未来 LLM 管道）复用能力。
- **总线隔离铁律**：UI 层禁止直接调用 `EditorManager` API，统一经由 `Connector.execute(action, payload)` 下发。
- **三大护城河黑科技（严禁篡改）**：
  1. **PWA 开发自毁防御 (`main.js`)**：侦测到 `localhost` / `127.0.0.1` 自动注销全部 Service Worker，彻底隔离 Live Server 幽灵缓存。
  2. **移动端 Gboard 虚拟键盘防黑块引擎 (`main.js` & `style.css`)**：`interactive-widget=resizes-content` + `visualViewport` 动态锁定高度并归零底层滚动偏移，`html, body` 绑定主题底色与 `overscroll-behavior: none`。
  3. **动态侧边栏记忆拖拽 (`main.js` & `style.css`)**：`#sidebar-resizer` 拖拽宽度记忆与双击复原。

## 2. 原生 HTML Tags 三层容器架构 (`editor.js`)
- **L1 终极画布容器**：`<article id="unidoc-canvas" class="unidoc-canvas">`。
- **L2 块级内容标签 (Content Blocks)**：携带 `data-block-id="b-xxx"` 与 `data-updated="timestamp"`（天然支持独立提取投喂给 LLM）：
  - 普通段落块：`<p>`（段内 1 次 `Enter` 自然 `<br>` 换行，`Ctrl+Enter` 新建块）
  - 五级章节标题块：`<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`
  - 折叠收纳块：`<details open><summary>标题</summary><div class="details-body">正文</div></details>`
  - 媒体图片块：`<figure data-image-tier="standard"><img src="..." data-src="images/xxx.png"><figcaption>图注</figcaption></figure>`
  - 引用灵感块：`<blockquote>`
  - 清单列表块：`<ul>` / `<ol>` + `<li>`
  - 纯文本/Mermaid/代码块：`<pre><code>`（采用 `textContent` 无损提取换行 + `white-space: pre-wrap` 从上到下自然纵向结构显示，无横向挤压或滚动条，完美保存纯文本结构供 LLM 读取）。
- **L3 行内修饰标签 (Inline Tags)**：
  - `<strong>` (加粗)、`<em>` (斜体)、`<mark style="background-color:...">` (原生 5 色预设 + `<input type="color">` 自由拾取 + 一键清除高亮)、`<code>`、`<a href="...">`。

## 3. Google Keep 级跨设备同步架构 (`syncManager.js` & `settingsManager.js`)
- **智能动态同步胶囊 (`#btn-save` 方案 A)**：将状态指示与手动保存合体，平时低调显示 `☁️ 已自动同步` 消除保存焦虑；编辑态亮起琥珀色 `⚡ 已存本地 · 点击同步`。
- **本地优先 + 前台 10 秒智能心跳**：250ms 落盘 IndexedDB (`UniDocKeepDB`)；失焦 1 秒 / 停顿 3.5 秒 / 切后台自动推云端；前台每 10 秒智能心跳同时同步【当前文档内容】与【左侧文件列表星标置顶状态】。
- **409 冲突自愈**：文档冲突基于 `data-block-id` 与 `data-updated` 块级时间戳无感合并；`.unidoc-settings.json` 冲突自动拉取最新 SHA 重试。