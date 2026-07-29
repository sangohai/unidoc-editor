# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 1. 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、强隐私的协同知识库与全能发布站。
- **当前进度**: **V1.14 终极纯净内核与排版定型版**。彻底完成底层引擎大换血（从 Monaco 更换为 CodeMirror 6），回归原生触控交互（移除摇杆）；引入动态排版控制；解决所有多端 UI 溢出与层级遮挡 Bug。

## 📁 2. 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源（强制扁平化）及 `.unidoc-settings.json` 隐藏云配置。
- `doc/`                   : 存放此 blue-print.md，记录项目的架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与脱机/网络优先代理策略。
- `index.html` & `style.css`: 骨架与样式。包含 `100dvh` 键盘护甲、突破层级的居中悬浮面板，及 CSS 变量动态排版引擎。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、字体实时缩放绑定、防遮挡视口逻辑及 PC 侧边栏拖拽引擎。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。
- `settingsManager.js`     : **[云端配置总管]** 与 GitHub 同步 `.unidoc-settings.json`，打通星标与快捷词库多端漫游。
- `editor.js`              : **[编辑引擎]** CodeMirror 6 (CM6) 控制中心。动态加载极简模块，管理 Markdown 高亮、原生排版、格式水洗。
- `fileTree.js`            : **[侧边栏]** 零延迟前端过滤搜索 + 内存状态重构排序的星标系统。
- `charPicker.js`          : **[表情库]** 表情与特殊符号的懒加载居中渲染。
- `clipboardManager.js`    : **[安全与图床管家]** Base64 直传、文本零宽字符清洗、底层剪贴板粉碎。
- `exportManager.js`       : **[导出中心]** 纯前端打包导出 `.md`、`.html` 及原生 `.pdf` 打印。
- `garbageCollector.js`    : **[自我清洁]** 扫描并一键销毁孤儿图片。

## 🚦 3. 核心“黑科技”设计决策 (Design Decisions)
1. **引擎换血与交互回归 (CodeMirror 6 Migration)**：
   - **痛点**：Monaco 基于 Canvas 渲染，导致移动端彻底丢失原生长按选词、滑动与输入法兼容能力，迫使引入复杂的“虚拟摇杆”与“锚点打点”做弥补，代码严重臃肿。
   - **决策**：果断换装基于原生 `contenteditable` 的 CodeMirror 6。利用 ESM 动态按需加载几十 KB 核心。彻底删除摇杆与锚点代码，**回归操作系统最原生的移动端长按放大镜、水滴选词与丝滑滚动体验。**
2. **动态排版引擎 (Dynamic Typography)**：
   - 抛弃繁琐的 JS 实例重绘，直接在 CSS `:root` 挂载 `--editor-font-size` 和 `--editor-font-family` 变量。通过 `input type="range"` 监听拖动，实现无延迟、防卡顿的实时排版缩放，并支持无衬线/衬线/等宽字体秒切。
3. **隐藏式云端同步中枢 (Ghost Cloud Sync)**：
   - 抛弃 `localStorage` 单机限制，利用 API 静默读写 `notes/.unidoc-settings.json`，将用户的星标偏好与自定义快捷词库无缝全球漫游。
4. **扁平化存储与极速检索 (Flat Storage Strategy)**：
   - 放弃多层文件夹。所有数据存放于根目录，通过监听 Input 事件控制 DOM `display` 实现零延迟搜索，并前置渲染带星标的文件。

## 🚀 4. 下一阶段跨域开发计划 (Roadmap)
- [ ] **GitOps 桥梁 (Raw URL Exporter)**: 在导出菜单增加“复制 Raw 链接”，打通 CBPP Linux 服务器终端，实现配置文档一键 `wget` 热下发。
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**: 直连本地 `Ollama` (`127.0.0.1:11434`)，实现绝对隐私的本地化 AI 智能写作。
- [ ] **📦 Emoji 中心化资产仓库**: 启动 `emoji-hub` 子项目，为跨引擎游戏项目建立 SSOT 数据源。