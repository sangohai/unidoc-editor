// editor.js - Monaco 核心引擎与高级外挂
const EditorManager = {
    instance: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,
    imageCache: {}, 

    // 🌟 新增：物理锚点选取的坐标记忆
    selectionAnchor: null,

    init() {
        return new Promise((resolve) => {
            marked.setOptions({
                breaks: true, // 保持我们之前的 GFM 换行标准
                gfm: true
            });

            marked.use({
                renderer: {
                    image: (token_or_href, title, text) => {
                        let href = typeof token_or_href === 'object' ? token_or_href.href : token_or_href;
                        let alt = typeof token_or_href === 'object' ? token_or_href.text : text;
                        let imgTitle = typeof token_or_href === 'object' ? token_or_href.title : title;
                        
                        if (href && href.startsWith('images/')) {
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
                    padding: { top: 16, bottom: 80 },       
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

    // ================= 工具栏引擎 =================
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
        document.querySelectorAll('#editor-toolbar a[data-action], #editor-toolbar button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.executeToolbarAction(btn.dataset.action);
            });
        });
    },

    executeToolbarAction(action) {
        if (!this.instance) return;

        // 💥 终极修复：无论点什么按钮，第一件事就是强行把焦点塞回编辑器！
        this.instance.focus();

        const model = this.instance.getModel();
        const selection = this.instance.getSelection();
        const selectedText = model.getValueInRange(selection);
        let insertText = '';

        switch (action) {
            case 'format':
                this.instance.getAction('editor.action.formatDocument').run();
                return;
            
            case 'commandPalette':
                // 💥 修复报错核心：给 Monaco 50毫秒的喘息时间，确认焦点后再呼出菜单！
                setTimeout(() => {
                    this.instance.trigger('any', 'editor.action.quickCommand');
                }, 50);
                return;

            case 'selectAll':
                // 全选当前文档
                this.instance.setSelection(model.getFullModelRange());
                Toast.show('已全选文档', 'success');
                return;

            case 'setAnchor':
                // 记录当前光标位置为起点
                this.selectionAnchor = this.instance.getPosition();
                Toast.show('⚑ 已标记起点！请滑动找到终点，点击「 →| 」', 'info');
                return;

            case 'selectToHere':
                if (this.selectionAnchor) {
                    const currentPos = this.instance.getPosition();
                    // 智能生成选取范围（自动判断起点终点先后顺序）
                    const range = monaco.Range.fromPositions(this.selectionAnchor, currentPos);
                    // 必须聚焦后立刻设置选中
                    this.instance.setSelection(range);
                    
                    // 用完即焚，清空锚点
                    this.selectionAnchor = null; 
                    Toast.show('🎯 区域已精准选中！', 'success');
                } else {
                    Toast.show('请先点击「 |← 」设置起点', 'warning');
                }
                return;

            case 'sanitize':
                let targetRange = selection;
                let targetText = selectedText;
                
                if (selection.isEmpty()) {
                    targetRange = model.getFullModelRange();
                    targetText = model.getValue();
                }

                let cleanText = targetText
                    .replace(/\t/g, '    ')
                    .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '')
                    .replace(/[ \t]+$/gm, '')
                    .replace(/\n{3,}/g, '\n\n');

                this.instance.executeEdits("sanitize", [{
                    range: targetRange,
                    text: cleanText,
                    forceMoveMarkers: true
                }]);
                
                Toast.show(selection.isEmpty() ? '🧼 全文格式水洗完成！' : '🧼 局部格式水洗完成！', 'success');
                return;

            // ======== Markdown 原生插入逻辑 ========
            case 'bold': insertText = `**${selectedText || '加粗文字'}**`; break;
            case 'italic': insertText = `*${selectedText || '斜体文字'}*`; break;
            case 'link': insertText = `[${selectedText || '链接'}](http://)`; break;
            case 'image': insertText = `![${selectedText || '图片描述'}](http://)`; break;
            case 'code': 
                insertText = selectedText.includes('\n') ? `\n\`\`\`\n${selectedText}\n\`\`\`\n` : `\`${selectedText || '代码'}\``; 
                break;
        }

        if (insertText !== '') {
            this.instance.executeEdits("toolbar", [{
                range: selection,
                text: insertText,
                forceMoveMarkers: true
            }]);
        }
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