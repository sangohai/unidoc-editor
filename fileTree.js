// fileTree.js - 侧边栏、极速本地检索与【毫秒级乐观更新 + 云端】星标排位 (v2.1.6 整行高亮版)
const FileTree = {
    container: null,
    searchInput: null,
    onFileClick: null,
    onDeleteClick: null,
    onRenameClick: null,
    
    currentFilesCache: [], 

    init(onFileClickCallback, onDeleteClickCallback, onRenameClickCallback) {
        this.container = document.getElementById('file-tree');
        this.searchInput = document.getElementById('input-search-files');
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
                const fileName = (row.dataset.name || '').toLowerCase();
                if (fileName.includes(searchTerm)) {
                    row.style.setProperty('display', 'flex', 'important');
                } else {
                    row.style.setProperty('display', 'none', 'important');
                }
            });
        });
    },

    _getPinnedList() {
        let cloudPinned = [];
        if (typeof SettingsManager !== 'undefined' && typeof SettingsManager.getPinned === 'function') {
            const res = SettingsManager.getPinned();
            if (Array.isArray(res)) cloudPinned = res;
        }
        try {
            const localPinned = JSON.parse(localStorage.getItem('unidoc_pinned_files') || '[]');
            if (Array.isArray(localPinned) && localPinned.length > 0 && cloudPinned.length === 0) {
                return localPinned;
            }
        } catch (e) {}
        return cloudPinned;
    },

    async togglePin(path) {
        let pinned = [...this._getPinnedList()];
        const idx = pinned.indexOf(path);
        const isNowPinned = idx === -1;

        if (isNowPinned) pinned.push(path);
        else pinned.splice(idx, 1);

        localStorage.setItem('unidoc_pinned_files', JSON.stringify(pinned));
        if (typeof SettingsManager !== 'undefined' && SettingsManager.data) {
            if (Array.isArray(SettingsManager.data.pinnedFiles)) {
                SettingsManager.data.pinnedFiles = [...pinned];
            } else if (Array.isArray(SettingsManager.data.pinned)) {
                SettingsManager.data.pinned = [...pinned];
            }
        }

        this.render(this.currentFilesCache);
        if (typeof AppState !== 'undefined' && AppState.currentFilePath) {
            this.setActive(AppState.currentFilePath);
        }
        Toast.show(isNowPinned ? '⭐ 已星标置顶' : '已取消星标置顶', 'info');

        try {
            if (typeof SettingsManager !== 'undefined' && typeof SettingsManager.save === 'function') {
                await SettingsManager.save();
            } else if (typeof SettingsManager !== 'undefined' && typeof SettingsManager.togglePin === 'function') {
                await SettingsManager.togglePin(path);
            }
        } catch (err) {
            console.warn('云端星标同步延迟，已保留在本地缓存:', err);
        }
    },

    async load() {
        this.container = document.getElementById('file-tree');
        this.container.innerHTML = '<div class="text-muted small p-2"><i class="fa-solid fa-spinner fa-spin me-2"></i>正在拉取数据...</div>';
        try {
            const files = await GitHubAPI.getFiles('notes');
            this.currentFilesCache = files; 
            this.render(files);
            
            if (this.searchInput && this.searchInput.value) {
                this.searchInput.dispatchEvent(new Event('input'));
            }
            if (typeof AppState !== 'undefined' && AppState.currentFilePath) {
                this.setActive(AppState.currentFilePath);
            }
        } catch (error) {
            if (error.message === 'NOT_CONFIGURED') {
                this.container.innerHTML = '<div class="text-warning small p-2"><i class="fa-solid fa-triangle-exclamation me-1"></i>请先配置 GitHub Token</div>';
            } else {
                this.container.innerHTML = `<div class="text-danger small p-2">加载失败: ${error.message}</div>`;
            }
        }
    },

    render(files) {
        if (!files || files.length === 0) {
            this.container.innerHTML = '<div class="text-muted small p-2">目录为空</div>';
            return;
        }

        const pinned = this._getPinnedList();

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
            const isPinned = pinned.includes(file.path);
            const rowDiv = document.createElement('div');
            rowDiv.className = `file-row d-flex justify-content-between align-items-center mb-1 px-2 py-1 rounded ${isPinned ? 'is-pinned-row' : ''}`;
            rowDiv.dataset.name = file.name; 
            rowDiv.dataset.path = file.path;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'file-item text-truncate flex-grow-1 py-1';
            itemDiv.dataset.path = file.path;
            
            let iconClass = 'fa-solid fa-file-lines'; 
            if (file.name.endsWith('.md')) iconClass = 'fa-brands fa-markdown';
            else if (file.name.endsWith('.html')) iconClass = 'fa-brands fa-html5';
            else if (file.name.match(/\.(json|yaml|yml)$/i)) iconClass = 'fa-solid fa-file-code';

            itemDiv.innerHTML = `<i class="${iconClass} me-2 icon-indicator"></i><span>${file.name}</span>`;
            
            const actionDiv = document.createElement('div');
            actionDiv.className = `file-actions d-flex align-items-center ms-2 flex-shrink-0 ${isPinned ? 'show-actions' : ''}`;

            const pinBtn = document.createElement('i');
            pinBtn.className = isPinned ? 'fa-solid fa-star star-pinned p-1 me-1 action-btn' : 'fa-regular fa-star p-1 me-1 action-btn';
            pinBtn.title = isPinned ? "取消星标置顶" : "设为星标置顶";

            const renameBtn = document.createElement('i');
            renameBtn.className = 'fa-solid fa-pen-to-square p-1 me-1 action-btn';
            renameBtn.title = "重命名";

            const delBtn = document.createElement('i');
            delBtn.className = 'fa-solid fa-trash-can p-1 action-btn';
            delBtn.title = "删除文件";

            actionDiv.appendChild(pinBtn);
            actionDiv.appendChild(renameBtn);
            actionDiv.appendChild(delBtn);

            rowDiv.appendChild(itemDiv);
            rowDiv.appendChild(actionDiv);
            
            // 🌟 点击整行任意位置（除右侧功能图标外）立即触发整行高亮变蓝并加载文档
            rowDiv.addEventListener('click', () => {
                if (typeof AppState !== 'undefined' && !AppState.isDirty) {
                    this.setActive(file.path);
                }
                const offcanvasEl = document.getElementById('sidebarOffcanvas');
                const offcanvasInstance = offcanvasEl ? bootstrap.Offcanvas.getInstance(offcanvasEl) : null;
                if (offcanvasInstance) offcanvasInstance.hide();
                if (this.onFileClick) this.onFileClick(file);
            });

            pinBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.togglePin(file.path);
            });

            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onRenameClick) this.onRenameClick(file);
            });

            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.onDeleteClick) this.onDeleteClick(file);
            });

            this.container.appendChild(rowDiv);
        });
    },

    setActive(path) {
        if (!this.container) return;
        const rows = this.container.querySelectorAll('.file-row');
        rows.forEach(row => {
            const item = row.querySelector('.file-item');
            const actionDiv = row.querySelector('.file-actions');
            const isMatch = (row.dataset.path === path) || (item && item.dataset.path === path);

            if (isMatch) {
                row.classList.add('active');
                item?.classList.add('active');
                actionDiv?.classList.add('show-actions');
            } else {
                row.classList.remove('active');
                item?.classList.remove('active');
                if (!row.classList.contains('is-pinned-row')) {
                    actionDiv?.classList.remove('show-actions');
                }
            }
        });
    }
};