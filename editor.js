// editor.js - 封装 Monaco Editor、Markdown 预览与快捷输入面板
const EditorManager = {
    instance: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,

    emojiBase: ['😀','😂','😅','😍','🤔','😎','😭','👍','🙏','🔥','⭐','✨','💡','🎉','📌','✅','❌','⚠️','❤️','🚀','👀','🎯','⚙️','📁','📝'],
    symbolBase: ['【】','「」','《》','（）','［］','｛｝','￥','€','©','®','←','→','↑','↓','★','♥','■','▶','—','…','°','±','×','÷'],

    emojiExtended: ['😁','😆','😉','😊','😇','🥰','🤩','😘','😜','🤪','🤫','🤭','🧐','🤓','😈','👻','👽','🤖','💩','💀','🐒','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🍎','🍊','🍋','🍉','🍇','🍓','🍔','🍕','🍟','🌭','🍿','🍩','🧊','🍹','☕','⚽','🏀','🏈','⚾','🎾','🚗','🚕','🚙','🚌','🚎','✈️','🚢','⌚','📱','💻','⌨️','🖥️','🖱️','🖨️','📷','📺','📻','🧭','⏱️','⌛','⏳','⚖️','🧲','🧪','🧬','🔬','🔭','📡','💉','💊','🚪','🛏️','🛋️','🚽','🚿','🛁','🛒','🚬','⚰️','⚱️'],
    symbolExtended: ['『』','〖〗','〔〕','‖','｜','～','℃','℉','‰','§','№','℡','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','❶','❷','❸','❹','❺','❻','❼','❽','❾','❿','≈','≡','≠','＝','≤','≥','＜','＞','≮','≯','∷','±','＋','－','×','÷','／','∫','∮','∝','∞','∧','∨','∑','∏','∪','∩','∈','∵','∴','⊥','∥','∠','⌒','⊙','≌','∽','√','♂','♀','♠','♣','♦','♤','♡','♢','♧','♨','♩','♪','♫','♬','♭','♮','♯'],

    init() {
        return new Promise((resolve) => {
            require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' } });
            
            require(['vs/editor/editor.main'], () => {
                this.instance = monaco.editor.create(document.getElementById('editor-container'), {
                    value: '',
                    language: 'markdown',
                    theme: 'vs-light',
                    automaticLayout: true, 
                    wordWrap: 'on',
                    minimap: { enabled: false }, 
                    fontSize: 15,
                    lineHeight: 26,             
                    scrollBeyondLastLine: false,
                    padding: { top: 16 },       
                    cursorBlinking: 'smooth',   
                    formatOnPaste: true,        
                    renderWhitespace: 'selection'
                });

                // 监听内容改变
                this.instance.onDidChangeModelContent(() => {
                    if (this.onChangeCallback) {
                        this.onChangeCallback(this.instance.getValue());
                    }
                    this.updateLeftScrollThumb(); // 内容改变可能导致高度变化，刷新滑块
                });

                // 🌟 核心：监听 Monaco 的原生滚动事件，实时同步我们左侧的滑块
                this.instance.onDidScrollChange(() => {
                    this.updateLeftScrollThumb();
                });

                // ================= 预览模式切换 =================
                document.getElementById('btn-toggle-preview').addEventListener('click', () => {
                    const preview = document.getElementById('preview-container');
                    const btnIcon = document.querySelector('#btn-toggle-preview i');
                    const btnText = document.querySelector('#btn-toggle-preview .btn-text');
                    const toolbar = document.getElementById('editor-toolbar');
                    
                    if (preview.classList.contains('d-none')) {
                        this.updatePreview(this.getContent());
                        preview.classList.remove('d-none');
                        btnIcon.classList.replace('fa-eye', 'fa-pen');
                        if(btnText) btnText.innerText = '编辑';
                        toolbar.style.setProperty('display', 'none', 'important');
                    } else {
                        preview.classList.add('d-none');
                        btnIcon.classList.replace('fa-pen', 'fa-eye');
                        if(btnText) btnText.innerText = '预览';
                        this.instance.focus();
                        toolbar.style.setProperty('display', 'flex', 'important');
                    }
                });

                this.initToolbarEvents();
                this.renderCharPanels();
                
                // 初始化左侧滑轨引擎
                this.initLeftScrollZone();

                resolve();
            });
        });
    },

    // 🌟 左侧专属滑轨滑动逻辑
    initLeftScrollZone() {
        const zone = document.getElementById('left-scroll-zone');
        const thumb = document.getElementById('left-scroll-thumb');
        if (!zone) return;

        let lastY = 0;

        zone.addEventListener('touchstart', (e) => {
            lastY = e.touches[0].clientY;
            // 手指按上去时，滑块变深色高亮显示
            if (thumb) thumb.classList.replace('opacity-25', 'opacity-75');
        }, { passive: true });

        zone.addEventListener('touchmove', (e) => {
            if (!this.instance) return;
            e.preventDefault(); 
            
            const currentY = e.touches[0].clientY;
            const deltaY = lastY - currentY;
            lastY = currentY;
            
            const currentScrollTop = this.instance.getScrollTop();
            this.instance.setScrollTop(currentScrollTop + deltaY);
        }, { passive: false });

        zone.addEventListener('touchend', () => {
            // 手指离开时，滑块恢复半透明
            if (thumb) thumb.classList.replace('opacity-75', 'opacity-25');
        }, { passive: true });
        
        // 窗口大小变化时，重新计算滑块
        window.addEventListener('resize', () => {
            setTimeout(() => this.updateLeftScrollThumb(), 100);
        });
    },

    // 🌟 动态计算并更新左侧滑块的位置与高度
    updateLeftScrollThumb() {
        const thumb = document.getElementById('left-scroll-thumb');
        if (!thumb || !this.instance) return;

        const contentHeight = this.instance.getContentHeight();
        const layoutInfo = this.instance.getLayoutInfo();
        if (!layoutInfo) return;
        
        const viewHeight = layoutInfo.height;
        const scrollTop = this.instance.getScrollTop();

        // 如果内容还没一屏幕高，隐藏滑块
        if (contentHeight <= viewHeight) {
            thumb.style.display = 'none';
            return;
        }

        thumb.style.display = 'block';
        
        // 1. 计算滑块的动态高度（最小 30px，防太短点不到）
        const heightPct = viewHeight / contentHeight;
        const thumbHeight = Math.max(30, heightPct * viewHeight); 
        
        // 2. 计算滑块的具体 Y 轴偏移量
        const scrollAvailable = contentHeight - viewHeight;
        const scrollPct = scrollAvailable > 0 ? scrollTop / scrollAvailable : 0;
        const topPos = scrollPct * (viewHeight - thumbHeight);

        // 应用样式 (利用 transform 的 GPU 硬件加速，保证绝对丝滑)
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translateY(${topPos}px)`;
    },

    // ======== 下方是工具栏渲染及其他业务逻辑 (维持不变) ========
    renderCharPanels() {
        const emojiPanel = document.getElementById('emoji-panel');
        const symbolPanel = document.getElementById('symbol-panel');

        emojiPanel.innerHTML = '';
        symbolPanel.innerHTML = '';

        this.renderList(this.emojiBase, emojiPanel);
        this.renderList(this.symbolBase, symbolPanel, true);

        this.renderMoreButton(emojiPanel, this.emojiExtended, false);
        this.renderMoreButton(symbolPanel, this.symbolExtended, true);
    },

    renderList(list, container, isSymbol = false) {
        list.forEach(char => {
            const btn = document.createElement('div');
            btn.className = isSymbol ? 'char-btn symbol-btn' : 'char-btn';
            btn.innerText = char;
            btn.addEventListener('click', () => this.insertTextAtCursor(char));
            container.appendChild(btn);
        });
    },

    renderMoreButton(container, extendedList, isSymbol) {
        const btn = document.createElement('div');
        btn.className = 'char-btn bg-secondary bg-opacity-10 text-secondary'; 
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn.title = "加载更多";
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            btn.remove();
            this.renderList(extendedList, container, isSymbol);
        });

        container.appendChild(btn);
    },

    insertTextAtCursor(text) {
        if (!this.instance) return;
        const selection = this.instance.getSelection();
        
        this.instance.executeEdits("toolbar", [{
            range: selection,
            text: text,
            forceMoveMarkers: true
        }]);

        if (text.length === 2 && ['【】','「」','《》','（）','［］','｛｝','『』','〖〗','〔〕'].includes(text)) {
            const position = this.instance.getPosition();
            this.instance.setPosition({ lineNumber: position.lineNumber, column: position.column - 1 });
        }
        this.instance.focus();
    },

    initToolbarEvents() {
        document.querySelectorAll('#editor-toolbar button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.executeToolbarAction(btn.dataset.action);
            });
        });
    },

    executeToolbarAction(action) {
        if (!this.instance) return;

        if (action === 'format') {
            this.instance.getAction('editor.action.formatDocument').run();
            return;
        }

        const selection = this.instance.getSelection();
        const model = this.instance.getModel();
        const selectedText = model.getValueInRange(selection);
        let insertText = '';

        switch (action) {
            case 'bold': insertText = `**${selectedText || '加粗文字'}**`; break;
            case 'italic': insertText = `*${selectedText || '斜体文字'}*`; break;
            case 'link': insertText = `[${selectedText || '链接'}](http://)`; break;
            case 'image': insertText = `![${selectedText || '图片描述'}](http://)`; break;
            case 'code': 
                insertText = selectedText.includes('\n') ? `\n\`\`\`\n${selectedText}\n\`\`\`\n` : `\`${selectedText || '代码'}\``; 
                break;
        }

        this.instance.executeEdits("toolbar", [{
            range: selection,
            text: insertText,
            forceMoveMarkers: true
        }]);
        this.instance.focus();
    },

    setContent(content, fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        let lang = 'plaintext';
        
        if (ext === 'md') lang = 'markdown';
        else if (ext === 'json') lang = 'json';
        else if (ext === 'yaml' || ext === 'yml') lang = 'yaml';
        else if (ext === 'txt') lang = 'plaintext';

        this.currentLanguage = lang;
        monaco.editor.setModelLanguage(this.instance.getModel(), lang);
        this.instance.setValue(content || '');

        this.handlePreviewLayout(lang);
        
        // 文件加载完毕后，初始化滑块
        setTimeout(() => this.updateLeftScrollThumb(), 100);
    },

    getContent() {
        return this.instance ? this.instance.getValue() : '';
    },

    onChange(callback) {
        this.onChangeCallback = callback;
    },

    updatePreview(text) {
        document.getElementById('markdown-preview').innerHTML = marked.parse(text);
    },

    handlePreviewLayout(lang) {
        const previewContainer = document.getElementById('preview-container');
        const toggleBtn = document.getElementById('btn-toggle-preview');
        const btnIcon = document.querySelector('#btn-toggle-preview i');
        const btnText = document.querySelector('#btn-toggle-preview .btn-text');
        const toolbar = document.getElementById('editor-toolbar');
        const tbMd = document.getElementById('toolbar-md');
        const tbCode = document.getElementById('toolbar-code');

        previewContainer.classList.add('d-none');
        if(btnIcon) btnIcon.classList.replace('fa-pen', 'fa-eye');
        if(btnText) btnText.innerText = '预览';
        toolbar.style.setProperty('display', 'flex', 'important');
        
        this.instance.updateOptions({ readOnly: false });

        if (lang === 'markdown') {
            toggleBtn.classList.remove('d-none');
            tbMd.classList.replace('d-none', 'd-flex');
            tbCode.classList.replace('d-flex', 'd-none');
        } else {
            toggleBtn.classList.add('d-none');
            tbMd.classList.replace('d-flex', 'd-none');
            tbCode.classList.replace('d-none', 'd-flex');
        }
    }
};