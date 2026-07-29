### App_NeuroCanvas        

Blueprint: NeuroCanvas (LLM Topology & Spatial Editor)

🎯 1. 项目定位与当前状态
项目名称: NeuroCanvas (暂定名 / 面向 LLM 的物理拓扑编辑器)
核心目标: 构建一个极其轻量、纯前端的 2D 参数化建模与拓扑结构工具（CAD-lite）。允许用户通过积木拼装或多段线绘制，建立具有层级关系、物理约束和语义标签的多边形图块集合，并最终输出结构化数据供 AI 消费。
核心理念: 践行“神经符号学（Neuro-symbolic AI）”。为大语言模型（LLM）和生图模型（Stable Diffusion/ControlNet）提供精确的物理空间常识与遮挡关系，彻底跨越 AI 视觉生成的“像素盲区”（如画错手指、空间透视混乱）。
当前进度: V0.1 架构图纸阶段完成。已彻底摒弃臃肿的重型框架（Vue/React）；敲定了底层“唯一真相（State Store）”数据流向；完成了全英文、高防御性的 JSON Schema 数据结构设计；确定了“树形目录+绘图区”的双向联动 UI 布局。即将进入 MVP (最小可行性产品) 的代码实施阶段。

📁 2. 项目目录与职责解耦 (Decoupled Architecture)
整个项目采用极致的原生规范开发，无构建工具，开箱即用。
neuro-canvas/
index.html: 骨架。提供 1/6 树形目录、1/6 JSON 代码区、2/3 绘图区及悬浮属性面板的布局结构。
style.css: 极简 UI 样式（考虑采用极简 CDN 框架辅助），负责面板布局、树形菜单缩进与视觉高亮反馈。
stateManager.js: [核心引擎] 纯 JS 状态中枢。利用 ES6 Proxy 拦截全局 JSON 数据的读写，实现无依赖的“发布-订阅（Pub/Sub）”双向数据绑定。
konvaEngine.js: [视觉渲染总线] 封装 Konva.js API。专职负责解析 State 数据并将其映射为 Canvas 上的 Scene Graph（场景图），接管基础的拖拽、旋转与渲染优化。
interactionMachine.js: [交互状态机] 统管用户的鼠标模式（FSM：选择模式、绘制多段线模式、节点编辑模式、连线绑定模式），防止事件冲突。
treeController.js: [拓扑控制器] 负责左侧 DOM 树形目录的渲染与拖拽逻辑。监听拖拽释放事件，计算绝对坐标到相对坐标的数学转换，并通知 stateManager 确立父子关系。
schemaDefaults.js: [数据防弹衣] 存放 17 关节手臂、游戏 2.5D 场景等出厂 JSON 模板，并提供基于可选链（?.）的向下兼容解析规则。
exportCore.js: [多模态输出管家] 负责将内部 State 转化为 LLM 友好的 YAML/JSON 文本，并调用 Konva 极速导出对应的特征图/深度图 (PNG)。

🚦 3. 核心“黑科技”设计决策 (Design Decisions)
原生 Proxy 响应式中枢 (Vanilla Reactivity)：
坚决抛弃 Vue/React 的虚拟 DOM 负重。通过几十行原生的 Proxy 代理，实现“改 JSON 代码 -> 自动刷新画布”与“拖拽画布 -> 自动更新代码及 DOM 面板”的完美解耦。
正向运动学 (FK) 相对坐标系引擎：
利用 Konva 的 Group 嵌套机制与 offset (枢轴) 属性，完美模拟物理关节。将树形目录的“UI 父子嵌套”在底层直接映射为“坐标系嵌套”。前臂一转，手掌与手指天然跟随，拒绝复杂的三角函数硬算。
无缝节点编辑模式 (Vertex Edit Mode)：
突破 Konva 对闭合多边形整体编辑的限制。在双击进入编辑态时，动态在 JSON points 数组的对应坐标处渲染高优先级的 draggable Circle（小圆圈）。通过绑定小圆圈的拖拽事件，实现类似 CAD 的单点扭曲形变。
多模态同步输出 (Multi-modal Sync Export)：
不仅输出 semantics (语义标签) 和 kinematics (运动学约束) 的 YAML 文本，同时输出带有层级遮挡关系的 PNG 图像。文本给 LLM 提供逻辑，图像给生图模型提供空间特征，达成 1+1>2 的控制力。
防御性向后兼容 (Defensive Schema Parsing)：
在顶层设计 version 字段。读取节点参数时强制使用后备默认值（Fallback Defaults），确保未来模板库无论增加多少新模块，旧版本生成的 JSON 图纸依然可以安全加载，永不崩溃。

🚀 4. 下一阶段跨域开发计划 (Roadmap)
[Phase 1] MVP 基础框架 (基石构建)：
搭建 HTML/CSS 界面框架。
实现 stateManager.js (Proxy) 与 konvaEngine.js 的联调，跑通“画一个多边形，在 JSON 区实时看到数据”的数据流闭环。
[Phase 2] 交互与拓扑 (核心壁垒)：
实装 interactionMachine.js，完善“点击绘制闭合多边形”功能。
开发左侧树形目录，实现拖拽图形建立“父子关系”，并在画布上生成“红色枢轴(Pivot)”供用户拖拽设定关节。
[Phase 3] 节点编辑与参数完善 (细节打磨)：
实现双击多边形进入“顶点编辑（拖拽小圆点形变）”功能。
完成右侧悬浮属性面板，支持对选中节点修改 name、label 和 rotation_limits。
[Phase 4] LLM 桥接与平台化 (商业验证)：
开发 exportCore.js，实现一键复制 YAML 参数与下载 PNG。
部署至 GitHub Pages，导入“人类手臂 17 关节模板”，进行实际的 LLM (如 GPT-4o) 提示词引导测试。


neuro-canvas/
│
├── index.html                 # 核心骨架界面
├── css/
│   └── style.css              # 极简 UI 样式控制
├── doc/
│   └── blue-print.md          # 存放我们上一对话生成的“开发蓝图”
├── assets/                    # 预留存放可能的本地图标或占位图
│
└── js/                        # 核心逻辑区 (ES Modules)
    ├── app.js                 # 🚀 总启动器：负责把下面的模块拼装并启动应用
    ├── stateManager.js        # 🧠 状态中枢：Proxy 双向绑定核心
    ├── konvaEngine.js         # 👁️ 视觉引擎：封装所有 Konva.js 的绘画逻辑
    ├── interactionMachine.js  # 🕹️ 状态机：处理鼠标是“画图”还是“拖拽”
    ├── treeController.js      # 🌳 目录控制：左侧树形拖拽与父子关系计算
    ├── schemaDefaults.js      # 📐 数据防弹衣：手臂模型等默认 JSON 模板
    └── exportCore.js          # 📤 导出管家：将数据转为 YAML/JSON/PNG 给 LLM

