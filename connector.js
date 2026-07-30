// connector.js - 核心中间件与事件指令总线 (Command Bus & Telemetry)
const Connector = {
    engine: null,
    actionLog: [], // 遥测日志：记录用户的所有操作历史，供未来 AI 分析上下文

    // 1. 中间件初始化，绑定底层编辑器引擎
    init(editorEngineInstance) {
        this.engine = editorEngineInstance;
        this.log('SYSTEM', 'Connector (中间件) 初始化成功，已接管引擎。');
    },

    // 2. 核心遥测打印机：记录所有动作
    log(action, payload = '') {
        const time = new Date().toLocaleTimeString();
        const logEntry = `[${time}] COMMAND: ${action} ${payload ? '| VALUE: ' + payload : ''}`;
        this.actionLog.push(logEntry);
        
        // 在控制台打印极客蓝色的日志，方便你在 F12 里随时监控数据流！
        console.log(`%c${logEntry}`, 'color: #0d6efd; font-weight: bold;');
    },

    // 3. 唯一的统一指令入口 (UI 层只能调用这个方法)
    execute(action, payload = null) {
        this.log(action, payload);

        if (!this.engine) {
            return Toast.show('系统错误：底层引擎未就绪', 'error');
        }

        // 统一异常捕获：如果底层引擎崩溃，中间件能把报错拦下来，绝不让网页死机！
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
                
                // --- 选取与视图类指令 ---
                case 'SELECT_ALL':
                    this.engine.selectAll();
                    break;
                case 'TOGGLE_PREVIEW':
                    // 让引擎返回解析后的 HTML，由中间件交给 UI（彻底解耦）
                    return this.engine.togglePreview(payload); // payload: true/false
                case 'CHANGE_LANGUAGE':
                    this.engine.setLanguage(payload);
                    break;
                
                // --- 环境偏好类指令 (直接操作 CSS 变量，不麻烦引擎) ---
                case 'CHANGE_FONT_SIZE':
                    document.documentElement.style.setProperty('--editor-font-size', payload + 'px');
                    break;
                case 'CHANGE_FONT_FAMILY':
                    document.documentElement.style.setProperty('--editor-font-family', payload);
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