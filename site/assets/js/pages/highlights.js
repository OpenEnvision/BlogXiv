class HighlightsPage {
    constructor() {
        this.blogs = [];
        this.maxHighlights = 20;
        this.handleLikeChange = this.handleLikeChange.bind(this);
        this.init();
    }

    async init() {
        const staticBlogs = typeof BlogXiv !== 'undefined'
            ? BlogXiv.prototype.getCuratedCommunityBlogs()
            : [];
        const blogs = window.BlogXivData
            ? await window.BlogXivData.getPublishedBlogs(staticBlogs)
            : staticBlogs;
        const counts = window.BlogXivLikes
            ? await window.BlogXivLikes.getCounts()
            : new Map();

        this.blogs = blogs.map((blog) => ({
            ...blog,
            likeCount: counts.get(String(blog.id)) || 0
        }));
        this.sortBlogs();
        this.render();
        this.updateStats();
        window.addEventListener('blogxiv:likechange', this.handleLikeChange);
    }

    sortBlogs() {
        this.blogs.sort((a, b) =>
            b.likeCount - a.likeCount
            || this.getDateValue(b.publishDate) - this.getDateValue(a.publishDate)
            || a.title.localeCompare(b.title)
        );
    }

    getDateValue(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    }

    handleLikeChange(event) {
        const blog = this.blogs.find((item) => String(item.id) === event.detail?.blogId);
        if (!blog) return;
        blog.likeCount = Math.max(0, Number(event.detail.likeCount) || 0);
        this.sortBlogs();
        this.render();
        this.updateStats();
    }

    render() {
        const container = document.getElementById('highlightsList');
        if (!container) return;
        const items = this.blogs.slice(0, this.maxHighlights);

        container.innerHTML = items.map((blog, index) => this.renderItem(blog, index + 1)).join('');
    }

    renderItem(blog, rank) {
        const detailHref = `blog-detail.html?id=${encodeURIComponent(blog.id)}`;
        return `
            <article class="highlight-item" data-blog-id="${this.escapeHTML(blog.id)}">
                <div class="highlight-rank" aria-label="Rank ${rank}">${String(rank).padStart(2, '0')}</div>
                <a class="highlight-cover" href="${detailHref}" aria-label="Open ${this.escapeHTML(blog.title)}">
                    <img src="${this.escapeHTML(blog.coverImage)}" alt="${this.escapeHTML(blog.coverAlt || blog.title)}" loading="lazy" referrerpolicy="no-referrer">
                </a>
                <div class="highlight-content">
                    <div class="highlight-meta">
                        <span>${this.escapeHTML(blog.category)}</span>
                        <time datetime="${this.escapeHTML(blog.publishDate)}">${this.escapeHTML(blog.publishDate)}</time>
                    </div>
                    <h2><a href="${detailHref}">${window.BlogXivHyphenation.hyphenateTitle(blog.title)}</a></h2>
                    <p>${this.escapeHTML(blog.excerpt)}</p>
                    <div class="highlight-author">
                        ${window.BlogXivAvatarUtils.renderAvatar(blog.author, blog.authorAvatar, { sourceUrl: blog.url })}
                        <span>${this.escapeHTML(blog.author)}</span>
                    </div>
                </div>
                <div class="highlight-score">
                    <span>Likes</span>
                    <strong data-highlight-count="${this.escapeHTML(blog.id)}">${blog.likeCount}</strong>
                    ${window.BlogXivLikes.renderButton(blog.id)}
                </div>
            </article>
        `;
    }

    updateStats() {
        const totalLikes = this.blogs.reduce((sum, blog) => sum + blog.likeCount, 0);
        const likedBlogs = this.blogs.filter((blog) => blog.likeCount > 0).length;
        document.getElementById('highlightsTotalLikes').textContent = String(totalLikes);
        document.getElementById('highlightsLikedBlogs').textContent = String(likedBlogs);
        document.getElementById('highlightsTopScore').textContent = String(this.blogs[0]?.likeCount || 0);
    }

    escapeHTML(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HighlightsPage();
});
