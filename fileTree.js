// fileTree.js - 渲染侧边栏、极速本地检索与星标置顶排位
const FileTree = {
    container: document.getElementById('file-tree'),
    searchInput: document.getElementById('input-search-files'),
    onFileClick: null,
    onDeleteClick: null,
    onRenameClick: null,
    
    currentFilesCache: [], // 缓存当前所有的文件数据，避免频繁拉取 API
    pinnedFiles: JSON.parse(localStorage.getItem('unidoc_pinned_files') || '[]'), // 从本地读取置顶名单

    init(onFileClickCallback, onDeleteClickCallback, onRenameClickCallback) {
        this.onFileClick = onFileClickCallback;
        this.onDeleteClick = onDeleteClickCallback; 
        this.onRenameClick = onRenameClickCallback;
        
        document.getElementById('btn-refresh-tree-pc')?.addEventListener('click', () => this.load());
        document.getElementById('btn-refresh-tree-mobile')?.addEventListener('click', () => this.load());

        // 🌟 初始化毫秒级本地搜索过滤引擎
        this.initSearchEngine();
    },

    // 0延迟前端过滤器
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

    // 切换置顶状态
    togglePin(path) {
        const index = this.pinnedFiles.indexOf(path);
        if (index > -1) {
            this.pinnedFiles.splice(index, 1); // 移除置顶
        } else {
            this.pinnedFiles.push(path); // 加入置顶
        }
        // 永久化保存到浏览器本地
        localStorage.setItem('unidoc_pinned_files', JSON.stringify(this.pinnedFiles));
        
        // 使用缓存数据直接重新渲染并排序，无需发网络请求！
        this.render(this.currentFilesCache);
        
        // 如果当前编辑器有打开的文件，恢复它的高亮状态
        if (AppState.currentFilePath) {
            this.setActive(AppState.currentFilePath);
        }
    },

    async load() {
        this.container.innerHTML = '<div class="text-muted small p-2"><i class="fa-solid fa-spinner fa-spin me-2"></i>正在拉取数据...</div>';
        try {
            const files = await GitHubAPI.getFiles('notes');
            this.currentFilesCache = files; // 更新本地缓存
            this.render(files);
            
            // 数据拉取回来后，如果搜索框里还有字，自动触发一次过滤
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

        // 🌟 核心排序引擎：置顶的文件永远在前，其余按名称字母顺序排列
        let sortedFiles = [...files];
        sortedFiles.sort((a, b) => {
            const aPinned = this.pinnedFiles.includes(a.path);
            const bPinned = this.pinnedFiles.includes(b.path);
            
            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return a.name.localeCompare(b.name, 'zh-CN'); // 加入中文拼音排序支持
        });

        this.container.innerHTML = ''; 
        
        sortedFiles.forEach(file => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'file-row d-flex justify-content-between align-items-center mb-1 pe-1';
            // 将文件名挂载在属性上，供搜索引起毫秒级检索
            rowDiv.dataset.name = file.name; 
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'file-item text-truncate flex-grow-1 p-2 rounded';
            itemDiv.dataset.path = file.path;
            
            let iconClass = 'fa-file-lines'; 
            if (file.name.endsWith('.md')) iconClass = 'fa-markdown fa-brands';
            else if (file.name.match(/\.(json|yaml|yml)$/i)) iconClass = 'fa-file-code';

            itemDiv.innerHTML = `<i class="${iconClass} text-secondary me-2 icon-indicator"></i>${file.name}`;
            
            // 操作按钮组
            const actionDiv = document.createElement('div');
            actionDiv.className = 'file-actions d-flex align-items-center ms-1';

            // 🌟 1. 置顶星标按钮
            const isPinned = this.pinnedFiles.includes(file.path);
            const pinBtn = document.createElement('i');
            // 根据状态切换图标：置顶是实心金星，未置顶是空心灰星
            pinBtn.className = isPinned ? 'fa-solid fa-star star-pinned p-1 me-1 action-btn' : 'fa-regular fa-star text-secondary p-1 me-1 action-btn';
            pinBtn.title = isPinned ? "取消置顶" : "设为置顶";

            // 2. 重命名按钮
            const renameBtn = document.createElement('i');
            renameBtn.className = 'fa-solid fa-pen-to-square text-secondary p-1 me-1 action-btn';
            renameBtn.title = "重命名";

            // 3. 删除按钮
            const delBtn = document.createElement('i');
            delBtn.className = 'fa-solid fa-trash-can text-secondary p-1 action-btn';
            delBtn.title = "删除文件";

            actionDiv.appendChild(pinBtn);
            actionDiv.appendChild(renameBtn);
            actionDiv.appendChild(delBtn);

            rowDiv.appendChild(itemDiv);
            rowDiv.appendChild(actionDiv);
            
            // ======== 事件绑定 ========
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