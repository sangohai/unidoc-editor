// editor.js - 纯净的 Monaco Editor 引擎与 Marked.js 渲染器
const EditorManager = {
    instance: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,

    init() {
        return new Promise((resolve) => {
            // 🌟 修复点：安全地读取外部 ClipboardManager 缓存
            marked.use({
                renderer: {
                    image: (token_or_href, title, text) => {
                        let href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href;
                        let alt = typeof token_or_href === 'object' ? token_or_href.text : text;
                        let imgTitle = typeof token_or_href === 'object' ? token_or_href.title : title;
                        
                        if (href && href.startsWith('images/')) {
                            // 💥 将 window.ClipboardManager 改为 typeof 判断，完美穿透作用域读取缓存！
                            if (typeof ClipboardManager !== 'undefined' && ClipboardManager.imageCache[href]) {
                                href = ClipboardManager.imageCache[href];
                            } else {
                                href = 'notes/' + href;
                            }
                        }
                        return `<img src="${href}" alt="${alt || ''}" title="${imgTitle || ''}" class="img-fluid rounded shadow-sm" style="max-width: 100%; margin: 10px 0;">`;
                    }
                }
            });

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
                    this.updateLeftScrollThumb();
                });

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
                this.initLeftScrollZone();

                // 对接外部独立模块
                if (typeof CharPicker !== 'undefined') {
                    CharPicker.init((char) => this.insertTextAtCursor(char));
                }

                resolve();
            });
        });
    },

    // ================= 物理滑轨引擎 =================
    initLeftScrollZone() {
        const zone = document.getElementById('left-scroll-zone');
        const thumb = document.getElementById('left-scroll-thumb');
        if (!zone) return;

        let lastY = 0;
        const thumbHeight = 20; 

        zone.addEventListener('touchstart', (e) => {
            lastY = e.touches[0].clientY;
            if (thumb) thumb.classList.replace('opacity-50', 'opacity-100');
        }, { passive: true });

        zone.addEventListener('touchmove', (e) => {
            if (!this.instance) return;
            e.preventDefault(); 
            
            const currentY = e.touches[0].clientY;
            const deltaY = currentY - lastY; 
            lastY = currentY;
            
            const contentHeight = this.instance.getContentHeight();
            const layoutInfo = this.instance.getLayoutInfo();
            if (!layoutInfo || contentHeight <= layoutInfo.height) return;
            
            const viewHeight = layoutInfo.height;
            const ratio = (contentHeight - viewHeight) / (viewHeight - thumbHeight);
            
            const currentScrollTop = this.instance.getScrollTop();
            this.instance.setScrollTop(currentScrollTop + (deltaY * ratio));
        }, { passive: false });

        zone.addEventListener('touchend', () => {
            if (thumb) thumb.classList.replace('opacity-100', 'opacity-50');
        }, { passive: true });
        
        window.addEventListener('resize', () => {
            setTimeout(() => this.updateLeftScrollThumb(), 100);
        });
    },

    updateLeftScrollThumb() {
        const thumb = document.getElementById('left-scroll-thumb');
        if (!thumb || !this.instance) return;

        const contentHeight = this.instance.getContentHeight();
        const layoutInfo = this.instance.getLayoutInfo();
        if (!layoutInfo) return;
        
        const viewHeight = layoutInfo.height;
        const scrollTop = this.instance.getScrollTop();

        if (contentHeight <= viewHeight) {
            thumb.style.display = 'none';
            return;
        }

        thumb.style.display = 'block';
        
        const thumbHeight = 20; 
        const scrollAvailable = contentHeight - viewHeight;
        const scrollPct = scrollAvailable > 0 ? scrollTop / scrollAvailable : 0;
        const topPos = scrollPct * (viewHeight - thumbHeight);

        thumb.style.height = '20px';
        thumb.style.width = '20px';
        thumb.style.transform = `translateY(${topPos}px)`;
    },

    // ================= 工具栏快捷指令 =================
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