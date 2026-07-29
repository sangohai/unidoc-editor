// editor.js - 纯净的 CodeMirror 6 核心引擎 (极致解耦版)
const EditorManager = {
    view: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,
    imageCache: {}, 

    languageConf: null,
    readOnlyConf: null,
    CM: {}, 

    async init() {
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

        try {
            const state = await import('https://esm.sh/@codemirror/state@6.4.0');
            const view = await import('https://esm.sh/@codemirror/view@6.34.1?deps=@codemirror/state@6.4.0');
            const language = await import('https://esm.sh/@codemirror/language@6.10.1?deps=@codemirror/state@6.4.0,@codemirror/view@6.34.1');
            const commands = await import('https://esm.sh/@codemirror/commands@6.7.0?deps=@codemirror/state@6.4.0,@codemirror/view@6.34.1');
            const mdLang = await import('https://esm.sh/@codemirror/lang-markdown@6.3.0?deps=@codemirror/state@6.4.0,@codemirror/view@6.34.1,@codemirror/language@6.10.1');
            const jsonLang = await import('https://esm.sh/@codemirror/lang-json@6.0.1?deps=@codemirror/state@6.4.0,@codemirror/view@6.34.1,@codemirror/language@6.10.1');
            const yamlLang = await import('https://esm.sh/@codemirror/lang-yaml@6.1.1?deps=@codemirror/state@6.4.0,@codemirror/view@6.34.1,@codemirror/language@6.10.1');

            this.CM = { state, view, language, commands, mdLang, jsonLang, yamlLang };
            this.languageConf = new state.Compartment();
            this.readOnlyConf = new state.Compartment();

            const editorState = state.EditorState.create({
                doc: "",
                extensions: [
                    view.lineNumbers(),
                    view.highlightActiveLineGutter(),
                    language.foldGutter(),
                    view.drawSelection(),
                    view.dropCursor(),
                    state.EditorState.allowMultipleSelections.of(true),
                    language.syntaxHighlighting(language.defaultHighlightStyle, {fallback: true}),
                    language.bracketMatching(),
                    view.rectangularSelection(),
                    view.crosshairCursor(),
                    view.highlightActiveLine(),
                    commands.history(),
                    view.keymap.of([
                        ...commands.defaultKeymap,
                        ...commands.historyKeymap,
                    ]),
                    this.languageConf.of(mdLang.markdown()),
                    this.readOnlyConf.of(state.EditorState.readOnly.of(true)),
                    view.EditorView.lineWrapping,
                    view.EditorView.theme({
                        ".cm-content": { paddingBottom: "100px" }
                    }),
                    view.EditorView.updateListener.of((update) => {
                        if (update.docChanged && this.onChangeCallback) {
                            this.onChangeCallback(update.state.doc.toString());
                        }
                    })
                ]
            });

            this.view = new view.EditorView({
                state: editorState,
                parent: document.getElementById('editor-container')
            });

        } catch (e) {
            console.error("CodeMirror 6 加载失败:", e);
            Toast.show("编辑器内核加载失败，请检查网络", "error");
            return; 
        }

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
                this.view.focus();
                toolbar.style.setProperty('display', 'flex', 'important');
            }
        });

        this.initToolbarEvents();
        
        if (typeof CharPicker !== 'undefined') {
            CharPicker.init((char) => this.insertTextAtCursor(char));
        }

        window.EditorManager = this;
    },

    // ================= CM6 专属操作接口 =================
    insertTextAtCursor(text) {
        if (!this.view) return;
        this.replaceSelection(text);
        if (text.length === 2 && ['【】','「」','《》','（）','［］','｛｝','『』','〖〗','〔〕'].includes(text)) {
            const selection = this.view.state.selection.main;
            this.view.dispatch({ selection: { anchor: selection.anchor - 1 } });
        }
        this.view.focus();
    },

    replaceSelection(text) {
        if (!this.view) return;
        const selection = this.view.state.selection.main;
        this.view.dispatch({
            changes: { from: selection.from, to: selection.to, insert: text },
            selection: { anchor: selection.from + text.length }
        });
    },

    findAndReplace(targetStr, replaceStr) {
        if (!this.view) return;
        const docStr = this.view.state.doc.toString();
        const index = docStr.indexOf(targetStr);
        if (index !== -1) {
            this.view.dispatch({
                changes: { from: index, to: index + targetStr.length, insert: replaceStr }
            });
        }
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
        if (!this.view) return;
        this.view.focus();

        const selection = this.view.state.selection.main;
        const selectedText = this.view.state.sliceDoc(selection.from, selection.to);
        let insertText = '';

        switch (action) {
            case 'format':
                if (this.currentLanguage === 'json') {
                    try {
                        const formatted = JSON.stringify(JSON.parse(this.view.state.doc.toString()), null, 4);
                        this.view.dispatch({
                            changes: { from: 0, to: this.view.state.doc.length, insert: formatted }
                        });
                        Toast.show('JSON 排版完成', 'success');
                    } catch (e) {
                        Toast.show('JSON 格式错误，无法排版', 'error');
                    }
                } else {
                    Toast.show('原生排版目前仅支持 JSON 格式', 'info');
                }
                return;

            case 'selectAll':
                this.view.dispatch({ selection: { anchor: 0, head: this.view.state.doc.length } });
                Toast.show('已全选文档', 'success');
                return;

            case 'sanitize':
                let targetFrom = selection.empty ? 0 : selection.from;
                let targetTo = selection.empty ? this.view.state.doc.length : selection.to;
                let targetText = this.view.state.sliceDoc(targetFrom, targetTo);

                let cleanText = targetText
                    .replace(/\t/g, '    ')
                    .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '')
                    .replace(/[ \t]+$/gm, '')
                    .replace(/\n{3,}/g, '\n\n');

                this.view.dispatch({
                    changes: { from: targetFrom, to: targetTo, insert: cleanText }
                });
                Toast.show(selection.empty ? '🧼 全文格式水洗完成！' : '🧼 局部格式水洗完成！', 'success');
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
            this.replaceSelection(insertText);
        }
    },

    setContent(content, fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        let lang = 'plaintext';
        let langExtension = []; 
        
        if (ext === 'md') {
            lang = 'markdown';
            if(this.CM.mdLang) langExtension = this.CM.mdLang.markdown();
        } else if (ext === 'json') {
            lang = 'json';
            if(this.CM.jsonLang) langExtension = this.CM.jsonLang.json();
        } else if (ext === 'yaml' || ext === 'yml') {
            lang = 'yaml';
            if(this.CM.yamlLang) langExtension = this.CM.yamlLang.yaml();
        } else if (ext === 'txt') {
            lang = 'plaintext';
        }

        this.currentLanguage = lang;
        
        if (this.view) {
            this.view.dispatch({
                changes: { from: 0, to: this.view.state.doc.length, insert: content || '' }
            });
            this.view.dispatch({
                effects: this.languageConf.reconfigure(langExtension)
            });
        }

        this.handlePreviewLayout(lang);
    },

    getContent() {
        return this.view ? this.view.state.doc.toString() : '';
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
        
        if (this.view) {
            this.view.dispatch({
                effects: this.readOnlyConf.reconfigure(this.CM.state.EditorState.readOnly.of(false))
            });
        }

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