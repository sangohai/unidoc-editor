// fileTree.js - 渲染左侧文件列表
const FileTree = {
    container: document.getElementById('file-tree'),
    onFileClick: null,

    // 初始化：绑定刷新按钮，接收点击回调
    init(onFileClickCallback) {
        this.onFileClick = onFileClickCallback;
        
        document.getElementById('btn-refresh-tree').addEventListener('click', () => {
            this.load();
        });
    },

    // 核心加载逻辑
    async load() {
        this.container.innerHTML = '<div class="text-muted small p-2"><i class="fa-solid fa-spinner fa-spin me-2"></i>正在拉取数据...</div>';
        
        try {
            const files = await GitHubAPI.getFiles('notes');
            this.render(files);
        } catch (error) {
            if (error.message === 'NOT_CONFIGURED') {
                this.container.innerHTML = '<div class="text-warning small p-2"><i class="fa-solid fa-triangle-exclamation me-1"></i>请先配置 GitHub Token</div>';
            } else {
                this.container.innerHTML = `<div class="text-danger small p-2">加载失败: ${error.message}</div>`;
                Toast.show('获取文件列表失败', 'error');
            }
        }
    },

    // 渲染文件列表 DOM
    render(files) {
        if (files.length === 0) {
            this.container.innerHTML = '<div class="text-muted small p-2">目录为空，请先在 notes 文件夹下创建文件</div>';
            return;
        }

        this.container.innerHTML = ''; // 清空加载中提示
        
        files.forEach(file => {
            const div = document.createElement('div');
            div.className = 'file-item text-truncate';
            div.dataset.path = file.path;
            
            // 根据后缀匹配一下图标
            let iconClass = 'fa-file-lines';
            if (file.name.endsWith('.md')) iconClass = 'fa-markdown fa-brands';
            if (file.name.endsWith('.json') || file.name.endsWith('.yaml')) iconClass = 'fa-file-code';

            div.innerHTML = `<i class="${iconClass} text-secondary me-2 icon-indicator"></i>${file.name}`;
            
            // 绑定点击事件
            div.addEventListener('click', () => {
                this.setActive(file.path);
                
                // 如果在手机端，点击文件后自动收起左侧抽屉
                const offcanvasEl = document.getElementById('sidebarOffcanvas');
                const offcanvasInstance = bootstrap.Offcanvas.getInstance(offcanvasEl);
                if (offcanvasInstance) {
                    offcanvasInstance.hide();
                }

                // 通知 main.js 去读取这个文件的内容
                if (this.onFileClick) {
                    this.onFileClick(file);
                }
            });

            this.container.appendChild(div);
        });
    },

    // 设置当前选中文件的 UI 高亮
    setActive(path) {
        const items = this.container.querySelectorAll('.file-item');
        items.forEach(item => {
            const icon = item.querySelector('.icon-indicator');
            if (item.dataset.path === path) {
                item.classList.add('active');
                icon.classList.remove('text-secondary'); // 选中时图标变白
            } else {
                item.classList.remove('active');
                icon.classList.add('text-secondary'); // 没选中时变灰
            }
        });
    }
};