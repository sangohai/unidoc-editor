// main.js - 核心总控制器

// ==========================================
// 全局状态管理 (State)
// ==========================================
const AppState = {
    currentFilePath: null, // 当前正在编辑的文件路径 (例如 notes/test.md)
    currentFileSha: null,  // 当前文件的 GitHub SHA (每次更新都必须提供旧 SHA)
    isDirty: false,        // 当前文件是否被修改且未保存
    isSaving: false        // 是否正在保存中 (防止连击)
};

// ==========================================
// UI 状态更新工具
// ==========================================
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
    }
};

// ==========================================
// 核心业务流程
// ==========================================

// 1. 处理文件选中事件（从左侧菜单触发）
async function handleFileSelected(file) {
    // 切换文件前的“防丢”拦截
    if (AppState.isDirty) {
        const confirmLeave = confirm("当前文件有未保存的修改，强制切换将丢失修改。确定要切换吗？");
        if (!confirmLeave) return;
    }

    UI.setLoading();
    EditorManager.setContent('加载中，请稍候...', file.name); // 占位提示
    
    try {
        // 请求 API 获取文件内容
        const fileData = await GitHubAPI.getFile(file.path);
        
        // 更新全局状态
        AppState.currentFilePath = file.path;
        AppState.currentFileSha = fileData.sha;
        
        // 将真实内容赋予编辑器
        EditorManager.setContent(fileData.content, file.name);
        UI.setSaved();
        
    } catch (error) {
        Toast.show(`读取文件失败: ${error.message}`, 'error');
        EditorManager.setContent(`读取失败: ${error.message}`, 'error.txt');
    }
}

// 2. 核心保存逻辑
async function saveCurrentFile() {
    if (!AppState.currentFilePath) {
        Toast.show('没有打开任何文件', 'info');
        return;
    }
    if (!AppState.isDirty) {
        return; // 没修改就不发请求
    }
    if (AppState.isSaving) return; // 防抖防重

    AppState.isSaving = true;
    UI.setSaving();
    
    const content = EditorManager.getContent();
    
    try {
        // 调用 API 保存文件
        const newSha = await GitHubAPI.saveFile(
            AppState.currentFilePath, 
            content, 
            AppState.currentFileSha
        );
        
        // 【关键】更新内存中的 SHA，否则下一次保存会报冲突 (409 Error)
        AppState.currentFileSha = newSha;
        UI.setSaved();
        Toast.show('保存成功！', 'success');
        
    } catch (error) {
        UI.setUnsaved();
        if (error.status === 409) {
            Toast.show('保存失败：文件冲突！其他人可能修改了此文件。', 'error');
            // 此处可以扩展：弹出强制覆盖确认框
        } else {
            Toast.show(`保存失败: ${error.message}`, 'error');
        }
    } finally {
        AppState.isSaving = false;
    }
}

// ==========================================
// 初始化与事件绑定
// ==========================================
async function initApp() {
    // 1. 初始化弹窗与左侧文件树
    // 传入回调：当 Token 填好并保存后，自动刷新文件列表
    TokenModal.init(() => FileTree.load());
    
    // 传入回调：当左侧文件被点击后，执行读取流程
    FileTree.init(handleFileSelected);

    // 2. 初始化 Monaco 编辑器
    await EditorManager.init();
    
    // 监听编辑器内容输入事件
    EditorManager.onChange(() => {
        if (!AppState.isDirty && AppState.currentFilePath) {
            UI.setUnsaved();
        }
    });

    // 3. 绑定顶部按钮事件
    document.getElementById('btn-save').addEventListener('click', saveCurrentFile);
    document.getElementById('btn-settings').addEventListener('click', () => TokenModal.show());

    // 4. 绑定全局快捷键 (Ctrl+S / Cmd+S)
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault(); // 阻止浏览器弹出原生的保存网页对话框
            saveCurrentFile();
        }
    });

    // 5. 绑定防误关窗口拦截
    window.addEventListener('beforeunload', (e) => {
        if (AppState.isDirty) {
            // 现代浏览器会忽略我们自定义的文本，但只要 e.returnValue 有值就会弹出系统确认框
            e.preventDefault();
            e.returnValue = '有未保存的修改，确定要离开吗？';
        }
    });

    // 6. 鉴权检查：应用启动时的首要判断
    if (!TokenManager.isConfigured()) {
        // 没配置过，强制弹出配置窗口
        TokenModal.show();
    } else {
        // 配置过了，直接拉取侧边栏列表
        FileTree.load();
    }
}

// 当 DOM 解析完毕后，正式点亮系统
document.addEventListener('DOMContentLoaded', initApp);