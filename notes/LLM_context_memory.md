###   LLM_context_memory    

---
title: UniDoc Editor 系统架构蓝图
project: UniDoc Editor
current_snapshot: V1.20-Base
last_updated: 2026-08-02
architecture: Serverless Frontend-Only (零后端纯前端架构)
core_engine: CodeMirror 6 (CM6)
state_management: Middleware Bus (connector.js)
storage: GitHub REST API + .unidoc-settings.json 
---

# 🧩 系统架构快照 (Single Source of Truth)

## 1. 核心模块解耦职责
- `main.js`: 核心主板。管理全局状态 (`AppState`)、防键盘遮挡的视口逻辑、PWA 热重载引擎，以及基于 AST 数据驱动的命令控制台。
- `connector.js`: 中间件总线。拦截所有 UI 点击动作，转化为宏指令下发，输出极客遥测日志。**（绝对禁止 UI 层直接调用编辑器 API）**。
- `api.js`: GitHub 数据总线。纯文本与 Base64 图片直传，强绑 `?t=` 时间戳防 CDN 缓存。
- `editor.js`: 纯净的 CM6 底层。利用 `Compartment` 实现动态换肤与只读锁，回归原生 `ContentEditable` 触控交互，内置 Gfm 换行与格式清洗算法。
- `toolbarManager.js`: 数据驱动装配车间。废弃硬编码，读取云端配置动态渲染组件。
- `settingsManager.js`: 云配置管家。静默同步云端 `.unidoc-settings.json`。
- `clipboardManager.js`: 安全管家。接管 Base64 缓存、零宽字符清洗与底层剪贴板粉碎。
- `fileTree.js`: 侧边栏引擎。零延迟前端过滤搜索 + 星标置顶排位系统。

## 2. 核心设计黑科技 (禁止随意篡改)
- **开发模式自毁防御**: 只要侦测到 `localhost` 或 `127.0.0.1`，主动反向注销所有 PWA Service Worker 实例，彻底防范 Live Server 幽灵缓存覆盖本地代码。
- **移动端键盘上推防御**: 利用 `position: fixed` 钉死页面，动态压缩 `document.body` 尺寸触发 Monaco/CM6 重新 layout。
- **动态侧边栏渲染**: 侧边栏支持动态拖拽，基于 `localStorage` 实现记忆，支持双击一键恢复默认宽度，并联动触发核心引擎重绘。

---

# 🚀 内部版本控制与开发日志 (Changelog)

> **当前基线快照**: `[Snapshot: V1.20-Base]`

### 已合并补丁 (Merged Patches)
- **`[Patch-1]` 架构/PWA防御**: 修改 `main.js` 初始化生命周期，加入 Live Server 物理隔离 Kill Switch，彻底解决本地调试时的 PWA 幽灵缓存问题。
- **`[Patch-2]` UI/侧边栏增强**: 激活并重构 `main.js` 中的 `setupSidebarResizer`，在 `index.html` 补充 `#sidebar-resizer` 把手，并添加对应 CSS 磁吸动画。加入本地宽度记忆及双击复原彩蛋。

---

# 🛑 架构师开发铁律 (Rules)  

1. **纯净输出**：每次修改代码时，只需输出需要修改的核心函数或具体逻辑块，禁止在没有要求时输出全量文件以节省 Token。
2. **绝对解耦**：任何新增的编辑器功能，必须通过 `connector.js` 添加路由，再由 `editor.js` 执行。
3. **前端限制**：本项目无任何 Node.js/Webpack 构建过程，所有外部依赖必须使用 ESM (如 esm.sh) 或纯 CDN 引入。
4. **记忆锁定**：所有增量开发均基于当前最新的 `[Snapshot]` 进行 `[Patch-X]` 局部更新，遇大版本重构需建立新快照。

