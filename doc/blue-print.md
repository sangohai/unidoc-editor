---
project: UniDoc Editor
version: V1.20
status: Stable / Pro-Editor / PWA Hot-Reload Active
architecture: Serverless Frontend-Only
core_engine: CodeMirror 6 (CM6)
state_management: Middleware Bus (connector.js)
storage: GitHub API (notes/ directory) + .unidoc-settings.json
last_updated: 2026-08-02
---

<system_instruction>
此文档为 UniDoc Editor 当前项目的绝对真理与最高上下文（Single Source of Truth）。所有的后续修改必须严格遵循此处的模块化解耦规范。禁止将 UI 控制逻辑与底层 EditorEngine 强耦合；所有视图、工具栏指令必须通过 `connector.js` 统一分发。修改 PWA 缓存机制时需慎重测试生命周期。
</system_instruction>

<latest_snapshot>

# 🏗️ 核心架构状态 (Architecture State)

## 1. 表现层 (UI Layer)
- `index.html` & `style.css`: 系统骨架。
  - 核心装甲：启用了 `100dvh` 防键盘遮挡护甲、`position: fixed` 防系统上推。
  - 移动端适配：利用超大 `box-shadow` 伪造模态框背景，实现下拉面板（表情、排版、词库）在手机端的强制居中悬浮。
- `fileTree.js`: 侧边栏模块。前端 0 延迟过滤搜索与基于云端配置的星标置顶排位系统。
- `toolbarManager.js`: **[数据驱动装配车间]** 废弃硬编码按钮，读取配置数组动态渲染工具栏组件，智能隐藏无关格式按钮，提供一键全量装配 UI。
- `charPicker.js`: 独立接管表情与特殊符号的懒加载渲染。

## 2. 调度与中间件层 (Middleware Layer)
- `main.js`: 核心主板。管理全局状态 (`AppState`)、主题配置、AST 命令控制台 (`setupCommandPalette`) 以及 **PWA 开机自检与热重载引擎**。
- `connector.js`: **[指令海关]** 核心总线。拦截 UI 层抛出的所有宏指令，统一校验并调度底层引擎，同时输出 `[COMMAND]` 遥测日志，保障 UI 与 Engine 绝对隔离。

## 3. 业务总线与存储层 (Data & Business Logic)
- `api.js`: 封装 GitHub REST API。列表拉取强绑 `?t=` 时间戳防 CDN 缓存。
- `settingsManager.js`: 云配置管家。与云端 `.unidoc-settings.json` 同步，打通词库 (Snippets)、工具栏布局与星标名单的跨设备漫游。
- `clipboardManager.js`: 安全管家。接管 Base64 图床缓存直传、零宽字符清洗与剪贴板粉碎。
- `garbageCollector.js`: 图床清理扫地机器人。交叉比对文档引用，一键销毁孤儿图片。
- `exportManager.js`: HTML5 Blob 纯前端全能导出中心（`.md`, `.html`, `.pdf`）。

## 4. 核心底层引擎 (Engine Layer)
- `editor.js`: 纯净的 CM6 控制中心。
  - **特性**：采用 ESM 动态按需加载；利用 CM6 `Compartment` 实现动态插槽换肤与只读锁切换；内置 Gfm 格式直觉换行、格式水洗机与 Prompt 提纯算法。
  - **交互**：全面回归系统原生 ContentEditable，恢复手机原生放大镜、水滴选词与丝滑滚动体验。

</latest_snapshot>

<design_decisions>
1. **PWA 幽灵缓存防御与热重载 (Ghost Cache Defense)**:
   - 每次开机强制调用 `reg.update()` 嗅探 `sw.js` 字节变化。利用 `updatefound` 事件触发全局黑色防误触护盾 `UI.showGlobalLoader`，锁定屏幕 1.5 秒并强制 `location.reload()`，实现云端代码更新后的全自动无缝热重载。
2. **彻底解耦的工具栏体系 (Data-Driven Toolbar)**: 
   - 复杂的下拉面板存放在隐藏的 HTML 仓库 (`#toolbar-components-pool`) 中，由 `toolbarManager.js` 根据 JSON 配置按需取出并组装。
3. **移动端键盘上推防御 (VisualViewport Armor)**:
   - 废弃 `100vh`，采用现代 `100dvh`，并侦测键盘高度精准压缩 `document.body` 尺寸触发 Monaco 重新 layout，实现 100% 完美可见区。
</design_decisions>

<active_roadmap>
1. 🔗 **GitOps 桥梁 (Raw URL Exporter)**: 在导出菜单增加“复制 Raw 链接”，一键下发 YAML/SH 配置到 Linux 服务器终端。
2. 🚀 **离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**: 通过跨域请求直连本地运行的 `Ollama` 引擎 (`127.0.0.1:11434`)，利用 `ReadableStream` 流式输出，实现绝对隐私的本地化 AI 智能续写。
3. 📦 **Emoji 中心化资产仓库**: 另起独立 `emoji-hub` 项目存放 SVG/PNG，为跨引擎游戏项目提供统一的 SSOT 数据源。
4. ⚽ **World Cup Oracle**: 构建高并发的世界杯共识预测独立 Web App。
</active_roadmap>