// editor.js - 纯粹的 CodeMirror 6 核心引擎 (彻底剥离 UI 层)
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
                    this.readOnlyConf.of(state.EditorState.readOnly.of(false)), // 默认可读写
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
            throw new Error("编辑器内核加载失败"); 
        }
        
        window.EditorManager = this;
    },

    // ================= 核心接口暴露 (仅供 Connector 调用) =================

    getContent() {
        return this.view ? this.view.state.doc.toString() : '';
    },

    onChange(callback) {
        this.onChangeCallback = callback;
    },

    setLanguage(lang) {
        if (!this.view) return;
        this.currentLanguage = lang;
        let langExtension = []; 
        if (lang === 'markdown' && this.CM.mdLang) langExtension = this.CM.mdLang.markdown();
        else if (lang === 'json' && this.CM.jsonLang) langExtension = this.CM.jsonLang.json();
        else if (lang === 'yaml' && this.CM.yamlLang) langExtension = this.CM.yamlLang.yaml();

        this.view.dispatch({
            effects: this.languageConf.reconfigure(langExtension)
        });
    },

    setContent(content, lang) {
        if (!this.view) return;
        this.setLanguage(lang);
        this.view.dispatch({
            changes: { from: 0, to: this.view.state.doc.length, insert: content || '' }
        });
    },

    selectAll() {
        if (!this.view) return;
        this.view.focus();
        this.view.dispatch({ selection: { anchor: 0, head: this.view.state.doc.length } });
    },

    insertTextAtCursor(text) {
        if (!this.view) return;
        this.view.focus();
        const selection = this.view.state.selection.main;
        
        this.view.dispatch({
            changes: { from: selection.from, to: selection.to, insert: text },
            selection: { anchor: selection.from + text.length }
        });

        // 括号居中黑科技
        if (text.length === 2 && ['【】','「」','《》','（）','［］','｛｝','『』','〖〗','〔〕'].includes(text)) {
            const currentSel = this.view.state.selection.main;
            this.view.dispatch({ selection: { anchor: currentSel.anchor - 1 } });
        }
    },

    applyMarkdownFormat(formatType) {
        if (!this.view) return;
        this.view.focus();
        const selection = this.view.state.selection.main;
        const selectedText = this.view.state.sliceDoc(selection.from, selection.to);
        let insertText = '';

        switch (formatType) {
            case 'bold': insertText = `**${selectedText || '加粗文字'}**`; break;
            case 'italic': insertText = `*${selectedText || '斜体文字'}*`; break;
            case 'link': insertText = `[${selectedText || '链接'}](http://)`; break;
            case 'image': insertText = `![${selectedText || '图片描述'}](http://)`; break;
            case 'code': 
                insertText = selectedText.includes('\n') ? `\n\`\`\`\n${selectedText}\n\`\`\`\n` : `\`${selectedText || '代码'}\``; 
                break;
        }

        if (insertText !== '') {
            this.view.dispatch({
                changes: { from: selection.from, to: selection.to, insert: insertText },
                selection: { anchor: selection.from + insertText.length }
            });
        }
    },

    sanitizeFormat() {
        if (!this.view) return;
        this.view.focus();
        const selection = this.view.state.selection.main;
        
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
    },

    formatCodeDocument() {
        if (!this.view) return;
        this.view.focus();
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
    },

    // 🌟 解析 Markdown 为 HTML
    togglePreview(isPreviewMode) {
        if (!this.view) return "";
        // 动态设置底层引擎是否只读
        this.view.dispatch({
            effects: this.readOnlyConf.reconfigure(this.CM.state.EditorState.readOnly.of(isPreviewMode))
        });
        
        if (isPreviewMode && this.currentLanguage === 'markdown') {
            return marked.parse(this.view.state.doc.toString());
        }
        return "";
    },

    // 为图床异步上传提供的文本替换接口
    findAndReplace(targetStr, replaceStr) {
        if (!this.view) return;
        const docStr = this.view.state.doc.toString();
        const index = docStr.indexOf(targetStr);
        if (index !== -1) {
            this.view.dispatch({
                changes: { from: index, to: index + targetStr.length, insert: replaceStr }
            });
        }
    }
};