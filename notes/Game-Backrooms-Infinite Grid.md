### Game : Backrooms: Infinite Grid         

***         

方案评估：模仿 “Backrooms（后室）” 的无限迷宫玩法

这个想法在技术上完全可行，且非常契合我们现有的引擎能力。

💡 技术可行性分析（如何使用当前引擎搭建）：

地图渲染 (WorldStream)：目前的滚动算法是“自动向下匀速平移”。在《后室》中，我们可以将其修改为“角色步进移动”：
玩家在 Canvas 中央扮演一个 Emoji（如 🏃 探索者）。
玩家向上/下/左/右滑动屏幕，地图网格朝反方向整体移动一格（1:1 步进），实现 2D 走迷宫。

渲染实体 (TileEntity)：
地砖 bgType 变成黄色破旧地毯地砖。
TileEntity 变成黄色墙壁（🧱）形成狭窄走廊，限制 🏃 的移动。
迷宫随机生成出口（🚪）、补给（💧 杏仁水、🔦 手电筒）以及潜伏在阴影中的怪物（👾 实体）。

悬疑氛围 (VFX & Sound)：
迷雾效果 (Fog of War)：在 CanvasManager 渲染时，可以在 🏃 角色周围画一个圆形渐变，之外的区域全部用黑色遮罩（ctx.globalCompositeOperation），营造手电筒照明的悬疑感。

后室白噪音 (Hum Noise)：AudioManager 的实时合成器，可以非常简单地通过低频合成器连续生成微弱、压抑的“嗡嗡”荧光灯背景噪音，极其符合《后室》的恐怖氛围。

云端纪录 (Supabase)：保存玩家在无限迷宫中成功探索的“最深层数（Level）”或“坚持生存的时间”，生成全球幸存者排行榜。

***        

📋 项目开发文档：《Backrooms: Infinite Grid》系统蓝皮书      

一、 项目愿景 (Project Vision)

《Backrooms: Infinite Grid》是一款基于“后室（Backrooms）”都市传说设计的移动端极简、悬疑氛围的无限网格逃生游戏。
玩家通过手势控制角色在无限延伸的旧黄色地毯迷宫中探索，寻找水源、避开墙壁与实体、在手电筒电量耗尽前寻找通往更深楼层的入口，并与全球玩家同步生存记录。

二、 核心机制设计 (Core Mechanics)

步进式移动（Discrete Movement）：
摒弃传统的动作平滑移动。采用 1:1 坐标网格步进，玩家向上/下/左/右滑动一次屏幕，角色 🏃 就在逻辑网格移动一格。
每当玩家移动一步，地图中的实体或怪物 👾 也会相应移动一步（半回合制 Roguelike 逻辑，增加策略和悬疑感）。
手电筒电量与迷雾（Fog of War）：
玩家周围只有半径为 3 格的圆形可见区域。
顶部的时间条（Timer Bar）代表手电筒电量。每走一步，电量流失；电量归零时，屏幕完全黑暗，游戏结束（被实体吞噬）。
拾取 🔋 电池可补充电量。
无限随机迷宫（Infinite Chunk Generation）：
地图不一次性加载。当玩家接近视口边缘时，系统在后台采用概率噪声算法，动态生成由旧墙壁（🧱）、旧地毯、门（🚪）组成的全新迷宫区块（Chunk）。

三、 技术架构：MVC-Camera 2.0 (Architectural Blueprint)

为了适应全向移动和迷雾渲染，系统采用升级版的 MVC-Camera 架构。无需任何构建工具（No-Build），仅用原生 ES Modules 运行。
code
Code

```
[ 交互手势 Input (Swipe/WASD) ]
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │   Controller 控制层    │ (GameManager.js)
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │     Model 数据层      │ (GridModel.js)
                     └───────────┬───────────┘
                                 │ (同步逻辑实体、墙壁位置、视野半径)
                                 ▼
                     ┌───────────────────────┐
                     │     View 表现层       │ (CameraView.js / UIManager.js)
                     └───────────────────────┘

```
1. Model（数据层）- GridModel.js
职责：
维护玩家的逻辑网格坐标：playerX, playerY。
维护一个动态的哈希字典 mapData = {}。例如，用 key = "x,y" 记录该坐标是空地、墙壁（🧱）、电池（🔋）还是杏仁水（💧）。
怪物 👾 的坐标与行为路径逻辑计算。
2. View（表现层）- CameraView.js & UIManager.js
职责：
相对视口裁剪（Camera Viewport）：Canvas 绘图中心永远锁定在玩家角色上。所有墙壁、道具的渲染坐标为：drawX = (tileX - playerX) * cellSize + canvasWidth / 2。
手电筒渐变罩（Radial Gradient）：使用 2D Context 的 createRadialGradient，在中心点产生高亮光圈，光圈外使用黑色遮罩，完美呈现黑暗悬疑感。
VHS 噪点滤镜：每帧在 Canvas 上随机绘制极薄的、低透明度半透明噪点颗粒，模拟录像机复古质感。
3. Controller（控制层）- GameManager.js
职责：
监听轻扫（Swipe）手势及键盘 WASD 键。
触发玩家位置移动：在移动前查询 GridModel，若目标坐标为墙壁（🧱）则拦截移动并触发微弱震动；若为道具（🔋 / 💧）则自动拾取并触发飞行 VFX。
控制回合 tick。每当玩家成功移动一步，触发一次 GridModel 的环境更新（怪物 AI 走近一步、电量衰减）。
四、 核心组件与数据定义 (Unified Nomenclature)
PlayerEntity (🏃)：探索者。拥有属性 x, y, battery (电量, 0-100), fluid (水分, 0-100)。
ObstacleEntity (🧱 / 🟨)：后室发黄的隔音墙体，阻挡移动。
ItemEntity：
🔋 (Battery)：补充电量（生存时间）。
💧 (Almond Water)：增加精神值/速度。
🔑 (Level Key)：集齐 3 把可开启向下一层的通道 🚪。
BacteriaMonster (👾)：后室实体。当玩家与其距离小于 5 格时开始发出低频喘息，并朝着玩家逻辑坐标寻路。
VHS_Overlay：VHS 磁带噪点渲染通道。
HumNoise：荧光灯高压电嗡嗡声（由 Web Audio 合成器实时循环生成）。
五、 后续开发指引 (Next Step for New Chat)
在您开启新的对话窗口时，可直接将以下段落发送给新的 AI 助手作为提示词（Prompt），对方即可完美承接上述引擎架构进行开发：
"你好！我们将基于一套成熟的 MVC 游戏设计思想，开发一款名为《Backrooms: Infinite Grid》的 Web 端极简悬疑迷宫探索游戏。
技术约束：
原生 ES Modules (No-Build)，CDN 引入 Bootstrap 5。
必须计算 devicePixelRatio 保持 Canvas 高清抗模糊。
请为我搭建核心底层骨架：
GridModel.js：管理 2D 坐标系，实现基于玩家坐标动态生成无限迷宫网格数据（用哈希表存储 x,y 墙壁与道具）。
CameraView.js：实现以玩家为中心的相对视口摄像机渲染机制。重点：利用 Canvas 的 createRadialGradient 渲染手电筒照明迷雾效果（Fog of War），并叠加 VHS 复古滤镜。
AudioManager.js：利用 Web Audio API 合成器，实时生成后室经典的荧光灯低频高压电嗡嗡声（Hum Noise）作为背景噪音。
请首先输出项目骨架和 GridModel.js 的完整设计..."
您可以将本份蓝皮书保存在您的本地。等您深度思考完 MowPulse 的玩法，或者准备好启动新作时，随时可以使用此文档完美开启新征程！



