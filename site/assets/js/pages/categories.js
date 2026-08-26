// Categories Page JavaScript
class CategoriesPage {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.emptyStateElement = null;

        this.init();
    }
    
    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadCategoryCounts();
    }

    // Post counts per category, from the same data pipeline as the explore page:
    // Supabase when reachable, the static corpus in app.js otherwise. Counts are
    // decorative, so any failure leaves the taxonomy page fully usable.
    async loadCategoryCounts() {
        const cards = Array.from(document.querySelectorAll('.categories-section .category-card[data-category]'));
        if (!cards.length) return;

        try {
            const hasCorpus = typeof BlogXiv !== 'undefined' && typeof BlogXiv.prototype.getCuratedCommunityBlogs === 'function';
            const staticBlogs = hasCorpus ? BlogXiv.prototype.getCuratedCommunityBlogs() : [];
            const blogs = window.BlogXivData
                ? await window.BlogXivData.getPublishedBlogs(staticBlogs)
                : staticBlogs;
            if (!Array.isArray(blogs) || blogs.length === 0) return;

            const reassignments = hasCorpus && typeof BlogXiv.prototype.getCategoryReassignments === 'function'
                ? BlogXiv.prototype.getCategoryReassignments()
                : new Map();
            const counts = blogs.reduce((map, blog) => {
                const category = reassignments.get(blog.id) || blog.category;
                map.set(category, (map.get(category) || 0) + 1);
                return map;
            }, new Map());

            cards.forEach(card => {
                const target = card.querySelector('.category-count');
                const count = counts.get(card.dataset.category) || 0;
                if (target && count > 0) {
                    target.textContent = `${count} indexed ${count === 1 ? 'post' : 'posts'}`;
                }
            });
        } catch (error) {
            // Leave the count slots empty; they are hidden via CSS when empty.
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
        const searchInput = document.getElementById('categorySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        
        // Category card clicks
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on the link
                if (e.target.tagName === 'A') return;

                const category = card.dataset.category;
                window.location.href = `explore.html?category=${encodeURIComponent(category)}`;
            });
        });
    }
    
    // Search functionality
    handleSearch(query) {
        const categoryCards = document.querySelectorAll('.category-card');
        const emptyState = this.getEmptyStateElement();
        let matchesCount = 0;

        if (query.length < 2) {
            // Show all categories (empty value restores the stylesheet layout)
            categoryCards.forEach(card => {
                card.style.display = '';
            });
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            return;
        }

        const searchTerm = query.toLowerCase();

        categoryCards.forEach(card => {
            const title = card.querySelector('.category-title').textContent.toLowerCase();
            const description = card.querySelector('.category-description').textContent.toLowerCase();
            const boundary = card.querySelector('.category-boundary')?.textContent.toLowerCase() || '';
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

            const matches = title.includes(searchTerm) ||
                          description.includes(searchTerm) ||
                          boundary.includes(searchTerm) ||
                          tags.some(tag => tag.includes(searchTerm));

            card.style.display = matches ? '' : 'none';
            if (matches) {
                matchesCount += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = matchesCount === 0 ? 'flex' : 'none';
        }
    }

    getEmptyStateElement() {
        if (this.emptyStateElement) {
            return this.emptyStateElement;
        }

        const container = document.querySelector('.categories-section');
        if (!container) return null;

        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state-card';
        emptyState.innerHTML = `
            <div class="empty-state-icon" aria-hidden="true">🔍</div>
            <h3>No categories found</h3>
            <p>Try a different keyword or explore all of our knowledge domains.</p>
        `;
        emptyState.style.display = 'none';
        container.appendChild(emptyState);

        this.emptyStateElement = emptyState;
        return this.emptyStateElement;
    }
}

// Initialize the categories page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show page loading animation
    if (window.loadingAnimation) {
        window.loadingAnimation.show('Loading category content...', 1500);
    }
    
    new CategoriesPage();
});
