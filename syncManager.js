// syncManager.js - Google Keep 级 IndexedDB 本地优先存储 + 前台智能心跳实时同步引擎 (v2.2.1)
const SyncManager = {
    dbName: 'UniDocKeepDB',
    storeName: 'notes_cache',
    db: null,

    localSaveTimer: null,
    cloudSyncTimer: null,
    heartbeatTimer: null,
    lastEditTime: 0,
    lastWakeCheckTime: 0,
    isSyncing: false,

    // 1. 初始化 IndexedDB 与 Google Keep 生命周期 + 前台智能心跳
    async init() {
        try {
            this.db = await this._openDB();
            console.log('✅ [SyncManager] IndexedDB 本地优先存储引擎已就绪');
        } catch (err) {
            console.warn('⚠️ [SyncManager] IndexedDB 初始化受限，将降级为直连模式:', err);
        }

        this._bindKeepLifecycleEvents();
        this._startSmartHeartbeat();
    },

    _openDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) return reject(new Error('浏览器不支持 IndexedDB'));
            const request = indexedDB.open(this.dbName, 1);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'path' });
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    // ==========================================
    // IndexedDB 基础 CRUD 封装
    // ==========================================
    async getLocalRecord(path) {
        if (!this.db || !path) return null;
        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction(this.storeName, 'readonly');
                const store = tx.objectStore(this.storeName);
                const req = store.get(path);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            } catch (e) {
                resolve(null);
            }
        });
    },

    async putLocalRecord(record) {
        if (!this.db || !record || !record.path) return;
        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction(this.storeName, 'readwrite');
                const store = tx.objectStore(this.storeName);
                store.put(record);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => resolve(false);
            } catch (e) {
                resolve(false);
            }
        });
    },

    async deleteLocalCache(path) {
        if (!this.db || !path) return;
        return new Promise((resolve) => {
            try {
                const tx = this.db.transaction(this.storeName, 'readwrite');
                tx.objectStore(this.storeName).delete(path);
                tx.oncomplete = () => resolve(true);
            } catch (e) {
                resolve(false);
            }
        });
    },

    async renameLocalCache(oldPath, newPath, newSha, content) {
        await this.deleteLocalCache(oldPath);
        await this.putLocalRecord({
            path: newPath,
            content: content,
            sha: newSha,
            isDirty: false,
            updatedAt: Date.now()
        });
    },

    // ==========================================
    // 核心 1：打字/拖拽时 250ms 落盘 IndexedDB + 停顿 3.5 秒极速自动推云端
    // ==========================================
    onLocalEdit(content) {
        if (typeof AppState === 'undefined' || !AppState.currentFilePath) return;
        const path = AppState.currentFilePath;
        const sha = AppState.currentFileSha;

        this.lastEditTime = Date.now();
        AppState.isDirty = true;
        this._updateStatusUI('LOCAL_SAVING');

        // 1. 250ms 防抖极速写入本地 IndexedDB
        clearTimeout(this.localSaveTimer);
        this.localSaveTimer = setTimeout(async () => {
            await this.putLocalRecord({
                path: path,
                content: content,
                sha: sha,
                isDirty: true,
                updatedAt: Date.now()
            });
            if (AppState.isDirty && !this.isSyncing) {
                this._updateStatusUI('LOCAL_SAVED');
            }
        }, 250);

        // 2. 🌟 提速：打字停顿满 3.5 秒，立即在后台静默推送至 GitHub 云端！
        clearTimeout(this.cloudSyncTimer);
        this.cloudSyncTimer = setTimeout(() => {
            if (AppState.isDirty && navigator.onLine) {
                this.syncToCloud(true);
            }
        }, 3500);
    },

    // ==========================================
    // 核心 2：打开文档时的“本地缓存秒开 + 后台远端校验/块级合并”
    // ==========================================
    async openDocument(file, lang) {
        if (AppState.isDirty && AppState.currentFilePath && AppState.currentFilePath !== file.path) {
            await this.syncToCloud(true);
        }

        const localRec = await this.getLocalRecord(file.path);

        if (localRec && typeof localRec.content === 'string') {
            AppState.currentFilePath = file.path;
            AppState.currentFileSha = localRec.sha || file.sha;
            AppState.isDirty = Boolean(localRec.isDirty);

            if (typeof EditorManager !== 'undefined') {
                EditorManager.setContent(localRec.content, lang);
            }
            this._updateStatusUI(localRec.isDirty ? 'LOCAL_SAVED' : 'CLOUD_SYNCED');

            // 后台立即校验远端新版本
            this._verifyWithRemoteInBackground(file.path, lang, localRec);
            return;
        }

        UI.setLoading();
        if (typeof EditorManager !== 'undefined') {
            EditorManager.setContent('正在从云端拉取文档...', lang);
        }

        const remoteData = await GitHubAPI.getFile(file.path);
        AppState.currentFilePath = file.path;
        AppState.currentFileSha = remoteData.sha;
        AppState.isDirty = false;

        if (typeof EditorManager !== 'undefined') {
            EditorManager.setContent(remoteData.content, lang);
        }

        await this.putLocalRecord({
            path: file.path,
            content: remoteData.content,
            sha: remoteData.sha,
            isDirty: false,
            updatedAt: Date.now()
        });
        this._updateStatusUI('CLOUD_SYNCED');
    },

    async _verifyWithRemoteInBackground(path, lang, localRec) {
        if (!navigator.onLine || this.isSyncing) return;
        // 如果当前用户正在这台设备上高频打字（距离最后一次敲击不足 3 秒），暂不拉取以免打断输入法
        if (Date.now() - this.lastEditTime < 3000) return;

        try {
            const remoteData = await GitHubAPI.getFile(path);
            if (AppState.currentFilePath !== path || this.isSyncing) return;

            const currentLocal = (await this.getLocalRecord(path)) || localRec;
            const currentSha = AppState.currentFileSha || (currentLocal && currentLocal.sha);

            if (remoteData.sha !== currentSha) {
                if (!AppState.isDirty && !(currentLocal && currentLocal.isDirty)) {
                    // 情况 1：本机未改，另一台设备推了新内容 -> 自动无感热更新画布！
                    AppState.currentFileSha = remoteData.sha;
                    if (typeof EditorManager !== 'undefined') {
                        const scrollPos = EditorManager.container ? EditorManager.container.scrollTop : 0;
                        EditorManager.setContent(remoteData.content, lang);
                        if (EditorManager.container) EditorManager.container.scrollTop = scrollPos;
                    }
                    await this.putLocalRecord({
                        path: path,
                        content: remoteData.content,
                        sha: remoteData.sha,
                        isDirty: false,
                        updatedAt: Date.now()
                    });
                    this._updateStatusUI('CLOUD_SYNCED');
                    Toast.show('🔄 已实时同步其他设备的新增内容', 'info');
                } else {
                    // 情况 2：两台设备同时改了 -> 块级时间戳智能合并！
                    const latestLocalContent = typeof EditorManager !== 'undefined' ? EditorManager.getContent() : currentLocal.content;
                    const mergedContent = this._mergeHtmlByBlockTimestamps(latestLocalContent, remoteData.content, lang);
                    AppState.currentFileSha = remoteData.sha;
                    if (typeof EditorManager !== 'undefined') {
                        const scrollPos = EditorManager.container ? EditorManager.container.scrollTop : 0;
                        EditorManager.setContent(mergedContent, lang);
                        if (EditorManager.container) EditorManager.container.scrollTop = scrollPos;
                    }
                    await this.putLocalRecord({
                        path: path,
                        content: mergedContent,
                        sha: remoteData.sha,
                        isDirty: true,
                        updatedAt: Date.now()
                    });
                    this.syncToCloud(true);
                    Toast.show('✨ 已按段落时间戳智能合并多端修改！', 'success');
                }
            } else if (AppState.isDirty) {
                this.syncToCloud(true);
            }
        } catch (err) {
            console.warn('后台远端版本嗅探跳过:', err.message);
        }
    },

    // ==========================================
    // 核心 3：静默推送到 GitHub (支持 409 冲突自动拉取并按块合并重试)
    // ==========================================
    async syncToCloud(isSilent = true) {
        if (!AppState.currentFilePath || !AppState.isDirty || this.isSyncing) return;
        if (!navigator.onLine) {
            this._updateStatusUI('OFFLINE_SAVED');
            if (!isSilent) Toast.show('当前处于离线状态，已安全保存在本地 IndexedDB', 'info');
            return;
        }

        clearTimeout(this.cloudSyncTimer);
        this.isSyncing = true;
        AppState.isSaving = true;
        this._updateStatusUI('CLOUD_SYNCING');

        const targetPath = AppState.currentFilePath;
        const currentContent = typeof EditorManager !== 'undefined' ? EditorManager.getContent() : '';

        await this.putLocalRecord({
            path: targetPath,
            content: currentContent,
            sha: AppState.currentFileSha,
            isDirty: true,
            updatedAt: Date.now()
        });

        try {
            const newSha = await GitHubAPI.saveFile(
                targetPath,
                currentContent,
                AppState.currentFileSha,
                'Auto-sync via UniDoc Keep Engine'
            );

            if (AppState.currentFilePath === targetPath) {
                AppState.currentFileSha = newSha;
                AppState.isDirty = false;
            }

            await this.putLocalRecord({
                path: targetPath,
                content: currentContent,
                sha: newSha,
                isDirty: false,
                updatedAt: Date.now()
            });

            this._updateStatusUI('CLOUD_SYNCED');
            if (!isSilent) Toast.show('☁️ 已同步至 GitHub 云端', 'success');
        } catch (error) {
            if (error.status === 409) {
                console.log('⚡ 侦测到跨设备 409 版本冲突，正在启动块级时间戳智能合并...');
                await this._resolveConflictAndRetry(targetPath, currentContent);
            } else {
                this._updateStatusUI('LOCAL_SAVED');
                if (!isSilent) Toast.show(`云端同步延迟 (已存本地): ${error.message}`, 'warning');
            }
        } finally {
            this.isSyncing = false;
            AppState.isSaving = false;
        }
    },

    async _resolveConflictAndRetry(path, localContent) {
        try {
            const remoteData = await GitHubAPI.getFile(path);
            const lang = typeof EditorManager !== 'undefined' ? EditorManager.currentLanguage : 'markdown';
            const mergedContent = this._mergeHtmlByBlockTimestamps(localContent, remoteData.content, lang);

            const newSha = await GitHubAPI.saveFile(
                path,
                mergedContent,
                remoteData.sha,
                'Block-level auto-merge via UniDoc Keep Engine'
            );

            if (AppState.currentFilePath === path) {
                AppState.currentFileSha = newSha;
                AppState.isDirty = false;
                if (typeof EditorManager !== 'undefined') {
                    EditorManager.setContent(mergedContent, lang);
                }
            }

            await this.putLocalRecord({
                path: path,
                content: mergedContent,
                sha: newSha,
                isDirty: false,
                updatedAt: Date.now()
            });

            this._updateStatusUI('CLOUD_SYNCED');
            Toast.show('✨ 跨设备并发修改已按块级时间戳无感合并！', 'success');
        } catch (retryErr) {
            this._updateStatusUI('LOCAL_SAVED');
            Toast.show('多端合并待重试，本地修改已保护在 IndexedDB', 'warning');
        }
    },

    // ==========================================
    // 核心 4：Google Keep 块级时间戳智能合并算法
    // ==========================================
    _mergeHtmlByBlockTimestamps(localHtml, remoteHtml, lang) {
        if (lang !== 'markdown') return localHtml;

        const parseBlocks = (htmlStr) => {
            const div = document.createElement('div');
            div.innerHTML = (htmlStr || '').trim();
            const map = new Map();
            const order = [];
            Array.from(div.children).forEach(el => {
                const id = el.getAttribute('data-block-id');
                const updated = parseInt(el.getAttribute('data-updated') || '0', 10);
                if (id) {
                    map.set(id, { el, updated, html: el.outerHTML });
                    order.push(id);
                }
            });
            return { map, order };
        };

        const local = parseBlocks(localHtml);
        const remote = parseBlocks(remoteHtml);

        if (local.order.length === 0 || remote.order.length === 0) {
            return localHtml;
        }

        // 以远端最新顺序与本地顺序智能融合（保留两边所有新增的块）
        const mergedOrder = [...remote.order];
        local.order.forEach((locId, idx) => {
            if (!remote.map.has(locId)) {
                if (idx === 0) mergedOrder.unshift(locId);
                else {
                    const prevId = local.order[idx - 1];
                    const targetIdx = mergedOrder.indexOf(prevId);
                    if (targetIdx !== -1) mergedOrder.splice(targetIdx + 1, 0, locId);
                    else mergedOrder.push(locId);
                }
            }
        });

        const finalHtmlBlocks = [];
        mergedOrder.forEach(id => {
            const locItem = local.map.get(id);
            const remItem = remote.map.get(id);
            if (locItem && remItem) {
                finalHtmlBlocks.push(locItem.updated >= remItem.updated ? locItem.html : remItem.html);
            } else if (locItem) {
                finalHtmlBlocks.push(locItem.html);
            } else if (remItem) {
                finalHtmlBlocks.push(remItem.html);
            }
        });

        return finalHtmlBlocks.join('\n\n');
    },

    // ==========================================
    // 🌟 核心 5：前台 10 秒智能心跳轮询 (同时自动同步【文档内容】与【左侧星标列表】！)
    // ==========================================
    _startSmartHeartbeat() {
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
            if (document.visibilityState === 'visible' && navigator.onLine && !this.isSyncing) {
                // 1. 无论当前是否打开了文章，每 10 秒自动静默同步一次左侧星标置顶状态！
                if (typeof FileTree !== 'undefined' && typeof FileTree.syncPinsFromCloudSilently === 'function') {
                    FileTree.syncPinsFromCloudSilently();
                }

                // 2. 自动同步当前打开的文档内容
                if (typeof AppState !== 'undefined' && AppState.currentFilePath) {
                    if (AppState.isDirty && (Date.now() - this.lastEditTime >= 3500)) {
                        this.syncToCloud(true);
                    } else if (!AppState.isDirty) {
                        this._onDeviceWakeUp(true);
                    }
                }
            }
        }, 10000);
    },

    _bindKeepLifecycleEvents() {
        // 1. 段落块失焦 (写完一段点别处)：1 秒后立即静默推云端
        document.addEventListener('focusout', (e) => {
            if (e.target && e.target.closest && e.target.closest('#unidoc-canvas')) {
                if (typeof AppState !== 'undefined' && AppState.isDirty) {
                    clearTimeout(this.cloudSyncTimer);
                    this.cloudSyncTimer = setTimeout(() => {
                        this.syncToCloud(true);
                    }, 1000);
                }
            }
        });

        // 2. 切后台立即推，切前台立即拉
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                if (typeof AppState !== 'undefined' && AppState.isDirty) {
                    this.syncToCloud(true);
                }
            } else if (document.visibilityState === 'visible') {
                this._onDeviceWakeUp(true);
            }
        });

        window.addEventListener('focus', () => {
            this._onDeviceWakeUp(false);
        });

        // 3. 在手机或平板上轻触屏幕任意位置时，如果距离上次检查超过 5 秒且本地未修改，顺手做一次静默嗅探
        document.addEventListener('pointerdown', () => {
            if (typeof AppState !== 'undefined' && !AppState.isDirty) {
                this._onDeviceWakeUp(false);
            }
        }, { passive: true });

        window.addEventListener('online', () => {
            Toast.show('🌐 网络已恢复，正在自动同步...', 'info');
            if (typeof AppState !== 'undefined' && AppState.isDirty) {
                this.syncToCloud(true);
            } else {
                this._onDeviceWakeUp(true);
            }
        });

        window.addEventListener('offline', () => {
            if (typeof AppState !== 'undefined' && AppState.isDirty) {
                this._updateStatusUI('OFFLINE_SAVED');
            }
        });
    },

    async _onDeviceWakeUp(force = false) {
        const now = Date.now();
        if (!force && (now - this.lastWakeCheckTime < 5000)) return;
        this.lastWakeCheckTime = now;

        if (this.isSyncing || !navigator.onLine) return;

        // 🌟 唤醒或轻触屏幕时，立即顺手同步左侧星标列表！
        if (typeof FileTree !== 'undefined' && typeof FileTree.syncPinsFromCloudSilently === 'function') {
            FileTree.syncPinsFromCloudSilently();
        }

        if (typeof AppState === 'undefined' || !AppState.currentFilePath) return;

        const path = AppState.currentFilePath;
        const lang = typeof EditorManager !== 'undefined' ? EditorManager.currentLanguage : 'markdown';
        const localRec = await this.getLocalRecord(path);
        await this._verifyWithRemoteInBackground(path, lang, localRec || { path, sha: AppState.currentFileSha, isDirty: false });
    },

    _updateStatusUI(state) {
        const el = document.getElementById('save-status');
        if (!el) return;

        switch (state) {
            case 'LOCAL_SAVING':
                el.innerHTML = '<i class="fa-solid fa-pen-nib me-1 text-warning"></i><span class="d-none d-md-inline text-warning">写入本地...</span>';
                break;
            case 'LOCAL_SAVED':
                el.innerHTML = '<i class="fa-solid fa-hard-drive me-1 text-warning"></i><span class="d-none d-md-inline text-warning">本地已存 (待同步)</span>';
                break;
            case 'OFFLINE_SAVED':
                el.innerHTML = '<i class="fa-solid fa-cloud-bolt me-1 text-warning"></i><span class="d-none d-md-inline text-warning">离线已存本地</span>';
                break;
            case 'CLOUD_SYNCING':
                el.innerHTML = '<i class="fa-solid fa-rotate fa-spin me-1 text-info"></i><span class="d-none d-md-inline text-info">云端同步中...</span>';
                break;
            case 'CLOUD_SYNCED':
            default:
                el.innerHTML = '<i class="fa-solid fa-cloud-check me-1 text-success"></i><span class="d-none d-md-inline text-success">云端已同步</span>';
                break;
        }
    }
};