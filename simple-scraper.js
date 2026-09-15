const axios = require('axios');

// Robust RSS feeds by country and category
const rssFeeds = {
    countries: {
        'us': [
            { name: 'Google News US', url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en' },
            { name: 'NPR News', url: 'https://feeds.npr.org/1001/rss.xml' },
            { name: 'BBC US & Canada', url: 'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml' },
            { name: 'PBS NewsHour', url: 'https://www.pbs.org/newshour/feeds/rss/headlines' }
        ],
        'gb': [
            { name: 'Google News UK', url: 'https://news.google.com/rss?hl=en-GB&gl=GB&ceid=GB:en' },
            { name: 'BBC UK News', url: 'https://feeds.bbci.co.uk/news/uk/rss.xml' },
            { name: 'Sky News UK', url: 'https://feeds.skynews.com/feeds/rss/uk.xml' }
        ],
        'in': [
            { name: 'Google News India', url: 'https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en' },
            { name: 'The Hindu', url: 'https://www.thehindu.com/news/feeder/default.rss' },
            { name: 'NDTV Top Stories', url: 'https://feeds.feedburner.com/ndtvnews-top-stories' }
        ],
        'au': [
            { name: 'Google News Australia', url: 'https://news.google.com/rss?hl=en-AU&gl=AU&ceid=AU:en' },
            { name: 'ABC News Australia', url: 'https://www.abc.net.au/news/feed/51120/rss.xml' }
        ],
        'ca': [
            { name: 'Google News Canada', url: 'https://news.google.com/rss?hl=en-CA&gl=CA&ceid=CA:en' },
            { name: 'CBC Top Stories', url: 'https://rss.cbc.ca/lineup/topstories.xml' }
        ],
        'world': [
            { name: 'Google World News', url: 'https://news.google.com/rss/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US:en' },
            { name: 'BBC World News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
            { name: 'Al Jazeera English', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
            { name: 'NPR World', url: 'https://feeds.npr.org/1004/rss.xml' }
        ]
    },
    categories: {
        'technology': [
            { name: 'Google Tech Wire', url: 'https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en' },
            { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
            { name: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
            { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index' },
            { name: 'Wired Tech', url: 'https://www.wired.com/feed/category/gear/latest/rss' }
        ],
        'business': [
            { name: 'Google Finance & Markets', url: 'https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en' },
            { name: 'CNBC Top News', url: 'https://search.cnbc.com/rs/search/view.html?partnerId=2000&keywords=business&format=rss' },
            { name: 'MarketWatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' },
            { name: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' }
        ],
        'science': [
            { name: 'Google Science Wire', url: 'https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en' },
            { name: 'ScienceDaily', url: 'https://www.sciencedaily.com/rss/all.xml' },
            { name: 'BBC Science', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' }
        ],
        'entertainment': [
            { name: 'Google Entertainment', url: 'https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en' },
            { name: 'BBC Entertainment', url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml' },
            { name: 'Variety', url: 'https://variety.com/feed/' }
        ],
        'sports': [
            { name: 'Google Sports Wire', url: 'https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en' },
            { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
            { name: 'ESPN Top News', url: 'https://www.espn.com/espn/rss/news' }
        ],
        'health': [
            { name: 'Google Health Wire', url: 'https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en' },
            { name: 'BBC Health', url: 'https://feeds.bbci.co.uk/news/health/rss.xml' },
            { name: 'NPR Health', url: 'https://feeds.npr.org/1128/rss.xml' }
        ]
    }
};

// Fallback JSON APIs that require no keys
const jsonSources = [
    {
        name: 'Hacker News',
        url: 'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=20',
        transform: (data) => (data.hits || []).map(item => ({
            title: item.title || 'Tech Headline',
            description: item.title + ' — Discussion on Hacker News with ' + (item.num_comments || 0) + ' comments and ' + (item.points || 0) + ' points.',
            url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
            urlToImage: null,
            publishedAt: item.created_at || new Date().toISOString(),
            source: { name: 'Hacker News' },
            author: item.author || 'YCombinator'
        }))
    },
    {
        name: 'Dev.to Tech Pulse',
        url: 'https://dev.to/api/articles?per_page=15&top=1',
        transform: (data) => (data || []).map(item => ({
            title: item.title,
            description: item.description || item.title,
            url: item.url,
            urlToImage: item.cover_image || item.social_image || null,
            publishedAt: item.published_at || new Date().toISOString(),
            source: { name: 'Dev.to' },
            author: item.user?.name || 'Dev.to'
        }))
    }
];

function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
        .replace(/<[^>]*>/g, '') // remove HTML tags
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function parseRSS(xmlString, sourceName) {
    const articles = [];
    const itemRegex = /<item\b[^>]*>(.*?)<\/item>/gis;
    let match;

    while ((match = itemRegex.exec(xmlString)) !== null && articles.length < 15) {
        const itemContent = match[1];

        // Title
        const titleMatch = itemContent.match(/<title\b[^>]*>(.*?)<\/title>/is);
        const rawTitle = titleMatch ? titleMatch[1] : '';
        const title = cleanText(rawTitle);

        // Link
        const linkMatch = itemContent.match(/<link\b[^>]*>(.*?)<\/link>/is) ||
                          itemContent.match(/<link\b[^>]*href=["']([^"']+)["']/is);
        const link = linkMatch ? cleanText(linkMatch[1]) : '';

        // Description / Summary
        const descMatch = itemContent.match(/<description\b[^>]*>(.*?)<\/description>/is) ||
                          itemContent.match(/<content:encoded\b[^>]*>(.*?)<\/content:encoded>/is) ||
                          itemContent.match(/<summary\b[^>]*>(.*?)<\/summary>/is);
        const rawDesc = descMatch ? descMatch[1] : '';
        const description = cleanText(rawDesc) || 'Read the full coverage for comprehensive analysis and context.';

        // Published Date
        const dateMatch = itemContent.match(/<pubDate\b[^>]*>(.*?)<\/pubDate>/is) ||
                          itemContent.match(/<dc:date\b[^>]*>(.*?)<\/dc:date>/is);
        const pubDate = dateMatch ? new Date(cleanText(dateMatch[1])).toISOString() : new Date().toISOString();

        // Image / Media / Enclosure
        let imageUrl = null;
        const mediaMatch = itemContent.match(/<media:content\b[^>]*url=["']([^"']+)["']/is) ||
                           itemContent.match(/<enclosure\b[^>]*url=["']([^"']+)["'][^>]*type=["']image/is) ||
                           itemContent.match(/<media:thumbnail\b[^>]*url=["']([^"']+)["']/is) ||
                           rawDesc.match(/<img\b[^>]*src=["']([^"']+)["']/is);
        if (mediaMatch && mediaMatch[1]) {
            imageUrl = mediaMatch[1].trim();
        }

        if (title && (link || title.length > 10)) {
            articles.push({
                title: title.substring(0, 220),
                description: description.substring(0, 350) + (description.length > 350 ? '...' : ''),
                url: link || '#',
                urlToImage: imageUrl,
                publishedAt: pubDate,
                source: { name: sourceName || 'Global Wire' },
                author: sourceName || 'Editorial Staff'
            });
        }
    }

    return articles;
}

async function fetchFeed(feed) {
    try {
        const response = await axios.get(feed.url, {
            timeout: 9000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*'
            }
        });
        return parseRSS(response.data, feed.name);
    } catch (err) {
        console.warn(`Feed error [${feed.name}]:`, err.message);
        return [];
    }
}

async function getLiveFallbackNews(country = 'us', category = 'general') {
    const articles = [];

    // 1. If a specific category was requested, try category feeds first
    if (category && category !== 'general' && rssFeeds.categories[category]) {
        const categoryFeeds = rssFeeds.categories[category];
        for (const feed of categoryFeeds) {
            const items = await fetchFeed(feed);
            if (items.length > 0) articles.push(...items);
            if (articles.length >= 20) break;
        }
    }

    // 2. If not enough, try country-specific feeds
    if (articles.length < 10) {
        const countryFeeds = rssFeeds.countries[country] || rssFeeds.countries['world'];
        for (const feed of countryFeeds) {
            const items = await fetchFeed(feed);
            if (items.length > 0) articles.push(...items);
            if (articles.length >= 20) break;
        }
    }

    // 3. If still empty, try world feeds
    if (articles.length < 5) {
        for (const feed of rssFeeds.countries['world']) {
            const items = await fetchFeed(feed);
            if (items.length > 0) articles.push(...items);
            if (articles.length >= 20) break;
        }
    }

    // 4. If RSS blocked or offline, use open JSON APIs
    if (articles.length === 0) {
        for (const source of jsonSources) {
            try {
                const res = await axios.get(source.url, { timeout: 8000 });
                const items = source.transform(res.data);
                articles.push(...items);
            } catch (err) {
                console.warn(`JSON fallback error [${source.name}]:`, err.message);
            }
        }
    }

    // Deduplicate by title
    const seen = new Set();
    const unique = articles.filter(art => {
        const normalized = art.title.toLowerCase().trim();
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
    });

    // Strictly sort by publishedAt descending so freshest breaking news is on top
    unique.sort((a, b) => {
        const timeA = new Date(a.publishedAt || 0).getTime();
        const timeB = new Date(b.publishedAt || 0).getTime();
        return timeB - timeA;
    });

    return unique.slice(0, 30);
}

module.exports = {
    getLiveFallbackNews,
    parseRSS,
    rssFeeds
};