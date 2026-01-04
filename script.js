// 全局变量和初始化
let currentWordIndex = 0;
let words = [
    {
        word: "Algorithm",
        phonetic: "/ˈælɡərɪðəm/",
        meaning: "算法，计算程序",
        example: "The search algorithm efficiently finds data in the database.",
        difficulty: 1
    },
    {
        word: "Ubiquitous",
        phonetic: "/juːˈbɪkwɪtəs/",
        meaning: "普遍存在的，无处不在的",
        example: "Mobile phones have become ubiquitous in modern society.",
        difficulty: 3
    },
    {
        word: "Syntax",
        phonetic: "/ˈsɪntæks/",
        meaning: "语法，句法",
        example: "Python has a clean and readable syntax.",
        difficulty: 2
    },
    {
        word: "Variable",
        phonetic: "/ˈveəriəbl/",
        meaning: "变量，可变的",
        example: "In programming, variables store data values.",
        difficulty: 1
    },
    {
        word: "Recursion",
        phonetic: "/rɪˈkɜːrʒn/",
        meaning: "递归，循环",
        example: "The factorial function is often implemented using recursion.",
        difficulty: 4
    }
];

// AI助手相关配置
const AI_CONFIG = {
    API_BASE_URL: 'http://localhost:3000',
    sessionId: 'user_' + Date.now(),
    isConnected: false,
    retryCount: 0,
    maxRetries: 3
};

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化导航
    initNavigation();
    
    // 初始化函数可视化
    initMathVisualizer();
    
    // 初始化英语学习系统
    initEnglishQuiz();
    
    // 初始化AI助手（连接到真实DeepSeek API）
    initAIAssistant();
    
    // 绘制初始函数
    plotFunction('sin(x)', -10, 10, -5, 5);
    
    // 加载单词列表
    loadWordList();
    
    // 检查后端连接状态
    checkAIConnection();
});

// 检查AI助手连接状态
async function checkAIConnection() {
    try {
        const response = await fetch(`${AI_CONFIG.API_BASE_URL}/health`);
        if (response.ok) {
            AI_CONFIG.isConnected = true;
            updateConnectionStatus(true, '已连接到AI服务');
            return true;
        }
    } catch (error) {
        console.error('连接失败:', error);
        AI_CONFIG.isConnected = false;
        updateConnectionStatus(false, '连接失败，请检查后端服务');
        return false;
    }
}

// 更新连接状态显示
function updateConnectionStatus(connected, message) {
    const statusElement = document.querySelector('.status');
    
    if (connected) {
        statusElement.innerHTML = `<i class="fas fa-circle online"></i> ${message}`;
    } else {
        statusElement.innerHTML = `<i class="fas fa-circle" style="color: #ff0054"></i> ${message}`;
    }
}

// 导航功能
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('.section');
    const featureCards = document.querySelectorAll('.feature-card');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有活动状态
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).classList.add('active');
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
    
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // 找到对应的导航链接
            const correspondingLink = document.querySelector(`.nav-menu a[href="${target}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
                document.querySelector(target).classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// 函数可视化功能
function initMathVisualizer() {
    const plotBtn = document.getElementById('plot-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const functionInput = document.getElementById('function-input');
    
    plotBtn.addEventListener('click', function() {
        const funcStr = functionInput.value;
        const xMin = parseFloat(document.getElementById('x-min').value);
        const xMax = parseFloat(document.getElementById('x-max').value);
        const yMin = parseFloat(document.getElementById('y-min').value);
        const yMax = parseFloat(document.getElementById('y-max').value);
        
        plotFunction(funcStr, xMin, xMax, yMin, yMax);
    });
    
    presetBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const func = this.getAttribute('data-func');
            functionInput.value = func;
            plotFunction(func, -10, 10, -5, 5);
            
            // 更新输入框的值
            document.getElementById('x-min').value = -10;
            document.getElementById('x-max').value = 10;
            document.getElementById('y-min').value = -5;
            document.getElementById('y-max').value = 5;
        });
    });
    
    // 监听输入框回车键
    functionInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            plotBtn.click();
        }
    });
}

function plotFunction(funcStr, xMin, xMax, yMin, yMax) {
    try {
        // 清理函数字符串
        funcStr = funcStr.replace(/\^/g, '**').toLowerCase();
        
        // 生成x值
        const xValues = [];
        const step = (xMax - xMin) / 200;
        for (let x = xMin; x <= xMax; x += step) {
            xValues.push(x);
        }
        
        // 计算y值
        const yValues = [];
        xValues.forEach(x => {
            try {
                // 替换函数中的x为当前值
                let expression = funcStr.replace(/x/g, `(${x})`);
                // 处理特殊函数
                expression = expression.replace(/sin\(/g, 'Math.sin(');
                expression = expression.replace(/cos\(/g, 'Math.cos(');
                expression = expression.replace(/tan\(/g, 'Math.tan(');
                expression = expression.replace(/log\(/g, 'Math.log(');
                expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
                expression = expression.replace(/abs\(/g, 'Math.abs(');
                expression = expression.replace(/exp\(/g, 'Math.exp(');
                
                const y = eval(expression);
                yValues.push(y);
            } catch (e) {
                yValues.push(null);
            }
        });
        
        // 获取颜色和宽度
        const lineColor = document.getElementById('line-color').value;
        const lineWidth = document.getElementById('line-width').value;
        
        // 绘制图形
        const trace = {
            x: xValues,
            y: yValues,
            mode: 'lines',
            type: 'scatter',
            name: `f(x) = ${funcStr.replace(/\*\*/g, '^')}`,
            line: {
                color: lineColor,
                width: parseInt(lineWidth)
            }
        };
        
        const layout = {
            title: `函数图像: f(x) = ${funcStr.replace(/\*\*/g, '^')}`,
            xaxis: {
                title: 'x',
                range: [xMin, xMax],
                gridcolor: '#e0e0e0',
                zerolinecolor: '#999'
            },
            yaxis: {
                title: 'f(x)',
                range: [yMin, yMax],
                gridcolor: '#e0e0e0',
                zerolinecolor: '#999'
            },
            plot_bgcolor: '#fff',
            paper_bgcolor: '#fff',
            font: {
                family: 'Arial, sans-serif',
                size: 14,
                color: '#333'
            },
            showlegend: true,
            legend: {
                x: 0.02,
                y: 0.98,
                bgcolor: 'rgba(255,255,255,0.8)'
            }
        };
        
        Plotly.newPlot('function-plot', [trace], layout);
        
        // 更新函数信息
        document.getElementById('function-info').textContent = 
            `当前函数: f(x) = ${funcStr.replace(/\*\*/g, '^')} | 定义域: [${xMin}, ${xMax}] | 值域: [${yMin}, ${yMax}]`;
        
    } catch (error) {
        alert('函数解析错误，请检查输入格式。\n支持函数: sin, cos, tan, log, sqrt, abs, exp\n运算符: +, -, *, /, ^ (幂)\n示例: sin(x), x^2+2*x+1, log(x+1)');
        console.error('Plotting error:', error);
    }
}

// 英语学习系统
function initEnglishQuiz() {
    // 模式切换
    const modeBtns = document.querySelectorAll('.mode-btn');
    const quizModes = document.querySelectorAll('.quiz-mode');
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.getAttribute('data-mode');
            
            // 更新按钮状态
            modeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // 更新显示模式
            quizModes.forEach(m => m.classList.remove('active'));
            document.getElementById(`${mode}-mode`).classList.add('active');
            
            // 如果是卡片模式，更新显示
            if (mode === 'flashcard') {
                updateFlashcard();
            }
        });
    });
    
    // 单词卡片功能
    const flashcard = document.querySelector('.flashcard');
    const prevBtn = document.getElementById('prev-card');
    const nextBtn = document.getElementById('next-card');
    const flipBtns = document.querySelectorAll('.btn-flip');
    const markKnownBtn = document.getElementById('mark-known');
    const markDifficultBtn = document.getElementById('mark-difficult');
    
    flipBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            flashcard.classList.toggle('flipped');
        });
    });
    
    prevBtn.addEventListener('click', function() {
        currentWordIndex = (currentWordIndex - 1 + words.length) % words.length;
        updateFlashcard();
    });
    
    nextBtn.addEventListener('click', function() {
        currentWordIndex = (currentWordIndex + 1) % words.length;
        updateFlashcard();
    });
    
    markKnownBtn.addEventListener('click', function() {
        words[currentWordIndex].difficulty = Math.max(1, words[currentWordIndex].difficulty - 1);
        showFeedback('已标记为已掌握', 'success');
        loadWordList();
    });
    
    markDifficultBtn.addEventListener('click', function() {
        words[currentWordIndex].difficulty = Math.min(5, words[currentWordIndex].difficulty + 1);
        showFeedback('已标记为难点', 'warning');
        loadWordList();
    });
    
    // 选择题功能
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const isCorrect = this.classList.contains('correct');
            const feedback = document.getElementById('mcq-feedback');
            
            optionBtns.forEach(b => {
                b.disabled = true;
                if (b.classList.contains('correct')) {
                    b.style.backgroundColor = '#38b000';
                    b.style.color = 'white';
                }
            });
            
            if (isCorrect) {
                feedback.textContent = '正确！"Ubiquitous" 意思是普遍存在的。';
                feedback.className = 'feedback correct';
            } else {
                feedback.textContent = '错误！正确答案是：普遍存在的。';
                feedback.className = 'feedback incorrect';
            }
        });
    });
    
    // 拼写测试功能
    const spellingInput = document.getElementById('spelling-input');
    const checkSpellingBtn = document.getElementById('check-spelling');
    
    checkSpellingBtn.addEventListener('click', function() {
        const userAnswer = spellingInput.value.trim().toLowerCase();
        const correctAnswer = 'algorithm';
        const feedback = document.getElementById('spelling-feedback');
        
        if (userAnswer === correctAnswer) {
            feedback.textContent = '正确！拼写完全正确。';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = `错误！正确答案是：${correctAnswer}。你的答案：${userAnswer}`;
            feedback.className = 'feedback incorrect';
        }
    });
    
    spellingInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkSpellingBtn.click();
        }
    });
    
    // 添加单词功能
    const addWordBtn = document.getElementById('add-word-btn');
    const newWordInput = document.getElementById('new-word');
    const newMeaningInput = document.getElementById('new-meaning');
    
    addWordBtn.addEventListener('click', function() {
        const word = newWordInput.value.trim();
        const meaning = newMeaningInput.value.trim();
        
        if (word && meaning) {
            // 检查是否已存在
            if (!words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
                words.push({
                    word: word,
                    phonetic: '/发音待添加/',
                    meaning: meaning,
                    example: `示例句子待添加。`,
                    difficulty: 3
                });
                
                showFeedback(`已添加单词: ${word}`, 'success');
                loadWordList();
                
                // 清空输入框
                newWordInput.value = '';
                newMeaningInput.value = '';
            } else {
                showFeedback('该单词已存在！', 'error');
            }
        } else {
            showFeedback('请输入完整的单词和释义', 'error');
        }
    });
    
    // 回车键添加单词
    newMeaningInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addWordBtn.click();
        }
    });
}

function updateFlashcard() {
    const word = words[currentWordIndex];
    const flashcard = document.querySelector('.flashcard');
    
    // 确保卡片显示正面
    flashcard.classList.remove('flipped');
    
    // 更新正面内容
    document.querySelector('.flashcard-front h3').textContent = word.word;
    document.querySelector('.flashcard-front .phonetic').textContent = word.phonetic;
    
    // 更新背面内容
    document.querySelector('.flashcard-back h3').textContent = word.word;
    document.querySelector('.flashcard-back .definition').innerHTML = 
        `<strong>释义:</strong> ${word.meaning}`;
    document.querySelector('.flashcard-back .example').innerHTML = 
        `<strong>例句:</strong> ${word.example}`;
    
    // 更新进度指示
    const progress = document.querySelector('.progress-indicator');
    if (progress) {
        progress.textContent = `${currentWordIndex + 1} / ${words.length}`;
    }
}

function loadWordList() {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    
    words.forEach((word, index) => {
        const wordItem = document.createElement('div');
        wordItem.className = 'word-item';
        wordItem.innerHTML = `
            <div>
                <strong>${word.word}</strong>
                <span class="word-meaning">${word.meaning}</span>
            </div>
            <div class="word-difficulty">
                ${'★'.repeat(word.difficulty)}${'☆'.repeat(5 - word.difficulty)}
                ${index === currentWordIndex ? '<span class="current">当前</span>' : ''}
            </div>
        `;
        
        wordItem.addEventListener('click', function() {
            currentWordIndex = index;
            updateFlashcard();
            // 切换到卡片模式
            document.querySelector('.mode-btn[data-mode="flashcard"]').click();
        });
        
        wordList.appendChild(wordItem);
    });
}

// AI助手功能 - 修改为真实API调用
function initAIAssistant() {
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    const clearChatBtn = document.getElementById('clear-chat');
    const quickQuestionBtns = document.querySelectorAll('.quick-question-btn');
    const aiFeatureBtns = document.querySelectorAll('.ai-feature-btn');
    
    // 添加超时处理的fetch函数
    async function fetchWithTimeout(url, options, timeout = 90000) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    // 添加加载状态指示器
    function addTypingIndicator() {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message ai-message';
        typingIndicator.id = 'typing-indicator';
        typingIndicator.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <p style="margin-top: 10px; color: #666; font-size: 0.9em;">
                    AI正在思考中，这可能需要几秒钟到一分钟时间...
                </p>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // 移除加载指示器
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // 发送消息到真实API
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // 禁用发送按钮
        sendBtn.disabled = true;
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 发送中';
        userInput.disabled = true;
        
        // 添加用户消息
        addMessage(message, 'user');
        userInput.value = '';
        
        // 添加正在输入指示器
        addTypingIndicator();
        
        // 显示连接状态
        updateConnectionStatus(false, '正在连接AI服务...');
        
        try {
            // 检查连接
            if (!AI_CONFIG.isConnected) {
                const connected = await checkAIConnection();
                if (!connected) {
                    throw new Error('无法连接到AI服务');
                }
            }
            
            // 更新连接状态
            updateConnectionStatus(true, '正在处理请求...');
            
            // 发送请求到后端（使用带超时的fetch）
            const response = await fetchWithTimeout(`${AI_CONFIG.API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: AI_CONFIG.sessionId
                })
            }, 90000); // 90秒超时
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // 添加AI回复
                addMessage(data.response, 'ai');
                updateConnectionStatus(true, '已连接到AI服务');
            } else {
                // 显示错误
                const errorMsg = data.error || '请求失败，请重试';
                addMessage(`抱歉，出现错误：${errorMsg}`, 'ai');
                console.error('API错误:', data);
                
                if (data.error === 'Invalid API key provided' || data.error?.includes('API')) {
                    updateConnectionStatus(false, 'API密钥错误，请检查配置');
                    showFeedback('API密钥错误，请检查backend/.env文件配置', 'error');
                } else if (data.error.includes('超时')) {
                    updateConnectionStatus(false, '请求超时');
                    showFeedback('请求超时，请重试或简化问题', 'warning');
                }
            }
        } catch (error) {
            console.error('发送消息失败:', error);
            
            let errorMessage = '抱歉，网络连接出现问题';
            if (error.name === 'AbortError') {
                errorMessage = '请求超时，请稍后重试';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = '无法连接到服务器，请检查后端是否运行';
            }
            
            addMessage(`${errorMessage}。错误详情：${error.message}`, 'ai');
            updateConnectionStatus(false, '连接失败');
            showFeedback('连接失败，请确保后端服务正在运行', 'error');
        } finally {
            // 移除加载指示器
            removeTypingIndicator();
            
            // 启用发送按钮和输入框
            sendBtn.disabled = false;
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送';
            userInput.disabled = false;
            
            // 自动滚动到底部
            if (document.getElementById('auto-scroll').checked) {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // 聚焦输入框
            userInput.focus();
        }
    }
    
    // 添加消息到聊天界面
    function addMessage(content, sender) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.className = `message ${sender}-message`;
        
        // 格式化消息内容（支持简单的Markdown）
        const formattedContent = formatMessage(content);
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${formattedContent}
            </div>
            <div class="message-time">${time}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // 移除欢迎消息（如果是第一条用户消息）
        const welcomeMsg = chatMessages.querySelector('.ai-message:first-child');
        if (welcomeMsg && welcomeMsg.textContent.includes('我可以帮助你解答数学问题')) {
            welcomeMsg.style.opacity = '0.7';
        }
    }
    
    // 格式化消息内容
    function formatMessage(content) {
        // 基本Markdown支持
        let formatted = content
            // 保护HTML
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            // 换行
            .replace(/\n/g, '<br>')
            // 粗体
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // 行内代码
            .replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 代码块
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
            return `<pre><code>${code.trim()}</code></pre>`;
        });
        
        // 段落
        const paragraphs = formatted.split('<br><br>');
        if (paragraphs.length > 1) {
            formatted = paragraphs.map(p => `<p>${p}</p>`).join('');
        }
        
        return formatted;
    }
    
    sendBtn.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 清空对话
    clearChatBtn.addEventListener('click', function() {
        if (confirm('确定要清空对话记录吗？')) {
            chatMessages.innerHTML = `
                <div class="message ai-message">
                    <div class="message-content">
                        <p>对话已清空。你好！我是DeepSeek AI教学助手，基于真实的DeepSeek API。我可以帮助你解答数学问题、英语学习疑问，或者解释其他学科的概念。请问有什么可以帮你的吗？</p>
                    </div>
                    <div class="message-time">刚刚</div>
                </div>
            `;
            
            // 重新生成会话ID，清空历史
            AI_CONFIG.sessionId = 'user_' + Date.now();
        }
    });
    
    // 快速问题按钮
    quickQuestionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const question = this.textContent;
            userInput.value = question;
            sendMessage();
        });
    });
    
    // AI功能按钮
    aiFeatureBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            let question = '';
            
            switch(action) {
                case 'explain-math':
                    question = '请解释什么是二次函数，并给出图像特征和实际应用例子。';
                    break;
                case 'grammar-check':
                    question = '请帮我检查这句话的语法是否正确："He go to school everyday."';
                    break;
                case 'generate-quiz':
                    question = '请生成5个关于三角函数的选择题，包含答案和解析。';
                    break;
                case 'study-plan':
                    question = '请为我制定一个为期一周的高中数学学习计划。';
                    break;
            }
            
            if (question) {
                userInput.value = question;
                sendMessage();
            }
        });
    });
    
    // 添加重新连接按钮
    const reconnectBtn = document.createElement('button');
    reconnectBtn.className = 'btn btn-outline';
    reconnectBtn.innerHTML = '<i class="fas fa-plug"></i> 重新连接';
    reconnectBtn.style.marginLeft = '10px';
    reconnectBtn.addEventListener('click', async () => {
        reconnectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 连接中';
        const connected = await checkAIConnection();
        if (connected) {
            showFeedback('连接成功！', 'success');
        }
        reconnectBtn.innerHTML = '<i class="fas fa-plug"></i> 重新连接';
    });
    
    // 将重新连接按钮添加到设置区域
    const chatSettings = document.querySelector('.chat-settings');
    if (chatSettings) {
        chatSettings.appendChild(reconnectBtn);
    }
}

// 工具函数
function showFeedback(message, type) {
    // 创建反馈元素
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    feedback.style.position = 'fixed';
    feedback.style.top = '20px';
    feedback.style.right = '20px';
    feedback.style.zIndex = '1000';
    feedback.style.padding = '15px 20px';
    feedback.style.borderRadius = '8px';
    feedback.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    feedback.style.maxWidth = '300px';
    
    if (type === 'success') {
        feedback.style.backgroundColor = '#d4edda';
        feedback.style.color = '#155724';
        feedback.style.border = '1px solid #c3e6cb';
    } else if (type === 'warning') {
        feedback.style.backgroundColor = '#fff3cd';
        feedback.style.color = '#856404';
        feedback.style.border = '1px solid #ffeaa7';
    } else {
        feedback.style.backgroundColor = '#f8d7da';
        feedback.style.color = '#721c24';
        feedback.style.border = '1px solid #f5c6cb';
    }
    
    document.body.appendChild(feedback);
    
    // 3秒后移除
    setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 500);
    }, 3000);
}

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // Ctrl+1,2,3,4 切换模块
    if (e.ctrlKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                document.querySelector('.nav-menu a[href="#home"]').click();
                break;
            case '2':
                e.preventDefault();
                document.querySelector('.nav-menu a[href="#math"]').click();
                break;
            case '3':
                e.preventDefault();
                document.querySelector('.nav-menu a[href="#english"]').click();
                break;
            case '4':
                e.preventDefault();
                document.querySelector('.nav-menu a[href="#ai"]').click();
                break;
        }
    }
    
    // 英语模块快捷键
    if (document.querySelector('#english.section.active')) {
        switch(e.key) {
            case 'ArrowLeft':
                if (document.querySelector('#flashcard-mode').classList.contains('active')) {
                    document.getElementById('prev-card').click();
                }
                break;
            case 'ArrowRight':
                if (document.querySelector('#flashcard-mode').classList.contains('active')) {
                    document.getElementById('next-card').click();
                }
                break;
            case ' ':
                if (document.querySelector('#flashcard-mode').classList.contains('active')) {
                    e.preventDefault();
                    document.querySelector('.btn-flip').click();
                }
                break;
        }
    }
});