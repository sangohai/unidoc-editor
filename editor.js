// editor.js - 纯净的 CodeMirror 6 核心引擎 (极致解耦版)
const EditorManager = {
    view: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,
    imageCache: {}, 
    selectionAnchor: null,

    languageConf: null,
    readOnlyConf: null,
    syntaxHighlightConf: null, 
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
            const highlight = await import('https://esm.sh/@lezer/highlight@1.2.0');

            this.CM = { state, view, language, commands, mdLang, jsonLang, yamlLang, highlight };
            this.languageConf = new state.Compartment();
            this.readOnlyConf = new state.Compartment();
            this.syntaxHighlightConf = new state.Compartment(); 

            const editorState = state.EditorState.create({
                doc: "",
                extensions: [
                    view.lineNumbers(),
                    view.highlightActiveLineGutter(),
                    language.foldGutter(), 
                    view.drawSelection(),
                    view.dropCursor(),
                    state.EditorState.allowMultipleSelections.of(true),
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
                    this.readOnlyConf.of(state.EditorState.readOnly.of(false)),
                    this.syntaxHighlightConf.of(language.syntaxHighlighting(language.defaultHighlightStyle, {fallback: true})),
                    
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

    setSyntaxTheme(themeName) {
        if (!this.view || !this.CM.language) return;
        const { tags: t } = this.CM.highlight;
        const { HighlightStyle, syntaxHighlighting, defaultHighlightStyle } = this.CM.language;
        let selectedThemeExt;

        if (themeName === 'warm') {
            const warmStyle = HighlightStyle.define([
                { tag: t.heading, color: "#d9534f", fontWeight: "bold" },
                { tag: t.strong, color: "#8b0000", fontWeight: "bold" },
                { tag: t.emphasis, fontStyle: "italic", color: "#d2691e" },
                { tag: t.link, color: "#28a745", textDecoration: "underline" },
                { tag: t.comment, color: "#8a6d3b", fontStyle: "italic" },
                { tag: t.keyword, color: "#c7254e", fontWeight: "bold" },
                { tag: t.string, color: "#31708f" }
            ]);
            selectedThemeExt = syntaxHighlighting(warmStyle);
        } else if (themeName === 'hacker') {
            const hackerStyle = HighlightStyle.define([
                { tag: t.heading, color: "#00ff00", fontWeight: "bold", textShadow: "0 0 5px #00ff00" },
                { tag: t.strong, color: "#ffff00", fontWeight: "bold" },
                { tag: t.emphasis, fontStyle: "italic", color: "#00ffff" },
                { tag: t.link, color: "#ff00ff", textDecoration: "underline" },
                { tag: t.comment, color: "#008800", fontStyle: "italic" },
                { tag: t.keyword, color: "#ff0000", fontWeight: "bold" },
                { tag: t.string, color: "#00ff00" }
            ]);
            selectedThemeExt = syntaxHighlighting(hackerStyle);
        } else {
            selectedThemeExt = syntaxHighlighting(defaultHighlightStyle, {fallback: true});
        }

        this.view.dispatch({ effects: this.syntaxHighlightConf.reconfigure(selectedThemeExt) });
    },

    undo() {
        if (!this.view || !this.CM.commands) return;
        this.CM.commands.undo(this.view);
        this.view.focus();
    },

    redo() {
        if (!this.view || !this.CM.commands) return;
        this.CM.commands.redo(this.view);
        this.view.focus();
    },

    getContent() { return this.view ? this.view.state.doc.toString() : ''; },
    onChange(callback) { this.onChangeCallback = callback; },

    setLanguage(lang) {
        if (!this.view) return;
        this.currentLanguage = lang;
        let langExtension = []; 
        if (lang === 'markdown' && this.CM.mdLang) langExtension = this.CM.mdLang.markdown();
        else if (lang === 'json' && this.CM.jsonLang) langExtension = this.CM.jsonLang.json();
        else if (lang === 'yaml' && this.CM.yamlLang) langExtension = this.CM.yamlLang.yaml();

        this.view.dispatch({ effects: this.languageConf.reconfigure(langExtension) });
    },

    setContent(content, lang) {
        if (!this.view) return;
        this.setLanguage(lang);
        this.view.dispatch({
            changes: { from: 0, to: this.view.state.doc.length, insert: content || '' }
        });
        
        this.handlePreviewLayout(lang);
    },

    selectAll() {
        if (!this.view) return;
        this.view.focus();
        this.view.dispatch({ selection: { anchor: 0, head: this.view.state.doc.length } });
        Toast.show('已全选文档', 'success');
    },

    setAnchor() {
        if (!this.view) return;
        this.selectionAnchor = this.view.state.selection.main.head;
        document.getElementById('menu-select-here')?.classList.remove('disabled');
        Toast.show('⚑ 已标记起点！请点击「 →| 」', 'info');
    },

    selectToHere() {
        if (!this.view) return;
        if (this.selectionAnchor !== null) {
            const currentPos = this.view.state.selection.main.head;
            this.view.dispatch({ selection: { anchor: this.selectionAnchor, head: currentPos } });
            this.view.focus();
            this.selectionAnchor = null; 
            document.getElementById('menu-select-here')?.classList.add('disabled');
            Toast.show('🎯 区域已精准选中！', 'success');
        } else {
            Toast.show('请先点击「 |← 」设置起点', 'warning');
        }
    },

    insertTextAtCursor(text) {
        if (!this.view) return;
        this.view.focus();
        const selection = this.view.state.selection.main;
        this.view.dispatch({
            changes: { from: selection.from, to: selection.to, insert: text },
            selection: { anchor: selection.from + text.length }
        });
        if (text.length === 2 && ['【】','「」','《》','（）','［］','｛｝','『』','〖〗','〔〕'].includes(text)) {
            const currentSel = this.view.state.selection.main;
            this.view.dispatch({ selection: { anchor: currentSel.anchor - 1 } });
        }
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
            this.view.dispatch({ changes: { from: index, to: index + targetStr.length, insert: replaceStr } });
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
            case 'code': insertText = selectedText.includes('\n') ? `\n\`\`\`\n${selectedText}\n\`\`\`\n` : `\`${selectedText || '代码'}\``; break;
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

        let cleanText = targetText.replace(/\t/g, '    ').replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');

        this.view.dispatch({ changes: { from: targetFrom, to: targetTo, insert: cleanText } });
        Toast.show(selection.empty ? '🧼 全文格式水洗完成！' : '🧼 局部格式水洗完成！', 'success');
    },

    formatCodeDocument() {
        if (!this.view) return;
        this.view.focus();
        if (this.currentLanguage === 'json') {
            try {
                const formatted = JSON.stringify(JSON.parse(this.view.state.doc.toString()), null, 4);
                this.view.dispatch({ changes: { from: 0, to: this.view.state.doc.length, insert: formatted } });
                Toast.show('JSON 排版完成', 'success');
            } catch (e) {
                Toast.show('JSON 格式错误，无法排版', 'error');
            }
        }
    },

    foldAll() {
        if (!this.view || !this.CM.language) return;
        this.CM.language.foldAll(this.view);
        Toast.show('已折叠所有代码与标题', 'success');
    },

    unfoldAll() {
        if (!this.view || !this.CM.language) return;
        this.CM.language.unfoldAll(this.view);
        Toast.show('已展开所有层级', 'success');
    },

    optimizePrompt() {
        if (!this.view) return;
        this.view.focus();
        const selection = this.view.state.selection.main;
        let pFrom = selection.empty ? 0 : selection.from;
        let pTo = selection.empty ? this.view.state.doc.length : selection.to;
        let pText = this.view.state.sliceDoc(pFrom, pTo);

        const stopWordsRegex = /(请帮我|帮我|麻烦你|能不能|可不可以|请|的|了|啊|呢|吧|一下|那个|这个)/g;
        let optimizedText = pText.replace(stopWordsRegex, '');
        optimizedText = optimizedText.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n');

        this.view.dispatch({ changes: { from: pFrom, to: pTo, insert: optimizedText } });
        Toast.show('✨ Prompt 提纯完成！', 'success');
    },

    togglePreview(isPreviewMode) {
        if (!this.view) return "";
        this.view.dispatch({
            effects: this.readOnlyConf.reconfigure(this.CM.state.EditorState.readOnly.of(isPreviewMode))
        });
        if (isPreviewMode && this.currentLanguage === 'markdown') {
            return marked.parse(this.view.state.doc.toString());
        }
        return "";
    },

    // 💥 修复点：彻底放弃干扰 ToolbarManager 的显隐，只传达格式变更通知
    handlePreviewLayout(lang) {
        const previewContainer = document.getElementById('preview-container');
        const toggleBtn = document.getElementById('btn-toggle-preview');
        const btnIcon = document.querySelector('#btn-toggle-preview i');
        const btnText = document.querySelector('#btn-toggle-preview .btn-text');

        previewContainer.classList.add('d-none');
        if(btnIcon) btnIcon.classList.replace('fa-pen', 'fa-eye');
        if(btnText) btnText.innerText = '预览';
        
        if (this.view) {
            this.view.dispatch({
                effects: this.readOnlyConf.reconfigure(this.CM.state.EditorState.readOnly.of(false))
            });
        }

        if (lang === 'markdown') {
            toggleBtn.classList.remove('d-none');
        } else {
            toggleBtn.classList.add('d-none');
        }

        if (typeof ToolbarManager !== 'undefined') {
            ToolbarManager.updateForLanguage(lang);
        }
    }
};