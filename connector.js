// connector.js - 核心中间件与事件指令总线 (Command Bus & Telemetry)
const Connector = {
    engine: null,
    actionLog: [], 

    init(editorEngineInstance) {
        this.engine = editorEngineInstance;
        this.log('SYSTEM', 'Connector (中间件) 初始化成功，已接管引擎。');
    },

    log(action, payload = '') {
        const time = new Date().toLocaleTimeString();
        const logEntry = `[${time}] COMMAND: ${action} ${payload ? '| VALUE: ' + payload : ''}`;
        this.actionLog.push(logEntry);
        console.log(`%c${logEntry}`, 'color: #0d6efd; font-weight: bold;');
    },

    execute(action, payload = null) {
        this.log(action, payload);

        if (!this.engine) {
            return Toast.show('系统错误：底层引擎未就绪', 'error');
        }

        try {
            switch (action) {
                // --- 文本修改类指令 ---
                case 'FORMAT_BOLD':
                case 'FORMAT_ITALIC':
                case 'FORMAT_LINK':
                case 'FORMAT_IMAGE':
                case 'FORMAT_CODE':
                    this.engine.applyMarkdownFormat(action.split('_')[1].toLowerCase());
                    break;
                case 'INSERT_TEXT':
                    this.engine.insertTextAtCursor(payload);
                    break;
                case 'SANITIZE_FORMAT':
                    this.engine.sanitizeFormat();
                    break;
                case 'FORMAT_DOCUMENT':
                    this.engine.formatCodeDocument();
                    break;

                // 🌟 新增：AST 树状折叠与提纯指令
                case 'FOLD_ALL':
                    this.engine.foldAll();
                    break;
                case 'UNFOLD_ALL':
                    this.engine.unfoldAll();
                    break;
                case 'OPTIMIZE_PROMPT':
                    this.engine.optimizePrompt();
                    break;
                
                // --- 选取与视图类指令 ---
                case 'SELECT_ALL':
                    this.engine.selectAll();
                    break;
                case 'SET_ANCHOR':
                    this.engine.setAnchor();
                    break;
                case 'SELECT_TO_HERE':
                    this.engine.selectToHere();
                    break;
                case 'TOGGLE_PREVIEW':
                    return this.engine.togglePreview(payload); 

                // --- 环境偏好类指令 ---
                case 'CHANGE_LANGUAGE':
                    this.engine.setLanguage(payload);
                    break;
                case 'CHANGE_FONT_SIZE':
                    document.documentElement.style.setProperty('--editor-font-size', payload + 'px');
                    break;
                case 'CHANGE_FONT_FAMILY':
                    document.documentElement.style.setProperty('--editor-font-family', payload);
                    break;
                case 'CHANGE_SYNTAX_THEME':
                    // 仅当引擎有此方法时调用（预留接口）
                    if(this.engine.setSyntaxTheme) this.engine.setSyntaxTheme(payload);
                    break;
                case 'COMMAND_PALETTE':
                    if (window.openCommandPalette) window.openCommandPalette();
                    break;

                default:
                    console.warn(`未知的指令: ${action}`);
            }
        } catch (error) {
            console.error(`指令 [${action}] 执行失败:`, error);
            Toast.show(`操作失败: ${error.message}`, 'error');
        }
    }
};