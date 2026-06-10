// fileTree.js - 渲染左侧文件列表
const FileTree = {
    container: document.getElementById('file-tree'),
    onFileClick: null,
    onDeleteClick: null,
    onRenameClick: null,

    init(onFileClickCallback, onDeleteClickCallback, onRenameClickCallback) {
        this.onFileClick = onFileClickCallback;
        this.onDeleteClick = onDeleteClickCallback; 
        this.onRenameClick = onRenameClickCallback;
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
            // 1. 外层容器 (管理整行布局)
            const rowDiv = document.createElement('div');
            rowDiv.className = 'file-row d-flex justify-content-between align-items-center mb-1 pe-1';
            
            // 2. 左侧部分：只把文件名部分做成可点击的高亮区域
            const itemDiv = document.createElement('div');
            itemDiv.className = 'file-item text-truncate flex-grow-1 p-2 rounded';
            itemDiv.dataset.path = file.path;
            
            let iconClass = 'fa-file-lines'; 
            if (file.name.endsWith('.md')) iconClass = 'fa-markdown fa-brands';
            else if (file.name.match(/\.(json|yaml|yml)$/i)) iconClass = 'fa-file-code';

            itemDiv.innerHTML = `<i class="${iconClass} text-secondary me-2 icon-indicator"></i>${file.name}`;
            
            // 3. 右侧部分：操作按钮组 (独立在蓝色背景框之外)
            const actionDiv = document.createElement('div');
            actionDiv.className = 'file-actions d-flex align-items-center ms-1';

            const renameBtn = document.createElement('i');
            // 注意这里默认颜色变成了 text-secondary (灰色)，鼠标悬浮时再变色
            renameBtn.className = 'fa-solid fa-pen-to-square text-secondary p-1 me-1 action-btn';
            renameBtn.title = "重命名";

            const delBtn = document.createElement('i');
            delBtn.className = 'fa-solid fa-trash-can text-secondary p-1 action-btn';
            delBtn.title = "删除文件";

            actionDiv.appendChild(renameBtn);
            actionDiv.appendChild(delBtn);

            rowDiv.appendChild(itemDiv);
            rowDiv.appendChild(actionDiv);
            
            // 4. 绑定事件 (相互独立，不再需要 e.stopPropagation 了)
            itemDiv.addEventListener('click', () => {
                this.setActive(file.path);
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarOffcanvas'));
                if (offcanvasInstance) offcanvasInstance.hide();
                if (this.onFileClick) this.onFileClick(file);
            });

            renameBtn.addEventListener('click', () => {
                if (this.onRenameClick) this.onRenameClick(file);
            });

            delBtn.addEventListener('click', () => {
                if (this.onDeleteClick) this.onDeleteClick(file);
            });

            this.container.appendChild(rowDiv);
        });
    },

    setActive(path) {
        const items = this.container.querySelectorAll('.file-item');
        items.forEach(item => {
            const icon = item.querySelector('.icon-indicator');
            const actionDiv = item.parentElement.querySelector('.file-actions'); // 找到对应的图标组
            
            if (item.dataset.path === path) {
                item.classList.add('active');
                icon.classList.remove('text-secondary'); 
                actionDiv.classList.add('show-actions'); // 保持右侧图标可见
            } else {
                item.classList.remove('active');
                icon.classList.add('text-secondary'); 
                actionDiv.classList.remove('show-actions');
            }
        });
    }
};