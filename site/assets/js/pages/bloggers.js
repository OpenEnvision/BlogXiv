// Curated Bloggers Page JavaScript
class BloggersPage {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.bloggers = [];
        this.filteredBloggers = [];
        this.searchQuery = '';
        this.currentFilters = {
            specialty: 'all',
            sort: 'impact'
        };

        this.profiles = [
            {
                name: 'Sebastian Raschka',
                institution: 'Lightning AI / University of Wisconsin-Madison',
                homepage: 'https://sebastianraschka.com/',
                avatar: 'https://sebastianraschka.com/images/logos/photo-2021-08-25_compressed.jpg',
                matches: ['Sebastian Raschka', 'Ahead of AI'],
                specialty: 'LLM & MLLM',
                focus: ['LLM architecture', 'evaluation', 'coding agents'],
                qualityRank: 12
            },
            {
                name: 'Nathan Lambert',
                institution: 'Ai2 / Interconnects',
                homepage: 'https://www.interconnects.ai/',
                avatar: 'https://github.com/natolambert.png',
                matches: ['Nathan Lambert', 'Interconnects'],
                specialty: 'Foundation Model',
                focus: ['open models', 'RLHF', 'reasoning models'],
                qualityRank: 11
            },
            {
                name: 'Lilian Weng',
                institution: "Lil'Log / former OpenAI",
                homepage: 'https://lilianweng.github.io/',
                avatar: 'https://github.com/lilianweng.png',
                matches: ['Lilian Weng', "Lil'Log"],
                specialty: 'Trustworthy AI',
                focus: ['AI safety', 'human data', 'generative models'],
                qualityRank: 11
            },
            {
                name: 'Andrej Karpathy',
                institution: 'Eureka Labs / former OpenAI and Tesla',
                homepage: 'https://karpathy.ai/',
                avatar: 'https://karpathy.ai/assets/me_new.jpg',
                matches: ['Karpathy', 'Andrej Karpathy'],
                specialty: 'Foundation Model',
                focus: ['deep learning systems', 'training practice', 'AI education'],
                qualityRank: 10
            },
            {
                name: 'Chris Olah',
                institution: 'Anthropic / Transformer Circuits',
                homepage: 'https://colah.github.io/',
                avatar: 'https://github.com/colah.png',
                matches: ['Chris Olah', "colah's blog", 'Transformer Circuits'],
                specialty: 'Trustworthy AI',
                focus: ['mechanistic interpretability', 'visual explanations', 'transformer circuits'],
                qualityRank: 10
            },
            {
                name: 'François Chollet',
                institution: 'Ndea / ARC Prize / Keras',
                homepage: 'https://fchollet.com/',
                avatar: 'https://github.com/fchollet.png',
                matches: ['François Chollet', 'Francois Chollet', 'Sparks in the Wind', 'Keras Blog'],
                specialty: 'Foundation Model',
                focus: ['abstraction', 'generalization', 'LLM mental models'],
                qualityRank: 9
            },
            {
                name: 'Yao Fu',
                institution: 'Long-context and multimodal reasoning researcher',
                homepage: 'https://yaofu.notion.site/About-Yao-Fu-b5efd2e00ea94bd3a18ca1ae78e655f8',
                avatar: 'https://github.com/FranxYao.png',
                matches: ['Yao Fu'],
                specialty: 'LLM & MLLM',
                focus: ['long context', 'reasoning', 'instruction tuning'],
                qualityRank: 8
            },
            {
                name: 'David Ha',
                institution: 'hardmaru / former Google Brain',
                homepage: 'https://otoro.net/',
                avatar: 'https://github.com/hardmaru.png',
                matches: ['David Ha', 'hardmaru', 'otoro'],
                specialty: 'World Model',
                focus: ['world models', 'neuroevolution', 'generative agents'],
                qualityRank: 8
            },
            {
                name: 'Sara Hooker',
                institution: 'Adaption Labs / former Cohere For AI',
                homepage: 'https://hardwarelottery.github.io/',
                avatar: 'https://www.google.com/s2/favicons?domain=hardwarelottery.github.io&sz=128',
                matches: ['Sara Hooker', 'The Hardware Lottery'],
                specialty: 'Efficient AI',
                focus: ['hardware-aware AI', 'research incentives', 'efficient models'],
                qualityRank: 8
            },
            {
                name: 'Sergey Levine',
                institution: 'UC Berkeley / BAIR',
                homepage: 'https://people.eecs.berkeley.edu/~svlevine/',
                avatar: 'https://www.google.com/s2/favicons?domain=berkeley.edu&sz=128',
                matches: ['Sergey Levine'],
                specialty: 'AI Agents',
                focus: ['offline RL', 'robot learning', 'decision making'],
                qualityRank: 8
            },
            {
                name: 'Patrick Mineault',
                institution: 'xcorr / NeuroAI archive',
                homepage: 'https://xcorr.net/',
                avatar: 'https://www.google.com/s2/favicons?domain=xcorr.net&sz=128',
                matches: ['Patrick Mineault', 'Good Research Code', 'xcorr'],
                specialty: 'Research Craft',
                focus: ['research code', 'neuroAI', 'scientific workflow'],
                qualityRank: 8
            },
            {
                name: 'Elvis Saravia',
                institution: 'DAIR.AI',
                homepage: 'https://www.dair.ai/blog',
                avatar: 'https://www.google.com/s2/favicons?domain=dair.ai&sz=128',
                matches: ['Elvis Saravia', 'DAIR.AI'],
                specialty: 'AI Agents',
                focus: ['prompt engineering', 'context engineering', 'agent workflows'],
                qualityRank: 7
            },
            {
                name: 'Hamel Husain',
                institution: "Hamel's Blog / Parlance Labs",
                homepage: 'https://hamel.dev/',
                avatar: 'https://hamel.dev/hamel_transparent.png',
                matches: ['Hamel Husain', "Hamel's Blog"],
                specialty: 'Research Craft',
                focus: ['LLM evals', 'product reliability', 'AI engineering'],
                qualityRank: 10
            },
            {
                name: 'Simon Willison',
                institution: 'Datasette / Independent',
                homepage: 'https://simonwillison.net/',
                avatar: 'https://github.com/simonw.png',
                matches: ['Simon Willison'],
                specialty: 'LLM & MLLM',
                focus: ['LLM tooling', 'agents', 'security'],
                qualityRank: 10
            },
            {
                name: 'Eugene Yan',
                institution: 'Amazon / Applied ML Systems',
                homepage: 'https://eugeneyan.com/',
                avatar: 'https://github.com/eugeneyan.png',
                matches: ['Eugene Yan', 'Applied LLMs'],
                specialty: 'Research Craft',
                focus: ['evaluation practice', 'recommendation systems', 'LLM product lessons'],
                qualityRank: 9
            },
            {
                name: 'Su Jianlin',
                institution: 'Scientific Spaces / BoJone',
                homepage: 'https://www.spaces.ac.cn/',
                avatar: 'https://kexue.fm/usr/themes/geekg/images/avatar.png',
                matches: ['苏剑林', '科学空间'],
                specialty: 'Efficient AI',
                focus: ['optimization', 'diffusion theory', 'sequence modeling'],
                qualityRank: 9
            },
            {
                name: 'Tri Dao',
                institution: 'Princeton / Dao AI Lab',
                homepage: 'https://tridao.me/',
                avatar: 'https://tridao.me/assets/img/tri_photo_2021_04.jpeg?v=70239a90f4a7b7f7fce95223cab772a2',
                matches: ['Tri Dao', 'Dao AI Lab'],
                specialty: 'Efficient AI',
                focus: ['FlashAttention', 'hardware-aware algorithms', 'efficient training'],
                qualityRank: 9
            },
            {
                name: 'Jay Alammar',
                institution: 'Cohere / Visual ML Explanations',
                homepage: 'https://jalammar.github.io/',
                avatar: 'https://github.com/jalammar.png',
                matches: ['Jay Alammar', 'Language Models & Co.'],
                specialty: 'LLM & MLLM',
                focus: ['visual explainers', 'reasoning models', 'diffusion'],
                qualityRank: 8
            },
            {
                name: 'Sander Dieleman',
                institution: 'Google DeepMind',
                homepage: 'https://sander.ai/',
                avatar: 'https://sander.ai/images/avatar.jpg',
                matches: ['Sander Dieleman', 'Sander AI'],
                specialty: 'Visual Generation',
                focus: ['diffusion', 'flow maps', 'generative modeling'],
                qualityRank: 8
            },
            {
                name: 'Jeremy Bernstein',
                institution: 'Thinking Machines Lab',
                homepage: 'https://jeremybernste.in/',
                avatar: 'https://jeremybernste.in/images/pages/me.jpg',
                matches: ['Jeremy Bernstein'],
                specialty: 'Efficient AI',
                focus: ['optimization', 'Muon', 'training dynamics'],
                qualityRank: 7
            }
        ];

        this.init();
    }

    async init() {
        this.setupTheme();
        this.setupEventListeners();
        await this.loadBloggers();
        this.applyFilters();
    }

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

            const homepage = card.dataset.homepage;
            if (homepage) {
                window.open(homepage, '_blank', 'noopener,noreferrer');
            }
        });
    }

    async loadBloggers() {
        const staticBlogs = typeof BlogXiv !== 'undefined'
            ? BlogXiv.prototype.getCuratedCommunityBlogs()
            : [];
        const blogs = window.BlogXivData
            ? await window.BlogXivData.getPublishedBlogs(staticBlogs)
            : staticBlogs;

        this.bloggers = this.profiles.map((profile) => {
            const posts = blogs.filter((blog) => this.matchesProfile(blog, profile));
            const sortedPosts = [...posts].sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
            const categories = [...new Set(sortedPosts.map((post) => post.category).filter(Boolean))];
            const primaryCategory = categories.includes(profile.specialty)
                ? profile.specialty
                : categories[0] || profile.specialty;
            const latestPost = sortedPosts[0];

            return {
                ...profile,
                id: this.slugify(profile.name),
                specialty: primaryCategory,
                blogsCount: sortedPosts.length,
                domainsCount: categories.length || 1,
                lastActive: latestPost?.publishDate || '2024-01-01',
                impactScore: profile.qualityRank * 100 + sortedPosts.length * 16 + categories.length * 6,
                bio: this.buildBio(profile, sortedPosts, categories),
                tags: [...new Set([...profile.focus, ...categories])].slice(0, 5),
                recentBlogs: sortedPosts.slice(0, 3).map((post) => ({
                    title: post.title,
                    url: post.url
                })),
                postsUrl: this.buildPostsUrl(profile),
                profileUrl: profile.homepage
            };
        });
    }

    matchesProfile(blog, profile) {
        const haystack = [
            blog.author,
            blog.sourceName,
            blog.title,
            blog.url
        ].filter(Boolean).join(' ').toLowerCase();

        return profile.matches.some((match) => haystack.includes(match.toLowerCase()));
    }

    buildPostsUrl(profile) {
        const authorQuery = encodeURIComponent(profile.matches[0]);
        return `explore.html?author=${authorQuery}`;
    }

    buildBio(profile, posts, categories) {
        const countText = posts.length === 1 ? '1 indexed BlogrXiv article' : `${posts.length} indexed BlogrXiv articles`;
        const domains = categories.length ? categories.join(', ') : profile.specialty;
        return `${profile.name} is highlighted for ${profile.focus.join(', ')}. BlogrXiv currently indexes ${countText} spanning ${domains}.`;
    }

    applyFilters() {
        let filtered = [...this.bloggers];

        if (this.currentFilters.specialty !== 'all') {
            filtered = filtered.filter((blogger) =>
                blogger.specialty === this.currentFilters.specialty ||
                blogger.tags.includes(this.currentFilters.specialty)
            );
        }

        if (this.searchQuery.length >= 2) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter((blogger) =>
                blogger.name.toLowerCase().includes(query) ||
                blogger.institution.toLowerCase().includes(query) ||
                blogger.bio.toLowerCase().includes(query) ||
                blogger.specialty.toLowerCase().includes(query) ||
                blogger.tags.some((tag) => tag.toLowerCase().includes(query)) ||
                blogger.recentBlogs.some((blog) => blog.title.toLowerCase().includes(query))
            );
        }

        switch (this.currentFilters.sort) {
            case 'blogs':
                filtered.sort((a, b) => b.blogsCount - a.blogsCount || b.impactScore - a.impactScore);
                break;
            case 'recent':
                filtered.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
                break;
            case 'name':
                filtered.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'impact':
            default:
                filtered.sort((a, b) => b.impactScore - a.impactScore || b.blogsCount - a.blogsCount);
                break;
        }

        this.filteredBloggers = filtered;
        this.renderBloggers();
    }

    handleSearch(query) {
        this.searchQuery = query.trim();
        this.applyFilters();
    }

    renderBloggers() {
        const authorsGrid = document.getElementById('authorsGrid');
        if (!authorsGrid) return;

        if (this.filteredBloggers.length === 0) {
            authorsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No bloggers found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }

        authorsGrid.innerHTML = this.filteredBloggers.map((blogger) => this.renderBloggerCard(blogger)).join('');
    }

    renderBloggerCard(blogger) {
        return `
            <article class="author-card" data-homepage="${this.escapeAttribute(blogger.homepage)}" tabindex="0" role="article" aria-label="Open ${this.escapeAttribute(blogger.name)} homepage">
                <div class="author-header">
                    <img class="author-avatar" src="${this.escapeAttribute(blogger.avatar)}" alt="${this.escapeAttribute(blogger.name)}" loading="lazy" referrerpolicy="no-referrer">
                    <div class="author-info">
                        <h3 class="author-name">${this.escapeHTML(blogger.name)}</h3>
                        <p class="author-title">${this.escapeHTML(blogger.specialty)} Blogger</p>
                        <p class="author-institution">${this.escapeHTML(blogger.institution)}</p>
                    </div>
                </div>

                <div class="author-bio">
                    <p>${this.escapeHTML(blogger.bio)}</p>
                </div>

                <div class="author-tags">
                    ${blogger.tags.map((tag) => `<span class="tag">${this.escapeHTML(tag)}</span>`).join('')}
                </div>

                <div class="author-stats">
                    <div class="stat">
                        <span class="stat-number">${blogger.blogsCount}</span>
                        <span class="stat-label">Indexed</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${blogger.domainsCount}</span>
                        <span class="stat-label">Domains</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${this.formatYear(blogger.lastActive)}</span>
                        <span class="stat-label">Latest</span>
                    </div>
                </div>

                <div class="author-recent">
                    <h4>Representative Blogs:</h4>
                    <ul>
                        ${blogger.recentBlogs.map((blog) => `<li>${this.escapeHTML(blog.title)}</li>`).join('')}
                    </ul>
                </div>

                <div class="author-actions">
                    <a class="btn btn-outline" href="${this.escapeAttribute(blogger.postsUrl)}">
                        Indexed Posts
                    </a>
                    <a class="btn btn-primary" href="${this.escapeAttribute(blogger.profileUrl)}" target="_blank" rel="noopener noreferrer">
                        Homepage
                    </a>
                </div>
            </article>
        `;
    }

    formatYear(date) {
        const parsed = new Date(date);
        return Number.isNaN(parsed.getTime()) ? '—' : String(parsed.getFullYear());
    }

    slugify(value) {
        return value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'blogger';
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

document.addEventListener('DOMContentLoaded', () => {
    if (window.loadingAnimation) {
        window.loadingAnimation.show('Loading blogger profiles...', 1200);
    }

    new BloggersPage();
});
