###   😂  emoji-worldcup      

***

預測遊戲         

predict gamble       

***      

共識機制

 consensus mechanism        

***        

###       Blueprint: World Cup Oracle (世界杯共识预测平台)

####      🎯 1. 项目定位与核心玩法

- **项目名称**: World Cup Oracle
- **核心定位**: 面向 C 端大众的高并发、强互动的世界杯赛事预测 Web App。
- **核心玩法**: 
  1. 列表展示按时间轴排序的世界杯赛事（过去、现在、未来）。
  2. 用户通过点击底部的“⚽”来预测双方球队的进球数。
  3. 系统后台实时聚合全网数据，提炼并展示该场比赛的“最大共识比分”。已完赛的场次展示真实比分并锁定。
- **项目目标**: 1 周内完成产品级 MVP 冲刺，借助世界杯热点获取高并发流量。

####       🛡️ 2. 核心挑战与风控架构 (Anti-Abuse Shield)
面对公网流量，防刷票是生死线。采用无感防护策略：
1. **身份锚点 (Device Fingerprinting)**: 弃用繁琐的注册登录。前端接入 `FingerprintJS` 获取设备唯一指纹，结合 `LocalStorage` 生成 `Device_ID`。限制单设备单场比赛的最高修改次数。
2. **无感人机验证**: 在提交预测 API 前，强制接入 **Cloudflare Turnstile**，100% 拦截脚本机器人，且正常用户完全无需点选验证码。
3. **边缘节点防 Ddos**: 静态资源与前端页面托管于高防 CDN (Vercel 或 Cloudflare Pages)。

####      🧠 3. 核心算法设计 (Consensus Algorithm)
**坚决弃用“平均数”算法**（极易被极端值恶意拉偏）。
- **众数聚合 (Mode)**: 数据库只做累加操作。例如记录 `{'3:1': 500票, '2:1': 3000票}`。前端展示得票最高的 `2:1` 作为“大众共识”。
- **防雪崩缓存**: 后台聚合计算每 1 分钟更新一次 Redis/缓存层，前端拉取聚合后的结果，绝不让高并发读取直接击穿数据库。

####      🛠️ 4. 技术栈选型 (1-Week Sprint Stack)
- **前端表现层**: HTML + CSS (TailwindCSS 或 Bootstrap 5 极速画 UI) + 纯 Vanilla JS (或轻量级 Alpine.js/Vue3)。
- **后端数据库**: **Supabase** (开源 Firebase 替代品)。利用其提供的极速 PostgreSQL 和内置的 REST API/SDK，前端可直接安全写库。免费额度极大，完美契合短周期高爆发项目。
- **图标素材**: 调用自建的 `emoji-hub` (国旗、足球图标)。

####    📁 5. 前端目录结构与表现流
`world-cup-oracle/`
- `index.html`        : 主界面，纯净的时间轴瀑布流 (Timeline UI)。
- `style.css`         : 赛事卡片 (Msg-Box) 样式、交互动画（足球高亮/暗淡过滤）。
- `app.js`            : 核心控制器。负责渲染列表、处理 ⚽ 点击事件并更新 UI。
- `api.js`            : 封装对 Supabase 的数据读写操作。
- `security.js`       : 封装 FingerprintJS 和 Turnstile 的风控验证逻辑。

####       🚀 6. 一周 MVP 冲刺计划 (Sprint Roadmap)
- **Day 1**: 建立 Supabase 数据库表结构 (`Matches` 赛事表, `Predictions` 预测记录表, `Consensus` 共识聚合视图)。
- **Day 2-3**: 切图与交互。写出极具沉浸感的赛事卡片、国旗加载、点击足球的动态高亮交互。
- **Day 4**: API 对接。前端连通 Supabase，实现读取比赛、发送预测。
- **Day 5**: 部署风控装甲 (Fingerprint + Turnstile)，测试防刷机制。
- **Day 6**: 编写后台定时聚合 SQL/Trigger，前台展示共识比分。
- **Day 7**: 绑定域名，部署上线，全网宣发！

***         

UI  design  

title： Thoughts? 

📱 Msg-Box 的三种状态流转 (The 3-State Flow)     

状态 1：共识展示态 (The Oracle View)

这是用户一进来看到的样子，极简、直接：

***       

[🇺🇸] U.S.A    VS    [🏴󠁧󠁢󠁥󠁮󠁧󠁿] England
[ ⚖️ ]    ⚽⚽⚽   :   ⚽⚽    (大众最高共识)
[ ⏱️ ] 🟩🟩🟩🟩🟩🟩⬜⬜ (根据时间变色的进度条)
[ 我 也 要 预 测 ✅ ] (大按钮，引导点击)
状态 2： 沉浸预测态 (The Battle View)

***        

用户点击按钮后，原卡片内容平滑切换，不弹键盘：            

***        

[🇺🇸] U.S.A    VS    [🏴󠁧󠁢󠁥󠁮󠁧󠁿] England
➖ [ ⚽⚽⚽ ] ➕     ➖ [ ⚽⚽ ] ➕ (最多10个，超5个换行)
(Turnstile 盾牌无感验证中...)
[ 🔒 锁 定 预 测 ]

***       

状态 3：阵营结算态 (The "Stand by me" View)          

***       

提交成功！界面翻转，展示震撼的数据对比条，并弹出分享按钮：

🎯 预测成功！看看谁与你同在 (Stand by me)：
🟥 3 : 2 (你的预测) ▇▇▇ 12%
🟦 1 : 2 (大众共识) ▇▇▇▇▇▇▇ 45%
🟦 0 : 2 (其他主流) ▇▇▇▇ 20%
[ 📤 寻 找 同 盟 (分享) ]


***      