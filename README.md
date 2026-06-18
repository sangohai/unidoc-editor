# 📝 UniDoc Editor

> 一个专为极客、开发者与 LLM (大语言模型) 打造的纯前端 Serverless 结构化知识库工作台。

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Zero Backend](https://img.shields.io/badge/Backend-Zero-blue)](#)
[![Monaco Editor](https://img.shields.io/badge/Editor-Monaco-orange?logo=visualstudiocode)](#)

UniDoc Editor 是一个完全不需要服务器的 Markdown / JSON / YAML 编辑器。它通过 GitHub REST API 直接将你的 GitHub 仓库变成你的私人云端笔记本。它不仅拥有媲美原生 App 的极致触控体验，还内置了图床、隐私粉碎机与垃圾回收机制。

## ✨ 核心特性 (Core Features)

- ☁️ **零后端架构 (Serverless)**：直接绑定 GitHub PAT，数据 100% 存在你自己的私有/公开仓库中。
- 📱 **PWA 桌面化升维**：支持安装到手机或电脑主屏幕，消除浏览器地址栏，享受原生全屏 App 体验与离线骨架秒开。
- 🎮 **电竞级虚拟摇杆 (Pointer Joystick)**：颠覆移动端触控逻辑！左侧隐藏实体滑轨引擎，微推慢滚，重推狂飙，彻底告别误触虚拟键盘的痛点。
- 📸 **纯前端图床引擎**：剪贴板截图 `Ctrl+V` 秒传云端，自动剥离 Base64 前缀，瞬间在 Markdown 中生成占位链接与缓存预览。
- 🛡️ **极客级隐私护甲**：
  - **剪贴板清洗**：自动嗅探并剥离复制文本中的零宽追踪字符。
  - **内存粉碎机 🧹**：一键调用 `navigator.clipboard` 覆写操作系统底层剪贴板，防恶意软件窃密。
- ♻️ **图床垃圾回收 (GC)**：正则全量交叉比对仓库文档与图床，一键揪出并销毁无引用的“孤儿图片”，为云空间瘦身。
- 📥 **全能本地导出**：纯前端 `Blob` 瞬时打包，支持导出 `.md` 原文件、注入排版样式的独立 `.html` 网页、及唤醒原生打印机另存为 `.pdf`。
- 📏 **抗遮挡视口装甲**：移动端打字时，基于 `VisualViewport` API 动态压缩可视区域，强行阻止系统键盘遮挡编辑器顶部。

## 🚀 极速部署与使用 (Getting Started)

本项目零依赖、免打包（No Bundler），开箱即用。

1. **Fork 或 Clone** 本仓库，确保仓库根目录下有一个名为 `notes/` 的空文件夹（存放笔记）。
2. 在仓库设置中开启 **GitHub Pages** (指向 `main` 分支的 `/root`)。
3. 访问你的 Pages 链接，首次进入会自动弹出授权框。
4. 去 GitHub 申请一个勾选了 `repo` 权限的 **Personal Access Token (PAT)**。
5. 填入你的仓库名（如 `user/repo`）和 Token，点击连接，你的专属云端工作台即刻点亮！

> **🔒 隐私承诺**：你的 PAT 仅保存在当前设备的浏览器 `localStorage` 中，所有通信直接通过前端发起至 GitHub 官方 API，绝不经过任何第三方服务器。

## 🛠️ 技术栈 (Tech Stack)

- **UI & 样式**: Bootstrap 5 + FontAwesome 6 + 原生 CSS 黑科技
- **编辑器内核**: Monaco Editor (AMD Loader 按需懒加载)
- **渲染引擎**: Marked.js (集成 Github Flavored Markdown 标准)
- **数据传输**: Fetch API + js-base64

## 📄 License
MIT License