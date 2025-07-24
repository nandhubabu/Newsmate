const axios = require('axios');

// Simple news sources that provide RSS or JSON feeds (easier to scrape)
const newsSources = {
    'us': [
        {
            name: 'NPR',
            url: 'https://feeds.npr.org/1001/rss.xml',
            type: 'rss'
        }
    ],
    'gb': [
        {
            name: 'BBC RSS',
            url: 'https://feeds.bbci.co.uk/news/rss.xml',
            type: 'rss'
        }
    ],
    'in': [
        {
            name: 'Hindu RSS',
            url: 'https://www.thehindu.com/news/feeder/default.rss',
            type: 'rss'
        }
    ]
};

// Fallback JSON APIs that don't require keys
const fallbackSources = [
    {
        name: 'Hacker News',
        url: 'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=20',
        transform: (data) => data.hits.map(item => ({
            title: item.title,
            description: item.title,
            url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
            publishedAt: item.created_at,
            source: { name: 'Hacker News' }
        }))
    },
    {
        name: 'Dev.to',
        url: 'https://dev.to/api/articles?per_page=20',
        transform: (data) => data.map(item => ({
            title: item.title,
            description: item.description,
            url: item.url,
            publishedAt: item.published_at,
            source: { name: 'Dev.to' }
        }))
    }
];

async function parseRSS(xmlString) {
    // Simple RSS parser without external dependencies
    const articles = [];
    const itemRegex = /<item>(.*?)<\/item>/gs;
    const matches = xmlString.match(itemRegex);
    
    if (matches) {
        matches.slice(0, 10).forEach(match => {
            const titleMatch = match.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/s);
            const linkMatch = match.match(/<link>(.*?)<\/link>/s);
            const descMatch = match.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/s);
            const dateMatch = match.match(/<pubDate>(.*?)<\/pubDate>/s);
            
            if (titleMatch && linkMatch) {
                articles.push({
                    title: (titleMatch[1] || titleMatch[2] || '').trim(),
                    description: (descMatch ? (descMatch[1] || descMatch[2] || '') : 'Read more...').trim().substring(0, 300),
                    url: (linkMatch[1] || '').trim(),
                    publishedAt: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
                    source: { name: 'RSS Feed' }
                });
            }
        });
    }
    
    return articles;
}

async function scrapeCountryNews(country) {
    const sources = newsSources[country] || [];
    const allArticles = [];
    
    for (const source of sources) {
        try {
            console.log(`Fetching ${source.name} for ${country}`);
            const response = await axios.get(source.url, { timeout: 10000 });
            
            if (source.type === 'rss') {
                const articles = await parseRSS(response.data);
                allArticles.push(...articles);
            }
        } catch (error) {
            console.error(`Failed to fetch ${source.name}:`, error.message);
        }
    }
    
    return allArticles;
}

async function scrapeInternationalNews() {
    const allArticles = [];
    
    for (const source of fallbackSources) {
        try {
            console.log(`Fetching ${source.name}`);
            const response = await axios.get(source.url, { timeout: 10000 });
            const articles = source.transform(response.data);
            allArticles.push(...articles);
        } catch (error) {
            console.error(`Failed to fetch ${source.name}:`, error.message);
        }
    }
    
    return allArticles;
}

module.exports = {
    scrapeCountryNews,
    scrapeInternationalNews,
    newsSites: newsSources
};