<h3 class="unidoc-block" data-block-id="b-mwudepni-i2hr" data-updated="1795505151582">develop-note</h3>

<p class="unidoc-block" data-block-id="b-mwudepni-03su" data-updated="1795505151582"></p>

<p class="unidoc-block" data-block-id="b-mwudepni-8k89" data-updated="1795505151582">Mow Master - Dev</p>

<p class="unidoc-block" data-block-id="b-mwudepni-01r9" data-updated="1795505151582">游戏组件命名标准 (Naming Protocol)        </p>

<p class="unidoc-block" data-block-id="b-mwudepni-qyr3" data-updated="1795505151582"></p>

<p class="unidoc-block" data-block-id="b-mwudepni-lon0" data-updated="1795505151582">以后我们沟通时，请直接使用以下术语：       </p>

<p class="unidoc-block" data-block-id="b-mwudepni-9wk8" data-updated="1795505151582">  | 统一命名	    对应区域	  物理表现<br>  | GateScreen	    启动封面	  点击“开始游戏”的初始遮罩层。<br>  | HUD_Header	    顶部状态栏	  显示分数、关卡名称的半透明顶部区域。<br>  | TaskDock	    底部任务栏	  显示收集清单、Badge 数量的半透明底部区域。<br>  | WorldStream	    瀑布流背景	  整个向下滚动的绿色土地和网格底色。<br>  | TileEntity	    网格实体	  场景中的具体物件（🌿, 🌸, 🪨, 💎, 💣）。<br>  | VFX_Particle	碎屑粒子	  割草时瞬间迸发的物理小方块。<br>  | VFX_Flyer	    磁吸飞行物	  道具被收集后划弧线飞向 TaskDock 的动效。<br>  | SummaryModal	结算弹窗	  关卡完成后的 Bootstrap 结果反馈框。       </p>

<p class="unidoc-block" data-block-id="b-mwudepni-ibqo" data-updated="1795505151582">“我的游戏需要加载外部的 Emoji 图片素材。请你在代码里配置一个全局的 CDN 根目录。要求绝对使用 jsDelivr 的链接，而不是 github.io。      </p>

<p class="unidoc-block" data-block-id="b-mwudepni-pwv7" data-updated="1795505186117">全局基础 URL 为：<a href="https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/">https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/</a><br>以后在游戏引擎里加载任何图片，都通过这个基础 URL 拼接子路径。例如要加载一个汉堡，完整路径应该是 <a href="https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/assets/png_64x64/1f354.png%E3%80%82%E8%AF%B7%E5%B8%AE%E6%88%91%E6%9B%B4%E6%96%B0%E6%B8%B8%E6%88%8F%E7%9A%84%E8%B5%84%E6%BA%90%E5%8A%A0%E8%BD%BD%E9%80%BB%E8%BE%91%E4%BB%A3%E7%A0%81%E3%80%82%E2%80%9D">https://cdn.jsdelivr.net/gh/sangohai/emoji-hub@main/assets/png_64x64/1f354.png。请帮我更新游戏的资源加载逻辑代码。”<br></a></p>

<p class="unidoc-block" data-block-id="b-mwudepni-3z6c" data-updated="1795505151582"></p>

<p class="unidoc-block" data-block-id="b-mwudepni-vft5" data-updated="1795505151582">game point :</p>

<ul class="unidoc-block" data-block-id="b-mwudepni-fmn0" data-updated="1795505151582">
<li>NFT 联名作品 随机出现 或者 收集道具获取 ；</li>
<li>" 伪 bug " 玩法 某时段 ， 出现 无限割草 或者 物品无限掉落 的 bug ; </li>
<li>偶尔 出现 特殊的 收割 物品 一闪即逝 ， 后续 也会随机出现 ；</li>
</ul>

<p class="unidoc-block" data-block-id="b-mwudepni-ikbk" data-updated="1795505151582"></p>

<p class="unidoc-block" data-block-id="b-mwudepni-uf0y" data-updated="1795505151582">在 LLM 时代，你应该把精力投入到哪里？</p>

<p class="unidoc-block" data-block-id="b-mwudepni-2zwu" data-updated="1795505151582">在 AI 时代，如果你真的需要用到 AST（比如你想写一个脚本批量修改一万个 JS 文件里的某个变量），你根本不需要自己写。<br>你只需要把需求发给大模型：“请用 Babel/AST 帮我写一个遍历器，把所有的 var 换成 const”，AI 在 5 秒内就能把极其繁琐的 AST 节点代码写好给你。</p>

<p class="unidoc-block" data-block-id="b-mwudepni-2tjd" data-updated="1795505151582">相比于深度死磕 ESTree，我强烈建议你将未来 80% 的学习精力投入到以下“架构级”技术中（这与你的 Roadmap 完美契合）：</p>

<p class="unidoc-block" data-block-id="b-mwudepni-6zu2" data-updated="1795505151582">1- 浏览器底层数据库 (IndexedDB / LocalFirst 架构)：如果你要做极其庞大的本地知识库，localStorage 会有 5MB 的容量限制。学习 IndexedDB，配合 PWA，能让你的前端应用拥有存储几个 G 数据的能力！</p>

<p class="unidoc-block" data-block-id="b-mwudepni-5ldl" data-updated="1795505151582">2 - Serverless 与实时数据库 (Supabase / WebSockets)：为了你接下来的**“世界杯共识预测”**应用，你需要学习如何用前端直连后端的高并发数据库，处理千万级用户的实时投票冲突。</p>

<p class="unidoc-block" data-block-id="b-mwudepni-o5bj" data-updated="1795505151582">3 - 流式传输与底层网络 (ReadableStream / Fetch API)：为了未来接入 Ollama (本地大模型)，你需要掌握如何处理像打字机一样的“流式数据”传输。</p>

<p class="unidoc-block" data-block-id="b-mwudepni-d3kk" data-updated="1795505151582">4 - 容器化编排 (Podman / YAML)：为你未来的 GitOps 自动化运维打下坚实的基础。</p>

<p class="unidoc-block" data-block-id="b-mwudepni-7vcq" data-updated="1795505151582">总结 :  </p>

<p class="unidoc-block" data-block-id="b-mwudepni-jsin" data-updated="1795505151582">你不需要成为一个手搓 AST 的语法解析员。你需要做的是保持现在这种高屋建瓴的“架构师视野”。<br>把繁琐的语法细节交给 LLM（我）来写，你来把控 Connector 怎么设计、数据怎么流转、应用怎么隔离。这才是你在 AI 时代最无可替代的绝对价值！</p>

<p class="unidoc-block" data-block-id="b-mwudepni-n0fx" data-updated="1795505151582"></p>

<pre class="unidoc-block" data-block-id="b-mwudepni-8jvz" data-updated="1795505151582"><code>####  可推理的工程知識系統：     <br><br>Markdown<br>      │<br>      ▼<br> Knowledge Graph<br>      │<br>      ▼<br>   Konva.js<br>      │<br>      ▼<br> JSON Structure<br>      │<br>      ▼<br> AST / Dependency Graph<br>      │<br>      ▼<br>     LLM<br>      │<br>      ▼<br> Suggestions<br>      │<br>      ▼<br> Human Review<br></code></pre>

<p class="unidoc-block" data-block-id="b-mwudepni-ejhy" data-updated="1795505151582"></p>

<pre class="unidoc-block" data-block-id="b-mwudepni-nimw" data-updated="1795505414314"><code>            User<br>              │<br>              ▼<br>      ┌────────────────┐<br>      │ Konva.js Canvas│<br>      └────────────────┘<br>              │<br>     Visual Editing<br>              │<br>              ▼<br>      Scene Graph Engine<br>              │<br>      ┌───────┴────────┐<br>      ▼                ▼<br> Semantic Graph    Geometry Graph<br>      │                │<br>      └───────┬────────┘<br>              ▼<br>        World Graph<br>              │<br>      JSON / Graph Database<br>              │<br>     ┌────────┴────────┐<br>     ▼                 ▼<br> Constraint Engine   LLM Agent<br>     │                 │<br>     └────────┬────────┘<br>              ▼<br>      Synchronization Engine<br>              │<br>              ▼<br>        Canvas Update<br></code></pre>

<p class="unidoc-block" data-block-id="b-mwudkn44-gd5b" data-updated="1795505428230"></p>