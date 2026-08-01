# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 1. 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **当前进度**: **V1.18 极简 UI 与防弹体验版**。完成了底盘引擎 CodeMirror 6 的完美换血，彻底修复了 Bootstrap 模态框的 `aria-hidden` 无障碍焦点 Bug。清除了冗余界面按钮，将侧边栏精简至极限，确立了“高频操作进工具栏、低频全局进命令行”的极简交互哲学。

## 📁 2. 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源及 `.unidoc-settings.json` 隐藏云配置。
- `doc/`                   : 存放此 blue-print.md，记录项目的架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** 桌面化配置，内置开机嗅探与热重载自检引擎 (`updatefound` 拦截)。
- `index.html` & `style.css`: 骨架与样式。包含 `100dvh` 防键盘挤压护甲、跨层级的居中悬浮面板、以及极细虚拟进度条。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、防遮挡视口逻辑，以及 AST 命令树解析器 (`setupCommandPalette`)。
- `connector.js`           : **[指令海关]** 拦截所有 UI 宏指令，统一调度底层引擎，并输出遥测日志。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。
- `editor.js`              : **[纯净引擎]** CM6 控制中心。利用 `Compartment` 实现动态插槽换肤、Gfm 格式直觉换行、以及非线性虚拟摇杆引擎。
- `settingsManager.js`     : **[云配置管家]** 同步隐藏的 JSON 配置，打通星标与快捷词库多端漫游。
- `fileTree.js`            : **[侧边栏]** 零延迟前端过滤搜索 + 星标置顶排序系统。
- `charPicker.js`          : **[表情库]** 独立接管表情与特殊符号的渲染与插入逻辑。
- `clipboardManager.js`    : **[安全与图床管家]** Base64 直传缓存、零宽字符清洗、内存一键粉碎。
- `exportManager.js`       : **[导出中心]** 纯前端导出 `.md`、`.html` 及 `.pdf`。
- `garbageCollector.js`    : **[自我清洁]** 交叉比对扫描并一键销毁孤儿图片。

## 🚦 3. 核心“黑科技”设计决策 (Design Decisions)
1. **中枢总线隔离 (Middleware Bus)**：
   - UI 层彻底去逻辑化。所有按钮点击均转化为标准宏指令，由 `connector.js` 中转，确保底层替换时 UI 层绝对安全。
2. **意图驱动的命令行 (Data-Driven Command Palette)**：
   - 在 `main.js` 定义 `commandTree` 数组，通过前端监听 Input 进行 0 延迟对象过滤。修复了移动端失去焦点导致 `aria-hidden` 报错的无障碍拦截陷阱。
3. **PWA 幽灵缓存防御 (Ghost Cache Defense)**：
   - 每次启动调用 `reg.update()` 嗅探云端变化，触发 `updatefound` 时立刻升起黑色防误触护盾，强制锁定屏幕并热重载最新代码。
4. **全平台输入法与光标原生态回归 (Native ContentEditable)**：
   - 依赖 CM6 底层，恢复手机系统级水滴选词与滚动。针对长文档浏览，引入 Pointer Events + 二次方非线性加速算法的物理级虚拟摇杆。

## 🚀 4. 下一阶段跨域开发计划 (Roadmap)
- [ ] **⚙️ 数据驱动工具栏 (Data-Driven Toolbar)**: 废弃 Hard-code 的 HTML 按钮。构建 `ToolbarRegistry` 武器库，通过 `.unidoc-settings.json` 动态装配工具栏，实现用户维度的 100% 界面自定义。
- [ ] **🔗 GitOps 桥梁 (Raw URL Exporter)**: 在导出菜单增加“复制 Raw 链接”，一键下发配置文件到 Linux (CBPP + Podman) 服务器终端。
- [ ] **🚀 离线物理级 AI 伴侣 (Local-First AI Co-Pilot)**: 直连本地 `Ollama` (`127.0.0.1:11434`)，实现绝对隐私的本地化 AI 智能写作。