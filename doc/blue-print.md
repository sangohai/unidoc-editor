# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的 `.md`, `.json`, `.yaml` 专用编辑器，完全无后端，直接部署于 GitHub Pages。数据持久化依赖 GitHub REST API，通过用户的 PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、结构化的纯文本协同维护工作台。
- **当前进度**: **V1.0 基础阶段开发完毕**（已实现完整的文件增删改查、移动端适配、暗黑模式支持与沉浸式 Markdown 写作体验）。

## 📁 项目目录与依赖结构
`unidoc-editor/`
- `notes/`       : 业务数据源，存放实际编写的 md/json/yaml 纯文本文件（扁平化单层结构）。
- `doc/`         : 项目的“大脑”和架构上下文（存放此 blue-print.md 及其它规范说明），供 LLM 和开发者随时查阅。
- `index.html`   : 唯一 HTML 骨架，引入所有 CDN 依赖，包含全局弹窗与结构布局。
- `style.css`    : 纯前端响应式样式、暗黑模式代码块适配、UI 细节微调。
- `main.js`      : **[核心主板]** 全局状态机 (`AppState`)、主题管理器、快捷键拦截、各组件调度与组装。
- `api.js`       : **[数据总线]** 封装 GitHub REST API，处理带时间戳的缓存穿透、文件的增删查改。
- `editor.js`    : **[编辑引擎]** Monaco Editor 的初始化、动态语言切换、工具栏注入、Marked.js 按需渲染。
- `fileTree.js`  : **[侧边栏]** 负责目录树的拉取与渲染、PC/移动端点击交互、删除按钮的生命周期管理。
- `token.js`     : **[鉴权]** 从 `localStorage` 存取 GitHub Repository 与 PAT (Personal Access Token)。
- `modal.js`     : **[弹窗]** 控制 Token 录入弹窗。
- `toast.js`     : **[提示]** 负责右下角的轻量级全局 Toast 通知，并在动画结束后清理 DOM。

## 📦 外部核心依赖 (CDN 引入，无 Bundler)
- **UI 框架**: Bootstrap v5 (JS Bundle + CSS，用于网格、Offcanvas 抽屉、Modal、Toast、Theme切换)。
- **图标库**: FontAwesome v6 (使用 `fa-solid`, `fa-brands`)。
- **编辑器核心**: Monaco Editor (AMD Loader 方式懒加载，确保性能)。
- **渲染引擎**: Marked.js (Markdown 转 HTML，仅在预览模式触发)。
- **编码工具**: js-base64 (解决原生 `atob/btoa` 处理 UTF-8 中文报错的问题)。

## 🔄 核心状态管理 (AppState in main.js)
任何接手此项目的 LLM 必须严格遵循以下状态流转：
1. `currentFilePath`: 当前打开文件的路径 (如 `notes/arch.md`)。
2. `currentFileSha`: 当前文件在 GitHub 的 SHA 值。**API 更新文件时必须携带此值，更新成功后必须立即同步新的 SHA 以防 409 冲突。**
3. `isDirty`: 脏标记。用于控制右上角“未保存”状态提示，并在 `beforeunload` 时拦截浏览器关闭操作。
4. `isSaving`: 防抖标记。拦截 `Ctrl+S` 的连击，防止并发 API 请求。

## 🚦 核心架构与交互决策 (Design Decisions)
1. **扁平化文件结构**：暂时不支持深层文件夹创建。原因：扁平化结构对移动端 UI 最友好，且能最大程度减少 LLM 读取上下文时的层级解析消耗。
2. **沉浸式预览，而非双屏渲染**：放弃双屏实时预览。使用全屏居中覆盖图层展示 Markdown，提升阅读心流，彻底避免 Marked.js 实时编译带来的 CPU 消耗。
3. **缓存穿透机制**：GitHub API 请求文件列表时极易命中 CDN 缓存。`api.js` 中拉取列表必须附带 `?t=${Date.now()}`，确保每次新建/删除后列表能实时更新。
4. **主题与色彩引擎**：通过 `ThemeManager` 监听 HTML 的 `data-bs-theme` 属性，实现 Bootstrap 组件与 Monaco Editor 主题（vs-light / vs-dark）的无缝同步，并支持顶部导航栏的个性化强调色切换。
5. **移动端优先适配**：利用 Bootstrap 的 `.offcanvas-md` 实现左侧文件树在手机端自动转为左滑抽屉，在 PC 端自动展平。

## 🚀 未来扩展预留方向 (Roadmap)
- [ ] 增加图床支持（自动将粘贴的图片转为 Base64 或上传至特定图床目录）。
- [ ] 增加多文件标签页 (Tabs) 切换功能，便于在文档间快速核对。
- [ ] 引入 LLM Chat 悬浮窗，可读取当前 Monaco 里的内容作为 Context 进行直接问答。