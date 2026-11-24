<p class="unidoc-block" data-block-id="b-mwublvkg-43md" data-updated="1795502126608">PWA-AegisAudio-app  :</p>

<p class="unidoc-block" data-block-id="b-mwublvkg-iv63" data-updated="1795502126608"></p>

<h3 class="unidoc-block" data-block-id="b-mwublvkg-6fz0" data-updated="1795502131606">项目名称：AegisAudio —— 零依赖原生架构的个人声学隐私护盾 (PWA MVP)</h3>

<h3 class="unidoc-block" data-block-id="b-mwublvkg-3xcy" data-updated="1795502135820">0. 项目伦理、合规与声学健康声明 (Ethics, Compliance &amp; Health)</h3>

<ol class="unidoc-block" data-block-id="b-mwublvkg-5kno" data-updated="1795502126608">
<li><strong>防御型隐私保护定位 (Defensive Privacy Tool)：</strong> 本项目是一个完全合法、合规的个人隐私保护与信息安全防御工具（性质等同于商业保密会议室常用的 Sound Masking 声学掩蔽系统）。其唯一目的是在用户设备周围产生温和的物理声学掩蔽场，防止潜在违规应用在后台利用麦克风进行未经授权的语音识别（ASR）窃听。</li>
<li><strong>严守浏览器沙盒边界：</strong> 本项目 100% 运行在标准浏览器沙盒内，所有监测功能均基于标准 Web API 的自身状态反馈（如音频焦点被外部未知进程抢占导致的中断事件 <code>onmute</code>/<code>onended</code> 及本机声学回波分析）。</li>
<li><strong>听觉与神经健康保护原则 (Health-First Acoustics)：</strong> 严禁输出高分贝高频刺耳噪音（禁止 &gt;15kHz 的高能持续输出）。所有声学掩蔽必须采用符合人体工学的粉红噪音（Pink Noise）、褐噪音（Brown Noise）及自然呼吸节律调制（LFO），并在音频链路末端强制挂载动态压缩限幅器（<code>DynamicsCompressorNode</code>）以杜绝爆音。</li>
</ol>

<p class="unidoc-block" data-block-id="b-mwublvkg-b57r" data-updated="1795502126608"></p>

<h2 class="unidoc-block" data-block-id="b-mwublvkg-po6a" data-updated="1795502126608">1. Vibe Coding 协作与外部记忆工程约束 (Vibe Coding Protocols)</h2>

<p class="unidoc-block" data-block-id="b-mwublvkg-u92p" data-updated="1795502126608">为防止长对话导致的上下文污染、记忆丢失与代码幻觉，在开发全过程中，你必须严格执行以下 4 项工程机制：</p>

<ol class="unidoc-block" data-block-id="b-mwublvkg-5f3z" data-updated="1795502126608">
<li><strong>Windows CMD 自动化建档：</strong><br>在初始化项目或新增模块时，请直接提供纯正的 <strong>Windows CMD</strong> 命令行脚本（使用 <code>mkdir</code> 建立目录，使用 <code>type nul &gt;</code> 建立空文件），协助我快速在本地生成项目结构，严禁使用 <code>touch</code> 等 Linux 命令。</li>
<li><strong>建立 <code>./doc/</code> 外部记忆库：</strong><br>项目下必须建立 <code>doc</code> 文件夹，保存开发过程的详细文档作为你的外部记忆库：<ul>
<li><code>doc/blue-print.md</code>：记录项目的全局架构、模块边界与核心契约。</li>
<li><code>doc/version-memory.md</code>：作为内部开发版本库，记录每个阶段的正确状态参考，减少你对长上下文的检索负担。</li>
</ul>
</li>
<li><strong>内部开发版本库与阶段快照（防幻觉机制）：</strong><br>当我们完成基础架构或任意一个独立模块并通过测试后，由你决定并分配一个内部开发版本号（如 <code>v0.1.0-base</code>、<code>v0.2.0-masker</code>）。在每个阶段结束时，你必须更新 <code>doc/version-memory.md</code>，简要记录：【当前版本号】、【已测试通过并锁死的文件清单】、【核心接口签名】与【下一阶段目标】。在后续开发中，以此作为唯一正确的记忆锚点。</li>
<li><strong>Git 本地版本锚点与 GitHub 同步：</strong><br>为了确保代码随时可回滚，并方便后续通过 GitHub Pages 部署 HTTPS PWA，在每个内部版本快照完成时，请为我提供对应的 Windows CMD <code>git commit</code> 与推送到 GitHub 的命令提示。</li>
</ol>

<p class="unidoc-block" data-block-id="b-mwublvkg-w5sr" data-updated="1795502126608"></p>

<h2 class="unidoc-block" data-block-id="b-mwublvkg-mmhe" data-updated="1795502126608">2. 核心技术架构：No-Build 原生乐高模式 (Vanilla Lego Architecture)</h2>

<p class="unidoc-block" data-block-id="b-mwublvkg-ih6v" data-updated="1795502126608">本项目摒弃臃肿的 NPM、<code>node_modules</code> 和 Vite 等打包工具，采用浏览器原生支持的 <strong>ES6 Modules (<code>&lt;script type="module"&gt;</code>)</strong> 构建。你必须严格遵守以下<strong>五条代码铁律</strong>：</p>

<ol class="unidoc-block" data-block-id="b-mwublvkg-ltw0" data-updated="1795502126608">
<li><strong>零构建依赖（Zero-Build &amp; Vanilla JS）：</strong> 所有代码均为浏览器可直接运行的原生 <code>.html</code>、<code>.css</code> 和 <code>.js</code>（ES6 模块）。UI 基础布局采用通过 CDN 引入的 <strong>Bootstrap 5</strong>，无需任何本地编译步骤。</li>
<li><strong>高内聚、零耦合（乐高积木原则）：</strong> 每个功能模块必须是完全独立的 <code>.js</code> 文件（存放在 <code>js/modules/</code> 目录下）。模块之间<strong>严禁直接互相引用</strong>，只能通过主控制器 <code>js/app.js</code> 或统一的全局事件总线（<code>CustomEvent</code>）按照契约通信。</li>
<li><strong>使用现代 JSDoc 锁死接口契约：</strong> 在每个 <code>.js</code> 文件顶部开启 <code>// @ts-check</code> 注释，并在 <code>js/core/contracts.js</code> 及各模块暴露函数处使用简洁标准的 <strong>JSDoc (<code>@typedef</code>, <code>@param</code>, <code>@returns</code>)</strong> 锁死数据类型。未经允许，严禁篡改契约。</li>
<li><strong>200 行体积紧箍咒与错误隔离：</strong> 任何单个 <code>.js</code> 文件的代码行数<strong>严格控制在 200 行以内</strong>。每个模块的初始化与执行必须包裹在独立的 <code>try...catch</code> 沙盒中，确保单一模块报错绝不导致整体崩溃。</li>
<li><strong>轻量级标准 PWA：</strong> 使用标准的 <code>manifest.json</code> 与极简稳定的原生 <code>sw.js</code>，确保离线可用且绝不产生缓存死锁。</li>
</ol>

<p class="unidoc-block" data-block-id="b-mwublvkh-raiu" data-updated="1795502126609"></p>

<h2 class="unidoc-block" data-block-id="b-mwublvkh-54vo" data-updated="1795502126609">3. 视觉与交互规范：OLED 极简黑白美学 (OLED Monochrome UI)</h2>

<p class="unidoc-block" data-block-id="b-mwublvkh-4o8l" data-updated="1795502126609">考虑到移动设备普遍使用 LED / OLED 屏幕，为实现极致节能与硬核安全仪表盘美学，视觉规范如下：</p>

<ol class="unidoc-block" data-block-id="b-mwublvkh-ux49" data-updated="1795502126609">
<li><strong>纯黑节能底座：</strong> 全局背景色强制锁定为 <code>#000000</code>（纯黑不发光），文字与线框仅使用 <code>#FFFFFF</code>（纯白）与 <code>#666666</code>（暗灰）。</li>
<li><strong>黑白线条水波/雷达扩散特效：</strong> 当防护系统启动时，屏幕中央的 Canvas 模拟雷达圆心扩散或水波纹扩散效果。仅使用黑白细线条（<code>1px</code>）绘制，最大限度减少屏幕能耗。</li>
<li><strong>白色线框异常警告提示：</strong> 当运行中侦测到有其他应用尝试访问/抢占麦克风时，弹出纯黑底色、<strong>白色线框的长方形文字提示框</strong>，内容格式为：<code>[时间 HH:MM:SS] 侦测到有设备/进程访问麦克风</code>；显示时长 <strong>3~5 秒后自动消失</strong>。</li>
<li><strong>假性息屏（潜行模式）的绝对静默：</strong> 在进入“假性息屏”状态下，全屏纯黑（支持双击屏幕唤醒）。<strong>在此状态下，上述雷达水波扩散特效、白色线框弹窗提示以及所有 UI 界面全部不显示（暂停 Canvas 渲染循环以彻底省电）</strong>，仅在后台维持声学掩蔽与静默日志记录。</li>
</ol>

<p class="unidoc-block" data-block-id="b-mwublvkh-ayz8" data-updated="1795502126609"></p>

<h2 class="unidoc-block" data-block-id="b-mwublvkh-7gcd" data-updated="1795502126609">4. MVP 乐高模块拆解 (Lego Modules Breakdown)</h2>

<h3 class="unidoc-block" data-block-id="b-mwublvkh-gzhj" data-updated="1795502126609">底座与契约层 (<code>js/core/</code>)</h3>

<ul class="unidoc-block" data-block-id="b-mwublvkh-atuy" data-updated="1795502126609">
<li><strong><code>contracts.js</code></strong>：集中定义全局事件名、日志数据结构（<code>LogEntry</code>）及模块接口的 JSDoc 契约。</li>
<li><strong><code>audio-engine.js</code></strong>：管理全局唯一的 <code>AudioContext</code>，并在输出末端强制串联安全限幅器（<code>DynamicsCompressorNode</code>）。</li>
</ul>

<h3 class="unidoc-block" data-block-id="b-mwublvkh-jbyy" data-updated="1795502126609">积木一：健康声学掩蔽发生器 (<code>js/modules/acoustic-masker.js</code>)</h3>

<ul class="unidoc-block" data-block-id="b-mwublvkh-ezgl" data-updated="1795502126609">
<li><strong>功能：</strong> 利用 Web Audio API 实时生成覆盖 300Hz-3400Hz 语音频段的健康掩蔽声波（支持切换“深海褐噪音 Brown Noise”、“春雨粉红噪音 Pink Noise”及“咖啡馆伪人声共振峰掩蔽 Formant Babble”），内置 LFO 呼吸调制。</li>
</ul>

<h3 class="unidoc-block" data-block-id="b-mwublvkh-ff4h" data-updated="1795502126609">积木二：麦克风占坑监测与抢占传感器 (<code>js/modules/mic-sensor.js</code>)</h3>

<ul class="unidoc-block" data-block-id="b-mwublvkh-g6u1" data-updated="1795502126609">
<li><strong>功能：</strong> 开启低功耗麦克风音频流监听，严密监控 <code>MediaStreamTrack</code> 的 <code>onmute</code>、<code>onended</code>、音频焦点中断事件，以及利用 <code>AnalyserNode</code> 监控环境声学回波突变。一旦捕获异常，立即派发标准全局事件。</li>
</ul>

<h3 class="unidoc-block" data-block-id="b-mwublvkh-0byg" data-updated="1795502126609">积木三：持久化安全日志查询系统 (<code>js/modules/log-manager.js</code>)</h3>

<ul class="unidoc-block" data-block-id="b-mwublvkh-iou6" data-updated="1795502126609">
<li><strong>功能：</strong> 监听积木二的异常信号，无论当前是否处于假性息屏，均立即将记录写入本地 <code>localStorage</code> / <code>IndexedDB</code>。提供黑白线框风格的日志查询面板，记录不同时间段自动访问/抢占麦克风的异常事件，支持按时间查询与清空。</li>
</ul>

<h3 class="unidoc-block" data-block-id="b-mwublvkh-lc8f" data-updated="1795502126609">积木四：OLED 水波纹雷达与线框弹窗 (<code>js/modules/oled-visualizer.js</code>)</h3>

<ul class="unidoc-block" data-block-id="b-mwublvkh-p91d" data-updated="1795502126609">
<li><strong>功能：</strong> 绘制黑白线条圆心水波纹扩散动画，并管理 3~5 秒自动消失的白色线框长方形警告提示。暴露 <code>setStealthMode(boolean)</code> 接口，在假息屏状态下彻底关闭特效与弹窗显示。</li>
</ul>

<h3 class="unidoc-block" data-block-id="b-mwublvkh-bkys" data-updated="1795502126609">积木五：假性息屏节能锁 (<code>js/modules/stealth-lock.js</code>)</h3>

<ul class="unidoc-block" data-block-id="b-mwublvkh-zf43" data-updated="1795502126609">
<li><strong>功能：</strong> 调用 <code>Screen Wake Lock API</code> 防止系统休眠，开启全屏纯黑遮罩并通知积木四静默，监听双击屏幕（<code>dblclick</code> 及移动端双次触摸）唤醒界面。</li>
</ul>

<h3 class="unidoc-block" data-block-id="b-mwublvkh-fhik" data-updated="1795502126609">积木六：ASR 语音识别验证台 (<code>js/modules/asr-tester.js</code>)</h3>

<ul class="unidoc-block" data-block-id="b-mwublvkh-t6wq" data-updated="1795502126609">
<li><strong>功能：</strong> 调用原生 <code>SpeechRecognition</code> API，用于直观验证护盾开启后语音识别失效的效果。</li>
</ul>

<p class="unidoc-block" data-block-id="b-mwublvkh-otbq" data-updated="1795502126609"></p>

<h2 class="unidoc-block" data-block-id="b-mwublvkh-wq3e" data-updated="1795502126609">5. 协作开发启动指令 (Step 1 Execution)</h2>

<p class="unidoc-block" data-block-id="b-mwublvkh-kndn" data-updated="1795502126609">请确认你已完全理解上述开发需求与 Vibe Coding 工程约束。现在请直接执行 <strong>Step 1（基础底座与第一代记忆库建立）</strong>，按顺序输出以下内容（不要一次性输出后续业务模块代码）：</p>

<ol class="unidoc-block" data-block-id="b-mwublvkh-bcns" data-updated="1795502126609">
<li><strong>Windows CMD 建档脚本：</strong> 输出一段可在 Windows CMD 中直接复制运行的命令，一次性建立本项目的所有文件夹（含 <code>doc</code>、<code>js/core</code>、<code>js/modules</code>、<code>css</code>）及空的占坑文件，并包含 <code>git init</code> 初始化命令。</li>
<li><strong>外部记忆库初始化：</strong> 输出 <code>doc/blue-print.md</code> 与初始版本 <code>doc/version-memory.md</code>（设定初始内部版本号为 <code>v0.1.0-scaffold</code>）的完整内容。</li>
<li><strong>核心底座代码：</strong> 输出 <code>index.html</code>（含 Bootstrap 5 CDN 与纯黑白 OLED 样式框架）、<code>js/core/contracts.js</code> 以及 <code>js/core/audio-engine.js</code> 的完整代码。</li>
</ol>

<p class="unidoc-block" data-block-id="b-mwublvkh-cedz" data-updated="1795502126609"></p>

<p class="unidoc-block" data-block-id="b-mwublvkh-oirn" data-updated="1795502126609">1 -  应用启动时， 自动 占用 麦克风 ， 背景 雷达水纹动画 同时 启动 ； 提示用户 ，当前已经启动保护 功能 ；  用户需要手动关闭保护 ；</p>

<p class="unidoc-block" data-block-id="b-mwublvkh-s00j" data-updated="1795502126609">2 - </p>

<p class="unidoc-block" data-block-id="b-mwublvkh-41m0" data-updated="1795502126609"></p>

<p class="unidoc-block" data-block-id="b-mwublvkh-mdqc" data-updated="1795502126609">技術參考文件<br>建議你直接收藏以下官方文件，這些是後續開發最重要的參考資料：<br>MDN — Web Audio API⁠：整個音頻系統的 API 文件。<br>MDN — AnalyserNode⁠：頻率、波形及 FFT 分析。<br>MDN — AudioWorklet⁠：自訂音頻處理。<br>MDN — MediaRecorder⁠：錄音及媒體流保存。<br>MDN — getUserMedia⁠：麥克風採集及權限。<br>W3C — Web Audio API 1.1⁠：正式技術規範。</p>

<p class="unidoc-block" data-block-id="b-mwublvkh-dsq7" data-updated="1795502126609"></p>