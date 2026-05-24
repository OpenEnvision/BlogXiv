// Authors Page JavaScript
class AuthorsPage {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.authors = [];
        this.filteredAuthors = [];
        this.searchQuery = '';
        this.currentFilters = {
            specialty: 'all',
            sort: 'popular'
        };

        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEventListeners();
        this.loadAuthors();
        this.applyFilters();
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
        if (!themeToggle) return;

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

    // Event Listeners
    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && themeToggle.dataset.themeBound !== 'true') {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            themeToggle.dataset.themeBound = 'true';
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (event) => this.handleSearch(event.target.value));
        }

        const specialtyFilter = document.getElementById('specialtyFilter');
        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', (event) => {
                this.currentFilters.specialty = event.target.value;
                this.applyFilters();
            });
        }

        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', (event) => {
                this.currentFilters.sort = event.target.value;
                this.applyFilters();
            });
        }

        document.addEventListener('click', (event) => {
            const card = event.target.closest('.author-card');
            if (!card || event.target.closest('a, button')) return;

            const authorId = card.dataset.authorId;
            if (authorId) {
                this.viewAuthorProfile(authorId);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            const card = event.target.closest('.author-card');
            if (!card || event.target.closest('a, button')) return;

            event.preventDefault();
            const authorId = card.dataset.authorId;
            if (authorId) {
                this.viewAuthorProfile(authorId);
            }
        });
    }

    // Data Loading
    loadAuthors() {
        const blogs = typeof BlogXiv !== 'undefined'
            ? BlogXiv.prototype.getCuratedCommunityBlogs()
            : [];

        const authorGroups = new Map();

        blogs.forEach((blog) => {
            if (!blog.author) return;

            if (!authorGroups.has(blog.author)) {
                authorGroups.set(blog.author, []);
            }
            authorGroups.get(blog.author).push(blog);
        });

        this.authors = Array.from(authorGroups.entries()).map(([name, posts]) => {
            const sortedPosts = [...posts].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
            const allTags = sortedPosts.flatMap((post) => post.tags || []);
            const uniqueTags = [...new Set(allTags)];
            const primaryCategory = this.getMostCommon(sortedPosts.map((post) => post.category));
            const primarySource = this.getMostCommon(sortedPosts.map((post) => post.sourceName));
            const sources = [...new Set(sortedPosts.map((post) => post.sourceName).filter(Boolean))];
            const categories = [...new Set(sortedPosts.map((post) => post.category).filter(Boolean))];
            const latestPost = sortedPosts[0];

            return {
                id: this.slugify(name),
                name,
                title: `${primaryCategory} Contributor`,
                institution: sources.length > 1 ? `${primarySource} + ${sources.length - 1} more` : primarySource,
                specialty: primaryCategory,
                bio: this.buildBio(name, primaryCategory, sources, uniqueTags),
                avatar: latestPost.authorAvatar,
                blogsCount: sortedPosts.length,
                followers: this.estimateFollowers(sortedPosts.length, uniqueTags.length, sources.length),
                following: Math.max(12, sources.length * 8 + categories.length * 6 + Math.min(uniqueTags.length, 18)),
                joinDate: this.getEarliestDate(sortedPosts),
                lastActive: latestPost.publishDate,
                tags: uniqueTags.slice(0, 4),
                recentBlogs: sortedPosts.slice(0, 3).map((post) => ({
                    title: post.title,
                    url: post.url
                })),
                postsUrl: `explore.html?author=${encodeURIComponent(name)}`,
                profileUrl: latestPost.url
            };
        });
    }

    buildBio(name, primaryCategory, sources, tags) {
        const focus = tags.slice(0, 3).join(', ') || primaryCategory.toLowerCase();
        const sourceText = sources.length > 1 ? `${sources.length} trusted sources` : sources[0];
        return `${name} contributes curated ${primaryCategory.toLowerCase()} reading notes across ${sourceText}, with a focus on ${focus}.`;
    }

    getMostCommon(items) {
        const counts = items.filter(Boolean).reduce((acc, item) => {
            acc[item] = (acc[item] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Research';
    }

    getEarliestDate(posts) {
        return posts
            .map((post) => post.publishDate)
            .sort((a, b) => new Date(a) - new Date(b))[0];
    }

    estimateFollowers(postCount, tagCount, sourceCount) {
        return 900 + postCount * 420 + tagCount * 45 + sourceCount * 120;
    }

    slugify(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'author';
    }

    // Filtering and Sorting
    applyFilters() {
        let filtered = [...this.authors];

        if (this.currentFilters.specialty !== 'all') {
            filtered = filtered.filter((author) => author.specialty === this.currentFilters.specialty);
        }

        if (this.searchQuery.length >= 2) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter((author) =>
                author.name.toLowerCase().includes(query) ||
                author.title.toLowerCase().includes(query) ||
                author.institution.toLowerCase().includes(query) ||
                author.bio.toLowerCase().includes(query) ||
                author.specialty.toLowerCase().includes(query) ||
                author.tags.some((tag) => tag.toLowerCase().includes(query)) ||
                author.recentBlogs.some((blog) => blog.title.toLowerCase().includes(query))
            );
        }

        switch (this.currentFilters.sort) {
            case 'recent':
                filtered.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
                break;
            case 'blogs':
                filtered.sort((a, b) => b.blogsCount - a.blogsCount || new Date(b.lastActive) - new Date(a.lastActive));
                break;
            case 'followers':
            case 'popular':
            default:
                filtered.sort((a, b) => b.followers - a.followers || new Date(b.lastActive) - new Date(a.lastActive));
                break;
        }

        this.filteredAuthors = filtered;
        this.renderAuthors();
    }

    // Search
    handleSearch(query) {
        this.searchQuery = query.trim();
        this.applyFilters();
    }

    // Rendering
    renderAuthors() {
        const authorsGrid = document.getElementById('authorsGrid');
        if (!authorsGrid) return;

        if (this.filteredAuthors.length === 0) {
            authorsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No authors found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }

        authorsGrid.innerHTML = this.filteredAuthors.map((author) => this.renderAuthorCard(author)).join('');
    }

    renderAuthorCard(author) {
        return `
            <div class="author-card" data-author-id="${this.escapeAttribute(author.id)}" tabindex="0" role="article" aria-label="View posts by ${this.escapeAttribute(author.name)}">
                <div class="author-header">
                    ${this.renderAuthorAvatar(author)}
                    <div class="author-info">
                        <h3 class="author-name">${this.escapeHTML(author.name)}</h3>
                        <p class="author-title">${this.escapeHTML(author.title)}</p>
                        <p class="author-institution">${this.escapeHTML(author.institution)}</p>
                    </div>
                </div>

                <div class="author-bio">
                    <p>${this.escapeHTML(author.bio)}</p>
                </div>

                <div class="author-tags">
                    ${author.tags.map((tag) => `<span class="tag">${this.escapeHTML(tag)}</span>`).join('')}
                </div>

                <div class="author-stats">
                    <div class="stat">
                        <span class="stat-number">${author.blogsCount}</span>
                        <span class="stat-label">Blogs</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${author.followers.toLocaleString()}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${author.following}</span>
                        <span class="stat-label">Following</span>
                    </div>
                </div>

                <div class="author-recent">
                    <h4>Recent Blogs:</h4>
                    <ul>
                        ${author.recentBlogs.map((blog) => `<li>${this.escapeHTML(blog.title)}</li>`).join('')}
                    </ul>
                </div>

                <div class="author-actions">
                    <a class="btn btn-outline" href="${this.escapeAttribute(author.postsUrl)}">
                        View Posts
                    </a>
                    <a class="btn btn-primary" href="${this.escapeAttribute(author.profileUrl)}" target="_blank" rel="noopener noreferrer">
                        Latest Work
                    </a>
                </div>
            </div>
        `;
    }

    renderAuthorAvatar(author) {
        return window.BlogXivAvatarUtils.renderAvatar(author.name, author.avatar, { sourceUrl: author.profileUrl });
    }

    // Actions
    viewAuthorProfile(authorId) {
        const author = this.authors.find((item) => item.id === authorId);
        if (author) {
            window.location.href = author.postsUrl;
        }
    }

    escapeHTML(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    escapeAttribute(value) {
        return this.escapeHTML(value).replace(/`/g, '&#096;');
    }
}

// Initialize the authors page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.loadingAnimation) {
        window.loadingAnimation.show('Loading author information...', 1500);
    }

    new AuthorsPage();
});
