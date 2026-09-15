/**
 * NEWSMATE 2.0 — GLOBAL INTELLIGENCE CHRONICLE
 * Modern Editorial Client Application
 */

class NewsMateApp {
    constructor() {
        // State
        this.country = 'world';
        this.category = 'general';
        this.searchQuery = '';
        this.viewMode = localStorage.getItem('newsmate_view') || 'grid';
        this.theme = localStorage.getItem('newsmate_theme') || 'dark';
        this.articles = [];
        this.filteredArticles = [];
        this.bookmarks = JSON.parse(localStorage.getItem('newsmate_bookmarks') || '[]');
        this.currentArticleForReader = null;
        this.currentBriefingText = '';
        this.readerFontSize = 1.15; // rem

        // Audio Engine & Drive-Time Queue State
        this.audioQueue = [];
        this.audioQueueIndex = 0;
        this.audioSpeech = {
            synth: window.speechSynthesis,
            utterance: null,
            isPlaying: false,
            isPaused: false,
            rate: 1.0,
            currentTitle: ''
        };

        // Cache DOM Elements
        this.dom = {
            html: document.documentElement,
            wireClock: document.getElementById('wire-clock'),
            wireTicker: document.getElementById('wire-ticker'),
            wireStatusBadge: document.getElementById('wire-status-badge'),
            themeToggleBtn: document.getElementById('theme-toggle-btn'),
            themeIcon: document.getElementById('theme-icon'),
            themeLabel: document.getElementById('theme-label'),
            mastheadDate: document.getElementById('masthead-date'),
            searchInput: document.getElementById('news-search-input'),
            clearSearchBtn: document.getElementById('clear-search-btn'),
            countryPills: document.getElementById('country-pills-container'),
            categoryTabs: document.getElementById('category-tabs'),
            feedLocationBadge: document.getElementById('feed-location-badge'),
            feedCategoryBadge: document.getElementById('feed-category-badge'),
            feedCountPill: document.getElementById('feed-count-pill'),
            viewBtns: document.querySelectorAll('.view-btn'),
            refreshBtn: document.getElementById('refresh-feed-btn'),
            refreshIcon: document.getElementById('refresh-icon'),
            heroSection: document.getElementById('hero-spotlight-section'),
            newsGrid: document.getElementById('news-grid'),
            brandHomeLink: document.getElementById('brand-home-link'),

            // Bookmarks
            openBookmarksBtn: document.getElementById('open-bookmarks-btn'),
            closeBookmarksBtn: document.getElementById('close-bookmarks-drawer'),
            bookmarksDrawerOverlay: document.getElementById('bookmarks-drawer-overlay'),
            bookmarksList: document.getElementById('bookmarks-list'),
            bookmarksCount: document.getElementById('bookmarks-count'),
            savedItemsCounter: document.getElementById('saved-items-counter'),
            clearAllBookmarksBtn: document.getElementById('clear-all-bookmarks-btn'),
            exportMarkdownBtn: document.getElementById('export-markdown-btn'),
            exportJsonBtn: document.getElementById('export-json-btn'),
            printBookmarksBtn: document.getElementById('print-bookmarks-btn'),

            // Audio Player Bar & Queue
            audioPlayerBar: document.getElementById('audio-player-bar'),
            audioPlayerTitle: document.getElementById('audio-player-title'),
            audioPlayerStatus: document.getElementById('audio-player-status'),
            audioQueueIndicator: document.getElementById('audio-queue-indicator'),
            audioPrevBtn: document.getElementById('audio-prev-btn'),
            audioNextBtn: document.getElementById('audio-next-btn'),
            audioSpeedBtn: document.getElementById('audio-speed-btn'),
            audioToggleBtn: document.getElementById('audio-toggle-btn'),
            audioQueueBtn: document.getElementById('audio-queue-btn'),
            audioQueueBadge: document.getElementById('audio-queue-badge'),
            audioStopBtn: document.getElementById('audio-stop-btn'),
            audioWaves: document.getElementById('audio-waves'),
            audioQueueOverlay: document.getElementById('audio-queue-overlay'),
            closeAudioQueueBtn: document.getElementById('close-audio-queue'),
            audioQueueList: document.getElementById('audio-queue-list'),
            queueItemsCounter: document.getElementById('queue-items-counter'),
            clearAllQueueBtn: document.getElementById('clear-all-queue-btn'),


            // Reader Modal
            readerOverlay: document.getElementById('reader-modal-overlay'),
            closeReaderBtn: document.getElementById('close-reader-modal'),
            readerSource: document.getElementById('reader-source-badge'),
            readerDate: document.getElementById('reader-date-badge'),
            readerReadTime: document.getElementById('reader-readtime-badge'),
            readerTitle: document.getElementById('reader-title'),
            readerImage: document.getElementById('reader-image'),
            readerImageWrap: document.getElementById('reader-image-wrap'),
            readerAiSentiment: document.getElementById('reader-ai-sentiment'),
            readerAiTakeaways: document.getElementById('reader-ai-takeaways'),
            readerProse: document.getElementById('reader-prose'),
            readerListenBtn: document.getElementById('reader-listen-btn'),
            readerBookmarkBtn: document.getElementById('reader-bookmark-btn'),
            readerExternalLink: document.getElementById('reader-external-link'),
            fontDecreaseBtn: document.getElementById('font-decrease-btn'),
            fontIncreaseBtn: document.getElementById('font-increase-btn'),

            // Briefing Modal
            openBriefingBtn: document.getElementById('open-briefing-btn'),
            closeBriefingBtn: document.getElementById('close-briefing-modal'),
            briefingOverlay: document.getElementById('briefing-modal-overlay'),
            briefingPlayAudioBtn: document.getElementById('briefing-play-audio-btn'),
            briefingTimestamp: document.getElementById('briefing-timestamp'),
            briefingTextContent: document.getElementById('briefing-text-content'),
            copyBriefingBtn: document.getElementById('copy-briefing-btn'),

            // Copilot Drawer
            openCopilotBtn: document.getElementById('open-copilot-btn'),
            closeCopilotBtn: document.getElementById('close-copilot-drawer'),
            copilotOverlay: document.getElementById('copilot-drawer-overlay'),
            copilotChips: document.getElementById('copilot-chips'),
            copilotMessages: document.getElementById('copilot-messages'),
            copilotInput: document.getElementById('copilot-input'),
            sendCopilotBtn: document.getElementById('send-copilot-btn'),

            // Toast
            toastContainer: document.getElementById('toast-container'),

            // Market & Sentiment Telemetry
            marketTickersScroll: document.getElementById('market-tickers-scroll'),
            sentOptBar: document.getElementById('sent-opt-bar'),
            sentNeuBar: document.getElementById('sent-neu-bar'),
            sentCritBar: document.getElementById('sent-crit-bar'),
            sentimentScoreText: document.getElementById('sentiment-score-text')
        };

        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.setViewMode(this.viewMode);
        this.updateDateDisplay();
        this.startClock();
        this.updateBookmarksBadge();
        this.bindEvents();
        this.fetchNews();
        this.fetchMarkets();
        setInterval(() => this.fetchMarkets(), 60000);
        this.registerServiceWorker();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((reg) => {
                        console.log('✅ NewsMate Service Worker registered with scope:', reg.scope);
                    })
                    .catch((err) => {
                        console.warn('⚠️ Service Worker registration failed:', err);
                    });
            });
        }
    }

    /* ==========================================================================
       EVENT BINDINGS
       ========================================================================== */
    bindEvents() {
        // Theme toggle
        this.dom.themeToggleBtn.addEventListener('click', () => {
            const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(nextTheme);
            this.showToast(`Theme switched to ${nextTheme === 'dark' ? 'Midnight Intelligence' : 'Broadsheet Paper'}`);
        });

        // Brand click
        this.dom.brandHomeLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.category = 'general';
            this.country = 'world';
            this.searchQuery = '';
            this.dom.searchInput.value = '';
            this.dom.clearSearchBtn.style.display = 'none';
            this.syncActiveNavigation();
            this.fetchNews();
        });

        // Search Input
        this.dom.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.dom.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
            this.filterAndRenderArticles();
        });

        this.dom.clearSearchBtn.addEventListener('click', () => {
            this.dom.searchInput.value = '';
            this.searchQuery = '';
            this.dom.clearSearchBtn.style.display = 'none';
            this.filterAndRenderArticles();
            this.dom.searchInput.focus();
        });

        // Country Pills
        this.dom.countryPills.addEventListener('click', (e) => {
            const pill = e.target.closest('.country-pill');
            if (!pill) return;
            this.country = pill.getAttribute('data-country');
            this.syncActiveNavigation();
            this.fetchNews();
        });

        // Category Tabs
        this.dom.categoryTabs.addEventListener('click', (e) => {
            const tab = e.target.closest('.category-tab');
            if (!tab) return;
            this.category = tab.getAttribute('data-category');
            this.syncActiveNavigation();
            this.fetchNews();
        });

        // View Mode Switcher
        this.dom.viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.setViewMode(view);
            });
        });

        // Refresh Feed
        this.dom.refreshBtn.addEventListener('click', () => {
            this.dom.refreshIcon.classList.add('spinning');
            this.fetchNews().finally(() => {
                setTimeout(() => this.dom.refreshIcon.classList.remove('spinning'), 600);
            });
        });

        // Bookmarks Drawer triggers
        this.dom.openBookmarksBtn.addEventListener('click', () => this.openBookmarksDrawer());
        this.dom.closeBookmarksBtn.addEventListener('click', () => this.closeBookmarksDrawer());
        this.dom.bookmarksDrawerOverlay.addEventListener('click', (e) => {
            if (e.target === this.dom.bookmarksDrawerOverlay) this.closeBookmarksDrawer();
        });
        this.dom.clearAllBookmarksBtn.addEventListener('click', () => this.clearAllBookmarks());
        if (this.dom.exportMarkdownBtn) {
            this.dom.exportMarkdownBtn.addEventListener('click', () => this.exportBookmarksAsMarkdown());
        }
        if (this.dom.exportJsonBtn) {
            this.dom.exportJsonBtn.addEventListener('click', () => this.exportBookmarksAsJson());
        }
        if (this.dom.printBookmarksBtn) {
            this.dom.printBookmarksBtn.addEventListener('click', () => this.printBookmarks());
        }

        // Audio Controls & Queue
        this.dom.audioToggleBtn.addEventListener('click', () => this.toggleAudioPlayback());
        this.dom.audioStopBtn.addEventListener('click', () => this.stopAudio());
        this.dom.audioSpeedBtn.addEventListener('click', () => this.cycleAudioSpeed());
        this.dom.audioPrevBtn.addEventListener('click', () => this.playPrevQueuedStory());
        this.dom.audioNextBtn.addEventListener('click', () => this.playNextQueuedStory());
        this.dom.audioQueueBtn.addEventListener('click', () => this.openAudioQueueDrawer());
        this.dom.closeAudioQueueBtn.addEventListener('click', () => this.closeAudioQueueDrawer());
        this.dom.audioQueueOverlay.addEventListener('click', (e) => {
            if (e.target === this.dom.audioQueueOverlay) this.closeAudioQueueDrawer();
        });
        this.dom.clearAllQueueBtn.addEventListener('click', () => this.clearAudioQueue());

        // Focus Reader Modal
        this.dom.closeReaderBtn.addEventListener('click', () => this.closeReaderModal());

        this.dom.readerOverlay.addEventListener('click', (e) => {
            if (e.target === this.dom.readerOverlay) this.closeReaderModal();
        });
        this.dom.fontDecreaseBtn.addEventListener('click', () => this.adjustReaderFontSize(-0.1));
        this.dom.fontIncreaseBtn.addEventListener('click', () => this.adjustReaderFontSize(0.1));
        this.dom.readerListenBtn.addEventListener('click', () => {
            if (this.currentArticleForReader) {
                this.playArticleAudio(this.currentArticleForReader);
            }
        });
        this.dom.readerBookmarkBtn.addEventListener('click', () => {
            if (this.currentArticleForReader) {
                this.toggleBookmark(this.currentArticleForReader);
            }
        });

        // 60s Briefing Modal
        this.dom.openBriefingBtn.addEventListener('click', () => this.openBriefingModal());
        this.dom.closeBriefingBtn.addEventListener('click', () => this.closeBriefingModal());
        this.dom.briefingOverlay.addEventListener('click', (e) => {
            if (e.target === this.dom.briefingOverlay) this.closeBriefingModal();
        });
        this.dom.briefingPlayAudioBtn.addEventListener('click', () => {
            if (this.currentBriefingText) {
                this.speakText("NewsMate 60-Second Executive Briefing", this.currentBriefingText.replace(/[*#]/g, ''));
            }
        });
        this.dom.copyBriefingBtn.addEventListener('click', () => {
            if (this.currentBriefingText) {
                navigator.clipboard.writeText(this.currentBriefingText);
                this.showToast('Briefing copied to clipboard');
            }
        });

        // Copilot Drawer
        this.dom.openCopilotBtn.addEventListener('click', () => this.openCopilotDrawer());
        this.dom.closeCopilotBtn.addEventListener('click', () => this.closeCopilotDrawer());
        this.dom.copilotOverlay.addEventListener('click', (e) => {
            if (e.target === this.dom.copilotOverlay) this.closeCopilotDrawer();
        });
        this.dom.sendCopilotBtn.addEventListener('click', () => this.sendCopilotMessage());
        this.dom.copilotInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendCopilotMessage();
            }
        });
        this.dom.copilotInput.addEventListener('input', () => {
            this.dom.sendCopilotBtn.disabled = !this.dom.copilotInput.value.trim();
        });
        this.dom.copilotChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip-btn');
            if (chip) {
                const query = chip.getAttribute('data-query');
                this.dom.copilotInput.value = query;
                this.sendCopilotMessage();
            }
        });

        // Global Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== this.dom.searchInput && document.activeElement !== this.dom.copilotInput) {
                e.preventDefault();
                this.dom.searchInput.focus();
            }
            if (e.key === 'Escape') {
                this.closeReaderModal();
                this.closeBriefingModal();
                this.closeBookmarksDrawer();
                this.closeCopilotDrawer();
                this.closeAudioQueueDrawer();
            }

        });
    }

    /* ==========================================================================
       THEME & VIEW MODE
       ========================================================================== */
    applyTheme(theme) {
        this.theme = theme;
        this.dom.html.setAttribute('data-theme', theme);
        localStorage.setItem('newsmate_theme', theme);

        if (theme === 'dark') {
            this.dom.themeIcon.textContent = '☀️';
            this.dom.themeLabel.textContent = 'Paper';
        } else {
            this.dom.themeIcon.textContent = '🌙';
            this.dom.themeLabel.textContent = 'Midnight';
        }
    }

    setViewMode(mode) {
        this.viewMode = mode;
        localStorage.setItem('newsmate_view', mode);

        this.dom.viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
        });

        this.dom.newsGrid.className = `news-grid-container view-${mode}`;
    }

    syncActiveNavigation() {
        // Sync Country Pills
        document.querySelectorAll('.country-pill').forEach(pill => {
            pill.classList.toggle('active', pill.getAttribute('data-country') === this.country);
        });

        // Sync Category Tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-category') === this.category);
        });

        // Update Breadcrumb Labels
        const activeCountryPill = document.querySelector(`.country-pill[data-country="${this.country}"]`);
        this.dom.feedLocationBadge.textContent = activeCountryPill ? activeCountryPill.textContent : this.country.toUpperCase();

        const activeCatTab = document.querySelector(`.category-tab[data-category="${this.category}"]`);
        this.dom.feedCategoryBadge.textContent = activeCatTab ? activeCatTab.textContent.trim() : this.category;
    }

    updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
        this.dom.mastheadDate.textContent = now.toLocaleDateString('en-US', options);
    }

    startClock() {
        const updateClock = () => {
            const now = new Date();
            const utcTime = now.toUTCString().split(' ')[4];
            this.dom.wireClock.textContent = `${utcTime} UTC`;
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    /* ==========================================================================
       DATA FETCHING & RENDERING
       ========================================================================== */
    async fetchNews() {
        this.showLoadingSkeletons();

        try {
            const url = `/api/news?country=${encodeURIComponent(this.country)}&category=${encodeURIComponent(this.category)}`;
            const res = await fetch(url);
            
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || `Server returned ${res.status}`);
            }

            const data = await res.json();
            this.articles = (data.articles || []).filter(a => a.title && a.title !== '[Removed]');

            // Update status badge
            if (data.apiSource) {
                this.dom.wireStatusBadge.textContent = `Wire: ${data.apiSource.split(' ')[0]}`;
            }

            this.updateTicker(this.articles);
            this.computeAndRenderSentiment();
            this.filterAndRenderArticles();

        } catch (err) {
            console.error('Fetch error:', err);
            this.showErrorState(err.message);
        }
    }

    showLoadingSkeletons() {
        this.dom.heroSection.innerHTML = '';
        this.dom.newsGrid.innerHTML = Array(6).fill(0).map(() => `
            <div class="skeleton-card"></div>
        `).join('');
        this.dom.feedCountPill.textContent = 'Fetching...';
    }

    showErrorState(msg) {
        this.dom.heroSection.innerHTML = '';
        this.dom.newsGrid.innerHTML = `
            <div class="feed-state-message">
                <h3>Wire Signal Interrupted</h3>
                <p>${msg || 'Unable to load real-time headlines. Upstream news servers or local feeds could not be reached.'}</p>
                <button class="feed-retry-btn" onclick="window.newsApp.fetchNews()">
                    <span>↻ Retry Connection</span>
                </button>
            </div>
        `;
        this.dom.feedCountPill.textContent = '0 Stories';
    }

    updateTicker(articles) {
        if (!articles || articles.length === 0) return;
        const topHeadlines = articles.slice(0, 10);
        this.dom.wireTicker.innerHTML = topHeadlines.map((art, idx) => `
            <span class="ticker-item" onclick="window.newsApp.openReaderModal(${idx})">
                ● <strong>${this.escapeHtml(art.source?.name || 'Wire')}:</strong> ${this.escapeHtml(art.title)}
            </span>
        `).join('');
    }

    async fetchMarkets() {
        try {
            const res = await fetch('/api/markets');
            if (!res.ok) return;
            const data = await res.json();
            if (data.status === 'ok' && data.indices && this.dom.marketTickersScroll) {
                this.dom.marketTickersScroll.innerHTML = data.indices.map(idx => `
                    <span class="market-pill">
                        ${this.escapeHtml(idx.symbol)} <strong>${this.escapeHtml(idx.value)}</strong>
                        <span class="${idx.positive ? 'market-pos' : 'market-neg'}">${this.escapeHtml(idx.change)}</span>
                    </span>
                `).join('');
            }
        } catch (err) {
            console.warn('Market telemetry failed:', err);
        }
    }

    computeAndRenderSentiment() {
        if (!this.articles || this.articles.length === 0) return;

        let optCount = 0;
        let critCount = 0;
        let neuCount = 0;

        const optRegex = /surge|gain|growth|breakthrough|record|rally|triumph|innovat|success|jump|boost|rise|profit|soar/i;
        const critRegex = /crisis|war|fall|drop|decline|inflation|crash|threat|warn|probe|death|scandal|conflict|risk|loss|strike|disaster/i;

        this.articles.forEach(art => {
            const text = `${art.title} ${art.description || ''}`;
            if (optRegex.test(text)) {
                optCount++;
            } else if (critRegex.test(text)) {
                critCount++;
            } else {
                neuCount++;
            }
        });

        const total = this.articles.length;
        const optPct = Math.round((optCount / total) * 100);
        const critPct = Math.round((critCount / total) * 100);
        const neuPct = Math.max(0, 100 - optPct - critPct);

        if (this.dom.sentOptBar) this.dom.sentOptBar.style.width = `${optPct}%`;
        if (this.dom.sentNeuBar) this.dom.sentNeuBar.style.width = `${neuPct}%`;
        if (this.dom.sentCritBar) this.dom.sentCritBar.style.width = `${critPct}%`;

        let dominant = 'Neutral';
        if (optPct > 40 && optPct > critPct) dominant = 'Bullish';
        else if (critPct > 40 && critPct > optPct) dominant = 'Critical';
        else dominant = 'Balanced';

        if (this.dom.sentimentScoreText) {
            this.dom.sentimentScoreText.textContent = `${dominant} (${optPct}% + / ${critPct}% -)`;
        }
    }

    filterAndRenderArticles() {
        if (this.searchQuery) {
            this.filteredArticles = this.articles.filter(a => {
                const title = (a.title || '').toLowerCase();
                const desc = (a.description || '').toLowerCase();
                const src = (a.source?.name || '').toLowerCase();
                return title.includes(this.searchQuery) || desc.includes(this.searchQuery) || src.includes(this.searchQuery);
            });
        } else {
            this.filteredArticles = [...this.articles];
        }

        this.dom.feedCountPill.textContent = `${this.filteredArticles.length} Stories`;

        if (this.filteredArticles.length === 0) {
            this.dom.heroSection.innerHTML = '';
            this.dom.newsGrid.innerHTML = `
                <div class="feed-state-message">
                    <h3>No Dispatches Found</h3>
                    <p>No headlines matched your search criteria: "${this.escapeHtml(this.searchQuery)}".</p>
                </div>
            `;
            return;
        }

        // Render Hero Spotlight (Top 1 story if in Grid mode and no search query active)
        if (this.viewMode === 'grid' && !this.searchQuery && this.filteredArticles.length > 0) {
            const heroStory = this.filteredArticles[0];
            this.renderHeroSpotlight(heroStory, 0);
            this.renderGrid(this.filteredArticles.slice(1), 1);
        } else {
            this.dom.heroSection.innerHTML = '';
            this.renderGrid(this.filteredArticles, 0);
        }
    }

    renderHeroSpotlight(article, globalIndex) {
        const timeAgo = this.formatTimeAgo(article.publishedAt);
        const imageUrl = article.urlToImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80';
        const source = article.source?.name || 'Global Wire';
        const isBookmarked = this.isBookmarked(article);

        this.dom.heroSection.innerHTML = `
            <article class="hero-lead-card">
                <div class="hero-media-wrap" onclick="window.newsApp.openReaderModal(${globalIndex})">
                    <img src="${imageUrl}" alt="${this.escapeHtml(article.title)}" class="hero-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1000&auto=format&fit=crop&q=80'">
                    <div class="hero-badge-overlay">
                        <span class="hero-tag">LEAD DISPATCH</span>
                    </div>
                </div>
                <div class="hero-content">
                    <div>
                        <div class="hero-meta">
                            <span class="hero-source">${this.escapeHtml(source)}</span>
                            <span>•</span>
                            <span class="hero-time">${timeAgo}</span>
                        </div>
                        <h2 class="hero-title" onclick="window.newsApp.openReaderModal(${globalIndex})">
                            ${this.escapeHtml(article.title)}
                        </h2>
                        <p class="hero-desc">
                            ${this.escapeHtml(article.description || 'Full journalistic dispatch available in reader view.')}
                        </p>
                    </div>

                    <div class="hero-actions">
                        <button class="tool-action-btn" onclick="window.newsApp.playArticleAudioByIndex(${globalIndex})">
                            <span>🔊 Listen</span>
                        </button>
                        <button class="tool-action-btn" title="Add to Drive-Time Audio Queue" onclick="window.newsApp.addToAudioQueueByIndex(${globalIndex})">
                            <span>+🎧 Queue</span>
                        </button>
                        <button class="tool-action-btn ai-btn" onclick="window.newsApp.openReaderModal(${globalIndex})">
                            <span>⚡ AI Summary</span>
                        </button>
                        <button class="tool-action-btn ${isBookmarked ? 'active' : ''}" onclick="window.newsApp.toggleBookmarkByIndex(${globalIndex})">
                            <span>${isBookmarked ? '🔖 Saved' : '🔖 Bookmark'}</span>
                        </button>
                        <button class="tool-action-btn" onclick="window.newsApp.openReaderModal(${globalIndex})">
                            <span>📖 Focus Reader</span>
                        </button>
                    </div>
                </div>
            </article>
        `;
    }

    renderGrid(articles, indexOffset) {
        this.dom.newsGrid.innerHTML = articles.map((article, idx) => {
            const globalIndex = idx + indexOffset;
            const timeAgo = this.formatTimeAgo(article.publishedAt);
            const imageUrl = article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80';
            const source = article.source?.name || 'Wire';
            const isBookmarked = this.isBookmarked(article);

            return `
                <article class="news-card" data-index="${globalIndex}">
                    <div class="card-media" onclick="window.newsApp.openReaderModal(${globalIndex})">
                        <img src="${imageUrl}" alt="${this.escapeHtml(article.title)}" class="card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80'">
                        <span class="card-category-tag">${this.escapeHtml(source)}</span>
                    </div>
                    <div class="card-body">
                        <div class="card-meta">
                            <span class="card-source">${this.escapeHtml(source)}</span>
                            <span class="card-time">${timeAgo}</span>
                        </div>
                        <h3 class="card-title" onclick="window.newsApp.openReaderModal(${globalIndex})">
                            ${this.escapeHtml(article.title)}
                        </h3>
                        <p class="card-desc">
                            ${this.escapeHtml(article.description || 'Click focus reader to inspect the full dispatches and analytical context.')}
                        </p>

                        <!-- Inline AI Takeaway Drawer -->
                        <div class="card-ai-drawer" id="ai-drawer-${globalIndex}">
                            <div class="card-ai-drawer-header">
                                <span>⚡ 3-POINT EXECUTIVE TAKEAWAYS</span>
                                <span class="ai-sentiment-mini" id="ai-sent-${globalIndex}">Analyzing...</span>
                            </div>
                            <ul class="card-ai-bullets" id="ai-bullets-${globalIndex}">
                                <li>Loading telemetry...</li>
                            </ul>
                        </div>

                        <div class="card-footer-actions">
                            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                                <button class="tool-action-btn" title="Listen with Text-to-Speech" onclick="window.newsApp.playArticleAudioByIndex(${globalIndex})">
                                    <span>🔊 Listen</span>
                                </button>
                                <button class="tool-action-btn" title="Add to Audio Queue" onclick="window.newsApp.addToAudioQueueByIndex(${globalIndex})">
                                    <span>+🎧</span>
                                </button>
                                <button class="tool-action-btn ai-btn" title="Generate 3-Bullet AI Takeaways" onclick="window.newsApp.toggleCardAiSummary(${globalIndex})">
                                    <span>⚡ TL;DR</span>
                                </button>
                            </div>
                            <div style="display: flex; gap: 0.35rem;">
                                <button class="tool-action-btn ${isBookmarked ? 'active' : ''}" title="Save to Reading List" onclick="window.newsApp.toggleBookmarkByIndex(${globalIndex})">
                                    <span>${isBookmarked ? '🔖' : '🔖'}</span>
                                </button>
                                <button class="tool-action-btn" title="Open Focus Reader" onclick="window.newsApp.openReaderModal(${globalIndex})">
                                    <span>📖 Read</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </article>
            `;
        }).join('');
    }


    /* ==========================================================================
       AI EXECUTIVE SUMMARY (IN-CARD & MODAL)
       ========================================================================== */
    async toggleCardAiSummary(index) {
        const drawer = document.getElementById(`ai-drawer-${index}`);
        const bulletsContainer = document.getElementById(`ai-bullets-${index}`);
        const sentimentBadge = document.getElementById(`ai-sent-${index}`);
        const article = this.filteredArticles[index];

        if (!drawer || !article) return;

        if (drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            return;
        }

        drawer.classList.add('open');

        // Check if already fetched
        if (drawer.getAttribute('data-loaded') === 'true') return;

        try {
            const res = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: article.title,
                    description: article.description
                })
            });
            const data = await res.json();
            const summary = data.summary;

            sentimentBadge.textContent = summary.sentiment || 'Verified';
            bulletsContainer.innerHTML = (summary.takeaways || []).map(t => `<li>${this.escapeHtml(t)}</li>`).join('');
            drawer.setAttribute('data-loaded', 'true');
        } catch (err) {
            bulletsContainer.innerHTML = `<li>${this.escapeHtml(article.description || 'Key analytical context available.')}</li>`;
            sentimentBadge.textContent = 'Direct Feed';
        }
    }

    /* ==========================================================================
       FOCUS READER MODAL
       ========================================================================== */
    async openReaderModal(index) {
        const article = this.filteredArticles[index];
        if (!article) return;

        this.currentArticleForReader = article;

        this.dom.readerTitle.textContent = article.title;
        this.dom.readerSource.textContent = article.source?.name || 'Global Wire';
        this.dom.readerDate.textContent = this.formatTimeAgo(article.publishedAt);
        this.dom.readerExternalLink.href = article.url || '#';

        // Calculate reading time
        const wordCount = ((article.title || '') + ' ' + (article.description || '')).split(/\s+/).length;
        const readMin = Math.max(1, Math.ceil(wordCount / 65));
        this.dom.readerReadTime.textContent = `${readMin} min read`;

        // Image
        if (article.urlToImage) {
            this.dom.readerImage.src = article.urlToImage;
            this.dom.readerImageWrap.style.display = 'block';
        } else {
            this.dom.readerImageWrap.style.display = 'none';
        }

        // Bookmark button text
        const isSaved = this.isBookmarked(article);
        this.dom.readerBookmarkBtn.innerHTML = `<span>${isSaved ? '🔖 Remove Bookmark' : '🔖 Bookmark Story'}</span>`;

        // Prose text formatting
        const desc = article.description || 'Full coverage is being monitored by our global correspondents.';
        this.dom.readerProse.innerHTML = `
            <p id="reader-summary-lead">${this.escapeHtml(desc)}</p>
            <div id="reader-extraction-container" style="margin-top: 1.25rem;">
                <div class="extractor-status-bar" id="extractor-status-pill">
                    <span class="extractor-spinner">↻</span>
                    <span>Extracting full in-depth article text from wire...</span>
                </div>
            </div>
            <p style="margin-top: 1.5rem; color: var(--text-muted); font-size: 0.9rem; border-top: 1px solid var(--border-hairline); padding-top: 1rem;">
                <em>This dispatch was filed via authenticated news syndication. Access the original publication via the external link below.</em>
            </p>
        `;

        // Fetch full article text if URL is valid
        if (article.url && article.url.startsWith('http')) {
            fetch(`/api/article/extract?url=${encodeURIComponent(article.url)}`)
                .then(res => res.json())
                .then(extracted => {
                    const statusPill = document.getElementById('extractor-status-pill');
                    const extractContainer = document.getElementById('reader-extraction-container');
                    
                    if (extracted.status === 'ok' && extracted.paragraphs && extracted.paragraphs.length > 0) {
                        if (statusPill) statusPill.remove();
                        this.dom.readerReadTime.textContent = `${extracted.readTimeMinutes} min read • ${extracted.wordCount} words`;
                        if (extracted.byline) {
                            this.dom.readerDate.textContent += ` • By ${extracted.byline}`;
                        }
                        
                        if (extractContainer) {
                            extractContainer.innerHTML = `
                                <div class="full-article-badge">✓ Full In-Depth Story Extracted (${extracted.paragraphs.length} Paragraphs)</div>
                                ${extracted.paragraphs.map(p => `<p style="margin-bottom: 1.25rem;">${this.escapeHtml(p)}</p>`).join('')}
                            `;
                        }

                        // Attach full text to article for Audio TTS reader
                        article.fullProse = extracted.paragraphs.join('. ');
                    } else if (statusPill) {
                        statusPill.innerHTML = `<span>✓ Summary wire ready. Full external publication linked below.</span>`;
                    }
                })
                .catch(() => {
                    const statusPill = document.getElementById('extractor-status-pill');
                    if (statusPill) statusPill.remove();
                });
        }

        // AI Summary block inside Reader
        this.dom.readerAiTakeaways.innerHTML = '<li>Analyzing intelligence telemetry...</li>';
        this.dom.readerAiSentiment.textContent = 'Processing';

        this.dom.readerOverlay.classList.remove('hidden');


        // Fetch AI Takeaways
        try {
            const res = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: article.title,
                    description: article.description
                })
            });
            const data = await res.json();
            const summary = data.summary;

            this.dom.readerAiSentiment.textContent = summary.sentiment || 'Developing';
            this.dom.readerAiTakeaways.innerHTML = (summary.takeaways || []).map(t => `<li>${this.escapeHtml(t)}</li>`).join('');
        } catch (err) {
            this.dom.readerAiSentiment.textContent = 'Verified Wire';
            this.dom.readerAiTakeaways.innerHTML = `
                <li>${this.escapeHtml(article.title)}</li>
                <li>Primary dispatches corroborate ongoing coverage across international bureaus.</li>
            `;
        }
    }

    closeReaderModal() {
        this.dom.readerOverlay.classList.add('hidden');
        this.currentArticleForReader = null;
    }

    adjustReaderFontSize(delta) {
        this.readerFontSize = Math.min(1.8, Math.max(0.9, this.readerFontSize + delta));
        this.dom.readerProse.style.fontSize = `${this.readerFontSize}rem`;
    }

    /* ==========================================================================
       60-SECOND EXECUTIVE BRIEFING
       ========================================================================== */
    async openBriefingModal() {
        this.dom.briefingOverlay.classList.remove('hidden');
        this.dom.briefingTextContent.innerHTML = '<div class="briefing-skeleton">Synthesizing top dispatches into 60s morning intelligence memo...</div>';
        this.dom.briefingTimestamp.textContent = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        try {
            const res = await fetch('/api/ai/briefing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ articles: this.articles.slice(0, 6) })
            });
            const data = await res.json();
            this.currentBriefingText = data.briefing || 'No briefing available.';
            
            // Format Markdown to clean HTML
            this.dom.briefingTextContent.innerHTML = this.renderMarkdown(this.currentBriefingText);
        } catch (err) {
            this.dom.briefingTextContent.innerHTML = '<p>Unable to generate morning briefing at this time. Please retry momentarily.</p>';
        }
    }

    closeBriefingModal() {
        this.dom.briefingOverlay.classList.add('hidden');
    }

    /* ==========================================================================
       AUDIO TEXT-TO-SPEECH (TTS) ENGINE
       ========================================================================== */
    playArticleAudioByIndex(index) {
        const article = this.filteredArticles[index];
        if (article) this.playArticleAudio(article);
    }

    playArticleAudio(article) {
        const prose = article.fullProse || article.description || 'Full report on the wire.';
        const textToRead = `${article.title}. From ${article.source?.name || 'the wire'}. ${prose}`;
        this.speakText(article.title, textToRead);
    }


    speakText(title, text, onEndCallback = null) {
        if (!('speechSynthesis' in window)) {
            this.showToast('Speech synthesis not supported by this browser');
            return;
        }

        // Stop any current audio
        this.audioSpeech.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.audioSpeech.rate;
        utterance.pitch = 1.0;

        // Pick a quality voice if available
        const voices = this.audioSpeech.synth.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => {
            this.audioSpeech.isPlaying = true;
            this.audioSpeech.isPaused = false;
            this.audioSpeech.currentTitle = title;
            this.dom.audioPlayerTitle.textContent = title;
            this.dom.audioPlayerBar.classList.remove('hidden');
            this.dom.audioToggleBtn.textContent = '⏸';
            this.dom.audioWaves.style.opacity = '1';
            this.updateAudioQueueUI();
        };

        utterance.onend = () => {
            this.audioSpeech.isPlaying = false;
            this.audioSpeech.isPaused = false;
            if (typeof onEndCallback === 'function') {
                onEndCallback();
            } else {
                this.dom.audioPlayerBar.classList.add('hidden');
            }
        };

        utterance.onerror = (e) => {
            console.error('Speech error:', e);
            this.audioSpeech.isPlaying = false;
            this.dom.audioPlayerBar.classList.add('hidden');
        };

        this.audioSpeech.utterance = utterance;
        this.audioSpeech.synth.speak(utterance);
    }

    toggleAudioPlayback() {
        if (!this.audioSpeech.synth.speaking) return;

        if (this.audioSpeech.synth.paused) {
            this.audioSpeech.synth.resume();
            this.audioSpeech.isPaused = false;
            this.dom.audioToggleBtn.textContent = '⏸';
            this.dom.audioWaves.style.opacity = '1';
        } else {
            this.audioSpeech.synth.pause();
            this.audioSpeech.isPaused = true;
            this.dom.audioToggleBtn.textContent = '▶';
            this.dom.audioWaves.style.opacity = '0.3';
        }
    }

    stopAudio() {
        if (this.audioSpeech.synth) {
            this.audioSpeech.synth.cancel();
        }
        this.audioSpeech.isPlaying = false;
        this.audioSpeech.isPaused = false;
        this.dom.audioPlayerBar.classList.add('hidden');
        this.updateAudioQueueUI();
    }

    cycleAudioSpeed() {
        const rates = [1.0, 1.25, 1.5, 2.0];
        const currentIndex = rates.indexOf(this.audioSpeech.rate);
        const nextRate = rates[(currentIndex + 1) % rates.length];
        this.audioSpeech.rate = nextRate;
        this.dom.audioSpeedBtn.textContent = `${nextRate}x`;
        this.showToast(`Speech rate set to ${nextRate}x`);
    }

    /* ==========================================================================
       DRIVE-TIME AUDIO PLAYLIST & QUEUE ENGINE
       ========================================================================== */
    addToAudioQueueByIndex(index) {
        const article = this.filteredArticles[index];
        if (article) this.addToAudioQueue(article);
    }

    addToAudioQueue(article) {
        this.audioQueue.push(article);
        this.updateAudioQueueUI();
        this.showToast(`Added to audio queue (${this.audioQueue.length} stories in playlist)`);

        // If not playing, start playing from current track
        if (!this.audioSpeech.isPlaying) {
            this.audioQueueIndex = this.audioQueue.length - 1;
            this.playQueuedStory(this.audioQueueIndex);
        }
    }

    playQueuedStory(index) {
        if (index < 0 || index >= this.audioQueue.length) return;
        this.audioQueueIndex = index;
        const article = this.audioQueue[index];
        const prose = article.fullProse || article.description || 'Full report on the wire.';
        const queuePrefix = `Story ${index + 1} of ${this.audioQueue.length}.`;
        const textToRead = `${queuePrefix} ${article.title}. From ${article.source?.name || 'the wire'}. ${prose}`;

        if (this.dom.audioPlayerStatus) {
            this.dom.audioPlayerStatus.textContent = `QUEUE • ${index + 1} OF ${this.audioQueue.length}`;
        }

        this.speakText(article.title, textToRead, () => {
            // Auto advance when track completes
            if (this.audioQueue.length > 0 && this.audioQueueIndex < this.audioQueue.length - 1) {
                this.playQueuedStory(this.audioQueueIndex + 1);
            } else {
                this.stopAudio();
                this.showToast('Finished listening to audio playlist');
            }
        });
    }

    playNextQueuedStory() {
        if (this.audioQueue.length === 0) return;
        if (this.audioQueueIndex < this.audioQueue.length - 1) {
            this.playQueuedStory(this.audioQueueIndex + 1);
        } else {
            this.showToast('Already at the last story in playlist');
        }
    }

    playPrevQueuedStory() {
        if (this.audioQueue.length === 0) return;
        if (this.audioQueueIndex > 0) {
            this.playQueuedStory(this.audioQueueIndex - 1);
        } else {
            this.showToast('Already at the first story in playlist');
        }
    }

    openAudioQueueDrawer() {
        this.renderAudioQueueList();
        this.dom.audioQueueOverlay.classList.remove('hidden');
    }

    closeAudioQueueDrawer() {
        this.dom.audioQueueOverlay.classList.add('hidden');
    }

    clearAudioQueue() {
        this.audioQueue = [];
        this.audioQueueIndex = 0;
        this.updateAudioQueueUI();
        this.renderAudioQueueList();
        this.stopAudio();
        this.showToast('Audio playlist cleared');
    }

    updateAudioQueueUI() {
        const count = this.audioQueue.length;
        if (this.dom.audioQueueBadge) {
            this.dom.audioQueueBadge.textContent = count;
        }
        if (this.dom.queueItemsCounter) {
            this.dom.queueItemsCounter.textContent = `${count} stor${count === 1 ? 'y' : 'ies'} queued`;
        }
        if (count > 0 && this.audioSpeech.isPlaying) {
            this.dom.audioQueueIndicator.textContent = `• Queue (${this.audioQueueIndex + 1}/${count})`;
        } else {
            this.dom.audioQueueIndicator.textContent = '';
        }
    }

    renderAudioQueueList() {
        if (this.audioQueue.length === 0) {
            this.dom.audioQueueList.innerHTML = `
                <div class="empty-drawer-state">
                    <span class="empty-icon">🎧</span>
                    <p>Your audio playlist is empty.</p>
                    <span class="empty-hint">Click the "+🎧" button on any card to queue stories for continuous listening.</span>
                </div>
            `;
            return;
        }

        this.dom.audioQueueList.innerHTML = this.audioQueue.map((art, idx) => {
            const isCurrent = idx === this.audioQueueIndex && this.audioSpeech.isPlaying;
            return `
                <div class="bookmark-item-card" style="${isCurrent ? 'border-color: var(--accent-gold); background: var(--bg-surface-elevated);' : ''}">
                    <div class="bm-header">
                        <span>#${idx + 1} • ${this.escapeHtml(art.source?.name || 'Wire')}</span>
                        <span style="color: var(--accent-gold);">${isCurrent ? '▶ Now Playing' : ''}</span>
                    </div>
                    <h4 class="bm-title" onclick="window.newsApp.playQueuedStory(${idx})">
                        ${this.escapeHtml(art.title)}
                    </h4>
                    <div class="bm-actions">
                        <button class="bm-btn" onclick="window.newsApp.playQueuedStory(${idx})">▶ Play</button>
                        <button class="bm-btn" onclick="window.newsApp.removeFromAudioQueue(${idx})">Remove</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    removeFromAudioQueue(index) {
        this.audioQueue.splice(index, 1);
        if (this.audioQueueIndex >= this.audioQueue.length) {
            this.audioQueueIndex = Math.max(0, this.audioQueue.length - 1);
        }
        this.updateAudioQueueUI();
        this.renderAudioQueueList();
    }


    /* ==========================================================================
       BOOKMARKS SYSTEM
       ========================================================================== */
    toggleBookmarkByIndex(index) {
        const article = this.filteredArticles[index];
        if (article) this.toggleBookmark(article);
    }

    toggleBookmark(article) {
        const existingIdx = this.bookmarks.findIndex(b => b.title === article.title);

        if (existingIdx >= 0) {
            this.bookmarks.splice(existingIdx, 1);
            this.showToast('Article removed from bookmarks');
        } else {
            this.bookmarks.unshift({
                title: article.title,
                url: article.url,
                urlToImage: article.urlToImage,
                description: article.description,
                publishedAt: article.publishedAt,
                source: article.source,
                savedAt: new Date().toISOString()
            });
            this.showToast('Article saved to reading list');
        }

        localStorage.setItem('newsmate_bookmarks', JSON.stringify(this.bookmarks));
        this.updateBookmarksBadge();
        this.renderBookmarksList();

        // Re-render articles to update active state
        this.filterAndRenderArticles();
    }

    isBookmarked(article) {
        return this.bookmarks.some(b => b.title === article.title);
    }

    updateBookmarksBadge() {
        const count = this.bookmarks.length;
        if (this.dom.bookmarksCount) {
            this.dom.bookmarksCount.textContent = count;
        }
        if (this.dom.savedItemsCounter) {
            this.dom.savedItemsCounter.textContent = `${count} stor${count === 1 ? 'y' : 'ies'} saved locally`;
        }
    }

    openBookmarksDrawer() {
        this.renderBookmarksList();
        this.dom.bookmarksDrawerOverlay.classList.remove('hidden');
    }

    closeBookmarksDrawer() {
        this.dom.bookmarksDrawerOverlay.classList.add('hidden');
    }

    clearAllBookmarks() {
        if (this.bookmarks.length === 0) return;
        if (confirm('Clear all bookmarked stories?')) {
            this.bookmarks = [];
            localStorage.setItem('newsmate_bookmarks', JSON.stringify([]));
            this.updateBookmarksBadge();
            this.renderBookmarksList();
            this.filterAndRenderArticles();
            this.showToast('Reading list cleared');
        }
    }

    renderBookmarksList() {
        if (this.bookmarks.length === 0) {
            this.dom.bookmarksList.innerHTML = `
                <div class="empty-drawer-state">
                    <span class="empty-icon">📰</span>
                    <p>No bookmarked stories yet.</p>
                    <span class="empty-hint">Click the 🔖 icon on any card to save stories for offline reading.</span>
                </div>
            `;
            return;
        }

        this.dom.bookmarksList.innerHTML = this.bookmarks.map((bm, idx) => `
            <div class="bookmark-item-card">
                <div class="bm-header">
                    <span>${this.escapeHtml(bm.source?.name || 'Wire')}</span>
                    <span>${this.formatTimeAgo(bm.publishedAt)}</span>
                </div>
                <h4 class="bm-title" onclick="window.newsApp.openBookmarkInReader(${idx})">
                    ${this.escapeHtml(bm.title)}
                </h4>
                <div class="bm-actions">
                    <button class="bm-btn" onclick="window.newsApp.openBookmarkInReader(${idx})">Read Focus</button>
                    <button class="bm-btn" onclick="window.newsApp.removeBookmark(${idx})">Remove</button>
                </div>
            </div>
        `).join('');
    }

    openBookmarkInReader(idx) {
        const bm = this.bookmarks[idx];
        if (!bm) return;
        this.closeBookmarksDrawer();
        this.filteredArticles.unshift(bm);
        this.openReaderModal(0);
    }

    removeBookmark(idx) {
        this.bookmarks.splice(idx, 1);
        localStorage.setItem('newsmate_bookmarks', JSON.stringify(this.bookmarks));
        this.updateBookmarksBadge();
        this.renderBookmarksList();
        this.filterAndRenderArticles();
    }

    exportBookmarksAsMarkdown() {
        if (this.bookmarks.length === 0) {
            this.showToast('No bookmarked stories to export');
            return;
        }

        const dateStr = new Date().toISOString().split('T')[0];
        let md = `# 📰 NewsMate Intelligence — Reading List\n`;
        md += `*Exported on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • ${this.bookmarks.length} Saved Dispatches*\n\n`;
        md += `---\n\n`;

        this.bookmarks.forEach((bm, i) => {
            md += `### ${i + 1}. [${bm.title}](${bm.url})\n`;
            md += `- **Source**: ${bm.source?.name || 'Wire'}\n`;
            if (bm.publishedAt) md += `- **Published**: ${new Date(bm.publishedAt).toLocaleString()}\n`;
            if (bm.savedAt) md += `- **Archived**: ${new Date(bm.savedAt).toLocaleString()}\n`;
            if (bm.description) md += `\n> ${bm.description.trim()}\n`;
            md += `\n[Read Original Article](${bm.url})\n\n---\n\n`;
        });

        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsmate-reading-list-${dateStr}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast(`Exported ${this.bookmarks.length} stories as Markdown`);
    }

    exportBookmarksAsJson() {
        if (this.bookmarks.length === 0) {
            this.showToast('No bookmarked stories to export');
            return;
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const payload = {
            application: 'NewsMate Intelligence Chronicle',
            exportedAt: new Date().toISOString(),
            totalStories: this.bookmarks.length,
            bookmarks: this.bookmarks
        };

        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsmate-bookmarks-${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showToast(`Exported ${this.bookmarks.length} stories as JSON`);
    }

    printBookmarks() {
        if (this.bookmarks.length === 0) {
            this.showToast('No bookmarked stories to print');
            return;
        }
        this.showToast('Opening print preview...');
        setTimeout(() => window.print(), 200);
    }

    /* ==========================================================================
       INTEL AI COPILOT
       ========================================================================== */
    openCopilotDrawer() {
        this.dom.copilotOverlay.classList.remove('hidden');
        this.dom.copilotInput.focus();
    }

    closeCopilotDrawer() {
        this.dom.copilotOverlay.classList.add('hidden');
    }

    async sendCopilotMessage() {
        const message = this.dom.copilotInput.value.trim();
        if (!message) return;

        // Append user bubble
        this.appendCopilotMessage(message, 'user');
        this.dom.copilotInput.value = '';
        this.dom.sendCopilotBtn.disabled = true;

        // Append bot typing placeholder
        const typingId = 'copilot-typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.className = 'copilot-msg bot';
        typingDiv.id = typingId;
        typingDiv.innerHTML = `
            <div class="msg-avatar">⚡</div>
            <div class="msg-bubble">
                <div class="msg-text">Analyzing intelligence wire telemetry...</div>
            </div>
        `;
        this.dom.copilotMessages.appendChild(typingDiv);
        this.dom.copilotMessages.scrollTop = this.dom.copilotMessages.scrollHeight;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });
            const data = await res.json();
            
            const typingElem = document.getElementById(typingId);
            if (typingElem) typingElem.remove();

            this.appendCopilotMessage(data.response || 'No response received from intelligence servers.', 'bot');
        } catch (err) {
            const typingElem = document.getElementById(typingId);
            if (typingElem) typingElem.remove();
            this.appendCopilotMessage('Connection glitch with newsroom AI. Please retry.', 'bot');
        }
    }

    appendCopilotMessage(content, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `copilot-msg ${sender}`;
        
        const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const rendered = sender === 'bot' ? this.renderMarkdown(content) : this.escapeHtml(content);

        msgDiv.innerHTML = `
            <div class="msg-avatar">${sender === 'bot' ? '⚡' : '👤'}</div>
            <div class="msg-bubble">
                <div class="msg-text">${rendered}</div>
                <span class="msg-time">${now}</span>
            </div>
        `;

        this.dom.copilotMessages.appendChild(msgDiv);
        this.dom.copilotMessages.scrollTop = this.dom.copilotMessages.scrollHeight;
    }

    /* ==========================================================================
       UTILITIES & HELPERS
       ========================================================================== */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        this.dom.toastContainer.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    formatTimeAgo(dateString) {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = Math.abs(now - date);
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return `${diffDays}d ago`;
    }

    escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    renderMarkdown(text) {
        if (!text) return '';
        let html = this.escapeHtml(text);
        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Headers
        html = html.replace(/### (.*?)\n/g, '<h4 style="margin: 0.6rem 0 0.3rem 0; font-family: var(--font-serif); font-size: 1.1rem;">$1</h4>');
        // Bullets
        html = html.replace(/• (.*?)\n/g, '<li>$1</li>');
        html = html.replace(/- (.*?)\n/g, '<li>$1</li>');
        // Wrap newlines
        html = html.replace(/\n\n/g, '<br><br>');
        return html;
    }
}

// Instantiate globally
document.addEventListener('DOMContentLoaded', () => {
    window.newsApp = new NewsMateApp();
});