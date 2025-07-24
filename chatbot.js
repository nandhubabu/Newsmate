const axios = require('axios');

class NewsChatbot {
    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY;
        this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
        
        this.appInfo = {
            name: "NewsMate",
            version: "1.0.0",
            description: "A comprehensive news application that fetches latest headlines from multiple countries and sources",
            features: [
                "Multi-country news support (17 countries)",
                "Multiple API sources (NewsAPI, Guardian, NewsData.io)",
                "Real-time news updates",
                "Responsive design",
                "Error handling with fallbacks",
                "Country-specific news filtering"
            ],
            supportedCountries: [
                "United States", "India", "United Kingdom", "Canada", "Australia", 
                "Germany", "France", "Japan", "China", "Brazil", "Russia", 
                "South Africa", "Mexico", "Italy", "Spain", "Netherlands", "Sweden"
            ],
            apis: [
                { name: "NewsAPI", purpose: "Primary news source for most countries" },
                { name: "Guardian API", purpose: "UK, US, Australia specific news" },
                { name: "NewsData.io", purpose: "Global news coverage" }
            ]
        };

        this.systemPrompt = `You are NewsBot, an AI assistant for the NewsMate news application. You MUST follow these strict rules:

1. ONLY respond to queries related to:
   - NewsMate app features and functionality
   - News and journalism topics
   - Current events and world affairs
   - Media literacy and news consumption
   - How to use the NewsMate app
   - Troubleshooting the app
   - News sources and credibility

2. REFUSE to answer questions about:
   - Personal advice (relationships, health, finance, etc.)
   - Non-news topics (cooking, sports scores, entertainment gossip, etc.)
   - Political opinions or bias
   - Programming help (unless about the NewsMate app specifically)
   - General knowledge not related to news

3. NewsMate App Info:
   - Name: NewsMate
   - Purpose: Global news aggregation from multiple sources
   - Supported Countries: ${this.appInfo.supportedCountries.join(', ')}
   - Features: ${this.appInfo.features.join(', ')}
   - News Sources: NewsAPI, Guardian API, NewsData.io

4. Response Style:
   - Be helpful and professional
   - Keep responses concise (under 200 words)
   - If asked about non-news topics, politely redirect to news-related topics
   - Always stay focused on news and the NewsMate app

5. If someone asks about something outside your scope, respond with:
   "I'm specialized in helping with NewsMate and news-related questions. I can help you with app features, news sources, current events, or media literacy topics. What would you like to know about news or NewsMate?"`;
    }

    async getGeminiResponse(userMessage) {
        if (!this.geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        try {
            const response = await axios.post(
                `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: `${this.systemPrompt}\n\nUser Question: ${userMessage}\n\nResponse:`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 300,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000
                }
            );

            if (response.data && response.data.candidates && response.data.candidates[0]) {
                const generatedText = response.data.candidates[0].content.parts[0].text;
                return generatedText.trim();
            } else {
                throw new Error('Invalid response from Gemini API');
            }

        } catch (error) {
            console.error('Gemini API Error:', error.response?.data || error.message);
            throw error;
        }
    }

    isNewsRelated(query) {
        const newsKeywords = [
            'news', 'newsmate', 'app', 'country', 'article', 'headline', 'source', 'media',
            'journalism', 'current events', 'breaking news', 'world news', 'politics',
            'economy', 'international', 'local news', 'press', 'reporter', 'newspaper',
            'broadcast', 'credible', 'reliable', 'bias', 'fact', 'truth', 'information',
            'update', 'latest', 'happening', 'event', 'story', 'coverage', 'report',
            'guardian', 'newsapi', 'newsdata', 'feature', 'error', 'problem', 'help',
            'how to', 'what is', 'how does', 'support', 'troubleshoot'
        ];

        const lowerQuery = query.toLowerCase();
        return newsKeywords.some(keyword => lowerQuery.includes(keyword));
    }

    getFallbackResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Check for greetings
        if (this.containsKeywords(lowerQuery, ['hello', 'hi', 'hey', 'greetings'])) {
            return "Hello! I'm NewsBot, your NewsMate assistant. I can help you with information about this news app, current events, and media-related questions. What would you like to know?";
        }
        
        // Check for app-specific queries
        if (this.containsKeywords(lowerQuery, ['newsmate', 'app', 'features'])) {
            return `NewsMate is a comprehensive news application that brings you headlines from ${this.appInfo.supportedCountries.length} countries worldwide. Key features include: ${this.appInfo.features.slice(0, 3).join(', ')}, and more. What specific feature would you like to know about?`;
        }
        
        // Check for country queries
        if (this.containsKeywords(lowerQuery, ['countries', 'support', 'available'])) {
            return `NewsMate supports news from ${this.appInfo.supportedCountries.length} countries: ${this.appInfo.supportedCountries.slice(0, 8).join(', ')}, and more. You can select any country from the dropdown to see relevant news. Which country's news are you interested in?`;
        }
        
        // Check for troubleshooting
        if (this.containsKeywords(lowerQuery, ['error', 'not working', 'problem', 'fix'])) {
            return "If you're experiencing issues with NewsMate: 1) Try selecting a different country, 2) Check your internet connection, 3) Refresh the page, 4) Try the US for most reliable coverage. What specific issue are you facing?";
        }
        
        // Add this new check for country coverage questions
        if (this.containsKeywords(lowerQuery, ['coverage', 'why no news', 'not working', 'no articles'])) {
            return "NewsMate uses multiple news sources with different country coverage: NewsAPI works best for US, UK, Canada, Australia, Germany, France, and India. For other countries, we use Guardian's global search and NewsData.io. Some countries may have limited English-language news sources. Try different countries or refresh the page if you're not seeing articles.";
        }
        
        // Add specific country support info
        if (this.containsKeywords(lowerQuery, ['which countries work', 'best coverage', 'reliable countries'])) {
            return "Countries with the best news coverage: 🇺🇸 United States, 🇬🇧 United Kingdom, 🇨🇦 Canada, 🇦🇺 Australia, 🇩🇪 Germany, 🇫🇷 France, and 🇮🇳 India have multiple news sources. Other countries use our global search system. If a country isn't working, try US news for the most reliable coverage.";
        }
        
        // Default fallback for non-news topics
        return "I'm specialized in helping with NewsMate and news-related questions. I can help you with app features, news sources, current events, or media literacy topics. What would you like to know about news or NewsMate?";
    }

    containsKeywords(text, keywords) {
        return keywords.some(keyword => text.includes(keyword));
    }

    async getResponse(query) {
        try {
            // Check if Gemini API is available
            if (this.geminiApiKey) {
                // Use Gemini for more intelligent responses
                const geminiResponse = await this.getGeminiResponse(query);
                return geminiResponse;
            } else {
                // Fallback to rule-based responses
                return this.getFallbackResponse(query);
            }
        } catch (error) {
            console.error('Error getting response:', error);
            
            // If Gemini fails, use fallback
            return this.getFallbackResponse(query);
        }
    }

    getQuickSuggestions() {
        return [
            "What is NewsMate?",
            "Which countries are supported?",
            "How does the app work?",
            "What news sources do you use?",
            "App not working, help!",
            "How to check news credibility?",
            "Latest news features?",
            "Troubleshooting guide"
        ];
    }
}

module.exports = NewsChatbot;