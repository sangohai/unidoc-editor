// editor.js - 封装 Monaco Editor 与 Markdown 预览逻辑
const EditorManager = {
    instance: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,

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

                // 预览/编辑 切换逻辑
                document.getElementById('btn-toggle-preview').addEventListener('click', () => {
                    const preview = document.getElementById('preview-container');
                    const btnIcon = document.querySelector('#btn-toggle-preview i');
                    const btnText = document.querySelector('#btn-toggle-preview .btn-text');
                    
                    if (preview.classList.contains('d-none')) {
                        this.updatePreview(this.getContent());
                        preview.classList.remove('d-none');
                        btnIcon.classList.replace('fa-eye', 'fa-pen');
                        if(btnText) btnText.innerText = '编辑';
                        // 隐藏工具栏
                        document.getElementById('editor-toolbar').style.setProperty('display', 'none', 'important');
                    } else {
                        preview.classList.add('d-none');
                        btnIcon.classList.replace('fa-pen', 'fa-eye');
                        if(btnText) btnText.innerText = '预览';
                        this.instance.focus();
                        // 恢复显示工具栏
                        document.getElementById('editor-toolbar').style.setProperty('display', 'flex', 'important');
                    }
                });

                // 绑定工具栏按钮事件
                this.initToolbarEvents();

                resolve();
            });
        });
    },

    // 绑定顶部工具栏事件
    initToolbarEvents() {
        document.querySelectorAll('#editor-toolbar button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.executeToolbarAction(btn.dataset.action);
            });
        });
    },

    // 执行具体的工具栏指令
    executeToolbarAction(action) {
        if (!this.instance) return;

        // 格式化 JSON/YAML
        if (action === 'format') {
            this.instance.getAction('editor.action.formatDocument').run();
            return;
        }

        // 处理 Markdown 插入逻辑
        const selection = this.instance.getSelection();
        const model = this.instance.getModel();
        const selectedText = model.getValueInRange(selection);
        let insertText = '';

        switch (action) {
            case 'bold': insertText = `**${selectedText || '加粗文字'}**`; break;
            case 'italic': insertText = `*${selectedText || '斜体文字'}*`; break;
            case 'link': insertText = `[${selectedText || '链接描述'}](http://)`; break;
            case 'image': insertText = `![${selectedText || '图片描述'}](http://)`; break;
            case 'code': 
                insertText = selectedText.includes('\n') ? 
                    `\n\`\`\`\n${selectedText}\n\`\`\`\n` : 
                    `\`${selectedText || '代码'}\``; 
                break;
        }

        // 利用 Monaco 官方 API 插入文字并保留撤销历史
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
        const btnIcon = document.querySelector('#btn-toggle-preview i');
        const btnText = document.querySelector('#btn-toggle-preview .btn-text');
        
        // 控制工具栏显示逻辑
        const toolbar = document.getElementById('editor-toolbar');
        const tbMd = document.getElementById('toolbar-md');
        const tbCode = document.getElementById('toolbar-code');

        previewContainer.classList.add('d-none');
        if(btnIcon) btnIcon.classList.replace('fa-pen', 'fa-eye');
        if(btnText) btnText.innerText = '预览';
        
        // 显示工具栏总容器
        toolbar.style.setProperty('display', 'flex', 'important');

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