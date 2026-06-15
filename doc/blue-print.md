# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、纯文本的协同知识库工作台。
- **当前进度**: **V1.3 移动端交互完全体**（实现了完整的文件 CRUD、多格式支持、防呆后缀名隔离、表情面板懒加载、以及极其硬核的“左侧滑轨防误触”物理隔离设计）。

## 📁 项目目录与职责映射
`unidoc-editor/`
- `notes/`       : 业务数据源，存放实际编写的纯文本文件（强制扁平化目录）。
- `doc/`         : 存放此 blue-print.md，项目的“大脑”和架构上下文。
- `index.html`   : 唯一 HTML 骨架。包含全局响应式布局、下拉后缀控制、以及覆盖在行号上的左侧滑轨 (`#left-scroll-zone`)。
- `style.css`    : 纯前端响应式样式。包含暗黑模式代码块适配、文件树操作按钮解耦、移动端表情面板强制居中与阴影伪遮罩黑科技。
- `main.js`      : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度（新建/重命名/删除）、快捷键拦截与全局锁屏 Loading。
- `api.js`       : **[数据总线]** 封装 GitHub REST API。列表拉取强绑 `?t=` 时间戳防 CDN 缓存穿透。
- `editor.js`    : **[编辑引擎]** Monaco Editor 控制中心。管理 `.md/.txt` 语言动态切换、表情面板懒加载渲染、以及左侧滑轨的触摸滚动代理 (`initLeftScrollZone`)。
- `fileTree.js`  : **[侧边栏]** 负责目录树拉取渲染。采用“高亮区与图标区解耦”的防误触设计。
- `token.js` & `modal.js` & `toast.js`: 鉴权与 UI 反馈基础组件。

## 📦 外部核心依赖 (CDN)
- Bootstrap v5 (网格、Offcanvas、Modal、Dropdown)
- FontAwesome v6
- Monaco Editor (AMD Loader 懒加载)
- Marked.js (Markdown 纯净图层渲染)
- js-base64 (解决中文字符 API 传输报错)

## 🔄 核心状态流转 (AppState in main.js)
1. `currentFilePath`: 当前打开文件的路径。
2. `currentFileSha`: 当前文件在 GitHub 的 SHA 值。**API 更新成功后必须立即同步更新以防 409 冲突。**
3. `isDirty`: 脏标记。拦截无效的 `Ctrl+S` 请求及 `beforeunload` 防丢。

## 🚦 核心架构与“黑科技”设计决策 (Design Decisions)
1. **左侧滑轨防误触设计 (Spatial Isolation)**：
   - **痛点**：移动端触控代码区极易意外唤起虚拟键盘。
   - **方案**：彻底放弃复杂的逻辑拦截。在编辑器左侧行号上方覆盖一层 45px 宽的透明 `div` (`#left-scroll-zone`)。在 `editor.js` 中拦截其 `touchmove` 事件，将滑动差值映射给 Monaco 的 `setScrollTop`。**实现左手安全滑动（不弹键盘），右手精准点击（唤起键盘）的物理空间隔离体验。**
2. **移动端面板纯 CSS 居中伪装**：表情与符号的 Dropdown 在手机端强制 `position: fixed` 居中，利用 `box-shadow` 投射超大半透明阴影，伪造出全屏 Modal 的变暗效果。
3. **按需懒加载 (Lazy Load) 扩展面板**：表情和符号默认仅渲染 24 个基础字符保障秒开。点击底部的 `+` 号按钮后，再通过 JS 动态追加几百个扩展字符（包括罗马数字、食物等）。
4. **成对符号光标穿透**：工具栏插入 `【】`、`《》` 等长度为 2 的成对符号时，通过 `instance.setPosition` 自动将光标左移 1 位进入括号中间。
5. **后缀名防呆强绑定**：新建/重命名全面采用 Input + Bootstrap Dropdown 拆分输入，避免正则模糊猜测。

## 🚀 未来扩展预留方向 (Roadmap)
- [ ] **Emoji 中心化资产仓库**：另起 `emoji-hub` 项目存放高清 SVG/PNG，彻底解决游戏引擎的跨平台表情乱码问题。
- [ ] **纯前端图片图床化**：拦截 Monaco 的粘贴事件，将剪贴板图片转 Base64 走 API 存入 `notes/images/`。
- [ ] **PWA 渐进式应用支持**：配置 `manifest.json` 与 Service Worker，允许用户将 UniDoc 安装到手机桌面，去除浏览器地址栏。