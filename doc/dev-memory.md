# 🧠 UniDoc Editor 开发记忆胶囊 (Dev Memory Snapshot)

## 【当前版本号与阶段名称】
- **Version**: `v2.4.6-ux-polished` (V2 持续打磨完全体)
- **Stage**: 完成多色荧光笔调色盘、五级标题、智能同步胶囊、点击激活跟随菜单、强制顶部对齐、无效空块自动净化与 Mermaid 纵向结构显示优化

## 【本轮 (v2.4.0 -> v2.4.6) 新增并锁死的核心特性】
1. **方案 A 智能同步状态胶囊 (`index.html` & `syncManager.js` & `style.css`)**：
   - 合并 `#save-status` 与 `#btn-save` 为单一圆角动态胶囊（`.sync-pill-btn`），平时低调显示 `已自动同步`，有未同步修改时变为醒目琥珀色 `已存本地 · 点击同步`。
2. **原生多色荧光笔 `<mark>` 调色盘 (`index.html` & `toolbarManager.js` & `editor.js`)**：
   - 零外部库依赖，在 `#toolbar-components-pool` 新增 `#tool-mark` 下拉面板，内置 5 种护眼高光色卡、原生 `<input type="color">` 自由拾取器及“清除高亮”按钮；支持光标停留在已有 `<mark>` 内直接实时换色。
3. **跟随菜单防打扰机制 (`editor.js`)**：
   - 移除 `pointerover` 鼠标滑过频繁弹窗逻辑；仅当用户点击/聚焦某个 Block 进入内容编辑态时才显示顶部跟随胶囊与右下角 `⠿` 拖拽锚点，点击画布空白处或按 `Esc` 即刻隐去。
4. **打开文章 100% 强制归顶 + 历史空块/空行净水器 (`editor.js`)**：
   - `setContent()` 首尾双重锁定 `this.container.scrollTop = 0`，根除短文章从底部显示及顶部幽灵空白块问题。
   - 新增 `_isNodeEffectivelyEmpty()` 与 `_cleanBlockInnerHtml()`，自动过滤历史文档与网页摘录中的无效幽灵空块（如 `<p><br></p>`, `<p>&nbsp;</p>`）并收敛连续空行。
5. **五级标题 (`<h1>`~`<h5>`) 与 Mermaid / 代码块纵向无损结构 (`editor.js` & `style.css`)**：
   - 跟随菜单、分割判定与 `#` 快捷触发词全面扩展至 `<h1>` ~ `<h5>`。
   - `<pre><code>` 改用 `<br>` 转 `\n` + `textContent` 提取，配合 `white-space: pre-wrap` 保持从上到下的自然纵向结构，方便直接提取纯文本喂给 LLM。

## 【全项目已竣工并锁死的文件清单】
- [x] `index.html`, `style.css`, `main.js`, `editor.js`, `syncManager.js`, `settingsManager.js`, `fileTree.js`, `toolbarManager.js`, `clipboardManager.js`, `exportManager.js`, `charPicker.js`, `connector.js`, `api.js`, `sw.js` (`unidoc-cache-v2.4.6-native`)
- [x] `doc/blueprint.md`, `doc/dev-memory.md`