### Hand-note       

***     

#### LeaferJS      
就是来解决这个问题的。国产开源 Canvas 2D 渲染引擎，GitHub 4.1K Stars（leafer-ui 核心仓库），3 年多持续开发，MIT 协议。官网上的性能数据很直接：1.5 秒创建 100 万个可交互矩形，内存占用仅 350MB。

***     

#### beautiful-mermaid         
做一个自己用着趁手的画图工具。目前 beautiful-mermaid  已经在 github 收获了 10.2k 的 star 数，而且还在持续维护中~
开源地址:https://github.com/lukilabs/beautiful-mermaid

***     

#### Files.md         
作者 Artem Zakirullin 花了 5 年时间打磨，目前在 GitHub 上拿到了 2000 多个 Star。它就是你本地的一堆 .md 文件，加了一层很薄的 Web 界面。没有插件市场，没有模板系统，没有第二大脑的幻觉。 作者的观点很直接：笔记越多不等于理解越深，工具越简单反而越能激发创造力。      

开源地址：https://github.com/zakirullin/files.md

***       

#### 使用 git 打造自己的個人記憶庫：         

https://youtu.be/vMBJ6C8VpjY?si=W2aQ8fVUz4_eTjI6

***      

#### Pixelorama 像素风游戏素材工具           

Pixelorama - pixelate your dreams!           
Unleash your creativity with Pixelorama, a powerful and accessible open-source pixel art multitool. Whether you want to create sprites, tiles,  animations, or just express yourself in the language of pixel art, this software will realize your pixel-perfect dreams with a vast toolbox of features.     

https://github.com/Orama-Interactive/Pixelorama

***       

#### tiny-world -builder           

纯前端单文件：核心是 tiny-world-builder.html，使用 vanilla JS + Three.js（r128，自托管在 vendor/three 目录，无需外部 CDN）。性能优化：8×8 网格保持 60fps，适合浏览器直接运行。部署简单：静态站点，可直接部署到 Vercel/Netlify，或本地打开 HTML 文件运行。开源协议：AGPL-3.0。    
开源地址开源地址:      
https://github.com/jasonkneen/tiny-world-builder/       

下载下来直接用 Agent 编辑就行，OpenCode 或者 Claude Code 都可以；

***        

#### - Gonzo TUI       

Gonzo 切中的正是这个空档。它是一个 Go 编写的实时日志分析 TUI，灵感来自 k9s，把日志流、图表、过滤、严重级别分布、AI 辅助分析都压进终端；支持文件、stdin、Kubernetes、OTLP、CloudWatch、Loki、Vercel 等工作流。       

***    

#### The Spriters Resource      

这是一个专门收录游戏素材的网站。它主要整理的是已经发售游戏中的 Sprite、角色动画、UI、地图块等资源，并且会按游戏和平台分类。网站里的内容覆盖范围很广，从 FC、GBA、NDS 到街机、PC、Switch，都能找到对应作品。     

The Spriters Resource (https://www.spriters-resource.com/)      


***       

#### 开源AI流水线Godogen，独立游戏开发者神器；         

开源AI流水线Godogen，独立游戏开发者神器；      
        
想做游戏，但不会写代码、不会画美术、不懂引擎架构？2026年爆火开源项目Godogen彻底打破门槛：只用一段文字描述游戏创意，AI全自动走完策划→美术→编码→测试修复全流程，直接交付规范、可编译、能发布的Godot4完整工程，2D/3D游戏全覆盖，普通PC就能跑，独立游戏开发者狂喜！在AI的加持下，只有有想法、有创意，就能开发出属于自己的游戏。例如《孤独的公路》这类小游戏，只需要一段文字描述就能生成。       

Godogen 到底是什么？GitHub开源地址：https://github.com/htdt/godogen

它是一套基于Claude Code打造的全链路AI游戏自动生成流水线，本质是一套AI协同技能组，无需人工介入，实现提示词输入，成品游戏输出。区别于市面上只生成单段代码、单张素材的碎片化AI工具，Godogen是一整套虚拟游戏工作室。       


***         

####  Takumi 圖片渲染工具     


Takumi[1] 是一个 Rust 写的图片渲染引擎。它把 JSX 直接转成 PNG 或动画 WebP——不经过浏览器，不需要 Chromium ，一个函数调用就出图。

官网：https://takumi.kane.tw[3]   

•GitHub ：https://kane50613/takumi[4]

•Playground ：https://takumi.kane.tw/playground[5]      


***        

####  World of ClaudeCraft：

World of ClaudeCraft：一个运行在浏览器里的完整 MMO，一行命令部署，还能训练 AI 玩它

World of ClaudeCraft：一个运行在浏览器里的完整 MMO，一行命令部署，还能训练 AI 玩它17 天 1316 星，393 个 fork。它不是一个游戏 demo，而是一个可玩的、可自部署的、可多人联机的、甚至可以用强化学习训练 Agent 的完整经典 MMO。这是什么World of ClaudeCraft 是一个完整的经典时代风格 MMO，在浏览器里跑，一行命令就能部署自己的服务器，甚至还能用 Python 训练 AI Agent 来玩它。先看几个数字来建立认知：9 个职业，每个都有原版风格的完整技能体系，27 套天赋（每职业三系）3 张地图、90 个任务、5 个地下城（其中 4 个 5 人精英本）排位 PvP 竞技场（1v1、2v2 天梯 + 2v2 乱斗模式）完整的多人社交：队伍、交易、决斗、密语、away 状态翻译成 14 种语言过程生成——没有 3D 模型文件头部的强化学习环境：用 Gymnasium 接口直接驱动真实游戏我用一句话总结：这是一个功能完整的 MMO，全部用 TypeScript 写在一个代码库里，浏览器打开就能玩，MIT 许可证，随便 fork。


***       

