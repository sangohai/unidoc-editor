# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、纯文本的协同知识库工作台。
- **当前进度**: **V1.2 移动端极限优化版**（实现了完整的文件 CRUD、暗黑模式切换、后缀名防呆、移动端虚拟键盘硬核防误触锁、触摸滚动代理、以及表情面板懒加载机制）。

## 📁 项目目录与职责映射
`unidoc-editor/`
- `notes/`       : 业务数据源，存放实际编写的纯文本文件（强制扁平化目录）。
- `doc/`         : 项目的“大脑”和架构上下文（存放此 blue-print.md），供 LLM 和开发者随时查阅。
- `index.html`   : 唯一 HTML 骨架。包含全局响应式布局、下拉新建/重命名弹窗、防误触玻璃板 (`#editor-glass-shield`) 等。
- `style.css`    : 纯前端响应式样式。包含暗黑模式代码块适配、文件树操作按钮解耦、移动端表情面板强制居中与伪遮罩黑科技。
- `main.js`      : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度（新建/重命名/删除）、快捷键拦截与全局锁屏。
- `api.js`       : **[数据总线]** 封装 GitHub REST API。拉取列表强绑 `?t=` 时间戳防 CDN 缓存。
- `editor.js`    : **[编辑引擎]** Monaco Editor 控制中心。管理 `.md/.txt` 语言动态切换、Marked.js 预览、表情懒加载渲染、隐形玻璃板触摸滚动代理。
- `fileTree.js`  : **[侧边栏]** 负责目录树拉取渲染。采用“高亮区与图标区解耦”的 DOM 设计。
- `token.js` & `modal.js` & `toast.js`: 鉴权与 UI 反馈基础组件。

## 📦 外部核心依赖 (CDN)
- **UI 框架**: Bootstrap v5 (网格、Offcanvas、Modal、Dropdown)。
- **图标库**: FontAwesome v6 (通过 `fa-solid`, `fa-brands` 调用)。
- **编辑器核心**: Monaco Editor (AMD Loader 懒加载)。
- **渲染引擎**: Marked.js (Markdown 纯净渲染)。
- **编码工具**: js-base64 (解决原生 `atob/btoa` 中文 UTF-8 报错)。

## 🔄 核心状态流转 (AppState in main.js)
1. `currentFilePath`: 当前打开文件的路径。
2. `currentFileSha`: 当前文件在 GitHub 的 SHA 值。**更新文件时必须携带，成功后必须立即同步以防 409 冲突。**
3. `isDirty`: 脏标记。拦截无效的 `Ctrl+S` 请求及 `beforeunload` 关闭页面防丢。
4. `isKeyboardLocked`: 位于 `editor.js`，独立控制移动端的虚拟键盘唤起状态。

## 🚦 核心架构与“黑科技”设计决策 (Design Decisions)
1. **移动端键盘物理防误触锁 (Glass Shield Proxy)**：
   - **痛点**：Monaco Editor 的 `readOnly` 无法阻止移动端点击时弹出虚拟键盘。
   - **方案**：在编辑器上方盖一层 `z-index` 更高的透明 `div` 拦截点击。同时在 `editor.js` 中监听该遮罩的 `touchstart` 和 `touchmove` 事件，将滑动距离按比例换算并调用 `instance.setScrollTop()`，**实现“隔山打牛”式的平滑滚动，彻底杜绝键盘误触。**
2. **移动端面板纯 CSS 居中与伪遮罩**：表情符号的 Dropdown 菜单在移动端采用 `position: fixed` 强制屏幕居中，并利用 `box-shadow: 0 0 0 100vw rgba(0,0,0,0.5)` 投射超大阴影，伪造出 Modal 弹窗的暗色背景效果，0 JS 开销。
3. **高频组件懒加载 (Lazy Load)**：表情和符号面板默认仅渲染 24 个基础字符（保证 0 毫秒秒开）。用户点击 `+` 号时，再通过 JS 动态追加几百个扩展字符（包括罗马数字、食物表情等），防止移动端 DOM 爆炸。
4. **成对符号光标穿透**：工具栏插入 `【】`、`《》` 等长度为 2 的成对符号时，通过 `instance.setPosition` 自动将光标左移 1 位，实现光标自动居中。
5. **后缀名防呆设计**：新建/重命名全面采用 Input + Bootstrap Dropdown 分离输入，避免正则猜测，一键生成对应格式的初始模板。

## 🚀 未来扩展预留方向 (Roadmap)
- [ ] **Emoji 中心化资产仓库**：另起 `emoji-hub` 项目存放高清 SVG/PNG，彻底解决游戏跨引擎表情乱码问题。
- [ ] **纯前端图片图床化**：拦截 Monaco 的粘贴事件，图片转 Base64 走 GitHub API 存入 `notes/images/`。
- [ ] **PWA 渐进式应用支持**：增加 `manifest.json` 与 Service Worker，允许用户将 UniDoc 安装到手机桌面，体验媲美原生 App。