// Blog updates page: grouped by category, newest first within each group.
class BlogUpdatesPage {
    constructor() {
        this.maxPostsPerCategory = 30;
        this.blogs = [];
        this.groups = [];
        this.activeCategory = '';
        this.observer = null;
        this.categoryOrder = [
            'Multimodal Model',
            'Visual Generation',
            'World Model',
            'AI Agents',
            'LLM & MLLM',
            'Foundation Model',
            'Efficient AI',
            'Trustworthy AI',
            'Research Craft'
        ];

        this.init();
    }

    init() {
        this.loadBlogs();
        this.render();
        this.bindCategoryRail();
        this.observeSections();
        this.updateStats();
    }

    loadBlogs() {
        const source = typeof BlogXiv !== 'undefined'
            ? BlogXiv.prototype.getCuratedCommunityBlogs()
            : [];

        this.blogs = [...source].sort((a, b) => this.getDateValue(b.publishDate) - this.getDateValue(a.publishDate));
        const groupsByCategory = this.blogs.reduce((groups, blog) => {
            const category = blog.category || 'Research';
            if (!groups.has(category)) groups.set(category, []);
            groups.get(category).push(blog);
            return groups;
        }, new Map());

        this.groups = [...groupsByCategory.entries()]
            .map(([category, posts]) => ({
                category,
                posts: posts.sort((a, b) => this.getDateValue(b.publishDate) - this.getDateValue(a.publishDate))
            }))
            .sort((a, b) => this.getCategoryOrder(a.category) - this.getCategoryOrder(b.category) || a.category.localeCompare(b.category));

        this.activeCategory = this.groups[0]?.category || '';
    }

    getDateValue(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    }

    getCategoryOrder(category) {
        const index = this.categoryOrder.indexOf(category);
        return index === -1 ? Number.MAX_SAFE_INTEGER : index;
    }

    getCategoryId(category) {
        return `updates-${String(category).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    }

    getCategoryHref(category) {
        return `explore.html?category=${encodeURIComponent(category)}`;
    }

    escapeHTML(value) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return String(value ?? '').replace(/[&<>"']/g, char => entities[char]);
    }

    render() {
        const rail = document.getElementById('updatesCategoryRail');
        const content = document.getElementById('updatesContent');

        if (!this.groups.length) {
            if (rail) rail.innerHTML = '';
            if (content) content.innerHTML = '<div class="updates-empty">No blog updates are available yet.</div>';
            return;
        }

        if (!rail || !content) return;

        rail.innerHTML = this.groups.map(group => this.renderCategoryButton(group)).join('');
        content.innerHTML = this.groups.map(group => this.renderCategorySection(group)).join('');
        this.setActiveCategory(this.activeCategory);
    }

    renderCategoryButton(group) {
        const isActive = group.category === this.activeCategory;
        return `
            <button class="updates-category-button${isActive ? ' is-active' : ''}" type="button" data-category="${this.escapeHTML(group.category)}" data-target="${this.getCategoryId(group.category)}">
                <span>${this.escapeHTML(group.category)}</span>
                <span class="updates-category-count">${group.posts.length}</span>
            </button>
        `;
    }

    renderCategorySection(group) {
        const visiblePosts = group.posts.slice(0, this.maxPostsPerCategory);
        const hasMorePosts = group.posts.length > this.maxPostsPerCategory;
        const summary = hasMorePosts
            ? `Showing ${visiblePosts.length} of ${group.posts.length} blogs, newest first`
            : `${group.posts.length} blogs, newest first`;

        return `
            <section class="updates-category-section" id="${this.getCategoryId(group.category)}" data-category="${this.escapeHTML(group.category)}" aria-labelledby="${this.getCategoryId(group.category)}-title">
                <div class="updates-category-heading">
                    <h2 id="${this.getCategoryId(group.category)}-title">${this.escapeHTML(group.category)}</h2>
                    <span>${summary}</span>
                    <a class="updates-category-open" href="${this.escapeHTML(this.getCategoryHref(group.category))}">
                        View all ${group.posts.length} blogs
                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>
                    </a>
                </div>
                <div class="updates-list">
                    ${visiblePosts.map(blog => this.renderUpdateCard(blog)).join('')}
                </div>
            </section>
        `;
    }

    renderUpdateCard(blog) {
        const detailHref = `blog-detail.html?id=${encodeURIComponent(blog.id)}`;
        const sourceHref = blog.url || detailHref;
        const tags = (blog.tags || [blog.category]).slice(0, 4);
        const coverClass = blog.coverFit === 'contain' ? 'is-contain' : '';

        return `
            <article class="update-card" data-blog-id="${this.escapeHTML(blog.id)}" data-blog-category="${this.escapeHTML(blog.category)}">
                <div class="update-card-main">
                    <h3 class="update-title">${window.BlogXivHyphenation ? window.BlogXivHyphenation.hyphenateTitle(blog.title) : this.escapeHTML(blog.title)}</h3>
                    <div class="update-meta">
                        <time datetime="${this.escapeHTML(blog.publishDate)}">${this.escapeHTML(blog.publishDate)}</time>
                        <span class="update-author">
                            ${window.BlogXivAvatarUtils.renderAvatar(blog.author, blog.authorAvatar, { sourceUrl: blog.url })}
                            <span>${this.escapeHTML(blog.author)}</span>
                        </span>
                    </div>
                    <p class="update-excerpt">${this.escapeHTML(blog.excerpt)}</p>
                    <a class="update-source-link" href="${this.escapeHTML(sourceHref)}" target="_blank" rel="noopener noreferrer">View blog ></a>
                    <div class="update-tags" aria-label="Blog tags">
                        ${tags.map(tag => `<span class="update-tag">#${this.escapeHTML(tag)}</span>`).join('')}
                    </div>
                    <div class="update-actions">
                        <span class="update-action-pill" aria-label="Estimated reading time">
                            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path></svg>
                            ${this.escapeHTML(blog.readTime || 'Curated')}
                        </span>
                        ${window.BlogXivLikes ? window.BlogXivLikes.renderButton(blog.id) : ''}
                        <span class="update-action-spacer"></span>
                        <a class="update-detail-button" href="${detailHref}" aria-label="Open BlogrXiv detail page for ${this.escapeHTML(blog.title)}">
                            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>
                        </a>
                    </div>
                </div>
                <a class="update-cover" href="${detailHref}" aria-label="Open BlogrXiv detail page for ${this.escapeHTML(blog.title)}">
                    <span class="update-cover-frame">
                        <img class="${coverClass}" src="${this.escapeHTML(blog.coverImage)}" alt="${this.escapeHTML(blog.coverAlt || blog.title)}" loading="lazy" referrerpolicy="no-referrer">
                    </span>
                </a>
            </article>
        `;
    }

    bindCategoryRail() {
        document.querySelectorAll('.updates-category-button').forEach(button => {
            button.addEventListener('click', () => {
                const target = document.getElementById(button.dataset.target);
                if (!target) return;
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                this.setActiveCategory(button.dataset.category);
            });
        });
    }

    observeSections() {
        const sections = document.querySelectorAll('.updates-category-section');
        if (!sections.length || !('IntersectionObserver' in window)) return;

        this.observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (visible?.target?.dataset.category) {
                this.setActiveCategory(visible.target.dataset.category);
            }
        }, {
            rootMargin: '-18% 0px -62% 0px',
            threshold: [0.05, 0.2, 0.45]
        });

        sections.forEach(section => this.observer.observe(section));
    }

    setActiveCategory(category) {
        this.activeCategory = category;
        document.querySelectorAll('.updates-category-button').forEach(button => {
            button.classList.toggle('is-active', button.dataset.category === category);
        });
    }

    updateStats() {
        const totalBlogs = document.getElementById('updatesTotalBlogs');
        const totalCategories = document.getElementById('updatesTotalCategories');
        const newestDate = document.getElementById('updatesNewestDate');

        if (totalBlogs) totalBlogs.textContent = String(this.blogs.length);
        if (totalCategories) totalCategories.textContent = String(this.groups.length);
        if (newestDate) newestDate.textContent = this.blogs[0]?.publishDate || 'Curated';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlogUpdatesPage();
});
