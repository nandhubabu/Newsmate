const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const NewsChatbot = require('./chatbot');
require('dotenv').config();

// Initialize chatbot
const chatbot = new NewsChatbot();

const PORT = process.env.PORT || 3000;
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Country code to country name mapping
const countryNames = {
    'us': 'United States', 'in': 'India', 'gb': 'United Kingdom', 'ca': 'Canada',
    'au': 'Australia', 'de': 'Germany', 'fr': 'France', 'jp': 'Japan',
    'cn': 'China', 'br': 'Brazil', 'ru': 'Russia', 'za': 'South Africa',
    'mx': 'Mexico', 'it': 'Italy', 'es': 'Spain', 'nl': 'Netherlands', 'se': 'Sweden'
};

function getCountryName(countryCode) {
    return countryNames[countryCode] || countryCode.toUpperCase();
}

// NewsAPI supported countries (these work well with NewsAPI)
const newsApiSupportedCountries = [
    'us', 'gb', 'ca', 'au', 'de', 'fr', 'it', 'nl', 'se', 'in', 'br', 'mx', 'za'
];

// Guardian sections mapping
const guardianSections = {
    'us': 'us-news',
    'gb': 'uk-news', 
    'au': 'australia-news',
    'in': 'world',
    'ca': 'world',
    'de': 'world',
    'fr': 'world',
    'jp': 'world',
    'cn': 'world',
    'br': 'world',
    'ru': 'world',
    'za': 'world',
    'mx': 'world',
    'it': 'world',
    'es': 'world',
    'nl': 'world',
    'se': 'world'
};

// Country-specific Guardian queries for better coverage
const guardianQueries = {
    'in': 'India OR Indian OR Delhi OR Mumbai',
    'cn': 'China OR Chinese OR Beijing OR Shanghai',
    'jp': 'Japan OR Japanese OR Tokyo',
    'ru': 'Russia OR Russian OR Moscow',
    'es': 'Spain OR Spanish OR Madrid',
    'it': 'Italy OR Italian OR Rome',
    'br': 'Brazil OR Brazilian OR Brasilia OR São Paulo',
    'mx': 'Mexico OR Mexican OR Mexico City',
    'za': 'South Africa OR African OR Cape Town',
    'se': 'Sweden OR Swedish OR Stockholm',
    'nl': 'Netherlands OR Dutch OR Amsterdam'
};

// Enhanced News API configurations
const newsAPIs = [
    {
        name: 'NewsAPI',
        url: 'https://newsapi.org/v2/top-headlines',
        apiKey: process.env.NEWS_API_KEY,
        getParams: (country) => ({
            country: country,
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 20
        }),
        transformResponse: (data) => data,
        supportsCountry: (country) => newsApiSupportedCountries.includes(country)
    },
    {
        name: 'Guardian API (Country-Specific)',
        url: 'https://content.guardianapis.com/search',
        apiKey: process.env.GUARDIAN_API_KEY,
        getParams: (country) => {
            const section = guardianSections[country] || 'world';
            const query = guardianQueries[country];
            
            const params = {
                'api-key': process.env.GUARDIAN_API_KEY,
                'show-fields': 'thumbnail,trailText,byline',
                'page-size': 20,
                'order-by': 'newest'
            };
            
            if (section !== 'world' || ['us', 'gb', 'au'].includes(country)) {
                params.section = section;
            }
            
            if (query) {
                params.q = query;
            }
            
            return params;
        },
        transformResponse: (data) => ({
            status: 'ok',
            articles: data.response.results.map(article => ({
                title: article.webTitle,
                description: article.fields?.trailText || 'Read full article for details',
                url: article.webUrl,
                urlToImage: article.fields?.thumbnail || null,
                publishedAt: article.webPublicationDate,
                source: { name: 'The Guardian' },
                author: article.fields?.byline || 'The Guardian'
            }))
        }),
        supportsCountry: (country) => true // Guardian supports all countries with search
    },
    {
        name: 'NewsData.io',
        url: 'https://newsdata.io/api/1/news',
        apiKey: process.env.NEWSDATA_API_KEY,
        getParams: (country) => ({
            apikey: process.env.NEWSDATA_API_KEY,
            country: country,
            language: 'en',
            size: 20
        }),
        transformResponse: (data) => ({
            status: 'ok',
            articles: data.results ? data.results.map(article => ({
                title: article.title,
                description: article.description || 'Read full article for details',
                url: article.link,
                urlToImage: article.image_url,
                publishedAt: article.pubDate,
                source: { name: article.source_id || 'NewsData' },
                author: article.creator ? article.creator[0] : 'NewsData'
            })) : []
        }),
        supportsCountry: (country) => true
    }
];

// Universal fallback APIs that work for all countries
const universalFallbackAPIs = [
    {
        name: 'NewsAPI Everything (Global)',
        url: 'https://newsapi.org/v2/everything',
        apiKey: process.env.NEWS_API_KEY,
        getParams: (country) => {
            const countryName = getCountryName(country);
            return {
                q: `"${countryName}" OR ${country.toUpperCase()}`,
                language: 'en',
                sortBy: 'publishedAt',
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 20,
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 7 days
            };
        },
        transformResponse: (data) => data,
        supportsCountry: (country) => true
    },
    {
        name: 'Guardian Global Search',
        url: 'https://content.guardianapis.com/search',
        apiKey: process.env.GUARDIAN_API_KEY,
        getParams: (country) => {
            const countryName = getCountryName(country);
            const specificQuery = guardianQueries[country] || countryName;
            
            return {
                'api-key': process.env.GUARDIAN_API_KEY,
                'show-fields': 'thumbnail,trailText,byline',
                'page-size': 20,
                'order-by': 'newest',
                'q': specificQuery,
                'from-date': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
        },
        transformResponse: (data) => ({
            status: 'ok',
            articles: data.response.results.map(article => ({
                title: article.webTitle,
                description: article.fields?.trailText || 'Read full article for details',
                url: article.webUrl,
                urlToImage: article.fields?.thumbnail || null,
                publishedAt: article.webPublicationDate,
                source: { name: 'The Guardian Global' },
                author: article.fields?.byline || 'The Guardian'
            }))
        }),
        supportsCountry: (country) => true
    },
    {
        name: 'NewsData Global',
        url: 'https://newsdata.io/api/1/news',
        apiKey: process.env.NEWSDATA_API_KEY,
        getParams: (country) => {
            const countryName = getCountryName(country);
            return {
                apikey: process.env.NEWSDATA_API_KEY,
                q: countryName,
                language: 'en',
                size: 20
            };
        },
        transformResponse: (data) => ({
            status: 'ok',
            articles: data.results ? data.results.map(article => ({
                title: article.title,
                description: article.description || 'Read full article for details',
                url: article.link,
                urlToImage: article.image_url,
                publishedAt: article.pubDate,
                source: { name: article.source_id || 'NewsData Global' },
                author: article.creator ? article.creator[0] : 'NewsData'
            })) : []
        }),
        supportsCountry: (country) => true
    }
];

// Last resort international news
const lastResortAPIs = [
    {
        name: 'US News as Fallback',
        url: 'https://newsapi.org/v2/top-headlines',
        apiKey: process.env.NEWS_API_KEY,
        getParams: () => ({
            country: 'us',
            apiKey: process.env.NEWS_API_KEY,
            pageSize: 15
        }),
        transformResponse: (data) => data,
        supportsCountry: () => true
    },
    {
        name: 'World News',
        url: 'https://content.guardianapis.com/search',
        apiKey: process.env.GUARDIAN_API_KEY,
        getParams: () => ({
            'api-key': process.env.GUARDIAN_API_KEY,
            'show-fields': 'thumbnail,trailText,byline',
            'page-size': 15,
            'order-by': 'newest',
            'section': 'world'
        }),
        transformResponse: (data) => ({
            status: 'ok',
            articles: data.response.results.map(article => ({
                title: article.webTitle,
                description: article.fields?.trailText || 'Read full article for details',
                url: article.webUrl,
                urlToImage: article.fields?.thumbnail || null,
                publishedAt: article.webPublicationDate,
                source: { name: 'The Guardian World' },
                author: article.fields?.byline || 'The Guardian'
            }))
        }),
        supportsCountry: () => true
    }
];

async function fetchNewsFromAPI(api, country) {
    try {
        if (!api.apiKey) {
            throw new Error(`${api.name} API key not configured`);
        }

        if (api.supportsCountry && !api.supportsCountry(country)) {
            throw new Error(`${api.name} doesn't support country: ${country}`);
        }

        const params = api.getParams(country);
        console.log(`🔄 Trying ${api.name} for ${getCountryName(country)}...`);

        const response = await axios.get(api.url, { 
            params,
            timeout: 15000
        });
        
        if (response.status === 200 && response.data) {
            const transformedData = api.transformResponse(response.data);
            
            if (transformedData.articles && transformedData.articles.length > 0) {
                console.log(`✅ ${api.name} returned ${transformedData.articles.length} articles`);
                return {
                    ...transformedData,
                    apiSource: api.name
                };
            }
        }
        
        throw new Error('No articles found');
    } catch (error) {
        console.error(`❌ ${api.name} failed:`, error.message);
        throw error;
    }
}

// Enhanced API endpoint with comprehensive fallback system
app.get('/api/news', async (req, res) => {
    try {
        const country = req.query.country || 'us';
        const countryName = getCountryName(country);
        console.log(`\n📰 === Fetching news for: ${countryName} (${country}) ===`);

        // Step 1: Try primary country-specific APIs
        console.log(`🎯 Step 1: Trying primary APIs for ${countryName}...`);
        const supportedAPIs = newsAPIs.filter(api => 
            !api.supportsCountry || api.supportsCountry(country)
        );

        for (const api of supportedAPIs) {
            try {
                const result = await fetchNewsFromAPI(api, country);
                console.log(`🎉 Success with ${api.name} for ${countryName}`);
                return res.json({
                    ...result,
                    message: null,
                    country: countryName
                });
            } catch (error) {
                console.log(`⚠️ ${api.name} failed for ${countryName}, trying next...`);
                continue;
            }
        }

        // Step 2: Try universal fallback APIs
        console.log(`🔄 Step 2: Primary APIs failed, trying universal fallbacks for ${countryName}...`);
        for (const api of universalFallbackAPIs) {
            try {
                const result = await fetchNewsFromAPI(api, country);
                console.log(`🎉 Success with fallback ${api.name}`);
                return res.json({
                    ...result,
                    message: `Found ${countryName} news from our global sources.`,
                    country: countryName
                });
            } catch (error) {
                console.log(`⚠️ Fallback ${api.name} failed, trying next...`);
                continue;
            }
        }

        // Step 3: Last resort - international news
        console.log(`🆘 Step 3: All fallbacks failed, trying last resort for ${countryName}...`);
        for (const api of lastResortAPIs) {
            try {
                const result = await fetchNewsFromAPI(api, null);
                console.log(`🎉 Success with last resort ${api.name}`);
                return res.json({
                    ...result,
                    message: `${countryName} news temporarily unavailable. Showing international headlines instead.`,
                    country: countryName
                });
            } catch (error) {
                console.log(`⚠️ Last resort ${api.name} failed, trying next...`);
                continue;
            }
        }

        throw new Error('All news sources exhausted');

    } catch (error) {
        console.error(`💥 All sources failed for ${getCountryName(req.query.country || 'us')}:`, error.message);
        
        res.status(503).json({ 
            error: `News currently unavailable for ${getCountryName(req.query.country || 'us')}`,
            message: `We're having trouble fetching news for ${getCountryName(req.query.country || 'us')} right now. This could be due to temporary API issues or network problems.`,
            details: error.message,
            country: req.query.country,
            countryName: getCountryName(req.query.country || 'us'),
            suggestions: [
                'Try selecting United States for most reliable coverage',
                'Check your internet connection',
                'Try again in a few minutes',
                'Some news sources may be temporarily down'
            ],
            availableAPIs: newsAPIs.map(api => ({
                name: api.name,
                configured: !!api.apiKey,
                supportsCountry: !api.supportsCountry || api.supportsCountry(req.query.country || 'us')
            }))
        });
    }
});

// Chatbot endpoints (existing code)
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({
                error: 'Message is required',
                response: 'Please enter a message to chat with NewsBot.',
                suggestions: chatbot.getQuickSuggestions()
            });
        }

        const cleanMessage = message.trim();
        if (cleanMessage.length > 500) {
            return res.status(400).json({
                error: 'Message too long',
                response: 'Please keep your message under 500 characters.',
                suggestions: chatbot.getQuickSuggestions()
            });
        }

        const response = await chatbot.getResponse(cleanMessage);
        const suggestions = chatbot.getQuickSuggestions();

        res.json({
            response: response,
            suggestions: suggestions,
            timestamp: new Date().toISOString(),
            powered_by: process.env.GEMINI_API_KEY ? 'Gemini AI' : 'Rule-based'
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        
        res.status(500).json({
            error: 'Chatbot temporarily unavailable',
            response: 'I apologize, but I\'m experiencing some technical difficulties. Please try asking your question again.',
            suggestions: chatbot.getQuickSuggestions(),
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/chat/suggestions', (req, res) => {
    res.json({
        suggestions: chatbot.getQuickSuggestions(),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    const apiStatus = newsAPIs.map(api => ({
        name: api.name,
        configured: !!api.apiKey,
        status: api.apiKey ? 'ready' : 'missing_key'
    }));

    res.json({
        status: 'ok',
        apis: apiStatus,
        ai: {
            gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured',
            chatbot: 'ready'
        },
        supportedCountries: Object.keys(countryNames),
        newsApiCountries: newsApiSupportedCountries,
        webScrapingAvailable: false,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📊 API Status:', newsAPIs.map(api => `${api.name}: ${api.apiKey ? '✅' : '❌'}`).join(', '));
    console.log(`🌍 Supported Countries: ${Object.keys(countryNames).length}`);
    console.log(`🔑 AI Chatbot: ${process.env.GEMINI_API_KEY ? '✅ Gemini' : '⚠️ Rule-based'}`);
});