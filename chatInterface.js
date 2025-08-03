// chatInterface.js - Bella's chat interface component
// This module is responsible for creating and managing elegant chat interface, reflecting Bella's warm personality

class ChatInterface {
    constructor() {
        this.isVisible = false;
        this.messages = [];
        this.maxMessages = 50; // Display up to 50 messages
        this.chatContainer = null;
        this.messageContainer = null;
        this.inputContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.toggleButton = null;
        this.settingsPanel = null;
        this.isSettingsVisible = false;
        
        this.init();
    }

    // Initialize chat interface
    init() {
        this.createChatContainer();
        this.createToggleButton();
        this.createSettingsPanel();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    // Create chat container
    createChatContainer() {
        // Main chat container
        this.chatContainer = document.createElement('div');
        this.chatContainer.className = 'bella-chat-container';
        this.chatContainer.innerHTML = `
            <div class="bella-chat-header">
                <div class="bella-chat-title">
                    <div class="bella-avatar">💝</div>
                    <div class="bella-title-text">
                        <h3>Bella</h3>
                        <span class="bella-status">Online</span>
                    </div>
                </div>
                <div class="bella-chat-controls">
                    <button class="bella-settings-btn" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                    <button class="bella-minimize-btn" title="Minimize">
                        <i class="fas fa-minus"></i>
                    </button>
                </div>
            </div>
            <div class="bella-chat-messages"></div>
            <div class="bella-chat-input-container">
                <div class="bella-input-wrapper">
                    <input type="text" class="bella-message-input" placeholder="Chat with Bella..." maxlength="500">
                    <button class="bella-send-btn" title="Send">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="bella-input-hint">
                    Press Enter to send, Shift + Enter for new line
                </div>
            </div>
        `;

        // Get key element references
        this.messageContainer = this.chatContainer.querySelector('.bella-chat-messages');
        this.inputContainer = this.chatContainer.querySelector('.bella-chat-input-container');
        this.messageInput = this.chatContainer.querySelector('.bella-message-input');
        this.sendButton = this.chatContainer.querySelector('.bella-send-btn');
        
        document.body.appendChild(this.chatContainer);
    }

    // Create toggle button
    createToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'bella-chat-toggle';
        this.toggleButton.innerHTML = `
            <div class="bella-toggle-icon">
                <i class="fas fa-comments"></i>
            </div>
            <div class="bella-toggle-text">Chat with Bella</div>
        `;
        this.toggleButton.title = 'Open chat window';
        
        document.body.appendChild(this.toggleButton);
    }

    // Create settings panel
    createSettingsPanel() {
        this.settingsPanel = document.createElement('div');
        this.settingsPanel.className = 'bella-settings-panel';
        this.settingsPanel.innerHTML = `
            <div class="bella-settings-header">
                <h4>Chat Settings</h4>
                <button class="bella-settings-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="bella-settings-content">
                <div class="bella-setting-group">
                    <label>AI Service Provider</label>
                    <select class="bella-provider-select">
                        <option value="contextual">Smart Responses (Recommended)</option>
                        <option value="local">Local Model (Experimental)</option>
                        <option value="openai">OpenAI GPT</option>
                        <option value="qwen">Qwen</option>
                        <option value="ernie">ERNIE Bot</option>
                        <option value="glm">GLM AI</option>
                    </select>
                </div>
                <div class="bella-setting-group bella-api-key-group" style="display: none;">
                    <label>API Key</label>
                    <input type="password" class="bella-api-key-input" placeholder="Enter API Key">
                    <button class="bella-api-key-save">Save</button>
                </div>
                <div class="bella-setting-group">
                    <label>Chat Mode</label>
                    <select class="bella-mode-select">
                        <option value="casual">Casual Chat</option>
                        <option value="assistant">Smart Assistant</option>
                        <option value="creative">Creative Partner</option>
                    </select>
                </div>
                <div class="bella-setting-group">
                    <button class="bella-clear-history">Clear Chat History</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.settingsPanel);
    }

    // Bind events
    bindEvents() {
        // Toggle chat window
        this.toggleButton.addEventListener('click', () => {
            this.toggle();
        });

        // Minimize button
        this.chatContainer.querySelector('.bella-minimize-btn').addEventListener('click', () => {
            this.hide();
        });

        // Settings button
        this.chatContainer.querySelector('.bella-settings-btn').addEventListener('click', () => {
            this.toggleSettings();
        });

        // Send message
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });

        // Input field events
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto adjust input height
        this.messageInput.addEventListener('input', () => {
            this.adjustInputHeight();
        });

        // Settings panel events
        this.bindSettingsEvents();
    }

    // Bind settings panel events
    bindSettingsEvents() {
        // Close settings panel
        this.settingsPanel.querySelector('.bella-settings-close').addEventListener('click', () => {
            this.hideSettings();
        });

        // Provider selection
        const providerSelect = this.settingsPanel.querySelector('.bella-provider-select');
        const apiKeyGroup = this.settingsPanel.querySelector('.bella-api-key-group');
        
        providerSelect.addEventListener('change', (e) => {
            const provider = e.target.value;
            if (provider === 'contextual') {
                // Use smart contextual responses (default)
                apiKeyGroup.style.display = 'none';
            } else if (provider === 'local') {
                apiKeyGroup.style.display = 'none';
            } else {
                apiKeyGroup.style.display = 'block';
            }
            
            // Trigger provider change event
            this.onProviderChange?.(provider);
        });

        // API key save
        this.settingsPanel.querySelector('.bella-api-key-save').addEventListener('click', () => {
            const provider = providerSelect.value;
            const apiKey = this.settingsPanel.querySelector('.bella-api-key-input').value;
            
            if (apiKey.trim()) {
                this.onAPIKeySave?.(provider, apiKey.trim());
                this.showNotification('API key saved', 'success');
            }
        });

        // Clear chat history
        this.settingsPanel.querySelector('.bella-clear-history').addEventListener('click', () => {
            this.clearMessages();
            this.onClearHistory?.();
            this.hideSettings();
        });
    }

    // Add welcome message
    addWelcomeMessage() {
        this.addMessage('assistant', 'Hello! I\'m Bella, your AI companion. Nice to meet you! What would you like to chat about?', true);
    }

    // Toggle chat window display/hide
    toggle() {
        console.log('ChatInterface.toggle() called');
        console.log('Before toggle isVisible:', this.isVisible);
        
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
        
        console.log('After toggle isVisible:', this.isVisible);
    }

    // Show chat window
    show() {
        console.log('ChatInterface.show() called');
        console.log('Before show isVisible:', this.isVisible);
        console.log('Before show chatContainer.className:', this.chatContainer.className);
        
        this.isVisible = true;
        this.chatContainer.classList.add('visible');
        
        console.log('After show isVisible:', this.isVisible);
        console.log('After show chatContainer.className:', this.chatContainer.className);
        console.log('chatContainer computed style opacity:', window.getComputedStyle(this.chatContainer).opacity);
        console.log('chatContainer computed style transform:', window.getComputedStyle(this.chatContainer).transform);
        
        this.toggleButton.classList.add('active');
        this.messageInput.focus();
        this.scrollToBottom();
    }

    // Hide chat window
    hide() {
        this.isVisible = false;
        this.chatContainer.classList.remove('visible');
        this.toggleButton.classList.remove('active');
        this.hideSettings();
    }

    // Toggle settings panel
    toggleSettings() {
        if (this.isSettingsVisible) {
            this.hideSettings();
        } else {
            this.showSettings();
        }
    }

    // Show settings panel
    showSettings() {
        this.isSettingsVisible = true;
        this.settingsPanel.classList.add('visible');
    }

    // Hide settings panel
    hideSettings() {
        this.isSettingsVisible = false;
        this.settingsPanel.classList.remove('visible');
    }

    // Send message
    sendMessage() {
        const text = this.messageInput.value.trim();
        if (!text) return;

        // Add user message
        this.addMessage('user', text);
        
        // Clear input field
        this.messageInput.value = '';
        this.adjustInputHeight();
        
        // Trigger message send event
        this.onMessageSend?.(text);
    }

    // Add message to chat interface
    addMessage(role, content, isWelcome = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `bella-message bella-message-${role}`;
        
        if (isWelcome) {
            messageElement.classList.add('bella-welcome-message');
        }

        const timestamp = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="bella-message-avatar">
                ${role === 'user' ? '👤' : '💝'}
            </div>
            <div class="bella-message-content">
                <div class="bella-message-text">${this.formatMessage(content)}</div>
                <div class="bella-message-time">${timestamp}</div>
            </div>
        `;

        this.messageContainer.appendChild(messageElement);
        this.messages.push({ role, content, timestamp: Date.now() });

        // Limit message count
        if (this.messages.length > this.maxMessages) {
            const oldMessage = this.messageContainer.firstChild;
            if (oldMessage) {
                this.messageContainer.removeChild(oldMessage);
            }
            this.messages.shift();
        }

        // Scroll to bottom
        this.scrollToBottom();

        // Add animation effect
        setTimeout(() => {
            messageElement.classList.add('bella-message-appear');
        }, 10);
    }

    // Format message content
    formatMessage(content) {
        // Simple text formatting, support line breaks
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    // Show typing indicator
    showTypingIndicator() {
        const existingIndicator = this.messageContainer.querySelector('.bella-typing-indicator');
        if (existingIndicator) return;

        const typingElement = document.createElement('div');
        typingElement.className = 'bella-typing-indicator';
        typingElement.innerHTML = `
            <div class="bella-message-avatar">💝</div>
            <div class="bella-message-content">
                <div class="bella-typing-dots">
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                    <span class="bella-typing-dot"></span>
                </div>
            </div>
        `;

        this.messageContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        // Add show animation
        setTimeout(() => {
            typingElement.classList.add('bella-typing-show');
        }, 10);
    }

    // Hide typing indicator
    hideTypingIndicator() {
        const indicator = this.messageContainer.querySelector('.bella-typing-indicator');
        if (indicator) {
            this.messageContainer.removeChild(indicator);
        }
    }

    // Clear all messages
    clearMessages() {
        this.messageContainer.innerHTML = '';
        this.messages = [];
        this.addWelcomeMessage();
    }

    // Scroll to bottom
    scrollToBottom() {
        setTimeout(() => {
            this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
        }, 10);
    }

    // Adjust input height
    adjustInputHeight() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `bella-notification bella-notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('bella-notification-show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('bella-notification-show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Check if chat window is visible
    getVisibility() {
        return this.isVisible;
    }

    // Set callback functions
    onMessageSend = null;
    onProviderChange = null;
    onAPIKeySave = null;
    onClearHistory = null;
}

// ES6 module export
export { ChatInterface };