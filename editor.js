// editor.js - 原生 HTML5 Block Canvas 核心引擎 (v2.1.10 右下角 0延迟凸起拖拽版)
const EditorManager = {
    container: null,
    canvas: null,
    blockToolbar: null,
    cornerDragHandle: null, // 🌟 右下角专属 ⠿ 拖拽锚点
    activeBlock: null,
    draggedBlock: null,

    // 跨平台 Pointer 拖拽与边缘自动滚动状态机
    isPointerDragging: false,
    autoScrollRaf: null,
    autoScrollSpeed: 0,
    lastPointerY: 0,

    lastSavedRange: null,

    currentLanguage: 'markdown',
    syntaxTheme: 'default',
    isReadOnly: false,
    onChangeCallback: null,

    selectionAnchor: null,

    historyStack: [],
    historyIndex: -1,
    isRestoringHistory: false,
    historyDebounceTimer: null,

    async init() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true, gfm: true });
        }

        this.container = document.getElementById('editor-container');
        if (!this.container) throw new Error('找不到 #editor-container 容器');

        this.container.innerHTML = '';
        this.container.className = 'flex-grow-1 w-100 h-100 overflow-y-auto position-relative unidoc-scroll-container';

        // 1. 创建 L1 终极画布容器 <article id="unidoc-canvas">
        this.canvas = document.createElement('article');
        this.canvas.id = 'unidoc-canvas';
        this.canvas.className = 'unidoc-canvas mx-auto';
        this.container.appendChild(this.canvas);

        // 2. 创建顶部跟随胶囊 & 右下角专属 ⠿ 拖拽锚点
        this._createBlockControlPill();
        this._createCornerDragHandle();

        // 3. 绑定全局原生事件流
        this._bindCanvasEvents();

        // 4. 初始化默认空段落块
        this.setContent('', 'markdown');

        window.EditorManager = this;
    },

    hasFocus() {
        if (!this.canvas) return false;
        return this.canvas.contains(document.activeElement) || document.activeElement === this.canvas;
    },

    onChange(callback) {
        this.onChangeCallback = callback;
    },

    _triggerChange() {
        if (this.isReadOnly) return;
        if (this.activeBlock) {
            this.activeBlock.setAttribute('data-updated', Date.now().toString());
        }
        this._recordHistoryDebounced();
        if (this.onChangeCallback) {
            this.onChangeCallback(this.getContent());
        }
    },

    _genBlockId() {
        return 'b-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
    },

    _saveCurrentRange() {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            if (this.canvas && this.canvas.contains(range.commonAncestorContainer)) {
                this.lastSavedRange = range.cloneRange();
            }
        }
    },

    _restoreSavedRange() {
        if (this.lastSavedRange && this.canvas.contains(this.lastSavedRange.commonAncestorContainer)) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this.lastSavedRange);
            return true;
        }
        return false;
    },

    // ==========================================
    // 顶部悬浮块控制胶囊 (已将 ⠿ 移至块右下角，胶囊更紧凑清爽)
    // ==========================================
    _createBlockControlPill() {
        const pill = document.createElement('div');
        pill.id = 'unidoc-block-pill';
        pill.className = 'unidoc-block-pill d-none';
        pill.setAttribute('contenteditable', 'false');
        pill.innerHTML = `
            <button type="button" class="pill-btn" data-pill-action="up" title="上移此块"><i class="fa-solid fa-arrow-up"></i></button>
            <button type="button" class="pill-btn" data-pill-action="down" title="下移此块"><i class="fa-solid fa-arrow-down"></i></button>
            
            <!-- 标签类型切换子菜单 -->
            <div class="dropdown d-inline-block">
                <button type="button" class="pill-btn dropdown-toggle" data-bs-toggle="dropdown" title="切换 HTML 标签类型">
                    <span id="pill-current-tag" class="badge bg-primary-subtle text-primary-emphasis" style="font-size:10px;">P</span>
                </button>
                <ul class="dropdown-menu shadow-sm p-1" style="min-width: 155px; font-size: 12px; z-index: 1065;">
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="p"><i class="fa-solid fa-paragraph me-2 text-secondary"></i>段落 &lt;p&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="h1"><i class="fa-solid fa-heading me-2 text-primary"></i>一级标题 &lt;h1&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="h2"><i class="fa-solid fa-heading me-2 text-info"></i>二级标题 &lt;h2&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="h3"><i class="fa-solid fa-heading me-2 text-success"></i>三级标题 &lt;h3&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="h4"><i class="fa-solid fa-heading me-2 text-warning"></i>四级标题 &lt;h4&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="h5"><i class="fa-solid fa-heading me-2 text-secondary"></i>五级标题 &lt;h5&gt;</a></li>
                    <li><hr class="dropdown-divider my-1"></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="details"><i class="fa-solid fa-caret-right me-2 text-warning"></i>折叠收纳 &lt;details&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="blockquote"><i class="fa-solid fa-quote-left me-2 text-muted"></i>灵感引用 &lt;blockquote&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="ul"><i class="fa-solid fa-list-ul me-2 text-info"></i>无序列表 &lt;ul&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="ol"><i class="fa-solid fa-list-ol me-2 text-info"></i>有序列表 &lt;ol&gt;</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-convert-tag="pre"><i class="fa-solid fa-code me-2 text-danger"></i>代码块 &lt;pre&gt;</a></li>
                </ul>
            </div>

            <span class="border-end mx-1" style="height: 12px;"></span>

            <!-- ✂️ 分割段落子菜单 -->
            <div class="dropdown d-inline-block">
                <button type="button" class="pill-btn dropdown-toggle" data-bs-toggle="dropdown" title="分割段落菜单">
                    <i class="fa-solid fa-scissors text-info"></i>
                </button>
                <ul class="dropdown-menu shadow-sm p-1" style="min-width: 170px; font-size: 12px; z-index: 1065;">
                    <li><a class="dropdown-item rounded py-1" href="#" data-pill-action="split-up"><i class="fa-solid fa-arrow-up-from-bracket me-2 text-info"></i>向上分割 (拆至上方块)</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-pill-action="split-down"><i class="fa-solid fa-arrow-right-from-bracket fa-rotate-90 me-2 text-info"></i>向下分割 (拆至下方块)</a></li>
                </ul>
            </div>

            <!-- 🔗 合并段落子菜单 -->
            <div class="dropdown d-inline-block">
                <button type="button" class="pill-btn dropdown-toggle" data-bs-toggle="dropdown" title="合并段落菜单">
                    <i class="fa-solid fa-link text-warning"></i>
                </button>
                <ul class="dropdown-menu shadow-sm p-1" style="min-width: 170px; font-size: 12px; z-index: 1065;">
                    <li><a class="dropdown-item rounded py-1" href="#" data-pill-action="merge-up"><i class="fa-solid fa-angles-up me-2 text-warning"></i>向上合并 (并入上一块)</a></li>
                    <li><a class="dropdown-item rounded py-1" href="#" data-pill-action="merge-down"><i class="fa-solid fa-angles-down me-2 text-warning"></i>向下合并 (吸入下一块)</a></li>
                </ul>
            </div>

            <button type="button" class="pill-btn" data-pill-action="add" title="在下方新建段落块 (Ctrl+Enter)"><i class="fa-solid fa-plus text-success"></i></button>
            <button type="button" class="pill-btn" data-pill-action="delete" title="删除此块"><i class="fa-solid fa-trash-can text-danger"></i></button>
        `;

        pill.addEventListener('mousedown', (e) => {
            if (!e.target.closest('.dropdown-toggle')) {
                e.preventDefault();
            }
        });

        pill.querySelectorAll('[data-pill-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.activeBlock || this.isReadOnly) return;
                const action = btn.dataset.pillAction;
                if (action === 'up') this.moveBlock(this.activeBlock, -1);
                else if (action === 'down') this.moveBlock(this.activeBlock, 1);
                else if (action === 'split-up') this.splitActiveBlock('up');
                else if (action === 'split-down') this.splitActiveBlock('down');
                else if (action === 'merge-up') this.mergeBlock(this.activeBlock, 'up');
                else if (action === 'merge-down') this.mergeBlock(this.activeBlock, 'down');
                else if (action === 'add') {
                    const newBlock = this.createBlockElement('p', '');
                    this.activeBlock.after(newBlock);
                    this._focusBlock(newBlock, true);
                    this._triggerChange();
                } else if (action === 'delete') {
                    this.deleteBlock(this.activeBlock);
                }
            });
        });

        pill.querySelectorAll('[data-convert-tag]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!this.activeBlock || this.isReadOnly) return;
                const targetTag = item.dataset.convertTag;
                this.convertBlockTag(this.activeBlock, targetTag);
            });
        });

        document.getElementById('sidebarOffcanvas')?.addEventListener('show.bs.offcanvas', () => {
            pill.classList.add('d-none');
            this.cornerDragHandle?.classList.add('d-none');
        });

        document.addEventListener('hide.bs.modal', () => {
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
        });

        this.container.appendChild(pill);
        this.blockToolbar = pill;
    },

    // ==========================================
    // 🌟 v2.1.14 真机满速拖拽引擎：解除 smooth 滚动死锁 + 指尖定点连续自动换位
    // ==========================================
    _createCornerDragHandle() {
        const handle = document.createElement('div');
        handle.id = 'unidoc-corner-drag';
        handle.className = 'unidoc-corner-drag d-none';
        handle.setAttribute('contenteditable', 'false');
        handle.title = '按住上下丝滑拖拽此块';
        handle.innerHTML = '<i class="fa-solid fa-grip-vertical"></i>';

        this._dragAnchorY = 0;
        this._dragAnchorScroll = 0;
        this._prevPointerY = 0;
        this._moveDir = 0;
        this._lastSwapTime = 0;

        handle.addEventListener('pointerdown', (e) => {
            if (!this.activeBlock || this.isReadOnly || this.currentLanguage !== 'markdown') return;
            e.preventDefault();
            e.stopPropagation();

            if (navigator.vibrate) {
                try { navigator.vibrate(18); } catch (err) {}
            }

            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }

            this.isPointerDragging = true;
            this.draggedBlock = this.activeBlock;
            this.lastPointerY = e.clientY;
            this._prevPointerY = e.clientY;
            this._moveDir = 0;

            // 🌟 1. 立即给滚动容器加上 container-is-dragging，彻底解除手机端 scroll-behavior: smooth 引起的蜗牛卡顿！
            this.container.classList.add('container-is-dragging');
            this.canvas.classList.add('canvas-is-dragging');
            this.draggedBlock.classList.add('block-lifted-dragging');
            handle.classList.add('is-dragging-handle');
            this.blockToolbar?.classList.add('d-none');

            // 2. 强制刷新一次布局，锁定浓缩后的真实基准坐标
            this._dragAnchorScroll = this.container.scrollTop;
            const rect = this.draggedBlock.getBoundingClientRect();
            // 让手指稳稳锚定在浓缩卡片的垂直中心偏下位置
            const naturalCenterY = rect.top + rect.height * 0.65;
            this._dragAnchorY = naturalCenterY;

            this._updateDragPhysics(e.clientY);

            try { handle.setPointerCapture(e.pointerId); } catch (err) {}

            this._startAutoScrollLoop();
        });

        handle.addEventListener('pointermove', (e) => {
            if (!this.isPointerDragging || !this.draggedBlock) return;
            e.preventDefault();

            const dy = e.clientY - this._prevPointerY;
            if (Math.abs(dy) > 2) {
                this._moveDir = dy > 0 ? 1 : -1;
                this._prevPointerY = e.clientY;
            }
            this.lastPointerY = e.clientY;

            // 🌟 扩大手机端上下边缘自动滚动感应区至 110px，手指无需贴到屏幕玻璃极限边缘即可舒适触发
            const containerRect = this.container.getBoundingClientRect();
            const edgeZone = Math.min(115, containerRect.height * 0.22);
            const distFromTop = e.clientY - containerRect.top;
            const distFromBottom = containerRect.bottom - e.clientY;

            if (distFromTop < edgeZone) {
                const ratio = Math.max(0.15, Math.min(1, (edgeZone - distFromTop) / edgeZone));
                this.autoScrollSpeed = -Math.round(4 + ratio * ratio * 18); // 4px ~ 22px/帧 平滑加速
            } else if (distFromBottom < edgeZone) {
                const ratio = Math.max(0.15, Math.min(1, (edgeZone - distFromBottom) / edgeZone));
                this.autoScrollSpeed = Math.round(4 + ratio * ratio * 18);  // 4px ~ 22px/帧 平滑加速
            } else {
                this.autoScrollSpeed = 0;
            }

            this._updateDragPhysics(e.clientY);
        });

        const endPointerDrag = (e) => {
            if (!this.isPointerDragging) return;
            this.isPointerDragging = false;
            this.autoScrollSpeed = 0;
            if (this.autoScrollRaf) {
                cancelAnimationFrame(this.autoScrollRaf);
                this.autoScrollRaf = null;
            }

            handle.classList.remove('is-dragging-handle');
            this.container?.classList.remove('container-is-dragging');
            this.canvas?.classList.remove('canvas-is-dragging');
            if (e && e.pointerId !== undefined) {
                try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
            }

            if (this.draggedBlock) {
                const finishedBlock = this.draggedBlock;
                this.draggedBlock = null;

                finishedBlock.style.transition = 'transform 0.16s cubic-bezier(0.2, 0, 0, 1)';
                finishedBlock.style.transform = 'translate3d(0, 0px, 0) scale(1)';
                finishedBlock.classList.remove('block-lifted-dragging');

                setTimeout(() => {
                    finishedBlock.style.transition = '';
                    finishedBlock.style.transform = '';
                    finishedBlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    this._updatePillPosition(finishedBlock);
                }, 170);

                this._triggerChange();
            }
        };

        handle.addEventListener('pointerup', endPointerDrag);
        handle.addEventListener('pointercancel', endPointerDrag);

        this.container.appendChild(handle);
        this.cornerDragHandle = handle;
    },

    _startAutoScrollLoop() {
        const step = () => {
            if (!this.isPointerDragging) return;
            if (this.autoScrollSpeed !== 0 && this.container && this.draggedBlock) {
                const prevScroll = this.container.scrollTop;
                this.container.scrollTop += this.autoScrollSpeed;
                // 只要页面还在滚动，即使手指按在屏幕边缘静止不动，也持续触发物理换位检测！
                if (this.container.scrollTop !== prevScroll) {
                    this._updateDragPhysics(this.lastPointerY);
                }
            }
            this.autoScrollRaf = requestAnimationFrame(step);
        };
        if (this.autoScrollRaf) cancelAnimationFrame(this.autoScrollRaf);
        this.autoScrollRaf = requestAnimationFrame(step);
    },

    // 🌟 v2.1.15 指尖定点换位 + 顶部/底部双重物理边界限位锁（防止无限向上/向下拖出文章）
    _updateDragPhysics(clientY) {
        if (!this.draggedBlock || !this.canvas) return;

        const prev = this.draggedBlock.previousElementSibling;
        const next = this.draggedBlock.nextElementSibling;
        const isFirstBlock = !prev || !prev.classList.contains('unidoc-block');
        const isLastBlock = !next || !next.classList.contains('unidoc-block');

        // 🛡️ 边界锁 1：若已到达第一块或最后一块，立即切断对应方向的边缘自动滚屏
        if (isFirstBlock && this.autoScrollSpeed < 0) this.autoScrollSpeed = 0;
        if (isLastBlock && this.autoScrollSpeed > 0) this.autoScrollSpeed = 0;

        // 1. 决定当前有效的换位方向
        const effectiveDir = this.autoScrollSpeed !== 0
            ? (this.autoScrollSpeed > 0 ? 1 : -1)
            : this._moveDir;

        const now = performance.now();
        if (now - this._lastSwapTime >= 75) {
            // ⬆️ 向上换位
            if (effectiveDir === -1 && !isFirstBlock) {
                const prevRect = prev.getBoundingClientRect();
                const threshold = Math.min(24, Math.max(15, prevRect.height * 0.2));
                if (clientY < (prevRect.bottom - threshold)) {
                    this._flipSwapBlocks(prev, 'before', now);
                }
            }
            // ⬇️ 向下换位
            else if (effectiveDir === 1 && !isLastBlock) {
                const nextRect = next.getBoundingClientRect();
                const threshold = Math.min(24, Math.max(15, nextRect.height * 0.2));
                if (clientY > (nextRect.top + threshold)) {
                    this._flipSwapBlocks(next, 'after', now);
                }
            }
        }

        // 2. 计算跟手位移，并施加【天地双锁（Top & Bottom Boundary Clamping）】
        this.draggedBlock.style.transform = 'none';
        const naturalRect = this.draggedBlock.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const naturalAnchorOnScreen = naturalRect.top + naturalRect.height * 0.65;

        // 限制手指有效追踪坐标永远不得超出编辑器可视视口上下边界
        const safeClientY = Math.max(containerRect.top + 24, Math.min(containerRect.bottom - 16, clientY));
        let exactDeltaY = safeClientY - naturalAnchorOnScreen;

        // 🛡️ 边界锁 2：已到文章最顶部（第1块）时禁止继续上移；已到文章最底部（最后1块）时禁止无限下移！
        const latestPrev = this.draggedBlock.previousElementSibling;
        const latestNext = this.draggedBlock.nextElementSibling;
        if (!latestPrev || !latestPrev.classList.contains('unidoc-block')) {
            // 顶部橡胶止挡：最多允许向上微弹 12px，绝不冲出文章顶部
            exactDeltaY = Math.max(-12, exactDeltaY);
        }
        if (!latestNext || !latestNext.classList.contains('unidoc-block')) {
            // 底部橡胶止挡：最多允许向下微弹 12px，绝不无限向下拖拽
            exactDeltaY = Math.min(12, exactDeltaY);
        }

        this.draggedBlock.style.transform = `translate3d(0, ${exactDeltaY}px, 0) scale(1.02)`;

        // 3. 把手同步紧跟被限位后的卡片右下角
        this._positionCornerHandleOnly(this.draggedBlock);
    },

    _flipSwapBlocks(neighborBlock, insertPos, timestamp) {
        this._lastSwapTime = timestamp;

        neighborBlock.style.transition = 'none';
        neighborBlock.style.transform = '';
        const neighborOldRect = neighborBlock.getBoundingClientRect();

        // 锁定当前 scrollTop，防止手机浏览器在 DOM 节点移动瞬间自动触发 Scroll Anchoring 跳动
        const savedScrollTop = this.container.scrollTop;

        if (insertPos === 'before') {
            neighborBlock.before(this.draggedBlock);
        } else {
            neighborBlock.after(this.draggedBlock);
        }

        if (this.container.scrollTop !== savedScrollTop) {
            this.container.scrollTop = savedScrollTop;
        }

        // 为让位的邻居块施加 160ms FLIP 滑开动画
        const neighborNewRect = neighborBlock.getBoundingClientRect();
        const neighborDeltaY = neighborOldRect.top - neighborNewRect.top;
        if (Math.abs(neighborDeltaY) > 2) {
            neighborBlock.style.transform = `translate3d(0, ${neighborDeltaY}px, 0)`;
            void neighborBlock.offsetHeight;
            neighborBlock.style.transition = 'transform 0.16s cubic-bezier(0.2, 0, 0, 1)';
            neighborBlock.style.transform = 'translate3d(0, 0px, 0)';
        }
    },

    _positionCornerHandleOnly(block) {
        if (!block || !this.cornerDragHandle) return;
        const containerRect = this.container.getBoundingClientRect();
        const blockRect = block.getBoundingClientRect();
        const handleTop = blockRect.bottom - containerRect.top + this.container.scrollTop - 28;
        const handleLeft = blockRect.right - containerRect.left - 28;
        this.cornerDragHandle.style.top = `${Math.max(4, handleTop)}px`;
        this.cornerDragHandle.style.left = `${Math.max(12, handleLeft)}px`;
    },

    _updatePillPosition(block) {
        if (!block || !this.blockToolbar || this.isReadOnly || this.currentLanguage !== 'markdown') {
            this.blockToolbar?.classList.add('d-none');
            this.cornerDragHandle?.classList.add('d-none');
            return;
        }
        this.activeBlock = block;
        this.canvas.querySelectorAll('.unidoc-block.active-block').forEach(el => el.classList.remove('active-block'));
        block.classList.add('active-block');

        const tagBadge = document.getElementById('pill-current-tag');
        if (tagBadge) {
            tagBadge.innerText = block.tagName.toUpperCase();
        }

        const containerRect = this.container.getBoundingClientRect();
        const blockRect = block.getBoundingClientRect();

        // 1. 定位左上方跟随胶囊
        if (!this.isPointerDragging) {
            this.blockToolbar.classList.remove('d-none');
            const topOffset = blockRect.top - containerRect.top + this.container.scrollTop - 30;
            const leftOffset = Math.max(12, blockRect.left - containerRect.left);
            this.blockToolbar.style.top = `${Math.max(4, topOffset)}px`;
            this.blockToolbar.style.left = `${leftOffset}px`;
        }

        // 2. 同步定位右下角 ⠿ 专属拖拽锚点
        if (this.cornerDragHandle) {
            this.cornerDragHandle.classList.remove('d-none');
            this._positionCornerHandleOnly(block);
        }
    },

    // ==========================================
    // 🌟 双向分割块 (direction: 'up' 向上分割 | 'down' 向下分割)
    // ==========================================
    splitActiveBlock(direction = 'down') {
        const block = this.activeBlock;
        if (!block || this.isReadOnly) return;
        const tag = block.tagName.toLowerCase();
        if (!['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'blockquote'].includes(tag)) {
            return Toast.show('当前块类型不支持直接切分，请先转为普通段落 <p>', 'info');
        }

        this._restoreSavedRange();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0 || !block.contains(sel.anchorNode)) {
            return Toast.show('请先在段落内点击要分割的光标位置，或涂黑选中要拆出的文字', 'info');
        }

        const range = sel.getRangeAt(0);
        const selectedText = range.toString().trim();

        if (selectedText.length > 0) {
            // 情况 A：用户涂黑选中了一段文字 -> 根据方向将选中部分剥离到当前块的【上方】或【下方】
            const fragment = range.extractContents();
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);
            const newBlock = this.createBlockElement('p', tempDiv.innerHTML);

            if (direction === 'up') block.before(newBlock);
            else block.after(newBlock);

            this._focusBlock(newBlock, false);
            this._triggerChange();
            Toast.show(direction === 'up' ? '⬆️ 已将选中文字剥离至上方新块' : '⬇️ 已将选中文字剥离至下方新块', 'success');
        } else {
            // 情况 B：光标停在段落中间 -> 根据方向切分光标前或光标后的内容
            if (direction === 'up') {
                const headRange = document.createRange();
                headRange.setStartBefore(block.firstChild || block);
                headRange.setEnd(range.startContainer, range.startOffset);

                const headFragment = headRange.extractContents();
                const tempDiv = document.createElement('div');
                tempDiv.appendChild(headFragment);

                const extractedHTML = tempDiv.innerHTML.replace(/(<br\s*\/?>)+$/i, '').trim();
                block.innerHTML = block.innerHTML.replace(/^(<br\s*\/?>)+/i, '').trim();

                if (!extractedHTML && !block.innerHTML) return;

                const newBlock = this.createBlockElement('p', extractedHTML || '');
                block.before(newBlock);
                this._focusBlock(block, true);
                this._triggerChange();
                Toast.show('⬆️ 已将光标前的内容分割至上方新块', 'success');
            } else {
                const tailRange = document.createRange();
                tailRange.setStart(range.startContainer, range.startOffset);
                tailRange.setEndAfter(block.lastChild || block);

                const tailFragment = tailRange.extractContents();
                const tempDiv = document.createElement('div');
                tempDiv.appendChild(tailFragment);

                const extractedHTML = tempDiv.innerHTML.replace(/^(<br\s*\/?>)+/i, '').trim();
                block.innerHTML = block.innerHTML.replace(/(<br\s*\/?>)+$/i, '').trim();

                if (!extractedHTML && !block.innerHTML) return;

                const newBlock = this.createBlockElement('p', extractedHTML || '');
                block.after(newBlock);
                this._focusBlock(newBlock, true);
                this._triggerChange();
                Toast.show('⬇️ 已将光标后的内容分割至下方新块', 'success');
            }
        }
    },

    // ==========================================
    // 🌟 双向合并块 (direction: 'up' 向上合并 | 'down' 向下合并)
    // ==========================================
    mergeBlock(block, direction = 'up') {
        if (!block || this.isReadOnly) return;

        if (direction === 'down') {
            const next = block.nextElementSibling;
            if (!next || !next.classList.contains('unidoc-block')) {
                return Toast.show('下方没有可合并的相邻块', 'info');
            }
            // 向下合并等价于让下一个块“向上合并”进当前块
            return this._executeMerge(block, next, '⬇️ 已将下方段落合并入当前块');
        } else {
            const prev = block.previousElementSibling;
            if (!prev || !prev.classList.contains('unidoc-block')) {
                return Toast.show('上方没有可合并的相邻块', 'info');
            }
            return this._executeMerge(prev, block, '⬆️ 已将当前块并入上方段落');
        }
    },

    _executeMerge(targetBlock, sourceBlock, successMsg) {
        const targetTag = targetBlock.tagName.toLowerCase();
        const sourceTag = sourceBlock.tagName.toLowerCase();

        if (targetTag === 'figure' || sourceTag === 'figure') {
            return Toast.show('图片媒体块不支持与文字块直接合并', 'warning');
        }

        const sourceContent = sourceTag === 'details'
            ? (sourceBlock.querySelector('summary')?.innerHTML + '<br>' + sourceBlock.querySelector('.details-body')?.innerHTML)
            : (sourceTag === 'pre' ? sourceBlock.innerText : sourceBlock.innerHTML);

        if (targetTag === 'details') {
            const body = targetBlock.querySelector('.details-body');
            if (body) body.innerHTML += `<br>${sourceContent}`;
        } else if (targetTag === 'pre') {
            const code = targetBlock.querySelector('code');
            if (code) code.innerText += `\n${sourceBlock.innerText}`;
        } else if ((targetTag === 'ul' || targetTag === 'ol') && (sourceTag === 'ul' || sourceTag === 'ol')) {
            targetBlock.innerHTML += sourceBlock.innerHTML;
        } else {
            targetBlock.innerHTML = targetBlock.innerHTML
                ? `${targetBlock.innerHTML}<br>${sourceContent}`
                : sourceContent;
        }

        sourceBlock.remove();
        this._focusBlock(targetBlock, false);
        this._triggerChange();
        Toast.show(successMsg, 'success');
    },

    // ==========================================
    // 原生 HTML 标签块工厂 (L2 Content Blocks)
    // ==========================================
    createBlockElement(tagName = 'p', innerContent = '', blockId = null, updatedTime = null) {
        const tag = tagName.toLowerCase();
        const id = blockId || this._genBlockId();
        const updated = updatedTime || Date.now().toString();
        let el;

        if (tag === 'details') {
            el = document.createElement('details');
            el.setAttribute('open', '');
            const summary = document.createElement('summary');
            summary.setAttribute('contenteditable', String(!this.isReadOnly));
            summary.innerHTML = innerContent.summary || '点击展开/折叠标题';
            
            const body = document.createElement('div');
            body.className = 'details-body';
            body.setAttribute('contenteditable', String(!this.isReadOnly));
            body.innerHTML = innerContent.body || '<p>在此输入折叠收纳的详细内容...</p>';

            el.appendChild(summary);
            el.appendChild(body);
        } else if (tag === 'figure') {
            el = document.createElement('figure');
            el.setAttribute('contenteditable', 'false');
            el.setAttribute('data-image-tier', 'standard');
            const img = document.createElement('img');
            const rawDataSrc = innerContent.dataSrc || innerContent.src || '';
            if (rawDataSrc) img.setAttribute('data-src', rawDataSrc);
            img.alt = innerContent.alt || '图片';
            img.className = 'img-fluid rounded shadow-sm';

            // 🌟 独立数据仓库直连图片引擎：直接从配置的 GitHub 数据仓库拉取 Base64 并缓存，无需等待相对路径 404！
            const cacheRef = (typeof ClipboardManager !== 'undefined') ? ClipboardManager.imageCache : {};
            const cleanRelPath = rawDataSrc.replace(/^notes\//, '');

            if (cleanRelPath && cacheRef[cleanRelPath]) {
                img.src = cacheRef[cleanRelPath];
            } else if (rawDataSrc && cacheRef[rawDataSrc]) {
                img.src = cacheRef[rawDataSrc];
            } else if (rawDataSrc.startsWith('data:') || rawDataSrc.startsWith('http')) {
                img.src = rawDataSrc;
            } else if (cleanRelPath.startsWith('images/')) {
                // 先放一个极简透明占位，立即异步从独立数据仓库拉取真实图片
                img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                (async () => {
                    try {
                        const data = await GitHubAPI._request(`/contents/notes/${cleanRelPath}?t=${Date.now()}`);
                        if (data && data.content) {
                            const ext = cleanRelPath.split('.').pop().toLowerCase() || 'png';
                            const mime = (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : (ext === 'gif' ? 'image/gif' : (ext === 'webp' ? 'image/webp' : 'image/png'));
                            const fullDataUrl = `data:${mime};base64,${data.content.replace(/\s+/g, '')}`;
                            cacheRef[cleanRelPath] = fullDataUrl;
                            img.src = fullDataUrl;
                        }
                    } catch (err) {
                        console.warn('从独立数据仓库加载图片失败:', err.message);
                    }
                })();
            } else {
                img.src = innerContent.src || rawDataSrc;
            }

            const caption = document.createElement('figcaption');
            caption.setAttribute('contenteditable', String(!this.isReadOnly));
            caption.innerHTML = innerContent.caption || '添加图片注释...';

            el.appendChild(img);
            el.appendChild(caption);
        } else if (tag === 'pre') {
            el = document.createElement('pre');
            const code = document.createElement('code');
            code.setAttribute('contenteditable', String(!this.isReadOnly));
            code.innerText = typeof innerContent === 'string' ? innerContent : '';
            el.appendChild(code);
        } else if (tag === 'ul' || tag === 'ol') {
            el = document.createElement(tag);
            el.setAttribute('contenteditable', String(!this.isReadOnly));
            if (typeof innerContent === 'string' && innerContent.includes('<li')) {
                el.innerHTML = innerContent;
            } else {
                const lines = (typeof innerContent === 'string' ? innerContent : '列表项').split(/<br\s*\/?>|\n/).filter(Boolean);
                el.innerHTML = lines.length ? lines.map(l => `<li>${l}</li>`).join('') : '<li>列表项</li>';
            }
        } else {
            const validTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'blockquote'];
            const finalTag = validTags.includes(tag) ? tag : 'p';
            el = document.createElement(finalTag);
            el.setAttribute('contenteditable', String(!this.isReadOnly));
            el.innerHTML = typeof innerContent === 'string' ? innerContent : '';
        }

        el.classList.add('unidoc-block');
        el.setAttribute('data-block-id', id);
        el.setAttribute('data-updated', updated);
        return el;
    },

    convertBlockTag(block, targetTag) {
        if (!block || block.tagName.toLowerCase() === targetTag) return;
        const oldId = block.getAttribute('data-block-id');
        let plainHTML = '';

        const currentTag = block.tagName.toLowerCase();
        if (currentTag === 'details') {
            const sum = block.querySelector('summary')?.innerHTML || '';
            const body = block.querySelector('.details-body')?.innerHTML || '';
            plainHTML = `${sum}<br>${body}`;
        } else if (currentTag === 'pre') {
            plainHTML = block.querySelector('code')?.innerText || block.innerText;
        } else if (currentTag === 'ul' || currentTag === 'ol') {
            plainHTML = Array.from(block.querySelectorAll('li')).map(li => li.innerHTML).join('<br>');
        } else {
            plainHTML = block.innerHTML;
        }

        let newBlock;
        if (targetTag === 'details') {
            const parts = plainHTML.split(/<br\s*\/?>|\n/);
            const firstLine = parts.shift() || '折叠标题';
            const restBody = parts.join('<br>') || '在此输入折叠内容...';
            newBlock = this.createBlockElement('details', { summary: firstLine, body: restBody }, oldId);
        } else if (targetTag === 'pre') {
            newBlock = this.createBlockElement('pre', block.innerText, oldId);
        } else {
            newBlock = this.createBlockElement(targetTag, plainHTML, oldId);
        }

        block.replaceWith(newBlock);
        this._focusBlock(newBlock, false);
        this._updatePillPosition(newBlock);
        this._triggerChange();
    },

    moveBlock(block, direction) {
        if (!block) return;
        if (direction === -1 && block.previousElementSibling) {
            block.parentNode.insertBefore(block, block.previousElementSibling);
        } else if (direction === 1 && block.nextElementSibling) {
            block.parentNode.insertBefore(block.nextElementSibling, block);
        } else {
            return;
        }
        block.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        this._updatePillPosition(block);
        this._triggerChange();
    },

    deleteBlock(block) {
        if (!block) return;
        const prev = block.previousElementSibling;
        const next = block.nextElementSibling;
        block.remove();

        if (this.canvas.children.length === 0) {
            const emptyP = this.createBlockElement('p', '');
            this.canvas.appendChild(emptyP);
            this._focusBlock(emptyP, true);
        } else if (prev) {
            this._focusBlock(prev, false);
        } else if (next) {
            this._focusBlock(next, true);
        }
        this._triggerChange();
    },

    _focusBlock(block, toStart = false) {
        if (!block) return;
        let target = block;
        const tag = block.tagName.toLowerCase();
        if (tag === 'details') {
            target = block.querySelector('summary') || block;
        } else if (tag === 'pre') {
            target = block.querySelector('code') || block;
        } else if (tag === 'figure') {
            target = block.querySelector('figcaption') || block;
        }

        target.focus();
        const selection = window.getSelection();
        if (selection && target.getAttribute('contenteditable') === 'true') {
            const range = document.createRange();
            range.selectNodeContents(target);
            range.collapse(toStart);
            selection.removeAllRanges();
            selection.addRange(range);
            this._saveCurrentRange();
        }
        this._updatePillPosition(block);
    },

    // ==========================================
    // 画布事件流绑定 (Enter 回归自然块内换行，Ctrl+Enter 新建块)
    // ==========================================
    _bindCanvasEvents() {
        this.canvas.addEventListener('focusin', (e) => {
            const block = e.target.closest('.unidoc-block');
            if (block && !this.isPointerDragging) {
                this._updatePillPosition(block);
                this._saveCurrentRange();
            }
        });

        // 🌟 PC 端鼠标滑过任意块（或手机轻触任意块）即刻吸附显示右下角 ⠿ 拖拽锚点
        this.canvas.addEventListener('pointerover', (e) => {
            if (this.isPointerDragging || this.isReadOnly || this.currentLanguage !== 'markdown') return;
            const block = e.target.closest('.unidoc-block');
            if (block && !this.hasFocus()) {
                this._updatePillPosition(block);
            }
        });

        this.canvas.addEventListener('input', () => {
            this._saveCurrentRange();
            this._triggerChange();
        });

        this.canvas.addEventListener('keydown', (e) => {
            if (this.isReadOnly) return;

            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) this.redo();
                else this.undo();
                return;
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                this.redo();
                return;
            }

            if (this.currentLanguage !== 'markdown') return;

            const block = e.target.closest('.unidoc-block');
            if (!block) return;
            const tag = block.tagName.toLowerCase();

            // 快捷键 Ctrl+Enter (或 Cmd+Enter)：在当前块下方直接新建一个独立 <p> 段落块
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                const newP = this.createBlockElement('p', '');
                block.after(newP);
                this._focusBlock(newP, true);
                this._triggerChange();
                return;
            }

            // 普通 Enter 键：在段落 <p> / <blockquote> 内直接自然换行 (<br>)，不再强行拆碎段落
            if (e.key === 'Enter' && !e.shiftKey) {
                if (tag === 'details' && e.target.tagName.toLowerCase() === 'summary') {
                    e.preventDefault();
                    block.setAttribute('open', '');
                    const body = block.querySelector('.details-body');
                    if (body) body.focus();
                    return;
                }
                if (['h1', 'h2', 'h3', 'h4', 'h5'].includes(tag)) {
                    e.preventDefault();
                    const newP = this.createBlockElement('p', '');
                    block.after(newP);
                    this._focusBlock(newP, true);
                    this._triggerChange();
                    return;
                }
                if (tag === 'p' || tag === 'blockquote') {
                    e.preventDefault();
                    const sel = window.getSelection();
                    if (sel && sel.rangeCount > 0) {
                        const range = sel.getRangeAt(0);
                        range.deleteContents();

                        // 🌟 检测光标是否处于当前段落的“视觉最末尾”（忽略空白幽灵文本节点）
                        const tailCheckRange = document.createRange();
                        tailCheckRange.setStart(range.endContainer, range.endOffset);
                        tailCheckRange.setEndAfter(block.lastChild || block);
                        const hasVisibleTail = tailCheckRange.toString().trim().length > 0 ||
                            tailCheckRange.cloneContents().querySelector('img, br, strong, em, mark, code, a');

                        const br = document.createElement('br');
                        range.insertNode(br);

                        // 如果是在段落最末尾按回车，且后面没有垫底 <br>，立即补一个垫底 <br> 撑开新行，确保按 1 次回车即刻换行！
                        if (!hasVisibleTail) {
                            const extraBr = document.createElement('br');
                            br.after(extraBr);
                        }

                        range.setStartAfter(br);
                        range.setEndAfter(br);
                        sel.removeAllRanges();
                        sel.addRange(range);

                        this._saveCurrentRange();
                        this._triggerChange();
                        this._updatePillPosition(block);
                    }
                    return;
                }
            }

            if (e.key === 'Backspace') {
                const text = block.innerText.replace(/\n/g, '').trim();
                if (text === '' && tag !== 'figure' && this.canvas.children.length > 1) {
                    e.preventDefault();
                    this.deleteBlock(block);
                }
            }

            if (e.key === ' ' && tag === 'p') {
                const text = block.innerText.trim();
                if (text === '#') { e.preventDefault(); block.innerHTML = ''; this.convertBlockTag(block, 'h1'); }
                else if (text === '##') { e.preventDefault(); block.innerHTML = ''; this.convertBlockTag(block, 'h2'); }
                else if (text === '###') { e.preventDefault(); block.innerHTML = ''; this.convertBlockTag(block, 'h3'); }
                else if (text === '####') { e.preventDefault(); block.innerHTML = ''; this.convertBlockTag(block, 'h4'); }
                else if (text === '#####') { e.preventDefault(); block.innerHTML = ''; this.convertBlockTag(block, 'h5'); }
                else if (text === '>') { e.preventDefault(); block.innerHTML = ''; this.convertBlockTag(block, 'blockquote'); }
                else if (text === '>>>') { e.preventDefault(); block.innerHTML = ''; this.convertBlockTag(block, 'details'); }
            }
        });

        this.canvas.addEventListener('dragstart', (e) => {
            const block = e.target.closest('.unidoc-block');
            if (!block || this.isReadOnly) return;
            this.draggedBlock = block;
            block.classList.add('dragging-block');
            e.dataTransfer.effectAllowed = 'move';
        });

        this.canvas.addEventListener('dragover', (e) => {
            if (!this.draggedBlock) return;
            e.preventDefault();
            const targetBlock = e.target.closest('.unidoc-block');
            if (!targetBlock || targetBlock === this.draggedBlock) return;

            const rect = targetBlock.getBoundingClientRect();
            const isAfter = (e.clientY - rect.top) > (rect.height / 2);
            if (isAfter) targetBlock.after(this.draggedBlock);
            else targetBlock.before(this.draggedBlock);
        });

        this.canvas.addEventListener('dragend', () => {
            if (this.draggedBlock) {
                this.draggedBlock.classList.remove('dragging-block');
                this.draggedBlock.removeAttribute('draggable');
                this._updatePillPosition(this.draggedBlock);
                this.draggedBlock = null;
                this._triggerChange();
            }
        });
    },

    // ==========================================
    // 内容解析与序列化
    // ==========================================
    setContent(content, lang = 'markdown') {
        if (!this.canvas) return;
        this.setLanguage(lang);
        this.canvas.innerHTML = '';
        this.blockToolbar?.classList.add('d-none');
        this.lastSavedRange = null;

        const raw = (content || '').trim();

        if (lang !== 'markdown') {
            const codeBlock = this.createBlockElement('pre', content || '');
            this.canvas.appendChild(codeBlock);
            this._resetHistory();
            this.handlePreviewLayout(lang);
            return;
        }

        if (!raw) {
            this.canvas.appendChild(this.createBlockElement('p', ''));
            this._resetHistory();
            this.handlePreviewLayout(lang);
            return;
        }

        let htmlToParse = raw;
        const isAlreadyNativeBlocks = raw.includes('data-block-id=') || /^<(p|h[1-6]|details|figure|blockquote|pre|ul|ol)\b/i.test(raw);
        if (!isAlreadyNativeBlocks && typeof marked !== 'undefined') {
            htmlToParse = marked.parse(raw);
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlToParse;

        Array.from(tempDiv.childNodes).forEach(node => {
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.trim()) {
                    this.canvas.appendChild(this.createBlockElement('p', node.textContent));
                }
                return;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            const tag = node.tagName.toLowerCase();
            const existingId = node.getAttribute('data-block-id') || this._genBlockId();
            const existingUpdated = node.getAttribute('data-updated') || Date.now().toString();

            if (tag === 'figure' || (tag === 'p' && node.querySelector('img') && node.innerText.trim() === '')) {
                const imgEl = node.querySelector('img');
                const capEl = node.querySelector('figcaption');
                if (imgEl) {
                    let src = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
                    let displaySrc = src;
                    if (src.startsWith('images/')) {
                        if (typeof ClipboardManager !== 'undefined' && ClipboardManager.imageCache[src]) {
                            displaySrc = ClipboardManager.imageCache[src];
                        } else {
                            displaySrc = 'notes/' + src;
                        }
                    }
                    const figBlock = this.createBlockElement('figure', {
                        src: displaySrc,
                        dataSrc: src,
                        alt: imgEl.alt || '',
                        caption: capEl ? capEl.innerHTML : (imgEl.alt || '添加图片注释...')
                    }, existingId, existingUpdated);
                    this.canvas.appendChild(figBlock);
                    return;
                }
            }

            if (tag === 'details') {
                const sumEl = node.querySelector('summary');
                const bodyEl = node.querySelector('.details-body');
                let bodyHTML = '';
                if (bodyEl) {
                    bodyHTML = bodyEl.innerHTML;
                } else {
                    const clone = node.cloneNode(true);
                    clone.querySelector('summary')?.remove();
                    bodyHTML = clone.innerHTML;
                }
                const detBlock = this.createBlockElement('details', {
                    summary: sumEl ? sumEl.innerHTML : '折叠标题',
                    body: bodyHTML || '<p>折叠内容...</p>'
                }, existingId, existingUpdated);
                if (!node.hasAttribute('open')) detBlock.removeAttribute('open');
                this.canvas.appendChild(detBlock);
            } else if (tag === 'pre') {
                const codeText = node.innerText;
                this.canvas.appendChild(this.createBlockElement('pre', codeText, existingId, existingUpdated));
            } else if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'blockquote', 'ul', 'ol'].includes(tag)) {
                this.canvas.appendChild(this.createBlockElement(tag, node.innerHTML, existingId, existingUpdated));
            } else {
                this.canvas.appendChild(this.createBlockElement('p', node.innerHTML, existingId, existingUpdated));
            }
        });

        if (this.canvas.children.length === 0) {
            this.canvas.appendChild(this.createBlockElement('p', ''));
        }

        this._resetHistory();
        this.handlePreviewLayout(lang);
    },

    getContent() {
        if (!this.canvas) return '';
        if (this.currentLanguage !== 'markdown') {
            return this.canvas.innerText;
        }

        const cloneCanvas = this.canvas.cloneNode(true);
        const blocks = cloneCanvas.querySelectorAll('.unidoc-block');

        blocks.forEach(b => {
            b.classList.remove('active-block', 'dragging-block');
            b.removeAttribute('draggable');
            b.removeAttribute('contenteditable');
            b.querySelectorAll('[contenteditable]').forEach(ce => ce.removeAttribute('contenteditable'));

            b.querySelectorAll('img[data-src]').forEach(img => {
                img.setAttribute('src', img.getAttribute('data-src'));
            });
        });

        return Array.from(cloneCanvas.children).map(el => el.outerHTML).join('\n\n');
    },

    setLanguage(lang) {
        this.currentLanguage = lang;
    },

    setSyntaxTheme(themeName) {
        this.syntaxTheme = themeName || 'default';
        if (!this.canvas) return;
        this.canvas.setAttribute('data-syntax-theme', this.syntaxTheme);
    },

    // ==========================================
    // 快照历史栈 (Undo / Redo)
    // ==========================================
    _resetHistory() {
        this.historyStack = [this.canvas.innerHTML];
        this.historyIndex = 0;
    },

    _recordHistoryDebounced() {
        if (this.isRestoringHistory) return;
        clearTimeout(this.historyDebounceTimer);
        this.historyDebounceTimer = setTimeout(() => {
            const snapshot = this.canvas.innerHTML;
            if (this.historyStack[this.historyIndex] === snapshot) return;
            this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
            this.historyStack.push(snapshot);
            if (this.historyStack.length > 40) this.historyStack.shift();
            else this.historyIndex++;
        }, 350);
    },

    undo() {
        if (this.historyIndex > 0) {
            this.isRestoringHistory = true;
            this.historyIndex--;
            this.canvas.innerHTML = this.historyStack[this.historyIndex];
            this.blockToolbar?.classList.add('d-none');
            this.isRestoringHistory = false;
            if (this.onChangeCallback) this.onChangeCallback(this.getContent());
        } else {
            Toast.show('已到达最初状态', 'info');
        }
    },

    redo() {
        if (this.historyIndex < this.historyStack.length - 1) {
            this.isRestoringHistory = true;
            this.historyIndex++;
            this.canvas.innerHTML = this.historyStack[this.historyIndex];
            this.blockToolbar?.classList.add('d-none');
            this.isRestoringHistory = false;
            if (this.onChangeCallback) this.onChangeCallback(this.getContent());
        } else {
            Toast.show('已是最新状态', 'info');
        }
    },

    // ==========================================
    // 总线指令响应接口 (Connector Actions)
    // ==========================================
    applyMarkdownFormat(formatType) {
        if (this.isReadOnly) return;

        if (['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'blockquote'].includes(formatType)) {
            const targetBlock = this.activeBlock || this.canvas.lastElementChild;
            if (targetBlock) {
                const currentTag = targetBlock.tagName.toLowerCase();
                this.convertBlockTag(targetBlock, currentTag === formatType ? 'p' : formatType);
            }
            return;
        }

        if (formatType === 'details') {
            const newDetails = this.createBlockElement('details', {
                summary: '点击展开/折叠标题',
                body: '<p>在此输入折叠收纳内容...</p>'
            });
            if (this.activeBlock) this.activeBlock.after(newDetails);
            else this.canvas.appendChild(newDetails);
            this._focusBlock(newDetails, false);
            this._triggerChange();
            return;
        }

        if (formatType === 'image') {
            if (typeof ClipboardManager !== 'undefined' && typeof ClipboardManager.openLocalImagePicker === 'function') {
                ClipboardManager.openLocalImagePicker();
            }
            return;
        }

        this._restoreSavedRange();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!this.canvas.contains(range.commonAncestorContainer)) return;

        const selectedText = range.toString();

        if (formatType === 'code' && (selectedText.includes('\n') || !selectedText)) {
            const codeBlock = this.createBlockElement('pre', selectedText || '// 在此输入代码');
            if (this.activeBlock) this.activeBlock.after(codeBlock);
            else this.canvas.appendChild(codeBlock);
            this._focusBlock(codeBlock, false);
            this._triggerChange();
            return;
        }

        let wrapperEl;
        switch (formatType) {
            case 'bold':
                wrapperEl = document.createElement('strong');
                wrapperEl.textContent = selectedText || '加粗文字';
                break;
            case 'italic':
                wrapperEl = document.createElement('em');
                wrapperEl.textContent = selectedText || '斜体文字';
                break;
            case 'mark':
                wrapperEl = document.createElement('mark');
                wrapperEl.textContent = selectedText || '高亮重点';
                break;
            case 'code':
                wrapperEl = document.createElement('code');
                wrapperEl.textContent = selectedText || 'code';
                break;
            case 'link': {
                const href = prompt('请输入链接 URL:', 'https://');
                if (!href) return;
                wrapperEl = document.createElement('a');
                wrapperEl.href = href;
                wrapperEl.target = '_blank';
                wrapperEl.textContent = selectedText || href;
                break;
            }
            default:
                return;
        }

        range.deleteContents();
        range.insertNode(wrapperEl);
        range.selectNodeContents(wrapperEl);
        selection.removeAllRanges();
        selection.addRange(range);
        this._saveCurrentRange();
        this._triggerChange();
    },

    insertTextAtCursor(text) {
        if (this.isReadOnly) return;

        const restored = this._restoreSavedRange();
        if (!restored) {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0 || !this.canvas.contains(sel.anchorNode)) {
                const last = this.activeBlock || this.canvas.lastElementChild;
                if (last) this._focusBlock(last, false);
            }
        }

        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);

            if (text.length === 2 && ['【】', '「」', '《》', '（）', '［］', '｛｝', '『』', '〖〗', '〔〕'].includes(text)) {
                range.setStart(textNode, 1);
                range.setEnd(textNode, 1);
            } else {
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
            }
            sel.removeAllRanges();
            sel.addRange(range);
            this._saveCurrentRange();
            this._triggerChange();
        }
    },

    replaceSelection(text) {
        this.insertTextAtCursor(text);
    },

    findAndReplace(targetStr, replaceStr) {
        if (!this.canvas) return;
        const imgMarkdownMatch = replaceStr.match(/!\[.*?\]\((.*?)\)/);
        if (targetStr.startsWith('![正在上传') && imgMarkdownMatch) {
            const relPath = imgMarkdownMatch[1];
            const displaySrc = (typeof ClipboardManager !== 'undefined' && ClipboardManager.imageCache[relPath])
                ? ClipboardManager.imageCache[relPath]
                : 'notes/' + relPath;

            const blocks = this.canvas.querySelectorAll('.unidoc-block');
            for (const b of blocks) {
                if (b.innerText.includes(targetStr)) {
                    const fig = this.createBlockElement('figure', {
                        src: displaySrc,
                        dataSrc: relPath,
                        caption: '添加图片注释...'
                    }, b.getAttribute('data-block-id'));
                    b.replaceWith(fig);
                    this._triggerChange();
                    return;
                }
            }
        }

        this.canvas.innerHTML = this.canvas.innerHTML.replace(targetStr, replaceStr);
        this._triggerChange();
    },

    foldAll() {
        if (!this.canvas) return;
        const detailsList = this.canvas.querySelectorAll('details.unidoc-block');
        detailsList.forEach(d => d.removeAttribute('open'));
        Toast.show(`已折叠全部 ${detailsList.length} 个收纳区块`, 'success');
    },

    unfoldAll() {
        if (!this.canvas) return;
        const detailsList = this.canvas.querySelectorAll('details.unidoc-block');
        detailsList.forEach(d => d.setAttribute('open', ''));
        Toast.show(`已展开全部 ${detailsList.length} 个收纳区块`, 'success');
    },

    sanitizeFormat() {
        if (!this.canvas || this.isReadOnly) return;
        const cleanStr = (str) => str.replace(/\t/g, '    ').replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '').replace(/[ \t]+$/gm, '');
        this.canvas.querySelectorAll('.unidoc-block').forEach(b => {
            if (b.tagName.toLowerCase() !== 'figure') {
                b.innerHTML = cleanStr(b.innerHTML);
            }
        });
        this._triggerChange();
        Toast.show('🧼 全文隐形字符与冗余格式水洗完成！', 'success');
    },

    optimizePrompt() {
        if (!this.canvas || this.isReadOnly) return;
        const stopWordsRegex = /(请帮我|帮我|麻烦你|能不能|可不可以|请|的|了|啊|呢|吧|一下|那个|这个)/g;
        const targets = this.activeBlock ? [this.activeBlock] : Array.from(this.canvas.querySelectorAll('.unidoc-block'));
        targets.forEach(b => {
            if (b.tagName.toLowerCase() !== 'figure') {
                b.innerHTML = b.innerHTML.replace(stopWordsRegex, '');
            }
        });
        this._triggerChange();
        Toast.show('✨ Prompt 提纯完成！', 'success');
    },

    formatCodeDocument() {
        if (!this.canvas || this.currentLanguage !== 'json') return;
        try {
            const rawText = this.canvas.innerText;
            const formatted = JSON.stringify(JSON.parse(rawText), null, 4);
            this.setContent(formatted, 'json');
            this._triggerChange();
            Toast.show('JSON 原生排版完成', 'success');
        } catch (e) {
            Toast.show('JSON 格式错误，无法排版', 'error');
        }
    },

    selectAll() {
        if (!this.canvas) return;
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(this.canvas);
        selection.removeAllRanges();
        selection.addRange(range);
        Toast.show('已全选画布内容', 'success');
    },

    setAnchor() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        this.selectionAnchor = { node: sel.anchorNode, offset: sel.anchorOffset };
        Toast.show('⚑ 已标记物理起点！请点击「选中至此」', 'info');
    },

    selectToHere() {
        if (!this.selectionAnchor) {
            return Toast.show('请先设置起点锚点', 'warning');
        }
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        try {
            const range = document.createRange();
            range.setStart(this.selectionAnchor.node, this.selectionAnchor.offset);
            range.setEnd(sel.focusNode, sel.focusOffset);
            sel.removeAllRanges();
            sel.addRange(range);
            this.selectionAnchor = null;
            Toast.show('🎯 跨块区域已精准选中！', 'success');
        } catch (e) {
            Toast.show('锚点跨度无效，请重新标记', 'warning');
        }
    },

    // 生成纯净无编辑态属性的 HTML 供 85% 占屏阅读弹窗渲染
    togglePreview(isPreviewMode) {
        if (!this.canvas) return '';
        const clone = this.canvas.cloneNode(true);
        clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        clone.querySelectorAll('.unidoc-block').forEach(el => {
            el.classList.remove('active-block', 'dragging-block');
        });
        return clone.innerHTML;
    },

    updatePreview() {
        const previewEl = document.getElementById('markdown-preview');
        if (previewEl && this.canvas) {
            previewEl.innerHTML = this.togglePreview(true);
        }
    },

    handlePreviewLayout(lang) {
        const toggleBtn = document.getElementById('btn-toggle-preview');
        if (toggleBtn) {
            if (lang === 'markdown') toggleBtn.classList.remove('d-none');
            else toggleBtn.classList.add('d-none');
        }
        if (typeof ToolbarManager !== 'undefined') {
            ToolbarManager.updateForLanguage(lang);
        }
    }
};