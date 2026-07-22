# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 1. 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、强隐私的协同知识库与全能发布站。
- **当前进度**: **V1.11 极速扁平化与专家级编辑体系**。已完成高级移动端工具栏（物理锚点、格式水洗、控制台唤醒），并彻底抛弃传统文件夹体系，实现了基于前端毫秒级过滤与本地存储的“搜索+星标置顶”现代化文档管理架构。

## 📁 2. 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源（强制扁平化目录，依赖搜索与星标管理）。
- `doc/`                   : 存放此 blue-print.md，记录项目的“大脑”和架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与离线骨架/网络优先代理策略。
- `index.html` & `style.css`: 骨架与样式。包含左侧虚拟摇杆滑轨、极速检索框、星标动画，以及防键盘挤压的绝对定位护甲。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、防遮挡视口逻辑。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。
- `editor.js`              : **[编辑引擎]** Monaco 控制中心。集成 **命令中心 (Command Palette)**、**物理锚点选取 (Anchor Selection)**、**格式水洗机 (Sanitizer)** 与 虚拟摇杆动画帧引擎。
- `fileTree.js`            : **[侧边栏]** 负责目录树拉取渲染。集成 **毫秒级零延迟搜索 (Instant Search)** 与 **基于 LocalStorage 的星标置顶排位系统 (Star & Pin)**。
- `charPicker.js`          : **[表情库]** 独立接管表情与特殊符号的懒加载渲染。
- `clipboardManager.js`    : **[安全与图床管家]** 独立接管图床 Base64 直传、剪贴板清洗与粉碎。
- `exportManager.js`       : **[导出中心]** 纯前端打包导出本地 `.md`、独立样式 `.html` 及唤醒原生 `.pdf` 打印。
- `garbageCollector.js`    : **[自我清洁]** 交叉比对并销毁孤儿图片。

## 🚦 3. 核心“黑科技”设计决策 (Design Decisions)
1. **扁平化存储与极速检索 (Flat Storage Strategy)**：
   - **痛点**：传统 Git 文件夹无法存储空目录，且深层树状结构在移动端点按极度疲劳。
   - **方案**：拥抱卡片盒笔记法（Zettelkasten）。所有数据存放于根目录，通过纯前端监听 Input 事件控制 DOM 的 `display` 属性实现零延迟搜索；利用 `localStorage` 缓存星标路径，渲染时重构排序数组，实现数据无损分离的置顶管理。
2. **移动端精准选取防反人类设计 (Anchor Selection)**：
   - **痛点**：移动端触屏极难控制光标的拖拽起始点。
   - **方案**：引入 `|←` (设为起点) 和 `→|` (选中至此)。在用户点击时记录 `monaco.Position`，二次点击时利用 `Range.fromPositions` 生成选区并强制触发 `focus()`，完美实现大跨度精准局部选取。
3. **文本洁癖水洗机 (Sanitizer Engine)**：
   - 应对从 LLM 等外部复制带来的脏数据。一键正则替换 Tab、清洗连续空行，并彻底抹杀 `\u200B` 等零宽追踪隐私窃取符。

## 🚀 4. 下一阶段跨域开发计划 (Roadmap)
- [ ] **GitOps 桥梁 (Raw URL Exporter)**：
  - 在导出菜单增加“复制 Raw 链接”，打通 CBPP Linux 服务器终端，实现配置文档一键 `wget` 热下发。
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**：
  - 通过跨域直连本地 `Ollama` (`127.0.0.1:11434`)，实现绝对隐私的本地化 AI 代码续写/润色。