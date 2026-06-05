# Blueprint: LLM Context Editor (前端直连 GitHub 架构)

## 🎯 项目目标
构建一个纯前端的 .md, .json, .yaml 专用编辑器，部署在 GitHub Pages。
数据持久化依赖 GitHub REST API，直接读写本项目的 `notes/` 文件夹。
核心理念：输出高纯度、结构化的文本，作为人类与 LLM 协同维护项目的上下文知识库。

## 📁 目录结构
`unidoc-editor/`
- `notes/`       : 业务数据源，存放实际编写的文档。
- `doc/`         : 项目的“大脑”和架构上下文（包含当前 blueprint 及其它 json/yaml 规范文件），供 LLM 和开发者随时查阅。
- `index.html`   : 唯一 HTML 骨架（CDN 引入，分块布局）。
- `main.js`      : 控制器（状态流转、事件总线、快捷键拦截）。
- `token.js`     : 鉴权（GitHub PAT 的读取/验证/存储）。
- `api.js`       : 核心服务（封装 Fetch GitHub REST API 读/写/列表）。
- `editor.js`    : 编辑器逻辑（Monaco 初始化、语言切换、MD预览双屏）。
- `fileTree.js`  : 左侧文件树渲染与点击切换逻辑。
- `toast.js`     : 基于 Bootstrap 的轻量级成功/错误提示。
- `modal.js`     : Token 输入框、文件冲突处理等弹窗。
- `style.css`    : 全局样式与 Flex 布局优化。

## 📦 外部依赖 (CDN)
- Bootstrap v5 (UI)
- FontAwesome (图标)
- Monaco Editor (代码编辑器，AMD 方式按需加载)
- Marked.js (Markdown 渲染)
- js-base64 (解决 GitHub API 中文 Base64 编解码问题)

## 🔄 全局状态流转 (State Flow)
`main.js` 维护核心状态：
1. `currentFilePath`: 当前打开文件路径 (如 `notes/demo.md`)
2. `currentFileSha`: 当前文件的 SHA 值（保存时必需校验防冲突）
3. `isDirty`: 编辑器内容是否修改未保存

## 🚦 特殊业务逻辑
1. **多格式处理**：MD 开启双屏预览；JSON/YAML 隐藏预览区，Monaco 撑满全屏并开启语法校验。
2. **保存机制**：拦截 `Ctrl+S` / `Cmd+S` 触发 GitHub API 提交 (Commit)，严禁高频自动保存。