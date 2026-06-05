// modal.js - 控制 Token 设置弹窗
const TokenModal = {
    modalInstance: null,
    onSaveCallback: null,

    // 初始化（由 main.js 调用）
    init(onSave) {
        // 创建 Bootstrap Modal 实例
        this.modalInstance = new bootstrap.Modal(document.getElementById('tokenModal'));
        this.onSaveCallback = onSave;

        // 绑定“保存并连接”按钮点击事件
        document.getElementById('btn-save-token').addEventListener('click', () => {
            const repo = document.getElementById('input-repo').value.trim();
            const token = document.getElementById('input-token').value.trim();

            if (!repo || !token) {
                Toast.show('仓库和 Token 不能为空！', 'error');
                return;
            }

            // 调用 token.js 将凭证存入本地
            TokenManager.save(repo, token);
            this.hide();
            Toast.show('配置已保存！', 'success');

            // 触发回调，告诉控制器“配置好了，可以去拉取数据了”
            if (this.onSaveCallback) {
                this.onSaveCallback();
            }
        });
    },

    // 显示弹窗并回显已有的配置
    show() {
        const creds = TokenManager.getCredentials();
        document.getElementById('input-repo').value = creds.repo;
        document.getElementById('input-token').value = creds.token;
        this.modalInstance.show();
    },

    hide() {
        this.modalInstance.hide();
    }
};