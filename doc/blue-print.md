# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 1. 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **当前进度**: **V1.15 中间件解耦与 CM6 极净稳定版**。完成了底层引擎大换血（CodeMirror 6），回归系统原生触控交互；引入 `connector.js` 中间件实现指令分离与操作遥测；完美解决多端 UI 溢出、移动端悬浮面板居中及设置数据回显等边缘 Bug。

## 📁 2. 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源（强制扁平化）及 `.unidoc-settings.json` 隐藏云配置文件。
- `doc/`                   : 存放此 blue-print.md，记录项目的架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与脱机/网络优先代理策略。
- `index.html` & `style.css`: 骨架与样式。包含 `100dvh` 防护、突破层级的 `mobile-modal-dropdown` 居中弹窗装甲，以及 CSS 变量排版引擎。
- `main.js`                : **[核心主板]** 状态管理 (`AppState`)、防遮挡视口逻辑、PC 侧滑引擎，以及向中间件下发点击事件。
- `connector.js`           : **[指令海关]** 核心总线。拦截所有 UI 指令并下发底层，同时在 Console 记录 `[COMMAND]` 遥测日志，为未来 AI 留存动作上下文。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API，提供文本与图片双轨异步直传。
- `editor.js`              : **[纯净引擎]** CodeMirror 6 (CM6) 控制中心。动态加载 ESM 模块，提供 Markdown 缓存图层渲染、原生排版、格式水洗及锚点控制底层 API。
- `settingsManager.js`     : **[云配置管家]** 同步 `.unidoc-settings.json`，打通星标与快捷词库跨端漫游。
- `fileTree.js`            : **[侧边栏]** 零延迟前端过滤搜索 + 星标置顶排序系统。
- `charPicker.js`          : **[表情库]** 独立表情与特殊符号的懒加载渲染。
- `clipboardManager.js`    : **[安全与图床管家]** Base64 直传、文本清洗、内存粉碎。
- `exportManager.js`       : **[导出中心]** 纯前端导出 `.md`、`.html` 及 `.pdf`。
- `garbageCollector.js`    : **[自我清洁]** 交叉比对扫描并一键销毁孤儿图片。
- `token.js` & `modal.js` & `toast.js`: 鉴权与 UI 基础组件。

## 🚦 3. 核心“黑科技”设计决策 (Design Decisions)
1. **中枢总线隔离 (Middleware Bus)**：
   - **痛点**：UI 直接调用编辑器 API，导致代码极度耦合，换引擎牵一发而动全身。
   - **方案**：抽离 `connector.js`。所有工具栏操作均转化为标准宏指令（如 `FORMAT_BOLD`），由中间件审核后调派给底层黑盒，同时输出遥测日志，达成顶级解耦。
2. **移动端终极交互与原生态回归 (Native-like Mobile UX)**：
   - 彻底废除虚拟摇杆，借由 CM6 的 `contenteditable` 底层，恢复系统级水滴选词与丝滑滚动。
   - 针对下拉菜单在狭窄工具栏被裁切的问题，采用 `fixed` 结合超大阴影，在移动端伪造出屏幕居中的沉浸式面板。
3. **隐藏式云端同步中枢 (Ghost Cloud Sync)**：
   - 抛弃单机限制，利用 API 静默读写云端配置，实现自定义词库（Snippets）与星标全球多端漫游。
4. **移动端键盘终极护甲 (Fixed Viewport Armor)**：
   - CSS 采用 `position: fixed` 结合 `min-height: 0` 破除 Flex 强推限制。JS 监听 `VisualViewport`，动态将 `body` 精准压缩至键盘上方可用区。

## 🚀 4. 跨域探索开发计划 (Roadmap)
- [ ] **GitOps 桥梁 (Raw URL Exporter)**: 在导出菜单增加“复制 Raw 链接”，一键将配置文件下发到 Linux (CBPP + Podman) 服务器终端。
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**: 直连本地 `Ollama` (`127.0.0.1:11434`)，实现绝对隐私的本地化 AI 辅助。
- [ ] **📦 Emoji 中心化资产仓库**: 另起 `emoji-hub` 项目存放 SVG/PNG。
- [ ] **⚽ World Cup Oracle**: 高并发世界杯共识预测独立 Web App。