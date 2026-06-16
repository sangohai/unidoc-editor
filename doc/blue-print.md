# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、纯文本的协同知识库工作台。
- **当前进度**: **V1.6 极客安全与触控交互终极版**（完成高度模块化重构、纯前端图床、剪贴板隐私粉碎机、以及全平台兼容的“虚拟摇杆”物理级触控引擎）。

## 📁 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源。包含纯文本文件及 `images/` 图床目录。
- `doc/`                   : 存放此 blue-print.md，项目的“大脑”和架构上下文。
- `index.html` & `style.css`: 骨架与样式。包含左侧虚拟摇杆滑轨、极细进度条、下拉弹窗、居中表情面板。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、快捷键拦截。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。列表拉取强绑 `?t=` 时间戳防 CDN 缓存。
- `editor.js`              : **[编辑引擎]** Monaco 控制中心。负责语言切换、Marked.js 缓存图层渲染、以及革命性的 **虚拟摇杆动画帧引擎 (`initJoystickScrollZone`)**。
- `fileTree.js`            : **[侧边栏]** 负责目录树拉取渲染。采用“高亮区与图标区物理解耦”的防误触设计。
- `charPicker.js`          : **[表情库]** 独立接管表情与特殊符号的数据、懒加载渲染及插入逻辑。
- `clipboardManager.js`    : **[安全管家]** 独立接管 `paste` 事件拦截。负责 Base64 图床直传、文本隐形字符清洗、及 `navigator.clipboard` 的底层内存粉碎。

## 📦 外部核心依赖 (CDN)
- Bootstrap v5 / FontAwesome v6
- Monaco Editor (AMD Loader 懒加载)
- Marked.js (重写了图片解析规则，支持本地缓存秒渲染)
- js-base64 (解决中文字符 API 传输报错)

## 🚦 核心架构与“黑科技”设计决策 (Design Decisions)
1. **全平台虚拟摇杆引擎 (Pointer Joystick Engine)**：
   - **痛点**：传统滑动容易误触键盘，且长文档在平板上滚动极度疲劳。
   - **方案**：废弃原有的 `touch` 映射，改用统一的 `Pointer Events` 并启用 `setPointerCapture` 防止光标丢失。在左侧覆盖虚拟摇杆，利用 `requestAnimationFrame` 驱动 60FPS 动画帧。将手指推拉的偏移量（Offset）转化为编辑器的滚动速度（Speed）。实现了“微推慢滚，重推狂飙，松手弹簧复位”的电竞级手感。
2. **滚动展示与控制分离**：
   - 摇杆滑块 (`#left-joystick-thumb`) 永远固定居中，仅提供速度控制把手。
   - 背后垫入一条 2px 的极细进度条 (`#left-progress-bar`)，默默指示文档真实的物理滚动位置。短文档自动全局隐藏。
3. **纯前端图床与缓存引擎**：
   - 捕获阶段拦截 `paste`，提取图片 Base64 走 GitHub API 直推 `notes/images/`。
   - 同步将 Base64 写入 `ClipboardManager.imageCache`，重写 Marked.js 引擎，实现 Push 前的本地无缝零延迟预览。
4. **剪贴板极客防护 (Clipboard Security)**：
   - **清洗机**：正则剥离剪贴板文本中的零宽追踪字符。
   - **粉碎机**：一键调用 `navigator.clipboard.writeText(' ')` 覆写操作系统剪贴板，防恶意软件窃密。

## 🚀 下一阶段开发计划 (Roadmap)
- [ ] **图片垃圾回收机制 (Garbage Collection)**：开发未引用图片清理逻辑，解决图床历史遗留文件占用空间的问题。
- [ ] **PWA 渐进式应用支持 (形态升维)**：配置 `manifest.json` 与 `sw.js`，允许用户将其“添加到主屏幕”，变为全屏独立 App。