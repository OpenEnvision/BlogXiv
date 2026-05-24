// Explore Page JavaScript
class ExplorePage {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.blogs = [];
        this.filteredBlogs = [];
        this.displayedBlogs = 12; // Show 12 blogs initially
        this.blogsPerPage = 12; // Load 12 more blogs each time
        this.currentView = 'grid'; // 'grid' or 'list'
        this.searchQuery = '';
        this.currentFilters = {
            category: 'all',
            author: 'all',
            sort: 'newest',
            timeRange: 'all'
        };
        this.categoryTaxonomy = [
            {
                name: 'Multimodal Model',
                description: 'Vision-language, audio-language, OCR, document AI, and unified multimodal model research'
            },
            {
                name: 'Visual Generation',
                description: 'Image, video, editing, 3D generation, and controllable visual synthesis research'
            },
            {
                name: 'World Model',
                description: 'Physical simulation, video world models, autonomous driving worlds, robotics/VLA, and model-based planning research'
            },
            {
                name: 'AI Agents',
                description: 'Tool-using agents, coding agents, browser agents, agent infrastructure, and long-horizon agent systems'
            },
            {
                name: 'LLM & MLLM',
                description: 'Language reasoning, post-training, hallucination, RAG, and multimodal LLM analysis'
            },
            {
                name: 'Foundation Model',
                description: 'Open and frontier foundation models, architecture, training recipes, and ecosystem analysis'
            },
            {
                name: 'Efficient AI',
                description: 'Inference, training, serving, kernels, optimizers, compression, and small-model systems'
            },
            {
                name: 'Trustworthy AI',
                description: 'Alignment, interpretability, hallucination, red teaming, auditing, safety evals, and secure AI systems'
            },
            {
                name: 'Research Craft',
                description: 'Evaluation, AI engineering practice, benchmark design, product evals, and researcher workflows'
            }
        ];
        this.categoryAliases = {
            'all': 'all',
            'multimodal-model': 'Multimodal Model',
            'mllm': 'LLM & MLLM',
            'llm': 'LLM & MLLM',
            'llm-mllm': 'LLM & MLLM',
            'visual-generation': 'Visual Generation',
            'world-model': 'World Model',
            'ai-agents': 'AI Agents',
            'agent': 'AI Agents',
            'agents': 'AI Agents',
            'foundation-model': 'Foundation Model',
            'efficient-ai': 'Efficient AI',
            'trustworthy-ai': 'Trustworthy AI',
            'trustworthy': 'Trustworthy AI',
            'ai-safety': 'Trustworthy AI',
            'safety': 'Trustworthy AI',
            'research-craft': 'Research Craft',
            'how-to-become-a-researcher': 'Research Craft',
            'gen-ai': 'Foundation Model',
            'generative-ai': 'Visual Generation'
        };
        
        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadSampleBlogs();
        this.populateCategoryFilter();
        this.loadFiltersFromURL();
        this.applyFilters();
        this.renderBlogs();
        this.updateStats();
    }
    
    getCategoryMeta(categoryName) {
        return this.categoryTaxonomy.find(category => category.name === categoryName) || {
            name: categoryName,
            description: `Curated ${categoryName.toLowerCase()} research articles, notes, and field reports`
        };
    }

    getCategoryOrder(categoryName) {
        const index = this.categoryTaxonomy.findIndex(category => category.name === categoryName);
        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    }

    normalizeCategory(value) {
        if (!value) return 'all';

        const decoded = decodeURIComponent(value).trim();
        const exact = this.categoryTaxonomy.find(category => category.name === decoded);
        if (exact) return exact.name;

        const aliasKey = decoded.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '').replace(/--+/g, '-');
        return this.categoryAliases[aliasKey] || decoded;
    }

    // Load filters from URL parameters
    loadFiltersFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const author = urlParams.get('author');
        const sort = urlParams.get('sort');
        const timeRange = urlParams.get('time');
        
        if (category && category !== 'all') {
            this.currentFilters.category = this.normalizeCategory(category);
            
            // Update the category filter dropdown
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = this.currentFilters.category;
            }
        }

        if (author && author !== 'all') {
            this.currentFilters.author = author;
        }

        if (sort && ['newest', 'oldest', 'title', 'source'].includes(sort)) {
            this.currentFilters.sort = sort;
            const sortFilter = document.getElementById('sortFilter');
            if (sortFilter) sortFilter.value = sort;
        }

        if (timeRange && ['all', '2026', '2025', '2024', 'week', 'month', 'year'].includes(timeRange)) {
            this.currentFilters.timeRange = timeRange;
            const timeFilter = document.getElementById('timeFilter');
            if (timeFilter) timeFilter.value = timeRange;
        }
    }
    
    // Theme Management
    getStoredTheme() {
        try {
            const storedTheme = localStorage.getItem('theme');
            return storedTheme === 'dark' || storedTheme === 'light' ? storedTheme : 'light';
        } catch (error) {
            return 'light';
        }
    }

    normalizeTheme(theme) {
        return theme === 'dark' || theme === 'light' ? theme : 'light';
    }

    getActiveTheme() {
        return this.normalizeTheme(document.documentElement.getAttribute('data-theme') || this.currentTheme || this.getStoredTheme());
    }

    applyTheme(theme) {
        const normalizedTheme = this.normalizeTheme(theme);
        this.currentTheme = normalizedTheme;
        document.documentElement.setAttribute('data-theme', normalizedTheme);
        document.documentElement.style.colorScheme = normalizedTheme;
        return normalizedTheme;
    }

    setupTheme() {
        this.applyTheme(this.currentTheme);
        this.updateThemeIcon();
    }
    
    toggleTheme() {
        const activeTheme = this.getActiveTheme();
        const nextTheme = activeTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(nextTheme);
        try {
            localStorage.setItem('theme', this.currentTheme);
        } catch (error) {
            // Keep the current page theme even if storage is unavailable.
        }
        this.updateThemeIcon();
    }
    
    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const sunIcon = themeToggle.querySelector('.sun-icon');
            const moonIcon = themeToggle.querySelector('.moon-icon');
            const activeTheme = this.getActiveTheme();
            
            if (activeTheme === 'dark') {
                if (sunIcon) sunIcon.style.display = 'none';
                if (moonIcon) moonIcon.style.display = 'block';
                themeToggle.setAttribute('aria-pressed', 'true');
                themeToggle.setAttribute('aria-label', 'Switch to light theme');
            } else {
                if (sunIcon) sunIcon.style.display = 'block';
                if (moonIcon) moonIcon.style.display = 'none';
                themeToggle.setAttribute('aria-pressed', 'false');
                themeToggle.setAttribute('aria-label', 'Switch to dark theme');
            }
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && themeToggle.dataset.themeBound !== 'true') {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            themeToggle.dataset.themeBound = 'true';
        }
        
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Filter controls
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.applyFilters();
            });
        }
        
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.applyFilters();
            });
        }
        
        const timeFilter = document.getElementById('timeFilter');
        if (timeFilter) {
            timeFilter.addEventListener('change', (e) => {
                this.currentFilters.timeRange = e.target.value;
                this.applyFilters();
            });
        }
        
        // View toggle
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentView = e.target.dataset.view;
                this.updateViewToggle();
                this.renderBlogs();
            });
        });
        
        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreBlogs());
        }
        
        // Blog card clicks are attached after each render so external article URLs are preserved.
    }
    
    // Data Loading
    loadSampleBlogs() {
        this.blogs = BlogXiv.prototype.getCuratedCommunityBlogs();
    }

    populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        const selectedValue = this.normalizeCategory(categoryFilter.value);
        const categoryCounts = this.blogs.reduce((counts, blog) => {
            counts.set(blog.category, (counts.get(blog.category) || 0) + 1);
            return counts;
        }, new Map());
        const categories = Array.from(categoryCounts.keys())
            .sort((a, b) => this.getCategoryOrder(a) - this.getCategoryOrder(b) || a.localeCompare(b));

        categoryFilter.innerHTML = `
            <option value="all">All Categories (${this.blogs.length})</option>
            ${categories.map(category => `<option value="${category}">${category} (${categoryCounts.get(category)})</option>`).join('')}
        `;

        categoryFilter.value = categories.includes(selectedValue) ? selectedValue : 'all';
    }
    
    // Filtering and Sorting
    applyFilters() {
        let filtered = [...this.blogs];
        
        // Category filter
        if (this.currentFilters.category !== 'all') {
            filtered = filtered.filter(blog => 
                blog.category === this.currentFilters.category
            );
        }

        // Author filter
        if (this.currentFilters.author !== 'all') {
            filtered = filtered.filter(blog =>
                blog.author === this.currentFilters.author
            );
        }
        
        // Time range filter
        if (this.currentFilters.timeRange !== 'all') {
            if (/^\d{4}$/.test(this.currentFilters.timeRange)) {
                filtered = filtered.filter(blog =>
                    String(new Date(blog.publishDate).getFullYear()) === this.currentFilters.timeRange
                );
            } else {
                const now = new Date();
                const timeRanges = {
                    week: 7,
                    month: 30,
                    year: 365
                };
                
                const days = timeRanges[this.currentFilters.timeRange];
                filtered = filtered.filter(blog => {
                    const blogDate = new Date(blog.publishDate);
                    const diffTime = Math.abs(now - blogDate);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= days;
                });
            }
        }

        // Search filter
        if (this.searchQuery.length >= 2) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(blog =>
                blog.title.toLowerCase().includes(query) ||
                blog.excerpt.toLowerCase().includes(query) ||
                blog.author.toLowerCase().includes(query) ||
                blog.category.toLowerCase().includes(query) ||
                blog.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        // Sort
        switch (this.currentFilters.sort) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.publishDate) - new Date(b.publishDate));
                break;
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'source':
                filtered.sort((a, b) => {
                    const sourceCompare = a.sourceName.localeCompare(b.sourceName);
                    return sourceCompare || new Date(b.publishDate) - new Date(a.publishDate);
                });
                break;
        }
        
        this.filteredBlogs = filtered;
        this.displayedBlogs = 12; // Reset displayed count
        this.updatePageHeader();
        this.updateSectionHeader();
        this.renderBlogs();
        this.updateLoadMoreButton();
        this.updateStats();
        this.updateURL();
    }

    updatePageHeader() {
        const pageTitle = document.querySelector('.page-title');
        const pageDescription = document.querySelector('.page-description');
        if (!pageTitle || !pageDescription) return;

        if (this.currentFilters.author !== 'all') {
            pageTitle.textContent = `${this.currentFilters.author} Posts`;
            pageDescription.textContent = `Curated articles and research notes by ${this.currentFilters.author}`;
            return;
        }

        if (this.currentFilters.category === 'all') {
            pageTitle.textContent = /^\d{4}$/.test(this.currentFilters.timeRange)
                ? `Explore ${this.currentFilters.timeRange} Blogs`
                : 'Explore All Blogs';
            pageDescription.textContent = 'Discover the latest AI research insights and breakthroughs from academia, industry, and independent researchers';
            return;
        }

        pageTitle.textContent = `${this.currentFilters.category} Blogs`;
        pageDescription.textContent = this.getCategoryMeta(this.currentFilters.category).description;
    }

    updateSectionHeader() {
        const sectionTitle = document.querySelector('.blogs-header h2');
        if (!sectionTitle) return;

        if (this.searchQuery.length >= 2) {
            sectionTitle.textContent = `Search Results (${this.filteredBlogs.length})`;
            return;
        }

        if (this.currentFilters.author !== 'all') {
            sectionTitle.textContent = `${this.currentFilters.author} Posts (${this.filteredBlogs.length})`;
            return;
        }

        if (this.currentFilters.category !== 'all') {
            sectionTitle.textContent = `${this.currentFilters.category} Blogs (${this.filteredBlogs.length})`;
            return;
        }

        if (/^\d{4}$/.test(this.currentFilters.timeRange)) {
            sectionTitle.textContent = `${this.currentFilters.timeRange} Blogs (${this.filteredBlogs.length})`;
            return;
        }

        sectionTitle.textContent = `All Blogs (${this.filteredBlogs.length})`;
    }

    updateURL() {
        const params = new URLSearchParams(window.location.search);

        if (this.currentFilters.category === 'all') {
            params.delete('category');
        } else {
            params.set('category', this.currentFilters.category);
        }

        if (this.currentFilters.author === 'all') {
            params.delete('author');
        } else {
            params.set('author', this.currentFilters.author);
        }

        if (this.currentFilters.sort === 'newest') {
            params.delete('sort');
        } else {
            params.set('sort', this.currentFilters.sort);
        }

        if (this.currentFilters.timeRange === 'all') {
            params.delete('time');
        } else {
            params.set('time', this.currentFilters.timeRange);
        }

        const query = params.toString();
        const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}`;
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        if (nextUrl !== currentUrl) {
            window.history.replaceState({}, '', nextUrl);
        }
    }
    
    // Search
    handleSearch(query) {
        this.searchQuery = query.trim();
        this.applyFilters();
    }
    
    // Rendering
    renderBlogs() {
        const blogsGrid = document.getElementById('blogsGrid');
        if (!blogsGrid) return;
        
        if (this.filteredBlogs.length === 0) {
            blogsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No blogs found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }
        
        const blogsToShow = this.filteredBlogs.slice(0, this.displayedBlogs);
        
        if (this.currentView === 'list') {
            blogsGrid.className = 'blogs-list';
            blogsGrid.innerHTML = blogsToShow.map(blog => this.renderBlogListItem(blog)).join('');
        } else {
            blogsGrid.className = 'blogs-grid';
            blogsGrid.innerHTML = blogsToShow.map(blog => this.renderBlogCard(blog)).join('');
        }
        
        // Add click event listeners to blog cards/items
        this.attachBlogClickHandlers();
    }
    
    // Add click handlers for blog navigation
    attachBlogClickHandlers() {
        const blogCards = document.querySelectorAll('.blog-card, .blog-list-item');
        blogCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on a link or button inside the card
                if (e.target.closest('a') || e.target.tagName === 'BUTTON') {
                    return;
                }

                const blogUrl = card.dataset.blogUrl;
                if (blogUrl) {
                    window.open(blogUrl, '_blank', 'noopener,noreferrer');
                    return;
                }

                const blogId = card.dataset.blogId;
                if (blogId) {
                    window.location.href = `blog-detail.html?id=${blogId}`;
                }
            });
            
            // Add keyboard accessibility
            card.setAttribute('role', 'article');
            card.setAttribute('tabindex', '0');
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const blogUrl = card.dataset.blogUrl;
                    if (blogUrl) {
                        window.open(blogUrl, '_blank', 'noopener,noreferrer');
                        return;
                    }
                    const blogId = card.dataset.blogId;
                    if (blogId) {
                        window.location.href = `blog-detail.html?id=${blogId}`;
                    }
                }
            });
        });
    }
    
    renderBlogCard(blog) {
        return `
            <article class="blog-card" data-blog-id="${blog.id}" data-blog-url="${blog.url || ''}">
                <div class="blog-image">
                    <img class="blog-cover-image ${blog.coverFit === 'contain' ? 'is-contain' : ''}" src="${blog.coverImage}" alt="${blog.coverAlt || blog.title}" loading="lazy" referrerpolicy="no-referrer">
                    <span class="blog-source-pill">${blog.sourceName}</span>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="blog-category">${blog.category}</span>
                        <span>•</span>
                        <span>${blog.readTime}</span>
                        <span>•</span>
                        <span>${this.formatDate(blog.publishDate)}</span>
                    </div>
                    <h3 class="blog-title">${blog.title}</h3>
                    <p class="blog-excerpt">${blog.excerpt}</p>
                    <div class="blog-footer">
                        <div class="blog-author">
                            ${this.renderAuthorAvatar(blog)}
                            <span class="author-name">${blog.author}</span>
                        </div>
                        <a class="blog-source-link" href="${blog.url}" target="_blank" rel="noopener noreferrer">Read original</a>
                    </div>
                </div>
            </article>
        `;
    }
    
    renderBlogListItem(blog) {
        return `
            <article class="blog-list-item" data-blog-id="${blog.id}" data-blog-url="${blog.url || ''}">
                <div class="blog-list-content">
                    <div class="blog-meta">
                        <span class="blog-category">${blog.category}</span>
                        <span>•</span>
                        <span>${blog.readTime}</span>
                        <span>•</span>
                        <span>${this.formatDate(blog.publishDate)}</span>
                    </div>
                    <h3 class="blog-title">${blog.title}</h3>
                    <p class="blog-excerpt">${blog.excerpt}</p>
                    <div class="blog-footer">
                        <div class="blog-author">
                            ${this.renderAuthorAvatar(blog)}
                            <span class="author-name">${blog.author}</span>
                        </div>
                        <a class="blog-source-link" href="${blog.url}" target="_blank" rel="noopener noreferrer">Read original</a>
                    </div>
                </div>
            </article>
        `;
    }
    
    // View Management
    updateViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.currentView);
        });
    }
    
    // Load More
    loadMoreBlogs() {
        this.displayedBlogs += this.blogsPerPage;
        this.renderBlogs();
        this.updateLoadMoreButton();
        
        // Scroll to newly loaded content
        setTimeout(() => {
            const blogsGrid = document.getElementById('blogsGrid');
            if (blogsGrid) {
                const lastBlog = blogsGrid.lastElementChild;
                if (lastBlog) {
                    lastBlog.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);
    }
    
    updateLoadMoreButton() {
        const loadMoreContainer = document.querySelector('.load-more');
        if (loadMoreContainer) {
            const showButton = this.displayedBlogs < this.filteredBlogs.length;
            loadMoreContainer.style.display = showButton ? 'block' : 'none';
        }
    }
    
    // Stats
    updateStats() {
        const hasScopedFilter = this.currentFilters.category !== 'all' ||
            this.currentFilters.author !== 'all' ||
            this.currentFilters.timeRange !== 'all' ||
            this.searchQuery.length >= 2;
        const statBlogs = hasScopedFilter ? this.filteredBlogs : this.blogs;
        const totalBlogs = statBlogs.length;
        const totalAuthors = new Set(statBlogs.map(blog => blog.author)).size;
        const totalCategories = new Set(statBlogs.map(blog => blog.category)).size;
        const totalViews = statBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        
        const totalBlogsEl = document.getElementById('totalBlogs');
        const totalAuthorsEl = document.getElementById('totalAuthors');
        const totalCategoriesEl = document.getElementById('totalCategories');
        const totalViewsEl = document.getElementById('totalViews');

        if (totalBlogsEl) totalBlogsEl.textContent = totalBlogs;
        if (totalAuthorsEl) totalAuthorsEl.textContent = totalAuthors;
        if (totalCategoriesEl) totalCategoriesEl.textContent = totalCategories;
        if (totalViewsEl) totalViewsEl.textContent = totalViews ? totalViews.toLocaleString() : 'Curated';

        const blogLabel = totalBlogsEl?.nextElementSibling;
        if (blogLabel) blogLabel.textContent = hasScopedFilter ? 'Matching Blogs' : 'Total Blogs';
    }
    
    // Utility Functions
    renderAuthorAvatar(blog) {
        return window.BlogXivAvatarUtils.renderAvatar(blog.author, blog.authorAvatar, { sourceUrl: blog.url });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }
}

// Initialize the explore page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ExplorePage();
});
