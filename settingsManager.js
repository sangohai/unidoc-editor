// settingsManager.js - 负责跨端同步：星标置顶 & 自定义词库
const SettingsManager = {
    path: 'notes/.unidoc-settings.json',
    sha: null,
    data: {
        pinned: [],
        snippets: [
            { title: "示例问候", content: "你好！这是一条来自自定义词库的快捷短语。" },
            { title: "示例分隔线", content: "------------------------" }
        ]
    },

    async init() {
        try {
            const fileData = await GitHubAPI.getFile(this.path);
            this.sha = fileData.sha;
            this.data = JSON.parse(fileData.content);
        } catch (error) {
            console.log("未找到云端配置或拉取失败，使用默认配置");
        }
        
        if (!this.data.snippets) this.data.snippets = [];
        if (!this.data.pinned) this.data.pinned = [];
        
        this.renderSnippetsMenu();
        this.bindModalEvents();
    },

    async save() {
        const jsonContent = JSON.stringify(this.data, null, 2);
        try {
            const newSha = await GitHubAPI.saveFile(this.path, jsonContent, this.sha, 'Sync UniDoc Settings');
            this.sha = newSha;
        } catch (error) {
            console.error("配置云同步失败: ", error);
        }
    },

    getPinned() {
        return this.data.pinned || [];
    },

    async togglePin(filePath) {
        const index = this.data.pinned.indexOf(filePath);
        if (index > -1) {
            this.data.pinned.splice(index, 1);
        } else {
            this.data.pinned.push(filePath);
        }
        await this.save(); 
    },

    renderSnippetsMenu() {
        const menu = document.getElementById('snippets-menu');
        if (!menu) return;
        
        menu.innerHTML = ''; 
        
        if (this.data.snippets.length === 0) {
            const emptyLi = document.createElement('li');
            emptyLi.innerHTML = `<span class="dropdown-item text-muted small">词库空空如也~</span>`;
            menu.appendChild(emptyLi);
        }

        this.data.snippets.forEach((snip, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item d-flex justify-content-between align-items-center" href="#">
                <span class="fw-bold">${snip.title}</span>
                <span class="snippet-content-preview small ms-3 text-muted">${snip.content}</span>
            </a>`;
            
            li.addEventListener('click', (e) => {
                e.preventDefault();
                // 💥 修复点：抛弃底层的 EditorManager，直接走高贵的 Connector 中间件！
                if (typeof Connector !== 'undefined') {
                    Connector.execute('INSERT_TEXT', snip.content);
                }
            });
            menu.appendChild(li);
        });

        const divider = document.createElement('li');
        divider.innerHTML = `<hr class="dropdown-divider">`;
        menu.appendChild(divider);

        const manageBtn = document.createElement('li');
        manageBtn.innerHTML = `<a class="dropdown-item fw-bold text-primary" href="#" id="btn-manage-snippets">
            <i class="fa-solid fa-gear me-2"></i>管理词库...
        </a>`;
        menu.appendChild(manageBtn);

        document.getElementById('btn-manage-snippets').addEventListener('click', (e) => {
            e.preventDefault();
            this.openManagerModal();
        });
    },

    openManagerModal() {
        this.renderManagerList();
        new bootstrap.Modal(document.getElementById('snippetsModal')).show();
    },

    renderManagerList() {
        const list = document.getElementById('snippets-manager-list');
        list.innerHTML = '';
        
        if (this.data.snippets.length === 0) {
            list.innerHTML = '<div class="p-3 text-center text-muted small">没有快捷短语，快在下方添加一个吧！</div>';
            return;
        }

        this.data.snippets.forEach((snip, index) => {
            const div = document.createElement('div');
            div.className = 'snippet-list-item d-flex justify-content-between align-items-center p-2 border-bottom';
            div.innerHTML = `
                <div class="text-truncate flex-grow-1 pe-2">
                    <div class="fw-bold fs-6">${snip.title}</div>
                    <div class="text-muted small text-truncate">${snip.content}</div>
                </div>
                <button class="btn btn-sm btn-outline-danger border-0" title="删除"><i class="fa-solid fa-trash-can"></i></button>
            `;
            div.querySelector('button').addEventListener('click', async () => {
                if(confirm(`确定删除词库 [${snip.title}] 吗？`)) {
                    this.data.snippets.splice(index, 1);
                    this.renderManagerList();
                    this.renderSnippetsMenu();
                    await this.save();
                }
            });
            list.appendChild(div);
        });
    },

    bindModalEvents() {
        const btnAdd = document.getElementById('btn-add-snippet');
        const newBtnAdd = btnAdd.cloneNode(true);
        btnAdd.parentNode.replaceChild(newBtnAdd, btnAdd);

        newBtnAdd.addEventListener('click', async () => {
            const titleInput = document.getElementById('input-snippet-title');
            const contentInput = document.getElementById('input-snippet-content');
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            if (!title || !content) return Toast.show('标题和内容都不能为空！', 'warning');

            this.data.snippets.push({ title, content });
            titleInput.value = '';
            contentInput.value = '';
            
            this.renderManagerList();
            this.renderSnippetsMenu();
            await this.save(); 
            Toast.show('词库添加成功，已同步云端！', 'success');
        });
    }
};