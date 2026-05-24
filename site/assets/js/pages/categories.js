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
            // Show all categories
            categoryCards.forEach(card => {
                card.style.display = 'block';
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
            const tags = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent.toLowerCase());

            const matches = title.includes(searchTerm) ||
                          description.includes(searchTerm) ||
                          tags.some(tag => tag.includes(searchTerm));

            card.style.display = matches ? 'block' : 'none';
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
