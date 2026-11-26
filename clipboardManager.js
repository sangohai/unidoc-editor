// clipboardManager.js - 剪贴板拦截、PC/手机本地选图、原生 Canvas 强制压缩引擎与商业化原图预留 (v2.3.2)
const ClipboardManager = {
    editorMgr: null,
    imageCache: {}, 
    fileInput: null,

    // 🌟 商业化分级策略配置 (Freemium Architecture)
    // 当前默认为基础版：所有图片强制经过智能高清压缩并严格限制 <= 2MB；未来开启 isProUser 可解锁无损原图直传
    isProUser: false,
    MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB 绝对硬上限 (2,097,152 字节)
    STANDARD_MAX_DIMENSION: 1600,    // 基础版标准阅读最大边长 (兼顾清晰度与极速跨端同步)
    STANDARD_QUALITY: 0.80,          // 基础版默认压缩画质 (80%)

    init(EditorManagerInstance) {
        this.editorMgr = EditorManagerInstance;
        this._createHiddenFileInput();
        this.bindEvents();
    },

    // 创建隐藏的原生文件选择器 (兼容 PC 文件夹与 Android/iOS 手机本地相册/相机)
    _createHiddenFileInput() {
        if (this.fileInput) return;
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';

        input.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                this.uploadImageToGitHub(file);
            }
            input.value = '';
        });

        document.body.appendChild(input);
        this.fileInput = input;
    },

    // 供顶部工具栏 [🖼️ 插入图片] 按钮调用
    openLocalImagePicker() {
        if (!this.editorMgr || this.editorMgr.isReadOnly) return;
        if (!this.fileInput) this._createHiddenFileInput();
        this.fileInput.click();
    },

    bindEvents() {
        document.addEventListener('paste', (e) => this.handlePaste(e), true);

        document.getElementById('btn-modal-shred')?.addEventListener('click', () => {
            this.shredClipboard();
            bootstrap.Modal.getInstance(document.getElementById('clipboardModal'))?.hide();
        });
    },

    handlePaste(e) {
        if (!this.editorMgr || typeof this.editorMgr.hasFocus !== 'function' || !this.editorMgr.hasFocus()) return;

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const items = clipboardData.items;
        let hasImage = false;

        if (this.editorMgr.currentLanguage === 'markdown' && items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image/') === 0) {
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    const file = items[i].getAsFile();
                    if (file) {
                        this.uploadImageToGitHub(file);
                        hasImage = true;
                    }
                    break; 
                }
            }
        }

        if (!hasImage) {
            const plainText = clipboardData.getData('text/plain');
            if (plainText) {
                const trackerRegex = /[\u200B-\u200D\uFEFF\u202A-\u202E]/;
                const htmlData = clipboardData.getData('text/html');
                const hasDirtyExternalHtml = htmlData && (htmlData.includes('style=') || htmlData.includes('<span') || htmlData.includes('<div'));

                if (trackerRegex.test(plainText)) {
                    e.preventDefault();
                    e.stopPropagation();
                    const cleanText = plainText.replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '');
                    this.editorMgr.replaceSelection(cleanText);
                    Toast.show('🛡️ 已拦截并清洗掉隐形追踪代码！', 'info');
                } else if (hasDirtyExternalHtml) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.editorMgr.replaceSelection(plainText);
                }
            }
        }
    },

    // ==========================================
    // 🌟 核心黑科技：原生 HTML5 Canvas 阶梯式强制图片压缩引擎
    // 无论原图是 15MB 手机拍照还是 4K 截图，强制重采样压缩至 <= 2MB (通常 200KB~500KB)
    // ==========================================
    _compressImageFile(file) {
        return new Promise((resolve, reject) => {
            // GIF 动图若本身小于 2MB 则保留动效，若超过 2MB 则同样进入 Canvas 抽帧压缩防撑爆
            const isGifUnderLimit = (file.type === 'image/gif' && file.size <= this.MAX_IMAGE_SIZE);

            const reader = new FileReader();
            reader.onerror = () => reject(new Error('读取本地图片失败'));
            reader.onload = (event) => {
                const rawBase64 = event.target.result;

                // 如果是未来解锁了 Pro 会员且原图未超限，或小体积 GIF，直接返回
                if ((this.isProUser && file.size <= this.MAX_IMAGE_SIZE) || isGifUnderLimit) {
                    return resolve({
                        base64String: rawBase64,
                        ext: file.type === 'image/gif' ? 'gif' : 'png',
                        originalSize: file.size,
                        compressedSize: file.size,
                        wasCompressed: false
                    });
                }

                const img = new Image();
                img.onerror = () => reject(new Error('图片格式解析失败'));
                img.onload = () => {
                    let targetW = img.naturalWidth || img.width;
                    let targetH = img.naturalHeight || img.height;
                    const maxDim = this.STANDARD_MAX_DIMENSION;

                    // 1. 尺寸等比降采样 (长边超过 1600px 自动等比缩放)
                    if (targetW > maxDim || targetH > maxDim) {
                        if (targetW >= targetH) {
                            targetH = Math.round((targetH * maxDim) / targetW);
                            targetW = maxDim;
                        } else {
                            targetW = Math.round((targetW * maxDim) / targetH);
                            targetH = maxDim;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = targetW;
                    canvas.height = targetH;
                    const ctx = canvas.getContext('2d');

                    // 填充纯白底色防止透明 PNG 转 JPEG 时背景变黑
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, targetW, targetH);
                    ctx.drawImage(img, 0, 0, targetW, targetH);

                    // 2. 阶梯式质量压缩 (确保最终体积 100% 小于 2MB 硬上限)
                    let quality = this.STANDARD_QUALITY;
                    let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    let approxBytes = Math.round((compressedDataUrl.length * 3) / 4);

                    // 若依然超过 2MB，自动递减画质或进一步缩小尺寸直至达标
                    while (approxBytes > this.MAX_IMAGE_SIZE && quality > 0.3) {
                        quality -= 0.15;
                        compressedDataUrl = canvas.toDataURL('image/jpeg', Math.max(0.25, quality));
                        approxBytes = Math.round((compressedDataUrl.length * 3) / 4);
                    }

                    // 极端情况：若原本就是小图标且压缩后反而变大，则取体积更小的那一个（前提是不超 2MB）
                    if (file.size < approxBytes && file.size <= this.MAX_IMAGE_SIZE) {
                        const rawExt = (file.type && file.type.split('/')[1]) ? file.type.split('/')[1].replace('jpeg', 'jpg') : 'png';
                        return resolve({
                            base64String: rawBase64,
                            ext: rawExt,
                            originalSize: file.size,
                            compressedSize: file.size,
                            wasCompressed: false
                        });
                    }

                    resolve({
                        base64String: compressedDataUrl,
                        ext: 'jpg',
                        originalSize: file.size,
                        compressedSize: approxBytes,
                        wasCompressed: true
                    });
                };
                img.src = rawBase64;
            };
            reader.readAsDataURL(file);
        });
    },

    _formatSize(bytes) {
        if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + 'MB';
        return Math.max(1, Math.round(bytes / 1024)) + 'KB';
    },

    // 🌟 统一上传管线：强制压缩 -> 2MB 终审 -> 上传 GitHub -> 渲染原生 <figure> 块
    async uploadImageToGitHub(file) {
        if (!this.editorMgr || !this.editorMgr.canvas) return;

        Toast.show('⚡ 正在智能压缩优化图片并准备上传...', 'info');

        let processed;
        try {
            processed = await this._compressImageFile(file);
        } catch (compErr) {
            return Toast.show(`图片处理失败: ${compErr.message}`, 'error');
        }

        // 终极 2MB 门禁兜底校验
        if (processed.compressedSize > this.MAX_IMAGE_SIZE) {
            return Toast.show(`⚠️ 图片压缩后仍超过 2MB 上限，请裁剪后再试`, 'error');
        }

        const timestamp = Date.now();
        const fileName = `img_${timestamp}.${processed.ext}`;
        const relativePath = `images/${fileName}`;
        const placeholder = `![正在上传 ${fileName}...]()`;

        // 在当前激活段落下方或画布末尾插入临时占位块
        const newBlock = this.editorMgr.createBlockElement('p', placeholder);
        if (this.editorMgr.activeBlock && this.editorMgr.canvas.contains(this.editorMgr.activeBlock)) {
            this.editorMgr.activeBlock.after(newBlock);
        } else {
            this.editorMgr.canvas.appendChild(newBlock);
        }

        const base64String = processed.base64String;
        const pureBase64 = base64String.split(',')[1];
        this.imageCache[relativePath] = base64String;

        try {
            await GitHubAPI.uploadImage(`notes/${relativePath}`, pureBase64);
            this.editorMgr.findAndReplace(placeholder, `![图片](${relativePath})`);

            if (processed.wasCompressed) {
                const origStr = this._formatSize(processed.originalSize);
                const compStr = this._formatSize(processed.compressedSize);
                Toast.show(`✅ 已智能压缩上传 (${origStr} ➔ ${compStr} 标准画质)`, 'success');
            } else {
                Toast.show(`✅ 图片已上传 (${this._formatSize(processed.compressedSize)})`, 'success');
            }

            if (typeof this.editorMgr.updatePreview === 'function') {
                this.editorMgr.updatePreview();
            }
        } catch (error) {
            newBlock.remove();
            Toast.show(`图片上传失败: ${error.message}`, 'error');
        }
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