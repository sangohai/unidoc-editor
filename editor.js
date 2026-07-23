// editor.js - 纯净编辑引擎、高级命令工具栏与非线性摇杆代理
const EditorManager = {
    instance: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,
    selectionAnchor: null,

    isJoystickDragging: false,
    joystickOffset: 0,
    joystickAnimationFrame: null,

    init() {
        return new Promise((resolve) => {
            marked.setOptions({ breaks: true, gfm: true });

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
                    if (this.onChangeCallback) this.onChangeCallback(this.instance.getValue());
                    this.updateProgressBar();
                });

                this.instance.onDidScrollChange(() => {
                    this.updateProgressBar();
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
                this.initJoystickScrollZone();

                if (typeof CharPicker !== 'undefined') {
                    CharPicker.init((char) => this.insertTextAtCursor(char));
                }

                resolve();
            });
        });
    },

    // ================= 🌟 满血复活：二次方非线性加速摇杆 =================
    initJoystickScrollZone() {
        const zone = document.getElementById('left-scroll-zone');
        const joystick = document.getElementById('left-joystick-thumb');
        if (!zone || !joystick) return;

        let startY = 0;
        const maxOffset = 60; 

        const scrollLoop = () => {
            if (!this.isJoystickDragging) return;

            if (this.joystickOffset !== 0 && this.instance) {
                // 非线性加速算法：微推慢走，重推狂飙
                const pushRatio = Math.abs(this.joystickOffset) / maxOffset;
                const speed = Math.sign(this.joystickOffset) * (pushRatio * pushRatio) * 15; 
                
                const currentScrollTop = this.instance.getScrollTop();
                this.instance.setScrollTop(currentScrollTop + speed);
            }
            
            this.joystickAnimationFrame = requestAnimationFrame(scrollLoop);
        };

        zone.addEventListener('pointerdown', (e) => {
            try { zone.setPointerCapture(e.pointerId); } catch(err){} 
            
            startY = e.clientY;
            this.isJoystickDragging = true;
            this.joystickOffset = 0;

            joystick.style.transition = 'opacity 0.2s'; 
            joystick.classList.replace('opacity-50', 'opacity-100');

            if (this.joystickAnimationFrame) cancelAnimationFrame(this.joystickAnimationFrame);
            this.joystickAnimationFrame = requestAnimationFrame(scrollLoop);
        });

        zone.addEventListener('pointermove', (e) => {
            if (!this.isJoystickDragging || !this.instance) return;
            e.preventDefault(); 
            
            const currentY = e.clientY;
            let deltaY = currentY - startY;
            
            if (deltaY > maxOffset) deltaY = maxOffset;
            if (deltaY < -maxOffset) deltaY = -maxOffset;
            
            this.joystickOffset = deltaY;
            joystick.style.transform = `translateY(calc(-50% + ${deltaY}px))`;
        });

        const resetJoystick = (e) => {
            if (!this.isJoystickDragging) return;
            
            try { if (zone.hasPointerCapture(e.pointerId)) zone.releasePointerCapture(e.pointerId); } catch(err){}
            
            this.isJoystickDragging = false;
            this.joystickOffset = 0;
            if (this.joystickAnimationFrame) cancelAnimationFrame(this.joystickAnimationFrame);
            
            // 弹簧物理回弹效果
            joystick.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s';
            joystick.style.transform = 'translateY(-50%)';
            joystick.classList.replace('opacity-100', 'opacity-50');
        };

        zone.addEventListener('pointerup', resetJoystick);
        zone.addEventListener('pointercancel', resetJoystick);
    },

    updateProgressBar() {
        const bar = document.getElementById('left-progress-bar');
        const thumb = document.getElementById('left-joystick-thumb'); 
        if (!bar || !this.instance) return;

        const contentHeight = this.instance.getContentHeight();
        const layoutInfo = this.instance.getLayoutInfo();
        if (!layoutInfo) return;
        
        const viewHeight = layoutInfo.height;
        const scrollTop = this.instance.getScrollTop();

        if (contentHeight <= viewHeight) {
            bar.style.display = 'none';
            if (thumb) thumb.style.setProperty('display', 'none', 'important');
            return;
        }

        bar.style.display = 'block';
        if (thumb) thumb.style.setProperty('display', 'flex', 'important');
        
        const heightPct = viewHeight / contentHeight;
        const barHeight = Math.max(10, heightPct * viewHeight); 
        
        const scrollAvailable = contentHeight - viewHeight;
        const scrollPct = scrollAvailable > 0 ? scrollTop / scrollAvailable : 0;
        const topPos = scrollPct * (viewHeight - barHeight);

        bar.style.height = `${barHeight}px`;
        bar.style.transform = `translateY(${topPos}px)`;
    },

    // ================= 高级工具栏逻辑 =================
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
                setTimeout(() => {
                    this.instance.trigger('any', 'editor.action.quickCommand');
                }, 50);
                return;

            case 'selectAll':
                this.instance.setSelection(model.getFullModelRange());
                Toast.show('已全选文档', 'success');
                return;

            case 'setAnchor':
                this.selectionAnchor = this.instance.getPosition();
                document.getElementById('menu-select-here').classList.remove('disabled');
                Toast.show('⚑ 已标记起点！请滑动找到终点，点击「 →| 」', 'info');
                return;

            case 'selectToHere':
                if (this.selectionAnchor) {
                    const currentPos = this.instance.getPosition();
                    const range = monaco.Range.fromPositions(this.selectionAnchor, currentPos);
                    this.instance.setSelection(range);
                    
                    this.selectionAnchor = null; 
                    document.getElementById('menu-select-here').classList.add('disabled');
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
        setTimeout(() => this.updateProgressBar(), 100);
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