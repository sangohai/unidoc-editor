// garbageCollector.js - 纯前端图片垃圾回收引擎
const GarbageCollector = {
    orphanedImages: [], // 查找到的废弃图片列表

    init() {
        // 绑定 PC 端和手机端的“清理图床”按钮
        document.getElementById('btn-gc-pc')?.addEventListener('click', () => this.scan());
        document.getElementById('btn-gc-mobile')?.addEventListener('click', () => {
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarOffcanvas'));
            if (offcanvas) offcanvas.hide();
            this.scan();
        });

        // 绑定弹窗中的“彻底清理”按钮
        document.getElementById('btn-confirm-gc')?.addEventListener('click', () => this.clean());
    },

    // 🌟 1. 扫描与比对引擎
    async scan() {
        try {
            UI.showGlobalLoader('正在读取云端图床清单...');
            
            // 获取图床目录下的所有图片
            let allImages = [];
            try {
                allImages = await GitHubAPI.getFiles('notes/images');
            } catch (error) {
                // 如果报 404，说明连 images 文件夹都没有，直接认定为空
                if (error.status !== 404) throw error;
            }

            if (allImages.length === 0) {
                UI.hideGlobalLoader();
                return Toast.show('图床极其干净，没有图片需要清理！', 'success');
            }

            UI.showGlobalLoader('正在获取全库文档列表...');
            const allFiles = await GitHubAPI.getFiles('notes');
            const mdFiles = allFiles.filter(f => f.name.endsWith('.md'));

            const usedImages = new Set();

            // 遍历所有 Markdown 文档，提取被引用的图片链接
            for (let i = 0; i < mdFiles.length; i++) {
                UI.showGlobalLoader(`正在分析文档关联 (${i + 1}/${mdFiles.length})...`);
                const fileData = await GitHubAPI.getFile(mdFiles[i].path);
                
                // 正则匹配标准格式: images/img_xxxxx.png
                const regex = /images\/[a-zA-Z0-9_.\-]+/g;
                const matches = fileData.content.match(regex);
                if (matches) {
                    matches.forEach(match => usedImages.add(match));
                }
            }

            // 交叉比对：找出存在于云端图床，但没有任何文档引用它的图片
            this.orphanedImages = allImages.filter(img => {
                // GitHub 的 img.path 是 "notes/images/xxx.png"，我们要提取出 "images/xxx.png"
                const relPath = img.path.replace('notes/', '');
                return !usedImages.has(relPath);
            });

            UI.hideGlobalLoader();

            // 展示结果
            if (this.orphanedImages.length === 0) {
                Toast.show('✨ 所有图片均被有效引用，没有产生垃圾！', 'success');
            } else {
                this.showResultModal();
            }

        } catch (error) {
            UI.hideGlobalLoader();
            Toast.show(`扫描失败: ${error.message}`, 'error');
        }
    },

    // 🌟 2. 展示垃圾清单弹窗
    showResultModal() {
        const gcModal = new bootstrap.Modal(document.getElementById('gcModal'));
        const listContainer = document.getElementById('gc-orphan-list');
        const summary = document.getElementById('gc-summary');

        listContainer.innerHTML = '';
        let totalSize = 0;

        this.orphanedImages.forEach(img => {
            totalSize += img.size;
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center bg-body text-body-secondary small border-secondary-subtle';
            // 字节转 KB
            const kbSize = (img.size / 1024).toFixed(1);
            li.innerHTML = `<span><i class="fa-regular fa-image me-2 text-danger"></i>${img.name}</span><span class="badge bg-secondary rounded-pill">${kbSize} KB</span>`;
            listContainer.appendChild(li);
        });

        const totalKb = (totalSize / 1024).toFixed(1);
        summary.innerHTML = `共发现 <strong>${this.orphanedImages.length}</strong> 张孤儿图片，占用云端 <strong>${totalKb} KB</strong>。`;

        gcModal.show();
    },

    // 🌟 3. 批量销毁孤儿图片
    async clean() {
        const gcModal = bootstrap.Modal.getInstance(document.getElementById('gcModal'));
        gcModal.hide();

        try {
            for (let i = 0; i < this.orphanedImages.length; i++) {
                const img = this.orphanedImages[i];
                UI.showGlobalLoader(`正在彻底销毁废弃图片 (${i + 1}/${this.orphanedImages.length})...`);
                await GitHubAPI.deleteFile(img.path, img.sha);
            }
            
            UI.hideGlobalLoader();
            Toast.show(`🧹 成功清理了 ${this.orphanedImages.length} 张废弃图片！图床已瘦身！`, 'success');
            this.orphanedImages = []; // 清空缓存
            
        } catch (error) {
            UI.hideGlobalLoader();
            Toast.show(`清理过程中断: ${error.message}`, 'error');
        }
    }
};