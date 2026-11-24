<p class="unidoc-block" data-block-id="b-mwuenf6n-j5fw" data-updated="1795507237535">小丑🃏 &amp; emoji</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-trph" data-updated="1795507277302">[ prompt ] :<br>你是經驗豐富的遊戲開發工程師 而且 你還對 因為模型 例如“福格”行為模型很有研究，你怎麼理解 “小丑牌🃏”這個遊戲，它基於傳統的撲克牌玩法 再加入新的遊戲規則和遊戲模式，還有新的積分系統和獎勵機制，這樣在玩家熟悉的遊戲基礎再建立新的玩法，讓玩家眼前一亮，而且遊戲的上手難度也降低了，同時也和傳統的撲克遊戲一樣可以無限循環去遊玩增加了遊戲性；我也計劃使用 emoji 的表情符號建立新的遊戲規則來建立新的遊戲模式，你認為兩者之間有參考性嗎？請你專業地為我詳細分析和評估可行性！<br></p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-kvym" data-updated="1795507237535">[ LLM ] :<br>我認為，你提出的這個方向，不只是有參考性，而且它符合近十年許多成功獨立遊戲共同遵循的一個設計原則：<br>不要重新教育玩家，而是在玩家已經會玩的規則上，創造新的可能性。<br>這也是《小丑牌（Balatro）》最成功的地方。      </p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-vo1f" data-updated="1795507237535">我如何理解《小丑牌》的成功？<br>很多人以為《小丑牌》是一款撲克牌遊戲。<br>我反而認為：<br>它其實是一款 Roguelike Deck Builder，只是披著撲克牌的外衣。<br>玩家真正玩的不是：<br>德州撲克<br>五張牌<br>梭哈<br>而是：<br>「利用玩家已經懂的撲克知識」，去降低學習成本。<br>這裡有一個非常重要的心理學概念。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-767j" data-updated="1795507237535">這其實符合福格（BJ Fogg）行為模型<br>福格模型：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-t3ug" data-updated="1795507237535">Behavior = Motivation × Ability × Prompt       </p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ukqy" data-updated="1795507237535">也就是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-qyai" data-updated="1795507237535">行為 = 動機 × 能力 × 提示<br>其中 Ability（容易做到）往往比 Motivation 更重要。<br>因為：<br>如果一件事情很難理解。<br>即使玩家很有興趣。<br>也會退出。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-fy9k" data-updated="1795507237535">再看你的 Emoji 想法<br>我反而覺得：<br>你的方向和 Balatro 非常接近。<br>但是：<br>不是玩法接近。<br>而是：<br>設計哲學接近。   </p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-njkd" data-updated="1795507237535">但是，我提醒你一個最大的風險<br>我覺得很多設計師會犯一個錯。<br>就是：<br>「因為 Emoji 很多，所以全部都想用。」</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-4lbj" data-updated="1795507237535">結果：<br>玩家看到：<br>200 個圖示。<br>不知道要幹嘛。<br>Balatro 成功不是因為：<br>Joker 很多。<br>而是：<br>前十分鐘只有很少規則。<br>慢慢增加。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-b34m" data-updated="1795507237535">我甚至建議你不要一開始就把目標定義為一款遊戲，而是把它定義成一個Emoji Game Engine（Emoji 遊戲規則引擎）：同一套 Emoji、同一套資料結構，可以衍生出卡牌、解謎、交易、Roguelike、派對遊戲等多種玩法。這樣，它的價值就會遠大於單一遊戲。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-9zdb" data-updated="1795507237535">事實上，在分析你的許多想法之後，我提出 Emoji Rules Engine（Emoji 規則引擎），並不是一時想到的，而是因為我發現你的多個專案，其實都在朝著同一個方向發展。<br>我認為，Emoji 不應該被當作「美術素材」，而應該被當作「遊戲語言」。<br>這兩者的差別非常大。    </p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-kkzz" data-updated="1795507237535">Emoji Entity<br>│<br>├── Unicode（😊）<br>├── Tags（happy、human）<br>├── Rules（增加士氣）<br>├── Physics（重量、碰撞）<br>├── Animation（跳動、旋轉）<br>├── Particle（✨）<br>├── Layer（帽子、武器、光環）<br>├── Status（中毒、燃燒、冰凍）<br>├── Sound（笑聲）<br>├── AI（巡邏、追逐）<br>└── Events（被點擊、碰撞、死亡）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-kmhm" data-updated="1795507237535">我的結論 :    </p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-x9sc" data-updated="1795507237535">我最欣賞你目前的方向<br>根據我們這段時間的交流，我發現你一直在做一件很有特色的事情：**把複雜問題轉化成可以用資料驅動的簡單系統。**無論是你之前的交易平台構想、遊戲設計，還是現在的 Emoji Hub，都有這個共同特徵。<br>因此，我會建議你不要把 Emoji Kitchen 當成競爭對手。<br>反而可以把它當成一個靈感來源：<br>Emoji Kitchen：研究「如何創造新的 Emoji 外觀」。<br>Emoji Game Engine：研究「如何讓 Emoji 擁有新的遊戲行為」。<br>前者是在建立一套視覺創作系統；後者是在建立一套遊戲規則系統。<br>從技術門檻來看，後者更符合你的 Web 技術背景，也更容易以 HTML、CSS、JavaScript、JSON 為核心，逐步完成 MVP，再持續擴充。這也是我認為最值得你投入的方向。     </p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-3bnk" data-updated="1795507237535">我現在越來越確信，你的方向和 Emoji Kitchen 最大的差別，不是在技術，而是在產品價值。<br>Emoji Kitchen 的核心資產是圖片，因此它的價值更多來自「新奇感」。而你的核心資產如果是 Rule（規則） 和 Entity（實體），那價值就來自「可玩性」和「可組合性」。      </p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-v3cz" data-updated="1795507237535">也就是說：<br>Emoji Kitchen 的問題是：「這兩個 Emoji 能合成什麼樣子？」<br>Emoji Game Engine 的問題是：「這兩個 Emoji 放在一起，會發生什麼事？」<br>我認為，後一個問題更容易形成長期的遊戲深度，也更符合你一直追求的「建立可持續演化系統，而不是一次性功能」的設計方向。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-wwas" data-updated="1795507237535">{     }</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-xfr6" data-updated="1795507237535">分析 《小丑牌（Balatro）》 玩法 ：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-bkkw" data-updated="1795507237535"></p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-aaxy" data-updated="1795507237535">我认为，如果你的目的不是单纯想玩《小丑牌（Balatro）》，而是希望研究它为什么会成为一种现象级设计，并把它的设计思想借鉴到 Emoji 项目中，那么我们就不要从"游戏攻略"去理解，而要从**系统设计（Game System Design）**去拆解。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-2sdx" data-updated="1795507237535">作为游戏开发工程师，我会把《小丑牌》拆成五层：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-btpk" data-updated="1795507237535">基础规则层 → 得分层 → Build（构筑）层 → Roguelike 循环层 → 无限组合层</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-q9cw" data-updated="1795507237535">真正让它封神的，不是 Poker，而是这五层不断互相叠加。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-sb2y" data-updated="1795507237535">第一层 ：Poker（玩家已经认识的规则）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ijbj" data-updated="1795507237535">很多人误以为：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-wr2a" data-updated="1795507237535">小丑牌 = 扑克</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-yrio" data-updated="1795507237535">其实不是。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-wlk1" data-updated="1795507237535">Poker 只是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-sbgr" data-updated="1795507237535">玩家语言（Player Language）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-iiac" data-updated="1795507237535">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ysob" data-updated="1795507237535">玩家看到：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-by5u" data-updated="1795507237535">♠  A<br>♠  K<br>♠  Q<br>♠  J<br>♠  10</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-a7bx" data-updated="1795507237535">不用解释：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-4rng" data-updated="1795507237535">他知道：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-03of" data-updated="1795507237535">这是 Royal Flush。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-hcnr" data-updated="1795507237535">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-3tbl" data-updated="1795507237535">开发者不用写：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-bplu" data-updated="1795507237535">教程：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-kxrt" data-updated="1795507237535">什么叫顺子？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ssrp" data-updated="1795507237535">什么叫对子？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-zqeq" data-updated="1795507237535">什么叫同花？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-fuud" data-updated="1795507237535">全部省掉。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-vwj8" data-updated="1795507237535">所以：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-649p" data-updated="1795507237535">整个游戏：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-9zi4" data-updated="1795507237535">前30秒</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-egyy" data-updated="1795507237535">玩家已经开始玩。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-5ygo" data-updated="1795507237535">不是开始学习。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-7iyl" data-updated="1795507237535">这就是第一层。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-cdrj" data-updated="1795507237535">Borrow Existing Knowledge（借用已有知识）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ziu3" data-updated="1795507237535">这是整个游戏最大的成功。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ossw" data-updated="1795507237535">第二层：Score（分数系统）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-j93i" data-updated="1795507237535">真正开始创新。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-m93f" data-updated="1795507237535">普通扑克：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-hmim" data-updated="1795507237535">Flush</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-13r2" data-updated="1795507237535">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-62p1" data-updated="1795507237535">赢</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-tjgz" data-updated="1795507237535">Balatro：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ntg4" data-updated="1795507237535">变成：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-c0hb" data-updated="1795507237535">Flush</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-dpfa" data-updated="1795507237535">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-g0ci" data-updated="1795507237535">基础筹码（Chip）</p>

<ul class="unidoc-block" data-block-id="b-mwuenf6n-g0l0" data-updated="1795507237535">
<li></li>
</ul>

<p class="unidoc-block" data-block-id="b-mwuenf6n-s83v" data-updated="1795507237535">倍率（Multiplier）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-dg8z" data-updated="1795507237535">=</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-x13x" data-updated="1795507237535">最终分数</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-r9rv" data-updated="1795507237535">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-j9rx" data-updated="1795507237535">Flush</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-pwj0" data-updated="1795507237535">100 Chip</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-mz3t" data-updated="1795507237535">×</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-pc38" data-updated="1795507237535">8 Multiplier</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-a8gq" data-updated="1795507237535">=</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-801h" data-updated="1795507237535">800</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-9xzg" data-updated="1795507237535">但是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-du56" data-updated="1795507237535">Joker：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-r5uu" data-updated="1795507237535">可能：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-8p86" data-updated="1795507237535">×2</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-v01e" data-updated="1795507237535">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-yuo5" data-updated="1795507237535">1600</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-5o8g" data-updated="1795507237535">另一个 Joker：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-zogm" data-updated="1795507237535">再 ×4</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-9uru" data-updated="1795507237535">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-ml43" data-updated="1795507237535">6400</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-obim" data-updated="1795507237535">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-g1g7" data-updated="1795507237535">玩家开始思考：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-xg6e" data-updated="1795507237535">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-htwe" data-updated="1795507237535">怎么赢扑克。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-6ju8" data-updated="1795507237535">而是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-s6in" data-updated="1795507237535">怎么制造最大的数字。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-7b49" data-updated="1795507237535">整个目标：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-jrh7" data-updated="1795507237535">改变了。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-4bcy" data-updated="1795507237535">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-8jgv" data-updated="1795507237535">赢牌。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6n-pful" data-updated="1795507237535">而是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-0bjc" data-updated="1795507237536">爆分。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-abka" data-updated="1795507237536">这一点非常重要。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-i9rf" data-updated="1795507237536">第三层：Modifier（修饰器）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-f6gb" data-updated="1795507237536">这是 Balatro 真正开始"失控"的地方。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-6wan" data-updated="1795507237536">每张牌：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-sutk" data-updated="1795507237536">开始拥有：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-6p3v" data-updated="1795507237536">Modifier。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-r25l" data-updated="1795507237536">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ec80" data-updated="1795507237536">普通：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-a2xs" data-updated="1795507237536">A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-cre6" data-updated="1795507237536">可能变成：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-czdx" data-updated="1795507237536">Foil A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-gmcr" data-updated="1795507237536">+50 Chip</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-5pq8" data-updated="1795507237536">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-dxdv" data-updated="1795507237536">Glass Card</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-w7ai" data-updated="1795507237536">×</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-vgd7" data-updated="1795507237536">2</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-tevn" data-updated="1795507237536">但是可能碎掉</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-44ii" data-updated="1795507237536">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-kd36" data-updated="1795507237536">Lucky Card</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-hf9h" data-updated="1795507237536">25%</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ti9z" data-updated="1795507237536">获得金币</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-qit5" data-updated="1795507237536">也就是说：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-t5c6" data-updated="1795507237536">同样：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ykcu" data-updated="1795507237536">A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-m2u3" data-updated="1795507237536">已经不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-g25l" data-updated="1795507237536">一样的东西。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-j6jx" data-updated="1795507237536">整个牌组：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-bzbz" data-updated="1795507237536">开始变成：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-x3bx" data-updated="1795507237536">RPG。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-n41x" data-updated="1795507237536">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-cuad" data-updated="1795507237536">Poker。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-miv1" data-updated="1795507237536">第四层：Joker（真正核心）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-wr1l" data-updated="1795507237536">这一层。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-kucp" data-updated="1795507237536">我认为：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-lpqj" data-updated="1795507237536">如果删掉 Joker。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-d1ai" data-updated="1795507237536">Balatro 就不会成功。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-kumg" data-updated="1795507237536">为什么？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-03hu" data-updated="1795507237536">因为：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-5601" data-updated="1795507237536">Joker：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-27z8" data-updated="1795507237536">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-fmg8" data-updated="1795507237536">加数字。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-rygu" data-updated="1795507237536">而是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-vu7d" data-updated="1795507237536">改规则。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-4oiu" data-updated="1795507237536">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-bue0" data-updated="1795507237536">假设：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ta88" data-updated="1795507237536">普通：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-pdwe" data-updated="1795507237536">Flush</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-0fhi" data-updated="1795507237536">×</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-nwtr" data-updated="1795507237536">8</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-09ys" data-updated="1795507237536">某 Joker：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-b26q" data-updated="1795507237536">所有红桃</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-n4bx" data-updated="1795507237536">×</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-cftr" data-updated="1795507237536">2</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-lb7b" data-updated="1795507237536">另一个：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-hviy" data-updated="1795507237536">如果都是偶数</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-6k8m" data-updated="1795507237536">×</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-c5v3" data-updated="1795507237536">3</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-vzvf" data-updated="1795507237536">另一个：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-xvxr" data-updated="1795507237536">所有 Queen</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-t5ip" data-updated="1795507237536">+100 Chip</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-xsn3" data-updated="1795507237536">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-c6cr" data-updated="1795507237536">玩家开始：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-d49l" data-updated="1795507237536">构筑。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-4vqf" data-updated="1795507237536">Build。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-xfmz" data-updated="1795507237536">他开始思考：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-d3v6" data-updated="1795507237536">我是不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-zmls" data-updated="1795507237536">以后：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-78eu" data-updated="1795507237536">全部留红桃？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-cuxy" data-updated="1795507237536">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-icv0" data-updated="1795507237536">全部 Queen？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-gbc0" data-updated="1795507237536">整个游戏：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-0bb1" data-updated="1795507237536">开始：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-aqoj" data-updated="1795507237536">形成：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-fz53" data-updated="1795507237536">套路。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-9jc9" data-updated="1795507237536">Build。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-l2py" data-updated="1795507237536">这一层：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-1gy7" data-updated="1795507237536">就是 Roguelike。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-49fo" data-updated="1795507237536">第五层：Deck Building（修改整副牌）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-si9n" data-updated="1795507237536">这一步：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-zypb" data-updated="1795507237536">很多玩家：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-w4lw" data-updated="1795507237536">第一次玩：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-dhu1" data-updated="1795507237536">感觉不到。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-5l8k" data-updated="1795507237536">但是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-9deu" data-updated="1795507237536">高手：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-7bym" data-updated="1795507237536">全部都在玩这里。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-i09g" data-updated="1795507237536">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-jecg" data-updated="1795507237536">你可以：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ui9e" data-updated="1795507237536">删除：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-s0si" data-updated="1795507237536">2</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-d9pl" data-updated="1795507237536">3</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-r9nv" data-updated="1795507237536">4</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-01x9" data-updated="1795507237536">5</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-26gf" data-updated="1795507237536">增加：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-j7up" data-updated="1795507237536">A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ww28" data-updated="1795507237536">A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-pngz" data-updated="1795507237536">A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-nvmw" data-updated="1795507237536">A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-tm0f" data-updated="1795507237536">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-htpp" data-updated="1795507237536">以后：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-vv18" data-updated="1795507237536">抽到 A</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-5ixz" data-updated="1795507237536">概率：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-zie9" data-updated="1795507237536">越来越高。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-9o4p" data-updated="1795507237536">这叫：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-bfmr" data-updated="1795507237536">Deck Manipulation。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-kuh7" data-updated="1795507237536">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-94a1" data-updated="1795507237536">全部：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-e6qv" data-updated="1795507237536">删掉：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-hl3i" data-updated="1795507237536">黑桃。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-uk6e" data-updated="1795507237536">只留：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ia7n" data-updated="1795507237536">红桃。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-83o6" data-updated="1795507237536">以后：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-7n5g" data-updated="1795507237536">Flush：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-q99u" data-updated="1795507237536">概率：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-fmie" data-updated="1795507237536">暴增。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-0peg" data-updated="1795507237536">这里：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-v7cg" data-updated="1795507237536">已经：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-zr6w" data-updated="1795507237536">完全不是 Poker。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-lbh0" data-updated="1795507237536">而是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-eeki" data-updated="1795507237536">概率控制。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ktxv" data-updated="1795507237536">第六层：经济系统（Money）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-in98" data-updated="1795507237536">很多人忽略。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-te6g" data-updated="1795507237536">其实：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-2osy" data-updated="1795507237536">金币。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-2rhk" data-updated="1795507237536">决定：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-zq0d" data-updated="1795507237536">整个 Build。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-14ud" data-updated="1795507237536">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ns4u" data-updated="1795507237536">打完：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-5jnv" data-updated="1795507237536">一局。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-vefn" data-updated="1795507237536">得到：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-d05p" data-updated="1795507237536">$</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-9xib" data-updated="1795507237536">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-44b8" data-updated="1795507237536">Shop</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-dwve" data-updated="1795507237536">可以买：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-r45v" data-updated="1795507237536">Joker</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-s7m2" data-updated="1795507237536">Tarot</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-1gm9" data-updated="1795507237536">Planet</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-i2u9" data-updated="1795507237536">Voucher</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-5h8j" data-updated="1795507237536">等等。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-kbvf" data-updated="1795507237536">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-edg3" data-updated="1795507237536">金币：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-mr0n" data-updated="1795507237536">不是奖励。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-qf0w" data-updated="1795507237536">金币：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-iavm" data-updated="1795507237536">其实就是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-nlh4" data-updated="1795507237536">Build Resource。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-kubl" data-updated="1795507237536">和：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-yh9e" data-updated="1795507237536">《杀戮尖塔》的金币。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-3si4" data-updated="1795507237536">一样。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ty2x" data-updated="1795507237536">第七层：Tarot（改变牌）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-m6di" data-updated="1795507237536">Tarot：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-1n9k" data-updated="1795507237536">类似：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-sr8p" data-updated="1795507237536">法术。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-wsq0" data-updated="1795507237536">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-kas1" data-updated="1795507237536">一张牌</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-mcj3" data-updated="1795507237536">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-r7vh" data-updated="1795507237536">变 Gold Card</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-iuu8" data-updated="1795507237536">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-h84p" data-updated="1795507237536">复制</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-nw4a" data-updated="1795507237536">某张牌</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-mm88" data-updated="1795507237536">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-968l" data-updated="1795507237536">删除</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-763b" data-updated="1795507237536">某张牌</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-mhai" data-updated="1795507237536">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-87zh" data-updated="1795507237536">升级</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-m80l" data-updated="1795507237536">某张牌</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-1kty" data-updated="1795507237536">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ufya" data-updated="1795507237536">玩家：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-607p" data-updated="1795507237536">开始：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-pndj" data-updated="1795507237536">养牌。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-ke1c" data-updated="1795507237536">第八层：Planet（升级牌型）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-08u4" data-updated="1795507237536">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-jq2v" data-updated="1795507237536">一直：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-fpox" data-updated="1795507237536">打：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-q9sz" data-updated="1795507237536">Flush。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-r4it" data-updated="1795507237536">Planet：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-1676" data-updated="1795507237536">可以买：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-3adb" data-updated="1795507237536">Flush</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-49nk" data-updated="1795507237536">LV1</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-dm7w" data-updated="1795507237536">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-f1h3" data-updated="1795507237536">LV2</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-tah9" data-updated="1795507237536">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-nj3v" data-updated="1795507237536">LV3</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-c429" data-updated="1795507237536">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-4r53" data-updated="1795507237536">LV4</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-wg8s" data-updated="1795507237536">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-2may" data-updated="1795507237536">以后：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-i4za" data-updated="1795507237536">Flush：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-7xrg" data-updated="1795507237536">越来越强。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-wbjj" data-updated="1795507237536">玩家：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-x3ap" data-updated="1795507237536">开始：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-cgt7" data-updated="1795507237536">专精。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-nxju" data-updated="1795507237536">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-af2l" data-updated="1795507237536">什么都玩。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-aziq" data-updated="1795507237536">而是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6o-yt3b" data-updated="1795507237536">Build。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-95zj" data-updated="1795507237537">第九层：Boss Blind（打破套路）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-imu8" data-updated="1795507237537">如果：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-f2nw" data-updated="1795507237537">没有 Boss。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-k4zp" data-updated="1795507237537">所有玩家：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-clm7" data-updated="1795507237537">都会：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-5iqm" data-updated="1795507237537">固定打法。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-vcfn" data-updated="1795507237537">所以：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-xe1v" data-updated="1795507237537">Boss：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-sy08" data-updated="1795507237537">就是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-i375" data-updated="1795507237537">反套路。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-tp32" data-updated="1795507237537">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-m5x6" data-updated="1795507237537">Boss：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-6ew0" data-updated="1795507237537">禁止：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-nn6t" data-updated="1795507237537">Flush</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-mnma" data-updated="1795507237537">怎么办？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-esyy" data-updated="1795507237537">Build：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-s8n5" data-updated="1795507237537">废了。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-x7pf" data-updated="1795507237537">玩家：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-cpzp" data-updated="1795507237537">必须：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-4suw" data-updated="1795507237537">改变。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-82kr" data-updated="1795507237537">或者：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-a5ar" data-updated="1795507237537">Face Card</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-grzd" data-updated="1795507237537">无效</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-wdow" data-updated="1795507237537">整个：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-oq37" data-updated="1795507237537">Build：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-9egb" data-updated="1795507237537">崩掉。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-wih8" data-updated="1795507237537">于是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-w3ed" data-updated="1795507237537">玩家：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-dfg7" data-updated="1795507237537">必须：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-9u6s" data-updated="1795507237537">备用方案。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-jpj4" data-updated="1795507237537">所以：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-h3px" data-updated="1795507237537">Boss：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-fctd" data-updated="1795507237537">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-3ypg" data-updated="1795507237537">敌人。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-b5cn" data-updated="1795507237537">Boss：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-w08q" data-updated="1795507237537">其实就是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-2e4o" data-updated="1795507237537">Rule Modifier。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-56fn" data-updated="1795507237537">改变规则。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-cv2c" data-updated="1795507237537">第十层：无限循环（真正让玩家沉迷）</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ds2j" data-updated="1795507237537">这里：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-1jvh" data-updated="1795507237537">才是真正的重点。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-qwoq" data-updated="1795507237537">整个游戏：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-c3z6" data-updated="1795507237537">实际上：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-3hx0" data-updated="1795507237537">一直重复：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-vshy" data-updated="1795507237537">下面这个循环：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-0iyj" data-updated="1795507237537">开始 Run</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-4sto" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-cvc9" data-updated="1795507237537">获得 Joker</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-prma" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-zzgn" data-updated="1795507237537">形成 Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-w3ek" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-lnbe" data-updated="1795507237537">赚钱</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-gqk7" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-66k2" data-updated="1795507237537">强化牌组</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-yz2g" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-7a01" data-updated="1795507237537">得到更多 Joker</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-2e9y" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-jmke" data-updated="1795507237537">Build 更完整</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-aijm" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-7ter" data-updated="1795507237537">分数越来越高</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ipw4" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ruk6" data-updated="1795507237537">Boss 打破套路</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-tqui" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ig5l" data-updated="1795507237537">重新调整 Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-4gfg" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-8tjz" data-updated="1795507237537">越来越强</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-8two" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-rjxh" data-updated="1795507237537">通关</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-v4w3" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-dz8o" data-updated="1795507237537">下一局</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-lrz2" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-9apc" data-updated="1795507237537">新的 Joker</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-22el" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-3wxl" data-updated="1795507237537">新的 Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-9vqm" data-updated="1795507237537">↓</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-mp46" data-updated="1795507237537">新的套路</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-yfqw" data-updated="1795507237537">这就是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-w72k" data-updated="1795507237537">整个 Roguelike Loop。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-mi33" data-updated="1795507237537">为什么玩家可以玩几百小时？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-qnyc" data-updated="1795507237537">因为：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-7uop" data-updated="1795507237537">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ovll" data-updated="1795507237537">地图变化。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ol1p" data-updated="1795507237537">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-nfgq" data-updated="1795507237537">剧情变化。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-qlmv" data-updated="1795507237537">而是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-g856" data-updated="1795507237537">Build 无限变化。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-euhd" data-updated="1795507237537">举例：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-1spu" data-updated="1795507237537">第一局：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-hsk5" data-updated="1795507237537">Flush Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-n0to" data-updated="1795507237537">第二局：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-i7s9" data-updated="1795507237537">Face Card Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-6ec3" data-updated="1795507237537">第三局：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-vgch" data-updated="1795507237537">Odd Number Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ha88" data-updated="1795507237537">第四局：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-67u4" data-updated="1795507237537">Lucky Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-lgkt" data-updated="1795507237537">第五局：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-2huw" data-updated="1795507237537">Glass Card Build</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-6ov7" data-updated="1795507237537">玩法：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-3ft6" data-updated="1795507237537">完全不同。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-t9uc" data-updated="1795507237537">真正的无限，其实来自哪里？</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-oo8j" data-updated="1795507237537">很多人认为：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-rf2v" data-updated="1795507237537">因为：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-z7q4" data-updated="1795507237537">150 张 Joker。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-lpv8" data-updated="1795507237537">其实：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-bw2e" data-updated="1795507237537">不是。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-973m" data-updated="1795507237537">真正无限：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-iwcy" data-updated="1795507237537">来自：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-spmw" data-updated="1795507237537">Joker</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-vnj1" data-updated="1795507237537">之间。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-4vnk" data-updated="1795507237537">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ngmr" data-updated="1795507237537">单张。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-m31r" data-updated="1795507237537">而是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-dvmc" data-updated="1795507237537">组合。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-18zq" data-updated="1795507237537">例如：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ghfp" data-updated="1795507237537">假设：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-jhu8" data-updated="1795507237537">有：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-2b9s" data-updated="1795507237537">100 张 Joker。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-luzp" data-updated="1795507237537">两张组合：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-fu3o" data-updated="1795507237537">100 × 99</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-w9ni" data-updated="1795507237537">≈9900</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-bruu" data-updated="1795507237537">三张：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-idv8" data-updated="1795507237537">100³</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-3064" data-updated="1795507237537">≈100 万</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-z53g" data-updated="1795507237537">五张：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-j2p9" data-updated="1795507237537">就是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-77cq" data-updated="1795507237537">天文数字。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-dy6c" data-updated="1795507237537">所以：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-q3ge" data-updated="1795507237537">真正：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-77he" data-updated="1795507237537">无限。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-yb82" data-updated="1795507237537">来自：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-o1e3" data-updated="1795507237537">组合爆炸。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-ky56" data-updated="1795507237537">不是：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-qxc2" data-updated="1795507237537">内容爆炸。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-jwia" data-updated="1795507237537">如果换成你的 Emoji 项目，这里就是最值得学习的地方</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-97ew" data-updated="1795507237537">这也是我这几个月一直观察你项目之后，觉得**最值得借鉴《小丑牌》**的地方。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-4b7d" data-updated="1795507237537">我建议你不要去学习它的 Poker，而是学习它的系统结构。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-qyf6" data-updated="1795507237537">例如，可以抽象成下面这个模型：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-zgol" data-updated="1795507237537">Balatro	你的 Emoji 游戏<br>Poker（玩家认识）	Emoji（玩家认识）<br>Joker	Emoji 技能 / Emoji 特性<br>Tarot	Emoji 进化 / 合成<br>Planet	Emoji 类型升级<br>Deck	Emoji 图库 / Emoji 池<br>Boss Blind	每关特殊规则<br>Shop	Emoji 商店<br>Gold	Emoji 能量 / 金币<br>Build	Emoji 组合流派<br>无限组合	Emoji 连锁效果</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-31os" data-updated="1795507237537">注意，这张表不是让你照搬《小丑牌》，而是说明一种系统设计方法。</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-5lps" data-updated="1795507237537">最后，我认为《小丑牌》真正值得学习的，不是 Poker，而是一套可以迁移到任何主题的设计公式</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-dtrh" data-updated="1795507237537">我把它总结成下面这个公式：</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-qej6" data-updated="1795507237537">玩家熟悉的符号<br>        ↓<br>    简单核心规则<br>        ↓<br>    少量可理解的强化<br>        ↓<br>    大量可组合的效果<br>        ↓<br>    玩家开始自己发现套路<br>        ↓<br>    每局形成不同 Build<br>        ↓<br>    随机事件不断打破套路<br>        ↓<br>    玩家不断重新思考<br>        ↓<br>    获得“再来一局”的动力</p>

<p class="unidoc-block" data-block-id="b-mwuenf6p-hhvd" data-updated="1795507237537">我认为，这才是《小丑牌》真正的核心资产，也是最值得你的 Emoji 项目借鉴的地方。它证明了一件事：**长期可玩性并不来自不断增加内容，而来自规则之间能够持续产生新的、有意义的组合。**如果你的 Emoji 系统未来也能做到“少量基础规则 + 大量可组合效果 + 每局都有新的策略发现”，那么玩家讨论的将不再是“有哪些 Emoji”，而是“这一局我构筑了一套什么样的 Emoji 流派”。这正是《小丑牌》最有价值的设计启发。</p>