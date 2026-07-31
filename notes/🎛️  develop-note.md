### develop-note        

***      

#### Mow Master - Dev       

游戏组件命名标准 (Naming Protocol)        

***        

以后我们沟通时，请直接使用以下术语：       

  | 统一命名	    对应区域	  物理表现        
  | GateScreen	    启动封面	  点击“开始游戏”的初始遮罩层。        
  | HUD_Header	    顶部状态栏	  显示分数、关卡名称的半透明顶部区域。       
  | TaskDock	    底部任务栏	  显示收集清单、Badge 数量的半透明底部区域。       
  | WorldStream	    瀑布流背景	  整个向下滚动的绿色土地和网格底色。        
  | TileEntity	    网格实体	  场景中的具体物件（🌿, 🌸, 🪨, 💎, 💣）。         
  | VFX_Particle	碎屑粒子	  割草时瞬间迸发的物理小方块。         
  | VFX_Flyer	    磁吸飞行物	  道具被收集后划弧线飞向 TaskDock 的动效。         
  | SummaryModal	结算弹窗	  关卡完成后的 Bootstrap 结果反馈框。       


“我的游戏需要加载外部的 Emoji 图片素材。请你在代码里配置一个全局的 CDN 根目录。要求绝对使用 jsDelivr 的链接，而不是 github.io。      

全局基础 URL 为：https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/
以后在游戏引擎里加载任何图片，都通过这个基础 URL 拼接子路径。例如要加载一个汉堡，完整路径应该是 https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/assets/png_64x64/1f354.png。请帮我更新游戏的资源加载逻辑代码。”

***        

#### game point :         

- NFT 联名作品 随机出现 或者 收集道具获取 ；
- " 伪 bug " 玩法 某时段 ， 出现 无限割草 或者 物品无限掉落 的 bug ; 
- 偶尔 出现 特殊的 收割 物品 一闪即逝 ， 后续 也会随机出现 ；


***        

####  在 LLM 时代，你应该把精力投入到哪里？

在 AI 时代，如果你真的需要用到 AST（比如你想写一个脚本批量修改一万个 JS 文件里的某个变量），你根本不需要自己写。
你只需要把需求发给大模型：“请用 Babel/AST 帮我写一个遍历器，把所有的 var 换成 const”，AI 在 5 秒内就能把极其繁琐的 AST 节点代码写好给你。

相比于深度死磕 ESTree，我强烈建议你将未来 80% 的学习精力投入到以下“架构级”技术中（这与你的 Roadmap 完美契合）：

1- 浏览器底层数据库 (IndexedDB / LocalFirst 架构)：如果你要做极其庞大的本地知识库，localStorage 会有 5MB 的容量限制。学习 IndexedDB，配合 PWA，能让你的前端应用拥有存储几个 G 数据的能力！

2 - Serverless 与实时数据库 (Supabase / WebSockets)：为了你接下来的**“世界杯共识预测”**应用，你需要学习如何用前端直连后端的高并发数据库，处理千万级用户的实时投票冲突。

3 - 流式传输与底层网络 (ReadableStream / Fetch API)：为了未来接入 Ollama (本地大模型)，你需要掌握如何处理像打字机一样的“流式数据”传输。

4 - 容器化编排 (Podman / YAML)：为你未来的 GitOps 自动化运维打下坚实的基础。

总结 :  

你不需要成为一个手搓 AST 的语法解析员。你需要做的是保持现在这种高屋建瓴的“架构师视野”。
把繁琐的语法细节交给 LLM（我）来写，你来把控 Connector 怎么设计、数据怎么流转、应用怎么隔离。这才是你在 AI 时代最无可替代的绝对价值！

***        

```   
####  可推理的工程知識系統：     

Markdown
      │
      ▼
 Knowledge Graph
      │
      ▼
   Konva.js
      │
      ▼
 JSON Structure
      │
      ▼
 AST / Dependency Graph
      │
      ▼
     LLM
      │
      ▼
 Suggestions
      │
      ▼
 Human Review

```    

***        

```      
            User
              │
              ▼
      ┌────────────────┐
      │ Konva.js Canvas│
      └────────────────┘
              │
     Visual Editing
              │
              ▼
      Scene Graph Engine
              │
      ┌───────┴────────┐
      ▼                ▼
 Semantic Graph    Geometry Graph
      │                │
      └───────┬────────┘
              ▼
        World Graph
              │
      JSON / Graph Database
              │
     ┌────────┴────────┐
     ▼                 ▼
 Constraint Engine   LLM Agent
     │                 │
     └────────┬────────┘
              ▼
      Synchronization Engine
              │
              ▼
        Canvas Update

```    


[     ]
{     }