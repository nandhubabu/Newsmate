class NewsApp {
    constructor() {
        this.newsGrid = document.getElementById('news-grid');
        this.countrySelect = document.getElementById('country-select');
        this.currentCountry = 'us';
        
        // Chatbot elements
        this.floatingChatBtn = document.getElementById('floating-chat-btn');
        this.chatModal = document.getElementById('chatbot-modal');
        this.closeChat = document.getElementById('close-chat');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendChat = document.getElementById('send-chat');
        this.chatSuggestions = document.getElementById('chat-suggestions');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadNews(this.currentCountry);
        this.checkAPIHealth();
        this.loadChatSuggestions();
    }

    bindEvents() {
        // Existing events
        this.countrySelect.addEventListener('change', (e) => {
            this.currentCountry = e.target.value;
            console.log(`Switching to country: ${this.currentCountry}`);
            this.loadNews(this.currentCountry);
        });

        // Chatbot events (updated for floating button)
        this.floatingChatBtn.addEventListener('click', () => this.openChat());
        this.closeChat.addEventListener('click', () => this.closeChatModal());
        this.chatModal.addEventListener('click', (e) => {
            if (e.target === this.chatModal) this.closeChatModal();
        });
        
        this.sendChat.addEventListener('click', () => this.sendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.chatInput.addEventListener('input', () => {
            this.sendChat.disabled = this.chatInput.value.trim() === '';
        });
    }

    // Chatbot Methods (updated)
    openChat() {
        this.chatModal.classList.add('active');
        this.chatInput.focus();
        
        // Hide floating button when chat is open
        this.floatingChatBtn.style.display = 'none';
    }

    closeChatModal() {
        this.chatModal.classList.remove('active');
        
        // Show floating button when chat is closed
        this.floatingChatBtn.style.display = 'flex';
    }

    async loadChatSuggestions() {
        try {
            const response = await fetch('/api/chat/suggestions');
            const data = await response.json();
            this.renderSuggestions(data.suggestions);
        } catch (error) {
            console.error('Failed to load chat suggestions:', error);
        }
    }

    renderSuggestions(suggestions) {
        const suggestionsHTML = `
            <div class="suggestions-label">Quick questions:</div>
            <div class="suggestion-chips">
                ${suggestions.map(suggestion => 
                    `<button class="suggestion-chip" onclick="newsApp.useSuggestion('${suggestion}')">${suggestion}</button>`
                ).join('')}
            </div>
        `;
        this.chatSuggestions.innerHTML = suggestionsHTML;
    }

    useSuggestion(suggestion) {
        this.chatInput.value = suggestion;
        this.sendMessage();
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.sendChat.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.hideTypingIndicator();

            if (response.ok) {
                this.addMessage(data.response, 'bot', { powered_by: data.powered_by });
                if (data.suggestions) {
                    this.renderSuggestions(data.suggestions);
                }
            } else {
                this.addMessage(data.response || 'Sorry, I encountered an error. Please try again.', 'bot');
            }

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('Sorry, I\'m having trouble connecting. Please check your internet connection and try again.', 'bot');
            console.error('Chat error:', error);
        }
    }

    // Update the addMessage method to show AI status
    addMessage(content, sender, metadata = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = 'message-bubble';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        
        let timeText = this.formatTime(new Date());
        if (sender === 'bot' && metadata.powered_by) {
            timeText += ` • ${metadata.powered_by}`;
        }
        
        messageTime.textContent = timeText;
        
        messageBubble.appendChild(messageContent);
        messageBubble.appendChild(messageTime);
        messageDiv.appendChild(messageBubble);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-content">
                    <span>NewsBot is typing</span>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Existing methods (checkAPIHealth, loadNews, etc.) remain the same...
    async checkAPIHealth() {
        try {
            const response = await fetch('/api/health');
            const health = await response.json();
            console.log('API Health Status:', health);
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }

    async loadNews(country) {
        try {
            this.showLoadingState();
            
            console.log(`Fetching news for: ${country}`);
            const response = await fetch(`/api/news?country=${country}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                
                // Handle 503 errors (service unavailable) differently
                if (response.status === 503) {
                    this.showServiceUnavailableError(errorData);
                    return;
                }
                
                throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            if (data.status === 'ok' && data.articles && data.articles.length > 0) {
                this.renderNews(data.articles, data.message);
            } else {
                this.showErrorState(`No articles found for ${this.getCountryName(country)}. All news sources are currently unavailable.`);
            }
            
        } catch (error) {
            console.error('Error fetching news:', error);
            this.showErrorState(`Failed to load news for ${this.getCountryName(country)}. ${error.message}`);
        }
    }

    showServiceUnavailableError(errorData) {
        const suggestions = errorData.suggestions || [];
        const suggestionsHTML = suggestions.map(suggestion => 
            `<li style="text-align: left; margin-bottom: 0.5rem;">${suggestion}</li>`
        ).join('');

        this.newsGrid.innerHTML = `
            <div class="error-state">
                <div class="error-message">
                    <h3>News Temporarily Unavailable</h3>
                    <p>${errorData.message}</p>
                    
                    ${suggestions.length > 0 ? `
                        <div style="margin: 1.5rem 0;">
                            <h4 style="margin-bottom: 1rem; color: #fed7d7;">Suggestions:</h4>
                            <ul style="color: white; padding-left: 1rem;">
                                ${suggestionsHTML}
                            </ul>
                        </div>
                    ` : ''}
                    
                    <div style="margin-top: 1.5rem;">
                        <button onclick="newsApp.loadNews('us')" class="retry-button">Try US News</button>
                        <button onclick="newsApp.loadNews(newsApp.currentCountry)" class="retry-button">Retry ${errorData.countryName}</button>
                        <button onclick="location.reload()" class="retry-button">Refresh Page</button>
                    </div>
                </div>
            </div>
        `;
    }

    getCountryName(code) {
        const countries = {
            'us': 'United States', 'in': 'India', 'gb': 'United Kingdom', 'ca': 'Canada',
            'au': 'Australia', 'de': 'Germany', 'fr': 'France', 'jp': 'Japan',
            'cn': 'China', 'br': 'Brazil', 'ru': 'Russia', 'za': 'South Africa',
            'mx': 'Mexico', 'it': 'Italy', 'es': 'Spain', 'nl': 'Netherlands', 'se': 'Sweden'
        };
        return countries[code] || code.toUpperCase();
    }

    showLoadingState() {
        this.newsGrid.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>Fetching the latest headlines for ${this.getCountryName(this.currentCountry)}...</p>
                <p style="font-size: 0.9rem; opacity: 0.8; margin-top: 0.5rem;">Trying multiple news sources...</p>
            </div>
        `;
    }

    showErrorState(message) {
        this.newsGrid.innerHTML = `
            <div class="error-state">
                <div class="error-message">
                    <h3>Oops! Something went wrong</h3>
                    <p>${message}</p>
                    <div style="margin-top: 1rem;">
                        <button onclick="newsApp.loadNews('us')" class="retry-button">Try US News</button>
                        <button onclick="newsApp.loadNews(newsApp.currentCountry)" class="retry-button">Retry</button>
                        <button onclick="newsApp.checkAPIHealth()" class="retry-button">Check API Status</button>
                    </div>
                </div>
            </div>
        `;
    }

    renderNews(articles, message) {
        const validArticles = articles.filter(article => 
            article.title && 
            article.title !== '[Removed]' && 
            article.description && 
            article.description !== '[Removed]'
        );

        if (validArticles.length === 0) {
            this.showErrorState('No valid articles found for this country.');
            return;
        }

        let messageHTML = '';
        if (message) {
            messageHTML = `
                <div class="info-message">
                    <p>${message}</p>
                </div>
            `;
        }

        const newsHTML = validArticles.map((article, index) => {
            const publishedDate = this.formatDate(article.publishedAt);
            const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200/667eea/ffffff?text=No+Image';
            const source = article.source?.name || 'Unknown Source';
            const description = this.truncateText(article.description, 150);
            const title = this.truncateText(article.title, 100);

            return `
                <article class="news-article" style="animation-delay: ${index * 0.1}s">
                    <img src="${imageUrl}" alt="${title}" class="article-image" 
                         onerror="this.src='https://via.placeholder.com/400x200/667eea/ffffff?text=No+Image'">
                    <div class="article-content">
                        <h2 class="article-title">${title}</h2>
                        <p class="article-description">${description}</p>
                        <div class="article-meta">
                            <span class="article-source">${source}</span>
                            <span class="article-date">${publishedDate}</span>
                        </div>
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer" class="article-link">
                            Read Full Article
                        </a>
                    </div>
                </article>
            `;
        }).join('');

        this.newsGrid.innerHTML = messageHTML + newsHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

        if (diffHours > 24) {
            const diffDays = Math.floor(diffHours / 24);
            return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
            return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return diffMinutes > 0 ? `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago` : 'Just now';
        }
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
}

// Make newsApp globally accessible for debugging
let newsApp;

document.addEventListener('DOMContentLoaded', () => {
    newsApp = new NewsApp();
    window.newsApp = newsApp; // For debugging
});