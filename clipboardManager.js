// clipboardManager.js - 专属剪贴板拦截、图床上传与隐私清洗中心
const ClipboardManager = {
    editorMgr: null,
    imageCache: {}, 

    init(EditorManagerInstance) {
        this.editorMgr = EditorManagerInstance;
        this.bindEvents();
    },

    bindEvents() {
        // 全局监听粘贴事件 (Capture 捕获阶段截胡)
        document.addEventListener('paste', (e) => this.handlePaste(e), true);

        // 仅保留 Modal 弹窗里的直接粉碎按钮
        document.getElementById('btn-modal-shred')?.addEventListener('click', () => {
            this.shredClipboard();
            bootstrap.Modal.getInstance(document.getElementById('clipboardModal')).hide();
        });
    },

    handlePaste(e) {
        if (!this.editorMgr.view || !this.editorMgr.view.hasFocus) return;

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        let hasImage = false;

        if (this.editorMgr.currentLanguage === 'markdown') {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image/') === 0) {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    const file = items[i].getAsFile();
                    this.uploadImageToGitHub(file);
                    hasImage = true;
                    break; 
                }
            }
        }

        if (!hasImage) {
            const plainText = clipboardData.getData('text/plain');
            if (plainText) {
                const trackerRegex = /[\u200B-\u200D\uFEFF\u202A-\u202E]/;
                if (trackerRegex.test(plainText)) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const cleanText = plainText.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '');
                    this.editorMgr.replaceSelection(cleanText);
                    Toast.show('🛡️ 已拦截并清洗掉隐形追踪代码！', 'info');
                }
            }
        }
    },

    async uploadImageToGitHub(file) {
        if (!this.editorMgr.view) return;

        const timestamp = Date.now();
        let ext = file.type ? (file.type.split('/')[1] || 'png') : 'png';
        const fileName = `img_${timestamp}.${ext}`;
        const relativePath = `images/${fileName}`;
        const placeholder = `![正在上传 ${fileName}...]()`;

        this.editorMgr.replaceSelection(placeholder);
        Toast.show('检测到图片，正在后台安全上传...', 'info');

        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64String = event.target.result;
            const pureBase64 = base64String.split(',')[1]; 
            this.imageCache[relativePath] = base64String;

            try {
                await GitHubAPI.uploadImage(`notes/${relativePath}`, pureBase64);
                this.editorMgr.findAndReplace(placeholder, `![图片](${relativePath})`);
                
                Toast.show('✅ 图片上传成功！', 'success');
                if (!document.getElementById('preview-container').classList.contains('d-none')) {
                    this.editorMgr.updatePreview(this.editorMgr.getContent());
                }
            } catch (error) {
                Toast.show(`图片上传失败: ${error.message}`, 'error');
            }
        };
        reader.readAsDataURL(file);
    },

    async viewClipboard() {
        try {
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
            Toast.show('🧹 剪贴板内存已彻底粉碎！', 'success');
        } catch (err) {
            Toast.show('粉碎失败', 'error');
        }
    }
};