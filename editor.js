// editor.js - 封装 Monaco Editor、Markdown 预览与快捷输入面板
const EditorManager = {
    instance: null,
    currentLanguage: 'markdown',
    isKeyboardLocked: false, 
    onChangeCallback: null,

    // 1. 基础表情与符号 (默认显示，秒开)
    emojiBase: ['😀','😂','😅','😍','🤔','😎','😭','👍','🙏','🔥','⭐','✨','💡','🎉','📌','✅','❌','⚠️','❤️','🚀','👀','🎯','⚙️','📁','📝'],
    symbolBase: ['【】','「」','《》','（）','［］','｛｝','￥','€','©','®','←','→','↑','↓','★','♥','■','▶','—','…','°','±','×','÷'],

    // 2. 扩展表情与符号 (点击 + 号后懒加载追加)
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

                this.instance.onDidChangeModelContent(() => {
                    if (this.onChangeCallback) {
                        this.onChangeCallback(this.instance.getValue());
                    }
                });

                // ================= 预览切换逻辑 =================
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

                // ================= 键盘控制锁 (加入透明遮罩逻辑) =================
                document.getElementById('btn-toggle-keyboard').addEventListener('click', () => {
                    const kbBtn = document.getElementById('btn-toggle-keyboard');
                    const glassShield = document.getElementById('editor-glass-shield');
                    
                    this.isKeyboardLocked = !this.isKeyboardLocked;
                    
                    if (this.isKeyboardLocked) {
                        // 锁定状态：盖上隐形玻璃板，编辑器设为只读
                        this.instance.updateOptions({ readOnly: true });
                        kbBtn.classList.replace('btn-outline-warning', 'btn-warning');
                        if (glassShield) glassShield.classList.remove('d-none');
                    } else {
                        // 开启状态：抽走玻璃板，解除只读，并强制唤起键盘
                        this.instance.updateOptions({ readOnly: false });
                        kbBtn.classList.replace('btn-warning', 'btn-outline-warning');
                        if (glassShield) glassShield.classList.add('d-none');
                        this.instance.focus();
                    }
                });

                this.initToolbarEvents();
                this.renderCharPanels();

                resolve();
            });
        });
    },

    // 🌟 动态渲染 Emoji 和符号下拉面板 (包含懒加载逻辑)
    renderCharPanels() {
        const emojiPanel = document.getElementById('emoji-panel');
        const symbolPanel = document.getElementById('symbol-panel');

        emojiPanel.innerHTML = '';
        symbolPanel.innerHTML = '';

        // 1. 先渲染基础列表
        this.renderList(this.emojiBase, emojiPanel);
        this.renderList(this.symbolBase, symbolPanel, true);

        // 2. 在末尾追加“加载更多”按钮
        this.renderMoreButton(emojiPanel, this.emojiExtended, false);
        this.renderMoreButton(symbolPanel, this.symbolExtended, true);
    },

    // 辅助方法：将数组渲染为按钮
    renderList(list, container, isSymbol = false) {
        list.forEach(char => {
            const btn = document.createElement('div');
            btn.className = isSymbol ? 'char-btn symbol-btn' : 'char-btn';
            btn.innerText = char;
            btn.addEventListener('click', () => this.insertTextAtCursor(char));
            container.appendChild(btn);
        });
    },

    // 辅助方法：生成“更多”按钮，并绑定懒加载事件
    renderMoreButton(container, extendedList, isSymbol) {
        const btn = document.createElement('div');
        // 加一点点深色背景凸显它是一个功能按钮
        btn.className = 'char-btn bg-secondary bg-opacity-10 text-secondary'; 
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn.title = "加载更多";
        
        btn.addEventListener('click', (e) => {
            // 阻止事件冒泡，防止点击时 Bootstrap 把下拉菜单关掉
            e.stopPropagation();
            // 点击后自己消失
            btn.remove();
            // 将扩充库追加到面板中
            this.renderList(extendedList, container, isSymbol);
        });

        container.appendChild(btn);
    },

    // 插入字符并控制光标居中
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
        const kbBtn = document.getElementById('btn-toggle-keyboard');
        const glassShield = document.getElementById('editor-glass-shield');
        const btnIcon = document.querySelector('#btn-toggle-preview i');
        const btnText = document.querySelector('#btn-toggle-preview .btn-text');
        const toolbar = document.getElementById('editor-toolbar');
        const tbMd = document.getElementById('toolbar-md');
        const tbCode = document.getElementById('toolbar-code');

        previewContainer.classList.add('d-none');
        if(btnIcon) btnIcon.classList.replace('fa-pen', 'fa-eye');
        if(btnText) btnText.innerText = '预览';
        toolbar.style.setProperty('display', 'flex', 'important');
        
        // 重置键盘锁：默认抽走玻璃，允许输入
        kbBtn.classList.remove('d-none');
        this.isKeyboardLocked = false;
        this.instance.updateOptions({ readOnly: false });
        kbBtn.classList.replace('btn-warning', 'btn-outline-warning');
        if (glassShield) glassShield.classList.add('d-none');

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