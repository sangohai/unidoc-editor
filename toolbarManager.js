// toolbarManager.js - 数据驱动的工具栏装配流水线 (v2.4.5 原生多色荧光笔调色盘版)
const ToolbarManager = {
    container: null,
    currentLayout: [],
    
    registry: {
        'UNDO': { icon: 'fa-rotate-left', title: '撤销 (Ctrl+Z)', showIn: ['all'] },
        'REDO': { icon: 'fa-rotate-right', title: '重做 (Ctrl+Y)', showIn: ['all'] },
        'FORMAT_BOLD': { icon: 'fa-bold', title: '加粗选中文字 <strong>', showIn: ['markdown'] },
        'FORMAT_ITALIC': { icon: 'fa-italic', title: '斜体选中文字 <em>', showIn: ['markdown'] },
        'FORMAT_LINK': { icon: 'fa-link', title: '插入超链接 <a>', showIn: ['markdown'] },
        'FORMAT_IMAGE': { icon: 'fa-regular fa-image', title: '插入图片 <figure>', showIn: ['markdown'] },
        'FOLD_ALL': { icon: 'fa-compress', color: 'text-primary', title: '折叠全部 <details>', showIn: ['markdown'] },
        'UNFOLD_ALL': { icon: 'fa-expand', color: 'text-primary', title: '展开全部 <details>', showIn: ['markdown'] },
        'FORMAT_DOCUMENT': { icon: 'fa-wand-magic-sparkles', title: '原生排版', text: '原生排版', showIn: ['json', 'yaml'] },
        'SELECT_ALL': { icon: 'fa-object-group', title: '全选', showIn: ['all'] },
        'SANITIZE_FORMAT': { icon: 'fa-eraser', title: '清洗无效空行与冗余格式', showIn: ['all'] },
        'GARBAGE_COLLECT': { icon: 'fa-recycle', color: 'text-danger', title: '清理无用图片', showIn: ['all'] },
        'VIEW_CLIPBOARD': { icon: 'fa-clipboard-check', color: 'text-info', title: '查看剪贴板', showIn: ['all'] },
        'COMMAND_PALETTE': { icon: 'fa-bolt', color: 'text-warning', title: '命令控制台', showIn: ['all'] }
    },

    complexComponents: {
        'FORMAT_MARK': { id: 'tool-mark', icon: 'fa-highlighter', color: 'text-warning', title: '多彩荧光笔 <mark>', showIn: ['markdown'] },
        'EMOJI': { id: 'tool-emoji', icon: 'fa-face-smile', title: '表情面板', showIn: ['markdown'] },
        'SYMBOL': { id: 'tool-symbol', textIcon: 'Ω', title: '特殊符号', showIn: ['markdown'] },
        'TYPOGRAPHY': { id: 'tool-typography', icon: 'fa-text-height', title: '阅读排版设置', showIn: ['all'] },
        'SNIPPETS': { id: 'tool-snippets', icon: 'fa-book-bookmark', title: '自定义词库', showIn: ['all'] }
    },

    _sanitizeLayout(layoutArray) {
        const deprecatedBlockTools = ['FORMAT_H1', 'FORMAT_H2', 'FORMAT_H3', 'FORMAT_DETAILS', 'FORMAT_BLOCKQUOTE', 'FORMAT_CODE'];
        let cleaned = Array.isArray(layoutArray)
            ? layoutArray.filter(id => !deprecatedBlockTools.includes(id))
            : ['UNDO', 'REDO', '|', 'FORMAT_BOLD', 'FORMAT_ITALIC', 'FORMAT_MARK', 'FORMAT_LINK', 'FORMAT_IMAGE', '|', 'FOLD_ALL', 'UNFOLD_ALL', '|', 'EMOJI', 'SYMBOL', 'TYPOGRAPHY', 'SNIPPETS', '|', 'SANITIZE_FORMAT', 'COMMAND_PALETTE'];

        if (!cleaned.includes('FORMAT_MARK')) {
            const idx = cleaned.indexOf('FORMAT_ITALIC');
            if (idx !== -1) cleaned.splice(idx + 1, 0, 'FORMAT_MARK');
            else cleaned.push('FORMAT_MARK');
        }
        return cleaned;
    },

    init(layoutArray) {
        this.container = document.getElementById('editor-toolbar-content');
        this.currentLayout = this._sanitizeLayout(layoutArray);

        if (typeof SettingsManager !== 'undefined' && SettingsManager.data) {
            SettingsManager.data.toolbarLayout = [...this.currentLayout];
        }

        this._bindMarkColorPickerEvents();
        
        const btnSave = document.getElementById('btn-save-toolbar');
        if (btnSave) {
            btnSave.onclick = async () => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('toolbarCustomizeModal'));
                if (modal) modal.hide();

                UI.showGlobalLoader('正在应用并同步工具栏配置...');
                try {
                    await SettingsManager.save();
                    setTimeout(() => {
                        this.render(typeof EditorManager !== 'undefined' ? EditorManager.currentLanguage : 'markdown');
                        UI.hideGlobalLoader();
                        Toast.show('工具栏已更新', 'success');
                    }, 600);
                } catch (err) {
                    UI.hideGlobalLoader();
                    Toast.show('配置同步失败', 'error');
                }
            };
        }
        this.render(typeof EditorManager !== 'undefined' ? EditorManager.currentLanguage : 'markdown'); 
    },

    // 🌟 绑定原生多色荧光笔面板事件 (防失焦保护)
    _bindMarkColorPickerEvents() {
        const panel = document.getElementById('mark-color-panel');
        if (!panel || panel.dataset.bound === 'true') return;
        panel.dataset.bound = 'true';

        panel.addEventListener('mousedown', (e) => {
            if (e.target.tagName.toLowerCase() !== 'input') {
                e.preventDefault();
            }
        });

        // 5 种预设护眼色卡点击即涂
        panel.querySelectorAll('.mark-swatch-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const color = btn.dataset.color;
                if (typeof EditorManager !== 'undefined' && typeof EditorManager.applyHighlightColor === 'function') {
                    EditorManager.applyHighlightColor(color);
                }
            });
        });

        // 原生 <input type="color"> 自由拾取颜色
        const customInput = document.getElementById('input-custom-mark-color');
        customInput?.addEventListener('input', (e) => {
            const color = e.target.value;
            if (typeof EditorManager !== 'undefined' && typeof EditorManager.applyHighlightColor === 'function') {
                EditorManager.applyHighlightColor(color);
            }
        });

        // 一键清除高亮 <mark>
        document.getElementById('btn-clear-mark')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof EditorManager !== 'undefined' && typeof EditorManager.applyHighlightColor === 'function') {
                EditorManager.applyHighlightColor(null);
            }
        });
    },

    updateForLanguage(lang) {
        this.render(lang);
    },

    getAllTools() {
        const tools = [];
        Object.keys(this.registry).forEach(k => tools.push({ id: k, ...this.registry[k] }));
        Object.keys(this.complexComponents).forEach(k => tools.push({ id: k, ...this.complexComponents[k] }));
        return tools;
    },

    openCustomizeModal() {
        const modal = new bootstrap.Modal(document.getElementById('toolbarCustomizeModal'));
        const list = document.getElementById('toolbar-customize-list');
        list.innerHTML = '';
        
        if (typeof SettingsManager !== 'undefined' && SettingsManager.data) {
            SettingsManager.data.toolbarLayout = this._sanitizeLayout(SettingsManager.data.toolbarLayout);
        }
        const layoutRef = (typeof SettingsManager !== 'undefined' && SettingsManager.data)
            ? SettingsManager.data.toolbarLayout
            : this.currentLayout;

        const allTools = this.getAllTools();
        
        allTools.forEach(tool => {
            const isChecked = layoutRef.includes(tool.id) ? 'checked' : '';
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center py-3';
            
            const iconHTML = tool.textIcon 
                ? `<span class="fw-bold fs-5 ${tool.color || 'text-secondary'} me-3" style="display:inline-block; width: 24px; text-align: center;">${tool.textIcon}</span>`
                : `<i class="fa-solid ${tool.icon} ${tool.color || 'text-secondary'} me-3 fs-5" style="width: 24px; text-align: center;"></i>`;

            li.innerHTML = `
                <div>
                    ${iconHTML}
                    <span class="fs-6 fw-bold">${tool.title}</span>
                </div>
                <div class="form-check form-switch fs-5 mb-0">
                    <input class="form-check-input toolbar-switch" type="checkbox" data-id="${tool.id}" ${isChecked}>
                </div>
            `;
            list.appendChild(li);
        });
        
        list.querySelectorAll('.toolbar-switch').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = e.target.dataset.id;
                if (e.target.checked) {
                    if (!layoutRef.includes(id)) layoutRef.push(id); 
                } else {
                    const idx = layoutRef.indexOf(id);
                    if (idx > -1) layoutRef.splice(idx, 1); 
                }
                this.currentLayout = [...layoutRef];
            });
        });
        
        modal.show();
    },

    render(currentLang = 'markdown') {
        this.container = document.getElementById('editor-toolbar-content');
        if (!this.container) return;
        
        const pool = document.getElementById('toolbar-components-pool');
        if (pool) {
            Object.values(this.complexComponents).forEach(conf => {
                const el = document.getElementById(conf.id);
                if (el && el.parentNode === this.container) {
                    el.classList.add('d-none');
                    pool.appendChild(el);
                }
            });
        }

        this.container.innerHTML = ''; 

        let visibleItems = [];
        this.currentLayout.forEach(item => {
            if (item === '|') {
                visibleItems.push('|');
            } else if (this.complexComponents[item]) {
                if (this.complexComponents[item].showIn.includes('all') || this.complexComponents[item].showIn.includes(currentLang)) {
                    visibleItems.push(item);
                }
            } else if (this.registry[item]) {
                if (this.registry[item].showIn.includes('all') || this.registry[item].showIn.includes(currentLang)) {
                    visibleItems.push(item);
                }
            }
        });

        let cleanedItems = [];
        for (let i = 0; i < visibleItems.length; i++) {
            if (visibleItems[i] === '|') {
                if (cleanedItems.length === 0 || cleanedItems[cleanedItems.length - 1] === '|') continue;
            }
            cleanedItems.push(visibleItems[i]);
        }
        if (cleanedItems.length > 0 && cleanedItems[cleanedItems.length - 1] === '|') {
            cleanedItems.pop();
        }

        cleanedItems.forEach(item => {
            if (item === '|') {
                const divider = document.createElement('span');
                divider.className = 'border-end mx-1 my-1';
                divider.style.height = '20px';
                this.container.appendChild(divider);
            } 
            else if (this.complexComponents[item]) {
                const el = document.getElementById(this.complexComponents[item].id);
                if (el) {
                    el.classList.remove('d-none');
                    this.container.appendChild(el);
                }
            } 
            else if (this.registry[item]) {
                const conf = this.registry[item];
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-sm btn-outline-secondary border-0 py-0 px-2 my-1';
                btn.title = conf.title;
                btn.dataset.action = item;

                let innerHTML = `<i class="fa-solid ${conf.icon} ${conf.color || ''}"></i>`;
                if (conf.text) innerHTML += `<span class="ms-1" style="font-size: 13px;">${conf.text}</span>`;
                btn.innerHTML = innerHTML;

                btn.addEventListener('mousedown', (e) => e.preventDefault());
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof Connector !== 'undefined') Connector.execute(item);
                });

                this.container.appendChild(btn);
            }
        });

        const customizeGroup = document.createElement('div');
        customizeGroup.className = 'ms-2 d-flex align-items-center border-start ps-2 flex-shrink-0 my-1';
        customizeGroup.innerHTML = `
            <button type="button" class="btn btn-sm btn-outline-success border-0 py-0 px-2" data-action="CUSTOMIZE_TOOLBAR" title="自定义工具栏">
                <i class="fa-solid fa-plus"></i>
            </button>
        `;
        
        customizeGroup.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (typeof Connector !== 'undefined') Connector.execute('CUSTOMIZE_TOOLBAR');
            });
        });

        this.container.appendChild(customizeGroup);
    }
};