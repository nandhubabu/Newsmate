const axios = require('axios');
const cheerio = require('cheerio');

// Country-specific news websites
const newsSites = {
    'us': [
        {
            name: 'CNN',
            url: 'https://lite.cnn.com',
            selectors: {
                articles: 'li',
                title: 'a',
                link: 'a',
                description: '.summary'
            }
        },
        {
            name: 'BBC News',
            url: 'https://www.bbc.com/news/world/us_and_canada',
            selectors: {
                articles: '[data-testid="edinburgh-article"]',
                title: 'h3',
                link: 'a',
                description: 'p'
            }
        }
    ],
    'gb': [
        {
            name: 'BBC UK',
            url: 'https://www.bbc.com/news/uk',
            selectors: {
                articles: '[data-testid="edinburgh-article"]',
                title: 'h3',
                link: 'a',
                description: 'p'
            }
        }
    ],
    'in': [
        {
            name: 'Times of India',
            url: 'https://timesofindia.indiatimes.com/home/headlines',
            selectors: {
                articles: '.content .list5 li',
                title: 'a',
                link: 'a',
                description: null
            }
        }
    ],
    'ca': [
        {
            name: 'CBC News',
            url: 'https://www.cbc.ca/news',
            selectors: {
                articles: '.card',
                title: '.headline',
                link: 'a',
                description: '.dek'
            }
        }
    ],
    'au': [
        {
            name: 'ABC News Australia',
            url: 'https://www.abc.net.au/news',
            selectors: {
                articles: '.module-body article',
                title: 'h3 a',
                link: 'h3 a',
                description: '.abstract'
            }
        }
    ],
    'de': [
        {
            name: 'Deutsche Welle',
            url: 'https://www.dw.com/en',
            selectors: {
                articles: '.basicTeaser',
                title: '.news-item-title a',
                link: '.news-item-title a',
                description: '.news-item-text'
            }
        }
    ],
    'fr': [
        {
            name: 'France 24',
            url: 'https://www.france24.com/en/france',
            selectors: {
                articles: '.article',
                title: '.article__title a',
                link: '.article__title a',
                description: '.article__summary'
            }
        }
    ],
    'jp': [
        {
            name: 'Japan Today',
            url: 'https://japantoday.com',
            selectors: {
                articles: '.story-item',
                title: '.story-title a',
                link: '.story-title a',
                description: '.story-summary'
            }
        }
    ],
    'cn': [
        {
            name: 'China Daily',
            url: 'https://www.chinadaily.com.cn',
            selectors: {
                articles: '.txt_con li',
                title: 'a',
                link: 'a',
                description: null
            }
        }
    ]
};

// Fallback international sites
const internationalSites = [
    {
        name: 'Reuters',
        url: 'https://www.reuters.com/world',
        selectors: {
            articles: '[data-testid="MediaStoryCard"]',
            title: 'h3',
            link: 'a',
            description: 'p'
        }
    },
    {
        name: 'BBC World',
        url: 'https://www.bbc.com/news/world',
        selectors: {
            articles: '[data-testid="edinburgh-article"]',
            title: 'h3',
            link: 'a',
            description: 'p'
        }
    },
    {
        name: 'Al Jazeera',
        url: 'https://www.aljazeera.com',
        selectors: {
            articles: '.gc__content article',
            title: '.gc__title a',
            link: '.gc__title a',
            description: '.gc__excerpt'
        }
    }
];

async function scrapeWebsite(site) {
    try {
        console.log(`Scraping ${site.name} from ${site.url}`);
        
        const response = await axios.get(site.url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1'
            }
        });

        const $ = cheerio.load(response.data);
        const articles = [];

        $(site.selectors.articles).each((index, element) => {
            if (index >= 10) return false; // Limit to 10 articles per site

            const $article = $(element);
            let title = $article.find(site.selectors.title).first().text().trim();
            
            // Alternative title extraction if first method fails
            if (!title) {
                title = $article.find(site.selectors.title).attr('title') || 
                        $article.find(site.selectors.title).attr('alt') || '';
            }

            let link = $article.find(site.selectors.link).first().attr('href');
            let description = site.selectors.description ? 
                $article.find(site.selectors.description).first().text().trim() : 
                'Read more...';

            // Clean up and validate
            if (!title || title.length < 10) return;
            
            // Handle relative URLs
            if (link && !link.startsWith('http')) {
                const baseUrl = new URL(site.url).origin;
                link = baseUrl + (link.startsWith('/') ? link : '/' + link);
            }

            if (title && link) {
                articles.push({
                    title: title.substring(0, 200), // Limit title length
                    description: description.substring(0, 300) || 'Read more...',
                    url: link,
                    urlToImage: null, // We could extract images too, but keeping it simple
                    publishedAt: new Date().toISOString(), // Current time as approximation
                    source: { name: site.name },
                    author: site.name
                });
            }
        });

        console.log(`${site.name}: Found ${articles.length} articles`);
        return articles;

    } catch (error) {
        console.error(`Failed to scrape ${site.name}:`, error.message);
        return [];
    }
}

async function scrapeCountryNews(country) {
    const sites = newsSites[country] || [];
    
    if (sites.length === 0) {
        console.log(`No scraping sites configured for country: ${country}`);
        return [];
    }

    const allArticles = [];

    for (const site of sites) {
        try {
            const articles = await scrapeWebsite(site);
            allArticles.push(...articles);
            
            // Add delay between scraping different sites
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error scraping ${site.name}:`, error.message);
        }
    }

    return allArticles;
}

async function scrapeInternationalNews() {
    const allArticles = [];

    for (const site of internationalSites) {
        try {
            const articles = await scrapeWebsite(site);
            allArticles.push(...articles);
            
            // Add delay between scraping different sites
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Error scraping ${site.name}:`, error.message);
        }
    }

    return allArticles;
}

module.exports = {
    scrapeCountryNews,
    scrapeInternationalNews,
    newsSites
};