// fileTree.js - 渲染左侧文件列表
const FileTree = {
    container: document.getElementById('file-tree'),
    onFileClick: null,
    onDeleteClick: null,

    init(onFileClickCallback, onDeleteClickCallback) {
        this.onFileClick = onFileClickCallback;
        this.onDeleteClick = onDeleteClickCallback; 
        
        document.getElementById('btn-refresh-tree-pc')?.addEventListener('click', () => this.load());
    },

    async load() {
        this.container.innerHTML = '<div class="text-muted small p-2"><i class="fa-solid fa-spinner fa-spin me-2"></i>正在拉取数据...</div>';
        try {
            const files = await GitHubAPI.getFiles('notes');
            this.render(files);
        } catch (error) {
            if (error.message === 'NOT_CONFIGURED') {
                this.container.innerHTML = '<div class="text-warning small p-2"><i class="fa-solid fa-triangle-exclamation me-1"></i>请先配置</div>';
            } else {
                this.container.innerHTML = `<div class="text-danger small p-2">加载失败</div>`;
            }
        }
    },

    render(files) {
        if (files.length === 0) {
            this.container.innerHTML = '<div class="text-muted small p-2">目录为空</div>';
            return;
        }

        this.container.innerHTML = ''; 
        
        files.forEach(file => {
            const div = document.createElement('div');
            div.className = 'file-item d-flex justify-content-between align-items-center';
            div.dataset.path = file.path;
            
            let iconClass = 'fa-file-lines';
            if (file.name.endsWith('.md')) iconClass = 'fa-markdown fa-brands';
            if (file.name.endsWith('.json') || file.name.endsWith('.yaml')) iconClass = 'fa-file-code';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'text-truncate flex-grow-1';
            nameSpan.innerHTML = `<i class="${iconClass} text-secondary me-2 icon-indicator"></i>${file.name}`;
            
            // 注意：这里去掉了 d-none，完全由 CSS 控制显隐
            const delBtn = document.createElement('i');
            delBtn.className = 'fa-solid fa-trash-can text-danger p-1 btn-delete';
            delBtn.title = "删除文件";

            div.appendChild(nameSpan);
            div.appendChild(delBtn);
            
            div.addEventListener('click', () => {
                this.setActive(file.path);
                const offcanvasEl = document.getElementById('sidebarOffcanvas');
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
                if (offcanvasInstance) offcanvasInstance.hide();

                if (this.onFileClick) this.onFileClick(file);
            });

            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onDeleteClick) this.onDeleteClick(file);
            });

            this.container.appendChild(div);
        });
    },

    setActive(path) {
        const items = this.container.querySelectorAll('.file-item');
        items.forEach(item => {
            const icon = item.querySelector('.icon-indicator');
            if (item.dataset.path === path) {
                item.classList.add('active');
                icon.classList.remove('text-secondary'); 
            } else {
                item.classList.remove('active');
                icon.classList.add('text-secondary'); 
            }
        });
    }
};