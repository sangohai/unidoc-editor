// toast.js - 动态生成 Bootstrap Toast 提示
const Toast = {
    show(message, type = 'success') {
        const container = document.querySelector('.toast-container');
        const id = 'toast-' + Date.now();
        
        // 根据类型设置不同的颜色和图标
        const bgColor = type === 'success' ? 'bg-success' : (type === 'error' ? 'bg-danger' : 'bg-info');
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-circle-xmark' : 'fa-info-circle');

        const html = `
            <div id="${id}" class="toast align-items-center text-white ${bgColor} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="fa-solid ${icon} me-2"></i>${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', html);
        const toastEl = document.getElementById(id);
        
        // 初始化并显示 Toast
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        
        // 监听隐藏事件，动画结束后自动从 DOM 中移除元素
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }
};