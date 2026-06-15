// charPicker.js - 独立的表情与特殊符号渲染模块
const CharPicker = {
    // 基础字符 (默认加载)
    emojiBase: ['😀','😂','😅','😍','🤔','😎','😭','👍','🙏','🔥','⭐','✨','💡','🎉','📌','✅','❌','⚠️','❤️','🚀','👀','🎯','⚙️','📁','📝'],
    symbolBase: ['【】','「」','《》','（）','［］','｛｝','￥','€','©','®','←','→','↑','↓','★','♥','■','▶','—','…','°','±','×','÷'],

    // 扩展字符 (点击懒加载)
    emojiExtended: ['😁','😆','😉','😊','😇','🥰','🤩','😘','😜','🤪','🤫','🤭','🧐','🤓','😈','👻','👽','🤖','💩','💀','🐒','🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🍎','🍊','🍋','🍉','🍇','🍓','🍔','🍕','🍟','🌭','🍿','🍩','🧊','🍹','☕','⚽','🏀','🏈','⚾','🎾','🚗','🚕','🚙','🚌','🚎','✈️','🚢','⌚','📱','💻','⌨️','🖥️','🖱️','🖨️','📷','📺','📻','🧭','⏱️','⌛','⏳','⚖️','🧲','🧪','🧬','🔬','🔭','📡','💉','💊','🚪','🛏️','🛋️','🚽','🚿','🛁','🛒','🚬','⚰️','⚱️'],
    symbolExtended: ['『』','〖〗','〔〕','‖','｜','～','℃','℉','‰','§','№','℡','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','①','②','③','④','⑤','⑥','⑦','⑧','⑨','⑩','❶','❷','❸','❹','❺','❻','❼','❽','❾','❿','≈','≡','≠','＝','≤','≥','＜','＞','≮','≯','∷','±','＋','－','×','÷','／','∫','∮','∝','∞','∧','∨','∑','∏','∪','∩','∈','∵','∴','⊥','∥','∠','⌒','⊙','≌','∽','√','♂','♀','♠','♣','♦','♤','♡','♢','♧','♨','♩','♪','♫','♬','♭','♮','♯'],

    onInsertCallback: null,

    // 初始化：由 editor.js 调用，并传入插入字符的回调函数
    init(onInsert) {
        this.onInsertCallback = onInsert;
        this.renderPanels();
    },

    renderPanels() {
        const emojiPanel = document.getElementById('emoji-panel');
        const symbolPanel = document.getElementById('symbol-panel');
        if (!emojiPanel || !symbolPanel) return;

        emojiPanel.innerHTML = '';
        symbolPanel.innerHTML = '';

        this.renderList(this.emojiBase, emojiPanel);
        this.renderList(this.symbolBase, symbolPanel, true);

        this.renderMoreButton(emojiPanel, this.emojiExtended, false);
        this.renderMoreButton(symbolPanel, this.symbolExtended, true);
    },

    renderList(list, container, isSymbol = false) {
        list.forEach(char => {
            const btn = document.createElement('div');
            btn.className = isSymbol ? 'char-btn symbol-btn' : 'char-btn';
            btn.innerText = char;
            btn.addEventListener('click', () => {
                if (this.onInsertCallback) this.onInsertCallback(char);
            });
            container.appendChild(btn);
        });
    },

    renderMoreButton(container, extendedList, isSymbol) {
        const btn = document.createElement('div');
        btn.className = 'char-btn bg-secondary bg-opacity-10 text-secondary'; 
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn.title = "加载更多";
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止弹窗关闭
            btn.remove();
            this.renderList(extendedList, container, isSymbol);
        });

        container.appendChild(btn);
    }
};
