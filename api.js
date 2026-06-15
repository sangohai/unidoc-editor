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
            // 特殊处理：404 有时是因为文件不存在，409 是因为 SHA 冲突
            const error = new Error(errorData.message || `请求失败: ${response.status}`);
            error.status = response.status;
            throw error;
        }

        return response.json();
    },

    // 1. 获取目录下的文件列表（带时间戳防缓存）
    async getFiles(path = 'notes') {
        try {
            const data = await this._request(`/contents/${path}?t=${Date.now()}`);
            // 过滤掉文件夹，只返回文件列表
            return data.filter(item => item.type === 'file');
        } catch (error) {
            if (error.status === 404) return [];
            throw error;
        }
    },

    // 2. 获取单个文件内容与 SHA 值
    async getFile(path) {
        const data = await this._request(`/contents/${path}?t=${Date.now()}`);
        
        // 纯文本使用 js-base64 库安全解码中文
        const content = Base64.decode(data.content);
        
        return {
            content: content,
            sha: data.sha 
        };
    },

    // 3. 保存（更新/创建）纯文本文件
    async saveFile(path, content, sha, commitMessage = 'Update via UniDoc Editor') {
        // 纯文本使用 js-base64 库安全编码
        const encodedContent = Base64.encode(content);
        
        const body = {
            message: commitMessage,
            content: encodedContent
        };
        
        if (sha) {
            body.sha = sha;
        }

        const data = await this._request(`/contents/${path}`, 'PUT', body);
        
        return data.content.sha;
    },

    // 4. 删除文件
    async deleteFile(path, sha) {
        const body = {
            message: `Delete ${path} via UniDoc`,
            sha: sha
        };
        await this._request(`/contents/${path}`, 'DELETE', body);
    },

    // 🌟 5. 【新增】上传图片图床专用接口
    async uploadImage(path, pureBase64Data, commitMessage = 'Upload image via UniDoc') {
        // 图片本身已经是完美的 Base64，不需要任何额外的库去转码，直接传给 GitHub
        const body = {
            message: commitMessage,
            content: pureBase64Data
        };
        
        // 调用 PUT 创建图片文件 (因为是以时间戳命名，不会有重复，所以不需要传 sha)
        const data = await this._request(`/contents/${path}`, 'PUT', body);
        
        // 上传成功后，返回 GitHub 中的文件相对路径 (如 notes/images/img_123.png)
        return data.content.path;
    }
};

