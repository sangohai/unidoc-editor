# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、强隐私的协同知识库与全能发布站。
- **当前进度**: **V1.8 (Pre-AI 稳定基座版)**。已完成前后端数据闭环（包含文件增删改查、图床直传与孤儿图片垃圾回收），完成移动端防误触摇杆交互与 PWA 桌面化，正式为下一步接入 Local LLM（本地大模型）做好纯净基座准备。

## 📁 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源。包含纯文本文件及 `images/` 云端图床目录。
- `doc/`                   : 存放此 blue-print.md，记录项目的“大脑”和架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与离线骨架/网络优先代理策略。
- `index.html` & `style.css`: 骨架与样式。包含左侧虚拟摇杆滑轨、极细进度条、以及移动端表情面板的阴影伪遮罩黑科技。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、以及 `window.visualViewport` 尺寸重算防键盘遮挡护甲。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。提供纯文本与 Base64 图片双轨直传，带时间戳防 CDN 缓存。
- `editor.js`              : **[编辑引擎]** Monaco 控制中心。负责 Marked.js 缓存图层渲染、Gfm 标准直觉换行、以及基于 `requestAnimationFrame` 的虚拟摇杆动画帧引擎。
- `fileTree.js`            : **[侧边栏]** 负责目录树拉取渲染。
- `charPicker.js`          : **[表情库]** 独立接管表情与特殊符号的数据、懒加载渲染及插入逻辑。
- `clipboardManager.js`    : **[安全管家]** 独立接管 `paste` 事件。负责图床 Base64 直传、文本零宽字符清洗、及剪贴板底层内存粉碎。
- `exportManager.js`       : **[导出中心]** HTML5 `Blob` 纯前端打包导出本地 `.md`、独立样式 `.html` 网页及原生 `.pdf` 打印。
- `garbageCollector.js`    : **[自我清洁]** 图床垃圾回收引擎。交叉比对 `.md` 文本与 `images/` 目录，一键销毁孤儿图片。
- `token.js` & `modal.js` & `toast.js`: 鉴权与 UI 反馈基础组件。

## 🚦 核心“黑科技”设计决策 (Design Decisions)
1. **全平台虚拟摇杆引擎 (Pointer Joystick Engine)**：废弃传统滚动条，利用 `requestAnimationFrame` 驱动 60FPS 动画帧，将手指推拉 Offset 转化为滚动 Speed，实现移动端“左手摇杆盲操慢滚，右手精准点击编辑”。
2. **移动端键盘上推防御 (VisualViewport Armor)**：侦测虚拟键盘真实高度，精准压缩 `document.body` 尺寸触发 Monaco 重新 layout，实现 100% 完美可见区。
3. **图床拦截与瞬时记忆渲染 (In-Memory Image Cache)**：拦截粘贴，提取 Base64 走 API 异步上传，同步写入本地内存。重写 Marked.js 渲染器，实现无网络延迟的“秒级本地渲染”。
4. **剪贴板极客防护 (Clipboard Security)**：基于正则嗅探清洗隐藏追踪符；基于 `navigator.clipboard.writeText` 覆盖内存粉碎私密数据。
5. **纯前端图床自我清洁 (Garbage Collection)**：纯前端通过 API 拉取全量数据，执行正则解析与 `Set` 集合比对差集，安全销毁云端无引用冗余图片。

## 🚀 下一阶段开发计划 (Roadmap)
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**：
  - **原理**：通过跨域请求直连本地运行的 `Ollama` 框架 (`127.0.0.1:11434`)，调用本地部署的开源大模型 (如 Qwen2.5 / DeepSeek)。
  - **核心**：利用 `ReadableStream` 实现打字机流式输出 (Streaming) 并通过 `executeEdits` 逐字实时写入 Monaco 编辑器。
  - **优势**：所有代码与笔记数据 100% 物理隔离，绝对防窃取，实现零成本、零延迟的极致私有化 AI 智能写作/代码续写。
- [ ] **Emoji 中心化资产仓库**: 规划独立的 `emoji-hub` 项目存放高清 SVG/PNG，为多端游戏项目提供 SSOT 数据源支持。