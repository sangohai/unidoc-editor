// fileTree.js - 侧边栏、极速本地检索与【云端】星标排位
const FileTree = {
    container: document.getElementById('file-tree'),
    searchInput: document.getElementById('input-search-files'),
    onFileClick: null,
    onDeleteClick: null,
    onRenameClick: null,
    
    currentFilesCache: [], 

    init(onFileClickCallback, onDeleteClickCallback, onRenameClickCallback) {
        this.onFileClick = onFileClickCallback;
        this.onDeleteClick = onDeleteClickCallback; 
        this.onRenameClick = onRenameClickCallback;
        
        document.getElementById('btn-refresh-tree-pc')?.addEventListener('click', () => this.load());
        document.getElementById('btn-refresh-tree-mobile')?.addEventListener('click', () => this.load());

        this.initSearchEngine();
    },

    initSearchEngine() {
        if (!this.searchInput) return;
        this.searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const rows = this.container.querySelectorAll('.file-row');
            
            rows.forEach(row => {
                const fileName = row.dataset.name.toLowerCase();
                if (fileName.includes(searchTerm)) {
                    row.style.setProperty('display', 'flex', 'important');
                } else {
                    row.style.setProperty('display', 'none', 'important');
                }
            });
        });
    },

    // 🌟 星标状态改走 SettingsManager 云端同步
    async togglePin(path) {
        // 调用 SettingsManager 静默修改并同步云端
        await SettingsManager.togglePin(path);
        
        // 瞬间重新渲染本地列表
        this.render(this.currentFilesCache);
        
        if (AppState.currentFilePath) {
            this.setActive(AppState.currentFilePath);
        }
    },

    async load() {
        this.container.innerHTML = '<div class="text-muted small p-2"><i class="fa-solid fa-spinner fa-spin me-2"></i>正在拉取数据...</div>';
        try {
            const files = await GitHubAPI.getFiles('notes');
            this.currentFilesCache = files; 
            this.render(files);
            
            this.searchInput.dispatchEvent(new Event('input'));
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

        // 获取云端星标名单
        const pinned = SettingsManager.getPinned();

        let sortedFiles = [...files];
        sortedFiles.sort((a, b) => {
            const aPinned = pinned.includes(a.path);
            const bPinned = pinned.includes(b.path);
            
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return a.name.localeCompare(b.name, 'zh-CN'); 
        });

        this.container.innerHTML = ''; 
        
        sortedFiles.forEach(file => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'file-row d-flex justify-content-between align-items-center mb-1 pe-1';
            rowDiv.dataset.name = file.name; 
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'file-item text-truncate flex-grow-1 p-2 rounded';
            itemDiv.dataset.path = file.path;
            
            let iconClass = 'fa-file-lines'; 
            if (file.name.endsWith('.md')) iconClass = 'fa-markdown fa-brands';
            else if (file.name.match(/\.(json|yaml|yml)$/i)) iconClass = 'fa-file-code';

            itemDiv.innerHTML = `<i class="${iconClass} text-secondary me-2 icon-indicator"></i>${file.name}`;
            
            const actionDiv = document.createElement('div');
            actionDiv.className = 'file-actions d-flex align-items-center ms-1';

            const isPinned = pinned.includes(file.path);
            const pinBtn = document.createElement('i');
            pinBtn.className = isPinned ? 'fa-solid fa-star star-pinned p-1 me-1 action-btn' : 'fa-regular fa-star text-secondary p-1 me-1 action-btn';
            pinBtn.title = isPinned ? "取消置顶" : "设为置顶";

            const renameBtn = document.createElement('i');
            renameBtn.className = 'fa-solid fa-pen-to-square text-secondary p-1 me-1 action-btn';
            renameBtn.title = "重命名";

            const delBtn = document.createElement('i');
            delBtn.className = 'fa-solid fa-trash-can text-secondary p-1 action-btn';
            delBtn.title = "删除文件";

            actionDiv.appendChild(pinBtn);
            actionDiv.appendChild(renameBtn);
            actionDiv.appendChild(delBtn);

            rowDiv.appendChild(itemDiv);
            rowDiv.appendChild(actionDiv);
            
            itemDiv.addEventListener('click', () => {
                this.setActive(file.path);
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(document.getElementById('sidebarOffcanvas'));
                if (offcanvasInstance) offcanvasInstance.hide();
                if (this.onFileClick) this.onFileClick(file);
            });

            pinBtn.addEventListener('click', () => this.togglePin(file.path));

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
            const actionDiv = item.parentElement.querySelector('.file-actions'); 
            
            if (item.dataset.path === path) {
                item.classList.add('active');
                icon.classList.remove('text-secondary'); 
                actionDiv.classList.add('show-actions'); 
            } else {
                item.classList.remove('active');
                icon.classList.add('text-secondary'); 
                actionDiv.classList.remove('show-actions');
            }
        });
    }
};