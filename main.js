// main.js - 核心总控制器

// ==========================================
// 1. 主题与色彩管理 (ThemeManager)
// ==========================================
const ThemeManager = {
    init() {
        const savedMode = localStorage.getItem('unidoc_theme_mode') || 'light';
        const savedColor = localStorage.getItem('unidoc_nav_color') || 'bg-dark';
        
        this.applyMode(savedMode);
        this.applyNavColor(savedColor);

        // 绑定菜单点击事件
        document.querySelectorAll('.theme-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyMode(e.currentTarget.dataset.mode);
            });
        });

        document.querySelectorAll('.theme-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyNavColor(e.currentTarget.dataset.color);
            });
        });
    },

    applyMode(mode) {
        // 设置 Bootstrap 主题
        document.documentElement.setAttribute('data-bs-theme', mode);
        localStorage.setItem('unidoc_theme_mode', mode);
        
        // 设置 Monaco 编辑器主题 (如果已初始化)
        if (typeof monaco !== 'undefined' && EditorManager.instance) {
            monaco.editor.setTheme(mode === 'dark' ? 'vs-dark' : 'vs-light');
        }

        // 更新菜单的勾选状态
        document.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.theme-mode-btn[data-mode="${mode}"]`)?.classList.add('active');
    },

    applyNavColor(colorClass) {
        const nav = document.getElementById('top-navbar');
        // 移除原有的背景色，贴上新颜色
        nav.classList.remove('bg-dark', 'bg-primary', 'bg-success');
        nav.classList.add(colorClass);
        localStorage.setItem('unidoc_nav_color', colorClass);

        // 更新菜单的勾选状态
        document.querySelectorAll('.theme-nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.theme-nav-btn[data-color="${colorClass}"]`)?.classList.add('active');
    }
};

// ==========================================
// 2. 全局状态与 UI 工具
// ==========================================
const AppState = {
    currentFilePath: null, 
    currentFileSha: null,  
    isDirty: false,        
    isSaving: false        
};

const UI = {
    statusEl: document.getElementById('save-status'),
    setSaved() {
        this.statusEl.innerHTML = '<i class="fa-solid fa-cloud-check me-1 text-success"></i><span class="d-none d-md-inline text-success">已保存</span>';
        AppState.isDirty = false;
    },
    setUnsaved() {
        this.statusEl.innerHTML = '<i class="fa-solid fa-asterisk me-1 text-warning"></i><span class="d-none d-md-inline text-warning">未保存</span>';
        AppState.isDirty = true;
    },
    setSaving() {
        this.statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1 text-info"></i><span class="d-none d-md-inline text-info">保存中...</span>';
    },
    setLoading() {
        this.statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i><span class="d-none d-md-inline">加载中...</span>';
    },
    showGlobalLoader(text = '处理中...') {
        document.getElementById('global-loader-text').innerText = text;
        document.getElementById('global-loader').classList.remove('d-none');
        document.getElementById('global-loader').classList.add('d-flex');
    },
    hideGlobalLoader() {
        document.getElementById('global-loader').classList.remove('d-flex');
        document.getElementById('global-loader').classList.add('d-none');
    }
};

// ==========================================
// 3. 核心业务流程
// ==========================================
async function handleFileSelected(file) {
    if (AppState.isDirty) {
        const confirmLeave = confirm("当前文件有未保存的修改，强制切换将丢失修改。确定要切换吗？");
        if (!confirmLeave) return;
    }
    UI.setLoading();
    EditorManager.setContent('加载中，请稍候...', file.name); 
    try {
        const fileData = await GitHubAPI.getFile(file.path);
        AppState.currentFilePath = file.path;
        AppState.currentFileSha = fileData.sha;
        EditorManager.setContent(fileData.content, file.name);
        UI.setSaved();
    } catch (error) {
        Toast.show(`读取失败: ${error.message}`, 'error');
        EditorManager.setContent(`读取失败: ${error.message}`, 'error.txt');
    }
}

async function saveCurrentFile() {
    if (!AppState.currentFilePath) return Toast.show('没有打开任何文件', 'info');
    if (!AppState.isDirty || AppState.isSaving) return; 

    AppState.isSaving = true;
    UI.setSaving();
    try {
        const newSha = await GitHubAPI.saveFile(AppState.currentFilePath, EditorManager.getContent(), AppState.currentFileSha);
        AppState.currentFileSha = newSha;
        UI.setSaved();
        Toast.show('保存成功！', 'success');
    } catch (error) {
        UI.setUnsaved();
        Toast.show(error.status === 409 ? '冲突！其他人可能修改了此文件。' : `保存失败: ${error.message}`, 'error');
    } finally {
        AppState.isSaving = false;
    }
}

async function handleDeleteFile(file) {
    if (!confirm(`确定要永久删除 [ ${file.name} ] 吗？\n删除后不可恢复！`)) return;
    UI.showGlobalLoader('正在删除文件...');
    try {
        await GitHubAPI.deleteFile(file.path, file.sha);
        Toast.show('文件已删除', 'success');
        if (AppState.currentFilePath === file.path) {
            AppState.currentFilePath = null;
            AppState.currentFileSha = null;
            AppState.isDirty = false;
            EditorManager.setContent('文件已删除', 'deleted.txt');
            UI.statusEl.innerHTML = '';
        }
        await FileTree.load();
    } catch (error) {
        Toast.show(`删除失败: ${error.message}`, 'error');
        UI.setSaved();
    } finally {
        UI.hideGlobalLoader();
    }
}

function setupNewFileLogic() {
    const newFileModal = new bootstrap.Modal(document.getElementById('newFileModal'));
    document.getElementById('btn-new-file-pc')?.addEventListener('click', () => newFileModal.show());
    document.getElementById('btn-new-file-mobile')?.addEventListener('click', () => newFileModal.show());

    document.getElementById('btn-confirm-new').addEventListener('click', async () => {
        let fileName = document.getElementById('input-new-filename').value.trim();
        if (!fileName) return Toast.show('文件名不能为空', 'error');
        if (!fileName.match(/\.(md|json|yaml|yml)$/i)) fileName += '.md'; 

        const path = `notes/${fileName}`;
        newFileModal.hide();
        document.getElementById('input-new-filename').value = ''; 
        UI.showGlobalLoader('正在创建并同步至 GitHub...');

        try {
            const initContent = fileName.endsWith('.json') ? '{\n\n}' : '# ' + fileName.replace(/\.[^/.]+$/, "");
            const newSha = await GitHubAPI.saveFile(path, initContent, null, 'Create new file via UniDoc');
            Toast.show('创建成功！', 'success');
            setTimeout(async () => {
                await FileTree.load();
                handleFileSelected({ path: path, name: fileName, sha: newSha });
                UI.hideGlobalLoader();
            }, 500);
        } catch (error) {
            Toast.show(`创建失败: ${error.message}`, 'error');
            UI.statusEl.innerHTML = '';
            UI.hideGlobalLoader();
        }
    });
}

// ==========================================
// 4. 初始化与事件绑定
// ==========================================
async function initApp() {
    // 初始化皮肤管理
    ThemeManager.init();

    TokenModal.init(() => FileTree.load());
    FileTree.init(handleFileSelected, handleDeleteFile);
    setupNewFileLogic();

    await EditorManager.init();
    
    // 初始化编辑器后，补发一次主题同步，确保 Monaco 是黑底的
    const currentMode = document.documentElement.getAttribute('data-bs-theme');
    monaco.editor.setTheme(currentMode === 'dark' ? 'vs-dark' : 'vs-light');

    EditorManager.onChange(() => {
        if (!AppState.isDirty && AppState.currentFilePath) UI.setUnsaved();
    });

    document.getElementById('btn-save').addEventListener('click', saveCurrentFile);
    document.getElementById('btn-settings').addEventListener('click', () => TokenModal.show());

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault(); 
            saveCurrentFile();
        }
    });

    window.addEventListener('beforeunload', (e) => {
        if (AppState.isDirty) {
            e.preventDefault();
            e.returnValue = '有未保存的修改，确定要离开吗？';
        }
    });

    if (!TokenManager.isConfigured()) {
        TokenModal.show();
    } else {
        FileTree.load();
    }
}

document.addEventListener('DOMContentLoaded', initApp);