// sw.js - Service Worker (V2.3 Native Block & Keep Sync 网络优先策略)
const CACHE_NAME = 'unidoc-cache-v2.3.0-native'; // 🌟 升级版本号，触发所有已安装 PWA 设备自动热重载

// 安装阶段：立刻接管
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// 激活阶段：清理旧版本 (如 v1.19) 的残留缓存并立刻接管所有客户端
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        console.log('🧹 [PWA] 已清理旧版本缓存:', name);
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => clients.claim())
    );
});

// 拦截请求阶段
self.addEventListener('fetch', (event) => {
    // 仅处理 GET 请求
    if (event.request.method !== 'GET') return;

    const url = event.request.url;

    // 💥 绝对护城河：完全放行 GitHub API 和图床请求，确保 SyncManager 实时心跳 100% 穿透无缓存！
    if (url.includes('api.github.com') || url.includes('raw.githubusercontent.com')) {
        return;
    }

    // 策略：网络优先 (Network First)。有网用最新，没网断网时用本地缓存秒开外壳 + IndexedDB 离线笔记！
    event.respondWith(
        fetch(event.request).then(response => {
            if (response && response.status === 200 && url.startsWith(self.location.origin)) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            return caches.match(event.request);
        })
    );
});