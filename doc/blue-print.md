# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，直接部署于 GitHub Pages。数据持久化依赖 GitHub REST API，通过用户的 PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、纯文本的协同知识库工作台。
- **当前进度**: **V1.1 核心功能完善版**（实现了完整的文件 CRUD、多格式支持、暗黑模式切换、后缀名防呆隔离设计、UI 操作栏解耦与全屏锁屏拦截）。

## 📁 项目目录与职责映射
`unidoc-editor/`
- `notes/`       : 业务数据源，存放实际编写的纯文本文件（强制扁平化目录，不引入树状深层文件夹）。
- `doc/`         : 项目的“大脑”和架构上下文（存放此 blue-print.md），供 LLM 和开发者随时查阅。
- `index.html`   : 唯一 HTML 骨架。包含全局响应式布局、下拉后缀名的新建弹窗、重命名弹窗、锁屏 Loading 等。
- `style.css`    : 纯前端响应式样式。包含暗黑模式代码块适配、文件树悬浮操作按钮分离美化。
- `main.js`      : **[核心主板]** 全局状态机 (`AppState`)、主题管理器 (`ThemeManager`)、文件流转调度（新建/重命名/删除）、快捷键拦截与全局锁屏。
- `api.js`       : **[数据总线]** 封装 GitHub REST API。注意：拉取列表必须带时间戳 `?t=` 防止 CDN 缓存穿透。
- `editor.js`    : **[编辑引擎]** Monaco Editor 懒加载、`.md/.json/.yaml/.txt` 语言动态切换、Markdown 快捷输入工具栏、Marked.js 沉浸式图层预览。
- `fileTree.js`  : **[侧边栏]** 负责目录树拉取渲染。采用“高亮名字区与操作图标区解耦”的 DOM 设计，绑定 PC/移动端点击交互。
- `token.js`     : **[鉴权]** 负责在 `localStorage` 存取 GitHub Repository 与 PAT。
- `modal.js`     : **[弹窗]** 控制 Token 录入弹窗生命周期。
- `toast.js`     : **[提示]** 负责右下角轻量级自动销毁的 Toast 通知。

## 📦 外部核心依赖 (CDN)
- **UI 框架**: Bootstrap v5 (用于网格、Offcanvas 抽屉、Modal、下拉菜单 Dropdown、Theme 切换)。
- **图标库**: FontAwesome v6。
- **编辑器核心**: Monaco Editor (AMD Loader 方式按需懒加载)。
- **渲染引擎**: Marked.js (Markdown 转 HTML)。
- **编码工具**: js-base64 (解决原生 `atob/btoa` 处理 UTF-8 中文报错死穴)。

## 🔄 核心状态流转 (AppState in main.js)
任何接手此项目的 LLM 需严格遵守以下状态维护逻辑：
1. `currentFilePath`: 当前打开文件的路径。
2. `currentFileSha`: 当前文件在 GitHub 的 SHA 值。**更新文件时必须携带此值，API 返回后必须立即更新内存中的 SHA 以防 409 冲突。**
3. `isDirty`: 脏标记。拦截 `Ctrl+S` 的无效请求，并在 `beforeunload` 时拦截浏览器关闭操作防丢失。

## 🚦 核心架构与“克制化”设计决策 (Design Decisions)
1. **后缀名防呆设计 (分离输入)**：在新建文件 (`newFileModal`) 和重命名 (`renameFileModal`) 中，严禁用户直接手打后缀。采用 Input + Bootstrap Dropdown (或纯文本标签) 的方式强绑定 `.md/.json/.yaml/.txt`，便于后台一键生成对应的 Init Content。
2. **三步走重命名逻辑**：由于 GitHub API 缺乏原生重命名接口，`main.js` 中的重命名逻辑被强行设计为：`获取原文件内容 -> 以新路径 Save -> Delete 原文件` 事务。必须加上全屏 Loading 防止用户打断。
3. **高亮 UI 物理隔离**：侧边栏 `.file-row` 被拆分为局部的 `.file-item` (控制蓝色高亮) 和 `.file-actions` (重命名/删除按钮)，防止选取框颜色吞没操作按钮。
4. **.txt 洗格式模式**：特意引入 `.txt` 支持，挂载 Monaco 的 `plaintext` 语言模式，用于清除外部复制带来的富文本脏格式。
5. **拒绝自动保存**：为避免触发 GitHub API 限流及 Git Commit 历史爆炸，仅通过 `Ctrl+S` / `Cmd+S` 或点击按钮触发手动 Push。

## 🚀 未来扩展预留方向 (Roadmap)
- [ ] **PWA 渐进式应用支持**：增加 `manifest.json` 与 Service Worker，允许用户将此编辑器作为原生 App 安装到手机桌面。
- [ ] **纯前端图片图床化**：拦截 Monaco Editor 的粘贴事件，将剪贴板的图片转为 Base64 并通过 GitHub API 存入 `notes/images/` 目录，回写 Markdown 语法。
- [ ] **前端极速毫秒级搜索**：在左侧文件树顶部增加过滤输入框，基于已加载的 DOM 列表进行纯本地正则隐藏/显示。
- [ ] **灾备级草稿静默缓存**：使用 `localStorage` 每 10 秒静默保存一次当前内容草稿，仅防断电或异常关闭刷新。