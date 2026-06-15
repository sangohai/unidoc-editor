# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **当前进度**: **V1.5 极客安全与生产力完全体**（完成高度模块化重构、实现了纯前端图床自动长传、本地缓存防 404 渲染、隐形追踪符清洗、以及操作系统级的剪贴板粉碎机）。

## 📁 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源。包含纯文本文件及 `images/` 图床目录。
- `doc/`                   : 存放此 blue-print.md，项目的“大脑”和架构上下文。
- `index.html` & `style.css`: 骨架与样式。包含左侧物理滑轨、下拉弹窗、居中表情面板黑科技。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、快捷键拦截与初始化串联。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。新增了 `uploadImage` 专线接口。
- `editor.js`              : **[编辑引擎]** 极致瘦身的 Monaco 控制中心。仅负责语言切换、左侧物理滑轨的触摸代理、及 Marked.js 图层渲染（包含图片内存缓存读取机制）。
- `fileTree.js`            : **[侧边栏]** 负责目录树拉取渲染。采用“高亮区与图标区物理解耦”的防误触设计。
- `charPicker.js`          : **[新] [表情库]** 独立接管表情与特殊符号的静态数据、懒加载渲染及插入逻辑。
- `clipboardManager.js`    : **[新] [安全管家]** 独立接管 `paste` 事件拦截。负责 Base64 图床直传、文本隐形字符清洗、及 `navigator.clipboard` 的粉碎与查看。

## 📦 外部核心依赖 (CDN)
- Bootstrap v5 / FontAwesome v6
- Monaco Editor (AMD Loader 懒加载)
- Marked.js (Markdown 图层渲染，已重写图片解析规则)
- js-base64 (解决中文字符 API 传输报错)

## 🚦 核心架构与“黑科技”设计决策 (Design Decisions)
1. **纯前端图床引擎 (Frontend Image Hosting)**：
   - 拦截 Monaco 的 `paste` 事件（在 Capture 阶段提前截胡）。
   - 将剪贴板二进制流转为纯 Base64，调用 GitHub API 直接推入 `notes/images/` 目录。
   - 上传期间在光标处生成 `![正在上传...]()` 占位符，完成后利用 `findMatches` 保护历史记录并优雅替换为相对路径 `![图片](images/xxx.png)`。
2. **内存级图片缓存 (In-Memory Image Cache)**：
   - **痛点**：图片传到 GitHub 后，本地还没执行 `git pull` 时，预览区会因找不到本地图片而报 404。
   - **方案**：在上传图片时，将 Base64 字符串同步存入 `ClipboardManager.imageCache`。重写 `marked.use` 渲染器，优先从内存读取 Base64 直接秒渲染，彻底解决开发环境的时空错位。
3. **剪贴板极客防护 (Clipboard Security)**：
   - **清洗机**：使用正则 `/[\u200B-\u200D\uFEFF\u202A-\u202E]/g` 嗅探并剥离外来文本中的零宽追踪字符。
   - **粉碎机**：调用 `navigator.clipboard.writeText(' ')` 强制覆写操作系统底层剪贴板，防后台流氓软件窃密。
4. **移动端左侧实体滑轨 (Physical Scroll Rail)**：
   - 彻底废弃复杂的逻辑只读锁，利用透明 div 覆盖行号区，计算触摸滑动的 Delta Y 与总高度的比率，映射到底层滚动条，实现绝对防误触。

## 🚀 下一阶段开发计划 (Roadmap)
- [ ] **图片垃圾回收机制 (Garbage Collection)**：针对废弃图片占用空间的问题，开发删除机制（可选择在删除 `.md` 文件时级联删除图片，或开发独立的未引用图片清理器）。
- [ ] **PWA 渐进式应用支持 (形态升维)**：配置 `manifest.json` 与 `sw.js`，允许用户将其“添加到主屏幕”，变为全屏独立 App。