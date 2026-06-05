// editor.js - 封装 Monaco Editor 与 Markdown 预览逻辑
const EditorManager = {
    instance: null,
    currentLanguage: 'markdown',
    onChangeCallback: null,

    // 初始化编辑器（返回 Promise，以便 main.js 知道什么时候加载完毕）
    init() {
        return new Promise((resolve) => {
            // 配置 Monaco Loader 的路径 (指向我们在 HTML 中引入的 CDN)
            require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' } });
            
            require(['vs/editor/editor.main'], () => {
                // 创建编辑器实例并挂载到 DOM
                this.instance = monaco.editor.create(document.getElementById('editor-container'), {
                    value: '',
                    language: 'markdown',
                    theme: 'vs-light',
                    automaticLayout: true, // 【核心属性】容器大小改变时自动重排页面，省去手动调用 layout() 的麻烦
                    wordWrap: 'on',        // 自动换行
                    minimap: { enabled: false }, // 关掉小地图（我们的屏幕空间很宝贵）
                    fontSize: 15,
                    scrollBeyondLastLine: false, // 禁止滚动到最后一行下面一大截空白
                    padding: { top: 16 }
                });

                // 监听编辑器内容改变事件
                this.instance.onDidChangeModelContent(() => {
                    const val = this.instance.getValue();
                    
                    // 通知外界（main.js）内容被修改了
                    if (this.onChangeCallback) {
                        this.onChangeCallback(val);
                    }
                    
                    // 如果当前是 markdown 模式，实时更新右侧（或手机端图层）的预览
                    if (this.currentLanguage === 'markdown') {
                        this.updatePreview(val);
                    }
                });

                // 绑定手机端的预览切换按钮事件 (只有手机模式下这个按钮才可见)
                document.getElementById('btn-toggle-preview').addEventListener('click', () => {
                    const preview = document.getElementById('preview-container');
                    const btnIcon = document.querySelector('#btn-toggle-preview i');
                    
                    if (preview.classList.contains('d-none')) {
                        // 展开预览
                        preview.classList.remove('d-none');
                        btnIcon.classList.replace('fa-eye', 'fa-pen'); // 图标换成“编辑”
                    } else {
                        // 收起预览
                        preview.classList.add('d-none');
                        btnIcon.classList.replace('fa-pen', 'fa-eye'); // 图标换回“眼睛”
                    }
                });

                // 初始化完成，放行
                resolve();
            });
        });
    },

    // 核心：设置内容并根据文件后缀自动切换语言和界面布局
    setContent(content, fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        let lang = 'plaintext';
        
        if (ext === 'md') lang = 'markdown';
        else if (ext === 'json') lang = 'json';
        else if (ext === 'yaml' || ext === 'yml') lang = 'yaml';

        this.currentLanguage = lang;

        // 切换 Monaco 的语言校验和高亮模式
        monaco.editor.setModelLanguage(this.instance.getModel(), lang);
        
        // 填入内容
        this.instance.setValue(content || '');

        // 调整预览界面的显隐
        this.handlePreviewLayout(lang);
    },

    // 获取当前编辑器里的内容
    getContent() {
        return this.instance ? this.instance.getValue() : '';
    },

    // 注册回调，供 main.js 监听文件修改（打脏标记 isDirty）
    onChange(callback) {
        this.onChangeCallback = callback;
    },

    // 调用 Marked.js 解析 Markdown 并渲染
    updatePreview(text) {
        // Marked.js 会把 Markdown 转为安全的 HTML
        document.getElementById('markdown-preview').innerHTML = marked.parse(text);
    },

    // 根据文件格式处理界面布局
    handlePreviewLayout(lang) {
        const previewContainer = document.getElementById('preview-container');
        const toggleBtn = document.getElementById('btn-toggle-preview');

        if (lang === 'markdown') {
            // 如果是 MD，电脑端显示右侧半屏，手机端显示“小眼睛”切换按钮
            // 注意：手机端 previewContainer 默认加 d-none 是为了先展示代码，等点按钮再遮盖
            if (window.innerWidth > 767) {
                previewContainer.classList.remove('d-none');
            } else {
                previewContainer.classList.add('d-none'); 
            }
            toggleBtn.classList.remove('d-none');
            this.updatePreview(this.getContent());
        } else {
            // 如果是 JSON 或 YAML，双端一律隐藏预览区和小眼睛按钮，Monaco 撑满 100%
            previewContainer.classList.add('d-none');
            toggleBtn.classList.add('d-none');
        }
    }
};