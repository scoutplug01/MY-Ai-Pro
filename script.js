// ======================================
// GROQ AI CHAT - ADVANCED VERSION
// ======================================

// Configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// State Management
let chatHistory = [];
let conversationHistory = [];
let apiKey = '';
let currentSettings = {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    maxTokens: 1024,
    darkMode: true,
    soundEffects: true
};

// DOM Elements
const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    closeSidebar: document.getElementById('closeSidebar'),
    menuToggle: document.getElementById('menuToggle'),
    
    // API Setup
    apiKeyInput: document.getElementById('apiKeyInput'),
    toggleApiKey: document.getElementById('toggleApiKey'),
    saveApiBtn: document.getElementById('saveApiBtn'),
    apiStatus: document.getElementById('apiStatus'),
    
    // Settings
    modelSelect: document.getElementById('modelSelect'),
    temperature: document.getElementById('temperature'),
    tempValue: document.getElementById('tempValue'),
    maxTokens: document.getElementById('maxTokens'),
    tokensValue: document.getElementById('tokensValue'),
    darkMode: document.getElementById('darkMode'),
    soundEffects: document.getElementById('soundEffects'),
    
    // Chat
    chatMessages: document.getElementById('chatMessages'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    charCount: document.getElementById('charCount'),
    typingIndicator: document.getElementById('typingIndicator'),
    
    // History
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    
    // Other
    loadingOverlay: document.getElementById('loadingOverlay'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    statusBadge: document.getElementById('statusBadge'),
    exportBtn: document.getElementById('exportBtn')
};

// ======================================
// INITIALIZATION
// ======================================

document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    setupEventListeners();
    setupSuggestions();
    updateUIState();
});

function loadSavedData() {
    // Load API key
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
        apiKey = savedApiKey;
        elements.apiKeyInput.value = savedApiKey;
        updateApiStatus(true);
    }
    
    // Load settings
    const savedSettings = localStorage.getItem('groq_settings');
    if (savedSettings) {
        currentSettings = { ...currentSettings, ...JSON.parse(savedSettings) };
        applySettings();
    }
    
    // Load chat history
    const savedHistory = localStorage.getItem('groq_chat_history');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        renderChatHistory();
    }
}

function applySettings() {
    elements.modelSelect.value = currentSettings.model;
    elements.temperature.value = currentSettings.temperature;
    elements.tempValue.textContent = currentSettings.temperature;
    elements.maxTokens.value = currentSettings.maxTokens;
    elements.tokensValue.textContent = currentSettings.maxTokens;
    elements.darkMode.checked = currentSettings.darkMode;
    elements.soundEffects.checked = currentSettings.soundEffects;
    
    // Apply dark mode
    if (currentSettings.darkMode) {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
}

// ======================================
// EVENT LISTENERS
// ======================================

function setupEventListeners() {
    // Sidebar Toggle
    elements.menuToggle.addEventListener('click', toggleSidebar);
    elements.closeSidebar.addEventListener('click', toggleSidebar);
    
    // API Setup
    elements.toggleApiKey.addEventListener('click', toggleApiKeyVisibility);
    elements.saveApiBtn.addEventListener('click', saveApiKey);
    
    // Settings
    elements.modelSelect.addEventListener('change', updateSettings);
    elements.temperature.addEventListener('input', (e) => {
        elements.tempValue.textContent = e.target.value;
        updateSettings();
    });
    elements.maxTokens.addEventListener('input', (e) => {
        elements.tokensValue.textContent = e.target.value;
        updateSettings();
    });
    elements.darkMode.addEventListener('change', toggleDarkMode);
    elements.soundEffects.addEventListener('change', updateSettings);
    
    // Chat Input
    elements.messageInput.addEventListener('input', updateCharCount);
    elements.messageInput.addEventListener('keydown', handleKeyPress);
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // History
    elements.clearHistoryBtn.addEventListener('click', clearChatHistory);
    elements.newChatBtn.addEventListener('click', startNewChat);
    
    // Export
    elements.exportBtn.addEventListener('click', exportChat);
    
    // Auto-resize textarea
    elements.messageInput.addEventListener('input', autoResizeTextarea);
}

function setupSuggestions() {
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const prompt = btn.getAttribute('data-prompt');
            elements.messageInput.value = prompt;
            sendMessage();
        });
    });
}

// ======================================
// SIDEBAR FUNCTIONS
// ======================================

function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
}

// ======================================
// API SETUP FUNCTIONS
// ======================================

function toggleApiKeyVisibility() {
    const type = elements.apiKeyInput.type;
    if (type === 'password') {
        elements.apiKeyInput.type = 'text';
        elements.toggleApiKey.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
        elements.apiKeyInput.type = 'password';
        elements.toggleApiKey.innerHTML = '<i class="fas fa-eye"></i>';
    }
}

function saveApiKey() {
    const key = elements.apiKeyInput.value.trim();
    
    if (!key) {
        showToast('Please enter an API key', 'error');
        return;
    }
    
    apiKey = key;
    localStorage.setItem('groq_api_key', key);
    updateApiStatus(true);
    showToast('API Key saved successfully!', 'success');
    playSound('success');
}

function updateApiStatus(connected) {
    if (connected) {
        elements.apiStatus.classList.add('connected');
        elements.apiStatus.innerHTML = '<i class="fas fa-circle"></i><span>Connected</span>';
        elements.statusBadge.innerHTML = '<i class="fas fa-circle"></i> Ready';
    } else {
        elements.apiStatus.classList.remove('connected');
        elements.apiStatus.innerHTML = '<i class="fas fa-circle"></i><span>Not Connected</span>';
        elements.statusBadge.innerHTML = '<i class="fas fa-circle"></i> Disconnected';
    }
}

// ======================================
// SETTINGS FUNCTIONS
// ======================================

function updateSettings() {
    currentSettings = {
        model: elements.modelSelect.value,
        temperature: parseFloat(elements.temperature.value),
        maxTokens: parseInt(elements.maxTokens.value),
        darkMode: elements.darkMode.checked,
        soundEffects: elements.soundEffects.checked
    };
    
    localStorage.setItem('groq_settings', JSON.stringify(currentSettings));
}

function toggleDarkMode() {
    currentSettings.darkMode = elements.darkMode.checked;
    
    if (currentSettings.darkMode) {
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
    }
    
    updateSettings();
}

// ======================================
// CHAT FUNCTIONS
// ======================================

async function sendMessage() {
    const message = elements.messageInput.value.trim();
    
    if (!message) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    if (!apiKey) {
        showToast('Please enter your API key first', 'error');
        return;
    }
    
    // Hide welcome screen
    if (elements.welcomeScreen) {
        elements.welcomeScreen.style.display = 'none';
    }
    
    // Add user message to UI
    addMessageToUI('user', message);
    
    // Add to conversation history
    conversationHistory.push({
        role: 'user',
        content: message
    });
    
    // Clear input
    elements.messageInput.value = '';
    updateCharCount();
    
    // Show typing indicator
    showTypingIndicator();
    
    // Disable send button
    elements.sendBtn.disabled = true;
    
    try {
        // Call Groq API
        const response = await callGroqAPI(message);
        
        // Hide typing indicator
        hideTypingIndicator();
        
        // Add AI response to UI
        addMessageToUI('ai', response);
        
        // Add to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: response
        });
        
        // Save to chat history
        saveToChatHistory(message);
        
        // Play success sound
        playSound('message');
        
    } catch (error) {
        hideTypingIndicator();
        showToast('Error: ' + error.message, 'error');
        playSound('error');
    } finally {
        // Re-enable send button
        elements.sendBtn.disabled = false;
    }
}

async function callGroqAPI(userMessage) {
    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: currentSettings.model,
            messages: conversationHistory,
            temperature: currentSettings.temperature,
            max_tokens: currentSettings.maxTokens,
            stream: false
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

function addMessageToUI(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = type === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    const header = document.createElement('div');
    header.className = 'message-header';
    header.innerHTML = `
        <span class="message-name">${type === 'user' ? 'You' : 'GroqAI'}</span>
        <span class="message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    `;
    
    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.textContent = content;
    
    // Format code blocks if present
    bubble.innerHTML = formatMessage(content);
    
    contentDiv.appendChild(header);
    contentDiv.appendChild(bubble);
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);
    
    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function formatMessage(text) {
    // Simple markdown-like formatting
    let formatted = text;
    
    // Code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

function showTypingIndicator() {
    elements.typingIndicator.classList.add('active');
}

function hideTypingIndicator() {
    elements.typingIndicator.classList.remove('active');
}

function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// ======================================
// CHAT HISTORY FUNCTIONS
// ======================================

function saveToChatHistory(userMessage) {
    const chatItem = {
        id: Date.now(),
        title: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : ''),
        timestamp: new Date().toISOString(),
        messages: [...conversationHistory]
    };
    
    chatHistory.unshift(chatItem);
    
    // Keep only last 20 chats
    if (chatHistory.length > 20) {
        chatHistory = chatHistory.slice(0, 20);
    }
    
    localStorage.setItem('groq_chat_history', JSON.stringify(chatHistory));
    renderChatHistory();
}

function renderChatHistory() {
    elements.historyList.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div class="history-item-title">${chat.title}</div>
            <div class="history-item-time">${formatTimestamp(chat.timestamp)}</div>
        `;
        
        item.addEventListener('click', () => loadChat(chat));
        elements.historyList.appendChild(item);
    });
}

function loadChat(chat) {
    conversationHistory = [...chat.messages];
    
    // Clear current messages
    elements.chatMessages.innerHTML = '';
    elements.welcomeScreen.style.display = 'none';
    
    // Render all messages
    conversationHistory.forEach((msg, index) => {
        if (index > 0) { // Skip system message if any
            addMessageToUI(msg.role === 'user' ? 'user' : 'ai', msg.content);
        }
    });
    
    showToast('Chat loaded', 'success');
}

function clearChatHistory() {
    if (confirm('Are you sure you want to clear all chat history?')) {
        chatHistory = [];
        localStorage.removeItem('groq_chat_history');
        renderChatHistory();
        showToast('Chat history cleared', 'success');
    }
}

function startNewChat() {
    conversationHistory = [];
    elements.chatMessages.innerHTML = '';
    
    // Show welcome screen
    const welcomeHTML = document.querySelector('.welcome-screen').cloneNode(true);
    elements.chatMessages.appendChild(welcomeHTML);
    setupSuggestions();
    
    showToast('New chat started', 'success');
}

// ======================================
// UTILITY FUNCTIONS
// ======================================

function updateCharCount() {
    const length = elements.messageInput.value.length;
    elements.charCount.textContent = `${length} / 4000`;
    
    if (length > 4000) {
        elements.charCount.style.color = 'var(--danger-color)';
    } else {
        elements.charCount.style.color = 'var(--text-muted)';
    }
}

function autoResizeTextarea() {
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
}

function handleKeyPress(e) {
    // Send on Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
    
    // Allow Shift+Enter for new line
    if (e.shiftKey && e.key === 'Enter') {
        return;
    }
    
    // Send on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}

function showToast(message, type = 'success') {
    elements.toastMessage.textContent = message;
    
    if (type === 'error') {
        elements.toast.style.background = 'var(--danger-color)';
    } else {
        elements.toast.style.background = 'var(--success-color)';
    }
    
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

function playSound(type) {
    if (!currentSettings.soundEffects) return;
    
    // You can add actual sound files here
    // For now, we'll use a simple beep
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = type === 'error' ? 200 : 600;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
}

function exportChat() {
    if (conversationHistory.length === 0) {
        showToast('No chat to export', 'error');
        return;
    }
    
    const chatText = conversationHistory.map(msg => {
        return `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.content}\n\n`;
    }).join('');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `groqai-chat-${Date.now()}.txt`;
    a.click();
    
    showToast('Chat exported successfully', 'success');
}

function updateUIState() {
    // Update all UI elements based on current state
    if (apiKey) {
        updateApiStatus(true);
    }
}

// ======================================
// RESPONSIVE HANDLING
// ======================================

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        if (!elements.sidebar.contains(e.target) && !elements.menuToggle.contains(e.target)) {
            elements.sidebar.classList.remove('active');
        }
    }
});