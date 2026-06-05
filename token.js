// token.js - 负责管理 GitHub 凭证
const TOKEN_KEY = 'unidoc_github_token';
const REPO_KEY = 'unidoc_github_repo';

const TokenManager = {
    // 保存设置
    save(repo, token) {
        // 清理一下首尾空格，防止复制时带入空格导致报错
        localStorage.setItem(REPO_KEY, repo.trim());
        localStorage.setItem(TOKEN_KEY, token.trim());
    },

    // 获取凭证
    getCredentials() {
        return {
            repo: localStorage.getItem(REPO_KEY) || '',
            token: localStorage.getItem(TOKEN_KEY) || ''
        };
    },

    // 检查是否已经配置完成
    isConfigured() {
        const creds = this.getCredentials();
        return creds.repo !== '' && creds.token !== '';
    },

    // 清除凭证（用于退出登录/重置）
    clear() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REPO_KEY);
    }
};