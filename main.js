// main.js - 核心调度指挥中心
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

function getLanguageFromFileName(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'md') return 'markdown';
    if (ext === 'json') return 'json';
    if (ext === 'yaml' || ext === 'yml') return 'yaml';
    if (ext === 'txt') return 'plaintext';
    return 'plaintext';
}

async function handleFileSelected(file) {
    if (AppState.isDirty) {
        if (!confirm("当前文件有未保存的修改，强制切换将丢失修改。确定要切换吗？")) return;
    }
    UI.setLoading();
    const lang = getLanguageFromFileName(file.name);
    
    if (typeof EditorManager !== 'undefined') {
        EditorManager.setContent('加载中，请稍候...', lang); 
    }
    
    try {
        const fileData = await GitHubAPI.getFile(file.path);
        AppState.currentFilePath = file.path;
        AppState.currentFileSha = fileData.sha;
        
        if (typeof EditorManager !== 'undefined') {
            EditorManager.setContent(fileData.content, lang);
        }
        UI.setSaved();
    } catch (error) {
        Toast.show(`读取失败: ${error.message}`, 'error');
        if (typeof EditorManager !== 'undefined') {
            EditorManager.setContent(`读取失败: ${error.message}`, 'plaintext');
        }
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
            if (typeof EditorManager !== 'undefined') EditorManager.setContent('文件已删除', 'plaintext');
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

    // 1. 初始化时读取本地存储的记忆宽度
    const savedWidth = localStorage.getItem('unidoc_sidebar_width');
    if (savedWidth) {
        sidebar.style.width = savedWidth + 'px';
    }

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;
        resizer.classList.add('is-resizing');
        document.body.style.cursor = 'col-resize';
        e.preventDefault(); // 防止拖拽时误选中旁边文本
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        const newWidth = startWidth + (e.clientX - startX);
        // 动态边界：最小 150px，最大放宽到 800px 以适应超长文件名
        if (newWidth > 150 && newWidth < 800) {
            sidebar.style.width = newWidth + 'px';
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('is-resizing');
            document.body.style.cursor = '';
            
            // 2. 拖拽结束：记忆宽度并强制触发视口重绘 (拯救 CM6 布局)
            localStorage.setItem('unidoc_sidebar_width', sidebar.style.width.replace('px', ''));
            window.dispatchEvent(new Event('resize')); 
        }
    });

    // 3. 极客彩蛋：双击把手，一键恢复默认宽度
    resizer.addEventListener('dblclick', () => {
        sidebar.style.width = '260px';
        localStorage.setItem('unidoc_sidebar_width', '260');
        window.dispatchEvent(new Event('resize'));
    });
}

function setupCommandPalette() {
    const cmdModal = new bootstrap.Modal(document.getElementById('commandPaletteModal'));
    const searchInput = document.getElementById('input-command-search');
    const listContainer = document.getElementById('command-list-container');
    if (!searchInput || !listContainer) return;

    const commandTree = [
        { name: "✨ Prompt 提纯 (剔除冗余助词)", action: "OPTIMIZE_PROMPT", icon: "fa-wand-magic-sparkles text-warning" },
        { name: "折叠所有区块 (Fold All)", action: "FOLD_ALL", icon: "fa-compress text-primary" },
        { name: "展开所有区块 (Unfold All)", action: "UNFOLD_ALL", icon: "fa-expand text-primary" },
        { name: "加粗 (Bold)", action: "FORMAT_BOLD", icon: "fa-bold" },
        { name: "斜体 (Italic)", action: "FORMAT_ITALIC", icon: "fa-italic" },
        { name: "插入代码块 (Code Block)", action: "FORMAT_CODE", icon: "fa-code" },
        { name: "原生自动排版 (Format JSON)", action: "FORMAT_DOCUMENT", icon: "fa-align-left" },
        { name: "全选文档 (Select All)", action: "SELECT_ALL", icon: "fa-object-group" },
        { name: "格式清洗机 (Sanitize)", action: "SANITIZE_FORMAT", icon: "fa-eraser" },
        { name: "物理锚点：设为起点", action: "SET_ANCHOR", icon: "fa-flag" },
        { name: "物理锚点：选中至此", action: "SELECT_TO_HERE", icon: "fa-bullseye" },
        { name: "切换 预览/编辑 模式", action: "TOGGLE_PREVIEW", icon: "fa-eye" },
        { name: "粉碎剪贴板 (Shred Clipboard)", action: "SHRED_CLIPBOARD", icon: "fa-broom text-danger" }
    ];

    const renderCommands = (filterText = '') => {
        listContainer.innerHTML = '';
        const lowerFilter = filterText.toLowerCase();
        
        commandTree.forEach(cmd => {
            if (cmd.name.toLowerCase().includes(lowerFilter)) {
                const btn = document.createElement('button');
                btn.className = 'list-group-item list-group-item-action d-flex align-items-center py-3 border-0 border-bottom';
                const iconClass = cmd.icon.includes('text-') ? cmd.icon : `${cmd.icon} text-secondary`;
                btn.innerHTML = `<i class="fa-solid ${iconClass} me-3 fs-5" style="width:24px;text-align:center;"></i><span class="fs-6">${cmd.name}</span>`;
                
                btn.addEventListener('click', () => {
                    searchInput.blur(); 
                    cmdModal.hide();
                    if (cmd.action === 'TOGGLE_PREVIEW') {
                        document.getElementById('btn-toggle-preview').click();
                    } else if (cmd.action === 'SHRED_CLIPBOARD') {
                        if (typeof ClipboardManager !== 'undefined') ClipboardManager.shredClipboard();
                    } else {
                        if (typeof Connector !== 'undefined') Connector.execute(cmd.action);
                    }
                });
                listContainer.appendChild(btn);
            }
        });
    };

    window.openCommandPalette = () => {
        searchInput.value = '';
        renderCommands();
        cmdModal.show();
        setTimeout(() => searchInput.focus(), 200); 
    };

    searchInput.addEventListener('input', (e) => renderCommands(e.target.value));
}

// 🌟 修复：确保排版绑定事件只在 Connector 和 Engine 挂载成功后才执行！
function bindTypographyEvents() {
    const fontSlider = document.getElementById('input-font-size');
    const fontDisplay = document.getElementById('font-size-display');
    const fontFamilySelect = document.getElementById('input-font-family');
    const syntaxThemeSelect = document.getElementById('input-syntax-theme');

    if (fontSlider && fontDisplay && fontFamilySelect && syntaxThemeSelect) {
        const savedFontSize = localStorage.getItem('unidoc_font_size') || '15';
        const savedFontFamily = localStorage.getItem('unidoc_font_family') || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        const savedSyntaxTheme = localStorage.getItem('unidoc_syntax_theme') || 'default';
        
        fontSlider.value = savedFontSize;
        fontDisplay.innerText = savedFontSize + 'px';
        fontFamilySelect.value = savedFontFamily;
        syntaxThemeSelect.value = savedSyntaxTheme;

        // 向下通知渲染 (此时 Connector 必然已准备好)
        if (typeof Connector !== 'undefined') {
            Connector.execute('CHANGE_FONT_SIZE', savedFontSize);
            Connector.execute('CHANGE_FONT_FAMILY', savedFontFamily);
            Connector.execute('CHANGE_SYNTAX_THEME', savedSyntaxTheme);
        }

        fontSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            fontDisplay.innerText = val + 'px';
            localStorage.setItem('unidoc_font_size', val);
            if (typeof Connector !== 'undefined') Connector.execute('CHANGE_FONT_SIZE', val);
        });

        fontFamilySelect.addEventListener('change', (e) => {
            const val = e.target.value;
            localStorage.setItem('unidoc_font_family', val);
            if (typeof Connector !== 'undefined') Connector.execute('CHANGE_FONT_FAMILY', val);
        });

        syntaxThemeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            localStorage.setItem('unidoc_syntax_theme', val);
            if (typeof Connector !== 'undefined') Connector.execute('CHANGE_SYNTAX_THEME', val);
        });
    }

    const toggleBtn = document.getElementById('btn-toggle-preview');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const preview = document.getElementById('preview-container');
            const btnIcon = toggleBtn.querySelector('i');
            const btnText = toggleBtn.querySelector('.btn-text');
            const toolbar = document.getElementById('editor-toolbar');
            
            if (preview.classList.contains('d-none')) {
                const html = typeof Connector !== 'undefined' ? Connector.execute('TOGGLE_PREVIEW', true) : '';
                if(html !== undefined) document.getElementById('markdown-preview').innerHTML = html;
                
                preview.classList.remove('d-none');
                btnIcon.classList.replace('fa-eye', 'fa-pen');
                if(btnText) btnText.innerText = '编辑';
                toolbar.style.setProperty('display', 'none', 'important');
            } else {
                if (typeof Connector !== 'undefined') Connector.execute('TOGGLE_PREVIEW', false);
                preview.classList.add('d-none');
                btnIcon.classList.replace('fa-pen', 'fa-eye');
                if(btnText) btnText.innerText = '预览';
                toolbar.style.setProperty('display', 'flex', 'important');
            }
        });
    }
}

// ==========================================
// 初始化生命周期 (重构顺序，解决依赖崩溃)
// ==========================================
async function initApp() {
    ThemeManager.init();
    setupNewFileLogic();
    setupRenameLogic();
    setupSidebarResizer();
    setupCommandPalette();

    TokenModal.init(async () => {
        if (typeof SettingsManager !== 'undefined') await SettingsManager.init();
        FileTree.load();
    });
    
    FileTree.init(handleFileSelected, handleDeleteFile, window.handleRenameFile);
    
    // 💥 1. 先等待最核心的编辑器引擎完整下载并初始化完毕
    if (typeof EditorManager !== 'undefined') await EditorManager.init();
    
    // 💥 2. 再让中间件安全地接管引擎
    if (typeof Connector !== 'undefined') {
        Connector.init(EditorManager);
    }
    
    // 💥 3. 最后再绑定那些需要调用中间件的排版 UI，彻底根除“引擎未就绪”报错！
    bindTypographyEvents();
    
    if (typeof CharPicker !== 'undefined') {
        CharPicker.init((char) => {
            if (typeof Connector !== 'undefined') Connector.execute('INSERT_TEXT', char);
        });
    }
    
    if (typeof ClipboardManager !== 'undefined') ClipboardManager.init(EditorManager);
    if (typeof ExportManager !== 'undefined') ExportManager.init();
    if (typeof GarbageCollector !== 'undefined') GarbageCollector.init();
    
    if (window.visualViewport) {
        const resizeBodyToVisualViewport = () => {
            document.body.style.height = window.visualViewport.height + 'px';
            document.body.style.width = window.visualViewport.width + 'px';
            window.scrollTo(0, 0); 
            if (typeof EditorManager !== 'undefined' && EditorManager.instance) {
                setTimeout(() => EditorManager.instance.layout(), 100);
            }
        };
        window.visualViewport.addEventListener('resize', resizeBodyToVisualViewport);
        window.visualViewport.addEventListener('scroll', resizeBodyToVisualViewport);
        resizeBodyToVisualViewport();
    }

    if (typeof EditorManager !== 'undefined') {
        EditorManager.onChange(() => {
            if (!AppState.isDirty && AppState.currentFilePath) UI.setUnsaved();
        });
    }

    document.getElementById('btn-save').addEventListener('click', saveCurrentFile);
    document.getElementById('btn-settings').addEventListener('click', () => {
        TokenModal.show();
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
        TokenModal.show();
    } else {
        if (typeof SettingsManager !== 'undefined') await SettingsManager.init();
        FileTree.load();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // 🛡️ [Patch-1] PWA 幽灵缓存防御：开发环境自毁与物理隔离
    if ('serviceWorker' in navigator) {
        // 精准侦测本地 Live Server 环境
        const isLocalhost = Boolean(
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '[::1]'
        );

        if (isLocalhost) {
            // 🚨 开发模式：主动搜寻并狙击所有残留的幽灵 Service Worker
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                if (registrations.length > 0) {
                    for (let registration of registrations) {
                        registration.unregister();
                    }
                    console.warn('🚧 [Dev Mode] 已强制物理注销所有 PWA 幽灵缓存，确保代码 100% 实时生效！');
                    // 强制清理完成后，建议刷新一次确保接管网络的是原生浏览器
                }
            });
        } else {
            // 🌐 生产环境：执行正常的 PWA 注册与幽灵缓存热重载防御
            navigator.serviceWorker.register('sw.js').then(reg => {
                console.log('✅ PWA Service Worker 注册成功!', reg.scope);
                reg.update(); // 每次启动强制对比字节码
                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            UI.showGlobalLoader('🚀 探测到云端新引擎，正在执行热重载...');
                            setTimeout(() => window.location.reload(), 1500);
                        }
                    });
                });
            }).catch(err => console.error('❌ PWA 注册失败:', err));
        }
    }
});