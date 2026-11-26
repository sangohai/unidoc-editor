---
title: UniDoc Editor 系统架构蓝图 (V2 Native-Block 架构)
project: UniDoc Editor
architecture: Serverless Frontend-Only (No Vite / No NPM / Vanilla JS + Live Server)
core_engine: Native HTML5 Block Canvas (<article> + ContentEditable Blocks)
state_management: Middleware Bus (connector.js)
sync_engine: Google Keep Style (IndexedDB Local-First + Block-Level Merge + GitHub REST API)
---

# 🧩 一、 系统全局架构与模块职责 (Single Source of Truth)

## 1. 运行环境与铁律
- **零构建依赖**：严禁引入 Vite、Webpack、NPM 等构建工具；所有脚本通过 `index.html` 原生 `<script>` 按序挂载。
- **总线隔离铁律**：UI 层（工具栏、快捷键、命令面板）**绝对禁止**直接调用 `EditorManager` API，一切操作必须通过 `Connector.execute(action, payload)` 下发。
- **三大护城河黑科技（严禁篡改或丢失）**：
  1. **PWA 开发自毁防御 (`main.js`)**：侦测到 `localhost` / `127.0.0.1` 自动注销全部 Service Worker，彻底隔离 Live Server 幽灵缓存。
  2. **移动端视口防上推 (`main.js`)**：基于 `window.visualViewport` 动态锁死 `document.body` 尺寸，防止虚拟键盘挤压顶栏与画布。
  3. **动态侧边栏记忆拖拽 (`main.js` & `style.css`)**：`#sidebar-resizer` 支持拖拽记忆至 `localStorage`、双击复原 `260px`，移动端响应式切换 Offcanvas。

## 2. 原生 HTML Tags 三层容器架构 (`editor.js`)
摒弃 CodeMirror 6，采用浏览器原生 DOM 树进行块级（Block-based）内容管理与自由拖拽排序：
- **L1 终极画布容器**：`<article id="unidoc-canvas" class="unidoc-canvas">`（本身不可编辑文字，仅负责承载与调度块级标签顺序）。
- **L2 块级内容标签 (Content Blocks)**：画布的直接子元素，每个块必须携带同步基因属性 `data-block-id="b-xxx"` 与 `data-updated="timestamp"`：
  - 普通段落块：`<p contenteditable="true">`
  - 章节标题块：`<h1>`, `<h2>`, `<h3>` (`contenteditable="true"`)
  - 折叠收纳块：`<details open><summary contenteditable="true">标题</summary><div class="details-body" contenteditable="true">正文</div></details>`
  - 媒体图片块：`<figure contenteditable="false"><img src="..." data-src="images/xxx.png"><figcaption contenteditable="true">图注</figcaption></figure>`
  - 引用灵感块：`<blockquote contenteditable="true">`
  - 清单列表块：`<ul>` / `<ol>` 内部包裹 `<li contenteditable="true">`
  - 纯文本/代码块：`<pre><code contenteditable="true">`（当打开 `.json`/`.yaml`/`.txt` 时，画布退化为单一全屏 `<pre><code>` 容器以100%兼容配置文件编辑）。
- **L3 行内修饰标签 (Inline Tags)**：依附于块级标签内部，通过原生 `Selection` / `Range` 包裹：
  - `<strong>` (加粗)、`<em>` (斜体)、`<mark>` (荧光笔高亮)、`<code>` (行内代码)、`<a href="...">` (超链接)、`<span>` (自定义扩展)。

## 3. Google Keep 级跨设备同步架构 (`IndexedDB` + `GitHubAPI`)
- **本地优先落盘 (IndexedDB `UniDocDB`)**：打字、格式化或拖拽块顺序时，300ms 防抖直接写入本地 IndexedDB，标记 `isDirty: true`，UI 显示“🟡 本地已存”，0 网络延迟。
- **无感云端推送触发器**：
  1. 块失焦 (`focusout` / `blur` 离开当前编辑块且有修改时)
  2. 阅读/思考停顿 (Idle 8秒无新输入)
  3. 视觉离开 (`document.visibilitychange === 'hidden'` 切后台、锁屏、换设备)
  4. 切换其他文档或手动 `Ctrl+S`
- **唤醒嗅探与块级合并 (Block-Level Merge)**：
  - 设备切回前台 (`visibilitychange === 'visible'` 或 `window.focus`) 时，静默校验远端 GitHub `sha`。
  - 若发生跨设备离线冲突，基于 DOM 节点的 `data-block-id` 与 `data-updated` 时间戳进行块级颗粒度智能合并，自动保留多端最新块。

---

# 🔒 二、 不可篡改的核心接口契约 (Interface Contracts)

## 1. `EditorManager` (`editor.js`) 必须暴露的接口
- `async init()`：初始化 `<article id="unidoc-canvas">`，挂载块级悬浮控制手柄与键盘/鼠标/触控事件流。
- `getContent()` -> `String`：序列化画布内纯净的 HTML 块结构（或 `.json`/`.yaml` 的纯文本），剔除所有 UI 辅助控制手柄 DOM。
- `setContent(content, lang)`：智能解析内容（老 Markdown 自动通过 `marked` 升维为带 `data-block-id` 的原生 HTML 块；HTML 直接挂载；非笔记格式挂载为 `<pre><code>`），并调用 `handlePreviewLayout(lang)`。
- `setLanguage(lang)` / `setSyntaxTheme(themeName)`：切换文档模式与阅读色彩主题（`default` / `warm` / `hacker`）。
- `onChange(callback)`：当任何块内容变更、属性变更或拖拽换位时触发回调。
- `hasFocus()` -> `Boolean`：供 `ClipboardManager` 判断焦点是否位于画布内。
- **总线指令响应接口（供 `Connector` 调用）**：
  - `applyMarkdownFormat(type)`（升级为原生行内/块级标签操作：`bold`, `italic`, `mark`, `link`, `image`, `code`, `h1`, `h2`, `h3`, `details`, `quote`）
  - `insertTextAtCursor(text)` / `replaceSelection(text)` / `findAndReplace(targetStr, replaceStr)`
  - `insertImageBlock(fileName, base64Data, relativePath)` / `finalizeImageBlock(relativePath, isSuccess)`
  - `foldAll()` / `unfoldAll()`（一键收起/展开所有原生 `<details>` 块）
  - `sanitizeFormat()` / `optimizePrompt()` / `formatCodeDocument()`
  - `selectAll()` / `setAnchor()` / `selectToHere()`
  - `togglePreview(isPreviewMode)`（切换纯净只读阅读模式 vs 编辑模式）
  - `undo()` / `redo()`（基于轻量级 DOM 快照栈的撤销与重做）

## 2. `Connector` (`connector.js`) 必须保持的契约
- `init(editorEngineInstance)`
- `execute(action, payload)`：拦截并记录极客遥测日志，向下分发至 `EditorManager`、`ClipboardManager`、`ToolbarManager`、`GarbageCollector`。