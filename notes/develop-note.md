#### develop-note        

游戏组件命名标准 (Naming Protocol)        

以后我们沟通时，请直接使用以下术语：       

  | 统一命名	对应区域	物理表现
  | GateScreen	启动封面	点击“开始游戏”的初始遮罩层。
  |HUD_Header	顶部状态栏	显示分数、关卡名称的半透明顶部区域。
  |TaskDock	底部任务栏	显示收集清单、Badge 数量的半透明底部区域。
  |WorldStream	瀑布流背景	整个向下滚动的绿色土地和网格底色。
  |TileEntity	网格实体	场景中的具体物件（🌿, 🌸, 🪨, 💎, 💣）。
  |VFX_Particle	碎屑粒子	割草时瞬间迸发的物理小方块。
  |VFX_Flyer	磁吸飞行物	道具被收集后划弧线飞向 TaskDock 的动效。
  |SummaryModal	结算弹窗	关卡完成后的 Bootstrap 结果反馈框。


“我的游戏需要加载外部的 Emoji 图片素材。请你在代码里配置一个全局的 CDN 根目录。要求绝对使用 jsDelivr 的链接，而不是 github.io。      

全局基础 URL 为：https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/
以后在游戏引擎里加载任何图片，都通过这个基础 URL 拼接子路径。例如要加载一个汉堡，完整路径应该是 https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/assets/png_64x64/1f354.png。请帮我更新游戏的资源加载逻辑代码。”


