// main.js - 核心总控制器
const ThemeManager = {
    init() {
        const savedMode = localStorage.getItem('unidoc_theme_mode') || 'light';
        const savedColor = localStorage.getItem('unidoc_nav_color') || 'bg-dark';
        
        this.applyMode(savedMode);
        this.applyNavColor(savedColor);

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
        document.documentElement.setAttribute('data-bs-theme', mode);
        localStorage.setItem('unidoc_theme_mode', mode);
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

async function handleFileSelected(file) {
    if (AppState.isDirty) {
        if (!confirm("当前文件有未保存的修改，强制切换将丢失修改。确定要切换吗？")) return;
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
        const newSha = await GitHubAPI.saveFile(
            AppState.currentFilePath, 
            EditorManager.getContent(), 
            AppState.currentFileSha
        );
        AppState.currentFileSha = newSha;
        UI.setSaved();
        Toast.show('保存成功！', 'success');
    } catch (error) {
        UI.setUnsaved();
        if (error.status === 409) {
            Toast.show('保存失败：文件冲突！其他人可能修改了此文件。', 'error');
        } else {
            Toast.show(`保存失败: ${error.message}`, 'error');
        }
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

    document.querySelectorAll('.ext-select-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('btn-new-ext-display').innerText = e.currentTarget.dataset.ext;
        });
    });

    document.getElementById('btn-confirm-new').addEventListener('click', async () => {
        let baseName = document.getElementById('input-new-filename').value.trim();
        if (!baseName) return Toast.show('文件名不能为空', 'error');
        
        baseName = baseName.replace(/[\/\\:*?"<>|]/g, '-');
        const ext = document.getElementById('btn-new-ext-display').innerText.trim();
        const fileName = baseName + ext;
        const path = `notes/${fileName}`;
        
        newFileModal.hide();
        document.getElementById('input-new-filename').value = ''; 
        UI.showGlobalLoader('正在创建并同步至 GitHub...');

        try {
            let initContent = '';
            if (ext === '.md') initContent = '# ' + baseName;
            else if (ext === '.json') initContent = '{\n\n}';

            const newSha = await GitHubAPI.saveFile(path, initContent, null, 'Create new file via UniDoc');
            Toast.show('创建成功！', 'success');
            setTimeout(async () => {
                await FileTree.load();
                handleFileSelected({ path: path, name: fileName, sha: newSha });
                UI.hideGlobalLoader();
            }, 1500);
        } catch (error) {
            Toast.show(`创建失败: ${error.message}`, 'error');
            UI.statusEl.innerHTML = '';
            UI.hideGlobalLoader();
        }
    });
}

function setupRenameLogic() {
    const renameModal = new bootstrap.Modal(document.getElementById('renameFileModal'));
    window.handleRenameFile = (file) => {
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

    document.getElementById('btn-confirm-rename').addEventListener('click', async () => {
        let newBaseName = document.getElementById('input-rename-filename').value.trim();
        if (!newBaseName) return Toast.show('文件名不能为空', 'error');
        newBaseName = newBaseName.replace(/[\/\\:*?"<>|]/g, '-');

        const oldPath = document.getElementById('input-rename-oldpath').value;
        const oldSha = document.getElementById('input-rename-sha').value;
        const ext = document.getElementById('input-rename-ext').innerText;
        const newName = newBaseName + ext;
        const newPath = `notes/${newName}`;

        if (oldPath === newPath) return renameModal.hide();

        renameModal.hide();
        UI.showGlobalLoader('正在重命名并同步至 GitHub...');

        try {
            const fileData = await GitHubAPI.getFile(oldPath);
            const newSha = await GitHubAPI.saveFile(newPath, fileData.content, null, `Rename ${oldPath} to ${newPath}`);
            await GitHubAPI.deleteFile(oldPath, oldSha);

            Toast.show('重命名成功！', 'success');
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

function setupSidebarResizer() {
    const resizer = document.getElementById('sidebar-resizer');
    const sidebar = document.getElementById('sidebarOffcanvas');
    if (!resizer || !sidebar) return;

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        resizer.classList.add('is-resizing');
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newWidth = startWidth + (e.clientX - startX);
        if (newWidth > 150 && newWidth < 600) {
            sidebar.style.width = newWidth + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('is-resizing');
            document.body.style.cursor = '';
        }
    });
}

// 🌟 升级：独立的动态字体与样式缩放引擎
function setupFontResizer() {
    const fontSlider = document.getElementById('input-font-size');
    const fontDisplay = document.getElementById('font-size-display');
    const fontFamilySelect = document.getElementById('input-font-family');
    if (!fontSlider || !fontDisplay || !fontFamilySelect) return;

    // 1. 读取本地偏好
    const savedFontSize = localStorage.getItem('unidoc_font_size') || '15';
    const savedFontFamily = localStorage.getItem('unidoc_font_family') || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    
    // 初始化 UI 与 CSS 变量
    fontSlider.value = savedFontSize;
    fontDisplay.innerText = savedFontSize + 'px';
    fontFamilySelect.value = savedFontFamily;
    document.documentElement.style.setProperty('--editor-font-size', savedFontSize + 'px');
    document.documentElement.style.setProperty('--editor-font-family', savedFontFamily);

    // 2. 监听大小拖拽实时变更
    fontSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        fontDisplay.innerText = val + 'px';
        document.documentElement.style.setProperty('--editor-font-size', val + 'px');
        localStorage.setItem('unidoc_font_size', val);
    });

    // 3. 监听字体样式切换
    fontFamilySelect.addEventListener('change', (e) => {
        const val = e.target.value;
        document.documentElement.style.setProperty('--editor-font-family', val);
        localStorage.setItem('unidoc_font_family', val);
    });
}

// ==========================================
// 初始化与事件绑定
// ==========================================
async function initApp() {
    ThemeManager.init();
    setupNewFileLogic();
    setupRenameLogic();
    setupSidebarResizer();
    setupFontResizer(); // 🌟 激活字体控制条

    TokenModal.init(async () => {
        if (typeof SettingsManager !== 'undefined') await SettingsManager.init();
        FileTree.load();
    });
    
    FileTree.init(handleFileSelected, handleDeleteFile, window.handleRenameFile);
    await EditorManager.init();
    
    if (typeof ClipboardManager !== 'undefined') ClipboardManager.init(EditorManager);
    if (typeof ExportManager !== 'undefined') ExportManager.init();
    if (typeof GarbageCollector !== 'undefined') GarbageCollector.init();
    
    if (window.visualViewport) {
        const resizeBodyToVisualViewport = () => {
            document.body.style.height = window.visualViewport.height + 'px';
            document.body.style.width = window.visualViewport.width + 'px';
        };
        window.visualViewport.addEventListener('resize', resizeBodyToVisualViewport);
        window.visualViewport.addEventListener('scroll', resizeBodyToVisualViewport);
        resizeBodyToVisualViewport();
    }

    EditorManager.onChange(() => {
        if (!AppState.isDirty && AppState.currentFilePath) UI.setUnsaved();
    });

    document.getElementById('btn-save').addEventListener('click', saveCurrentFile);
    
    // 打开设置弹窗前可以移除默认逻辑，改为直接唤起 modal
    document.getElementById('btn-settings').addEventListener('click', () => {
        new bootstrap.Modal(document.getElementById('tokenModal')).show();
    });

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
        new bootstrap.Modal(document.getElementById('tokenModal')).show();
    } else {
        if (typeof SettingsManager !== 'undefined') await SettingsManager.init();
        FileTree.load();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('✅ PWA Service Worker 注册成功!', reg.scope))
            .catch(err => console.error('❌ PWA 注册失败:', err));
    }
});