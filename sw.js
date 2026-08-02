// sw.js - Service Worker (网络优先策略)
const CACHE_NAME = 'unidoc-cache-v1.19'; // 只要字符变了就行

// 安装阶段：立刻接管
self.addEventListener('install', (e) => {
    self.skipWaiting();
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', (e) => {
    e.waitUntil(clients.claim());
});

// 拦截请求阶段
self.addEventListener('fetch', (event) => {
    const url = event.request.url;

    // 💥 绝对护城河：完全放行 GitHub API 和我们的图床请求，防 404！
    if (url.includes('api.github.com') || url.includes('raw.githubusercontent.com')) {
        return;
    }

    // 策略：网络优先 (Network First)。有网就用最新的，没网断网时才用缓存顶着！
    event.respondWith(
        fetch(event.request).then(response => {
            // 如果是本站静态资源，顺手存个缓存
            if (response.status === 200 && url.startsWith(self.location.origin)) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseClone);
                });
            }
            return response;
        }).catch(() => {
            // 没网的时候，从缓存里把界面的骨架挖出来显示
            return caches.match(event.request);
        })
    );
});