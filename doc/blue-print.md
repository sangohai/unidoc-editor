# Blueprint: UniDoc Editor (LLM Context Editor)

## 🎯 项目定位与当前状态
- **项目名称**: UniDoc Editor
- **核心目标**: 构建一个纯前端的结构化文档 (`.md`, `.json`, `.yaml`, `.txt`) 专用编辑器，完全无后端，通过 GitHub PAT 直连仓库的 `notes/` 目录。
- **核心理念**: 为开发者与 LLM 提供一个高密度、无干扰、强隐私的协同知识库与全能发布站。
- **巅峰状态**: **V1.8 (Release 版)**。完成了前后端数据闭环与物理交互重构，所有核心模块均已极致解耦，具备极高的稳定性和生产力。

## 📁 项目目录与职责解耦 (Decoupled Architecture)
`unidoc-editor/`
- `notes/`                 : 业务数据源。包含纯文本文件及 `images/` 云端图床目录。
- `doc/`                   : 存放此 blue-print.md，记录项目的“大脑”和架构上下文。
- `manifest.json` & `sw.js`: **[PWA核心]** App 桌面化配置与离线骨架/网络优先代理策略。
- `index.html` & `style.css`: 骨架与样式。包含下拉操作菜单、左侧虚拟摇杆滑轨、极细进度条、以及移动端表情面板的阴影伪遮罩黑科技。
- `main.js`                : **[核心主板]** 全局状态机 (`AppState`)、主题管理、文件流转调度、以及 `window.visualViewport` 尺寸重算防键盘遮挡护甲。
- `api.js`                 : **[数据总线]** 封装 GitHub REST API。强绑 `?t=` 时间戳防 CDN 缓存，提供纯文本与 Base64 图片双轨直传。
- `editor.js`              : **[编辑引擎]** Monaco 控制中心。负责 Marked.js 缓存图层渲染、Gfm 标准直觉换行、以及基于 `requestAnimationFrame` 的虚拟摇杆动画帧引擎 (`initLeftScrollZone`)。
- `fileTree.js`            : **[侧边栏]** 负责目录树拉取渲染。采用“高亮区与图标区物理解耦”的 UI 设计。
- `charPicker.js`          : **[表情库]** 独立接管表情与特殊符号的数据、懒加载渲染及插入逻辑。
- `clipboardManager.js`    : **[安全管家]** 独立接管 `paste` 事件。负责图床 Base64 直传、文本零宽字符清洗、及 `navigator.clipboard` 的底层内存粉碎。
- `exportManager.js`       : **[导出中心]** 利用 HTML5 `Blob` 纯前端打包导出本地 `.md`、独立样式 `.html` 网页、及唤起原生 `.pdf` 打印。
- `garbageCollector.js`    : **[自我清洁]** 图床垃圾回收引擎。交叉比对 `.md` 文本与 `images/` 目录，一键销毁孤儿图片。
- `token.js` & `modal.js` & `toast.js`: 鉴权与 UI 反馈基础组件。

## 🚦 巅峰架构“黑科技”全景图 (Design Decisions)
1. **移动端键盘上推防御 (VisualViewport Armor)**：
   - 废弃 `100vh`，采用现代 `100dvh`，并侦测键盘高度精准压缩 `document.body` 尺寸触发 Monaco 重新 layout，实现 100% 完美可见区。
2. **全平台虚拟摇杆引擎 (Pointer Joystick Engine)**：
   - 弃用传统滚动条，在屏幕左侧覆盖虚拟滑轨。利用 `requestAnimationFrame` 驱动 60FPS 动画帧，将手指推拉的 Offset 转化为滚动 Speed，实现“左手安全摇杆慢滚，右手精准点击唤起键盘”。
3. **图床拦截与瞬时记忆渲染 (In-Memory Image Cache)**：
   - 拦截粘贴事件提取 Base64 走 GitHub API 上传，同步写入 `imageCache`。重写 Marked.js，实现 `push` 前的无网络延迟“秒级本地图层预览”。
4. **纯前端图床垃圾回收 (Orphaned Image GC)**：
   - 纯前端执行海量文件正则扫描，Set 集合比对差集，调用 API 批量安全擦除冗余图床资产。
5. **剪贴板极客防护 (Clipboard Security)**：
   - **清洗机**：正则剥离外来文本中的隐藏追踪代码。
   - **粉碎机**：一键写入空字符强制覆写操作系统底层剪贴板，防恶意软件窥探。

## 🚀 未来冷冻与解冻指南
本项目目前进入稳定维护期。若未来重新激活开发（解冻），建议直接从此蓝图开始唤醒 LLM 上下文。
可能的延伸方向：
1. **Emoji 中心化资产仓库**: 另起 `emoji-hub` 项目存放高清 SVG/PNG，为跨引擎游戏项目提供 SSOT 数据源支持。