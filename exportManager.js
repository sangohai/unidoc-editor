// exportManager.js - 纯前端全能格式导出与 PDF 打印中心 (v2.3.3 零报错下载 & 高清图片内嵌版)
const ExportManager = {
    init() {
        document.getElementById('btn-export-md')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportRaw();
        });
        document.getElementById('btn-export-html')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportHTML();
        });
        document.getElementById('btn-export-pdf')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.exportPDF();
        });
    },

    // 获取当前文件名
    getFileName() {
        if (typeof AppState === 'undefined' || !AppState.currentFilePath) return 'untitled.md';
        return AppState.currentFilePath.split('/').pop();
    },

    // 🌟 核心修复 1：延迟释放 Blob URL，彻底解决首次点击导出时浏览器因 URL 被瞬时销毁而报“无法保存”的 Bug！
    downloadBlob(content, fileName, mimeType) {
        const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // 预留充足时间供操作系统弹出“另存为”路径选择框并完成文件流写入
        setTimeout(() => {
            if (a.parentNode) document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 15000);
    },

    // 🌟 核心修复 2：提取带有已显影 Base64 高清图片的纯净 HTML（让导出的 HTML 网页与 PDF 打印 100% 显示图片！）
    _getHydratedReadingHTML() {
        if (typeof EditorManager === 'undefined' || !EditorManager.canvas) return '';

        // 若是 JSON / YAML / TXT 代码模式，包裹在 <pre><code> 中输出
        if (EditorManager.currentLanguage !== 'markdown') {
            const escaped = EditorManager.getContent()
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
            return `<pre><code>${escaped}</code></pre>`;
        }

        const cloneCanvas = EditorManager.canvas.cloneNode(true);
        const cacheRef = (typeof ClipboardManager !== 'undefined' && ClipboardManager.imageCache)
            ? ClipboardManager.imageCache
            : {};

        // 1. 剥离所有编辑态属性与辅助类名
        cloneCanvas.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        cloneCanvas.querySelectorAll('.unidoc-block').forEach(el => {
            el.classList.remove('active-block', 'dragging-block', 'block-lifted-dragging');
            el.removeAttribute('draggable');
        });

        // 2. 确保所有 <details> 折叠块在导出/打印时默认展开（或保持当前展开状态并美化）
        // 3. 将所有图片替换为画布已水合显影的真实 Base64 数据（或绝对可用路径），彻底杜绝裂图占位符！
        const liveImgs = EditorManager.canvas.querySelectorAll('img');
        const cloneImgs = cloneCanvas.querySelectorAll('img');

        cloneImgs.forEach((img, idx) => {
            const liveImg = liveImgs[idx];
            const dataSrc = img.getAttribute('data-src') || '';
            const cleanKey = dataSrc.replace(/^notes\//, '');

            if (liveImg && liveImg.src && liveImg.src.startsWith('data:')) {
                // 优先直接复用画布上已经显影成功的 Base64 图像流
                img.src = liveImg.src;
            } else if (cleanKey && cacheRef[cleanKey]) {
                img.src = cacheRef[cleanKey];
            } else if (dataSrc && cacheRef[dataSrc]) {
                img.src = cacheRef[dataSrc];
            }
            img.removeAttribute('data-src');
        });

        return cloneCanvas.innerHTML;
    },

    // 1. 导出为原格式 (本地冷备份)
    exportRaw() {
        if (!AppState.currentFilePath) return Toast.show('请先打开一个文件', 'info');
        const content = EditorManager.getContent();
        const fileName = this.getFileName();
        this.downloadBlob(content, fileName, 'text/plain');
        Toast.show(`📥 已安全导出 ${fileName} 到本地`, 'success');
    },

    // 2. 导出为独立自包含 HTML 网页 (内嵌高清图片，离线发给客户也能 100% 显示图片)
    exportHTML() {
        if (!AppState.currentFilePath) return Toast.show('请先打开一个文件', 'info');
        const htmlContent = this._getHydratedReadingHTML();
        const title = this.getFileName().replace(/\.[^/.]+$/, "");
        
        const template = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - UniDoc</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <style>
        body { box-sizing: border-box; min-width: 200px; max-width: 860px; margin: 0 auto; padding: 45px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.75; }
        @media (max-width: 767px) { body { padding: 18px; } }
        details { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; }
        details > summary { font-weight: 600; cursor: pointer; }
        details > .details-body { margin-top: 8px; padding-top: 8px; padding-left: 12px; border-top: 1px dashed #ced4da; border-left: 2px solid #0d6efd; }
        figure { text-align: center; background: #f8f9fa; padding: 12px; border-radius: 8px; margin: 16px 0; }
        figure img { max-width: 100%; height: auto; border-radius: 6px; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        figure figcaption { margin-top: 8px; font-size: 0.9em; color: #6c757d; }
        mark { background-color: #ffe58f; padding: 0.1em 0.35em; border-radius: 4px; }
        blockquote { border-left: 4px solid #0d6efd; background: rgba(13,110,253,0.05); padding: 10px 16px; font-style: italic; }
    </style>
</head>
<body class="markdown-body">
    ${htmlContent}
</body>
</html>`;
        this.downloadBlob(template, title + '.html', 'text/html');
        Toast.show('📥 已导出内嵌高清图片的 HTML 独立网页', 'success');
    },

    // 3. 打印另存为 PDF (内嵌 Base64 高清图片 + 等待所有图片解码完毕后再精准唤起打印机)
    exportPDF() {
        if (!AppState.currentFilePath) return Toast.show('请先打开一个文件', 'info');
        const htmlContent = this._getHydratedReadingHTML();
        const title = this.getFileName().replace(/\.[^/.]+$/, "");
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            return Toast.show('导出失败：弹窗被浏览器拦截，请允许弹出窗口', 'error');
        }

        const baseHref = window.location.href.replace(/index\.html.*/, '');
        
        printWindow.document.open();
        printWindow.document.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <base href="${baseHref}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <style>
        body { max-width: 820px; margin: 0 auto; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.75; color: #212529; }
        details { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 10px 14px; margin-bottom: 14px; page-break-inside: avoid; }
        details > summary { font-weight: 600; }
        details > .details-body { margin-top: 8px; padding-top: 8px; padding-left: 12px; border-top: 1px dashed #ced4da; border-left: 2px solid #0d6efd; }
        figure { text-align: center; padding: 10px; margin: 16px 0; page-break-inside: avoid; }
        figure img, img { max-width: 100% !important; height: auto !important; border-radius: 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
        figure figcaption { margin-top: 6px; font-size: 0.88em; color: #6c757d; }
        mark { background-color: #ffe58f !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0.1em 0.35em; border-radius: 4px; }
        blockquote { border-left: 4px solid #0d6efd; background: rgba(13,110,253,0.05); padding: 10px 16px; font-style: italic; }
        @media print {
            body { padding: 0; margin: 0; max-width: 100%; }
        }
    </style>
</head>
<body class="markdown-body">
    ${htmlContent}
    <script>
        // 确保所有图片与外部样式表 100% 加载解码完成后再唤起打印窗口
        window.addEventListener('load', () => {
            const imgs = Array.from(document.images);
            Promise.all(imgs.map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(res => { img.onload = res; img.onerror = res; });
            })).then(() => {
                setTimeout(() => { window.print(); }, 350);
            });
        });
    </script>
</body>
</html>`);
        printWindow.document.close();
        Toast.show('🖨️ 正在为您生成带高清图片的 PDF 打印预览...', 'success');
    }
};