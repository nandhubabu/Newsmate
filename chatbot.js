const axios = require('axios');

class NewsChatbot {
    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY;
        this.geminiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
        
        this.appInfo = {
            name: "NewsMate Global Chronicle",
            version: "2.0.0",
            description: "An advanced editorial news intelligence platform with real-time global news, AI digests, text-to-speech, and deep source verification.",
            supportedCountries: [
                "United States", "India", "United Kingdom", "Canada", "Australia", 
                "Germany", "France", "Japan", "China", "Brazil", "Russia", 
                "South Africa", "Mexico", "Italy", "Spain", "Netherlands", "Sweden"
            ],
            categories: ["General", "Technology & AI", "Business & Markets", "Science", "Entertainment", "Sports", "Health", "World"]
        };

        this.systemPrompt = `You are the NewsMate Editorial Intelligence AI — a world-class news analyst and research copilot.
Your job is to provide objective, sharp, concise, and highly insightful news briefings, media literacy guidance, and assist users with navigating global current events.

Response Guidelines:
1. Always maintain an authoritative, objective, journalistic tone (akin to Financial Times, Reuters, or The Economist).
2. Format responses with clean Markdown: use bolding, concise bullet points, and clear headers when helpful.
3. Keep answers punchy and actionable (under 250 words unless asked for an in-depth dossier).
4. Emphasize factual context, verified sources, and multiple perspectives when discussing controversial developments.
5. If asked about the NewsMate platform, explain features like the Live Wire Ticker, Audio TTS Player, AI 3-Bullet Takeaways, Focus Reader Mode, and Multi-Category Filters.
6. Refuse personal medical/financial advice, hate speech, or non-journalistic gossip, politely redirecting to current events.`;
    }

    async callGemini(promptText, maxTokens = 400) {
        if (!this.geminiApiKey) {
            throw new Error('Gemini API key not configured');
        }

        const response = await axios.post(
            `${this.geminiEndpoint}?key=${this.geminiApiKey}`,
            {
                contents: [{
                    parts: [{ text: promptText }]
                }],
                generationConfig: {
                    temperature: 0.6,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: maxTokens,
                }
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 15000
            }
        );

        if (response.data && response.data.candidates && response.data.candidates[0]?.content?.parts?.[0]?.text) {
            return response.data.candidates[0].content.parts[0].text.trim();
        }
        throw new Error('Invalid response structure from Gemini API');
    }

    // AI Article Summarizer (3-bullet Executive Takeaways)
    async summarizeArticle(title, description, content) {
        const fullContext = [title, description, content].filter(Boolean).join('\n\n');
        
        if (this.geminiApiKey) {
            try {
                const prompt = `As a senior intelligence editor, analyze this news item and provide a high-impact executive TL;DR.
Return your answer in the following exact JSON format:
{
  "headline": "A crisp rewritten 1-sentence headline",
  "takeaways": [
    "Key takeaway 1 (What happened)",
    "Key takeaway 2 (Why it matters / who is involved)",
    "Key takeaway 3 (Broader impact or what to watch next)"
  ],
  "sentiment": "Optimistic" | "Critical" | "Developing" | "Neutral",
  "readTimeMinutes": 2
}

Article Context:
${fullContext.substring(0, 3000)}`;

                const rawText = await this.callGemini(prompt, 350);
                const jsonMatch = rawText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            } catch (err) {
                console.warn('Gemini summary failed, falling back to heuristic summarizer:', err.message);
            }
        }

        // Smart Local Extractive Fallback
        return this.localHeuristicSummary(title, description);
    }

    localHeuristicSummary(title, description) {
        const cleanDesc = (description || '').replace(/<[^>]*>/g, '').trim();
        const sentences = cleanDesc.split(/(?<=[.?!])\s+/).filter(s => s.length > 15);
        
        const takeaways = [];
        if (sentences.length >= 3) {
            takeaways.push(sentences[0]);
            takeaways.push(sentences[1]);
            takeaways.push(sentences[2]);
        } else if (sentences.length === 2) {
            takeaways.push(sentences[0]);
            takeaways.push(sentences[1]);
            takeaways.push('Coverage is ongoing as analysts assess the wider economic and geopolitical implications.');
        } else if (sentences.length === 1) {
            takeaways.push(sentences[0]);
            takeaways.push('Story reflects primary reports gathered from global correspondents.');
            takeaways.push('Additional details and corroborating sources are being monitored.');
        } else {
            takeaways.push(`Key developments reported regarding: ${title}`);
            takeaways.push('Primary sources indicate ongoing developments across international sectors.');
            takeaways.push('Stakeholders and market observers are watching for follow-up disclosures.');
        }

        // Determine basic sentiment tag
        const lower = (title + ' ' + cleanDesc).toLowerCase();
        let sentiment = 'Developing';
        if (/surge|gain|growth|breakthrough|record|rally|triumph|innovat|success/.test(lower)) {
            sentiment = 'Optimistic';
        } else if (/crisis|war|fall|drop|decline|inflation|crash|threat|warn|probe|death|scandal/.test(lower)) {
            sentiment = 'Critical';
        } else if (/meet|discuss|announce|report|update|plan|schedule/.test(lower)) {
            sentiment = 'Neutral';
        }

        return {
            headline: title,
            takeaways: takeaways.slice(0, 3),
            sentiment,
            readTimeMinutes: Math.max(1, Math.ceil((title.length + cleanDesc.length) / 450))
        };
    }

    // Daily Executive Briefing (audio & text digest of top stories)
    async generateExecutiveBriefing(articles = []) {
        const valid = articles.slice(0, 6);
        const titles = valid.map((a, i) => `${i + 1}. ${a.title} (${a.source?.name || 'Wire'})`).join('\n');

        if (this.geminiApiKey && valid.length > 0) {
            try {
                const prompt = `You are producing the "NewsMate Morning Intelligence Briefing" for busy professionals.
Summarize these top stories into a coherent 4-paragraph broadcast script (under 250 words):
${titles}

Include:
- An opening greeting & top theme of today
- 3 consolidated story capsules (highlighting key shifts)
- A brief forward-looking closing sentence.`;

                const briefingText = await this.callGemini(prompt, 500);
                return {
                    briefing: briefingText,
                    count: valid.length,
                    generatedAt: new Date().toISOString(),
                    poweredBy: 'Gemini AI'
                };
            } catch (err) {
                console.warn('Gemini briefing failed, using local briefing:', err.message);
            }
        }

        // Local briefing compilation
        const leadStory = valid[0]?.title || 'Global markets and geopolitical developments lead today\'s coverage.';
        const secondary = valid.slice(1, 4).map(a => `• **${a.source?.name || 'Source'}**: ${a.title}`).join('\n\n');
        
        return {
            briefing: `### 🌅 NewsMate Executive Briefing\n\n**Top Focus:** ${leadStory}\n\nKey headlines across the global wire:\n\n${secondary}\n\n*Stay updated as our wire feeds monitor breaking updates throughout the trading and news cycle.*`,
            count: valid.length,
            generatedAt: new Date().toISOString(),
            poweredBy: 'Heuristic Wire Engine'
        };
    }

    async getResponse(query) {
        if (this.geminiApiKey) {
            try {
                const prompt = `${this.systemPrompt}\n\nUser Question: ${query}\n\nNewsMate AI Response:`;
                return await this.callGemini(prompt, 400);
            } catch (err) {
                console.warn('Gemini chat failed, falling back to rule-based engine:', err.message);
            }
        }
        return this.getFallbackResponse(query);
    }

    getFallbackResponse(query) {
        const q = query.toLowerCase();

        if (/hello|hi|hey|greetings|morning|evening/.test(q)) {
            return "Good day. I am your **NewsMate Editorial Assistant**. I can help you summarize current headlines, explain geopolitical or economic terms, evaluate news source credibility, or guide you through NewsMate's advanced tools.";
        }

        if (/feature|how to|tools|what can you do|audio|listen|summary/.test(q)) {
            return `### NewsMate 2.0 Editorial Suite:
- 🔊 **Audio TTS Reader**: Click the "Listen" button on any card or reader view to hear the article read aloud.
- ⚡ **AI 3-Bullet Takeaways**: Click the "AI Summary" button on any headline for an instant executive breakdown.
- 📖 **Focus Reader Mode**: Expand any story into a clean, distraction-free reading canvas with typography scaling (A-/A+).
- 🏷️ **Multi-Category Filter**: Instant switching between World, Technology & AI, Markets & Business, Science, and Culture.
- 🔖 **Bookmarks Drawer**: Save stories locally to read offline anytime.
- 🌓 **Dual Themes**: Toggle seamlessly between *Midnight Intelligence* and *Broadsheet Paper*.`;
        }

        if (/source|credibility|bias|fact check|fake news/.test(q)) {
            return `### 🛡️ Source Verification & Media Literacy:
1. **Cross-Corroboration**: Verify if a breaking report is carried independently by multiple major wires (e.g. Reuters, BBC, AP).
2. **Distinguish Byline Types**: Distinguish between *straight news reporting* and *opinion/editorial columns*.
3. **Primary Attribution**: Notice whether names, official documents, or quotes are named directly versus anonymous hearsay.
4. **NewsMate Zero-Key Engine**: Our platform aggregates directly from primary RSS and authenticated global news wires.`;
        }

        if (/country|countries|support|regions/.test(q)) {
            return `NewsMate aggregates live headlines across **17 major nations** including the United States, India, United Kingdom, Canada, Australia, Germany, France, Japan, Brazil, and more, backed by international global wire feeds. Use the country pills in the header to switch instantly.`;
        }

        if (/markets|stock|crypto|economy|inflation|business/.test(q)) {
            return `You can filter directly for financial and market news by selecting the **Markets & Business** tab in the navigation ribbon above. Our feeds track real-time dispatches from CNBC, MarketWatch, Bloomberg wires, and BBC Business.`;
        }

        if (/ai|tech|technology|silicon valley/.test(q)) {
            return `For technology news and AI breakthroughs, switch to the **Technology & AI** tab above to explore updates aggregated from The Verge, TechCrunch, Wired, and Hacker News.`;
        }

        return `I am focused on news intelligence, current events, and the NewsMate platform. You can ask me to summarize breaking events, explain terms like *quantitative easing* or *diplomatic cables*, or help you navigate international coverage. What topic would you like to explore?`;
    }

    getQuickSuggestions() {
        return [
            "What are the top features of NewsMate 2.0?",
            "How do I use the Audio TTS Reader?",
            "How to check news credibility & bias?",
            "Explain how the AI Summary works",
            "Which countries and categories are available?",
            "Tips for spotting disinformation"
        ];
    }
}

module.exports = NewsChatbot;