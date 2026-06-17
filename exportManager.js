// exportManager.js - 纯前端全能格式导出与 PDF 打印中心
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
        if (!AppState.currentFilePath) return 'untitled.md';
        return AppState.currentFilePath.split('/').pop();
    },

    // 核心底层方法：利用 HTML5 Blob 纯前端生成文件并触发下载
    downloadBlob(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 1. 导出为原格式 (本地冷备份)
    exportRaw() {
        if (!AppState.currentFilePath) return Toast.show('请先打开一个文件', 'info');
        const content = EditorManager.getContent();
        const fileName = this.getFileName();
        this.downloadBlob(content, fileName, 'text/plain');
        Toast.show(`📥 已安全导出 ${fileName} 到本地`, 'success');
    },

    // 2. 导出为独立 HTML 网页 (秒发给客户看)
    exportHTML() {
        if (!AppState.currentFilePath) return Toast.show('请先打开一个文件', 'info');
        const content = EditorManager.getContent();
        const htmlContent = marked.parse(content);
        const title = this.getFileName().replace(/\.[^/.]+$/, "");
        
        // 注入 GitHub 原生 Markdown 样式库
        const template = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - UniDoc</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
    <style>
        body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px; }
        @media (max-width: 767px) { body { padding: 15px; } }
    </style>
</head>
<body class="markdown-body">
    ${htmlContent}
</body>
</html>`;
        this.downloadBlob(template, title + '.html', 'text/html');
        Toast.show('📥 已导出精美 HTML 独立网页', 'success');
    },

    // 3. 打印另存为 PDF (原生质感)
    exportPDF() {
        if (!AppState.currentFilePath) return Toast.show('请先打开一个文件', 'info');
        const content = EditorManager.getContent();
        const htmlContent = marked.parse(content);
        const title = this.getFileName().replace(/\.[^/.]+$/, "");
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            return Toast.show('导出失败：弹窗被浏览器拦截，请允许弹出窗口', 'error');
        }

        // 黑科技：注入基础路径，保证打印界面中引用的本地图床图片不会报 404
        const baseHref = window.location.href.replace(/index\.html.*/, '');
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <base href="${baseHref}">
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown-light.min.css">
                <style>
                    body { margin: 0; padding: 20px; }
                    img { max-width: 100%; height: auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 8px; }
                    @media print {
                        body { padding: 0; margin: 0; }
                    }
                </style>
            </head>
            <body class="markdown-body">
                ${htmlContent}
                <script>
                    // 等待图片加载完成后唤起打印机
                    setTimeout(() => {
                        window.print();
                    }, 800);
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        Toast.show('🖨️ 正在准备打印 PDF...', 'success');
    }
};