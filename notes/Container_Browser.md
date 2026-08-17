###   Container_Browser  

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


