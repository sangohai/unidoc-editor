# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 1. 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、强隐私的协同知识库与全能发布站。
- **当前进度**: **V1.13 云配置中枢与防弹架构完全体**。解决了 ES6 变量作用域陷阱，彻底打通跨设备自定义词库（Snippets）与星标排序的云端同步；完美修复了移动端 Flexbox 布局被系统虚拟键盘挤压毁灭的世界级 Bug。

## 📁 2. 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源。包含 `.md` 文件、`images/` 云端图床及 `.unidoc-settings.json` 隐藏云配置文件。
- `doc/`                   : 存放此 blue-print.md，记录项目的架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与脱机/网络优先代理策略。
- `index.html` & `style.css`: 骨架与样式。突破了 Flex 挤压限制（`min-height:0`），实现了 PC 侧滑拽调整与手机端表情面板的居中悬浮装甲。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、以及核心的 `VisualViewport` 尺寸重算抗遮挡逻辑。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。
- `settingsManager.js`     : **[云端配置总管]** 负责与 GitHub 悄悄同步 `.unidoc-settings.json`。**（核心细节：调用外部模块时必须使用 `typeof EditorManager !== 'undefined'` 以规避 ES6 `const` 不挂载全局 window 的语法陷阱）。**
- `editor.js`              : **[编辑引擎]** Monaco 控制中心。集成 **命令中心 F1**、**物理锚点选取**、**格式水洗机** 与 虚拟摇杆动画帧引擎。
- `fileTree.js`            : **[侧边栏]** 零延迟前端过滤搜索 + 读取云端配置的星标置顶排位系统。
- `charPicker.js`          : **[表情库]** 独立接管表情与特殊符号的懒加载渲染。
- `clipboardManager.js`    : **[图床与安全管家]** Base64 直传、文本零宽字符清洗、底层剪贴板粉碎。
- `exportManager.js`       : **[导出中心]** 纯前端打包导出 `.md`、带 Github 样式的 `.html` 及原生 `.pdf` 打印。
- `garbageCollector.js`    : **[自我清洁]** 扫描孤儿图片并一键销毁。

## 🚦 3. 核心“黑科技”设计决策 (Design Decisions)
1. **隐藏式云端同步中枢 (Ghost Cloud Sync)**：
   - 抛弃 `localStorage` 单机限制，利用 GitHub 存储私有配置，实现自定义词库（Snippets）与星标的全球多端漫游。
2. **移动端键盘终极护甲 (Fixed Viewport Armor)**：
   - CSS 采用 `position: fixed` 钉死页面，外加 `min-height: 0` 破除 Flex 强推。JS 监听 `VisualViewport`，动态将 `body` 高度压缩至键盘上方的真实可用区，触发 Monaco `layout()`，实现首尾行绝对可见。
3. **全平台虚拟摇杆引擎 (Pointer Joystick Engine)**：
   - 引入 `Pointer Events` 与二次方非线性加速算法，左手微推慢走、重推狂飙，完美取代触屏滑动。
4. **扁平化存储与极速检索 (Flat Storage Strategy)**：
   - 放弃多层文件夹。采用前端 DOM `display` 切图实现 0 毫秒过滤，通过数组重组实现星标强制前置。

## 🚀 4. 下一阶段跨域开发计划 (Roadmap)
- [ ] **GitOps 桥梁 (Raw URL Exporter)**: 在导出菜单增加“复制 Raw 链接”，一键将配置文件下发到 Linux (CBPP + Podman) 服务器终端。
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**: 直连本地 `Ollama` (`127.0.0.1:11434`)，实现绝对隐私的本地化 AI 智能写作。
