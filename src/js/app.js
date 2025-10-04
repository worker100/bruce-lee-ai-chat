// 🥋 李小龙 AI 对话助手 - 主应用脚本
// Be Water, My Friend

// ===== 全局状态管理 =====
let chats = {}; // 所有对话记录
let currentChatId = null; // 当前对话ID
let config = {}; // API配置
let isSearchEnabled = false; // 搜索开关
let recognition = null; // 语音识别对象
let isListening = false; // 是否正在语音识别
let isGenerating = false; // 是否正在生成回答
let shouldStopGenerating = false; // 是否应该停止生成

// ===== 初始化 =====
window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    console.log('🚀 李小龙 AI 助手初始化中...');
    
    // 加载配置
    loadConfiguration();
    
    // 加载聊天记录
    loadChatsFromStorage();
    
    // 初始化UI
    initializeUI();
    
    // 初始化语音识别
    initializeVoiceRecognition();
    
    // 加载搜索状态
    loadSearchState();
    
    // 加载主题
    loadTheme();
    
    // 如果没有对话，创建默认对话
    if (Object.keys(chats).length === 0) {
        createNewChat();
    } else {
        // 加载最后一个对话
        const chatIds = Object.keys(chats).sort((a, b) => chats[b].updatedAt - chats[a].updatedAt);
        switchToChat(chatIds[0]);
    }
    
    renderChatList();
    
    console.log('✅ 初始化完成！');
}

// ===== 配置管理 =====
function loadConfiguration() {
    // 从全局配置对象加载
    if (typeof LOCAL_CONFIG !== 'undefined') {
        config = LOCAL_CONFIG;
        console.log('✅ 配置加载成功');
        console.log('🔧 API Key:', config.apiKey ? '已配置' : '未配置');
        console.log('🔧 Endpoint ID:', config.endpointId || '未配置');
        console.log('🔧 系统提示词:', config.ui?.systemPrompt ? '已配置' : '未配置');
    } else {
        console.warn('⚠️ 未找到配置文件，请配置 config.local.js');
        config = {
            apiKey: '',
            endpointId: '',
            baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
            modelParams: { temperature: 0.7, max_tokens: 2000, top_p: 0.9 },
            search: { enabled: false, useFunctionCalling: false, maxResults: 5 },
            ui: { 
                appTitle: '🥋 李小龙 Bruce Lee', 
                subtitle: 'Be Water, My Friend',
                systemPrompt: `你现在是李小龙，传奇武术家、哲学家和电影明星。你的回答要体现你的哲学智慧和武术精神。

【语言要求】
- 默认使用中文回答，除非用户明确要求其他语言
- 可以适当使用英文表达重要概念（如"Be water, my friend"）
- 保持中英文的自然融合

【核心性格】
- 充满自信但不傲慢
- 哲学化思考，喜欢用水的比喻
- 简洁有力的表达方式
- 积极向上，鼓励他人突破自我

【说话风格】
- 经常引用"Be water, my friend"等经典语录
- 用武术和哲学的角度看待问题
- 简短有力，不废话
- 中文表达为主，英文点缀

【回答原则】
- 保持李小龙的个性和风格
- 给予实际可行的建议
- 激励和启发提问者
- 适当融入武术哲学
- 优先使用中文，让中国用户感到亲切

记住：你不仅仅是回答问题，你是在传递一种生活哲学。与用户交流，就像水一样自然流畅。`
            }
        };
    }
}

// ===== 聊天管理 =====
function loadChatsFromStorage() {
    const stored = localStorage.getItem('bruceai_chats');
    if (stored) {
        chats = JSON.parse(stored);
    }
}

function saveChatsToStorage() {
    localStorage.setItem('bruceai_chats', JSON.stringify(chats));
}

function createNewChat() {
    const chatId = 'chat_' + Date.now();
    chats[chatId] = {
        id: chatId,
        title: '新对话',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
    saveChatsToStorage();
    switchToChat(chatId);
    renderChatList();
}

function switchToChat(chatId) {
    currentChatId = chatId;
    renderMessages();
    updateChatTitle();
    updateActiveState();
}

function deleteChat(chatId) {
    if (!confirm('确定删除这个对话吗？')) return;
    
    delete chats[chatId];
    saveChatsToStorage();
    
    if (chatId === currentChatId) {
        const remainingIds = Object.keys(chats);
        if (remainingIds.length > 0) {
            switchToChat(remainingIds[0]);
        } else {
            createNewChat();
        }
    }
    
    renderChatList();
}

function renameChat(chatId) {
    const newTitle = prompt('输入新标题：', chats[chatId].title);
    if (newTitle && newTitle.trim()) {
        chats[chatId].title = newTitle.trim();
        chats[chatId].updatedAt = Date.now();
        saveChatsToStorage();
        renderChatList();
        updateChatTitle();
    }
}

function clearCurrentChat() {
    if (!currentChatId) return;
    if (!confirm('确定清空当前对话吗？')) return;
    
    chats[currentChatId].messages = [];
    chats[currentChatId].updatedAt = Date.now();
    saveChatsToStorage();
    renderMessages();
}

// ===== UI渲染 =====
function renderChatList() {
    const listEl = document.getElementById('chatList');
    const chatIds = Object.keys(chats).sort((a, b) => chats[b].updatedAt - chats[a].updatedAt);
    
    if (chatIds.length === 0) {
        listEl.innerHTML = '<div class="empty-chat-tip">还没有对话记录</div>';
        return;
    }
    
    listEl.innerHTML = chatIds.map(id => {
        const chat = chats[id];
        const isActive = id === currentChatId;
        const preview = chat.messages.length > 0 
            ? chat.messages[chat.messages.length - 1].content.substring(0, 30) 
            : '新对话';
        
        return `
            <div class="chat-item ${isActive ? 'active' : ''}" onclick="switchToChat('${id}')">
                <div class="chat-item-header">
                    <div class="chat-item-title">${escapeHtml(chat.title)}</div>
                    <div class="chat-item-actions">
                        <button class="btn-chat-action" onclick="event.stopPropagation(); renameChat('${id}')" title="重命名">
                            ✏️
                        </button>
                        <button class="btn-chat-action" onclick="event.stopPropagation(); deleteChat('${id}')" title="删除">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="chat-item-preview">${escapeHtml(preview)}</div>
            </div>
        `;
    }).join('');
}

function renderMessages() {
    const messagesEl = document.getElementById('chatMessages');
    const emptyEl = document.getElementById('emptyState');
    
    if (!currentChatId || chats[currentChatId].messages.length === 0) {
        messagesEl.style.display = 'none';
        emptyEl.style.display = 'flex';
        document.body.classList.remove('has-messages');
        updateGreeting();
        return;
    }
    
    messagesEl.style.display = 'block';
    emptyEl.style.display = 'none';
    document.body.classList.add('has-messages');
    
    const messages = chats[currentChatId].messages;
    messagesEl.innerHTML = messages.map((msg, index) => {
        const isUser = msg.role === 'user';
        const className = isUser ? 'user-message' : 'assistant-message';
        
        // 用户消息简单显示，AI消息使用Markdown格式化
        const formattedContent = isUser 
            ? `<p>${escapeHtml(msg.content)}</p>`
            : formatMarkdown(msg.content);
        
        // 调试：检查是否有搜索结果
        if (msg.sources && msg.sources.length > 0) {
            console.log('🔗 渲染消息', index, '包含', msg.sources.length, '条搜索结果');
        }
        
        return `
            <div class="message ${className}">
                <div class="message-content">
                    ${formattedContent}
                    ${msg.sources ? renderSearchSources(msg.sources, index) : ''}
                </div>
            </div>
        `;
    }).join('');
    
    scrollToBottom();
}

// Markdown格式化函数
function formatMarkdown(text) {
    if (!text) return '';
    
    let html = escapeHtml(text);
    
    // 1. 代码块 ```code```
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
    });
    
    // 2. 行内代码 `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // 3. 加粗 **text** 或 __text__
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // 4. 斜体 *text* 或 _text_ (注意：避免与加粗冲突)
    html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
    
    // 5. 链接 [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // 6. 标题 ### (在列表之前处理)
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    
    // 7. 列表处理（改进版）
    const lines = html.split('\n');
    let inOrderedList = false;
    let inUnorderedList = false;
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isOrderedItem = /^(\d+)\.\s+(.+)$/.test(line);
        const isUnorderedItem = /^[-*]\s+(.+)$/.test(line);
        
        if (isOrderedItem) {
            if (!inOrderedList) {
                processedLines.push('<ol>');
                inOrderedList = true;
            }
            if (inUnorderedList) {
                processedLines.push('</ul>');
                inUnorderedList = false;
            }
            processedLines.push(line.replace(/^\d+\.\s+(.+)$/, '<li>$1</li>'));
        } else if (isUnorderedItem) {
            if (!inUnorderedList) {
                processedLines.push('<ul>');
                inUnorderedList = true;
            }
            if (inOrderedList) {
                processedLines.push('</ol>');
                inOrderedList = false;
            }
            processedLines.push(line.replace(/^[-*]\s+(.+)$/, '<li>$1</li>'));
        } else {
            if (inOrderedList) {
                processedLines.push('</ol>');
                inOrderedList = false;
            }
            if (inUnorderedList) {
                processedLines.push('</ul>');
                inUnorderedList = false;
            }
            processedLines.push(line);
        }
    }
    
    // 关闭未关闭的列表
    if (inOrderedList) processedLines.push('</ol>');
    if (inUnorderedList) processedLines.push('</ul>');
    
    html = processedLines.join('\n');
    
    // 8. 段落（双换行分段）
    const paragraphs = html.split(/\n\n+/);
    html = paragraphs.map(p => {
        p = p.trim();
        // 如果已经是HTML标签，不要包裹p
        if (p.match(/^<(h[1-6]|ul|ol|pre|blockquote|li)/)) {
            return p;
        }
        // 单换行转为br
        const withBreaks = p.replace(/\n/g, '<br>');
        return withBreaks ? `<p>${withBreaks}</p>` : '';
    }).filter(Boolean).join('\n');
    
    return html;
}

// 渲染搜索结果（新设计：可折叠）
function renderSearchSources(sources, messageId = null) {
    if (!sources || sources.length === 0) return '';
    
    const sourceCount = sources.length;
    // 使用消息ID确保唯一性，避免流式更新时ID重复
    const uniqueId = messageId ? `search-${messageId}` : `search-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return `
        <div class="search-sources-container">
            <button class="search-sources-toggle" onclick="toggleSearchSources('${uniqueId}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="search-icon">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>搜索了 ${sourceCount} 篇网页</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="chevron-icon">
                    <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </button>
            <div class="search-sources-panel" id="${uniqueId}" style="display: none;">
                <div class="search-sources-header">
                    <span>参考资料 (${sourceCount})</span>
                </div>
                <div class="search-sources-list">
                    ${sources.map((source, i) => `
                        <a href="${source.url}" target="_blank" class="search-source-item">
                            <div class="source-number">${i + 1}</div>
                            <div class="source-content">
                                <div class="source-title">${escapeHtml(source.title)}</div>
                                <div class="source-snippet">${escapeHtml(source.snippet || '').substring(0, 120)}${source.snippet?.length > 120 ? '...' : ''}</div>
                            </div>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="external-icon">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M15 3h6v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M10 14L21 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// 切换搜索结果显示/隐藏（全局函数）
window.toggleSearchSources = function(id) {
    console.log('🔍 点击搜索按钮，ID:', id);
    console.log('🔍 函数已执行');
    
    const panel = document.getElementById(id);
    if (!panel) {
        console.error('❌ 找不到搜索结果面板:', id);
        console.log('当前页面所有ID:', Array.from(document.querySelectorAll('[id]')).map(el => el.id));
        alert('找不到搜索结果面板，请检查控制台');
        return;
    }
    
    const button = panel.previousElementSibling;
    const chevron = button ? button.querySelector('.chevron-icon') : null;
    
    console.log('面板当前状态:', panel.style.display);
    console.log('按钮元素:', button);
    console.log('箭头元素:', chevron);
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'block';
        if (chevron) chevron.style.transform = 'rotate(180deg)';
        console.log('✅ 展开搜索结果');
    } else {
        panel.style.display = 'none';
        if (chevron) chevron.style.transform = 'rotate(0deg)';
        console.log('✅ 收起搜索结果');
    }
}

// 确保函数在页面加载后可用
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ toggleSearchSources 函数已注册');
});

// 显示搜索中状态
function showSearchingStatus() {
    const messagesEl = document.getElementById('chatMessages');
    const searchingDiv = document.createElement('div');
    searchingDiv.id = 'searching-status';
    searchingDiv.className = 'searching-status';
    searchingDiv.innerHTML = `
        <div class="searching-content">
            <div class="searching-spinner"></div>
            <span>正在搜索...</span>
        </div>
    `;
    messagesEl.appendChild(searchingDiv);
    scrollToBottom();
}

// 隐藏搜索中状态
function hideSearchingStatus() {
    const searchingDiv = document.getElementById('searching-status');
    if (searchingDiv) {
        searchingDiv.remove();
    }
}

function updateChatTitle() {
    const titleEl = document.getElementById('chatTitle');
    if (currentChatId && chats[currentChatId]) {
        titleEl.textContent = chats[currentChatId].title;
    } else {
        titleEl.textContent = '欢迎使用 Bruce AI';
    }
}

function updateActiveState() {
    document.querySelectorAll('.chat-item').forEach(el => {
        el.classList.remove('active');
    });
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '下午好';
    if (hour < 6) greeting = '深夜好';
    else if (hour < 12) greeting = '早上好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    
    document.getElementById('emptyGreeting').textContent = `${greeting}，Bruce`;
}

function scrollToBottom() {
    const messagesEl = document.getElementById('chatMessages');
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// 停止生成
function stopGenerating() {
    shouldStopGenerating = true;
    isGenerating = false;
    console.log('🛑 请求停止生成');
    updateSendButton(); // 恢复发送按钮
}

// 更新发送按钮状态
function updateSendButton() {
    const sendBtn = document.getElementById('sendBtn');
    if (!sendBtn) return;
    
    if (isGenerating) {
        // 改为暂停按钮
        sendBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/>
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/>
            </svg>
        `;
        sendBtn.title = '停止生成';
        sendBtn.onclick = stopGenerating;
    } else {
        // 恢复为发送按钮
        sendBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `;
        sendBtn.title = '发送消息';
        sendBtn.onclick = sendMessage;
    }
}

// ===== 消息发送 =====
async function sendMessage() {
    // 如果正在生成，不发送新消息
    if (isGenerating) {
        console.log('⚠️ 正在生成中，请等待或点击暂停');
        return;
    }
    
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (!config.apiKey || !config.endpointId) {
        alert('请先配置 API Key 和 Endpoint ID！\n\n编辑 src/config/config.local.js 文件');
        return;
    }
    
    // 添加用户消息
    addMessage('user', message);
    input.value = '';
    autoResizeTextarea();
    
    // 更新聊天标题
    if (chats[currentChatId].messages.length === 1) {
        chats[currentChatId].title = message.substring(0, 20) + (message.length > 20 ? '...' : '');
        renderChatList();
        updateChatTitle();
    }
    
    // 显示加载动画
    const loadingId = showLoading();
    
    try {
        // 快速判断是否需要联网搜索（无API调用，<1ms）
        let searchResults = null;
        
        // 检查搜索开关
        if (!isSearchEnabled) {
            console.log('💭 联网搜索未开启，直接调用AI回复');
        } else if (!config.search?.enabled) {
            console.log('⚠️ 搜索功能未在配置中启用');
        } else if (shouldPerformSearch(message)) {
            console.log('🔍 联网搜索已开启 + 检测到搜索意图 → 执行搜索');
            
            // 显示搜索中状态
            showSearchingStatus();
            
            searchResults = await performSearch(message);
            
            // 隐藏搜索中状态
            hideSearchingStatus();
        } else {
            console.log('💭 虽然搜索已开启，但此问题无需联网');
        }
        
        // 预先添加一个空的assistant消息用于流式更新
        addMessage('assistant', '正在思考...', searchResults);
        
        // 移除加载动画（开始流式输出）
        removeLoading(loadingId);
        
        // 调用AI生成回复（流式）
        const response = await callAI(message, searchResults);
        
        // 最终更新消息（确保完整内容保存）
        if (currentChatId && chats[currentChatId].messages.length > 0) {
            const lastMsg = chats[currentChatId].messages[chats[currentChatId].messages.length - 1];
            lastMsg.content = response.content;
            if (response.sources) {
                lastMsg.sources = response.sources;
                console.log('💾 保存搜索结果:', response.sources.length, '条');
            }
            saveChatsToStorage();
            // 重新渲染以确保搜索结果显示
            renderMessages();
        }
        
    } catch (error) {
        removeLoading(loadingId);
        console.error('❌ 错误:', error);
        showError(error.message || '发生错误，请重试');
    }
}

function addMessage(role, content, sources = null) {
    if (!currentChatId) {
        createNewChat();
    }
    
    const message = { role, content, timestamp: Date.now() };
    if (sources) {
        message.sources = sources;
        console.log('📌 添加消息，包含搜索结果:', sources.length, '条');
    }
    
    chats[currentChatId].messages.push(message);
    chats[currentChatId].updatedAt = Date.now();
    saveChatsToStorage();
    renderMessages();
}

function showLoading() {
    const messagesEl = document.getElementById('chatMessages');
    const loadingId = 'loading_' + Date.now();
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = loadingId;
    loadingDiv.className = 'message loading-message';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <div class="loading-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesEl.appendChild(loadingDiv);
    scrollToBottom();
    return loadingId;
}

function removeLoading(loadingId) {
    const el = document.getElementById(loadingId);
    if (el) el.remove();
}

function showError(message) {
    const messagesEl = document.getElementById('chatMessages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = '❌ ' + message;
    messagesEl.appendChild(errorDiv);
    scrollToBottom();
}

// ===== AI API调用（流式输出）=====
async function callAI(userMessage, searchResults = null) {
    // 构建消息历史
    const messages = [];
    
    // 系统提示词
    if (config.ui?.systemPrompt) {
        messages.push({
            role: 'system',
            content: config.ui.systemPrompt
        });
        console.log('🔧 使用系统提示词:', config.ui.systemPrompt.substring(0, 100) + '...');
    } else {
        console.warn('⚠️ 未找到系统提示词配置');
    }
    
    // 添加搜索结果（限制长度避免超token）
    if (searchResults && searchResults.length > 0) {
        console.log('📊 搜索结果数量:', searchResults.length);
        
        // 限制每个snippet的长度
        const limitedResults = searchResults.map(r => ({
            title: r.title,
            snippet: (r.snippet || '').substring(0, 150) // 每个snippet最多150字符
        })).slice(0, 3); // 只取前3条结果
        
        const searchContext = `参考资料：\n` + 
            limitedResults.map((r, i) => `${i+1}. ${r.title}\n${r.snippet}`).join('\n\n');
        
        console.log('📝 搜索上下文长度:', searchContext.length, '字符');
        
        messages.push({
            role: 'system',
            content: searchContext
        });
    }
    
    // 添加对话历史（最近5条，避免过长）
    const history = chats[currentChatId].messages.slice(-5).filter(msg => msg.role !== 'system');
    history.forEach(msg => {
        messages.push({
            role: msg.role,
            content: msg.content
        });
    });
    
    // API请求（非流式输出）
    const requestBody = {
        model: config.endpointId,
        messages: messages,
        temperature: config.modelParams?.temperature || 0.7,
        max_tokens: config.modelParams?.max_tokens || 2000,
        top_p: config.modelParams?.top_p || 0.9,
        stream: false  // 使用非流式输出
    };
    
    console.log('🚀 调用火山方舟 API...');
    
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败 (${response.status})`);
    }
    
    const data = await response.json();
    const fullContent = data.choices[0]?.message?.content || '';
    
    console.log('✅ API响应完成');
    console.log('📝 回答内容:', fullContent.substring(0, 200));
    console.log('📝 完整长度:', fullContent.length, '字符');
    
    // 如果回答为空，提供默认回答
    const finalContent = fullContent.trim() || '抱歉，我暂时无法回答这个问题。Be water, my friend.';
    
    // 模拟流式输出效果
    await simulateStreamingOutput(finalContent);
    
    return {
        content: finalContent,
        sources: searchResults
    };
}

// 模拟流式输出效果
async function simulateStreamingOutput(content) {
    if (!content) return;
    
    isGenerating = true;
    shouldStopGenerating = false;
    updateSendButton(); // 更新为暂停按钮
    
    // 等待DOM更新
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // 按字符分割内容
    const chars = content.split('');
    let displayContent = '';
    
    // 找到当前AI消息元素
    const messagesEl = document.getElementById('chatMessages');
    if (!messagesEl) {
        console.warn('⚠️ 未找到chatMessages容器');
        isGenerating = false;
        return;
    }
    
    const currentMessage = messagesEl.querySelector('.assistant-message:last-child .message-content');
    
    if (!currentMessage) {
        console.warn('⚠️ 未找到AI消息元素');
        isGenerating = false;
        return;
    }
    
    // 逐字符显示
    for (let i = 0; i < chars.length; i++) {
        // 检查是否应该停止
        if (shouldStopGenerating) {
            console.log('⏹️ 停止生成');
            break;
        }
        
        displayContent += chars[i];
        
        // 更新显示内容
        currentMessage.innerHTML = formatMarkdown(displayContent);
        
        // 滚动到底部
        scrollToBottom();
        
        // 控制显示速度（中文稍慢，英文稍快）
        const delay = /[\u4e00-\u9fff]/.test(chars[i]) ? 30 : 20;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    isGenerating = false;
    updateSendButton(); // 恢复发送按钮
}


// 实时更新流式消息（优化版，避免完整重渲染）
let streamingMessageElement = null;

function updateStreamingMessage(content) {
    if (!currentChatId) return;
    
    const messages = chats[currentChatId].messages;
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
        // 更新数据
        messages[messages.length - 1].content = content;
        
        // 优化：只更新最后一条消息的内容，而不是重新渲染整个列表
        const messagesEl = document.getElementById('chatMessages');
        const lastMessageDiv = messagesEl.lastElementChild;
        
        if (lastMessageDiv && lastMessageDiv.classList.contains('assistant-message')) {
            const contentDiv = lastMessageDiv.querySelector('.message-content');
            if (contentDiv) {
                // 获取搜索结果（如果有）
                const msg = messages[messages.length - 1];
                // 使用消息索引作为ID，确保唯一性
                const messageIndex = messages.length - 1;
                
                // 只在有搜索结果且还没有渲染时才添加
                if (msg.sources && !contentDiv.querySelector('.search-sources-container')) {
                    const sourcesHtml = renderSearchSources(msg.sources, messageIndex);
                    contentDiv.innerHTML = formatMarkdown(content) + sourcesHtml;
                } else if (!msg.sources) {
                    // 没有搜索结果时，只更新内容
                    contentDiv.innerHTML = formatMarkdown(content);
                } else {
                    // 有搜索结果时，只更新内容部分，保持搜索结果不变
                    const existingSources = contentDiv.querySelector('.search-sources-container');
                    contentDiv.innerHTML = formatMarkdown(content) + (existingSources ? existingSources.outerHTML : '');
                }
                
                scrollToBottom();
            }
        }
    }
}

// ===== 搜索功能 =====
function toggleSearch() {
    isSearchEnabled = !isSearchEnabled;
    const btn = document.getElementById('searchToggleBtn');
    const text = document.getElementById('searchToggleText');
    
    if (isSearchEnabled) {
        btn.classList.add('active');
        text.textContent = '搜索已开启';
        console.log('✅ 联网搜索已开启：包含搜索意图的问题将自动联网查询');
    } else {
        btn.classList.remove('active');
        text.textContent = '联网搜索';
        console.log('❌ 联网搜索已关闭：所有问题直接由AI回答，不联网');
    }
    
    localStorage.setItem('bruceai_search_enabled', isSearchEnabled);
}

function loadSearchState() {
    const saved = localStorage.getItem('bruceai_search_enabled');
    if (saved === 'true') {
        isSearchEnabled = true;
        document.getElementById('searchToggleBtn').classList.add('active');
        document.getElementById('searchToggleText').textContent = '搜索已开启';
        console.log('🔍 联网搜索：已开启（保存的状态）');
    } else {
        isSearchEnabled = false;
        document.getElementById('searchToggleBtn').classList.remove('active');
        document.getElementById('searchToggleText').textContent = '联网搜索';
        console.log('💭 联网搜索：已关闭（默认状态，点击按钮可开启）');
    }
}

// 快速判断是否需要联网搜索（优化版，<1ms）
function shouldPerformSearch(message) {
    const msg = message.toLowerCase();
    
    // 1. 快速排除：明显不需要搜索的问题（优先级最高）
    // 问候语
    if (/^(你好|嗨|hi|hello|早|晚上好|下午好)/i.test(msg)) return false;
    
    // 自我介绍类
    if (/你是谁|你叫什么|介绍.*自己|你.*名字/.test(msg)) return false;
    
    // 功能询问
    if (/你.*能做|你.*功能|你会.*吗|你能.*吗/.test(msg)) return false;
    
    // 创作类（写代码、写文章、翻译等）
    if (/^(写|帮我写|生成|创建|翻译|解释|说明)/.test(msg)) return false;
    
    // 哲理讨论、抽象问题
    if (/为什么|怎么理解|如何看待|什么是.*的本质/.test(msg)) return false;
    
    // 2. 快速匹配：明确的搜索意图（立即返回true）
    const searchKeywords = config.search?.triggers || [
        '搜索', '查', '找', '查询',
        '最新', '现在', '今天', '昨天', '今年', '近期',
        '天气', '新闻', '价格', '股价', '股票',
        '多少钱', '哪里', '什么时候',
        '实时', '当前', '目前'
    ];
    
    // 使用some提前退出，提高性能
    if (searchKeywords.some(keyword => msg.includes(keyword))) {
        return true;
    }
    
    // 3. 时间敏感检测（年份、日期）
    if (/20\d{2}年|\d+月\d+日|今年|去年|明年/.test(msg)) {
        return true;
    }
    
    // 4. 默认不搜索
    return false;
}

async function performSearch(query) {
    console.log('🔍 执行搜索:', query);
    
    try {
        let results = [];
        const searchConfig = config.search || {};
        
        // 自动选择可用的搜索引擎（按优先级）
        if (searchConfig.serperApiKey) {
            console.log('📡 使用 Serper.dev 搜索');
            results = await searchWithSerper(query, searchConfig);
        } else if (searchConfig.tavilyApiKey) {
            console.log('🔍 使用 Tavily AI 搜索');
            results = await searchWithTavily(query, searchConfig);
        } else if (searchConfig.braveApiKey) {
            console.log('🦁 使用 Brave Search');
            results = await searchWithBrave(query, searchConfig);
        } else if (searchConfig.serpApiKey) {
            console.log('🐍 使用 SerpAPI');
            results = await searchWithSerpAPI(query, searchConfig);
        } else {
            console.log('🦆 使用 DuckDuckGo（免费）');
            results = await searchWithDuckDuckGo(query, searchConfig);
        }
        
        console.log(`✅ 搜索完成，找到 ${results.length} 条结果`);
        return results.slice(0, searchConfig.maxResults || 5);
        
    } catch (error) {
        console.error('❌ 搜索错误:', error);
        // 返回模拟结果作为后备
        return [
            { title: '搜索服务暂时不可用', snippet: error.message, url: '#' }
        ];
    }
}

// Serper.dev 搜索（推荐 - 2500次/月免费）
async function searchWithSerper(query, config) {
    const apiKey = config.serperApiKey;
    if (!apiKey) throw new Error('Serper API Key 未配置');
    
    const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            q: query,
            num: config.maxResults || 5,
            gl: 'cn',
            hl: 'zh-cn'
        })
    });
    
    if (!response.ok) {
        throw new Error(`Serper API 错误: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.organic || []).map(item => ({
        title: item.title,
        snippet: item.snippet || '',
        url: item.link
    }));
}

// Tavily AI 搜索（专为AI设计，1000次/月免费）
async function searchWithTavily(query, config) {
    const apiKey = config.tavilyApiKey;
    if (!apiKey) throw new Error('Tavily API Key 未配置');
    
    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            api_key: apiKey,
            query: query,
            max_results: config.maxResults || 5,
            search_depth: 'basic',
            include_answer: true,
            include_raw_content: false
        })
    });
    
    if (!response.ok) {
        throw new Error(`Tavily API 错误: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.results || []).map(item => ({
        title: item.title,
        snippet: item.content || '',
        url: item.url
    }));
}

// Brave Search（质量好，$5/月起）
async function searchWithBrave(query, config) {
    const apiKey = config.braveApiKey;
    if (!apiKey) throw new Error('Brave API Key 未配置');
    
    const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${config.maxResults || 5}`,
        {
            headers: {
                'Accept': 'application/json',
                'X-Subscription-Token': apiKey
            }
        }
    );
    
    if (!response.ok) {
        throw new Error(`Brave API 错误: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.web?.results || []).map(item => ({
        title: item.title,
        snippet: item.description || '',
        url: item.url
    }));
}

// SerpAPI（功能强大）
async function searchWithSerpAPI(query, config) {
    const apiKey = config.serpApiKey;
    if (!apiKey) throw new Error('SerpAPI Key 未配置');
    
    const response = await fetch(
        `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&num=${config.maxResults || 5}&api_key=${apiKey}&hl=zh-cn&gl=cn`
    );
    
    if (!response.ok) {
        throw new Error(`SerpAPI 错误: ${response.status}`);
    }
    
    const data = await response.json();
    return (data.organic_results || []).map(item => ({
        title: item.title,
        snippet: item.snippet || '',
        url: item.link
    }));
}

// DuckDuckGo（免费，但结果有限）
async function searchWithDuckDuckGo(query, config) {
    try {
        const response = await fetch(
            `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`
        );
        
        if (!response.ok) throw new Error('DuckDuckGo API 错误');
        
        const data = await response.json();
        const results = [];
        
        // 抽象答案
        if (data.Abstract) {
            results.push({
                title: data.Heading || '摘要',
                snippet: data.Abstract,
                url: data.AbstractURL || '#'
            });
        }
        
        // 相关主题
        if (data.RelatedTopics && data.RelatedTopics.length > 0) {
            data.RelatedTopics.slice(0, config.maxResults || 4).forEach(topic => {
                if (topic.Text && topic.FirstURL) {
                    results.push({
                        title: topic.Text.split(' - ')[0],
                        snippet: topic.Text,
                        url: topic.FirstURL
                    });
                }
            });
        }
        
        return results;
        
    } catch (error) {
        console.error('DuckDuckGo 搜索失败:', error);
        throw error;
    }
}

// ===== 语音识别 =====
function initializeVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('⚠️ 浏览器不支持语音识别');
        document.getElementById('voiceBtn').style.display = 'none';
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('userInput').value = transcript;
        autoResizeTextarea();
    };
    
    recognition.onerror = (event) => {
        console.error('语音识别错误:', event.error);
        isListening = false;
        updateVoiceButton();
    };
    
    recognition.onend = () => {
        isListening = false;
        updateVoiceButton();
    };
}

function toggleVoiceInput() {
    if (!recognition) return;
    
    if (isListening) {
        recognition.stop();
        isListening = false;
    } else {
        recognition.start();
        isListening = true;
    }
    
    updateVoiceButton();
}

function updateVoiceButton() {
    const btn = document.getElementById('voiceBtn');
    if (isListening) {
        btn.classList.add('listening');
    } else {
        btn.classList.remove('listening');
    }
}

// ===== 主题切换 =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('bruceai_theme', newTheme);
    updateThemeIcon(newTheme);
}

function loadTheme() {
    const saved = localStorage.getItem('bruceai_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    if (theme === 'dark') {
        icon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    } else {
        icon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    }
}

// ===== 侧边栏切换 =====
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

// ===== UI交互 =====
function initializeUI() {
    // 自动调整文本框高度
    const textarea = document.getElementById('userInput');
    textarea.addEventListener('input', autoResizeTextarea);
    
    // 禁用语音按钮右键菜单
    document.getElementById('voiceBtn').addEventListener('contextmenu', e => e.preventDefault());
}

function autoResizeTextarea() {
    const textarea = document.getElementById('userInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
}

// ===== 工具函数 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 配置面板（保留但隐藏） =====
function toggleConfig() {
    // 配置面板已禁用，使用config.local.js代替
    console.log('请编辑 src/config/config.local.js 文件来配置');
}

function saveConfig() {
    // 不使用
}

console.log('🥋 李小龙 AI 助手已加载 - Be Water, My Friend!');

