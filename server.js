const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const NewsChatbot = require('./chatbot');
const simpleScraper = require('./simple-scraper');
require('dotenv').config();

// Initialize chatbot
const chatbot = new NewsChatbot();

const PORT = process.env.PORT || 3000;
const app = express();

// Middleware
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
    'mx': 'Mexico', 'it': 'Italy', 'es': 'Spain', 'nl': 'Netherlands', 'se': 'Sweden',
    'world': 'Global Wire'
};

function getCountryName(countryCode) {
    return countryNames[countryCode] || (countryCode ? countryCode.toUpperCase() : 'Global');
}

// Category mappings
const categoryNewsApi = {
    'general': 'general',
    'technology': 'technology',
    'business': 'business',
    'science': 'science',
    'entertainment': 'entertainment',
    'sports': 'sports',
    'health': 'health'
};

const categoryGuardian = {
    'general': 'news',
    'technology': 'technology',
    'business': 'business',
    'science': 'science',
    'entertainment': 'culture',
    'sports': 'sport',
    'health': 'society'
};

// NewsAPI supported countries
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

// Country-specific Guardian queries
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

// Primary News APIs
const newsAPIs = [
    {
        name: 'NewsAPI Top-Headlines',
        url: 'https://newsapi.org/v2/top-headlines',
        apiKey: process.env.NEWS_API_KEY,
        getParams: (country, category, q) => {
            const params = {
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 24
            };
            if (q) {
                params.q = q;
            } else {
                if (country && country !== 'world') params.country = country;
                if (category && category !== 'general' && categoryNewsApi[category]) {
                    params.category = categoryNewsApi[category];
                }
            }
            return params;
        },
        transformResponse: (data) => data,
        supportsCountry: (country) => country === 'world' || newsApiSupportedCountries.includes(country)
    },
    {
        name: 'The Guardian',
        url: 'https://content.guardianapis.com/search',
        apiKey: process.env.GUARDIAN_API_KEY,
        getParams: (country, category, q) => {
            const section = (category && categoryGuardian[category]) 
                ? categoryGuardian[category] 
                : (guardianSections[country] || 'world');
            const countryQuery = guardianQueries[country];
            
            const params = {
                'api-key': process.env.GUARDIAN_API_KEY,
                'show-fields': 'thumbnail,trailText,byline,bodyText',
                'page-size': 24,
                'order-by': 'newest'
            };
            
            if (section && section !== 'world') {
                params.section = section;
            }
            
            if (q) {
                params.q = q;
            } else if (countryQuery) {
                params.q = countryQuery;
            }
            
            return params;
        },
        transformResponse: (data) => ({
            status: 'ok',
            articles: (data.response?.results || []).map(article => ({
                title: article.webTitle,
                description: article.fields?.trailText || 'Read full coverage on The Guardian.',
                url: article.webUrl,
                urlToImage: article.fields?.thumbnail || null,
                publishedAt: article.webPublicationDate,
                source: { name: 'The Guardian' },
                author: article.fields?.byline || 'The Guardian'
            }))
        }),
        supportsCountry: () => true
    },
    {
        name: 'NewsData.io',
        url: 'https://newsdata.io/api/1/news',
        apiKey: process.env.NEWSDATA_API_KEY,
        getParams: (country, category, q) => {
            const params = {
                apikey: process.env.NEWSDATA_API_KEY,
                language: 'en',
                size: 20
            };
            if (q) params.q = q;
            if (country && country !== 'world') params.country = country;
            if (category && category !== 'general') params.category = category;
            return params;
        },
        transformResponse: (data) => ({
            status: 'ok',
            articles: (data.results || []).map(article => ({
                title: article.title,
                description: article.description || 'Read full article for details.',
                url: article.link,
                urlToImage: article.image_url,
                publishedAt: article.pubDate,
                source: { name: article.source_id || 'NewsData' },
                author: article.creator ? article.creator[0] : 'NewsData Wire'
            }))
        }),
        supportsCountry: () => true
    }
];

// Universal Fallback APIs
const universalFallbackAPIs = [
    {
        name: 'NewsAPI Global Search',
        url: 'https://newsapi.org/v2/everything',
        apiKey: process.env.NEWS_API_KEY,
        getParams: (country, category, q) => {
            const countryName = getCountryName(country);
            const query = q || `"${countryName}" OR ${country.toUpperCase()}`;
            return {
                q: query,
                language: 'en',
                sortBy: 'publishedAt',
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 20,
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
        },
        transformResponse: (data) => data,
        supportsCountry: () => true
    }
];

async function fetchNewsFromAPI(api, country, category, q) {
    if (!api.apiKey) {
        throw new Error(`${api.name} API key not configured`);
    }

    if (api.supportsCountry && !api.supportsCountry(country)) {
        throw new Error(`${api.name} does not support country: ${country}`);
    }

    const params = api.getParams(country, category, q);
    console.log(`🔄 Trying ${api.name}...`);

    const response = await axios.get(api.url, { 
        params,
        timeout: 12000
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
    
    throw new Error('No articles returned');
}

// Main News Endpoint with 4-Tier Zero-Key Resiliency
app.get('/api/news', async (req, res) => {
    const country = (req.query.country || 'us').toLowerCase();
    const category = (req.query.category || 'general').toLowerCase();
    const q = req.query.q ? req.query.q.trim() : '';
    const countryName = getCountryName(country);

    console.log(`\n📰 Request: ${countryName} [${country}] | Category: ${category} | Query: "${q}"`);

    // Step 1: Try Primary APIs (NewsAPI, Guardian, NewsData)
    for (const api of newsAPIs) {
        if (!api.apiKey) continue;
        try {
            const result = await fetchNewsFromAPI(api, country, category, q);
            return res.json({
                ...result,
                country: countryName,
                countryCode: country,
                category: category,
                fallbackActive: false,
                message: null
            });
        } catch (err) {
            console.log(`⚠️ ${api.name} bypassed:`, err.message);
        }
    }

    // Step 2: Try Universal Search APIs
    for (const api of universalFallbackAPIs) {
        if (!api.apiKey) continue;
        try {
            const result = await fetchNewsFromAPI(api, country, category, q);
            return res.json({
                ...result,
                country: countryName,
                countryCode: country,
                category: category,
                fallbackActive: false,
                message: `Dispatches gathered from global wire archives for ${countryName}.`
            });
        } catch (err) {
            console.log(`⚠️ Fallback ${api.name} bypassed:`, err.message);
        }
    }

    // Step 3: Tier 4 Live RSS & Open Feeds Engine (Zero-Key Guaranteed Reliability)
    console.log(`⚡ Initiating Tier 4 Zero-Key Live Wire Engine for ${countryName}...`);
    try {
        const fallbackArticles = await simpleScraper.getLiveFallbackNews(country, category);
        if (fallbackArticles && fallbackArticles.length > 0) {
            console.log(`✅ Live RSS & Open Feeds returned ${fallbackArticles.length} fresh articles`);
            return res.json({
                status: 'ok',
                articles: fallbackArticles,
                apiSource: 'NewsMate Zero-Key RSS & Live Wire Engine',
                country: countryName,
                countryCode: country,
                category: category,
                fallbackActive: true,
                message: `Live dispatches served via verified direct wire feeds for ${countryName}.`
            });
        }
    } catch (err) {
        console.error('❌ RSS Fallback failed:', err.message);
    }

    // Step 4: If everything genuinely failed (e.g. complete network cutoff)
    return res.status(503).json({
        error: `News temporarily unavailable for ${countryName}`,
        message: 'Could not reach upstream news wires or local feeds. Please verify internet connection.',
        country: country,
        countryName: countryName,
        suggestions: [
            'Check your network connection',
            'Try selecting "United States" or "World Wire"',
            'Select a different category (e.g. Technology or Business)'
        ]
    });
});

// AI Article Summarization Endpoint
app.post('/api/ai/summarize', async (req, res) => {
    try {
        const { title, description, content } = req.body;
        if (!title && !description) {
            return res.status(400).json({ error: 'Title or description is required for summarization' });
        }

        const summary = await chatbot.summarizeArticle(title, description, content);
        res.json({
            status: 'ok',
            summary,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('Summarize error:', err);
        res.status(500).json({
            error: 'Failed to generate summary',
            details: err.message
        });
    }
});

// AI Executive Daily Briefing Endpoint
app.post('/api/ai/briefing', async (req, res) => {
    try {
        const { articles } = req.body;
        const briefingResult = await chatbot.generateExecutiveBriefing(articles || []);
        res.json({
            status: 'ok',
            ...briefingResult
        });
    } catch (err) {
        console.error('Briefing error:', err);
        res.status(500).json({
            error: 'Failed to generate briefing',
            details: err.message
        });
    }
});

// Chatbot Endpoints
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({
                error: 'Message is required',
                response: 'Please enter a query for the NewsMate Intelligence Copilot.',
                suggestions: chatbot.getQuickSuggestions()
            });
        }

        const cleanMessage = message.trim();
        if (cleanMessage.length > 600) {
            return res.status(400).json({
                error: 'Message too long',
                response: 'Please keep your message under 600 characters.',
                suggestions: chatbot.getQuickSuggestions()
            });
        }

        const response = await chatbot.getResponse(cleanMessage);
        const suggestions = chatbot.getQuickSuggestions();

        res.json({
            response: response,
            suggestions: suggestions,
            timestamp: new Date().toISOString(),
            powered_by: process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : 'NewsMate Editorial Engine'
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({
            error: 'Chatbot temporarily unavailable',
            response: 'I am experiencing a momentary connection glitch. Please retry your inquiry.',
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
        name: 'NewsMate Global Chronicle',
        version: '2.0.0',
        apis: apiStatus,
        ai: {
            gemini: process.env.GEMINI_API_KEY ? 'configured' : 'fallback_heuristic',
            chatbot: 'ready'
        },
        supportedCountries: Object.keys(countryNames),
        zeroKeyEngine: 'active',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`📰 NewsMate 2.0 Server running on http://localhost:${PORT}`);
    console.log(`🔑 Configured APIs: ${newsAPIs.filter(a => a.apiKey).map(a => a.name).join(', ') || 'None (Zero-Key RSS Fallback Active)'}`);
    console.log(`🤖 AI Engine: ${process.env.GEMINI_API_KEY ? 'Gemini 1.5 Flash' : 'Heuristic Editorial Fallback'}`);
    console.log(`======================================================\n`);
});