# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 1. 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、强隐私的协同知识库与全能发布站。
- **当前进度**: **V1.9 全生态闭环与极致打磨版**（完成了所有核心功能的解耦、彻底攻克移动端虚拟键盘顶飞工具栏的世界级 Bug、实现纯前端多格式导出与孤儿图片垃圾回收）。

## 📁 2. 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源。包含纯文本文件及 `images/` 云端图床目录。
- `doc/`                   : 存放此 blue-print.md，记录项目的“大脑”和架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与脱机/网络优先的后台代理策略。
- `index.html` & `style.css`: 骨架与样式。包含左侧虚拟摇杆滑轨、极细进度条、以及 `position: fixed` + `100dvh` 的终极防键盘挤压护甲。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、以及 `window.visualViewport` 尺寸重算防遮挡逻辑。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。提供纯文本与 Base64 图片双轨直传，带时间戳防 CDN 缓存。
- `editor.js`              : **[编辑引擎]** Monaco 控制中心。负责 Marked.js 缓存图层渲染、Gfm 格式直觉换行、以及基于 `requestAnimationFrame` 的虚拟摇杆动画帧引擎。
- `fileTree.js`            : **[侧边栏]** 负责目录树拉取渲染。采用“高亮区与图标区物理解耦”的防误触 UI。
- `charPicker.js`          : **[表情库]** 独立接管表情与特殊符号的数据、懒加载居中渲染及插入逻辑。
- `clipboardManager.js`    : **[安全与图床管家]** 独立接管 `paste` 事件。负责 Base64 直传、文本零宽字符清洗、及 `navigator.clipboard` 的底层内存粉碎。
- `exportManager.js`       : **[导出中心]** HTML5 `Blob` 纯前端打包导出本地 `.md`、带独立样式的 `.html` 网页及唤醒原生 `.pdf` 打印。
- `garbageCollector.js`    : **[自我清洁]** 图床垃圾回收引擎。交叉比对 `.md` 文本与 `images/` 目录，一键销毁孤儿图片。
- `token.js` & `modal.js` & `toast.js`: 鉴权与 UI 反馈基础组件。

## 🚦 3. 核心“黑科技”设计决策 (Design Decisions)
1. **移动端键盘终极护甲 (Fixed Viewport Armor)**：
   - **痛点**：虚拟键盘弹出时，系统强制上推页面导致顶部不可见，或压缩 Flex 容器导致工具栏消失。
   - **方案**：CSS 采用 `position: fixed` 将 body 死死钉在屏幕左上角，并辅以 `min-height: 0` 破除 Flex 压缩限制。JS 监听 `VisualViewport`，动态将 `body` 高度精准压缩至键盘上方的真实可用区，并触发 Monaco `layout()`，实现工具栏常驻且首尾行完美可见。
2. **全平台虚拟摇杆引擎 (Pointer Joystick Engine)**：
   - 废弃传统滚动条，引入 `Pointer Events` 与 `setPointerCapture`。利用动画帧引擎将推拉 Offset 转化为滚动速度，并加入**二次方非线性加速算法**，实现“微推精准逐行，重推极速狂飙”的电竞级盲操手感。
3. **图床拦截与瞬时记忆渲染 (In-Memory Image Cache)**：
   - 拦截粘贴提取 Base64 走 API 异步上传，同步写入本地内存缓存池。重写 Marked.js 渲染器，优先命中内存缓存，实现无视网络延迟的“秒级本地渲染”。
4. **剪贴板极客防护 (Clipboard Security)**：
   - **清洗机**：基于正则嗅探清洗隐藏追踪符；**粉碎机**：基于原生 API 覆盖内存防私密数据驻留。
5. **纯前端图床自我清洁 (Garbage Collection)**：
   - 纯前端通过 API 拉取全量数据，执行正则解析与 Set 集合比对差集，安全销毁云端无引用冗余图片。

## 🚀 4. 下一阶段跨域开发计划 (Roadmap)
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**：
  - 规划通过跨域请求直连本地运行的 `Ollama` 框架 (`127.0.0.1:11434`)。利用 `ReadableStream` 流式输出打字机效果，实现绝对防窃取、零成本的私有化 AI 智能写作/代码续写。
- [ ] **📦 Emoji 中心化资产仓库**: 
  - 另起 `emoji-hub` 项目存放高清 SVG/PNG，为未来跨引擎游戏项目提供统一的 SSOT 数据源与 CDN 加速支持。