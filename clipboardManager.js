// clipboardManager.js - 专属剪贴板拦截、图床上传与隐私清洗中心
const ClipboardManager = {
    editorMgr: null,
    imageCache: {}, // 瞬时记忆缓存池，解决本地渲染 404

    init(EditorManagerInstance) {
        this.editorMgr = EditorManagerInstance;
        this.bindEvents();
    },

    bindEvents() {
        // 1. 全局监听粘贴事件 (Capture 捕获阶段截胡)
        document.addEventListener('paste', (e) => this.handlePaste(e), true);

        // 2. 绑定工具栏按钮：查看剪贴板
        document.getElementById('btn-view-clipboard')?.addEventListener('click', () => this.viewClipboard());

        // 3. 绑定工具栏按钮：粉碎剪贴板
        document.getElementById('btn-shred-clipboard')?.addEventListener('click', () => this.shredClipboard());
        
        // 4. Modal 里的直接粉碎按钮
        document.getElementById('btn-modal-shred')?.addEventListener('click', () => {
            this.shredClipboard();
            bootstrap.Modal.getInstance(document.getElementById('clipboardModal')).hide();
        });
    },

    // ================= 核心拦截逻辑 =================
    handlePaste(e) {
        const instance = this.editorMgr.instance;
        if (!instance || !instance.hasTextFocus()) return;

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        let hasImage = false;

        // 图床拦截：只在 Markdown 模式触发
        if (this.editorMgr.currentLanguage === 'markdown') {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image/') === 0) {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    const file = items[i].getAsFile();
                    this.uploadImageToGitHub(file, instance);
                    hasImage = true;
                    break; 
                }
            }
        }

        // 隐私清洗：如果没有图，检查是否有隐形追踪符
        if (!hasImage) {
            const plainText = clipboardData.getData('text/plain');
            if (plainText) {
                const trackerRegex = /[\u200B-\u200D\uFEFF\u202A-\u202E]/;
                if (trackerRegex.test(plainText)) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const cleanText = plainText.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '');
                    const selection = instance.getSelection();
                    instance.executeEdits("paste-clean", [{
                        range: selection,
                        text: cleanText,
                        forceMoveMarkers: true
                    }]);
                    
                    Toast.show('🛡️ 已拦截并清洗掉隐形追踪代码！', 'info');
                }
            }
        }
    },

    // ================= 图床上传 =================
    async uploadImageToGitHub(file, instance) {
        const timestamp = Date.now();
        let ext = file.type ? (file.type.split('/')[1] || 'png') : 'png';
        const fileName = `img_${timestamp}.${ext}`;
        const relativePath = `images/${fileName}`;
        const placeholder = `![正在上传 ${fileName}...]()`;

        const selection = instance.getSelection();
        instance.executeEdits("image-upload", [{
            range: selection,
            text: placeholder,
            forceMoveMarkers: true
        }]);

        Toast.show('检测到图片，正在后台安全上传...', 'info');

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target.result;
            const pureBase64 = base64String.split(',')[1]; 
            
            // 存入缓存池，供 Marked.js 瞬间渲染
            this.imageCache[relativePath] = base64String;

            try {
                await GitHubAPI.uploadImage(`notes/${relativePath}`, pureBase64);
                
                const model = instance.getModel();
                const matches = model.findMatches(placeholder, false, false, false, null, true);
                
                if (matches.length > 0) {
                    const matchRange = matches[0].range;
                    instance.executeEdits("image-upload-success", [{
                        range: matchRange,
                        text: `![图片](${relativePath})`
                    }]);
                }
                
                Toast.show('✅ 图片上传成功！', 'success');
                // 触发一次预览区刷新
                if (!document.getElementById('preview-container').classList.contains('d-none')) {
                    this.editorMgr.updatePreview(this.editorMgr.getContent());
                }
            } catch (error) {
                Toast.show(`图片上传失败: ${error.message}`, 'error');
            }
        };
        reader.readAsDataURL(file);
    },

    // ================= 隐私监控与粉碎 =================
    async viewClipboard() {
        try {
            // 调用浏览器原生 API 读取剪贴板内容（浏览器会提示用户授权）
            const text = await navigator.clipboard.readText();
            document.getElementById('clipboard-content-view').value = text || '(剪贴板为空或只包含图片)';
            new bootstrap.Modal(document.getElementById('clipboardModal')).show();
        } catch (err) {
            Toast.show('无法读取剪贴板，请检查浏览器权限设置', 'warning');
        }
    },

    async shredClipboard() {
        try {
            await navigator.clipboard.writeText(' ');
            Toast.show('🧹 剪贴板内存已彻底覆盖粉碎！', 'success');
        } catch (err) {
            Toast.show('粉碎失败', 'error');
        }
    }
};