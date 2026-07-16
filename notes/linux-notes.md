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
整个配置过程不到五分钟，却让桌面有了明显的个人风格。应用程序使用很多人担心窗口管理器下应用兼容性问题，实际体验完全打消了顾虑。所有已安装的图形程序都能正常运行，包括 Firefox、LibreOffice 等。右键菜单会列出常用程序，Debian 系统还会自动更新菜单内容。我安装了一个纸牌游戏 PySolFC 来测试：sudo apt install pysolfc安装后立即出现在菜单中，运行流畅。启动 Firefox 等应用时，只需在终端输入 firefox & 即可，后台运行保证终端可用。Openbox 不干涉应用程序本身的行为，它只提供最基础的窗口管理。
我选择了 tint2 这款轻量面板。它体积小巧，资源占用极低，能显示已打开窗口、系统托盘和时钟等必要信息。安装并配置 tint2 后，整个桌面依然保持极简，却获得了足够的实用性。这种“按需添加”的方式，正是极简主义的精髓——只引入真正需要的东西
