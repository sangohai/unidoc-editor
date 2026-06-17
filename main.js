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
        
        // 设置 Monaco 编辑器主题
        if (typeof monaco !== 'undefined' && EditorManager.instance) {
            monaco.editor.setTheme(mode === 'dark' ? 'vs-dark' : 'vs-light');
        }

        document.querySelectorAll('.theme-mode-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.theme-mode-btn[data-mode="${mode}"]`)?.classList.add('active');
    },

    applyNavColor(colorClass) {
        const nav = document.getElementById('top-navbar');
        nav.classList.remove('bg-dark', 'bg-primary', 'bg-success');
        nav.classList.add(colorClass);
        localStorage.setItem('unidoc_nav_color', colorClass);

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

// 4. 处理新建文件逻辑
function setupNewFileLogic() {
    const newFileModal = new bootstrap.Modal(document.getElementById('newFileModal'));
    
    // 唤起弹窗
    document.getElementById('btn-new-file-pc')?.addEventListener('click', () => newFileModal.show());
    document.getElementById('btn-new-file-mobile')?.addEventListener('click', () => newFileModal.show());

    // 监听后缀名下拉菜单的选择事件
    document.querySelectorAll('.ext-select-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            // 将选中的后缀名更新到按钮的文字上
            document.getElementById('btn-new-ext-display').innerText = e.currentTarget.dataset.ext;
        });
    });

    // 确认创建提交
    document.getElementById('btn-confirm-new').addEventListener('click', async () => {
        // 提取纯文件名
        let baseName = document.getElementById('input-new-filename').value.trim();
        if (!baseName) return Toast.show('文件名不能为空', 'error');
        
        // 提取当前选中的后缀名，并组合成完整文件名
        const ext = document.getElementById('btn-new-ext-display').innerText.trim();
        const fileName = baseName + ext;
        const path = `notes/${fileName}`;
        
        newFileModal.hide();
        document.getElementById('input-new-filename').value = ''; 
        
        UI.showGlobalLoader('正在创建并同步至 GitHub...');

        try {
            // 根据选中的后缀名，生成不同的初始模板内容
            let initContent = '';
            if (ext === '.md') initContent = '# ' + baseName;
            else if (ext === '.json') initContent = '{\n\n}';
            else if (ext === '.yaml' || ext === '.txt') initContent = ''; 

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

// 5. 重命名文件逻辑
function setupRenameLogic() {
    const renameModal = new bootstrap.Modal(document.getElementById('renameFileModal'));

    // 暴露给 fileTree 调用的弹窗唤醒函数
    window.handleRenameFile = (file) => {
        // 防止重命名带有未保存修改的文件
        if (AppState.currentFilePath === file.path && AppState.isDirty) {
            Toast.show('请先保存当前文件的修改，再进行重命名', 'info');
            return;
        }

        const oldName = file.name;
        const extIndex = oldName.lastIndexOf('.');
        const nameWithoutExt = extIndex > 0 ? oldName.substring(0, extIndex) : oldName;
        const ext = extIndex > 0 ? oldName.substring(extIndex) : '';

        document.getElementById('input-rename-filename').value = nameWithoutExt;
        document.getElementById('input-rename-ext').innerText = ext;
        document.getElementById('input-rename-oldpath').value = file.path;
        document.getElementById('input-rename-sha').value = file.sha;

        renameModal.show();
    };

    // 确认重命名提交
    document.getElementById('btn-confirm-rename').addEventListener('click', async () => {
        const newBaseName = document.getElementById('input-rename-filename').value.trim();
        if (!newBaseName) return Toast.show('文件名不能为空', 'error');

        const oldPath = document.getElementById('input-rename-oldpath').value;
        const oldSha = document.getElementById('input-rename-sha').value;
        const ext = document.getElementById('input-rename-ext').innerText;
        
        const newName = newBaseName + ext;
        const newPath = `notes/${newName}`;

        if (oldPath === newPath) {
            renameModal.hide();
            return;
        }

        renameModal.hide();
        UI.showGlobalLoader('正在重命名并同步至 GitHub...');

        try {
            // 步骤1：获取原文件内容
            const fileData = await GitHubAPI.getFile(oldPath);
            // 步骤2：以新名称保存文件
            const newSha = await GitHubAPI.saveFile(newPath, fileData.content, null, `Rename ${oldPath} to ${newPath}`);
            // 步骤3：删除原文件
            await GitHubAPI.deleteFile(oldPath, oldSha);

            Toast.show('重命名成功！', 'success');

            // 如果重命名的正是当前打开的文件，默默更新它的后台指向，不打断用户编辑
            if (AppState.currentFilePath === oldPath) {
                AppState.currentFilePath = newPath;
                AppState.currentFileSha = newSha;
            }

            await FileTree.load();
        } catch (error) {
            Toast.show(`重命名失败: ${error.message}`, 'error');
        } finally {
            UI.hideGlobalLoader();
        }
    });
}

// ==========================================
// 6. 初始化与事件绑定
// ==========================================
async function initApp() {
    ThemeManager.init();

    setupNewFileLogic();
    setupRenameLogic();

    TokenModal.init(() => FileTree.load());
    FileTree.init(handleFileSelected, handleDeleteFile, window.handleRenameFile);
    
    await EditorManager.init();
    
    if (typeof ClipboardManager !== 'undefined') ClipboardManager.init(EditorManager);
    
    // 🌟 初始化导出模块
    if (typeof ExportManager !== 'undefined') ExportManager.init();
    
    // 🌟 核心防线：修复手机虚拟键盘弹出时，网页被强行上推遮挡顶部的 Bug
    if (window.visualViewport) {
        const resizeBodyToVisualViewport = () => {
            // 强行把 body 高度压缩到键盘上方的真实可用区域内，阻止系统粗暴推移
            document.body.style.height = window.visualViewport.height + 'px';
            // 唤醒 Monaco 重新计算内部布局
            if (EditorManager.instance) {
                setTimeout(() => EditorManager.instance.layout(), 50);
            }
        };
        // 监听虚拟键盘的弹出与收起
        window.visualViewport.addEventListener('resize', resizeBodyToVisualViewport);
        // 初始化执行一次
        resizeBodyToVisualViewport();
    }

    const currentMode = document.documentElement.getAttribute('data-bs-theme');
    monaco.editor.setTheme(currentMode === 'dark' ? 'vs-dark' : 'vs-light');

    EditorManager.onChange(() => {
        if (!AppState.isDirty && AppState.currentFilePath) UI.setUnsaved();
    });

    document.getElementById('btn-save').addEventListener('click', saveCurrentFile);
    document.getElementById('btn-settings').addEventListener('click', () => TokenModal.show());

    // 绑定快捷键保存 (Ctrl+S / Cmd+S)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault(); 
            saveCurrentFile();
        }
    });

    // 拦截页面关闭
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

document.addEventListener('DOMContentLoaded', () => {
    // 启动主程序
    initApp();

    // 🌟 注册 PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ PWA Service Worker 注册成功!', reg.scope))
            .catch(err => console.error('❌ PWA 注册失败:', err));
    }
});