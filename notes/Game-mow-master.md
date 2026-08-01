### Game ：mow-master       

游玩性 ：       

1 - 加入 随机 [ 礼物gif ]  获取奖励 ： 收集道具 增加 +  ；

2 - 增加 进入 [特殊关卡] 的 门  来进入特殊关卡 ；        

3 - 增加 [ 關卡管理模塊 ]  定義關卡的屬性和參數...；         ★★✅✅

4 - 加入 [ 游戏资源管理预渲染模块 ]   通过访问获取需要的素材 ;            

***        

####   关于《MowPulse》“取舍循环”闭环玩法的概念设计与深度剖析

您提出的“从有到没有，再拥有，再没有”的循环是一种非常经典的 [资源博弈与风险控制机制] 。在独立游戏设计中，这种机制能有效激发玩家的“贪婪与恐惧”心理，从而提供长期的游玩内驱力。
为了在现有的割草交互中落实这一概念，我们可以在不需要大幅度修改底层渲染逻辑的前提下，通过以下三种玩法构想来实现：


构想 A：【遗物熔炉与诅咒突变】（Relic Crucible & Curse Mutation）
初始状态：玩家开局拥有一把普通镰刀。在割草过程中，不仅可以获得基本草料 🌿，还有概率挖出基础工具  （如 🪓 铁铲、🏺 泥罐）。
兑换过程：当玩家在草丛中推行时，地表会随机生成“远古熔炉”或“商人松鼠”格子。
玩家必须做出舍弃决定：选择将当前辛苦收集的所有草料、鲜花以及当前的工具“投入”熔炉。

双重结局：
成功（进化）：熔炉成功冶炼，玩家获得一个高级道具（如 🌟 磁力护符，能自动吸收三格内的所有物资；或者 🔑 黄金钥匙，直接打开通往下一关的传送门）。
失败（诅咒）：熔炉发生爆炸（触发 💣 效果），玩家失去所有已收集的道具、工具降级为最原始的石片，甚至地表怪物活性增加（蜘蛛 🕷️、毒蛇 🐍 繁衍概率翻倍）。玩家被迫回到游戏的起点，重新用原始工具收割草料以期再次重来。


构想 B：【种子寄生与生命倒计时】（Parasitic Seed & Time Decay）
初始状态：玩家开局拥有一种特殊道具 —— “寄生种子” 📦。
兑换过程：这个种子拥有强大的功能（例如自动割草），但每秒都会吸取顶部的 Time Bar（生存时间条） ⏱️ 作为养料。
玩家需要利用种子带来的高效收割能力，快速去草丛中寻找“净化之泉”格子。
找到后，玩家必须“献祭”这枚种子（使其从有到无），来换取大量的生存时间或关卡进度。
双重结局：
成功：在时间耗尽前安全献祭，换取强大的生存增益，顺利通关。
失败：玩家在寻找泉水的途中过于贪恋种子带来的高收割快感，导致生存时间被种子吸干，游戏结束，积分清零，回到原点重新开始。


构想 C：【赌徒盲盒与债务递增】（Gambler's Box & Rent Cycle）
初始状态：玩家开局无任何特殊道具，但关卡结束时有高额的“积分债务（Debt Target）”。
兑换过程：地表会刷新出“神秘黑市（Black Market）”，玩家可以使用当前收集的 🌸、🪨 等资源，去兑换具有高风险特征的“赌徒道具”（如 🎲 骰子，能让割草得分翻倍，但也可能让割草扣除生命）。
双重结局：
成功：依靠赌徒道具在限时内清偿了债务，道具功成身退（消失），玩家安全晋级下一关。
失败：未能还清债务或道具触发了自爆惩罚，玩家被剥夺所有物资，再次沦为无道具的“流浪汉”，回到第一关重新收割最基础的杂草。

```

  ┌──────────────────────────────────────────────────────────────────┐
  │         1. 资产与数据中心 (Asset & Data Layer)                   │
  │    - AssetBridge.js: 游戏字典 (相当于 Unity 的 Prefab 预制件)    │
  │    - levels.json: 关卡配置 (相当于 Godot 的 Scene 场景数据)      │
  └───────────────────────────┬──────────────────────────────────────┘
                              │ [配置/实例化模板]
                              v
  ┌─────────────────────────────────────────────────────────────────┐
  │         2. 逻辑与状态引擎 (Logic & State Engine)                 │ 
  │    - GameManager.js: 核心控制器 (相当于 System 游戏主逻辑)       │
  │    - TileEntity: 网格实体 (包含 State Machine 状态机)            │
  └───────────────────────────┬──────────────────────────────────────┘
                              │ [渲染指令/位置数据]
                              v
  ┌─────────────────────────────────────────────────────────────┐
  │         3. 渲染与物理反馈 (Render & Physics Engine)          │
  │    - CanvasManager.js: 绘图管线 (GPU 硬件加速，只管渲染)     │
  │    - InteractionSystem: 物理碰撞 (Raycast / 路径圆形探测)    │
  └───────────────────────────┬──────────────────────────────────┘
                              │ [UI更新/事件桥接]
                              v
  ┌───────────────────────────────────────────────────────────────┐
  │         4. 表现与视口层 (Presentation & HUD Layer)            │
  │    - UIManager.js: DOM UI 控制器 (管理 HUD_Header / Dock)     │
  │    - SummaryModal: 关卡结算系统                               │
  └───────────────────────────────────────────────────────────────┘

``` 

***         

📋 MowPulse Engine v1.0 项目交接与系统蓝皮书
致接棒架构师/AI 助手：
你好！本项目是一个基于“福格行为理论（Fogg Behavior Model）”设计的移动端极简解压割草游戏 —— MowPulse。
目前项目已经历数轮重大重构，底层渲染、触控与资产架构已完全并轨并处于极稳状态。为确保后续开发的一致性，请务必严格遵守以下定义的技术约束、命名协议与代码分割规范。     

一、 核心技术约束 (Strict Constraints)
No-Build 协议：不使用 Vite/Node/NPM 等任何构建工具，仅限原生 JavaScript (ES Modules)。
CDN-Only：仅通过 CDN 引入 Bootstrap 5。
DPR 高清适配：必须实时计算 devicePixelRatio，在 Canvas 重绘前执行 setTransform 锁定高清像素，杜绝移动端模糊。
MVC 架构解耦：
Model（数据层）：AssetBridge.js + levels.json。
View（表现层）：CanvasManager.js (Canvas重绘) + UIManager.js (DOM/PWA界面)。
Controller（逻辑层）：GameManager.js (核心循环/时钟)。

二、 统一命名协议 v1.0 (Unified Nomenclature)
在后续讨论与修改中，必须严格使用以下标准术语，严禁产生词汇漂移：
GateScreen：启动封面层。包含游戏启动按钮与昵称输入框。
HUD_Header：顶部状态栏。包含关卡名称、2px 白色描边的时间生存条（Timer Bar）。
TaskDock：底部任务栏。以 已收集/目标 格式动态展示 4 个目标的收集状态，完成显示绿色 ✓。
WorldStream：瀑布流背景。由深墨绿草坪（#223816）与随机连绵的暖沙地（#856f43）地砖无缝拼贴组成的平移背景。   

TileEntity：网格实体。包含普通草（🌿）、花（🌸）、石头（🪨）、枯木（🪵）、大树/大仙人掌（🌳/🌴/🌵）、以及隐藏的宝藏（💎、🪓、🏺、🧀、⭐）与高危陷阱（💣, 🐍, 🕷️）。     

VFX_Particle：物理碎屑粒子。割草瞬间向四周喷发并随重力下坠的碎片。
VFX_Flyer：磁吸飞行物。隐藏宝物被露出后，自动产生二阶贝塞尔曲线划入 TaskDock 图标的动效。

SummaryModal：结算弹窗。关卡完成后展示通关时间、时间加权倍率以及后台静默结算的最终得分。

三、 代码分割架构与模块职责 (5 Segments)
游戏代码已被清晰地划分为 5 个逻辑块，后续修改请指定模块进行：

[Segment 1: Core_Loop] (属于 GameManager.js)：负责时钟 tick()、滚动 Y 轴位移、行回收与程序化无限关卡自进化。

[Segment 2: Interaction_Logic] (属于 GameManager.js / main.js)：负责 1:1 物理步进手势探测、自动收集、陷阱特写分流及分值扣减。

[Segment 3: Render_Pipeline] (属于 CanvasManager.js)：负责 render() 双通路图层渲染（Pass 1 画底色，Pass 2 画实体，防止遮挡遮挡）、画布 Resize。     

[Segment 4: VFX_System] (属于 CanvasManager.js)：负责 spawnVFX (飞行)、spawnFloatingText (带描边漂浮分数) 和物理粒子计算。

[Segment 5: Asset_Bridge] (属于 AssetBridge.js)：游戏唯一真理总表。维护实体属性字典，提供 getComponent() 标准接口，自带 jsDelivr CDN 自动路径拼接与防 404 图像级自动退化回退机制。
四、 核心玩法与游戏规则现状
生存机制 (Mow for Life)：顶部时间条每帧流逝，割草会增加时间（续命）。时间归零游戏结束，分数清空。
自动收集（露即所得）：手指划过草丛，草丛被割掉，如果地下埋着宝藏，宝藏不需要玩家二次点击，自动触发 VFX_Flyer 飞入 Dock 栏更新数量。
地表再生突变（Gamble Sprouting）：草地被割后变成泥土，1.2 秒内再生。长满瞬间产生突变：50% 变种草，10% 变 🎁 礼物（割开不进 Dock 原地加高分），15% 变 ❓ 盲盒（划过进行赌博：35% 触雷，65% 随机加大量任务数），30% 原样长回。
死因大特写：割到 💣 炸弹或 🐍/🕷️ 时，整个屏幕产生 18px 强震动（applyShake），指尖抛出一个超大（1.8x）的 💥 或 💀 特写，随之扣除 100 分。

五、 下一阶段开发计划 (Phase 6)
我们已在本地和 GitHub Pages（PWA Standalone 模式）上确认了 v7.3.6 版本的完美运行。接下来的开发目标为：
构建 js/managers/AudioManager.js (音效管理器)：
使用 Web Audio API，在 LOADING 阶段对以下音效进行解码预载入，并对齐逻辑事件播放：
割草声 (swish.mp3)
宝物飞入 Dock 抵达声 (ding.mp3)
爆炸/蛇咬 💣/🐍/🕷️ 惩罚声 (explosion.mp3 / alarm.mp3)
背景 BGM（治愈、循环的轻快背景乐）
准备对接 Supabase 云端数据库：
在 GateScreen 实现唯一的“玩家昵称输入与验证”，并在通关后将最终成绩刷新上传至全球实时排行榜。



📁 建议提供的代码文件清单 (Checklist)
index.html
作用：我们需要查看 GateScreen、昵称输入框、启动按钮、SummaryModal 以及现有 CDN 脚本的具体 DOM 结构和 ID 命名，确保初始化事件和排行榜渲染位置无误。

主入口文件（通常为 main.js）
作用：查看游戏启动、初始化以及各个 Manager（Model-View-Controller）之间是如何实例化并串联的，以便在此处安全地实例化 AudioManager 和 SupabaseManager。
js/managers/GameManager.js (对应 Segment 1: Core_Loop & Segment 2: Interaction_Logic)
作用：
寻找割草动作判定点，在此处插入 audioManager.playSFX('swish')。
寻找触雷/惩罚触发点（通常在 applyShake 强震动附近），插入 audioManager.playSFX('explosion') 或 alarm。
寻找游戏结束（Game Over）逻辑，在此处暂停 BGM 并调用 Supabase 上传接口。
js/managers/CanvasManager.js (对应 Segment 3: Render_Pipeline & Segment 4: VFX_System)
作用：寻找 VFX_Flyer（二阶贝塞尔曲线飞入 TaskDock）的更新和终点判定逻辑，在飞入抵达的一瞬间插入 audioManager.playSFX('ding')。
js/managers/UIManager.js (或相关的 UI 逻辑部分)
作用：查看 SummaryModal 的展现逻辑，以便在结算时将 Supabase 返回的全球排行榜数据动态生成列表并呈现在界面上。
js/bridges/AssetBridge.js (对应 Segment 5: Asset_Bridge - 可选)
作用：了解实体属性字典的结构。如果需要将特定“隐藏宝物”（如 💎、🪓）绑定特定音效，可在该字典中扩展配置。

