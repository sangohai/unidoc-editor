###   Container_Browser  ：

Application Blueprint
│
├── UI
│   ├── Panel
│   ├── Button
│   ├── Canvas
│   └── Input
│
├── State
│
├── Behavior
│
├── Data
│
└── Capabilities

不是「用 HTML/CSS/JavaScript 控制 Blink」，而是「用標準化的 Application Blueprint 告訴 Browser 這個 Container 是什麼，Browser 再利用 Blink/V8 將其中的 HTML/CSS/JavaScript 組裝成正在運行的 Application」。

Browser
   │
   ▼
Application Model
   │
   ├──────────────┐
   ▼              ▼
 Blink            V8
   │              │
 UI              JS
   │              │
   └───────┬──────┘
           ▼
       Application

***

1 - 使用 PWA 建立一個優先適配手機端的 即時的 金融 board 使用多個不同的 msg -box 顯示，美股大盤資訊，黃金走勢，加密貨幣走勢，期權資訊，這些 msg-box 可以根據需求增加或者減少；

2 - 使用 html + bootstrap 的技術組合來構建前端的UI ，每個 msg-box 都可以折疊和展開，也可以關閉；msg-box 可以拖拽自由排列；

3 - 增加一個可以打開 手機前後 攝像頭的 msg-box 用於記錄和分析金融市場的視頻，視頻使用分段記錄2-3分鐘一段按順序記錄，後期可以導出使用和剪接，使用 OPFS 儲存，可以手動刪除確保不會佔用大量的應用存儲；
攝像的控制按鈕：［  🔘前攝像頭 🔘後置攝像頭🔘開始錄影🔘停止錄影🔘導出視頻  ］

