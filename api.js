// api.js - 封装 GitHub REST API
const GitHubAPI = {
    baseURL: 'https://api.github.com',

    // 内部通用请求方法
    async _request(endpoint, method = 'GET', body = null) {
        const { repo, token } = TokenManager.getCredentials();
        
        if (!repo || !token) {
            throw new Error('NOT_CONFIGURED');
        }

        const headers = {
            'Accept': 'application/vnd.github+json',
            'Authorization': `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28'
        };

        const config = { method, headers };
        if (body) {
            config.body = JSON.stringify(body);
        }

        const url = `${this.baseURL}/repos/${repo}${endpoint}`;
        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // 特殊处理：404 有时是因为文件不存在（比如获取空目录），409 是因为 SHA 冲突
            const error = new Error(errorData.message || `请求失败: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        return response.json();
    },

    // 1. 获取目录下的文件列表
    async getFiles(path = 'notes') {
        try {
            // 加入 ?t=时间戳，强制 GitHub 不走缓存，实时返回最新列表！
            const data = await this._request(`/contents/${path}?t=${Date.now()}`);
            return data.filter(item => item.type === 'file');
        } catch (error) {
            if (error.status === 404) return [];
            throw error;
        }
    },

    // 2. 获取单个文件内容与 SHA 值
    async getFile(path) {
        const data = await this._request(`/contents/${path}`);
        
        // 【核心防坑点】: GitHub 返回的是 Base64，如果是中文，直接 atob 会乱码
        // 这里必须使用我们在 index.html 中引入的 js-base64 库 (Base64.decode)
        const content = Base64.decode(data.content);
        
        return {
            content: content,
            sha: data.sha  // 保存时必须带上这个 sha 防冲突
        };
    },

    // 3. 保存（更新/创建）文件
    async saveFile(path, content, sha, commitMessage = 'Update via UniDoc Editor') {
        // 中文转 Base64，同样使用 js-base64 库
        const encodedContent = Base64.encode(content);
        
        const body = {
            message: commitMessage,
            content: encodedContent
        };
        
        // 如果是更新已有文件，必须提供它当前的 sha 值
        if (sha) {
            body.sha = sha;
        }

        const data = await this._request(`/contents/${path}`, 'PUT', body);
        
        // 返回新的 sha 值给前端更新状态
        return data.content.sha;
    }, // <-- 注意这里的逗号，很可能是之前漏掉导致报错的原因

    // 4. 删除文件
    async deleteFile(path, sha) {
        const body = {
            message: `Delete ${path} via UniDoc`,
            sha: sha
        };
        await this._request(`/contents/${path}`, 'DELETE', body);
    }
};