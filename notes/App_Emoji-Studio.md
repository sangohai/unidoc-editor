### App_Emoji-Studio   


***      

內部開發約定 (Protocol)
我們接下來的對話將嚴格遵守以下格式：
你的指令： 每次提出新需求或修改時，請標註當前你本地端的 [Snapshot: V...] 或剛完成的 [Patch...]。
我的回覆： 我每次提供程式碼前，一定會先宣告：
📌 基於當前快照： [Snapshot: V0.1.0-Init]
🛠️ 本次提供補丁： [Patch-1] 初始化 Bootstrap UI 與 PWA 骨架
程式碼輸出原則： 我只會輸出需要修改的檔案和代碼塊，並明確指出要插入在哪個檔案的哪一行附近，絕對不輸出無關的整坨代碼。

***    

在審視你的計畫後，我建議在正式寫代碼前確認這兩件事：
強制使用 ES Modules (<script type="module">)：
因為我們不使用 Webpack/Vite，如果把所有邏輯寫在同一個檔案會非常可怕。我們可以在 index.html 裡面使用 <script type="module" src="js/app.js"></script>。這允許我們在 JS 裡面使用 import 和 export，將網格邏輯 (gridManager.js) 和 UI 邏輯 (uiManager.js) 完美解耦。(這已反映在我上面幫你建的 PowerShell 指令和文檔中了)。
設定安全的 config.js：
既然用了 Supabase，就需要存 API Key。雖然 Supabase 的 Anon Key 是設計用來放在前端的（依靠 Row Level Security 來保護資料），但為了好習慣，我們把 Key 放在獨立的 config.js，並且用 .gitignore 把它忽略掉。本地測試時我們自己建，未來部署到 GitHub Pages 時，你只需要把這些公開的 Key 直接寫死在發佈版本，或者確保你的資料庫權限 (RLS) 已經設為只允許讀取。

***      

###    开发文档 ：blue-print.md 备份 ：

---
title: Emoji Studio 系统架构蓝图
project: Emoji Studio
current_snapshot: V0.1.0-Init
last_updated: 2026-08-08
architecture: PWA Frontend-Only + Supabase BaaS (无构建工具纯前端 + BaaS)
core_engine: 2D Array Grid & Canvas Smart Crop
state_management: Data-Driven JSON Schema
storage: LocalStorage (Stamps) + Supabase (Scenes & Auth)
---

# 🧩 系统架构快照 (Single Source of Truth)

## 1. 核心模块解耦职责 (基于 ES Modules)
- `app.js`: 核心主板与生命周期入口。负责注册 PWA Service Worker、初始化各管理器，并绑定全局事件监听。
- `gridManager.js`: 核心渲染引擎。维护底层 2D 阵列数据，绝对禁止 UI 直接操作 DOM，必须透过更新阵列后触发 `renderGrid()` 重绘。包含 Bounding Box 智慧裁切与 Canvas 汇出逻辑。
- `uiManager.js`: 交互与视图管家。接管 Bootstrap Offcanvas 的弹出、双模式 (画笔/拖曳) 的手势拦截、以及即时笔刷 (Active Brush) 的状态映射。
- `storeManager.js`: 数据与云端总线。封装 LocalStorage 的自定义印章存取，以及 Supabase SDK 的 API 呼叫 (登入验证与 JSONB 场景存取)。
- `config.js`: 全局配置与密钥。存放 Supabase URL 与 Anon Key，**绝对禁止推送到 GitHub (已加入 .gitignore)**。

## 2. 核心设计黑科技 (禁止随意篡改)
- **绝对的数据驱动视窗**: 任何格子颜色的改变、Emoji 的填充，都必须先写入 `JSON Schema`，然后再触发 DOM 渲染。这是为了保证汇出分享与 undo/redo 的绝对一致性。
- **超压缩 JSON 分享机制**: 运用「调色盘字典 (Palette)」+「稀疏矩阵 (Sparse Grid)」架构，未使用的空白网格绝对不写入资料，确保作品能够通过超短 URL 参数进行无后端分享。
- **防手势冲突双模式**: 在手机端，利用 `PointerEvents` 拦截画动画布动作，严格区分「画笔涂鸦」与「画布拖曳/缩放」，避免屏幕滑动导致误触。
- **即时笔刷非阻断编辑**: Emoji 变形 (旋转/镜像) 时实时更新笔刷状态，不需要强制点击「保存」即可在网格上作画，将操作摩擦力降到最低。

---

# 🚀 内部版本控制与开发日志 (Changelog)

> **当前基线快照**: `[Snapshot: V0.1.0-Init]`

### 已合并补丁 (Merged Patches)
- *(目前为初始状态，等待 Patch 注入)*

- ***


