# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 1. 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **当前进度**: **V1.16 PWA 热更新与全生态闭环版**。底盘引擎已极度稳固，彻底解决移动端所有适配痛点（含键盘遮挡、触控手感）。最新引入了 PWA 启动自检与热重载引擎，彻底终结了前端缓存滞后的幽灵 Bug，实现跨设备代码秒级无感热更。

## 📁 2. 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源（强制扁平化）及 `.unidoc-settings.json` 隐藏云配置。
- `doc/`                   : 存放此 blue-print.md，记录项目的架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与脱机缓存代理策略。
- `index.html` & `style.css`: 骨架与样式。包含突破层级的 `mobile-modal-dropdown` 居中弹窗装甲，以及 CSS 变量排版引擎。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、防遮挡视口逻辑、PC 侧滑引擎，以及 **PWA 开机自检与热重载引擎**。
- `connector.js`           : **[指令海关]** 拦截所有 UI 指令并下发底层，输出 `[COMMAND]` 遥测日志，为 AI 留存动作上下文。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。提供文本与 Base64 图片双轨直传，带时间戳防 CDN 缓存。
- `editor.js`              : **[编辑引擎]** CodeMirror 6 (CM6) 控制中心。动态加载 ESM 模块，提供 Markdown 缓存图层渲染、原生排版、格式水洗及锚点控制。
- `settingsManager.js`     : **[云配置管家]** 同步 `.unidoc-settings.json`，打通星标与快捷词库跨端漫游。
- `fileTree.js`            : **[侧边栏]** 零延迟前端过滤搜索 + 星标置顶排序系统。
- `charPicker.js`          : **[表情库]** 独立表情与特殊符号的懒加载渲染。
- `clipboardManager.js`    : **[安全管家]** 拦截 `paste`，处理 Base64 图床直传、文本零宽字符清洗、底层剪贴板粉碎。
- `exportManager.js`       : **[导出中心]** 纯前端打包导出本地 `.md`、带 CSS 的 `.html` 及 `.pdf`。
- `garbageCollector.js`    : **[自我清洁]** 交叉比对扫描并一键销毁云端孤儿图片。
- `token.js` & `modal.js` & `toast.js`: 鉴权与 UI 基础组件。

## 🚦 3. 核心“黑科技”设计决策 (Design Decisions)
1. **PWA 幽灵缓存防御 (Ghost Cache Defense)**：
   - **痛点**：PWA 为了离线可用，其 Service Worker 会顽固缓存旧代码，导致 GitHub 部署后移动端用户迟迟刷不出新功能。
   - **方案**：在 `main.js` 中引入自检引擎。每次启动调用 `reg.update()` 嗅探云端 `sw.js` 变化；一旦触发 `updatefound`，立即使用 `UI.showGlobalLoader` 升起黑色防误触护盾，强制锁定屏幕 1.5 秒并调用 `location.reload()` 执行热重载。
2. **中枢总线隔离 (Middleware Bus)**：
   - 所有工具栏操作均转化为标准宏指令（如 `FORMAT_BOLD`），由 `connector.js` 中间件审核后调派给底层，达成顶级解耦并记录极客遥测日志。
3. **移动端终极交互与原生态回归 (Native-like Mobile UX)**：
   - 依赖 CM6 的 `contenteditable` 底层，恢复系统级水滴选词与丝滑滚动。针对狭窄屏幕菜单被裁切，采用 `fixed` 结合超大阴影，伪造出屏幕居中的沉浸式面板。
4. **移动端键盘终极护甲 (Fixed Viewport Armor)**：
   - CSS 采用 `position: fixed` 钉死页面，JS 监听 `VisualViewport`，动态将 `body` 精准压缩至键盘上方可用区，根治系统键盘顶飞界面的 Bug。
5. **隐藏式云端同步中枢 (Ghost Cloud Sync)**：
   - 利用 API 静默读写云端 `.unidoc-settings.json`，实现星标与自定义词库全球漫游。

## 🚀 4. 跨域探索开发计划 (Roadmap)
- [ ] **GitOps 桥梁 (Raw URL Exporter)**: 在导出菜单增加“复制 Raw 链接”，一键下发配置文件到 Linux (CBPP + Podman) 服务端。
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**: 直连本地 `Ollama` (`127.0.0.1:11434`)，实现绝对隐私的本地化 AI 辅助。
- [ ] **📦 Emoji 中心化资产仓库**: 另起 `emoji-hub` 项目存放 SVG/PNG，提供 SSOT 图形数据源。
- [ ] **⚽ World Cup Oracle**: 构建高并发的世界杯共识预测独立 Web App。