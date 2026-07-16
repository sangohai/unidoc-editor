### linux-notes        

***       

#### crunchbang ++        
crunchbangplusplus 极简Linux 发行版 基于 debian + openbox          
Home page : https://www.crunchbangplusplus.org/           

工具 | 用途 | 替代方案      

tint2 | 任務欄/面板 | polybar, i3bar             
conky | 系統監控 (CPU/內存/網絡) | bmw,neofetch            
pcmanfm | 文件管理器 | thunar, spacefm        
geany | 文字編輯器 | mousepad, leafpad         
nitrogen | 桌面壁紙管理 | feh, variety            
volumeicon | 音量控制 |    pamixer, pulsemixer           
network-manager-applet | 網絡管理 | connman, wicd         

***     

#### ArchBANG  linux       

ArchBANG is a simple live Archlinux based distribution using Labwc window manager running under Wayland. Light fast and very easy to install.         

If you find ArchBang useful, please consider supporting development through donations. See the External Links section        

https://archbang.org/


***      

#### Skywave Linux —— 为无线电极客打造的 SDR 专用 Linux 系统

Skywave Linux 是一款专门为**软件定义无线电（SDR，Software Defined Radio）**和无线电监听打造的 Linux 发行版。它集成了大量成熟的 SDR 软件、数字信号解码工具以及在线无线电资源，帮助用户快速搭建专业的无线电工作站。如果你对以下内容感兴趣：短波广播（SWL）SDR（RTL-SDR、HackRF、Airspy、SDRplay 等）航空频率监听海事通信卫星信号接收数字通信解码无线电传播分析那么 Skywave Linux 可以帮助你快速进入无线电世界，而无需从零开始配置各种软件环境。

官方网站：https://skywavelinux.com       



***       

从繁到简：Openbox 让我重新爱上 Linux 桌面

 Openbox 完美契合这些要求。它是许多极简发行版如 LXDE 的默认窗口管理器，安装 Openbox：简单到极致在 Debian 系统上，安装过程异常顺利。只需一条命令：

 sudo apt install openbox
 
 安装完成后，在登录管理器中选择 Openbox 会话即可进入。第一次登录时，屏幕保持着登录界面的背景，没有任何多余元素。这正是 Openbox 的风格——它不会主动为你装饰桌面，一切从零开始。设置壁纸Openbox 默认不带壁纸设置工具，我使用 xsetroot 命令来设置根窗口背景。
 这是一个 X11 基础工具，用于操作最底层的“根窗口”。我从色彩网站挑选了一个喜欢的十六进制颜色值，然后执行：
 xsetroot -solid "#2E3440"

效果立即显现，桌面变成统一的深色调。为了让这个设置在每次登录时自动生效，我编辑了 
~/.config/openbox/autostart 
文件，在其中添加：
xsetroot -solid "#2E3440" && 符号确保命令在后台运行，不会阻塞启动过程。
整个配置过程不到五分钟，却让桌面有了明显的个人风格。应用程序使用很多人担心窗口管理器下应用兼容性问题，实际体验完全打消了顾虑。所有已安装的图形程序都能正常运行，包括 Firefox、LibreOffice 等。右键菜单会列出常用程序，Debian 系统还会自动更新菜单内容。我安装了一个纸牌游戏 PySolFC 来测试：sudo apt install pysolfc安装后立即出现在菜单中，运行流畅。启动 Firefox 等应用时，只需在终端输入 firefox & 即可，后台运行保证终端可用。Openbox 不干涉应用程序本身的行为，它只提供最基础的窗口管理。这让我深刻体会到：很多时候，我们以为必需的桌面组件，其实只是习惯而已。添加轻量面板纯 Openbox 体验虽然纯粹，但缺少任务栏会影响多窗口管理效率。
我选择了 tint2 这款轻量面板。它体积小巧，资源占用极低，能显示已打开窗口、系统托盘和时钟等必要信息。安装并配置 tint2 后，整个桌面依然保持极简，却获得了足够的实用性。这种“按需添加”的方式，正是极简主义的精髓——只引入真正需要的东西。切换到 Openbox 后，最明显的感受是速度。在虚拟机中，启动时间大幅缩短，内存占用显著降低。桌面上没有多余的动画、通知或插件干扰，注意力能更集中在当前任务上。右键菜单调用终端非常方便，配合熟练的命令行操作，几乎所有日常工作都能高效完成。当然，初期需要适应没有全局搜索、复杂特效的界面，但一旦习惯，就会发现这种纯粹带来了难得的专注感。对于开发者或运维人员来说，这种环境特别友好。命令行是主力，图形界面仅作为辅助，Openbox 完美平衡了两者。极简哲学的更深思考这次 Openbox 实验让我重新审视 Linux 桌面的发展方向。现代桌面环境在追求易用性和美观的同时，也积累了大量冗余功能。对于追求效率的用户来说，减法往往比加法更有价值。Openbox 代表了一种哲学：把控制权还给用户，让系统保持最小必要状态。这种设计在资源受限的设备、服务器环境或虚拟化场景中尤具优势。
