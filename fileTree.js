// fileTree.js - 侧边栏、极速本地检索与【0ms乐观UI + 云端防冲突同步】星标排位 (v2.3.4)
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
        
        // 点击刷新按钮时，强制从云端重新拉取最新的 .unidoc-settings.json 星标列表与文件列表
        document.getElementById('btn-refresh-tree-pc')?.addEventListener('click', () => this.load(true));
        document.getElementById('btn-refresh-tree-mobile')?.addEventListener('click', () => this.load(true));

        // 当设备窗口从后台切回前台 (focus / visibilitychange) 时，静默同步一次云端星标状态
        window.addEventListener('focus', () => this.syncPinsFromCloudSilently());
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.syncPinsFromCloudSilently();
            }
        });

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
        if (typeof SettingsManager !== 'undefined' && typeof SettingsManager.getPinned === 'function') {
            return SettingsManager.getPinned();
        }
        return [];
    },

    // 🌟 切回窗口时静默检查云端星标是否有变化，若有变化自动重排左侧列表！
    async syncPinsFromCloudSilently() {
        if (!navigator.onLine || typeof SettingsManager === 'undefined' || !this.currentFilesCache.length) return;
        try {
            const hasChanged = await SettingsManager.pullLatest();
            if (hasChanged) {
                this.render(this.currentFilesCache);
                if (typeof AppState !== 'undefined' && AppState.currentFilePath) {
                    this.setActive(AppState.currentFilePath);
                }
            }
        } catch (e) {}
    },

    // 🌟 0ms 乐观置顶重排 + 后台防冲突写入云端 .unidoc-settings.json
    async togglePin(path) {
        if (typeof SettingsManager === 'undefined') return;
        if (!Array.isArray(SettingsManager.data.pinned)) SettingsManager.data.pinned = [];

        const pList = SettingsManager.data.pinned;
        const idx = pList.indexOf(path);
        const isNowPinned = (idx === -1);

        // 1. 0 毫秒立即修改内存并重新渲染置顶排序（极致跟手！）
        if (isNowPinned) pList.push(path);
        else pList.splice(idx, 1);

        localStorage.removeItem('unidoc_pinned_files');
        this.render(this.currentFilesCache);
        if (typeof AppState !== 'undefined' && AppState.currentFilePath) {
            this.setActive(AppState.currentFilePath);
        }

        // 2. 立即推送至 GitHub 云端（内置 409 SHA 冲突自动解决）
        try {
            await SettingsManager.save();
            Toast.show(isNowPinned ? '⭐ 已星标置顶 (已同步云端)' : '已取消星标 (已同步云端)', 'success');
        } catch (err) {
            Toast.show(`云端星标同步失败: ${err.message}`, 'error');
        }
    },

    async load(forcePullCloudSettings = false) {
        this.container = document.getElementById('file-tree');
        this.container.innerHTML = '<div class="text-muted small p-2"><i class="fa-solid fa-spinner fa-spin me-2"></i>正在拉取云端数据...</div>';
        try {
            // 如果点击了刷新按钮，同时并行拉取最新云端星标配置与文件列表！
            if (forcePullCloudSettings && typeof SettingsManager !== 'undefined' && typeof SettingsManager.pullLatest === 'function') {
                await SettingsManager.pullLatest();
            }

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