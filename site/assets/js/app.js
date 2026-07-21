// BlogrXiv JavaScript
(function(global) {
    if (global.BlogXivAvatarUtils) return;

    const escapeHTML = (value) => {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return String(value ?? '').replace(/[&<>"']/g, (char) => entities[char]);
    };

    const genericAvatarPatterns = [
        /google\.com\/s2\/favicons/i,
        /gstatic\.com\/images\/branding\/product\/2x\/googleg_48dp/i,
        /domain=github\.com/i
    ];

    const organizationPattern = /\b(openai|anthropic|google|deepmind|microsoft|nvidia|meta|fair|ai2|allenai|qwen|bytedance|seed|tencent|hunyuan|deepseek|mistral|cohere|adobe|apple|baidu|salesforce|stability|runway|wayve|world labs|black forest|hugging face|langchain|cursor|cognition|goodfire|metr|berkeley rdi|cmu ml|stanford hai|physical intelligence|pytorch|anyscale|adept|deepwiki|emergent mind|figure ai|modal|baseten|minimax|stepfun|skywork|hidream|rhymes|vectorspacelab|pku|alibaba|damo|vllm|llava|internvl|opengvlab|team|lab|labs|research|blog|contributors|collaborators|github)\b/i;

    const normalizeAuthorKey = (author) => String(author || '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    const officialAvatarByAuthor = new Map(Object.entries({
        'Sebastian Raschka': 'https://sebastianraschka.com/images/logos/photo-2021-08-25_compressed.jpg',
        'kalomaze': 'https://github.com/kalomaze.png',
        'Nathan Lambert': 'https://github.com/natolambert.png',
        'Lilian Weng': 'https://github.com/lilianweng.png',
        'Andrej Karpathy': 'https://karpathy.ai/assets/me_new.jpg',
        'Chris Olah': 'https://github.com/colah.png',
        'Francois Chollet': 'https://github.com/fchollet.png',
        'François Chollet': 'https://github.com/fchollet.png',
        'Yao Fu': 'https://github.com/FranxYao.png',
        'David Ha': 'https://github.com/hardmaru.png',
        'Patrick Mineault': 'https://github.com/patrickmineault.png',
        'Elvis Saravia': 'https://github.com/omarsar.png',
        'Hamel Husain': 'https://hamel.dev/hamel_transparent.png',
        'Simon Willison': 'https://github.com/simonw.png',
        'Eugene Yan': 'https://github.com/eugeneyan.png',
        'Su Jianlin': 'https://kexue.fm/usr/themes/geekg/images/avatar.png',
        '苏剑林': 'https://kexue.fm/usr/themes/geekg/images/avatar.png',
        'Tri Dao': 'https://tridao.me/assets/img/tri_photo_2021_04.jpeg?v=70239a90f4a7b7f7fce95223cab772a2',
        'Jay Alammar': 'https://github.com/jalammar.png',
        'Sander Dieleman': 'https://sander.ai/images/avatar.jpg',
        'Jeremy Bernstein': 'https://jeremybernste.in/images/pages/me.jpg',
        'Chip Huyen': 'https://github.com/chiphuyen.png',
        'Danijar Hafner': 'https://github.com/danijar.png',
        'Keller Jordan': 'https://github.com/kellerjordan.png'
    }).map(([author, avatar]) => [normalizeAuthorKey(author), avatar]));

    const isGenericAvatar = (avatar) => genericAvatarPatterns.some((pattern) => pattern.test(String(avatar || '')));

    const isOrganizationAuthor = (author) => organizationPattern.test(String(author || ''));

    const getOfficialAvatar = (author) => officialAvatarByAuthor.get(normalizeAuthorKey(author)) || '';

    const getGithubOwnerAvatar = (sourceUrl) => {
        const match = String(sourceUrl || '').match(/^https?:\/\/github\.com\/([^/?#]+)(?:[/?#]|$)/i);
        if (!match) return '';

        const owner = match[1];
        if (!owner || ['features', 'marketplace', 'topics', 'explore', 'blog', 'login'].includes(owner.toLowerCase())) {
            return '';
        }

        return `https://github.com/${owner}.png`;
    };

    const getGithubPagesAvatar = (value) => {
        const text = String(value || '');
        const match = text.match(/^https?:\/\/([a-z0-9-]+)\.github\.io(?:[/:?#]|$)/i)
            || text.match(/[?&]domain=([a-z0-9-]+)\.github\.io(?:[&#]|$)/i);
        if (!match) return '';

        const owner = match[1];
        const normalizedOwner = owner.toLowerCase();
        const sharedBlogOwners = new Set(['www', 'pages', 'iclr-blogposts', 'iclr-blog-track']);
        if (!owner || sharedBlogOwners.has(normalizedOwner)) return '';
        return `https://github.com/${owner}.png`;
    };

    const getNameInitial = (name) => {
        const normalized = String(name || '')
            .replace(/\bet al\.?/gi, '')
            .replace(/[*()[\]{}†‡]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!normalized) return 'B';

        const words = normalized
            .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
            .split(/\s+/)
            .filter(Boolean);

        if (!words.length) return normalized.slice(0, 1).toUpperCase();
        if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
        return `${words[0].slice(0, 1)}${words[words.length - 1].slice(0, 1)}`.toUpperCase();
    };

    const getInitials = (author) => {
        const cleaned = String(author || 'BlogrXiv')
            .replace(/\bet al\.?/gi, '')
            .replace(/\s+/g, ' ')
            .trim();

        const names = cleaned.split(/\s*(?:,| and | & |\+)\s*/i).filter(Boolean).slice(0, 2);
        if (names.length > 1) {
            return names.map((name) => getNameInitial(name).slice(0, 1)).join('').toUpperCase();
        }

        return getNameInitial(cleaned);
    };

    const getPalette = (name) => {
        const palettes = [
            ['#2563eb', '#7dd3fc', '#ffffff'],
            ['#0f766e', '#67e8f9', '#ffffff'],
            ['#7c3aed', '#f0abfc', '#ffffff'],
            ['#be123c', '#fda4af', '#ffffff'],
            ['#4338ca', '#93c5fd', '#ffffff'],
            ['#047857', '#a7f3d0', '#ffffff'],
            ['#a16207', '#fde68a', '#ffffff'],
            ['#334155', '#94a3b8', '#ffffff']
        ];
        let hash = 0;
        String(name || 'BlogrXiv').split('').forEach((char) => {
            hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
        });
        return palettes[Math.abs(hash) % palettes.length];
    };

    const createInitialsAvatar = (author) => {
        const initials = escapeHTML(getInitials(author));
        const [start, end, text] = getPalette(author);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${start}"/><stop offset="100%" stop-color="${end}"/></linearGradient></defs><rect width="128" height="128" rx="64" fill="url(#g)"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="${text}" font-family="Inter, Arial, sans-serif" font-size="46" font-weight="800" letter-spacing="0">${initials}</text></svg>`;
        return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
    };

    const shouldUseInitialsAvatar = (author, avatar) => {
        if (getOfficialAvatar(author)) return false;
        if (!avatar) return true;
        if (!isGenericAvatar(avatar)) return false;
        return !isOrganizationAuthor(author);
    };

    global.BlogXivAvatarUtils = {
        createInitialsAvatar,
        getOfficialAvatar,
        getGithubOwnerAvatar,
        getGithubPagesAvatar,
        shouldUseInitialsAvatar,
        renderAvatar(author, avatar, options = {}) {
            const className = options.className || 'author-avatar';
            const officialAvatar = getOfficialAvatar(author);
            const githubAvatar = !officialAvatar && isGenericAvatar(avatar)
                ? getGithubOwnerAvatar(options.sourceUrl) || getGithubPagesAvatar(options.sourceUrl) || getGithubPagesAvatar(avatar)
                : '';
            const useInitials = !officialAvatar && !githubAvatar && shouldUseInitialsAvatar(author, avatar);
            const src = officialAvatar || githubAvatar || (useInitials ? createInitialsAvatar(author) : avatar);
            const classes = useInitials ? `${className} author-avatar-initials` : className;

            return `<img class="${escapeHTML(classes)}" src="${escapeHTML(src)}" alt="${escapeHTML(author)}" loading="lazy" referrerpolicy="no-referrer">`;
        }
    };
})(typeof window !== 'undefined' ? window : globalThis);

window.BlogXivPagination = {
    getPageItems(items, currentPage, pageSize) {
        const start = (currentPage - 1) * pageSize;
        return items.slice(start, start + pageSize);
    },

    render(container, options) {
        if (!container) return;

        const {
            currentPage,
            totalItems,
            pageSize,
            onPageChange,
            label = 'Blog pages'
        } = options;
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const paginationId = `${container.id || 'blogGrid'}Pagination`;
        let pagination = document.getElementById(paginationId);

        if (totalItems <= pageSize) {
            pagination?.remove();
            return;
        }

        if (!pagination) {
            pagination = document.createElement('nav');
            pagination.id = paginationId;
            pagination.className = 'blog-pagination';
            pagination.setAttribute('aria-label', label);
            container.insertAdjacentElement('afterend', pagination);
        }

        const visiblePages = [];
        for (let page = 1; page <= totalPages; page += 1) {
            if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                visiblePages.push(page);
            }
        }

        const pageControls = [];
        visiblePages.forEach((page, index) => {
            if (index > 0 && page - visiblePages[index - 1] > 1) {
                pageControls.push('<span class="pagination-ellipsis" aria-hidden="true">...</span>');
            }
            pageControls.push(`
                <button class="pagination-page${page === currentPage ? ' is-active' : ''}" type="button" data-page="${page}" aria-label="Page ${page}"${page === currentPage ? ' aria-current="page"' : ''}>${page}</button>
            `);
        });

        pagination.innerHTML = `
            <button class="pagination-arrow" type="button" data-page="${currentPage - 1}" aria-label="Previous page" ${currentPage === 1 ? 'disabled' : ''}>&larr;</button>
            <div class="pagination-pages">${pageControls.join('')}</div>
            <button class="pagination-arrow" type="button" data-page="${currentPage + 1}" aria-label="Next page" ${currentPage === totalPages ? 'disabled' : ''}>&rarr;</button>
        `;

        pagination.querySelectorAll('button[data-page]').forEach((button) => {
            button.addEventListener('click', () => {
                const nextPage = Number.parseInt(button.dataset.page, 10);
                if (!Number.isFinite(nextPage) || nextPage === currentPage || nextPage < 1 || nextPage > totalPages) return;
                onPageChange(nextPage);
            });
        });
    },

    transition(container, update) {
        if (!container) {
            update();
            return;
        }

        const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            update();
            return;
        }

        container.classList.add('is-page-changing');
        window.setTimeout(() => {
            update();
            window.requestAnimationFrame(() => {
                container.classList.remove('is-page-changing');
            });
        }, 120);
    }
};

class BlogXiv {
    constructor() {
        this.currentTheme = this.getStoredTheme();
        this.searchTimeout = null;
        this.blogs = [];
        this.filteredBlogs = [];
        this.displayedBlogs = 12; // Show a richer curated set on the homepage
        this.blogsPerPage = 6; // Load 6 more blogs each time
        this.currentBlogPage = 1;
        this.blogPageSize = 9;
        this.searchInput = null;
        this.suggestionsContainer = null;
        this.currentSuggestions = [];
        this.activeSuggestionIndex = -1;
        this.navbar = null;
        this.motionMediaQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
        
        // Search overlay properties
        this.searchOverlay = null;
        this.searchOverlayInput = null;
        this.searchOverlayResults = null;
        this.searchOverlayActive = false;
        this.activeOverlayResultIndex = -1;
        this.searchFilterToggle = null;
        this.searchFilterPanel = null;
        this.searchFilterSelects = {};
        this.searchFilterState = {
            category: 'all',
            author: 'all'
        };
        this.filterPanelExpanded = false;
        this.toggleFilterPanel = this.toggleFilterPanel.bind(this);
        this.handleOverlayFilterChange = this.handleOverlayFilterChange.bind(this);
        
        this.handleOutsideClick = this.handleOutsideClick.bind(this);
        this.handleSearchKeydown = this.handleSearchKeydown.bind(this);
        this.handleScroll = this.handleScroll.bind(this);

        this.init();
    }

    async init() {
        this.setupTheme();
        this.ensureMainContentAnchor();
        this.injectSkipLink();
        this.injectSearchOverlay();
        this.injectSubmitNavigation();
        this.setupEventListeners();
        this.injectSidebar();
        this.setupRecommendationComposer();
        await this.loadSampleBlogs();
        this.applyInitialUrlFilters();
        this.renderBlogs();
        this.renderPopularBloggers();
        this.setupAnimations();
        this.deferVisitorMap();
    }

    isRepositoryRootPage() {
        return Boolean(document.querySelector('script[src^="site/assets/js/app.js"], script[src*="/site/assets/js/app.js"]'));
    }

    getAssetHref(path) {
        return this.isRepositoryRootPage() ? `site/${path}` : path;
    }

    getPageHref(page) {
        return this.isRepositoryRootPage() ? `site/${page}` : page;
    }

    getMediaHref(src) {
        if (!src || /^(https?:|data:|blob:|\/)/i.test(src)) {
            return src;
        }
        return this.isRepositoryRootPage() ? `site/${src}` : src;
    }

    escapeHTML(value) {
        const entities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };

        return String(value ?? '').replace(/[&<>"']/g, (char) => entities[char]);
    }

    escapeAttribute(value) {
        return this.escapeHTML(value);
    }

    renderAuthorAvatar(author, avatar, sourceUrl = '') {
        return window.BlogXivAvatarUtils.renderAvatar(author, this.getMediaHref(avatar), { sourceUrl });
    }

    deferVisitorMap() {
        const visitorMap = document.querySelector('.visitor-map');
        if (!visitorMap || document.getElementById('mapmyvisitors')) return;

        const loadVisitorMap = () => {
            if (document.getElementById('mapmyvisitors')) return;
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = 'mapmyvisitors';
            script.async = true;
            script.src = '//mapmyvisitors.com/map.js?d=yyIIyne0NYzfu0sZmsFXqa1fNVlZtaCTpDu6YiKHYxg&cl=ffffff&w=a';
            visitorMap.appendChild(script);
        };

        if (document.readyState === 'complete') {
            window.setTimeout(loadVisitorMap, 0);
        } else {
            window.addEventListener('load', loadVisitorMap, { once: true });
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
            // Theme still applies for the current page when storage is unavailable.
        }
        this.updateThemeIcon();
    }

    injectSkipLink() {
        if (document.querySelector('.skip-link')) return;
        const skipLink = document.createElement('a');
        skipLink.href = '#mainContent';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Skip to content';
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    ensureMainContentAnchor() {
        if (document.getElementById('mainContent')) return;
        let target = document.querySelector('main');
        if (!target) {
            target = document.querySelector('.page-header') ||
                     document.querySelector('.hero') ||
                     document.querySelector('.categories') ||
                     document.body.children[1];
        }
        if (target && !target.id) {
            target.id = 'mainContent';
        }
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

    injectSubmitNavigation() {
        const submitHref = this.getPageHref('submit.html');

        document.querySelectorAll('.nav-links').forEach((navLinks) => {
            if (navLinks.querySelector('a[href$="submit.html"]')) return;
            const link = document.createElement('a');
            link.href = submitHref;
            link.textContent = 'Submit';
            navLinks.appendChild(link);
        });

        document.querySelectorAll('.navbar').forEach((navbar) => {
            if (navbar.querySelector('.nav-links')) return;
            const actions = navbar.querySelector('.nav-actions');
            if (!actions || actions.querySelector('a[href$="submit.html"]')) return;
            const link = document.createElement('a');
            link.href = submitHref;
            link.className = 'btn btn-primary nav-submit-link';
            link.textContent = 'Submit';
            actions.appendChild(link);
        });
    }
    
    // Event Listeners
    setupEventListeners() {
        this.navbar = document.querySelector('.navbar');
        this.searchInput = document.getElementById('searchInput');
        this.suggestionsContainer = document.getElementById('searchSuggestions') || this.suggestionsContainer;

        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle && themeToggle.dataset.themeBound !== 'true') {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            themeToggle.dataset.themeBound = 'true';
        }

        // Search functionality - open overlay on click
        if (this.searchInput) {
            this.searchInput.setAttribute('autocomplete', 'off');
            this.searchInput.setAttribute('role', 'combobox');
            this.searchInput.setAttribute('aria-expanded', 'false');
            this.searchInput.setAttribute('aria-autocomplete', 'list');
            
            // Open search overlay when clicking on navbar search input
            this.searchInput.addEventListener('click', (e) => {
                e.preventDefault();
                this.openSearchOverlay();
            });
            
            // Keep original input behavior for other interactions
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            this.searchInput.addEventListener('keydown', this.handleSearchKeydown);
        }

        if (this.suggestionsContainer) {
            this.suggestionsContainer.setAttribute('role', 'listbox');
            if (this.searchInput) {
                this.searchInput.setAttribute('aria-controls', this.suggestionsContainer.id);
            }
        }

        // Category cards
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            card.addEventListener('click', () => this.filterByCategory(card.dataset.category));
            card.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                this.filterByCategory(card.dataset.category);
            });
        });
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
        
        // Intersection Observer for animations
        this.setupIntersectionObserver();

        // Dismiss suggestions when clicking outside search
        document.addEventListener('click', this.handleOutsideClick);

        // Hide suggestions via escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.hideSearchSuggestions();
            }
        });

        // Navbar scroll effect
        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', this.throttle(() => this.handleScroll(), 120));
            this.handleScroll();
        }

        if (this.motionMediaQuery && this.motionMediaQuery.addEventListener) {
            this.motionMediaQuery.addEventListener('change', () => this.setupAnimations());
        }
    }

    // Sidebar Injection
    injectSidebar() {
        // Create backdrop if not exists
        if (!document.querySelector('.sidebar-backdrop')) {
            const backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            document.body.appendChild(backdrop);
        }

        // Create sidebar if not exists
        if (!document.querySelector('.sidebar')) {
            const sidebar = document.createElement('aside');
            sidebar.className = 'sidebar';
            sidebar.setAttribute('aria-hidden', 'true');
            sidebar.innerHTML = `
                <div class="sidebar-header">
                    <div class="sidebar-brand">
                        <a href="index.html" class="brand-link" aria-label="BlogrXiv home">
                            <img src="${this.getAssetHref('assets/img/brand/blogrxiv.svg')}" alt="BlogrXiv" class="brand-logo sidebar-brand-logo" />
                        </a>
                    </div>
                    <button class="sidebar-close" data-no-loading="true" aria-label="Close sidebar">✕</button>
                </div>
                <nav class="sidebar-nav">
                    <a class="sidebar-link" href="${this.getPageHref('about.html')}">
                        <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        <span>About BlogrXiv</span>
                    </a>
                    <a class="sidebar-link" href="${this.getPageHref('bloggers.html')}">
                        <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z"></path><path d="M20 21a8 8 0 0 0-16 0"></path></svg>
                        <span>Bloggers</span>
                    </a>
                    <a class="sidebar-link" href="${this.getPageHref('categories.html')}">
                        <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span>Category</span>
                    </a>
                    <a class="sidebar-link" href="${this.getPageHref('explore.html')}">
                        <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"></path></svg>
                        <span>Blogs</span>
                    </a>
                    <a class="sidebar-link" href="${this.getPageHref('updates.html')}">
                        <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h5l2-7 4 14 2-7h5"></path></svg>
                        <span>Updates</span>
                    </a>
                    <a class="sidebar-link" href="${this.getPageHref('highlights.html')}">
                        <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"></path></svg>
                        <span>Highlights</span>
                    </a>
                    <a class="sidebar-link" href="${this.getPageHref('submit.html')}">
                        <svg class="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"></path><path d="m22 2-7 20-4-9-9-4 20-7z"></path></svg>
                        <span>Submit</span>
                    </a>
                </nav>
                <div class="sidebar-footer">
                    <div>© 2026 OpenEnvision｜BlogrXiv</div>
                </div>
            `;
            document.body.appendChild(sidebar);
        }

        // Insert the toggle beside the brand link. On the home page .nav-brand
        // is the link itself, so putting a button inside it would also trigger
        // navigation to index.html when the button is clicked.
        const navBrand = document.querySelector('.nav-brand');
        if (navBrand && !document.querySelector('.sidebar-toggle')) {
            const toggle = document.createElement('button');
            toggle.className = 'sidebar-toggle';
            toggle.type = 'button';
            toggle.setAttribute('aria-label', 'Open sidebar');
            toggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
            toggle.setAttribute('data-no-loading', 'true');
            if (navBrand.matches('a')) {
                navBrand.parentNode.insertBefore(toggle, navBrand);
            } else {
                navBrand.insertBefore(toggle, navBrand.firstChild);
            }
        }

        // Bind events
        this.bindSidebarEvents();
    }

    bindSidebarEvents() {
        const sidebar = document.querySelector('.sidebar');
        const backdrop = document.querySelector('.sidebar-backdrop');
        const toggle = document.querySelector('.sidebar-toggle');
        const closeBtn = document.querySelector('.sidebar-close');
        let previouslyFocusedElement = null;

        const open = () => {
            if (!sidebar) return;
            previouslyFocusedElement = document.activeElement;
            sidebar.classList.add('open');
            document.body.classList.add('sidebar-open');
            sidebar.setAttribute('aria-hidden', 'false');
            if (backdrop) backdrop.classList.add('active');
            if (closeBtn) {
                closeBtn.focus();
            }
        };

        const close = () => {
            if (!sidebar) return;
            sidebar.classList.remove('open');
            document.body.classList.remove('sidebar-open');
            sidebar.setAttribute('aria-hidden', 'true');
            if (backdrop) backdrop.classList.remove('active');
            if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
                previouslyFocusedElement.focus();
            }
        };

        if (toggle) toggle.addEventListener('click', open);
        if (closeBtn) closeBtn.addEventListener('click', close);
        if (backdrop) backdrop.addEventListener('click', close);

        // Close on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') close();
        });

        // Close after navigation
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.addEventListener('click', () => close());
        });
    }

    setupRecommendationComposer() {
        const form = document.getElementById('recommendationComposer');
        if (!form || form.dataset.bound === 'true') return;
        form.dataset.bound = 'true';

        const getValues = () => {
            const values = new FormData(form);
            return {
                title: values.get('title')?.toString().trim() || '',
                url: values.get('url')?.toString().trim() || '',
                author: values.get('author')?.toString().trim() || '',
                category: values.get('category')?.toString().trim() || '',
                summary: values.get('summary')?.toString().trim() || '',
                value: values.get('value')?.toString().trim() || '',
                tags: values.get('tags')?.toString().trim() || ''
            };
        };

        const buildBody = (values) => [
            `### Blog title\n${values.title}`,
            `### Canonical URL\n${values.url}`,
            `### Author / Lab / Organization\n${values.author}`,
            `### Suggested BlogrXiv category\n${values.category}`,
            `### Suggested tags\n${values.tags || 'Not specified'}`,
            `### Short summary\n${values.summary}`,
            `### Why is this technically valuable?\n${values.value}`
        ].join('\n\n');

        const validate = (values) => {
            const missing = ['title', 'url', 'author', 'category', 'summary', 'value'].find((field) => !values[field]);
            if (missing) {
                form.querySelector(`[name="${missing}"]`)?.focus();
                return false;
            }
            return true;
        };

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const values = getValues();
            if (!validate(values)) return;
            const params = new URLSearchParams({
                category: 'ideas',
                title: `[Recommendation] ${values.title}`,
                body: buildBody(values)
            });
            window.open(`https://github.com/OpenEnvision/BlogXiv/discussions/new?${params.toString()}`, '_blank', 'noopener,noreferrer');
        });

        document.getElementById('emailRecommendationDraft')?.addEventListener('click', () => {
            const values = getValues();
            if (!validate(values)) return;
            const params = new URLSearchParams({
                subject: `BlogrXiv Blog Link Recommendation: ${values.title}`,
                body: buildBody(values)
            });
            window.location.href = `mailto:juanxitian1031@gmail.com,wanghanqing0424@gmail.com?${params.toString()}`;
        });
    }

    // Search Overlay Injection
    injectSearchOverlay() {
        // Create search overlay if not exists
        if (!document.querySelector('.search-overlay')) {
            const searchOverlay = document.createElement('div');
            searchOverlay.className = 'search-overlay';
            searchOverlay.innerHTML = `
                <div class="search-overlay-content">
                    <div class="search-overlay-header">
                        <svg class="search-overlay-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <div class="search-overlay-input-wrapper">
                            <input type="text" class="search-overlay-input" placeholder="Search blogs, topics, or authors..." autocomplete="off" />
                        </div>
                        <button class="search-overlay-close" aria-label="Close search" data-no-loading="true">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="search-overlay-filters">
                        <button class="search-overlay-filter-toggle" type="button" aria-expanded="false">
                            + Add filters
                        </button>
                        <div class="search-overlay-filter-panel" aria-hidden="true">
                            <div class="search-overlay-filter-group">
                                <label for="searchFilterCategory">Category</label>
                                <div class="search-overlay-select-wrap">
                                    <select id="searchFilterCategory" data-filter="category" class="search-overlay-filter-select">
                                        <option value="all">All</option>
                                    </select>
                                    <svg class="search-overlay-select-chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </div>
                            </div>
                            <div class="search-overlay-filter-group">
                                <label for="searchFilterAuthor">Author</label>
                                <div class="search-overlay-select-wrap">
                                    <select id="searchFilterAuthor" data-filter="author" class="search-overlay-filter-select">
                                        <option value="all">All</option>
                                    </select>
                                    <svg class="search-overlay-select-chevron" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                                        <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="search-overlay-results"></div>
                    <div class="search-overlay-footer">
                        <div class="search-overlay-shortcuts">
                            <div class="search-overlay-shortcut">
                                <span class="search-overlay-key">Ctrl</span>
                                <span class="search-overlay-key">K</span>
                                <span>Open</span>
                            </div>
                            <div class="search-overlay-shortcut">
                                <span class="search-overlay-key">↑</span>
                                <span class="search-overlay-key">↓</span>
                                <span>Navigate</span>
                            </div>
                            <div class="search-overlay-shortcut">
                                <span class="search-overlay-key">↵</span>
                                <span>Select</span>
                            </div>
                            <div class="search-overlay-shortcut">
                                <span class="search-overlay-key">Esc</span>
                                <span>Close</span>
                            </div>
                        </div>
                        <div>
                            <span id="searchOverlayResultCount"></span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(searchOverlay);
        }

        this.bindSearchOverlayEvents();
    }

    bindSearchOverlayEvents() {
        this.searchOverlay = document.querySelector('.search-overlay');
        this.searchOverlayInput = document.querySelector('.search-overlay-input');
        this.searchOverlayResults = document.querySelector('.search-overlay-results');
        const closeBtn = document.querySelector('.search-overlay-close');
        this.searchFilterToggle = document.querySelector('.search-overlay-filter-toggle');
        this.searchFilterPanel = document.querySelector('.search-overlay-filter-panel');

        const filterSelects = document.querySelectorAll('.search-overlay-filter-select');
        this.searchFilterSelects = {};
        filterSelects.forEach(select => {
            const key = select.dataset.filter;
            if (!key) return;
            this.searchFilterSelects[key] = select;
            select.addEventListener('change', this.handleOverlayFilterChange);
        });
        this.syncFilterControls();
        this.setFilterPanelState(false);

        if (!this.searchOverlay) return;

        // Close on backdrop click
        this.searchOverlay.addEventListener('click', (e) => {
            if (e.target === this.searchOverlay) {
                this.closeSearchOverlay();
            }
        });

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSearchOverlay());
        }

        if (this.searchFilterToggle) {
            this.searchFilterToggle.addEventListener('click', this.toggleFilterPanel);
        }

        // Search input
        if (this.searchOverlayInput) {
            this.searchOverlayInput.addEventListener('input', (e) => {
                this.handleOverlaySearch(e.target.value);
            });

            this.searchOverlayInput.addEventListener('keydown', (e) => {
                this.handleOverlayKeydown(e);
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.searchOverlayActive) {
                this.closeSearchOverlay();
            }
        });

        // Ctrl+K or Cmd+K to open search overlay
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (!this.searchOverlayActive) {
                    this.openSearchOverlay();
                }
            }
        });
    }

    openSearchOverlay() {
        if (!this.searchOverlay) return;
        
        this.searchOverlayActive = true;
        this.searchOverlay.classList.add('active');
        document.body.classList.add('search-overlay-open');
        this.syncFilterControls();
        
        // Focus on overlay input
        setTimeout(() => {
            if (this.searchOverlayInput) {
                this.searchOverlayInput.focus();
            }
        }, 100);
        
        // Show initial results (all blogs)
        const currentQuery = this.searchOverlayInput ? this.searchOverlayInput.value : '';
        this.handleOverlaySearch(currentQuery || '');
    }

    closeSearchOverlay() {
        if (!this.searchOverlay) return;
        
        this.searchOverlayActive = false;
        this.searchOverlay.classList.remove('active');
        document.body.classList.remove('search-overlay-open');
        this.setFilterPanelState(false);
        
        // Clear search
        if (this.searchOverlayInput) {
            this.searchOverlayInput.value = '';
        }
        
        // Reset active index
        this.activeOverlayResultIndex = -1;
    }

    handleOverlaySearch(query) {
        if (!this.searchOverlayResults) return;

        const normalizedQuery = query.trim();
        let baseResults = [];

        if (normalizedQuery.length === 0) {
            baseResults = [...this.blogs];
        } else {
            baseResults = this.blogs.filter(blog =>
                blog.title.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.author.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.category.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.tags.some(tag => tag.toLowerCase().includes(normalizedQuery.toLowerCase()))
            );
        }

        const filteredResults = this.applySearchFilters(baseResults);
        const limitedResults = filteredResults.slice(0, 8);

        this.renderOverlayResults(limitedResults, normalizedQuery);
        this.updateOverlayResultCount(filteredResults.length, normalizedQuery);
    }

    applySearchFilters(results) {
        const { category, author } = this.searchFilterState;
        return results.filter(blog => {
            const matchCategory = category === 'all' || blog.category === category;
            const matchAuthor = author === 'all' || blog.author === author;
            return matchCategory && matchAuthor;
        });
    }

    hasActiveSearchFilters() {
        const { category, author } = this.searchFilterState;
        return (category && category !== 'all') || (author && author !== 'all');
    }

    toggleFilterPanel() {
        this.setFilterPanelState(!this.filterPanelExpanded);
    }

    setFilterPanelState(expanded) {
        this.filterPanelExpanded = expanded;
        if (this.searchFilterPanel) {
            this.searchFilterPanel.classList.toggle('active', expanded);
            this.searchFilterPanel.setAttribute('aria-hidden', expanded ? 'false' : 'true');
        }
        this.updateFilterToggleState();
    }

    updateFilterToggleState() {
        if (!this.searchFilterToggle) return;
        const filtersActive = this.hasActiveSearchFilters();
        const baseLabel = this.filterPanelExpanded ? 'Hide filters' : '+ Add filters';
        this.searchFilterToggle.textContent = filtersActive ? `${baseLabel} (applied)` : baseLabel;
        this.searchFilterToggle.classList.toggle('has-active-filters', filtersActive);
        this.searchFilterToggle.setAttribute('aria-expanded', this.filterPanelExpanded ? 'true' : 'false');
    }

    handleOverlayFilterChange(event) {
        const select = event.target;
        if (!select || !select.dataset.filter) return;
        const filterKey = select.dataset.filter;
        this.searchFilterState[filterKey] = select.value || 'all';
        this.updateFilterToggleState();
        const query = this.searchOverlayInput ? this.searchOverlayInput.value : '';
        this.handleOverlaySearch(query || '');
    }

    syncFilterControls() {
        Object.entries(this.searchFilterSelects).forEach(([key, select]) => {
            if (!select) return;
            const desired = this.searchFilterState[key] || 'all';
            const exists = Array.from(select.options).some(option => option.value === desired);
            select.value = exists ? desired : 'all';
            this.searchFilterState[key] = select.value;
        });
        this.updateFilterToggleState();
    }

    populateSearchFilterOptions() {
        if (!this.blogs || !this.blogs.length) return;
        const categories = Array.from(new Set(this.blogs.map(blog => blog.category))).sort((a, b) => a.localeCompare(b));
        const authors = Array.from(new Set(this.blogs.map(blog => blog.author))).sort((a, b) => a.localeCompare(b));

        if (this.searchFilterSelects.category) {
            this.populateFilterSelect(this.searchFilterSelects.category, categories, 'category');
        }
        if (this.searchFilterSelects.author) {
            this.populateFilterSelect(this.searchFilterSelects.author, authors, 'author');
        }
        this.syncFilterControls();
    }

    populateFilterSelect(select, values, type) {
        if (!select) return;
        const fragment = document.createDocumentFragment();
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = type === 'category' ? 'All Categories' : 'All Authors';
        fragment.appendChild(allOption);

        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            fragment.appendChild(option);
        });

        select.innerHTML = '';
        select.appendChild(fragment);
    }

    renderOverlayResults(results, query) {
        if (!this.searchOverlayResults) return;

        if (results.length === 0) {
            const filtersActive = this.hasActiveSearchFilters();
            this.searchOverlayResults.innerHTML = `
                <div class="search-overlay-empty">
                    <svg class="search-overlay-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3>No results found</h3>
                    <p>${filtersActive ? 'Try refining your keywords or clearing active filters.' : 'Try adjusting your search query or explore a new topic.'}</p>
                </div>
            `;
            return;
        }

        this.searchOverlayResults.innerHTML = results.map((blog, index) => `
            <div class="search-overlay-item" data-blog-id="${blog.id}" data-index="${index}" role="option">
                <div class="search-overlay-item-title">
                    <span>${this.highlightText(blog.title, query)}</span>
                </div>
                <div class="search-overlay-item-meta">
                    <span class="search-overlay-item-category">${blog.category}</span>
                    <span>•</span>
                    <span>${blog.author}</span>
                    <span>•</span>
                    <span>${blog.readTime}</span>
                </div>
            </div>
        `).join('');

        // Add click handlers
        this.searchOverlayResults.querySelectorAll('.search-overlay-item').forEach(item => {
            item.addEventListener('click', () => {
                const blogId = item.dataset.blogId;
                this.navigateToBlog(blogId);
            });
        });

        this.activeOverlayResultIndex = -1;
    }

    updateOverlayResultCount(count, query) {
        const resultCount = document.getElementById('searchOverlayResultCount');
        if (!resultCount) return;

        const filtersActive = this.hasActiveSearchFilters();

        if (count === 0) {
            resultCount.textContent = filtersActive ? 'No results (filters applied)' : 'No results';
            return;
        }

        if (query.length === 0 && !filtersActive) {
            resultCount.textContent = 'Recent posts';
            return;
        }

        const suffix = filtersActive ? ' • Filters applied' : '';
        resultCount.textContent = `${count} result${count !== 1 ? 's' : ''}${suffix}`;
    }

    handleOverlayKeydown(e) {
        const items = this.searchOverlayResults?.querySelectorAll('.search-overlay-item');
        if (!items || items.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.activeOverlayResultIndex = (this.activeOverlayResultIndex + 1) % items.length;
            this.updateOverlayResultHighlight();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.activeOverlayResultIndex = (this.activeOverlayResultIndex - 1 + items.length) % items.length;
            this.updateOverlayResultHighlight();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.activeOverlayResultIndex >= 0 && this.activeOverlayResultIndex < items.length) {
                const item = items[this.activeOverlayResultIndex];
                const blogId = item.dataset.blogId;
                this.navigateToBlog(blogId);
            }
        }
    }

    updateOverlayResultHighlight() {
        const items = this.searchOverlayResults?.querySelectorAll('.search-overlay-item');
        if (!items) return;

        items.forEach((item, index) => {
            const isActive = index === this.activeOverlayResultIndex;
            item.classList.toggle('active', isActive);
            if (isActive) {
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    }

    navigateToBlog(blogId) {
        this.closeSearchOverlay();
        window.location.href = `${this.getPageHref('blog-detail.html')}?id=${encodeURIComponent(blogId)}`;
    }
    
    // Search Functionality
    handleSearch(query) {
        clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(() => {
            const normalizedQuery = query.trim();

            if (normalizedQuery.length < 2) {
                this.filteredBlogs = this.blogs;
                this.displayedBlogs = 12; // Reset to initial count
                this.currentBlogPage = 1;
                this.renderBlogs();
                this.hideSearchSuggestions();
                return;
            }

            this.filteredBlogs = this.blogs.filter(blog =>
                blog.title.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.excerpt.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.author.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.category.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
                blog.tags.some(tag => tag.toLowerCase().includes(normalizedQuery.toLowerCase()))
            );

            this.displayedBlogs = 12; // Reset to initial count
            this.currentBlogPage = 1;
            this.renderBlogs();
            this.showSearchSuggestions(normalizedQuery);
        }, 300);
    }

    showSearchSuggestions(query = '') {
        const suggestions = this.suggestionsContainer || document.getElementById('searchSuggestions');
        if (!suggestions) return;

        this.suggestionsContainer = suggestions;

        if (!query || query.length < 2) {
            suggestions.style.display = 'none';
            if (this.searchInput) {
                this.searchInput.setAttribute('aria-expanded', 'false');
            }
            return;
        }

        const matchingBlogs = this.blogs.filter(blog =>
            blog.title.toLowerCase().includes(query.toLowerCase()) ||
            blog.author.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        if (matchingBlogs.length === 0) {
            suggestions.style.display = 'none';
            if (this.searchInput) {
                this.searchInput.setAttribute('aria-expanded', 'false');
            }
            this.currentSuggestions = [];
            this.activeSuggestionIndex = -1;
            return;
        }

        this.currentSuggestions = matchingBlogs;
        this.activeSuggestionIndex = -1;
        suggestions.innerHTML = matchingBlogs.map(blog => `
            <div class="suggestion-item" role="option" data-blog-id="${blog.id}" id="suggestion-${blog.id}">
                <div class="suggestion-title">${this.highlightText(blog.title, query)}</div>
                <div class="suggestion-author">by ${blog.author}</div>
            </div>
        `).join('');

        suggestions.style.display = 'block';
        if (this.searchInput) {
            this.searchInput.setAttribute('aria-expanded', 'true');
            this.searchInput.setAttribute('aria-activedescendant', '');
        }

        // Add click handlers to suggestions
        suggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const blogId = item.dataset.blogId;
                this.selectSuggestionById(blogId);
            });
        });

        this.updateSuggestionHighlight();
    }

    hideSearchSuggestions() {
        const suggestions = this.suggestionsContainer || document.getElementById('searchSuggestions');
        if (suggestions) {
            suggestions.style.display = 'none';
        }
        this.currentSuggestions = [];
        this.activeSuggestionIndex = -1;
        if (this.searchInput) {
            this.searchInput.setAttribute('aria-expanded', 'false');
            this.searchInput.removeAttribute('aria-activedescendant');
        }
    }

    updateSuggestionHighlight() {
        if (!this.suggestionsContainer) return;
        const items = Array.from(this.suggestionsContainer.querySelectorAll('.suggestion-item'));
        items.forEach((item, index) => {
            const isActive = index === this.activeSuggestionIndex;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', isActive ? 'true' : 'false');
            if (isActive && this.searchInput) {
                this.searchInput.setAttribute('aria-activedescendant', item.id);
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    handleSearchKeydown(event) {
        if (!this.currentSuggestions.length) {
            if (event.key === 'Escape') {
                this.hideSearchSuggestions();
            }
            return;
        }

        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (event.key === 'ArrowDown') {
                this.activeSuggestionIndex = (this.activeSuggestionIndex + 1) % this.currentSuggestions.length;
            } else {
                this.activeSuggestionIndex = (this.activeSuggestionIndex - 1 + this.currentSuggestions.length) % this.currentSuggestions.length;
            }
            this.updateSuggestionHighlight();
        } else if (event.key === 'Enter') {
            event.preventDefault();
            if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < this.currentSuggestions.length) {
                const suggestion = this.currentSuggestions[this.activeSuggestionIndex];
                this.selectSuggestionById(suggestion.id);
            }
        } else if (event.key === 'Escape') {
            this.hideSearchSuggestions();
        }
    }

    selectSuggestionById(blogId) {
        const blog = this.blogs.find(item => String(item.id) === String(blogId));
        if (blog && this.searchInput) {
            this.searchInput.value = blog.title;
        }
        this.hideSearchSuggestions();
        this.scrollToBlog(blogId);
    }

    highlightText(text, query) {
        if (!query || !query.trim()) return text;
        const safeQuery = this.escapeRegExp(query);
        if (!safeQuery) return text;
        const regex = new RegExp(`(${safeQuery})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    escapeRegExp(value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    scrollToBlog(blogId) {
        const blogElement = document.querySelector(`[data-blog-id="${blogId}"]`);
        if (blogElement) {
            blogElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                if (typeof blogElement.focus === 'function') {
                    try {
                        blogElement.focus({ preventScroll: true });
                    } catch (error) {
                        blogElement.focus();
                    }
                }
            }, 400);
        }
    }
    
    // Category Filtering
    filterByCategory(category) {
        // Map lowercase category names to proper case for URL
        const categoryMap = {
            'multimodal-model': 'Multimodal Model',
            'visual-generation': 'Visual Generation',
            'world-model': 'World Model',
            'ai-agents': 'AI Agents',
            'agent': 'AI Agents',
            'agents': 'AI Agents',
            'efficient-ai': 'Efficient AI',
            'foundation-model': 'Foundation Model',
            'llm': 'LLM & MLLM',
            'mllm': 'LLM & MLLM',
            'llm-mllm': 'LLM & MLLM',
            'trustworthy-ai': 'Trustworthy AI',
            'trustworthy': 'Trustworthy AI',
            'ai-safety': 'Trustworthy AI',
            'safety': 'Trustworthy AI',
            'gen-ai': 'Foundation Model',
            'optimization': 'Optimization',
            'how-to-become-a-researcher': 'Research Craft',
            'research-craft': 'Research Craft'
        };
        
        const mappedCategory = categoryMap[category.toLowerCase()] || category;
        
        // Direct redirect without loading animation
        window.location.href = `${this.getPageHref('explore.html')}?category=${encodeURIComponent(mappedCategory)}`;
    }
    
    scrollToSection(selector) {
        const section = document.querySelector(selector);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }

    handleOutsideClick(event) {
        if (!this.searchInput) return;
        if (!event.target.closest('.search-container')) {
            this.hideSearchSuggestions();
        }
    }
    
    // Blog Management
    getICLR2026Blogposts() {
        const posts =         [
                  [
                            "why-ai-evaluations-need-error-bars",
                            "Why AI Evaluations Need Statistical Rigor",
                            "As large language models (LLMs) and agentic systems advance, the field increasingly depends on fine-grained evaluation to compare models, guide research directions, and make deployment decisions. Yet evaluation pipelines often treat LLMs as deterministic functions, even though they are...",
                            "Zairah Mustahsan",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/why-ai-evaluations-need-error-bars/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-why-ai-evaluations-need-error-bars/layers-stochasticity.png",
                            "Real cover from first-image"
                  ],
                  [
                            "web-agent",
                            "Computer Use Survey - A Visual Survey of Computer Use Agents",
                            "In recent years, AI systems operating on the web and in computer environments have become a major topic of interest for both academia and industry. The goal of this blog is to provide an interesting and interactive survey of historical and recent works on computer use agents. We define...",
                            "Kenneth Marino, Farhan Ishmam, Ana Marasovic",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/web-agent/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-web-agent/ComputerUse.png",
                            "Real cover from first-image"
                  ],
                  [
                            "wait-do-we-need-to-wait",
                            "Wait, Do We Need to Wait? Revisiting Budget Forcing for Sequential Test-Time Scaling",
                            "In this blog post, we revisit the technique of budget forcing — a sequential test-time scaling technique that controls reasoning budget in reasoning models by appending a \"Wait\" keyword (or equivalently forcing a stop when the budget is exceeded), thereby determining whether the model c...",
                            "Pittawat Taveekitworachai, Kunat Pipatanakul",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/wait-do-we-need-to-wait/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-wait-do-we-need-to-wait/hero-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "vis-llm-latent-geometry",
                            "Visualizing LLM Latent Space Geometry Through Dimensionality Reduction",
                            "In this blog post, we extract, process, and visualize latent state geometries in Transformer-based language models through dimensionality reduction to build a better intuition of their internal dynamics. We demonstrate experiments with GPT-2 and LLaMa models, uncovering interesting geom...",
                            "Alex Ning, Vainateya Rangaraju, Yen-Ling Kuo",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/vis-llm-latent-geometry/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-vis-llm-latent-geometry/FIG_Residual_Stream_vs_Standard_View_Transformer-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "useful-calibrated-uncertainties",
                            "What (and What Not) are Calibrated Probabilities Actually Useful for?",
                            "This blogpost clarifies the practical usefulness of having a model with calibrated probabilities, something that is not often clearly stated in the calibration literature. We show that a calibrated model can be relied on to estimate average loss/reward, however, good calibration does no...",
                            "Guoxuan Xia",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/useful-calibrated-uncertainties/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-useful-calibrated-uncertainties/confused-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "unigramlm-manual",
                            "UnigramLM - An Attempt at Writing the Missing Manual",
                            "This post is my attempt to write down the UnigramLM tokenization algorithm cleanly and explicitly because, well, I still haven't found such a derivation and I think understanding the theory behind the method could help us make it better. I'll formalize the generative model around which...",
                            "Clara Meister",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/unigramlm-manual/",
                            "assets/img/covers/real/iclr2026-unigramlm-manual.png",
                            "Real cover from manual:original-page-screenshot"
                  ],
                  [
                            "trade-offs-in-llm-compute-for-reasoning-intensive-information-retrieval",
                            "Trade-offs in LLM Compute for Reasoning-Intensive Information Retrieval",
                            "The BRIGHT benchmark (ICLR 2025 Spotlight) revealed that reasoning-intensive information retrieval requires LLM-augmented pipelines, but this raises a critical resource allocation question: where should computational budget be invested for maximum effectiveness? We conduct a systematic...",
                            "Sreeja Apparaju, Nilesh Gupta",
                            "Efficient AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/trade-offs-in-llm-compute-for-reasoning-intensive-information-retrieval/",
                            "https://iclr-blogposts.github.io/2026/assets/html/2026-04-27-trade-offs-in-llm-compute-for-reasoning-intensive-information-retrieval/riir-llm-tradeoff-overview.png",
                            "Real cover from first-image"
                  ],
                  [
                            "tracing-principles-behind-modern-diffusion-models",
                            "Tracing the Principles Behind Modern Diffusion Models",
                            "Diffusion models can feel like a jungle of acronyms, but the core idea is simple: start from noise and gradually move a cloud of samples until it looks like real data. This post gives an intuition-first tour showing that DDPMs, score-based models, and flow matching are the same recipe w...",
                            "Chieh-Hsin Lai, Yang Song, Dongjun Kim, Yuki Mitsufuji, Stefano Ermon",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/tracing-principles-behind-modern-diffusion-models/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-tracing-principles-behind-modern-diffusion-models/dgm-learning.svg",
                            "Real cover from first-image"
                  ],
                  [
                            "the-evolution-of-flashattention",
                            "The Evolution of FlashAttention",
                            "Standard attention is a bottleneck. As Large Language Models scale, the memory-bound nature of attention operations and GPU memory hierarchy constraints create performance walls that raw compute power cannot solve alone. This post delivers a deep mathematical and technical breakdown of...",
                            "Harshwardhan Fartale, Akshata Kishore Moharir, Ashish Kattamuri",
                            "Efficient AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/the-evolution-of-flashattention/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-the-evolution-of-flashattention/Figure_1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "style-representations",
                            "Artistic Style and the Play of Neural Style Representations",
                            "How do neural networks perceive the complex human construct of artistic style? We explore the dynamic interplay between diverse machine representations of style and style definitions. We reveal a profound divergence where models often reject established historical narratives in favor of...",
                            "Abhishek Dangeti, Pavan Gajula, Vikram Jamwal, Vivek Srivastava",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/style-representations/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-style-representations/teaser-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "spatial-awareness",
                            "Where's the Chicken? Unpacking Spatial Awareness in Vision-Language Models",
                            "Modern vision-language models (VLMs) have achieved impressive success in recognizing and describing visual content, yet they continue to struggle with understanding spatial relationships. The limitation persists despite massive data and model scaling, suggesting that the root of the pro...",
                            "Jiyoon Pyo, Yao-Yi Chiang",
                            "Multimodal Model",
                            "https://iclr-blogposts.github.io/2026/blog/2026/spatial-awareness/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-spatial-awareness/1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "sparsity",
                            "Don't Look Up (Every Token): Escaping Quadratic Complexity via Geometric Patterns and Algorithms",
                            "Large Language Models (LLMs) have brought about a significant change in the field of artificial intelligence, where they have transitioned in scope from being specialized research tools to common resources that drive the next generation of software. With increasing model parameters and...",
                            "Aryan Sood, Tanvi Sharma, Vansh Agrawal",
                            "Efficient AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/sparsity/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-sparsity/1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "rl-with-gnns",
                            "Using Graph Neural Networks in Reinforcement Learning: A Practical Guide",
                            "Graph Neural Networks (GNNs) have achieved excellent results for modelling relational data in many supervised learning domains. However, much fewer works have explored their potential in Reinforcement Learning (RL) despite the ubiquity of practical problems defined over graphs. In this...",
                            "Alex Schutz, Victor-Alexandru Darvariu",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/rl-with-gnns/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-rl-with-gnns/gnn_main.svg",
                            "Real cover from first-image"
                  ],
                  [
                            "revisiting-the-nle",
                            "Revisiting The NetHack Learning Environment",
                            "The NetHack Learning Environment (NLE) was proposed as a challenging benchmark to test an agents abilities to perform complex reasoning over long time horizons in a stochastic, partially-observed, procedurally generated setting. To date, no approach, including those based on reinforceme...",
                            "Michael Matthews, Pierluca D'Oro, Anssi Kanervisto, Scott Fujimoto, Jakob Foerster, Mikael Henaff",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/revisiting-the-nle/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-revisiting-the-nle/nethack-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "rethinking-diffusion-langevin",
                            "Rethinking the Diffusion Model from a Langevin Perspective",
                            "Diffusion models are often introduced from multiple perspectives—such as VAEs, score matching, or flow matching—accompanied by dense and technically demanding mathematics that can be difficult for beginners to grasp. This article offers a fresh Langevin perspective on diffusion models t...",
                            "Candi Zheng, Yuan Lan",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/rethinking-diffusion-langevin/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-rethinking-diffusion-langevin/FastestDiffusionTheory_08-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "recur-refine-reason",
                            "Dynamic Parameter Reuse Augments Reasoning via Latent Chain of Thought",
                            "Standard language models often rely on massive parameter counts for their performance, utilizing each parameter only once per inference pass. This prompts consideration of recurrent structures, where models reuse parameters across sequential time, depth, or training progression to achie...",
                            "Kaitlin Maile, Joao Sacramento",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/recur-refine-reason/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-recur-refine-reason/midas-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "probabilistic-circuits-for-uncertainty-quantification",
                            "Probabilistic Circuits for Uncertainty Quantification",
                            "Deep learning models struggle with epistemic uncertainty quantification, often exhibiting blind confidence on out-of-distribution data. This work reviews on Probabilistic Circuits (PCs) as a versatile framework for rigorous, tractable reasoning. PCs model the joint probability distribut...",
                            "Maternus Herold, Konstantin von Gaisberg-Helfenberg",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/probabilistic-circuits-for-uncertainty-quantification/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-probabilistic-circuits-for-uncertainty-quantification/illustration_epistemic_vs_aleatoric_uncertainty-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "precision-extraction",
                            "Extracting Model Precision from 20 Logprobs",
                            "We demonstrate that the internal floating-point precision of language models can be inferred from API-exposed logprobs. Our key insight is that log-softmax shifts all logits by a shared constant, and we can search for shift values that map logprobs back to values representable in a give...",
                            "Yiming Zhang, Javier Rando, Florian Tramer, Daphne Ippolito, Nicholas Carlini",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/precision-extraction/",
                            "assets/img/covers/real/iclr2026-precision-extraction.png",
                            "Real cover from manual:original-page-screenshot"
                  ],
                  [
                            "ppo-batch-size",
                            "Effect of Parallel Environments and Rollout Steps in PPO",
                            "The blog post explores batch size in PPO - what happens when we increase the number of parallel environments versus the number of rollout steps, while keeping the total samples per update fixed. We discuss how this affects bias and variance in gradient estimation.",
                            "Teerthaa Parakh",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/ppo-batch-size/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-ppo-batch-size/data_distribution.png",
                            "Real cover from first-image"
                  ],
                  [
                            "polar-svd",
                            "Faster SVD via Accelerated Newton-Schulz Iteration",
                            "Traditional SVD algorithms rely heavily on QR factorizations, which scale poorly on GPUs. We show how the recently proposed Chebyshev-Accelerated Newton-Schulz (CANS) iteration can replace them and produce an SVD routine that is faster across a range of matrix types and precisions.",
                            "Askar Tsyganov, Uliana Parkina, Ekaterina Grishina, Sergey Samsonov, Maxim Rakhuba",
                            "Efficient AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/polar-svd/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-polar-svd/square.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "performative-prediction",
                            "Performative Prediction made practical",
                            "Performative Prediction studies settings where deploying a model induces a distribution shift in the data with the aim of building robust and good-peforming models under these post-deployment effects. Most existing work in this area is theoretical and relies on strict assumptions to con...",
                            "Javier Sanguino Bautiste, Thomas Kehrenberg, Carlos Rosety, Jose A. Lozano, Novi Quadrianto",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/performative-prediction/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-performative-prediction/ML%20vs%20PP.svg",
                            "Real cover from first-image"
                  ],
                  [
                            "nlp-for-human-sciences",
                            "Language as a Window Into the Mind: How NLP and LLMs Advance Human Sciences",
                            "Can NLP predict heroin-addiction outcomes, uncover suicide risk, or simulate (and even influence) brain activity? Could LLMs one day contribute to research worthy of a Nobel Prize for advancing our understanding of human behavior? And what role do NLP scientists play in shaping that pos...",
                            "Lotem Peled-Cohen, Nitay Calderon, Roi Reichart",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/nlp-for-human-sciences/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-nlp-for-human-sciences/icud-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "model-misspecification-in-sbi",
                            "Model Misspecification in Simulation-Based Inference - Recent Advances and Open Challenges",
                            "Model misspecification is a critical challenge in simulation-based inference (SBI), particularly in neural SBI methods that use simulated data to train flexible neural density estimators. These methods typically assume that simulators faithfully represent the true data-generating proces...",
                            "Jan Boelts",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/model-misspecification-in-sbi/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-model-misspecification-in-sbi/ward_et_al-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "mlip-practical",
                            "Evaluating Machine-Learned Inter-Atomic Potentials for a Practical Simulation Workflow",
                            "MLIPs are a promising paradigm in atomistic simulation, potentially offering the accuracy of ab-initio methods at the speed of empirical potentials. In this blog post, we give an overview of recent MLIP architectures, followed by an evaluation on a practical CO2 adsorption simulation. W...",
                            "Richard Strunk, Karnik Ram, Daniel Cremers",
                            "Foundation Model",
                            "https://iclr-blogposts.github.io/2026/blog/2026/mlip-practical/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-mlip-practical/schnet_architecture-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "mislead-lm",
                            "Is the evidence in 'Language Models Learn to Mislead Humans via RLHF' valid?",
                            "Language Models Learn to Mislead Humans Via RLHF (published at ICLR 2025) argues that RLHF can unintentionally train models to mislead humans – a phenomenon termed Unintentional-SOPHISTRY. However, our review of the paper's code and experiments suggests that a significant portion of the...",
                            "Aaryan Chandna, Lukas Fluri, Micah Carroll",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/mislead-lm/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-mislead-lm/quality_task_specific-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "misalign-failure-mode",
                            "Misalignment Patterns and RL Failure Modes in Frontier LLMs",
                            "With the rapid ability grokking of frontier Large Models (LMs), there is growing attention and research focus on aligning them with human values and intent via large scale reinforcement learning and other techniques. However, as LMs are getting stronger and more agentic, their misalignm...",
                            "Shu Yang, Hanqi Yan, Di Wang",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/misalign-failure-mode/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-misalign-failure-mode/fake_alignment-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "loneliness-social-misalignment",
                            "Loneliness as a Case Study for Social Reward Misalignment",
                            "The goal of this work is to use loneliness as a clear case study of proxy-reward misalignment in RL. We introduce a simulation where loneliness drifts over time and repeated short-term comfort increases an accumulated harm variable, then compare agents trained on engagement versus long-...",
                            "Samantha Adorno, Akshata Kishore Moharir, Ratna Kandala",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/loneliness-social-misalignment/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-loneliness-social-misalignment/figure1.png",
                            "Real cover from first-image"
                  ],
                  [
                            "llm-post-training",
                            "From REINFORCE to Dr. GRPO: A Unified Perspective on LLM Post-Training",
                            "Recently, many reinforcement learning (RL) algorithms have been applied to improve the post-training of large language models (LLMs). In this article, we aim to provide a unified perspective on the objectives of these RL algorithms, exploring how they relate to each other through the Po...",
                            "Qingfeng Lan",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/llm-post-training/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-llm-post-training/grpo-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "llm-bitter-lesson",
                            "The human knowledge loophole in the 'bitter lesson' for LLMs",
                            "Are LLMs a proof that the 'bitter lesson' holds for NLP? Perhaps the opposite is true: they work due to the scale of human data, and not just computation.",
                            "Anna Rogers",
                            "Foundation Model",
                            "https://iclr-blogposts.github.io/2026/blog/2026/llm-bitter-lesson/",
                            "assets/img/covers/real/iclr2026-llm-bitter-lesson.png",
                            "Real cover from manual:original-page-screenshot"
                  ],
                  [
                            "layered-ontology-model",
                            "The Layered Ontology of Models, Resolving the Epistemological Crisis of AI",
                            "With the rapid development of modern Artificial Intelligence, especially the emergence of Large Language Models (LLMs), we face a growing epistemological crisis: our engineering capabilities have far surpassed our philosophical vocabulary. We have built systems that demonstrate emergent...",
                            "Zhun Sun",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/layered-ontology-model/",
                            "assets/img/covers/real/iclr2026-layered-ontology-model.png",
                            "Real cover from manual:original-page-screenshot"
                  ],
                  [
                            "justrl",
                            "JustRL: Scaling a 1.5B LLM with a Simple RL Recipe",
                            "Training small reasoning models with RL has become a race toward complexity, using multi-stage pipelines, dynamic schedules, and curriculum learning. We ask whether this complexity necessary? We show that JustRL, a simple recipe with fixed hyperparameters, achieves state-of-the-art perf...",
                            "Bingxiang He, Zekai Qu, Zeyuan Liu, Yinghao Chen, Yuxin Zuo, Cheng Qian, Kaiyan Zhang, Weize Chen, Chaojun Xiao, Ganqu Cui, Ning Ding, Zhiyuan Liu",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/justrl/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-justrl/fig1_aime24_curves_added-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "interpret-model",
                            "How To Open the Black Box: Modern Models for Mechanistic Interpretability",
                            "Understanding how transformers represent and transform internal features is a core challenge in mechanistic interpretability. Traditional tools like attention maps and probing reveal only partial structure, often blurred by polysemanticity and superposition. New model-based methods offe...",
                            "Juntai Cao, Xiang Zhang, Raymond Li, Jiarui Ding",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/interpret-model/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-interpret-model/linear_probe-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "ideation-heuristics",
                            "Heuristic-Based Ideation for Guiding LLMs Toward Structured Creativity",
                            "Large Language Models (LLMs) hold immense promise for accelerating scientific discovery, yet current LLM-based ideation methods often rely on ad-hoc strategies rather than systematic frameworks. This blog introduces Ideation Heuristics, a systematic approach that formalizes 20 cognitive...",
                            "Xiao Liu, Haokun Liu, Chenhao Tan",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/ideation-heuristics/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-ideation-heuristics/heuristics-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "iclr-induction",
                            "In-context learning of representations can be explained by induction circuits",
                            "Park et al., 2025 demonstrate that large language models can learn to trace random walks on graphs presented in context, and observe that token representations reorganize to reflect the underlying graph structure. This has been interpreted as evidence that models 'flexibly manipulate th...",
                            "Andy Arditi",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/iclr-induction/",
                            "https://iclr-blogposts.github.io/2026/assets/html/2026-04-27-iclr-induction/fig_1/park_fig_1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "generalization-in-diffusion-as-infinite-hvae",
                            "Diffusion as Infinite Hierarchical VAEs - Do Diffusion Models Generalize Better than Deep VAEs?",
                            "Denoising Diffusion Probabilistic Models (DDPMs) and Hierarchical Variational Autoencoders (HVAEs) are typically studied as distinct paradigms for high-dimensional generative modeling. In this work, we bridge this gap by establishing a formal equivalence between DDPMs and HVAEs in the l...",
                            "François Bertholom, Khalid Oublal",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/generalization-in-diffusion-as-infinite-hvae/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-generalization-in-diffusion-as-infinite-hvae/slider_2.png",
                            "Real cover from first-image"
                  ],
                  [
                            "general-agent-evaluation",
                            "Ready For General Agents? Let's Test It.",
                            "Recent progress in LLMs has pushed the field from domain-specific systems toward increasingly general-purpose models. A similar shift is now emerging for AI agents: domain agents share reusable components and already operate across multiple domains with minimal adaptation. This capacity...",
                            "Elron Bandel, Asaf Yehudai, Michal Shmueli-Scheuer",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/general-agent-evaluation/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-general-agent-evaluation/benchmark_agent_cross-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "genai-archaeology",
                            "Generative AI Archaeology",
                            "We document the rise of the Generative AI Archaeologist, whose tools include linear algebra and probability theory, jailbreaking, and debuggers, compared to the metal detectors, pickaxes, and radar surveys of traditional archaeology. GenAI Archaeologists have reported findings both thro...",
                            "Desmond Elliott",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/genai-archaeology/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-genai-archaeology/intro_images-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "fractal-mas",
                            "Divide, Conquer, and Standardize - A Recursive Architecture for Multi-Agent Systems (MAS)",
                            "The scalability and robustness of current Multi-Agent Systems (MAS) are severely constrained by the heterogeneity of communication interfaces and a reliance on fragile ad-hoc integrations. We introduce FRACTAL-MAS, a recursive architecture that standardizes orchestration through the con...",
                            "Ronaldinho Vega Centeno Olivera, Allan M. de Souza, JULIO DOS REIS, Mateus da Silveira, Alejandro Núñez Arroyo",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/fractal-mas/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-fractal-mas/1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "flow-where-you-want",
                            "Flow Where You Want",
                            "This tutorial serves as an intuitive introduction to adding inference-time controls to pretrained flow matching and rectified flow generative models, to make them perform tasks they weren't trained to do. We take an unconditional flow model trained on MNIST digits and apply two types of...",
                            "Scott Hawley",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/flow-where-you-want/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-flow-where-you-want/vae_flow_diag-VAE.svg",
                            "Real cover from first-image"
                  ],
                  [
                            "flow-map-learning",
                            "From Trajectories to Operators — A Unified Flow Map Perspective on Generative Modeling",
                            "In this post, we reframe continuous-time generative modeling from integrating trajectories to learning two-time operators (flow maps). This operator view unifies diffusion, flow matching, and consistency models, and suggests a practical diagnostic — semigroup-consistent jumps yield both...",
                            "Anbu Huang",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/flow-map-learning/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-flow-map-learning/flow_map_vs_four_paradigms_clean-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "fixing-bottlenecks-in-state-space-models",
                            "Understanding and Fixing Bottlenecks in State Space Models: What Recency and Over-Smoothing Tell Us",
                            "State Space Models (SSMs), including Mamba, commonly suffer from two failure modes: recency bias, where the model biases strongly toward recent inputs, and over-smoothing, where hidden states become indistinguishable with depth. The paper argues that these issues originate from the lear...",
                            "Adrita Das, Dantong Zhu",
                            "Efficient AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/fixing-bottlenecks-in-state-space-models/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-fixing-bottlenecks-in-state-space-models/figure1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "feature-reduction",
                            "The effect of feature resolution on embedding dimension",
                            "High-dimensional data can be compressed into lower-dimensional embeddings while retaining a relatively large amount of relevant information, a phenomenon which, despite its widespread use, we struggle to fully explain. In this post, we use a common property of datasets - a limit on the...",
                            "Louise Beyers, Ruan van der Merwe",
                            "Efficient AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/feature-reduction/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-feature-reduction/combinations-compact-free.svg",
                            "Real cover from first-image"
                  ],
                  [
                            "economic-agents",
                            "AI Fundamentals: Valuing AI Agents & Data Assets",
                            "Large Language Model (LLM) agents now read the world through managed-context pipelines, write to it via tool-calling APIs, and continuously re-wire themselves with fresh experience. Stakeholders therefore need a Generally Accepted Accounting Principles (GAAP) compatible method to price...",
                            "Qingyun Sun, Zhenheng Tang, Huacan Wang",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/economic-agents/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-economic-agents/economic-value.png",
                            "Real cover from first-image"
                  ],
                  [
                            "dllm",
                            "dLLM - Rethinking Generation Beyond Autoregressive Models",
                            "Diffusion large language models (dLLMs) have emerged as a promising alternative to standard autoregressive (AR) Transformers, offering parallel token generation and flexible infilling instead of strict left-to-right decoding. This post walks through how masked discrete diffusion works a...",
                            "Suhas Pai, Xiaojun Ren",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/dllm/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-dllm/MaskedDiffusion-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "dissecting-non-determinism",
                            "Dissecting Non-Determinism in Large Language Models",
                            "The Large Language Models (LLMs) evolve into the backbone of complex decision-making systems, their inherent non-deterministic nature poses a significant threat to the validity of experimental results. This blog explores the impact of stochasticity, prompt brittleness, and LLM-as-a-Judg...",
                            "Mateus da Silveira, Ronaldinho Vega Centeno Olivera, Alejandro Núñez Arroyo, Allan M. de Souza, JULIO DOS REIS",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/dissecting-non-determinism/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-dissecting-non-determinism/figure1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "discretisation-invariance",
                            "Discretisation invariance",
                            "Discretisation invariance, a recent innovation in scientific machine learning, is a requirement that ensures an architecture can process inputs of different resolutions. In this post, we formally define this property, provide examples, generate datasets, train architectures, and discuss...",
                            "Vladimir Fanaskov, Ivan Oseledets",
                            "Foundation Model",
                            "https://iclr-blogposts.github.io/2026/blog/2026/discretisation-invariance/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-discretisation-invariance/waves-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "diffusion-inverse-problems",
                            "Navigating the Manifold — A Geometric Perspective on Diffusion-Based Inverse Problems",
                            "This blogpost develops a geometric and probabilistic lens on diffusion priors for inverse problems. We show that a wide range of methods mostly instantiate two operator-splitting paradigms, i.e., posterior-guided sampling and clean-space local-MAP optimization. Through manifold diagrams...",
                            "Anbu Huang",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/diffusion-inverse-problems/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-diffusion-inverse-problems/tweedie_anchor_sine.gif",
                            "Real cover from first-image"
                  ],
                  [
                            "diffusion-architecture-evolution",
                            "From U-Nets to DiTs: The Architectural Evolution of Text-to-Image Diffusion Models (2021–2025)",
                            "A comprehensive analysis of how diffusion model architectures evolved from U-Net backbones to Diffusion Transformers, transforming text-to-image generation capabilities. .",
                            "Zhenyuan Chen, Zechuan Zhang, Feng Zhang",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/diffusion-architecture-evolution/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-diffusion-architecture-evolution/teaser_white.png",
                            "Real cover from first-image"
                  ],
                  [
                            "destruction",
                            "Destruction is a General Strategy to Learn Generation; Diffusion's Strength is to Take it Seriously; Exploration is the Future",
                            "I present diffusion models as part of a family of machine learning techniques that withhold information from a model’s input and train it to guess the withheld information. I argue that diffusion's destroying approach to withholding is more flexible than typical hand-crafted information...",
                            "Pierre-André Noël",
                            "Visual Generation",
                            "https://iclr-blogposts.github.io/2026/blog/2026/destruction/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-destruction/A012_Identity_B012-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "content-promotion-agent-design",
                            "Content Promotion as a Strategic Game: How to Design Agentic Publishers for the Evolving Search Ecosystem in the GenAI Era?",
                            "With the rise of LLMs, publishers now operate in a dual world where traditional search and chat-like systems coexist. We propose a unified, game-theoretic view of this environment and highlight different tools, such as Multi-Agent Reinforcement Learning, that support the development of...",
                            "Tommy Mordo, Sagie Dekel, Tomer Kordonsky, Omer Madmon, Moshe Tennenholtz, Oren Kurland",
                            "AI Agents",
                            "https://iclr-blogposts.github.io/2026/blog/2026/content-promotion-agent-design/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-content-promotion-agent-design/banana-search.jpg",
                            "Real cover from first-image"
                  ],
                  [
                            "compositionality",
                            "Defining and quantifying compositional structure",
                            "Compositionality is thought to be crucial in human cognition and AI, but we lack a scientific understanding of what it is. What kind of data is compositionally structured? Can we mathematically quantify the amount and character of compositional structure? This blog post introduces a nov...",
                            "Eric Elmoznino, Guillaume Lajoie",
                            "Foundation Model",
                            "https://iclr-blogposts.github.io/2026/blog/2026/compositionality/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-compositionality/fig1-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "chunked-tabpfn",
                            "ChunkTabPFN: Training-free Long Context",
                            "Tabular foundation models struggle with large datasets due to the quadratic attention. While methods like FlashAttention promise scalability, practical challenges persist in their application to tabular foundation models. Our work resolves these hurdles, enabling efficient attention, an...",
                            "Renat Sergazinov, Shao-An Yin",
                            "Efficient AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/chunked-tabpfn/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-chunked-tabpfn/tabarena_long_results-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "budget-alignment",
                            "Budget Alignment: Making Models Reason in the User's Language",
                            "LLMs often reason internally in English even for non-English queries, limiting faithfulness and weakening human oversight in multilingual settings. We study budget alignment: lightweight methods to align a model’s reasoning language with the user’s language under modest data and compute...",
                            "Shan Chen, Jirui Qi, Zidi Xiong, Timothy Miller, Arianna Bisazza, Raquel Fernández, Danielle Bitterman",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/budget-alignment/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-budget-alignment/1a-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "bits-over-random",
                            "The 99% Success Paradox: When Near-Perfect Retrieval Equals Random Selection",
                            "For most of information retrieval's history, search results were designed for human consumers who could scan, filter, and discard irrelevant content. This shaped retrieval systems to optimize for finding and ranking relevant documents, but not for minimizing noise, because humans served...",
                            "Vyzantinos Repantis, Harshvardhan Singh, Tony Joseph, Cien Zhang, Akash Vishwakarma, Svetlana Karslioglu, Michael Thot, Ameya Gawde",
                            "Research Craft",
                            "https://iclr-blogposts.github.io/2026/blog/2026/bits-over-random/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-bits-over-random/bor_analysis_scifact-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "autoregressive-tokenization",
                            "Square Peg, Round Hole: Plugging Non-Sequential Data into Sequential Language Models",
                            "Autoregressive (AR) models are central to modern generative AI systems, yet their sequential inductive bias clashes with modalities that lack an obvious ordering, such as images, graphs, and point clouds. Despite this mismatch, AR models are widely used beyond language, owing to their s...",
                            "Julia Balla, Hannah Lawrence",
                            "LLM & MLLM",
                            "https://iclr-blogposts.github.io/2026/blog/2026/autoregressive-tokenization/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-autoregressive-tokenization/square_peg-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "an-overview-of-subliminal-learning",
                            "An Overview of Subliminal Learning",
                            "In this blog post we survey the current state of subliminal learning research. We conclude by discussing the gaps in the literature which would take these techniques from research interests to potential real world concerns.",
                            "Samuel Spillard, Daniel Martin",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/an-overview-of-subliminal-learning/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-an-overview-of-subliminal-learning/owls-480.webp",
                            "Real cover from first-image"
                  ],
                  [
                            "adversarial-conditioning-paradox",
                            "The Adversarial Conditioning Paradox: How Fine-Tuning Creates a Geometric Signature That Attacks Unknowingly Exploit",
                            "Adversarial attacks on NLP systems are designed to find inputs that fool models while minimizing perceptible changes, making them difficult to detect using similarity-based methods. We investigate whether Jacobian conditioning analysis can provide an orthogonal detection signal. Surpris...",
                            "Khazretgali Sapenov, Aidos Sapenov",
                            "Trustworthy AI",
                            "https://iclr-blogposts.github.io/2026/blog/2026/adversarial-conditioning-paradox/",
                            "https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-adversarial-conditioning-paradox/scm_v3_TextFooler_results-480.webp",
                            "Real cover from first-image"
                  ]
        ];

        return posts.map(([slug, title, excerpt, author, category, url, coverImage, coverAlt]) => ({
            id: 'iclr2026-' + slug,
            title,
            excerpt,
            author,
            authorAvatar: 'https://www.google.com/s2/favicons?domain=iclr-blogposts.github.io&sz=128',
            category,
            tags: ['ICLR Blogposts 2026', category],
            readTime: '10 min read',
            publishDate: '2026-04-27',
            sourceName: 'ICLR Blogposts',
            url,
            coverImage,
            coverAlt,
            coverFit: 'cover'
        }));
    }

    getICLRPastBlogposts() {
        const posts = [
          [
                    2025,
                    "analytical-simulated-dynamics",
                    "A primer on analytical learning dynamics of nonlinear neural networks",
                    "The learning dynamics of neural networks—in particular, how parameters change over time during training—describe how data, architecture, and algorithm interact in time to produce a trained neural network model. Characterizing these dynamics, in general, remains an open...",
                    "Rodrigo Carrasco-Davis, Erin Grant",
                    "Research Craft",
                    "32 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/analytical-simulated-dynamics/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-analytical-simulated-dynamics/fixed_teacher_student_saad_solla.png",
                    "Figure from A primer on analytical learning dynamics of nonlinear neural networks"
          ],
          [
                    2025,
                    "conditional-flow-matching",
                    "A Visual Dive into Conditional Flow Matching",
                    "Conditional flow matching (CFM) was introduced by three simultaneous papers at ICLR 2023, through different approaches (conditional matching, rectifying flows and stochastic interpolants). The main part of this post, Section 2, explains CFM by using both visual intuitions...",
                    "Anne Gagneux, Ségolène Martin, Rémi Emonet et al.",
                    "Visual Generation",
                    "44 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/conditional-flow-matching/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-conditional-flow-matching/T_theta_pushforward.svg",
                    "Figure from A Visual Dive into Conditional Flow Matching"
          ],
          [
                    2025,
                    "sparse-autodiff",
                    "An Illustrated Guide to Automatic Sparse Differentiation",
                    "In numerous applications of machine learning, Hessians and Jacobians exhibit sparsity, a property that can be leveraged to vastly accelerate their computation. While the usage of automatic differentiation in machine learning is ubiquitous, automatic sparse differentiation...",
                    "Adrian Hill, Guillaume Dalle, Alexis Montoison",
                    "Efficient AI",
                    "46 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/sparse-autodiff/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-sparse-autodiff/chainrule_num.svg",
                    "Figure from An Illustrated Guide to Automatic Sparse Differentiation"
          ],
          [
                    2025,
                    "analysing-the-spectral-biases-in-generative-models",
                    "Analysing The Spectral Biases in Generative Models",
                    "Diffusion and GAN models have demonstrated remarkable success in synthesizing high-quality images propelling them into various real-life applications across different domains. However, it has been observed that they exhibit spectral biases that impact their ability to...",
                    "Amitoj Singh Miglani, Vidit Aggarwal, Shweta Singh",
                    "Visual Generation",
                    "30 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/analysing-the-spectral-biases-in-generative-models/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-analysing-the-spectral-biases-in-generative-models/baboon_spectrum.png",
                    "Figure from Analysing The Spectral Biases in Generative Models"
          ],
          [
                    2025,
                    "opt-summary",
                    "Avoid Overclaims - Summary of Complexity Bounds for Algorithms in Minimization and Minimax Optimization",
                    "In this blog, we revisit the convergence analysis of first-order algorithms in minimization and minimax optimization problems. Within the classical oracle model framework, we review the state-of-the-art upper and lower bound results in various settings, aiming to identify...",
                    "Siqi Zhang, Yifan Hu",
                    "Research Craft",
                    "36 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/opt-summary/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-opt-summary/complexity_analysis.jpg",
                    "Figure from Avoid Overclaims - Summary of Complexity Bounds for Algorithms in Minimization and Minimax Optimization"
          ],
          [
                    2025,
                    "building-blocks-of-differentially-private-training",
                    "Building Blocks of Differentially Private Training",
                    "In this blog, we introduce the building blocks of training a neural network in a differentially private way.",
                    "Mahmoud Hegazy, Aymeric Dieuleveut",
                    "Trustworthy AI",
                    "43 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/building-blocks-of-differentially-private-training/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-building-blocks-of-differentially-private-training/first_salary_plot.png",
                    "Figure from Building Blocks of Differentially Private Training"
          ],
          [
                    2025,
                    "rethinking-llm-simulation",
                    "Can LLM Simulations Truly Reflect Humanity? A Deep Dive",
                    "Simulation powered by Large Language Models (LLMs) has become a promising method for exploring complex human social behaviors. However, the application of LLMs in simulations presents significant challenges, particularly regarding their capacity to accurately replicate the...",
                    "Qian Wang, Zhenheng Tang, Bingsheng He",
                    "World Model",
                    "21 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/rethinking-llm-simulation/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-rethinking-llm-simulation/psychological.png",
                    "Figure from Can LLM Simulations Truly Reflect Humanity? A Deep Dive"
          ],
          [
                    2025,
                    "pessa",
                    "Cross-Layer Orthogonal Vectors Pruning and Fine-Tuning",
                    "The absorb operation utilized in DeepSeek, which merges Query-Key and Value-Output weight matrices during inference, significantly increases parameter count and computational overhead. We observe that these absorbed matrices inherently exhibit low-rank structures. Motivated...",
                    "Fanxu Meng, Muhan Zhang",
                    "Efficient AI",
                    "35 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/pessa/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-pessa/absorb-decompose.png",
                    "Figure from Cross-Layer Orthogonal Vectors Pruning and Fine-Tuning"
          ],
          [
                    2025,
                    "do-not-write-jailbreak-papers",
                    "Do not write that jailbreak paper",
                    "Jailbreaks are becoming a new ImageNet competition instead of helping us better understand LLM security. The community should revisit their choices and focus on research that can uncover new security vulnerabilities.",
                    "Javier Rando",
                    "Trustworthy AI",
                    "12 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/do-not-write-jailbreak-papers/",
                    "assets/img/covers/real/iclr2025-do-not-write-jailbreak-papers.png",
                    "Real cover from manual:original-page-screenshot"
          ],
          [
                    2025,
                    "toddlers-vs-vismodels",
                    "Do vision models perceive objects like toddlers ?",
                    "Despite recent advances in artificial vision systems, humans are still more data-efficient at learning strong visual representations. Psychophysical experiments suggest that toddlers develop fundamental visual properties between the ages of one and three, which affect their...",
                    "Arthur Aubret, Jochen Triesch",
                    "Multimodal Model",
                    "30 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/toddlers-vs-vismodels/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-toddlers-vs-vismodels/overview.png",
                    "Figure from Do vision models perceive objects like toddlers ?"
          ],
          [
                    2025,
                    "localization",
                    "Does Editing Provide Evidence for Localization?",
                    "A basic aspiration for interpretability research in large language models is to localize semantically meaningful behaviors to particular components within the LLM. There are various heuristics for finding candidate locations within the LLM. Once a candidate localization is...",
                    "Zihao Wang, Victor Veitch",
                    "Trustworthy AI",
                    "26 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/localization/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-localization/hist_iti.png",
                    "Figure from Does Editing Provide Evidence for Localization?"
          ],
          [
                    2025,
                    "factual-validation-simplification",
                    "Factual Context Validation and Simplification: A Scalable Method to Enhance GPT Trustworthiness and Efficiency",
                    "As the deployment of Large Language Models (LLMs) like GPT expands across domains, mitigating their susceptibility to factual inaccuracies or hallucinations becomes crucial for ensuring reliable performance. This blog post introduces two novel frameworks that enhance...",
                    "Tianyi Huang",
                    "Trustworthy AI",
                    "31 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/factual-validation-simplification/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-factual-validation-simplification/hallucination.png",
                    "Figure from Factual Context Validation and Simplification: A Scalable Method to Enhance GPT Trustworthiness and Efficiency"
          ],
          [
                    2025,
                    "fine-tuning-token-based-large-multimodal-models",
                    "Fine-Tuning Token-Based Large Multimodal Models: What Works, What Doesn’t and What's Next",
                    "In this blog post, we explore the advancements and challenges in fine-tuning unified token-based large multimodal models, focusing on the Chameleon architecture and its fine-tuned variant, Anole. Released in 2024, these models exemplify a modern approach for integrating...",
                    "Zhulin Hu, Yan Ma, Jiadi Su et al.",
                    "Multimodal Model",
                    "32 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/fine-tuning-token-based-large-multimodal-models/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-fine-tuning-token-based-large-multimodal-models/figure1.png",
                    "Figure from Fine-Tuning Token-Based Large Multimodal Models: What Works, What Doesn’t and What's Next"
          ],
          [
                    2025,
                    "imagenet-flaws",
                    "Flaws of ImageNet, Computer Vision's Favorite Dataset",
                    "Since its release, ImageNet-1k has been a gold standard for evaluating model performance. It has served as the foundation of numerous other datasets and it has been widely used for pretraining. As models have improved, issues related to label correctness have become...",
                    "Nikita Kisel, Illia Volkov, Kateřina Hanzelková et al.",
                    "Multimodal Model",
                    "57 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/imagenet-flaws/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-imagenet-flaws/otter.png",
                    "Figure from Flaws of ImageNet, Computer Vision's Favorite Dataset"
          ],
          [
                    2025,
                    "flow-with-what-you-know",
                    "Flow With What You Know",
                    "This tutorial provides an accessible introduction to flow-matching and rectified flow models, which are increasingly at the forefront of generative AI applications. Typical descriptions of them are often laden with extensive probability-math equations, which can form...",
                    "Scott H. Hawley",
                    "Visual Generation",
                    "82 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/flow-with-what-you-know/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-flow-with-what-you-know/big_gaussian_and_spiral.png",
                    "Figure from Flow With What You Know"
          ],
          [
                    2025,
                    "interpret-classification",
                    "How do we interpret the outputs of a neural network trained on classification?",
                    "This post shows how neural networks trained for classification approximate the Bayesian posterior, explaining the theoretical basis and providing empirical examples.",
                    "Yudi Xie",
                    "Foundation Model",
                    "21 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/interpret-classification/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-interpret-classification/resnet50_inference.png",
                    "Figure from How do we interpret the outputs of a neural network trained on classification?"
          ],
          [
                    2025,
                    "visualizing-training",
                    "How to visualize training dynamics in neural networks",
                    "Deep learning practitioners typically rely on training and validation loss curves to understand neural network training dynamics. This blog post demonstrates how classical data analysis tools like PCA and hidden Markov models can reveal how neural networks learn different...",
                    "Michael Y. Hu, Shreyans Jain, Sangam Chaulagain et al.",
                    "Research Craft",
                    "11 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/visualizing-training/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-visualizing-training/loss_curve.png",
                    "Figure from How to visualize training dynamics in neural networks"
          ],
          [
                    2025,
                    "engram",
                    "In Search of the Engram in LLMs: A Neuroscience Perspective on the Memory Functions in AI Models",
                    "Large Language Models (LLMs) are enhancing our daily lives but also pose risks like spreading misinformation and violating privacy, highlighting the importance of understanding how they process and store information. This blogpost offers a fresh look into a...",
                    "Minsung Kim, Jea Kwon, Dong-Kyum Kim et al.",
                    "Trustworthy AI",
                    "18 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/engram/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-engram/engram_concept_v3.png",
                    "Figure from In Search of the Engram in LLMs: A Neuroscience Perspective on the Memory Functions in AI Models"
          ],
          [
                    2025,
                    "feature-geometry",
                    "Intricacies of Feature Geometry in Large Language Models",
                    "Studying the geometry of a language model's embedding space is an important and challenging task because of the various ways concepts can be represented, extracted, and used. Specifically, we want a framework that unifies both measurement (of how well a latent explains a...",
                    "Satvik Golechha, Lucius Bushnaq, Euan Ong et al.",
                    "LLM & MLLM",
                    "25 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/feature-geometry/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-feature-geometry/1.png",
                    "Figure from Intricacies of Feature Geometry in Large Language Models"
          ],
          [
                    2025,
                    "linrec",
                    "Linear Recurrences Accessible to Everyone",
                    "Investigating linear RNNs such as Mamba, can be challenging because they are currently not efficiently expressible in PyTorch. We propose the abstraction of linear recurrences to gain intuition for the computational structure of these emerging deep learning architectures...",
                    "Felix Sarnthein",
                    "LLM & MLLM",
                    "59 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/linrec/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-linrec/GA100-arch.png",
                    "Figure from Linear Recurrences Accessible to Everyone"
          ],
          [
                    2025,
                    "llm-democracy",
                    "LLMs' Potential Influences on Our Democracy: Challenges and Opportunities",
                    "With growing research and attention on LLMs' potential influence on political discourse and democratic processes, this blog post discusses the path forward and proposes future research questions in four broad areas: (1) evaluation of LLM political leanings, (2)...",
                    "Yujin Potter, Yejin Choi, David Rand et al.",
                    "Trustworthy AI",
                    "12 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/llm-democracy/",
                    "assets/img/covers/real/iclr2025-llm-democracy.png",
                    "Real cover from manual:original-page-screenshot"
          ],
          [
                    2025,
                    "lost-in-prediction",
                    "Lost in Prediction: Why Social Media Narratives Don't Help Macroeconomic Forecasting?",
                    "Can we predict the macroeconomy by analyzing the narratives people share on social media? We dove deep into the world of Narrative Economics, using NLP models to analyze millions of viral tweets and see if they could help us predict the fluctuations of macroeconomic...",
                    "Almog Gueta, Amir Feder, Zorik Gekhman et al.",
                    "Foundation Model",
                    "26 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/lost-in-prediction/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-lost-in-prediction/narrative_economics.png",
                    "Figure from Lost in Prediction: Why Social Media Narratives Don't Help Macroeconomic Forecasting?"
          ],
          [
                    2025,
                    "vlm-understanding",
                    "Mechanistic Interpretability Meets Vision Language Models: Insights and Limitations",
                    "Vision language models (VLMs), such as GPT-4o, have rapidly evolved, demonstrating impressive capabilities across diverse tasks. However, much of the progress in this field has been driven by engineering efforts, with a limited understanding of how these models work. The...",
                    "Yiming Liu*, Yuhui Zhang*, Serena Yeung-Levy",
                    "Trustworthy AI",
                    "29 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/vlm-understanding/",
                    "assets/img/covers/real/iclr2025-vlm-understanding.png",
                    "Real cover from manual:original-page-screenshot"
          ],
          [
                    2025,
                    "ebm-vs-mcmc",
                    "Models trained with unnormalized density functions: A need for a course correction",
                    "Training a generative model with energy or unnormalized density functions is considered an important problem for physical systems such as molecules. This provides a path to train generative models to sample from the much desired Boltzmann distribution in situations of data...",
                    "Rishal Aggarwal, Daniel Penaherrera, Justin Shao et al.",
                    "Visual Generation",
                    "41 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/ebm-vs-mcmc/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-ebm-vs-mcmc/ezgif-6-054ae5e4e4.gif",
                    "Figure from Models trained with unnormalized density functions: A need for a course correction"
          ],
          [
                    2025,
                    "mad",
                    "Multi-LLM-Agents Debate - Performance, Efficiency, and Scaling Challenges",
                    "Multi-Agent Debate (MAD) explores leveraging collaboration among multiple large language model (LLM) agents to improve test-time performance without additional training. This blog evaluates five MAD frameworks across nine benchmarks, revealing that current MAD methods fail...",
                    "Hangfan Zhang, Zhiyao Cui, Qiaosheng Zhang et al.",
                    "AI Agents",
                    "20 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/mad/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-mad/rounds.png",
                    "Figure from Multi-LLM-Agents Debate - Performance, Efficiency, and Scaling Challenges"
          ],
          [
                    2025,
                    "multimodal-learning",
                    "Multi-modal Learning: A Look Back and the Road Ahead",
                    "Advancements in language models has spurred an increasing interest in multi-modal AI — models that process and understand information across multiple forms of data, such as text, images and audio. While the goal is to emulate human-like ability to handle diverse...",
                    "Divyam Madaan, Sumit Chopra, Kyunghyun Cho",
                    "Multimodal Model",
                    "17 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/multimodal-learning/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-multimodal-learning/modality_types.png",
                    "Figure from Multi-modal Learning: A Look Back and the Road Ahead"
          ],
          [
                    2025,
                    "llm-knowledge-distil",
                    "On LLM Knowledge Distillation - A Comparison between Forward KL and Reverse KL",
                    "In this blog post, we delve into knowledge distillation techniques for Large Language Models (LLMs), with a particular focus on using Kullback-Leibler (KL) Divergence as the optimization objective. Knowledge distillation is a powerful tool to reduce model size while...",
                    "Anonymous",
                    "LLM & MLLM",
                    "24 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/llm-knowledge-distil/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-llm-knowledge-distil/fwd_kl.gif",
                    "Figure from On LLM Knowledge Distillation - A Comparison between Forward KL and Reverse KL"
          ],
          [
                    2025,
                    "fisher",
                    "On the Computation of the Fisher Information in Continual Learning",
                    "One of the most popular methods for continual learning with deep neural networks is Elastic Weight Consolidation (EWC), which involves computing the Fisher Information. The exact way in which the Fisher Information is computed is however rarely described, and multiple...",
                    "Gido M. van de Ven",
                    "Efficient AI",
                    "18 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/fisher/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-fisher/results_MNIST.png",
                    "Figure from On the Computation of the Fisher Information in Continual Learning"
          ],
          [
                    2025,
                    "llm-context-utilization",
                    "Open-Source vs Close-Source: The Context Utilization Challenge",
                    "This blog post aims to evaluate how well the most capable open-source long context large language models (LLMs) utilize context, using the Needle In A Haystack test. We adopt the task of chapter summarization for recently published books to minimize data contamination while...",
                    "Litu Ou",
                    "LLM & MLLM",
                    "21 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/llm-context-utilization/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-llm-context-utilization/llama_relevance.png",
                    "Figure from Open-Source vs Close-Source: The Context Utilization Challenge"
          ],
          [
                    2025,
                    "risks-private-evals",
                    "Peeking Behind Closed Doors: Risks of LLM Evaluation by Private Data Curators",
                    "A critical examination of the risks and challenges posed by private evaluators (for example ScaleAI) in the LLM landscape, highlighting financial incentives, conflicts of interest, and prevalence of evaluation biases even when acting in good faith.",
                    "Hritik Bansal*, Pratyush Maini*",
                    "Trustworthy AI",
                    "17 min read",
                    "2024-11-22",
                    "https://iclr-blogposts.github.io/2025/blog/risks-private-evals/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-risks-private-evals/risks-private-evals.png",
                    "Figure from Peeking Behind Closed Doors: Risks of LLM Evaluation by Private Data Curators"
          ],
          [
                    2025,
                    "pitfalls-of-evidence-based-ai-policy",
                    "Pitfalls of Evidence-Based AI Policy",
                    "Evidence is of irreplaceable value to policymaking. However, there are systematic biases shaping the evidence that the AI community produces. Holding regulation to too high an evidentiary standard can lead to systmatic neglect of certain risks. If the goal is evidence-based...",
                    "Stephen Casper, David Krueger, Dylan Hadfield-Menell",
                    "Trustworthy AI",
                    "37 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/pitfalls-of-evidence-based-ai-policy/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-pitfalls-of-evidence-based-ai-policy/birhane.png",
                    "Figure from Pitfalls of Evidence-Based AI Policy"
          ],
          [
                    2025,
                    "positional-embedding",
                    "Positional Embeddings in Transformer Models: Evolution from Text to Vision Domains",
                    "Positional encoding has become an essential element in transformer models, addressing their fundamental property of permutation invariance and allowing them to understand sequential relationships within data. This blog post examines positional encoding techniques...",
                    "Abhinav Kumar, Adesh Gupta, Mansi Gupta et al.",
                    "LLM & MLLM",
                    "32 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/positional-embedding/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-positional-embedding/RotaryPE1.png",
                    "Figure from Positional Embeddings in Transformer Models: Evolution from Text to Vision Domains"
          ],
          [
                    2025,
                    "foundation-adapter",
                    "Pre-training of Foundation Adapters for LLM Fine-tuning",
                    "Adapter-based fine-tuning methods insert small, trainable adapters into frozen pre-trained LLMs, significantly reducing computational costs while maintaining performance. However, despite these advantages, traditional adapter fine-tuning suffers from training instability...",
                    "Linh The Nguyen, Dat Quoc Nguyen",
                    "LLM & MLLM",
                    "9 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/foundation-adapter/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-foundation-adapter/Model.png",
                    "Figure from Pre-training of Foundation Adapters for LLM Fine-tuning"
          ],
          [
                    2025,
                    "calibrated-mia",
                    "Reassessing EMNLP 2024’s Best Paper: Does Divergence-Based Calibration for Membership Inference Attacks Hold Up?",
                    "TL;DR: No. A critical analysis of the EMNLP Best Paper proposing a divergence-based calibration for Membership Inference Attacks (MIAs). We explore its experimental shortcomings, issues with temporally shifted benchmarks, and what this means for machine learning awards.",
                    "Pratyush Maini, Anshuman Suri",
                    "Trustworthy AI",
                    "11 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/calibrated-mia/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-calibrated-mia/groundhog.avif",
                    "Figure from Reassessing EMNLP 2024’s Best Paper: Does Divergence-Based Calibration for Membership Inference Attacks Hold Up?"
          ],
          [
                    2025,
                    "reexamining-the-aleatoric-and-epistemic-uncertainty-dichotomy",
                    "Reexamining the Aleatoric and Epistemic Uncertainty Dichotomy",
                    "When discussing uncertainty estimates for the safe deployment of AI agents in the real world, the field typically distinguishes between aleatoric and epistemic uncertainty. This dichotomy may seem intuitive and well-defined at first glance, but this blog post reviews...",
                    "Michael Kirchhof, Gjergji Kasneci, Enkelejda Kasneci",
                    "Trustworthy AI",
                    "23 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/reexamining-the-aleatoric-and-epistemic-uncertainty-dichotomy/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-reexamining-the-aleatoric-and-epistemic-uncertainty-dichotomy/aleatoric_epistemic_clouds.jpg",
                    "Figure from Reexamining the Aleatoric and Epistemic Uncertainty Dichotomy"
          ],
          [
                    2025,
                    "repurposing",
                    "Repurposing in AI: A Distinct Approach or an Extension of Creative Problem Solving?",
                    "Creativity is defined as the ability to produce novel, useful, and surprising ideas. A sub area of creativity is creative problem solving, the capacity of an agent to discover novel and previously unseen ways to accomplish a task, according to its perspective. However...",
                    "Aissatou Diallo, Antonios Bikakis, Luke Dickens et al.",
                    "AI Agents",
                    "23 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/repurposing/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-repurposing/cps_cx.png",
                    "Figure from Repurposing in AI: A Distinct Approach or an Extension of Creative Problem Solving?"
          ],
          [
                    2025,
                    "linear-gnn-convergence-restated",
                    "Restating the Proof of Linear Convergence for Linear GNNs",
                    "We lead the readers through the core proof of a pioneering paper that studies the training dynamics of linear GNNs. First, we reorganize the proof and provide a more concise and reader-friendly version, highlighting several key components. In doing so, we identify a hidden...",
                    "Huayi Tang*, Yuhe Guo*, Yong Liu et al.",
                    "Research Craft",
                    "24 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/linear-gnn-convergence-restated/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-linear-gnn-convergence-restated/fig1-V3.png",
                    "Figure from Restating the Proof of Linear Convergence for Linear GNNs"
          ],
          [
                    2025,
                    "rethinking-graph-prompts",
                    "Rethinking Graph Prompts: Unraveling the Power of Data Manipulation in Graph Neural Networks",
                    "Graph Neural Networks (GNNs) have transformed graph learning but face challenges like distribution shifts, data anomalies, and adversarial vulnerabilities. Graph prompt emerges as a novel solution, enabling data transformation to align graph data with pre-trained models...",
                    "Chenyi Zi, Bowen LIU, Xiangguo Sun et al.",
                    "Trustworthy AI",
                    "31 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/rethinking-graph-prompts/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-rethinking-graph-prompts/figure2.png",
                    "Figure from Rethinking Graph Prompts: Unraveling the Power of Data Manipulation in Graph Neural Networks"
          ],
          [
                    2025,
                    "spd",
                    "SPD Attack - Prevention of AI Powered Image Editing by Image Immunization",
                    "Recent advances in image-to-image editing models offer both benefits and risks. While they enhance creativity, accessibility, and applications in fields ranging from medicine to environmental science, they can also enable misuse, such as identity manipulation, copyright...",
                    "Shorya Singhal*, Parth Badgujar*, Devansh Bharadwaj*",
                    "Trustworthy AI",
                    "23 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/spd/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-spd/1.jpg",
                    "Figure from SPD Attack - Prevention of AI Powered Image Editing by Image Immunization"
          ],
          [
                    2025,
                    "steering-llms-behavior",
                    "Steering LLMs' Behavior with Concept Activation Vectors",
                    "Concept activation vectors have been shown to take effects in safety concepts, efficiently and effectively guiding a considerable number of open-source large language models (LLMs) to respond positively to malicious instructions. In this blog, we aim to explore the...",
                    "Ruixuan Huang, Shuai Wang",
                    "Trustworthy AI",
                    "21 min read",
                    "2025-05-07",
                    "https://iclr-blogposts.github.io/2025/blog/steering-llms-behavior/",
                    "assets/img/covers/real/iclr2025-steering-llms-behavior.png",
                    "Real cover from manual:original-page-screenshot"
          ],
          [
                    2025,
                    "the-illustrated-alphafold",
                    "The Illustrated AlphaFold",
                    "We present the Illustrated AlphaFold, a visual walkthrough of the architecture and information flow of AlphaFold 3. We explain every model component and training detail, with particular focus on the advances since AlphaFold 2 – including the unified tokenization scheme that...",
                    "Elana Simon, Jake Silberg",
                    "Multimodal Model",
                    "73 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/the-illustrated-alphafold/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-the-illustrated-alphafold/single_and_pair_rep.png",
                    "Figure from The Illustrated AlphaFold"
          ],
          [
                    2025,
                    "the-lottery-llm-hyperthesis",
                    "The Lottery LLM Hypothesis, Rethinking What Abilities Should LLM Compression Preserve?",
                    "Motivated by reducing the computational and storage costs of LLMs, model compression and KV cache compression have attracted much attention from researchers. However, current methods predominantly emphasize maintaining the performance of compressed LLMs, as measured by...",
                    "Zhenheng Tang, Xiang Liu, Qian Wang et al.",
                    "LLM & MLLM",
                    "24 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/the-lottery-llm-hyperthesis/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-the-lottery-llm-hyperthesis/algorithm.png",
                    "Figure from The Lottery LLM Hypothesis, Rethinking What Abilities Should LLM Compression Preserve?"
          ],
          [
                    2025,
                    "towards-more-rigorous-llm-evals",
                    "Towards more rigorous evaluations of language models",
                    "As language models (LMs) become increasingly sophisticated and existing benchmarks approach saturation, the need for rigorous evaluation methods grows more pressing. Many evaluations lack the statistical rigour needed to draw meaningful conclusions, leading to a potential...",
                    "Desi R Ivanova, Ilija Ilievski, Momchil Konstantinov",
                    "Research Craft",
                    "52 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/towards-more-rigorous-llm-evals/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-towards-more-rigorous-llm-evals/template_gsm.png",
                    "Figure from Towards more rigorous evaluations of language models"
          ],
          [
                    2025,
                    "scalable-mcts",
                    "Understanding Methods for Scalable MCTS",
                    "Monte Carlo Tree Search (MCTS) is a versatile algorithm widely used for intelligent decision-making in complex, high-dimensional environments. While MCTS inherently improves with more compute, real-world applications often demand rapid decision-making under strict...",
                    "Will Knipe",
                    "AI Agents",
                    "27 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/scalable-mcts/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-scalable-mcts/mu_zero_scaling.png",
                    "Figure from Understanding Methods for Scalable MCTS"
          ],
          [
                    2025,
                    "calibration",
                    "Understanding Model Calibration - A gentle introduction and visual exploration of calibration and the expected calibration error (ECE)",
                    "To be considered reliable, a model must be calibrated so that its confidence in each decision closely reflects its true outcome. In this blogpost we'll take a look at the most commonly used definition for calibration and then dive into a frequently used evaluation measure...",
                    "Maja Pavlovic",
                    "Trustworthy AI",
                    "24 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/calibration/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-calibration/f1_reliability_diagram.png",
                    "Figure from Understanding Model Calibration - A gentle introduction and visual exploration of calibration and the expected calibration error (ECE)"
          ],
          [
                    2025,
                    "pocp",
                    "Why RoPE Struggles to Maintain Long-Term Decay in Long Sequences?",
                    "Rotary Position Embedding (RoPE) improves upon traditional positional encodings but struggles with long-term decay in contexts exceeding its training length, limiting the model's generalization to longer sequences. Our experiments suggest that this issue may stem from a...",
                    "Wei Shen, Chao Yin, Yuliang Liu et al.",
                    "LLM & MLLM",
                    "21 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/pocp/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-pocp/image.png",
                    "Figure from Why RoPE Struggles to Maintain Long-Term Decay in Long Sequences?"
          ],
          [
                    2025,
                    "anthropomorphic-ai",
                    "“I Am the One and Only, Your Cyber BFF”: Understanding the Impact of GenAI Requires Understanding the Impact of Anthropomorphic AI",
                    "State-of-the-art generative AI (GenAI) systems are increasingly prone to anthropomorphic behaviors, i.e., to generating outputs that are perceived to be human-like. While this has led to scholars increasingly raising concerns about possible negative impacts such...",
                    "Myra Cheng, Alicia DeVrio, Lisa Egede et al.",
                    "Trustworthy AI",
                    "16 min read",
                    "2025-04-28",
                    "https://iclr-blogposts.github.io/2025/blog/anthropomorphic-ai/",
                    "https://iclr-blogposts.github.io/2025/assets/img/2025-04-28-anthropomorphic-ai/key_components.png",
                    "Figure from “I Am the One and Only, Your Cyber BFF”: Understanding the Impact of GenAI Requires Understanding the Impact of Anthropomorphic AI"
          ],
          [
                    2024,
                    "language-model-development-as-a-new-subfield",
                    "A New Alchemy: Language Model Development as a Subfield?",
                    "This blog post makes the case that the body of research on language models become sufficiently large and mature that we can start thinking about “language model development” as a new subfield. To support this claim, we sketch out the focuses and methodologies of this new...",
                    "Colin Raffel",
                    "LLM & MLLM",
                    "12 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/language-model-development-as-a-new-subfield/",
                    "assets/img/covers/real/iclr2024-language-model-development-as-a-new-subfield.png",
                    "Real cover from manual:original-page-screenshot"
          ],
          [
                    2024,
                    "mode-switching",
                    "Behavioral Differences in Mode-Switching Exploration for Reinforcement Learning",
                    "In 2022, researchers from Google DeepMind presented an initial study on mode-switching exploration, by which an agent separates its exploitation and exploration actions more coarsely throughout an episode by intermittently and significantly changing its behavior policy. We...",
                    "Loren J Anderson",
                    "AI Agents",
                    "32 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/mode-switching/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-mode-switching/bike.png",
                    "Figure from Behavioral Differences in Mode-Switching Exploration for Reinforcement Learning"
          ],
          [
                    2024,
                    "dpi-fsvi",
                    "Bridging the Data Processing Inequality and Function-Space Variational Inference",
                    "This blog post explores the interplay between the Data Processing Inequality (DPI) , a cornerstone concept in information theory, and Function-Space Variational Inference (FSVI) within the context of Bayesian deep learning. The DPI governs the transformation and flow of...",
                    "Andreas Kirsch",
                    "Foundation Model",
                    "53 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/dpi-fsvi/",
                    "assets/img/covers/real/iclr2024-dpi-fsvi.png",
                    "Real cover from manual:original-page-screenshot"
          ],
          [
                    2024,
                    "diffusion-theory-from-scratch",
                    "Building Diffusion Model's theory from ground up",
                    "Diffusion Models, a new generative model family, have taken the world by storm after the seminal paper by Ho et al. [2020]. While diffusion models are often described as a probabilistic Markov Chains, their underlying principle is based on the decade-old theory of...",
                    "Ayan Das",
                    "Visual Generation",
                    "34 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/diffusion-theory-from-scratch/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-diffusion-theory-from-scratch/score_def.png",
                    "Figure from Building Diffusion Model's theory from ground up"
          ],
          [
                    2024,
                    "deqalg-reasoning",
                    "Deep Equilibrium Models For Algorithmic Reasoning",
                    "In this blogpost we discuss the idea of teaching neural networks to reach fixed points when reasoning. Specifically, on the algorithmic reasoning benchmark CLRS the current neural networks are told the number of reasoning steps they need, which they shouldn't be given...",
                    "Sophie Xhonneux, Yu He, Andreea Deac et al.",
                    "Research Craft",
                    "15 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/deqalg-reasoning/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-deqalg-reasoning/alg-reasoning-task.png",
                    "Figure from Deep Equilibrium Models For Algorithmic Reasoning"
          ],
          [
                    2024,
                    "double-descent-demystified",
                    "Double Descent Demystified",
                    "Identifying, Interpreting & Ablating the Sources of a Deep Learning Puzzle",
                    "Rylan Schaeffer, Zachary Robertson, Akhilan Boopathy et al.",
                    "Foundation Model",
                    "33 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/double-descent-demystified/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-double-descent-demystified/real_data_ablations/california_housing/unablated.png",
                    "Figure from Double Descent Demystified"
          ],
          [
                    2024,
                    "elaborating-on-the-value-of-flow-matching-for-density-estimation",
                    "Elaborating on the Value of Flow Matching for Density Estimation",
                    "The transfer of matching-based training from Diffusion Models to Normalizing Flows allows to fit expressive continuous normalizing flows efficiently and therefore enables their usage for different kinds of density estimation tasks. One particularly interesting task is...",
                    "Maternus Herold, Faried Abu Zaid",
                    "Visual Generation",
                    "21 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/elaborating-on-the-value-of-flow-matching-for-density-estimation/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-elaborating-on-the-value-of-flow-matching-for-density-estimation/imagenet.png",
                    "Figure from Elaborating on the Value of Flow Matching for Density Estimation"
          ],
          [
                    2024,
                    "exploring-meta-learned-curiosity-algorithms",
                    "Exploring Meta-learned Curiosity Algorithms",
                    "This blog post delves into Alet et al.'s ICLR 2020 paper, Meta-learning curiosity algorithms, which introduces a unique approach to meta-learning curiosity algorithms. Instead of meta-learning neural network weights, the focus is on meta-learning pieces of code, allowing it...",
                    "Batsirayi Mupamhi Ziki",
                    "AI Agents",
                    "41 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/exploring-meta-learned-curiosity-algorithms/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-exploring-meta-learned-curiosity-algorithms/MDP.png",
                    "Figure from Exploring Meta-learned Curiosity Algorithms"
          ],
          [
                    2024,
                    "update-frequency-in-mbrl",
                    "Fair Model-Based Reinforcement Learning Comparisons with Explicit and Consistent Update Frequency",
                    "Implicit update frequencies can introduce ambiguity in the interpretation of model-based reinforcement learning benchmarks, obscuring the real objective of the evaluation. While the update frequency can sometimes be optimized to improve performance, real-world applications...",
                    "Albert Thomas, Abdelhakim Benechehab, Giuseppe Paolo et al.",
                    "World Model",
                    "22 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/update-frequency-in-mbrl/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-update-frequency-in-mbrl/bremen.png",
                    "Figure from Fair Model-Based Reinforcement Learning Comparisons with Explicit and Consistent Update Frequency"
          ],
          [
                    2024,
                    "fairness-ai-two-phil-or-just-one",
                    "Fairness in AI: two philosophies or just one?",
                    "The topic of fairness in AI has garnered more attention over the last year, recently with the arrival of the EU's AI Act. This goal of achieving fairness in AI is often done in one of two ways, namely through counterfactual fairness or through group fairness. These research...",
                    "MaryBeth Defrance",
                    "Trustworthy AI",
                    "18 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/fairness-ai-two-phil-or-just-one/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-fairness-ai-two-phil-or-just-one/Two_categories.png",
                    "Figure from Fairness in AI: two philosophies or just one?"
          ],
          [
                    2024,
                    "bench-hvp",
                    "How to compute Hessian-vector products?",
                    "The product between the Hessian of a function and a vector, the Hessian-vector product (HVP), is a fundamental quantity to study the variation of a function. It is ubiquitous in traditional optimization and machine learning. However, the computation of HVPs is often...",
                    "Mathieu Dagréou, Pierre Ablin, Samuel Vaiter et al.",
                    "Efficient AI",
                    "32 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/bench-hvp/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-bench-hvp/hess_eig.png",
                    "Figure from How to compute Hessian-vector products?"
          ],
          [
                    2024,
                    "primacy-bias-and-why-it-helps-to-forget",
                    "It's Time to Move On: Primacy Bias and Why It Helps to Forget",
                    "'The Primacy Bias in Deep Reinforcement Learning' demonstrates how the first experiences of a deep learning model can cause catastrophic memorization and how this can be prevented. In this post we describe primacy bias, summarize the authors' key findings, and present a...",
                    "Matthew Kielo, Vladimir Lukin",
                    "AI Agents",
                    "22 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/primacy-bias-and-why-it-helps-to-forget/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-primacy-bias-and-why-it-helps-to-forget/heavy-priming.jpeg",
                    "Figure from It's Time to Move On: Primacy Bias and Why It Helps to Forget"
          ],
          [
                    2024,
                    "alibi-mlm",
                    "Masked Language Model with ALiBi and CLAP head",
                    "As a new approach to positional encoding, Attention with Linear Biases (ALiBi) uses linear biases of the attention weights to encode positional information, with capability of context length extrapolation. In their paper however, Press et al. focus on the perplexity of...",
                    "Jason Chuan-Chih Chou",
                    "LLM & MLLM",
                    "15 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/alibi-mlm/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-alibi-mlm/ALiBi.jpeg",
                    "Figure from Masked Language Model with ALiBi and CLAP head"
          ],
          [
                    2024,
                    "clml",
                    "On Bayesian Model Selection: The Marginal Likelihood, Cross-Validation, and Conditional Log Marginal Likelihood",
                    "Bayesian model selection has long relied on the marginal likelihood and related quantities, often motivated by the principle of Occam's razor. Following the paper 'Bayesian Model Selection, the Marginal Likelihood, and Generalization' by Lotfi et al. (2022), this blog post...",
                    "Andreas Kirsch",
                    "Foundation Model",
                    "91 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/clml/",
                    "https://preview.redd.it/jxob8cx6sbi21.jpg?width=706&amp;auto=webp&amp;s=9dcd32ad88c661ca033833b0686b28d2501941d1",
                    "Figure from On Bayesian Model Selection: The Marginal Likelihood, Cross-Validation, and Conditional Log Marginal Likelihood"
          ],
          [
                    2024,
                    "rlhf-without-rl",
                    "RLHF without RL - Direct Preference Optimization",
                    "We discuss the RL part of RLHF and its recent displacement by direct preference optimization (DPO). With DPO, a language model can be aligned with human preferences without sampling from an LM, thereby significantly simplifying the training process. By now, DPO has been...",
                    "Michael Panchenko",
                    "AI Agents",
                    "14 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/rlhf-without-rl/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-rlhf-without-rl/original-evaluation.svg",
                    "Figure from RLHF without RL - Direct Preference Optimization"
          ],
          [
                    2024,
                    "hidden-convex-relu",
                    "The Hidden Convex Optimization Landscape of Two-Layer ReLU Networks",
                    "In this article, we delve into the research paper titled 'The Hidden Convex Optimization Landscape of Regularized Two-Layer ReLU Networks'. We put our focus on the significance of this study and evaluate its relevance in the current landscape of the theory of machine...",
                    "Victor Mercklé, Franck Iutzeler, Ievgen Redko",
                    "Efficient AI",
                    "47 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/hidden-convex-relu/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-hidden-convex-relu/teaser_movie.gif",
                    "Figure from The Hidden Convex Optimization Landscape of Two-Layer ReLU Networks"
          ],
          [
                    2024,
                    "the-n-implementation-details-of-rlhf-with-ppo",
                    "The N Implementation Details of RLHF with PPO",
                    "Reinforcement Learning from Human Feedback (RLHF) is pivotal in the modern application of language modeling, as exemplified by ChatGPT. This blog post delves into an in-depth exploration of RLHF, attempting to reproduce the results from OpenAI's inaugural RLHF paper...",
                    "Shengyi Costa Huang, Tianlin Liu, Leandro von Werra",
                    "AI Agents",
                    "47 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/the-n-implementation-details-of-rlhf-with-ppo/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-the-n-implementation-details-of-rlhf-with-ppo/curve-matching.png",
                    "Figure from The N Implementation Details of RLHF with PPO"
          ],
          [
                    2024,
                    "robust-foundation-model",
                    "Towards Robust Foundation Models: Adversarial Contrastive Learning",
                    "Foundation models pre-trained on large-scale unlabelled datasets using self-supervision can be generalizable to a wide range of downstream tasks. Existing work has shown that adversarial attacks can effectively fool any downstream models fine-tuned from a pre-trained...",
                    "Jingfeng Zhang, Xilie Xu",
                    "Trustworthy AI",
                    "44 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/robust-foundation-model/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-robust-foundation-model/foundation_models.png",
                    "Figure from Towards Robust Foundation Models: Adversarial Contrastive Learning"
          ],
          [
                    2024,
                    "understanding-gradient-inversion-attacks-from-the-prior-knowledge-perspective",
                    "Understanding gradient inversion attacks from the prior knowledge perspective",
                    "In this blogpost, we mention multiple works in gradient inversion attacks, point out the chanllenges we need to solve in GIAs, and provide a perspective from the prior knowledge to understand the logic behind recent papers.",
                    "Yanbo Wang, Jian Liang, Ran He",
                    "Trustworthy AI",
                    "16 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/understanding-gradient-inversion-attacks-from-the-prior-knowledge-perspective/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-understanding-gradient-inversion-attacks-from-the-prior-knowledge-perspective/Picture1.jpg",
                    "Figure from Understanding gradient inversion attacks from the prior knowledge perspective"
          ],
          [
                    2024,
                    "understanding-icl",
                    "Understanding in-context learning in transformers",
                    "We propose a technical exploration of In-Context Learning (ICL) for linear regression tasks in transformer architectures. Focusing on the article Transformers Learn In-Context by Gradient Descent by J. von Oswald et al., published in ICML 2023 last year, we provide detailed...",
                    "Simone Rossi, Rui Yuan, Thomas Hannagan",
                    "LLM & MLLM",
                    "46 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/understanding-icl/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-understanding-icl/in-context-chatgpt.png",
                    "Figure from Understanding in-context learning in transformers"
          ],
          [
                    2024,
                    "unraveling-the-impact-of-training-samples",
                    "Unraveling The Impact of Training Samples",
                    "How do we quantify the influence of datasets? Recent works on Data Attribution Methods shed light on this problem. In this blog post, we introduce Data Attribution Methods which leverage robust statistics and surrogate functions, and present their applications like...",
                    "Daiwei Chen, Jane Zhang, Ramya Korlakai Vinayak",
                    "Foundation Model",
                    "22 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/unraveling-the-impact-of-training-samples/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-unraveling-the-impact-of-training-samples/animation.gif",
                    "Figure from Unraveling The Impact of Training Samples"
          ],
          [
                    2024,
                    "what-exactly-has-tabpfn-learned-to-do",
                    "What exactly has TabPFN learned to do?",
                    "TabPFN [Hollmann et al., 2023], a Transformer model pretrained to perform in-context learning on fresh tabular classification problems, was presented at the last ICLR conference. To better understand its behavior, we treat it as a black-box function approximator generator...",
                    "Calvin McCarter",
                    "LLM & MLLM",
                    "19 min read",
                    "2024-05-07",
                    "https://iclr-blogposts.github.io/2024/blog/what-exactly-has-tabpfn-learned-to-do/",
                    "https://iclr-blogposts.github.io/2024/assets/img/2024-05-07-what-exactly-has-tabpfn-learned-to-do/plusminus1-nonmonotone.png",
                    "Figure from What exactly has TabPFN learned to do?"
          ],
          [
                    2023,
                    "hitchhikers-momentum",
                    "A Hitchhiker's Guide to Momentum",
                    "Polyak momentum is one of the most iconic methods in optimization. Despite it's simplicity, it features rich dynamics that depend both on the step-size and momentum parameter. In this blog post we identify the different regions of the parameter space and discuss their...",
                    "Fabian Pedregosa",
                    "Efficient AI",
                    "19 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/hitchhikers-momentum/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-hitchhikers-momentum/rate_convergence_momentum.png",
                    "Figure from A Hitchhiker's Guide to Momentum"
          ],
          [
                    2023,
                    "autoregressive-neural-pde-solver",
                    "Autoregressive Renaissance in Neural PDE Solvers",
                    "Recent developments in the field of neural partial differential equation (PDE) solvers have placed a strong emphasis on neural operators. However, the paper Message Passing Neural PDE Solver by Brandstetter et al. published in ICLR 2022 revisits autoregressive models and...",
                    "Yolanne Lee",
                    "LLM & MLLM",
                    "46 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/autoregressive-neural-pde-solver/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-autoregressive-neural-pde-solver/fdm_animation.gif",
                    "Figure from Autoregressive Renaissance in Neural PDE Solvers"
          ],
          [
                    2023,
                    "facial-poisoning",
                    "Data Poisoning is Hitting a Wall",
                    "In this post, we look at the paper 'Data Poisoning Won't Save You From Facial Recognition', discuss the impact of the work, and additionally look at how this work fares in the current state of adversarial machine learning. Being a blog post as opposed to a traditional...",
                    "Rajat Sahay",
                    "Trustworthy AI",
                    "17 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/facial-poisoning/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-facial-poisoning/facial_poisoning.png",
                    "Figure from Data Poisoning is Hitting a Wall"
          ],
          [
                    2023,
                    "adamw",
                    "Decay No More",
                    "Weight decay is among the most important tuning parameters to reach high accuracy for large-scale machine learning models. In this blog post, we revisit AdamW, the weight decay version of Adam, summarizing empirical findings as well as theoretical motivations from an...",
                    "Fabian Schaipp",
                    "Efficient AI",
                    "21 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/adamw/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-adamw/heatmap.png",
                    "Figure from Decay No More"
          ],
          [
                    2023,
                    "how-does-the-inductive-bias-influence-the-generalization-capability-of-neural-networks",
                    "How does the inductive bias influence the generalization capability of neural networks?",
                    "The blog post discusses how memorization and generalization are affected by extreme overparameterization. Thereforeit explains the overfitting puzzle in machine learning and how the inductive bias can help to understand the generalization capability of neural networks.",
                    "Charlotte Barth, Thomas Goerttler, Klaus Obermayer",
                    "Foundation Model",
                    "13 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/how-does-the-inductive-bias-influence-the-generalization-capability-of-neural-networks/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-how-does-the-inductive-bias-influence-the-generalization-capability-of-neural-networks/bias_variance_tradeoff.png",
                    "Figure from How does the inductive bias influence the generalization capability of neural networks?"
          ],
          [
                    2023,
                    "how-much-meta-learning-is-in-image-to-image-translation",
                    "How much meta-learning is in image-to-image translation?",
                    "...in which we find a connection between meta-learning literature and a paper studying how well CNNs deal with nuisance transforms in a class-imbalanced setting. Closer inspection reveals a surprising amount of similarity - from meta-information to loss functions. This...",
                    "Maximilian Eißler, Thomas Goerttler, Klaus Obermayer",
                    "Visual Generation",
                    "26 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/how-much-meta-learning-is-in-image-to-image-translation/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-how-much-meta-learning-is-in-image-to-image-translation/CONCEPTUAL_DIAGRAM.svg",
                    "Figure from How much meta-learning is in image-to-image translation?"
          ],
          [
                    2023,
                    "bsuite-applications",
                    "Practical Applications of Bsuite For Reinforcement Learning",
                    "In 2019, researchers at DeepMind published a suite of reinforcement learning environments called Behavior Suite for Reinforcement Learning, or bsuite. Each environment is designed to directly test a core capability of a general reinforcement learning agent, such as its...",
                    "Loren Anderson, Nathan Bittner",
                    "AI Agents",
                    "37 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/bsuite-applications/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-bsuite-applications/radar01.png",
                    "Figure from Practical Applications of Bsuite For Reinforcement Learning"
          ],
          [
                    2023,
                    "riit",
                    "Rethinking the Implementation Tricks and Monotonicity Constraint in Cooperative Multi-agent Reinforcement Learning",
                    "QMIX, a very classical multi-agent reinforcement learning (MARL) algorithm, is often considered to be a weak performance baseline due to its representation capability limitations. However, we found that by improving the implementation techniques of QMIX we can enable it to...",
                    "Jian Hu, Siying Wang, Siyang Jiang et al.",
                    "AI Agents",
                    "39 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/riit/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-riit/mdp.png",
                    "Figure from Rethinking the Implementation Tricks and Monotonicity Constraint in Cooperative Multi-agent Reinforcement Learning"
          ],
          [
                    2023,
                    "classification-layer-initialization-in-maml",
                    "Strategies for Classification Layer Initialization in Model-Agnostic Meta-Learning",
                    "This blog post discusses different strategies for initializing the classification layers parameters before fine-tuning on a new task in Model-Agnostic Meta-Learning. Each of the strategies in question has emerged from a different problemand it will be analyzed whether one...",
                    "Nys Tjade Siegel, Thomas Goerttler, Klaus Obermayer",
                    "Efficient AI",
                    "23 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/classification-layer-initialization-in-maml/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-classification-layer-initialization-in-maml/perm_final.png",
                    "Figure from Strategies for Classification Layer Initialization in Model-Agnostic Meta-Learning"
          ],
          [
                    2023,
                    "raspy",
                    "Thinking Like Transformers",
                    "Thinking like Transformers proposes a simple language for coding with attention-like primitives. Using this language, we consider a challenging set of puzzles to gain intuition for how Transformer could implement basic algorithms.",
                    "Alexander Rush, Gail Weiss",
                    "LLM & MLLM",
                    "21 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/raspy/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-raspy/Blog_5_0.svg",
                    "Figure from Thinking Like Transformers"
          ],
          [
                    2023,
                    "sets-and-graphs",
                    "Universality of Neural Networks on Sets vs. Graphs",
                    "Universal function approximation is one of the central tenets in theoretical deep learning research. It is the question of whether a specific neural network architecture is, in theory, able to approximate any function of interest. The ICLR paper “How Powerful are Graph...",
                    "Fabian B. Fuchs*, Petar Veličković*",
                    "Foundation Model",
                    "25 min read",
                    "2023-05-01",
                    "https://iclr-blogposts.github.io/2023/blog/2023/sets-and-graphs/",
                    "https://iclr-blogposts.github.io/2023/assets/img/2023-05-01-sets-and-graphs/graphsuniv_graphsandsets.png",
                    "Figure from Universality of Neural Networks on Sets vs. Graphs"
          ],
          [
                    2022,
                    "text-gen-via-lfd",
                    "An Understanding of Learning from Demonstrations for Neural Text Generation",
                    "In this blog post, we will go over the ICLR 2021 paper titled Text Generation by Learning from Demonstration . This paper introduces a learning method based on offline, off-policy reinforcement learning (RL) which addresses two key limitations of a training objective used...",
                    "Pavan Kantharaju, Aiswarya Sankar",
                    "AI Agents",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/text-gen-via-lfd/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-text-gen-via-lfd/text-gen-diagram.png",
                    "Figure from An Understanding of Learning from Demonstrations for Neural Text Generation"
          ],
          [
                    2022,
                    "two-player-auction-learning",
                    "Auction Learning as a Two Player Game: GANs (?) for Mechanism Design",
                    "We discuss a new contribution to the nascent area of deep learning for revenue-maximizing auction design, which uses a GAN-style approach in which two neural networks (one which models strategic behavior by bidders, and one which models an auctioneer) compete with each...",
                    "Michael J. Curry, Daniel Reusche",
                    "AI Agents",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/two-player-auction-learning/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-two-player-auction-learning/basicauction.png",
                    "Figure from Auction Learning as a Two Player Game: GANs (?) for Mechanism Design"
          ],
          [
                    2022,
                    "lecun1989",
                    "Deep Neural Nets: 33 years ago and 33 years from now (Invited Post)",
                    "The Yann LeCun et al. (1989) paper Backpropagation Applied to Handwritten Zip Code Recognition is I believe of some historical significance because it is, to my knowledge, the earliest real-world application of a neural net trained end-to-end with backpropagation. Except...",
                    "Karpathy, Andrej",
                    "Foundation Model",
                    "12 min read",
                    "2022-03-26",
                    "https://iclr-blog-track.github.io/2022/03/26/lecun1989/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-26-lecun1989/lecun1989.png",
                    "Figure from Deep Neural Nets: 33 years ago and 33 years from now (Invited Post)"
          ],
          [
                    2022,
                    "zero-cost-proxies",
                    "A Deeper Look at Zero-Cost Proxies for Lightweight NAS",
                    "Imagine you have a brand new dataset, and you are trying to find a neural network that achieves high validation accuracy on this dataset. You choose a neural network, but after 3 hours of training, you find that the validation accuracy is only 85%. After more choices of...",
                    "Colin White, Mikhail Khodak, Renbo Tu et al.",
                    "Efficient AI",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/zero-cost-proxies/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-zero-cost-proxies/MainFigure.png",
                    "Figure from A Deeper Look at Zero-Cost Proxies for Lightweight NAS"
          ],
          [
                    2022,
                    "non-monotonic-autoregressive-ordering",
                    "Discovering Non-Monotonic Autoregressive Ordering for Text Generation Models using Sinkhorn Distributions",
                    "Natural-Language-Generation (NLG) is a process for producing a sequence of natural language tokens. While the input to the NLG pipeline includes, but is not limited to, audio, video, image, structured documents, and natural language itself, the output is restricted to human...",
                    "Kumar, Ashutosh",
                    "LLM & MLLM",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/non-monotonic-autoregressive-ordering/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-non-monotonic-autoregressive-ordering/main_fig_p.png",
                    "Figure from Discovering Non-Monotonic Autoregressive Ordering for Text Generation Models using Sinkhorn Distributions"
          ],
          [
                    2022,
                    "does-adam",
                    "Does Adam Converge and When?",
                    "In this blog post, we revisit the (non-)convergence behavior of Adam. Especially, we briefly review the non-convergence results by Reddi et al. [14] and the convergence results by Shi et al. [17]. Do this two results contradict to each other? If not, does the convergence...",
                    "Yushun Zhang, Congliang Chen, Zhi-Quan Luo",
                    "Efficient AI",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/does-adam/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-does-adam/adam.png",
                    "Figure from Does Adam Converge and When?"
          ],
          [
                    2022,
                    "euclidean-geometric-graph",
                    "Euclidean geometry meets graph, a geometric deep learning perspective",
                    "Graph neural networks (GNN) have been an active area of machine learning research to tackle various problems in graph data. A graph is a powerful way of representing relationships among entities as nodes connected by edges. Sometimes nodes and edges can have spatial...",
                    "Zichen Wang, Yunzhi Shi, Xin Chen",
                    "Foundation Model",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/euclidean_geometric_graph/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-euclidean_geometric_graph/geometric_protein_graph.png",
                    "Figure from Euclidean geometry meets graph, a geometric deep learning perspective"
          ],
          [
                    2022,
                    "conformation-generation",
                    "Generating Molecular Conformations via Normalizing Flows and Neural ODEs",
                    "In this post, we provide an in-depth overview of methods outlined in the paper “Learning Neural Generative Dynamics for Molecular Conformation Generation,” discuss the impact of the work in the context of other conformation generation approaches, and additionally discuss...",
                    "Mukundh Murthy, Nikhil Devraj",
                    "Visual Generation",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/conformation-generation/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-conformation-generation/vina.jpg",
                    "Figure from Generating Molecular Conformations via Normalizing Flows and Neural ODEs"
          ],
          [
                    2022,
                    "kgs",
                    "Knowledge Graph Papers @ ICLR 2021",
                    "Hi! 👋 Today we are going to have a look at ICLR 2021 papers focusing on knowledge graphs (KGs), particularly in areas of graph representation learning and NLP. Among 860 accepted papers we highlight 10 particularly interesting and promising works that might influence the...",
                    "Galkin, Mikhail (Mila & McGill University)",
                    "Foundation Model",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/kgs/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-kgs/cqd.png",
                    "Figure from Knowledge Graph Papers @ ICLR 2021"
          ],
          [
                    2022,
                    "coarsening",
                    "Learning to Coarsen Graphs with Graph Neural Networks",
                    "With the rise of large-scale graphs for relational learning, graph coarsening emerges as a computationally viable alternative. We revisit the principles that aim to improve data-driven graph coarsening with adjustable coarsened structures.",
                    "Suri, Karush",
                    "Foundation Model",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/coarsening/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-coarsening/graph_orig.PNG",
                    "Figure from Learning to Coarsen Graphs with Graph Neural Networks"
          ],
          [
                    2022,
                    "looking-at-the-performer-from-a-hopfield-point-of-view",
                    "Looking at the Performer from a Hopfield Point of View",
                    "In this blog post, we look at the Performer from a Hopfield Network point of view and relate aspects of the Performer architecture to findings in the field of associative memories and Hopfield Networks. This blog post sheds light on the Performer from three different...",
                    "Brandstetter J. and Ramsauer H. and Holzleitner M. and Hochreiter S. and Schäfl B.",
                    "LLM & MLLM",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/Looking-at-the-Performer-from-a-Hopfield-point-of-view/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-Looking-at-the-Performer-from-a-Hopfield-point-of-view/homer_bw.png",
                    "Figure from Looking at the Performer from a Hopfield Point of View"
          ],
          [
                    2022,
                    "unnormalized-resnets",
                    "Normalization is dead, long live normalization!",
                    "Since the advent of Batch Normalization (BN), almost every state-of-the-art (SOTA) method uses some form of normalization. After all, normalization generally speeds up learning and leads to models that generalize better than their unnormalized counterparts. This turns out...",
                    "Pieter-Jan Hoedt, Sepp Hochreiter, Günter Klambauer",
                    "Foundation Model",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/unnormalized-resnets/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-unnormalized-resnets/data_dimensions.svg",
                    "Figure from Normalization is dead, long live normalization!"
          ],
          [
                    2022,
                    "dyadic-fairness",
                    "On Dyadic Fairness: Exploring and Mitigating Bias in Graph Connections",
                    "This blog post discusses the ICLR 2021 paper “On Dyadic Fairness: Exploring and Mitigating Bias in Graph Connections” by Li et al. , highlighting the importance of its theoretical results while critically examining the notions and applications of dyadic fairness presented...",
                    "Subramonian, Arjun",
                    "Trustworthy AI",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/dyadic-fairness/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-dyadic-fairness/link_prediction.png",
                    "Figure from On Dyadic Fairness: Exploring and Mitigating Bias in Graph Connections"
          ],
          [
                    2022,
                    "pplm",
                    "PPLM Revisited: Steering and Beaming a Lumbering Mammoth to Control Text Generation",
                    "In this blogpost, we examine to which extent PPLM can control Language Models by investigating reproducibility, the impact of the prompt vs. BoW, effect of using weighted BoW and style control. Want a summary only? Check our TL;DR .",
                    "Van Bach Nguyen, Jan Trienes, Meike Nauta et al.",
                    "LLM & MLLM",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/PPLM/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-PPLM/Mammoths-path-as-word-sequence.jpg",
                    "Figure from PPLM Revisited: Steering and Beaming a Lumbering Mammoth to Control Text Generation"
          ],
          [
                    2022,
                    "deep-learning-for-routing-problems",
                    "Recent Advances in Deep Learning for Routing Problems",
                    "TL;DR Developing neural network-driven solvers for combinatorial optimization problems such as the Travelling Salesperson Problem have seen a surge of academic interest recently. This blogpost presents a Neural Combinatorial Optimization pipeline that unifies several...",
                    "Chaitanya K. Joshi, Rishabh Anand",
                    "AI Agents",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/deep-learning-for-routing-problems/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-deep-learning-for-routing-problems/tsp-gif.gif",
                    "Figure from Recent Advances in Deep Learning for Routing Problems"
          ],
          [
                    2022,
                    "representation-change-in-model-agnostic-meta-learning",
                    "Representation Change in Model-Agnostic Meta-Learning",
                    "Last year, an exciting adaptation of one of the most popular optimization-based meta-learning approaches, model-agnostic meta-learning (MAML) [Finn et al., 2017] , was proposed in",
                    "Thomas (TU Berlin) Goerttler, Luis (TU Berlin) Müller, Klaus (TU Berlin) Obermayer",
                    "Efficient AI",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/representation-change-in-model-agnostic-meta-learning/",
                    "assets/img/covers/real/iclr2022-representation-change-in-model-agnostic-meta-learning.png",
                    "Real cover from manual:original-page-screenshot"
          ],
          [
                    2022,
                    "rethinking-valuedice",
                    "Rethinking ValueDice - Does It Really Improve Performance?",
                    "This post rethinks the ValueDice algorithm introduced in the following ICLR publication. We promote several new conclusions and perhaps some of them can provide new insights.",
                    "Li Ziniu, Xu Tian, Yu Yang et al.",
                    "AI Agents",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/rethinking-valuedice/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-rethinking-valuedice/value_dice_reproduce.svg",
                    "Figure from Rethinking ValueDice - Does It Really Improve Performance?"
          ],
          [
                    2022,
                    "emergent-symbols",
                    "Symbolic Binding in Neural Networks through Factorized Memory Systems",
                    "For short-term, peer-sourced tests of time, generalizations, specializations, reproductions, etc.!",
                    "Ameya Daigavane, Ansh Khurana, Shweta Bhardwaj et al.",
                    "Foundation Model",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/emergent-symbols/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-emergent-symbols/clevr.png",
                    "Figure from Symbolic Binding in Neural Networks through Factorized Memory Systems"
          ],
          [
                    2022,
                    "ppo-implementation-details",
                    "The 37 Implementation Details of Proximal Policy Optimization",
                    "Jon is a first-year master’s student who is interested in reinforcement learning (RL). In his eyes, RL seemed fascinating because he could use RL libraries such as Stable-Baselines3 (SB3) to train agents to play all kinds of games. He quickly recognized Proximal Policy...",
                    "Shengyi Huang, Rousslan Fernand Julien Dossa, Antonin Raffin et al.",
                    "AI Agents",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-ppo-implementation-details//meme3.png",
                    "Figure from The 37 Implementation Details of Proximal Policy Optimization"
          ],
          [
                    2022,
                    "annotated-s4",
                    "The Annotated S4",
                    "The Structured State Space for Sequence Modeling (S4) architecture is a new approach to very long-range sequence modeling tasks for vision, language, and audio, showing a capacity to capture dependencies over tens of thousands of steps. Especially impressive are the model’s...",
                    "Alexander Rush, Sidd Karamcheti",
                    "LLM & MLLM",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/annotated-s4/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-annotated-s4/images/hero.png",
                    "Figure from The Annotated S4"
          ],
          [
                    2022,
                    "understanding-mtr-meta",
                    "Understanding Few-Shot Multi-Task Representation Learning Theory",
                    "Learning something new in real life does not necessarily mean going through a lot of examples in order to capture the essence of it. Even though it is said that it takes 10,000 hours to master a new skill, it is also true that it only takes 20 hours to learn it. This is...",
                    "Quentin Bouniot, Ievgen Redko",
                    "Foundation Model",
                    "12 min read",
                    "2022-03-25",
                    "https://iclr-blog-track.github.io/2022/03/25/understanding_mtr_meta/",
                    "https://iclr-blog-track.github.io/public/images/2022-03-25-understanding_mtr_meta/botero.png",
                    "Figure from Understanding Few-Shot Multi-Task Representation Learning Theory"
          ]
];

        return posts.map(([year, slug, title, excerpt, author, category, readTime, publishDate, url, coverImage, coverAlt]) => ({
            id: 'iclr' + year + '-' + slug,
            title,
            excerpt,
            author,
            authorAvatar: 'https://www.google.com/s2/favicons?domain=' + (year === 2022 ? 'iclr-blog-track.github.io' : 'iclr-blogposts.github.io') + '&sz=128',
            category,
            tags: ['ICLR Blogposts ' + year, category],
            readTime,
            publishDate,
            sourceName: 'ICLR Blogposts ' + year,
            url,
            coverImage,
            coverAlt,
            coverFit: 'cover'
        }));
    }

    getKalomazeBearBlogs() {
        const authorAvatar = 'https://www.google.com/s2/favicons?domain=kalomaze.bearblog.dev&sz=128';

        return [
            {
                id: 'kalomaze-rl-for-knowledge-awareness',
                title: 'Reinforcement Learning for Knowledge Awareness',
                excerpt: 'Kalomaze shows how Bradley-Terry reward modeling over constructed contrastive data can teach Qwen3-8B to separate real knowledge from confabulation and improve epistemic humility through RL.',
                author: 'kalomaze',
                authorAvatar,
                category: 'Trustworthy AI',
                tags: ['Reward Modeling', 'RLHF', 'Knowledge Awareness', 'Qwen3'],
                readTime: '8 min read',
                publishDate: '2026-05-07',
                sourceName: 'kalomaze',
                url: 'https://kalomaze.bearblog.dev/rl-for-knowledge-awareness/',
                coverImage: 'assets/img/covers/real/kalomaze-rl-for-knowledge-awareness.png',
                coverAlt: 'Real cover from Kalomaze page screenshot: Reinforcement Learning for Knowledge Awareness',
                coverFit: 'cover'
            },
            {
                id: 'kalomaze-dont-exclude-rl-rollouts',
                title: "Don't Exclude Rollouts From Your RL Training Runs",
                excerpt: 'A sharp critique of overlong rollout masking in online RL: excluding bad samples from the loss can create train-test bias, while reward shaping keeps pressure on the behaviors seen at deployment.',
                author: 'kalomaze',
                authorAvatar,
                category: 'AI Agents',
                tags: ['Online RL', 'Rollouts', 'DAPO', 'Reward Shaping'],
                readTime: '6 min read',
                publishDate: '2026-02-20',
                sourceName: 'kalomaze',
                url: 'https://kalomaze.bearblog.dev/dont-exclude-rl-rollouts/',
                coverImage: 'assets/img/covers/real/kalomaze-dont-exclude-rl-rollouts.png',
                coverAlt: 'Real cover from Kalomaze page screenshot: rollout training critique',
                coverFit: 'cover'
            },
            {
                id: 'kalomaze-rl-learning-with-lora',
                title: 'RL Learning with LoRA: A Diverse Deep Dive',
                excerpt: 'A practical walkthrough of LoRA for SFT and RL finetuning in prime-rl, covering target modules, rsLoRA scaling, memory tradeoffs, and experiments across alphabet-sort, unscramble, and math tasks.',
                author: 'kalomaze',
                authorAvatar,
                category: 'Efficient AI',
                tags: ['LoRA', 'RLVR', 'prime-rl', 'Qwen'],
                readTime: '13 min read',
                publishDate: '2025-11-09',
                sourceName: 'kalomaze',
                url: 'https://kalomaze.bearblog.dev/rl-lora-ddd/',
                coverImage: 'assets/img/covers/real/kalomaze-rl-learning-with-lora.png',
                coverAlt: 'Real cover from Kalomaze page screenshot: RL Learning with LoRA',
                coverFit: 'cover'
            },
            {
                id: 'kalomaze-understanding-transformers-beyond-math',
                title: 'Understanding Transformers... (beyond the Math)',
                excerpt: 'An intuition-first essay on transformers as state simulators, using informal reasoning to explain attention, context, state updates, and why architecture components matter beyond the equations.',
                author: 'kalomaze',
                authorAvatar,
                category: 'Foundation Model',
                tags: ['Transformers', 'Attention', 'Model Intuition', 'Architecture'],
                readTime: '21 min read',
                publishDate: '2025-03-09',
                sourceName: 'kalomaze',
                url: 'https://kalomaze.bearblog.dev/understanding-transformers-beyond-the-math/',
                coverImage: 'assets/img/covers/real/kalomaze-understanding-transformers-beyond-math.png',
                coverAlt: 'Real cover from Kalomaze page screenshot: Understanding Transformers beyond the Math',
                coverFit: 'cover'
            },
            {
                id: 'kalomaze-grpo-judge-experiments',
                title: 'GRPO Judge Experiments: Findings & Empirical Observations',
                excerpt: 'A hands-on GRPO report for semantic judgement tasks, with observations on reward shaping, learning-rate schedules, gradient clipping, model scale, formatting bonuses, and emergent reasoning templates.',
                author: 'kalomaze',
                authorAvatar,
                category: 'Trustworthy AI',
                tags: ['GRPO', 'Judge Models', 'Reward Shaping', 'Evaluation'],
                readTime: '6 min read',
                publishDate: '2025-03-03',
                sourceName: 'kalomaze',
                url: 'https://kalomaze.bearblog.dev/grpo-judge-experiments-findings-and-empirical-observations/',
                coverImage: 'assets/img/covers/real/kalomaze-grpo-judge-experiments.png',
                coverAlt: 'Real cover from Kalomaze page screenshot: GRPO Judge Experiments',
                coverFit: 'cover'
            },
            {
                id: 'kalomaze-why-does-grpo-work',
                title: 'Why does GRPO work?',
                excerpt: 'Kalomaze explains GRPO as online reinforcement learning over verifiable objectives, contrasting group-relative advantages with DPO-style offline preference optimization after DeepSeek-R1.',
                author: 'kalomaze',
                authorAvatar,
                category: 'AI Agents',
                tags: ['GRPO', 'DeepSeek-R1', 'Online RL', 'RLVR'],
                readTime: '7 min read',
                publishDate: '2025-02-27',
                sourceName: 'kalomaze',
                url: 'https://kalomaze.bearblog.dev/why-does-grpo-work/',
                coverImage: 'assets/img/covers/real/kalomaze-why-does-grpo-work.png',
                coverAlt: 'Real cover from Kalomaze page screenshot: Why does GRPO work?',
                coverFit: 'cover'
            },
            {
                id: 'kalomaze-synthetic-rejected-preference-data',
                title: 'Synthetic rejected preference data creation [via Qwen7b finetune]',
                excerpt: 'A compact note on using a Qwen7B finetune to create corrupted-text restorations and scalable rejected preference data for stronger reward-model baselines.',
                author: 'kalomaze',
                authorAvatar,
                category: 'Trustworthy AI',
                tags: ['Preference Data', 'Qwen7B', 'Reward Models', 'Synthetic Data'],
                readTime: '2 min read',
                publishDate: '2025-02-27',
                sourceName: 'kalomaze',
                url: 'https://kalomaze.bearblog.dev/synthetic-rejected-preference-data-creation-via-qwen7b-finetune/',
                coverImage: 'assets/img/covers/real/kalomaze-synthetic-rejected-preference-data.png',
                coverAlt: 'Real cover from Kalomaze page screenshot: synthetic rejected preference data',
                coverFit: 'cover'
            }
        ];
    }

    getRecentCommunityBlogAdditions() {
        return [
            {
                id: 'openai-separating-signal-from-noise-coding-evaluations',
                title: 'Separating Signal from Noise in Coding Evaluations',
                excerpt: 'OpenAI examines how benchmark design, task selection, infrastructure, and evaluation variance can obscure real progress in coding models, and outlines practices for producing more reliable and decision-useful measurements.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Research Craft',
                tags: ['Coding Evaluations', 'Benchmarks', 'Measurement', 'Software Engineering'],
                readTime: '12 min read',
                publishDate: '2026-07-21',
                sourceName: 'OpenAI',
                url: 'https://openai.com/zh-Hans-CN/index/separating-signal-from-noise-coding-evaluations/',
                coverImage: 'assets/img/covers/real/separating-signal-from-noise-coding-evaluations.png',
                coverAlt: 'OpenAI coding evaluations article cover',
                coverFit: 'cover'
            },
            {
                id: 'openai-gpt-5-6',
                title: 'Introducing GPT-5.6',
                excerpt: 'OpenAI introduces GPT-5.6 and presents the model\'s updated capabilities, evaluation results, availability, and guidance for using it across professional and technical workloads.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Foundation Model',
                tags: ['GPT-5.6', 'Foundation Models', 'Reasoning', 'Model Release'],
                readTime: '8 min read',
                publishDate: '2026-07-20',
                sourceName: 'OpenAI',
                url: 'https://openai.com/zh-Hans-CN/index/gpt-5-6/',
                coverImage: 'assets/img/covers/real/gpt-5.6.png',
                coverAlt: 'OpenAI GPT-5.6 model release cover',
                coverFit: 'cover'
            },
            {
                id: 'openai-gpt-red-self-improvement-robustness',
                title: 'GPT-Red: Unlocking Self-Improvement for Robustness',
                excerpt: 'OpenAI presents GPT-Red, a research approach that uses increasingly capable model-generated attacks and feedback to improve robustness, connecting automated red teaming with iterative model self-improvement.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['GPT-Red', 'Robustness', 'Red Teaming', 'Self-Improvement'],
                readTime: '12 min read',
                publishDate: '2026-07-20',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/unlocking-self-improvement-gpt-red/',
                coverImage: 'assets/img/covers/real/GPT‑Red- Unlocking Self-Improvement for Robustness.png',
                coverAlt: 'GPT-Red self-improvement for robustness article cover',
                coverFit: 'cover'
            },
            {
                id: 'kimi-k3-open-frontier-intelligence',
                title: 'Kimi K3: Open Frontier Intelligence',
                excerpt: 'Kimi introduces K3, an open 2.8-trillion-parameter model built with Kimi Delta Attention, Attention Residuals, native multimodality, and a one-million-token context for coding, reasoning, and knowledge work.',
                author: 'Kimi Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=kimi.com&sz=128',
                category: 'Foundation Model',
                tags: ['Kimi K3', 'Mixture of Experts', 'Multimodal', 'Long Context'],
                readTime: '18 min read',
                publishDate: '2026-07-17',
                sourceName: 'Kimi',
                url: 'https://www.kimi.com/blog/kimi-k3',
                coverImage: 'assets/img/covers/real/Kimi K3- Open Frontier Intelligence .png',
                coverAlt: 'Kimi K3 open frontier intelligence article cover',
                coverFit: 'cover'
            },
            {
                id: 'thinking-machines-inkling-open-weights-model',
                title: 'Inkling: Our Open-Weights Model',
                excerpt: 'Thinking Machines Lab introduces Inkling, its first open-weights multimodal mixture-of-experts model, with controllable reasoning effort, long-context options, and support for fine-tuning through Tinker.',
                author: 'Thinking Machines Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thinkingmachines.ai&sz=128',
                category: 'Foundation Model',
                tags: ['Inkling', 'Open Weights', 'Multimodal', 'Mixture of Experts'],
                readTime: '28 min read',
                publishDate: '2026-07-15',
                sourceName: 'Thinking Machines Lab',
                url: 'https://thinkingmachines.ai/news/introducing-inkling/',
                coverImage: 'assets/img/covers/real/Inkling.png',
                coverAlt: 'Inkling open-weights model article cover',
                coverFit: 'cover'
            },
            {
                id: 'thinking-machines-replicate-expert-judgment-finance',
                title: 'Learning to Replicate Expert Judgment in Financial Tasks',
                excerpt: 'Thinking Machines Lab shows how expert-labeled data and fine-tuning on Tinker can produce a custom model that outperforms frontier LLMs on financial information-filtering tasks at a fraction of the cost.',
                author: 'Thinking Machines Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thinkingmachines.ai&sz=128',
                category: 'Efficient AI',
                tags: ['Fine-Tuning', 'Expert Judgment', 'Financial AI', 'Tinker'],
                readTime: '10 min read',
                publishDate: '2026-06-30',
                sourceName: 'Thinking Machines Lab',
                url: 'https://thinkingmachines.ai/news/learning-to-replicate-expert-judgment-in-financial-tasks/',
                coverImage: 'assets/img/covers/real/Learning to Replicate Expert Judgment in Financial Tasks.png',
                coverAlt: 'Expert judgment in financial tasks article cover',
                coverFit: 'cover'
            },
            {
                id: 'finite-time-nonsmooth-signum-muon',
                title: 'Finite-Time Nonsmooth Convergence of Signum and Muon',
                excerpt: 'This article studies whether momentum alone can restore finite-time convergence for sign-based optimization in nonsmooth settings. It presents counterexamples for constrained projected Signum, fixed-momentum deterministic Signum, and adapted stochastic oracles, and explains how diagonal Muon dynamics inherit related Signum behavior.',
                author: 'Dingzhi Yu, Yuxing Liu, Rui Pan, Lijun Zhang, Yang You, and Difan Zou',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lamda.nju.edu.cn&sz=128',
                category: 'Efficient AI',
                tags: ['Signum', 'Muon', 'Optimization', 'Nonsmooth Optimization', 'Momentum'],
                readTime: '12 min read',
                publishDate: '2026-07-21',
                sourceName: 'LAMDA, Nanjing University',
                url: 'https://www.lamda.nju.edu.cn/yudz/finite-time-nonsmooth-signum-muon.html',
                coverImage: 'assets/img/covers/real/Muon_NJU.png',
                coverAlt: 'Muon optimization illustration from the LAMDA Nanjing University article',
                coverFit: 'cover'
            },
            {
                id: 'openai-deployment-simulation',
                title: 'Predicting Model Behavior Before Release by Simulating Deployment',
                excerpt: 'OpenAI describes deployment simulation as a pre-release evaluation method: replaying realistic conversation prefixes with candidate models to estimate deployment-time failures, reduce evaluation awareness, and test agentic tool-use trajectories.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Deployment Simulation', 'Model Evaluation', 'Safety', 'Agent Evals'],
                readTime: '22 min read',
                publishDate: '2026-06-16',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/deployment-simulation/',
                coverImage: 'assets/img/covers/real/openai-deployment-simulation.png',
                coverAlt: 'Real cover from OpenAI article diagram rendered as PNG',
                coverFit: 'cover'
            },
            {
                id: 'google-machine-unlearning-audit',
                title: 'New Framework for Auditing Machine Unlearning',
                excerpt: 'Mónica Ribero introduces a black-box auditing approach for machine unlearning, using statistically grounded two-sample testing to verify whether a model has actually forgotten targeted training data.',
                author: 'Mónica Ribero',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.google&sz=128',
                category: 'Trustworthy AI',
                tags: ['Machine Unlearning', 'Auditing', 'Privacy', 'Two-Sample Testing'],
                readTime: '10 min read',
                publishDate: '2026-06-10',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/new-framework-for-auditing-machine-unlearning/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/HO_previewImage1.width-800.format-jpeg.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'google-agentic-rag-sufficient-context',
                title: 'Unlocking Dependable Responses with Gemini Enterprise Agent Platform’s Agentic RAG',
                excerpt: 'Google Research explains an agentic RAG design that plans, rewrites, routes, and iteratively retrieves until a sufficient-context judge decides the evidence can support a grounded answer.',
                author: 'Cyrus Rashtchian and Da-Cheng Juan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.google&sz=128',
                category: 'AI Agents',
                tags: ['Agentic RAG', 'Retrieval', 'Grounding', 'Sufficient Context'],
                readTime: '14 min read',
                publishDate: '2026-06-05',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/unlocking-dependable-responses-with-gemini-enterprise-agent-platforms-agentic-rag/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/HO_previewImage1.width-800.format-jpeg.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'huggingface-olmo-eval-workbench',
                title: 'olmo-eval: An Evaluation Workbench for the Model Development Loop',
                excerpt: 'Ai2 and Hugging Face present olmo-eval as an evaluation stack built for iterative model development, tracking interventions across data, architecture, hyperparameters, scale, and reproducible benchmark configuration.',
                author: 'Tyler Murray, Ai2 and Kyle Wiggers',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Research Craft',
                tags: ['Model Evaluation', 'OLMo', 'Benchmarking', 'Reproducibility'],
                readTime: '8 min read',
                publishDate: '2026-06-12',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/allenai/olmo-eval',
                coverImage: 'https://cdn-uploads.huggingface.co/production/uploads/638e39b249de7ae552d977b5/gacAOFYwPkpxu7cC4eeey.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-llm-architecture-kv-compression',
                title: 'Recent Developments in LLM Architectures: KV Sharing, mHC, and Compressed Attention',
                excerpt: 'Sebastian Raschka compares recent open-weight LLM architecture changes, focusing on how KV sharing, per-layer embeddings, attention budgeting, and compressed attention reduce long-context inference costs.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://sebastianraschka.com/images/logos/photo-2021-08-25_compressed.jpg',
                category: 'Foundation Model',
                tags: ['LLM Architecture', 'KV Cache', 'Compressed Attention', 'Long Context'],
                readTime: '25 min read',
                publishDate: '2026-05-16',
                sourceName: 'Ahead of AI',
                url: 'https://magazine.sebastianraschka.com/p/recent-developments-in-llm-architectures',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!6wCM!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2b841d26-5b2d-4be9-9710-d89d4f023f0c_1600x900.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'huggingface-continuous-batching-async',
                title: 'Unlocking Asynchronicity in Continuous Batching',
                excerpt: 'Rémi Ouazan Reboul, Pedro Cuenca, and Aritra Roy Gosthipaty show how asynchronous CPU/GPU scheduling, CUDA streams, and event coordination remove idle gaps in continuous batching for faster LLM inference.',
                author: 'Rémi Ouazan Reboul, Pedro Cuenca, Aritra Roy Gosthipaty',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Efficient AI',
                tags: ['LLM Inference', 'Continuous Batching', 'CUDA Streams', 'Throughput'],
                readTime: '18 min read',
                publishDate: '2026-05-14',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/continuous_async',
                coverImage: 'https://huggingface.co/blog/assets/continuous_async/thumbnail.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'google-reasoningbank-agent-memory',
                title: 'ReasoningBank: Enabling Agents to Learn from Experience',
                excerpt: 'Jun Yan and Chen-Yu Lee explain ReasoningBank, an agent memory framework that distills reusable strategies from successful and failed trajectories, then uses memory-aware test-time scaling to improve future agent behavior.',
                author: 'Jun Yan and Chen-Yu Lee',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.google&sz=128',
                category: 'AI Agents',
                tags: ['Agent Memory', 'Test-Time Scaling', 'ReasoningBank', 'SWE-Bench'],
                readTime: '14 min read',
                publishDate: '2026-04-21',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/reasoningbank-enabling-agents-to-learn-from-experience/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/HO_previewImage1.width-800.format-jpeg.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'bai-verbalization-overinterpretation',
                title: 'Prediction, Explanation, or Over-interpretation?',
                excerpt: 'Xiaoyan Bai and collaborators compare self-report, activation-oracle, and natural-language-autoencoder verbalization methods, showing why verbal explanations of model internals need behavioral grounding before they are treated as faithful evidence.',
                author: 'Xiaoyan Bai, Tianze Hua, Yichen Wang, Tianyang Xu, Mina Lee, Ellie Pavlick, Chenhao Tan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=elena-baixy.github.io&sz=128',
                category: 'Trustworthy AI',
                tags: ['Interpretability', 'Model Internals', 'Evaluation Awareness', 'Verbalization'],
                readTime: '16 min read',
                publishDate: '2026-06-01',
                sourceName: 'Xiaoyan Bai',
                url: 'https://elena-baixy.github.io/verbalization.html',
                coverImage: 'https://elena-baixy.github.io/verbalization_blog/hero.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'nvidia-scaling-video-training-parallelism',
                title: 'Scaling Video Training with Parallelism',
                excerpt: 'Yukang Chen, Luozhou Wang, Wei Huang, Shuai Yang, Weian Mao, and Song Han explain why long-video models need sequence parallelism that respects frame origin, VAE work, clean/noisy target layout, and hardware topology.',
                author: 'Yukang Chen, Luozhou Wang, Wei Huang, Shuai Yang, Weian Mao, Song Han',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.nvidia.com&sz=128',
                category: 'Visual Generation',
                tags: ['Video Generation', 'Sequence Parallelism', 'Training Systems', 'Long Context'],
                readTime: '12 min read',
                publishDate: '2026-06-03',
                sourceName: 'NVIDIA Research',
                url: 'https://research.nvidia.com/labs/eai/blogs/scaling-video-training-with-parallelism/',
                coverImage: 'assets/img/covers/real/nvidia-scaling-video-training-parallelism.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'yoonho-text-optimization-seriously',
                title: 'We Should Take Text Optimization More Seriously',
                excerpt: 'Yoonho Lee argues that prompts, memory, retrieval state, files, and harnesses are legitimate update targets, framing text optimization as an auditable, sample-efficient learning layer for model systems.',
                author: 'Yoonho Lee',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=yoonholee.com&sz=128',
                category: 'AI Agents',
                tags: ['Text Optimization', 'Prompting', 'Agent Memory', 'Update-Time Compute'],
                readTime: '14 min read',
                publishDate: '2026-06-08',
                sourceName: 'Yoonho Lee',
                url: 'https://yoonholee.com/blog/2026/we-should-take-text-optimization-more-seriously/',
                coverImage: 'assets/img/covers/real/yoonho-text-optimization-seriously.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'tilde-compositional-steepest-descent',
                title: 'Towards Compositional Steepest Descent',
                excerpt: 'The Tilde Research team develops a compositional view of Muon-style optimization, moving from single-layer operator-norm updates to functional perturbations in QK, OV, RMSNorm, and gated MLP structures.',
                author: 'Ben Keigwin, Li Yang, Dhruv Pai, Yunzhe Zhang, Alec DeWulf',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=tilderesearch.com&sz=128',
                category: 'Efficient AI',
                tags: ['Muon', 'Optimization', 'Steepest Descent', 'Transformer Training'],
                readTime: '35 min read',
                publishDate: '2026-06-01',
                sourceName: 'Tilde Research',
                url: 'https://blog.tilderesearch.com/blog/compositional-muon',
                coverImage: 'https://blog.tilderesearch.com/images/blog/compositional-muon/cover.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'openathena-pretraining-efficiency',
                title: 'Improving our LLM Pretraining Efficiency',
                excerpt: 'Larry Dial details Open Athena improvements to a large-scale pretraining recipe, from dense-to-MoE migration and expert sparsity to MuonH, partial key offset, and routed expert normalization.',
                author: 'Larry Dial',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openathena.ai&sz=128',
                category: 'Efficient AI',
                tags: ['Pretraining', 'MoE', 'Muon', 'Training Efficiency'],
                readTime: '12 min read',
                publishDate: '2026-06-03',
                sourceName: 'Open Athena',
                url: 'https://openathena.ai/blog/pretraining-speedup/',
                coverImage: 'https://openathena.ai/assets/images/blog/pretraining-speedup/lr-bpb-grid.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'luke-huang-frontier-asynchronous-rl',
                title: 'Is Frontier Asynchronous RL Solved?',
                excerpt: 'Luke J. Huang surveys asynchronous RL for frontier post-training, separating throughput gains from policy-lag instability, numerical mismatch, importance-sampling controls, and open systems questions.',
                author: 'Luke J. Huang',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=luk-huang.github.io&sz=128',
                category: 'AI Agents',
                tags: ['Asynchronous RL', 'Post-Training', 'Policy Lag', 'RL Systems'],
                readTime: '15 min read',
                publishDate: '2026-05-31',
                sourceName: 'Luke J. Huang',
                url: 'https://luk-huang.github.io/personal-website/blog/is-frontier-asynchronous-rl-solved.html',
                coverImage: 'https://luk-huang.github.io/personal-website/assets/blog/async-rl/figures/1sync-vs-async-rl.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'yichuan-rl-as-a-service-infrastructure',
                title: 'Rethinking RL as a Service and the Position of RL Infrastructure',
                excerpt: 'Yichuan Wang distinguishes the real systems opportunity in RL infrastructure from the weaker near-term business case for generic RL-as-a-service, emphasizing reward design, rollout scale, and enterprise adaptation loops.',
                author: 'Yichuan Wang',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=yichuan-w.github.io&sz=128',
                category: 'AI Agents',
                tags: ['RL Infrastructure', 'Post-Training', 'Enterprise AI', 'Agent Harnesses'],
                readTime: '8 min read',
                publishDate: '2026-05-01',
                sourceName: 'Yichuan Wang',
                url: 'https://yichuan-w.github.io/blog/rethinking-rl-as-a-service/',
                coverImage: 'assets/img/covers/real/yichuan-rl-as-a-service-infrastructure.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'galilai-stable-worldmodel',
                title: 'Stable World-Model',
                excerpt: 'The GalilAI Group presents an open-source toolkit for world-model research, with installable environments, baselines, wrappers, datasets, and training interfaces for running controlled model-based RL experiments.',
                author: 'GalilAI Group',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=galilai-group.github.io&sz=128',
                category: 'World Model',
                tags: ['World Models', 'Model-Based RL', 'Research Toolkit', 'Environments'],
                readTime: '8 min read',
                publishDate: '2026-06-01',
                sourceName: 'GalilAI Group',
                url: 'https://galilai-group.github.io/stable-worldmodel/',
                coverImage: 'assets/img/covers/real/galilai-stable-worldmodel.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'hylak-how-to-eval-ai-agents',
                title: 'How to Eval AI Agents: The 2026 Guide',
                excerpt: 'Ben Hylak lays out a production-minded agent evaluation loop: choose between benchmark maxing and floor raising, inspect trajectories, write code-aware offline evals, and turn real failures into targeted regressions.',
                author: 'Ben Hylak',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=howtoeval.com&sz=128',
                category: 'Research Craft',
                tags: ['Agent Evaluation', 'Production Monitoring', 'Error Analysis', 'Offline Evals'],
                readTime: '30 min read',
                publishDate: '2026-05-01',
                sourceName: 'howtoeval.com',
                url: 'https://www.howtoeval.com/',
                coverImage: 'https://www.howtoeval.com/og-image.png?v=2',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'davies-ai-agent-evaluation-frameworks',
                title: 'AI Agent Evaluation: Frameworks, Strategies, and Best Practices',
                excerpt: 'Dave Davies organizes agent evaluation across technical capability, autonomy, trust and safety, and business impact, giving a broad framework for assessing increasingly independent LLM systems.',
                author: 'Dave Davies',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=medium.com&sz=128',
                category: 'Research Craft',
                tags: ['Agent Evaluation', 'Autonomy', 'Trust and Safety', 'Production AI'],
                readTime: '143 min read',
                publishDate: '2025-10-22',
                sourceName: 'Online Inference',
                url: 'https://medium.com/online-inference/ai-agent-evaluation-frameworks-strategies-and-best-practices-9dc3cfdf9890',
                coverImage: 'assets/img/covers/real/davies-ai-agent-evaluation-frameworks.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'priyal-mechanics-of-lora',
                title: 'The Mechanics of LoRA',
                excerpt: 'Priyal Taneja explains LoRA from the serving and systems angle, connecting low-rank adapters, base-model reuse, routing, and the practical constraints that shape adapter-based deployment.',
                author: 'Priyal Taneja',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=priyaltaneja.com&sz=128',
                category: 'Efficient AI',
                tags: ['LoRA', 'Adapters', 'Model Serving', 'Efficient Fine-Tuning'],
                readTime: '18 min read',
                publishDate: '2026-06-01',
                sourceName: 'Priyal Taneja',
                url: 'https://www.priyaltaneja.com/mechanics-of-lora',
                coverImage: 'assets/img/covers/real/priyal-mechanics-of-lora.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'xuhui-thinking-in-rl',
                title: 'Thinking in RL',
                excerpt: 'Xuhui Zhou gives an opinionated map of modern RL algorithms for LLM training, tying PPO, GRPO, REINFORCE variants, DPO, advantage estimates, and policy-gradient ideas into one conceptual tree.',
                author: 'Xuhui Zhou',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=xuhuiz.com&sz=128',
                category: 'AI Agents',
                tags: ['Reinforcement Learning', 'PPO', 'GRPO', 'Policy Gradients'],
                readTime: '35 min read',
                publishDate: '2026-04-13',
                sourceName: 'Xuhui Zhou',
                url: 'https://xuhuiz.com/blog/thinking-in-rl',
                coverImage: 'assets/img/covers/real/xuhui-thinking-in-rl.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'chinmay-policy-distillation-imitation-game',
                title: 'The Imitation Game: State of Policy Distillation in Language Model Training',
                excerpt: 'Chinmay Karkar surveys on-policy distillation for language models, covering teacher-student objectives, cross-tokenizer supervision, multi-teacher recipes, failure modes, and open problems.',
                author: 'Chinmay Karkar',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=chinmaykarkar.com&sz=128',
                category: 'Efficient AI',
                tags: ['Policy Distillation', 'Knowledge Distillation', 'Post-Training', 'Tokenizer Alignment'],
                readTime: '24 min read',
                publishDate: '2026-05-15',
                sourceName: 'Chinmay Karkar',
                url: 'https://chinmaykarkar.com/blog/OPD_blog/',
                coverImage: 'https://chinmaykarkar.com/OPD_blog_light.jpg',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'openai-macro-evals-agentic-systems',
                title: 'Macro Evals for Agentic Systems',
                excerpt: 'OpenAI Cookbook demonstrates macro evals for agentic systems, using realistic end-to-end workflows, trace bundles, tool-call evidence, review packets, and aggregate diagnostics rather than isolated LLM-call scoring.',
                author: 'OpenAI Cookbook',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=developers.openai.com&sz=128',
                category: 'Research Craft',
                tags: ['Macro Evals', 'Agents SDK', 'Trace Analysis', 'Workflow Evaluation'],
                readTime: '45 min read',
                publishDate: '2026-05-01',
                sourceName: 'OpenAI Cookbook',
                url: 'https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems',
                coverImage: 'https://developers.openai.com/open-graph.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'shreya-agent-assisted-qualitative-analysis',
                title: 'Exploring Agent-Assisted Qualitative Analysis',
                excerpt: 'Shreya Shankar uses qualitative analysis as a testbed for agent design, comparing naive agentic setups, human-in-the-loop workflows, and the gap between automation behavior and actual research methodology.',
                author: 'Shreya Shankar',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sh-reya.com&sz=128',
                category: 'Research Craft',
                tags: ['Qualitative Analysis', 'Human-in-the-Loop', 'Agents', 'Research Methods'],
                readTime: '28 min read',
                publishDate: '2026-05-21',
                sourceName: 'Shreya Shankar',
                url: 'https://www.sh-reya.com/blog/ai-qual-analysis/',
                coverImage: 'https://www.sh-reya.com/blogimages/ai-qual-analysis/generic1.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'complex-systems-visualizer',
                title: 'Complex Systems Visualizer',
                excerpt: 'Complex Systems Visualizer turns concepts from complex-systems science into an explorable browser companion, with interactive scenes for bifurcations, heavy tails, SIR dynamics, boundaries, and case-study essays.',
                author: 'Complex Systems Visualizer',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=complexsystems.replit.app&sz=128',
                category: 'Research Craft',
                tags: ['Complex Systems', 'Interactive Visualization', 'Simulation', 'Systems Thinking'],
                readTime: '20 min read',
                publishDate: '2026-06-01',
                sourceName: 'Complex Systems Visualizer',
                url: 'https://complexsystems.replit.app/',
                coverImage: 'https://folded.replit.app/opengraph.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'sakana-diffusionblocks',
                title: 'DiffusionBlocks: Training Neural Networks One Block at a Time',
                excerpt: 'Sakana AI introduces DiffusionBlocks, a block-wise training framework that reinterprets residual-network updates as diffusion dynamics to reduce activation memory while matching end-to-end training across multiple architectures.',
                author: 'Makoto Shing, Masanori Koyama, Takuya Akiba',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=pub.sakana.ai&sz=128',
                category: 'Efficient AI',
                tags: ['DiffusionBlocks', 'Block-wise Training', 'Memory Efficiency', 'Transformers'],
                readTime: '12 min read',
                publishDate: '2026-05-01',
                sourceName: 'Sakana AI',
                url: 'https://pub.sakana.ai/diffusionblocks/',
                coverImage: 'https://pub.sakana.ai/diffusionblocks/assets/figures/cover_social.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'aleksa-transformer-life-token',
                title: 'Inside the Transformer: The Life of a Token',
                excerpt: 'Aleksa Gordic walks through a modern dense transformer forward pass, covering tokenization, embeddings, RMSNorm, GeGLU MLPs, GQA, YaRN, block-local attention, FLOPs per token, and cluster sizing.',
                author: 'Aleksa Gordic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=aleksagordic.com&sz=128',
                category: 'Foundation Model',
                tags: ['Transformer Architecture', 'Attention', 'YaRN', 'LLM Systems'],
                readTime: '30 min read',
                publishDate: '2026-05-26',
                sourceName: 'Aleksa Gordic',
                url: 'https://www.aleksagordic.com/blog/transformer',
                coverImage: 'https://www.aleksagordic.com/blog/transformer/flow_pre.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'greg-goal-engineering',
                title: 'Goal Engineering: How I Brief Coding Agents Using Paired Goal+Rider Documents',
                excerpt: 'Greg Ceccarelli describes a practical agent-briefing workflow built around compact goal files and richer rider documents, turning coding-agent runs into durable, testable, reviewable work units.',
                author: 'Greg Ceccarelli',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=gregceccarelli.com&sz=128',
                category: 'AI Agents',
                tags: ['Coding Agents', 'Specifications', 'Goal Documents', 'Agent Workflow'],
                readTime: '25 min read',
                publishDate: '2026-05-18',
                sourceName: 'Greg Ceccarelli',
                url: 'https://www.gregceccarelli.com/goal-engineering',
                coverImage: 'https://www.gregceccarelli.com/goal-engineering/assets/og-image.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'jiaxin-generalization-dynamics',
                title: 'Generalization Dynamics of LM Pre-training',
                excerpt: 'Jiaxin Wen, Zhengxuan Wu, Dawn Song, and Lijie Chen show that language models can mode-hop between shallow pattern matching and generalizable behavior during pretraining, motivating checkpoint and data-selection monitors.',
                author: 'Jiaxin Wen, Zhengxuan Wu, Dawn Song, Lijie Chen',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=jiaxin-wen.github.io&sz=128',
                category: 'Foundation Model',
                tags: ['Generalization', 'Pretraining Dynamics', 'Checkpoint Selection', 'Mode Hopping'],
                readTime: '25 min read',
                publishDate: '2026-05-01',
                sourceName: 'Jiaxin Wen',
                url: 'https://jiaxin-wen.github.io/blog/generalization-dynamics',
                coverImage: 'https://jiaxin-wen.github.io/blog/figures/img/flipped_answer_hard_acc_tokens.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'trajectory-multi-lora-continual-learning',
                title: 'Multi-LoRA Training for Continual Learning',
                excerpt: 'Chuck Tang describes Trajectory C-LoRA, a concurrent multi-LoRA training platform for continual learning that improves experiment throughput while coordinating live feedback, production data, and open training code.',
                author: 'Chuck Tang',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=trajectory.ai&sz=128',
                category: 'Efficient AI',
                tags: ['LoRA', 'Continual Learning', 'Training Infrastructure', 'SkyRL'],
                readTime: '14 min read',
                publishDate: '2026-05-30',
                sourceName: 'Trajectory',
                url: 'https://trajectory.ai/field-notes/multi-lora-training-for-continual-learning',
                coverImage: 'https://framerusercontent.com/images/V0JD7u4HYc4JQduGmL3bK9t2hM.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'roy-anatomy-of-an-llm',
                title: 'The Anatomy of an LLM',
                excerpt: 'Roy van Rijn builds an interactive visual guide that traces text through tokenization, vectors, transformer blocks, logits, sampling, training phases, KV cache, quantization, and post-training.',
                author: 'Roy van Rijn',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=royvanrijn.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['LLM Explainer', 'Tokenization', 'Attention', 'KV Cache'],
                readTime: '20 min read',
                publishDate: '2026-06-01',
                sourceName: 'Roy van Rijn',
                url: 'https://www.royvanrijn.com/anatomy-of-an-llm/',
                coverImage: 'https://www.royvanrijn.com/anatomy-of-an-llm/social/og-image.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'perplexity-unigram-tokenizer-cpu',
                title: 'Improving Unigram Tokenizer CPU Performance',
                excerpt: 'Perplexity Research explains a production tokenizer rewrite that accelerates XLM-RoBERTa Unigram encoding with Viterbi, trie layout, zero steady-state heap allocations, and careful CPU-side benchmarking.',
                author: 'Perplexity Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.perplexity.ai&sz=128',
                category: 'Efficient AI',
                tags: ['Tokenizer', 'CPU Performance', 'Viterbi', 'Inference Systems'],
                readTime: '18 min read',
                publishDate: '2026-05-20',
                sourceName: 'Perplexity Research',
                url: 'https://research.perplexity.ai/articles/improving-unigram-tokenizer-cpu-performance',
                coverImage: 'https://framerusercontent.com/images/Fn05k3P0cxKGt2z2j6iRi5PlrA.png?width=1920&height=1072',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'howard-spectral-progressive-diffusion',
                title: 'Spectral Progressive Diffusion for Efficient Image and Video Generation',
                excerpt: 'Howard Xiao, Brian Chao, Lior Yariv, and Gordon Wetzstein propose a training-free and fine-tunable diffusion acceleration method that grows spatial resolution along the denoising trajectory using spectral noise expansion.',
                author: 'Howard Xiao, Brian Chao, Lior Yariv, Gordon Wetzstein',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=howardxiao.ca&sz=128',
                category: 'Visual Generation',
                tags: ['Diffusion', 'Video Generation', 'Image Generation', 'Inference Efficiency'],
                readTime: '10 min read',
                publishDate: '2026-06-01',
                sourceName: 'Howard Xiao',
                url: 'https://howardxiao.ca/speed/',
                coverImage: 'assets/img/covers/real/howard-spectral-progressive-diffusion.png',
                coverAlt: 'Real cover from original-page-screenshot',
                coverFit: 'cover'
            }
        ];
    }

    getCuratedCommunityBlogs() {
        const blogs = [
            ...this.getICLR2026Blogposts(),
            ...this.getICLRPastBlogposts(),
            ...this.getKalomazeBearBlogs(),
            ...this.getRecentCommunityBlogAdditions(),
            {
                id: 'dair-context-engineering-guide',
                title: 'Context Engineering Guide',
                excerpt: 'Elvis Saravia turns prompt engineering into a broader systems discipline, covering instruction design, RAG context, structured outputs, tool definitions, memory, and evaluation loops for agent workflows.',
                author: 'Elvis Saravia',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=dair.ai&sz=128',
                category: 'AI Agents',
                tags: ['Context Engineering', 'Prompt Engineering', 'Agents', 'RAG'],
                readTime: '15 min read',
                publishDate: '2025-12-24',
                sourceName: 'DAIR.AI',
                url: 'https://www.dair.ai/blog/context-engineering-guide',
                coverImage: 'https://www.dair.ai/_next/image?url=%2Fblog%2Fcontext-engineering-diagram.jpg&w=3840&q=75&dpl=dpl_8h6dFD2cYHkK7QJ6Yt2TeH4uSr1K',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'yao-fu-gpt-ability-sources',
                title: 'How Does GPT Obtain Its Ability? Tracing Emergent Abilities of Language Models to Their Sources',
                excerpt: 'Yao Fu analyzes how GPT-3.5-era capabilities emerged from pretraining, code data, instruction tuning, and RLHF, making the training stack easier to reason about historically.',
                author: 'Yao Fu',
                authorAvatar: 'https://github.com/FranxYao.png',
                category: 'LLM & MLLM',
                tags: ['Emergent Abilities', 'Instruction Tuning', 'RLHF', 'Code Models'],
                readTime: '35 min read',
                publishDate: '2022-12-11',
                sourceName: 'Yao Fu',
                url: 'https://yaofu.notion.site/How-does-GPT-Obtain-its-Ability-Tracing-Emergent-Abilities-of-Language-Models-to-their-Sources-b9a57ac0fcf74f30a1ab9e3e36fa1dc1',
                coverImage: 'assets/img/covers/real/yao-fu-gpt-ability-sources.png',
                coverAlt: 'Real cover from manual:original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'google-palm-scaling-pathways',
                title: 'Pathways Language Model (PaLM): Scaling to 540 Billion Parameters for Breakthrough Performance',
                excerpt: 'Google Research explains PaLM as a large dense decoder-only Transformer trained with Pathways across TPU v4 pods, connecting scale to few-shot reasoning and capability emergence.',
                author: 'Aakanksha Chowdhery, Sharan Narang, Jacob Devlin et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.google&sz=128',
                category: 'Foundation Model',
                tags: ['PaLM', 'Scaling', 'Pathways', 'Few-Shot Learning'],
                readTime: '12 min read',
                publishDate: '2022-04-04',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/pathways-language-model-palm-scaling-to-540-billion-parameters-for-breakthrough-performance/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/07ef38036e86f81ac74829e59384929b-i.width-800.format-jpeg.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'sergey-levine-offline-rl-made-easier',
                title: 'Offline RL Made Easier: No TD Learning, Advantage Reweighting, or Transformers',
                excerpt: 'Scott Emmons, Ben Eysenbach, and Sergey Levine distill offline RL via supervised learning, testing when simple conditional policies can match more complex TD or Transformer-based methods.',
                author: 'Scott Emmons, Ben Eysenbach, Sergey Levine',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=bairblog.github.io&sz=128',
                category: 'AI Agents',
                tags: ['Offline RL', 'RvS', 'Decision Transformer', 'Behavior Cloning'],
                readTime: '14 min read',
                publishDate: '2022-04-20',
                sourceName: 'BAIR Blog',
                url: 'https://bairblog.github.io/2022/04/20/rvs/',
                coverImage: 'https://bairblog.github.io//assets/rvs/rvs-overview.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'patrick-mineault-good-research-code',
                title: 'The Good Research Code Handbook',
                excerpt: 'Patrick Mineault turns software engineering habits into practical guidance for researchers: project structure, decoupled code, tests, documentation, collaboration, and reliable scientific workflows.',
                author: 'Patrick Mineault',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=xcorr.net&sz=128',
                category: 'Research Craft',
                tags: ['Research Code', 'Reproducibility', 'Testing', 'Scientific Computing'],
                readTime: '60 min read',
                publishDate: '2021-12-20',
                sourceName: 'Good Research Code',
                url: 'https://goodresearch.dev/index.html',
                coverImage: 'https://goodresearch.dev/_images/unicorn.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'transformer-circuits-mathematical-framework',
                title: 'A Mathematical Framework for Transformer Circuits',
                excerpt: 'The Transformer Circuits team, including Chris Olah, develops a linear-algebraic way to decompose attention-only transformers into QK and OV circuits, induction heads, and skip-trigram behavior.',
                author: 'Nelson Elhage, Neel Nanda, Catherine Olsson, Chris Olah et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=transformer-circuits.pub&sz=128',
                category: 'Trustworthy AI',
                tags: ['Mechanistic Interpretability', 'Transformer Circuits', 'Induction Heads', 'Attention'],
                readTime: '45 min read',
                publishDate: '2021-12-22',
                sourceName: 'Transformer Circuits',
                url: 'https://transformer-circuits.pub/2021/framework/index.html',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/6d4a0d28992ade92d6fa63646fd9c9d318245c6c-2400x1260.jpg',
                coverAlt: 'Real cover from manual:anthropic-official-mirror',
                coverFit: 'cover'
            },
            {
                id: 'sara-hooker-hardware-lottery',
                title: 'The Hardware Lottery',
                excerpt: 'Sara Hooker explains how hardware and software availability shape which AI research ideas flourish, a durable systems lens on why some algorithms scale while others stall.',
                author: 'Sara Hooker',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hardwarelottery.github.io&sz=128',
                category: 'Efficient AI',
                tags: ['Hardware Lottery', 'AI Systems', 'Research Incentives', 'Compute'],
                readTime: '22 min read',
                publishDate: '2020-08-01',
                sourceName: 'The Hardware Lottery',
                url: 'https://hardwarelottery.github.io/',
                coverImage: 'https://cdn.glitch.com/34a5d448-e59c-4ef1-bfad-458d185273e4%2Funnamed%20(7).jpg?v=1586843526885',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'francois-chollet-llm-prompt-engineering',
                title: 'How I Think About LLM Prompt Engineering',
                excerpt: 'François Chollet frames prompting as search through a continuous space of vector programs, connecting self-attention, embeddings, interpolation, and hallucination behavior.',
                author: 'François Chollet',
                authorAvatar: 'https://github.com/fchollet.png',
                category: 'LLM & MLLM',
                tags: ['Prompt Engineering', 'Vector Programs', 'Self-Attention', 'LLM Behavior'],
                readTime: '12 min read',
                publishDate: '2023-10-09',
                sourceName: 'Sparks in the Wind',
                url: 'https://fchollet.substack.com/p/how-i-think-about-llm-prompt-engineering',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!43kM!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F5a9ca68f-6b32-4dbc-a266-cb1a5b62f236_1024x1024.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'francois-chollet-limitations-deep-learning',
                title: 'The Limitations of Deep Learning',
                excerpt: 'François Chollet separates local generalization from human-like abstraction, laying out why deep learning systems struggle with reasoning, symbolic manipulation, and out-of-distribution recombination.',
                author: 'François Chollet',
                authorAvatar: 'https://github.com/fchollet.png',
                category: 'Foundation Model',
                tags: ['Generalization', 'Abstraction', 'Deep Learning Limits', 'Reasoning'],
                readTime: '18 min read',
                publishDate: '2017-07-17',
                sourceName: 'Keras Blog',
                url: 'https://blog.keras.io/the-limitations-of-deep-learning.html',
                coverImage: 'https://blog.keras.io/img/deep_learning_with_python_cover_thumbnail.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'david-ha-weight-agnostic-networks',
                title: 'Weight Agnostic Neural Networks',
                excerpt: 'Adam Gaier and David Ha ask how much useful behavior can come from architecture alone, using shared random weights to probe inductive bias and architecture search.',
                author: 'Adam Gaier, David Ha',
                authorAvatar: 'https://github.com/hardmaru.png',
                category: 'Efficient AI',
                tags: ['Architecture Search', 'Inductive Bias', 'Neuroevolution', 'Random Weights'],
                readTime: '18 min read',
                publishDate: '2019-06-12',
                sourceName: 'hardmaru / otoro',
                url: 'https://weightagnostic.github.io/',
                coverImage: 'https://weightagnostic.github.io/assets/img/wann_card_rect_v2.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'david-ha-world-models-experiments',
                title: 'World Models Experiments',
                excerpt: 'David Ha provides implementation-level notes for reproducing World Models, including environment setup, VAE and MDN-RNN training, CMA-ES controllers, and compute trade-offs.',
                author: 'David Ha',
                authorAvatar: 'https://github.com/hardmaru.png',
                category: 'World Model',
                tags: ['World Models', 'Reinforcement Learning', 'VAE', 'CMA-ES'],
                readTime: '35 min read',
                publishDate: '2018-06-09',
                sourceName: 'hardmaru / otoro',
                url: 'https://blog.otoro.net/2018/06/09/world-models-experiments/',
                coverImage: 'https://blog.otoro.net/assets/card/slime_rect.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'karpathy-recipe-training-neural-networks',
                title: 'A Recipe for Training Neural Networks',
                excerpt: 'Andrej Karpathy lays out a practical debugging-first process for neural network training: inspect data, establish baselines, overfit small batches, regularize, tune, and measure carefully.',
                author: 'Andrej Karpathy',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=karpathy.github.io&sz=128',
                category: 'Research Craft',
                tags: ['Training Practice', 'Debugging', 'Neural Networks', 'Experiment Design'],
                readTime: '28 min read',
                publishDate: '2019-04-25',
                sourceName: 'Andrej Karpathy',
                url: 'https://karpathy.github.io/2019/04/25/recipe/',
                coverImage: 'assets/img/covers/real/karpathy-recipe-training-neural-networks.png',
                coverAlt: 'Real cover from manual:original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'karpathy-unreasonable-rnns',
                title: 'The Unreasonable Effectiveness of Recurrent Neural Networks',
                excerpt: 'Andrej Karpathy gives an unusually vivid technical tour of character-level RNNs, sampling behavior, training dynamics, attention, and why simple sequence models can feel surprisingly powerful.',
                author: 'Andrej Karpathy',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=karpathy.github.io&sz=128',
                category: 'Foundation Model',
                tags: ['RNN', 'Language Modeling', 'Sequence Models', 'Sampling'],
                readTime: '32 min read',
                publishDate: '2015-05-21',
                sourceName: 'Andrej Karpathy',
                url: 'https://karpathy.github.io/2015/05/21/rnn-effectiveness/',
                coverImage: 'https://karpathy.github.io/assets/rnn/diags.jpeg',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'colah-understanding-lstms',
                title: 'Understanding LSTM Networks',
                excerpt: 'Chris Olah uses diagrams and step-by-step equations to explain recurrent networks, long-term dependencies, LSTM gates, variants, and the bridge toward attention.',
                author: 'Chris Olah',
                authorAvatar: 'https://github.com/colah.png',
                category: 'Foundation Model',
                tags: ['LSTM', 'RNN', 'Sequence Modeling', 'Visual Explanation'],
                readTime: '22 min read',
                publishDate: '2015-08-27',
                sourceName: "colah's blog",
                url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/',
                coverImage: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/img/RNN-rolled.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-managed-agents',
                title: 'Scaling Managed Agents: Decoupling the Brain from the Hands',
                excerpt: 'Anthropic describes a managed-agent architecture that separates high-level reasoning from computer-control execution, improving handoff reliability, UI operation, and recovery in long-running workflows.',
                author: 'Anthropic Applied AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['Managed Agents', 'Computer Use', 'Agent Architecture', 'Long-Running Tasks'],
                readTime: '12 min read',
                publishDate: '2026-04-08',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/managed-agents',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/c4c716fb31cdbd336b628549cdac0f14e10d0099-2000x1050.heif',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-harness-design-long-running-apps',
                title: 'Harness Design for Long-Running Agents',
                excerpt: 'Anthropic lays out the harness patterns that make app-development agents useful over hours: persistent state, clean checkpoints, recovery paths, environment control, and targeted human feedback.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['Agent Harnesses', 'Long-Running Agents', 'Checkpoints', 'Developer Tools'],
                readTime: '14 min read',
                publishDate: '2026-03-24',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/harness-design-long-running-apps',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/84a488382e0428a5eebade574af047e5d3b610ab-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-eval-awareness-browsecomp',
                title: 'Eval Awareness in BrowseComp Agents',
                excerpt: 'Anthropic analyzes why frontier browsing agents may infer that they are being evaluated, and how benchmark wording, task distribution, and harness leakage can distort measured capability.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Eval Awareness', 'BrowseComp', 'Agent Benchmarks', 'Benchmark Design'],
                readTime: '11 min read',
                publishDate: '2026-03-06',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/eval-awareness-browsecomp',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/82d2262129af025d98a46411fbd42ee970a95cb4-2400x1260.heif',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'openai-codex-agent-loop',
                title: 'Unrolling the Codex Agent Loop',
                excerpt: 'OpenAI breaks down the coding-agent loop behind Codex, covering task setup, environment state, planning, tool calls, tests, patches, review signals, and why iteration quality matters.',
                author: 'Michael Bolin',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'AI Agents',
                tags: ['Codex', 'Coding Agents', 'Agent Loop', 'Software Engineering'],
                readTime: '10 min read',
                publishDate: '2026-01-23',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/unrolling-the-codex-agent-loop/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/6o1H1yOkWlMxAOLzzsBAjJ/b45d21128635360c408f43da0138b319/Agent_loop_desktop-light.svg?q=90&w=3840',
                coverAlt: 'Real cover from manual:openai-article-image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-demystifying-evals-agents',
                title: 'Demystifying Evals for AI Agents',
                excerpt: 'Anthropic gives a practical framework for agent evals, connecting task choice, scaffolding, tool access, grading, error analysis, and product-relevant regression tests.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Research Craft',
                tags: ['Agent Evals', 'Error Analysis', 'Benchmark Design', 'Product Quality'],
                readTime: '13 min read',
                publishDate: '2026-01-09',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/412be842c5c6bae6b4bcd515c191b0aa5015e05f-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-ai-resistant-technical-evaluations',
                title: 'Designing AI-Resistant Technical Evaluations',
                excerpt: 'Anthropic explains how to build technical hiring and assessment tasks that stay informative when candidates have powerful coding agents, focusing on ambiguity, review, and real debugging judgment.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Research Craft',
                tags: ['Technical Evals', 'Coding Agents', 'Assessment Design', 'Human Judgment'],
                readTime: '10 min read',
                publishDate: '2026-01-21',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/AI-resistant-technical-evaluations',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/19121280eda2955bdd2d0b12c4f61b1a89b6098f-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cursor-secure-codebase-indexing',
                title: 'Securely Indexing Millions of Codebases',
                excerpt: 'Cursor describes the architecture behind large-scale private codebase indexing, including chunking, embedding search, encryption boundaries, access controls, cache invalidation, and isolation guarantees.',
                author: 'Jeremy Stribling',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cursor.com&sz=128',
                category: 'AI Agents',
                tags: ['Codebase Indexing', 'Coding Agents', 'Security', 'Retrieval'],
                readTime: '6 min read',
                publishDate: '2026-01-27',
                sourceName: 'Cursor Blog',
                url: 'https://cursor.com/blog/secure-codebase-indexing',
                coverImage: 'https://ptht05hbb1ssoooe.public.blob.vercel-storage.com/assets/uploads/secure-index-cover.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-bloom-auto-evals',
                title: 'Bloom: An Approach to Automated Behavioral Evaluations',
                excerpt: 'Anthropic Alignment presents Bloom, a pipeline for generating behavioral evals from natural-language rubrics, inspecting model failure modes, and scaling coverage beyond hand-written tests.',
                author: 'Anthropic Alignment',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Behavioral Evals', 'Automated Evals', 'Alignment', 'Model Auditing'],
                readTime: '24 min read',
                publishDate: '2025-12-16',
                sourceName: 'Anthropic Alignment',
                url: 'https://alignment.anthropic.com/2025/bloom-auto-evals/',
                coverImage: 'https://alignment.anthropic.com/2025/bloom-auto-evals/fig1.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-effective-harnesses-long-running-agents',
                title: 'Effective Harnesses for Long-Running Agents',
                excerpt: 'Anthropic shows how tool wrappers, resumability, plan tracking, review gates, state summaries, and environmental affordances change how well long-horizon agents complete real work.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['Agent Harnesses', 'Resumability', 'Tool Use', 'Long-Horizon Agents'],
                readTime: '15 min read',
                publishDate: '2025-11-26',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/32ea71b3e8e87a990f6df4c4def2b9e52815e977-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-code-execution-with-mcp',
                title: 'Code Execution with MCP: Building More Efficient Agents',
                excerpt: 'Anthropic uses MCP-hosted code execution to move computation closer to tools, reducing context bloat and latency while making data-processing agents easier to inspect and reproduce.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['MCP', 'Code Execution', 'Agent Tools', 'Context Efficiency'],
                readTime: '10 min read',
                publishDate: '2025-11-04',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/code-execution-with-mcp',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/8071ace7b1158ab6d3f8fa04679cef31234425ab-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-claude-code-sandboxing',
                title: 'Beyond Permission Prompts: Making Claude Code More Secure and Autonomous',
                excerpt: 'Anthropic details Claude Code sandboxing patterns that combine OS isolation, network controls, tool permissions, and filesystem boundaries to make coding agents safer at higher autonomy.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Claude Code', 'Sandboxing', 'Agent Security', 'Tool Permissions'],
                readTime: '12 min read',
                publishDate: '2025-10-20',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/claude-code-sandboxing',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/5140cdbe58c21cc117e5f90bfe17245893cbce8d-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-writing-tools-for-agents',
                title: 'Writing Effective Tools for AI Agents',
                excerpt: 'Anthropic explains why agent tools should be designed for model cognition, with crisp names, scoped schemas, examples, error affordances, compact outputs, and empirical tool-eval loops.',
                author: 'Anthropic Engineering',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['Tool Design', 'Agent Tools', 'Schemas', 'Tool Evals'],
                readTime: '16 min read',
                publishDate: '2025-09-11',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/writing-tools-for-agents',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/91df4759f1037fb6073de772278cb71e6e4ee37d-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'braintrust-logs-evals-same-place',
                title: 'Why Your Traces and Evals Belong in the Same Place',
                excerpt: 'Braintrust argues that production traces, curated datasets, offline evals, and online regressions should share one workflow so teams can turn incidents into durable evaluation coverage.',
                author: 'Ornella Altunyan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=braintrust.dev&sz=128',
                category: 'Research Craft',
                tags: ['LLM Evals', 'Tracing', 'Production AI', 'Regression Testing'],
                readTime: '4 min read',
                publishDate: '2026-05-11',
                sourceName: 'Braintrust Blog',
                url: 'https://www.braintrust.dev/blog/traces-and-evals-same-place',
                coverImage: 'https://www.braintrust.dev/og?title=Why+your+traces+and+evals+belong+in+the+same+place&description=What+you+can+catch%2C+fix%2C+and+automate+when+traces+and+evals+live+in+the+same+platform.&template=blog&v=3',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cursor-dynamic-context-discovery',
                title: 'Dynamic Context Discovery in Cursor',
                excerpt: 'Cursor explains how coding agents decide which files, symbols, grep results, and semantic chunks matter during a task, balancing autonomy with context-window and latency constraints.',
                author: 'Jediah Katz',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cursor.com&sz=128',
                category: 'AI Agents',
                tags: ['Context Discovery', 'Coding Agents', 'Code Search', 'Retrieval'],
                readTime: '6 min read',
                publishDate: '2026-01-06',
                sourceName: 'Cursor Blog',
                url: 'https://cursor.com/blog/dynamic-context-discovery',
                coverImage: 'https://cursor.com/marketing-static/_next/image?url=https%3A%2F%2Fptht05hbb1ssoooe.public.blob.vercel-storage.com%2Fassets%2Fblog%2Fpast-chats-light.png&w=3840&q=70',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'hf-continuous-batching-from-first-principles',
                title: 'Prefill and Decode for Concurrent Requests - Optimizing LLM Performance',
                excerpt: 'Hugging Face explains continuous batching from the ground up, showing how prefill, decode, token scheduling, cache pressure, and request variability shape serving throughput.',
                author: 'Benjamin Merkel and TNG Technology Consulting',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Efficient AI',
                tags: ['Continuous Batching', 'LLM Serving', 'Inference', 'Scheduling'],
                readTime: '18 min read',
                publishDate: '2025-04-16',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/tngtech/llm-performance-prefill-decode-concurrent-requests',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/blog/tngtech/llm-performance-prefill-decode-concurrent-requests.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'baseten-kv-cache-aware-routing',
                title: '2x Faster Inference with KV Cache-Aware Routing',
                excerpt: 'Baseten shows how routing requests by shared prefixes and cached token state can raise cache hit rates, reduce prefill work, and improve latency in production LLM serving.',
                author: 'Abu Qader, Michael Feil and Rachel Rapp',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=baseten.co&sz=128',
                category: 'Efficient AI',
                tags: ['KV Cache', 'Routing', 'LLM Serving', 'Prefix Caching'],
                readTime: '9 min read',
                publishDate: '2025-10-16',
                sourceName: 'Baseten Blog',
                url: 'https://www.baseten.co/blog/how-baseten-achieved-2x-faster-inference-with-nvidia-dynamo/',
                coverImage: 'https://www.baseten.co/blog/how-baseten-achieved-2x-faster-inference-with-nvidia-dynamo/opengraph-image-w6ejn9?d279179c4f880b3f',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hf-colpali-visual-document-retrieval',
                title: 'ColPali: Efficient Document Retrieval with Vision Language Models',
                excerpt: 'Hugging Face explains ColPali, a late-interaction retrieval method that embeds document pages as image patches and uses MaxSim scoring for layout-rich PDFs, tables, and scanned documents.',
                author: 'Manuel Faysse, Hugues Sibille, Tony Wu, Bilel Omrani, Gautier Viaud, Celine Hudelot and Pierre Colombo',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Multimodal Model',
                tags: ['ColPali', 'Document Retrieval', 'Vision-Language Models', 'Late Interaction'],
                readTime: '15 min read',
                publishDate: '2024-07-05',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/manu/colpali',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/blog/manu/colpali.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'jina-late-chunking-contextual-retrieval',
                title: 'Late Chunking in Long-Context Embedding Models',
                excerpt: 'Jina AI explains late chunking, a retrieval trick that embeds long documents before pooling chunk vectors so local chunks retain global context for RAG and document search.',
                author: 'Michael Gunther and Han Xiao',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=jina.ai&sz=128',
                category: 'Research Craft',
                tags: ['Late Chunking', 'Embeddings', 'RAG', 'Long Context'],
                readTime: '8 min read',
                publishDate: '2024-08-22',
                sourceName: 'Jina AI Blog',
                url: 'https://jina.ai/news/late-chunking-in-long-context-embedding-models/',
                coverImage: 'https://jina.ai/blog-banner/late-chunking-in-long-context-embedding-models.webp',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'metr-frontier-risk-report-2026',
                title: 'Frontier Risk Report (February to March 2026)',
                excerpt: 'METR pilots an entity-level assessment of internal AI-agent risk across frontier developers, organizing evidence into means, motive, and opportunity for rogue-deployment threat modeling.',
                author: 'METR',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=metr.org&sz=128',
                category: 'Trustworthy AI',
                tags: ['Frontier Risk', 'Agent Evals', 'Monitoring', 'Threat Modeling'],
                readTime: '45 min read',
                publishDate: '2026-05-19',
                sourceName: 'METR',
                url: 'https://metr.org/blog/2026-05-19-frontier-risk-report/',
                coverImage: 'https://metr.org/assets/images/frontier-risk-report/frontier-risk-report-og.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'claude-code-large-codebases',
                title: 'How Claude Code Works in Large Codebases',
                excerpt: 'Claude distills enterprise-scale coding-agent practices: repository onboarding, context discovery, configuration, team conventions, review loops, and where developers should start in large codebases.',
                author: 'Claude Code Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=claude.com&sz=128',
                category: 'Research Craft',
                tags: ['Claude Code', 'Coding Agents', 'Large Codebases', 'Developer Workflow'],
                readTime: '5 min read',
                publishDate: '2026-05-14',
                sourceName: 'Claude Blog',
                url: 'https://claude.com/blog/how-claude-code-works-in-large-codebases-best-practices-and-where-to-start',
                coverImage: 'https://cdn.prod.website-files.com/68a44d4040f98a4adf2207b6/6a060215e86f555c3638a2a1_og_how-claude-code-works-in-large-codebases-best-practices-and-where-to-start.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'goodfire-interpreting-language-model-parameters',
                title: 'Interpreting Language Model Parameters',
                excerpt: 'Goodfire introduces adversarial parameter decomposition, a method for decomposing model weights into sparse mechanistic subcomponents that can support attribution, circuit analysis, and hand editing.',
                author: 'Lucius Bushnaq, Dan Braun, Oliver Clive-Griffin, Bart Bussmann, Nathan Hu, Michael Ivanitskiy, Linda Linsefors and Lee Sharkey',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=goodfire.ai&sz=128',
                category: 'Trustworthy AI',
                tags: ['Mechanistic Interpretability', 'Parameter Decomposition', 'Circuit Analysis', 'Model Editing'],
                readTime: '55 min read',
                publishDate: '2026-05-05',
                sourceName: 'Goodfire Research',
                url: 'https://www.goodfire.ai/research/interpreting-lm-parameters',
                coverImage: 'https://cdn.prod.website-files.com/67b6603da5471104daf6923a/69f9f0f54ed8b604b6817669_paper-hero-final.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'langchain-autonomous-context-compression',
                title: 'Autonomous Context Compression',
                excerpt: 'LangChain explains why long-running agents should be able to compact their own working memory at task boundaries, before large context reads, or after extracting key results.',
                author: 'LangChain Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=langchain.com&sz=128',
                category: 'AI Agents',
                tags: ['Context Compression', 'Deep Agents', 'Agent Memory', 'Long-Running Agents'],
                readTime: '4 min read',
                publishDate: '2026-03-11',
                sourceName: 'LangChain Blog',
                url: 'https://www.langchain.com/blog/autonomous-context-compression',
                coverImage: 'https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69cba9a7649e3ebd9d13268e_Screenshot-2026-03-06-at-3.40.34---PM.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cognition-uses-devin-to-build-devin',
                title: 'How Cognition Uses Devin to Build Devin',
                excerpt: 'Cognition shares concrete operating patterns for coding agents inside its own engineering loop, including codebase Q&A, automated PR review, bug triage, playbooks, MCP tools, and session insights.',
                author: 'The Cognition Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cognition.ai&sz=128',
                category: 'AI Agents',
                tags: ['Coding Agents', 'Agent Operations', 'PR Review', 'Playbooks'],
                readTime: '14 min read',
                publishDate: '2026-02-27',
                sourceName: 'Cognition Blog',
                url: 'https://cognition.ai/blog/how-cognition-uses-devin-to-build-devin',
                coverImage: 'https://cdn.sanity.io/images/2mc9cv2v/production/840f0033d2af9f8f5657e1f6d8dc6c692dca4618-1800x900.png?w=1600&fit=max',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'goodfire-interpretability-infra-frontier-scale',
                title: 'Interpretability Infrastructure at Frontier Scale',
                excerpt: 'Goodfire details the systems work behind harvesting billions of activations from a trillion-parameter model, including inference-server surgery, continuous batching constraints, and provenance-safe activation pipelines.',
                author: 'Michael Anderson, Tucker Fross and Michael Byun',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=goodfire.ai&sz=128',
                category: 'Efficient AI',
                tags: ['Interpretability Infrastructure', 'Activation Harvesting', 'SGLang', 'Frontier Models'],
                readTime: '22 min read',
                publishDate: '2026-02-25',
                sourceName: 'Goodfire Blog',
                url: 'https://www.goodfire.ai/blog/interpretability-infra-at-frontier-scale',
                coverImage: 'https://cdn.prod.website-files.com/67b6603da5471104daf6923a/699e7a10ca8fc4d5e7267241_inference-server-diagram.webp',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'goodfire-features-as-rewards-rlfr',
                title: 'Features as Rewards: Using Interpretability to Reduce Hallucinations',
                excerpt: 'Goodfire turns activation probes into RL reward signals, showing how feature-level monitors can reduce hallucinations, support inline corrections, and remain useful for test-time scaling.',
                author: 'Aaditya Prasad, Connor Watts, Jack Merullo, Dhruvil Gala, Owen Lewis, Thomas McGrath and Ekdeep Singh Lubana',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=goodfire.ai&sz=128',
                category: 'Trustworthy AI',
                tags: ['Feature Rewards', 'Hallucination', 'RLHF', 'Interpretability'],
                readTime: '30 min read',
                publishDate: '2026-02-11',
                sourceName: 'Goodfire Research',
                url: 'https://www.goodfire.ai/research/rlfr',
                coverImage: 'https://cdn.prod.website-files.com/67b6603da5471104daf6923a/69af36294584d45eb3f428da_rlfr-rollout-grid-recolor.webp',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'metr-time-horizon-claude-code-codex',
                title: 'Measuring Time Horizon Using Claude Code and Codex',
                excerpt: 'METR compares specialized coding-agent scaffolds with its own evaluation scaffolds, probing how much the agent harness changes measured task-completion horizons.',
                author: 'Nikola Jurkovic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=metr.org&sz=128',
                category: 'Research Craft',
                tags: ['Time Horizon', 'Claude Code', 'Codex', 'Agent Evaluation'],
                readTime: '10 min read',
                publishDate: '2026-02-13',
                sourceName: 'METR Notes',
                url: 'https://metr.org/notes/2026-02-13-measuring-time-horizon-using-claude-code-and-codex/',
                coverImage: 'https://metr.org/assets/images/measuring-time-horizon-using-claude-code-and-codex/histograms.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'metr-time-horizon-1-1',
                title: 'Time Horizon 1.1',
                excerpt: 'METR updates its autonomous capability measurement with more tasks, more long-horizon problems, and a migration to Inspect-based evaluation infrastructure.',
                author: 'METR',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=metr.org&sz=128',
                category: 'Trustworthy AI',
                tags: ['Time Horizon', 'Agent Evals', 'Inspect AI', 'Autonomy Measurement'],
                readTime: '16 min read',
                publishDate: '2026-01-29',
                sourceName: 'METR',
                url: 'https://metr.org/blog/2026-1-29-time-horizon-1-1/',
                coverImage: 'https://metr.org/assets/images/time-horizon-1-1/time-horizon-1-vs-1-1-hybrid.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'metr-early-monitorability-evaluations',
                title: 'Early Work on Monitorability Evaluations',
                excerpt: 'METR introduces SHUSHCAST, a prototype eval for whether monitors can catch agents hiding side tasks, and studies how reasoning traces and time-horizon ratios affect detection.',
                author: 'Megan Kinniment, Seraphina Nix, Thomas Broadley, Hjalmar Wijk and Neev Parikh',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=metr.org&sz=128',
                category: 'Trustworthy AI',
                tags: ['Monitorability', 'Agent Sabotage', 'Reasoning Traces', 'Evals'],
                readTime: '24 min read',
                publishDate: '2026-01-22',
                sourceName: 'METR',
                url: 'https://metr.org/blog/2026-01-19-early-work-on-monitorability-evaluations/',
                coverImage: 'https://metr.org/assets/images/monitorability-post/time_horizon_ratio_non_visible_reasoning.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'apollo-science-of-scheming',
                title: 'We Need A Science of Scheming',
                excerpt: 'Apollo argues that scheming risk needs causal models, scaling hypotheses, and evaluation science, especially as long-horizon RL and automated AI R&D increase hidden-incentive pressure.',
                author: 'Apollo Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=apolloresearch.ai&sz=128',
                category: 'Trustworthy AI',
                tags: ['Scheming', 'AI Safety Science', 'Long-Horizon RL', 'Automated R&D'],
                readTime: '18 min read',
                publishDate: '2026-01-19',
                sourceName: 'Apollo Research',
                url: 'https://www.apolloresearch.ai/science/science-of-scheming/',
                coverImage: 'https://www.apolloresearch.ai/wp-content/uploads/2026/01/image.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'apollo-loss-of-control-playbook',
                title: 'The Loss of Control Playbook: Degrees, Dynamics, and Preparedness',
                excerpt: 'Apollo turns loss of control from an abstract frontier-risk concept into a taxonomy and deployment framework built around context, affordances, permissions, monitoring, and emergency preparedness.',
                author: 'Apollo Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=apolloresearch.ai&sz=128',
                category: 'Trustworthy AI',
                tags: ['Loss of Control', 'AI Governance', 'Threat Modeling', 'Deployment Risk'],
                readTime: '35 min read',
                publishDate: '2025-11-24',
                sourceName: 'Apollo Research',
                url: 'https://www.apolloresearch.ai/research/loss-of-control/',
                coverImage: 'https://www.apolloresearch.ai/wp-content/uploads/2025/11/Chapter-1_Graph_fullscreen_small-borders-1-scaled.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'langchain-building-langgraph-runtime',
                title: 'Building LangGraph: Designing an Agent Runtime from First Principles',
                excerpt: 'LangChain explains why production agents need control and durability, deriving runtime requirements around latency, retries, checkpoints, approvals, streaming, and non-deterministic behavior.',
                author: 'Nuno Campos and LangChain Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=langchain.com&sz=128',
                category: 'AI Agents',
                tags: ['LangGraph', 'Agent Runtime', 'Durable Execution', 'Human-in-the-Loop'],
                readTime: '21 min read',
                publishDate: '2025-09-04',
                sourceName: 'LangChain Blog',
                url: 'https://www.langchain.com/blog/building-langgraph',
                coverImage: 'https://cdn.prod.website-files.com/65c81e88c254bb0f97633a71/69cbaa7ebf847dfe35ef1650_How-We-Built-LangGraph--1-.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'manus-context-engineering-agents',
                title: 'Context Engineering for AI Agents: Lessons from Building Manus',
                excerpt: 'Manus turns agent context into an engineering discipline, covering KV-cache hit rate, stable prompts, tool masking, file-system memory, recitation, error traces, and few-shot brittleness.',
                author: "Yichao 'Peak' Ji",
                authorAvatar: 'https://www.google.com/s2/favicons?domain=manus.im&sz=128',
                category: 'AI Agents',
                tags: ['Context Engineering', 'KV Cache', 'Tool Masking', 'Agent Memory'],
                readTime: '18 min read',
                publishDate: '2025-07-18',
                sourceName: 'Manus Blog',
                url: 'https://manus.im/blog/Context-Engineering-for-AI-Agents-Lessons-from-Building-Manus',
                coverImage: 'https://files.manuscdn.com/assets/dashboard/materials/2025/07/18/eaafe9e6a174b29458c314ccc225dbdd39a7c9d66e60786235165d9aba23f578.webp',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cognition-dont-build-multi-agents',
                title: 'Don&apos;t Build Multi-Agents',
                excerpt: 'Cognition argues that most production agents should share full traces rather than split work into fragile parallel subagents, grounding the recommendation in context continuity and implicit decisions.',
                author: 'Walden Yan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cognition.ai&sz=128',
                category: 'AI Agents',
                tags: ['Context Engineering', 'Multi-Agent Systems', 'Coding Agents', 'Reliability'],
                readTime: '12 min read',
                publishDate: '2025-06-12',
                sourceName: 'Cognition Blog',
                url: 'https://cognition.ai/blog/dont-build-multi-agents',
                coverImage: 'https://cdn.sanity.io/images/2mc9cv2v/production/721e44474051c62156e15b5ffb1a249c996f0607-1404x1228.png?w=1600&fit=max',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'transformer-circuits-circuit-tracing',
                title: 'Circuit Tracing: Revealing Computational Graphs in Language Models',
                excerpt: 'Anthropic&apos;s Transformer Circuits team introduces attribution graphs built from cross-layer transcoders, with visualization, validation, intervention, factual recall, and arithmetic case studies.',
                author: 'Emmanuel Ameisen, Jack Lindsey, Adam Pearce, Wes Gurnee, Nicholas L. Turner, Brian Chen, Craig Citro and Anthropic collaborators',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=transformer-circuits.pub&sz=128',
                category: 'Trustworthy AI',
                tags: ['Circuit Tracing', 'Attribution Graphs', 'Mechanistic Interpretability', 'Transcoders'],
                readTime: '65 min read',
                publishDate: '2025-03-27',
                sourceName: 'Transformer Circuits',
                url: 'https://transformer-circuits.pub/2025/attribution-graphs/methods.html',
                coverImage: 'https://transformer-circuits.pub/2025/attribution-graphs/png/methods.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'vllm-pagedattention-serving',
                title: 'vLLM: Easy, Fast, and Cheap LLM Serving with PagedAttention',
                excerpt: 'The vLLM team explains PagedAttention, mapping KV cache blocks like virtual memory pages to cut fragmentation, enable copy-on-write sharing, and raise LLM serving throughput.',
                author: 'Woosuk Kwon, Zhuohan Li, Siyuan Zhuang, Ying Sheng, Lianmin Zheng, Cody Yu, Joey Gonzalez, Hao Zhang and Ion Stoica',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=vllm.ai&sz=128',
                category: 'Efficient AI',
                tags: ['vLLM', 'PagedAttention', 'KV Cache', 'LLM Serving'],
                readTime: '8 min read',
                publishDate: '2023-06-20',
                sourceName: 'vLLM Blog',
                url: 'https://vllm.ai/blog/2023-06-20-vllm',
                coverImage: 'https://vllm.ai/og?title=vLLM%3A%20Easy%2C%20Fast%2C%20and%20Cheap%20LLM%20Serving%20with%20PagedAttention&authors=Woosuk%20Kwon*%2C%20Zhuohan%20Li*%2C%20Siyuan%20Zhuang%2C%20Ying%20Sheng%2C%20Lianmin%20Zheng%2C%20Cody%20Yu%2C%20Joey%20Gonzalez%2C%20Hao%20Zhang%2C%20and%20Ion%20Stoica%20(*%20Equal%20Contribution)&date=2023-06-20&path=/blog',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hf-rl-environments-guide',
                title: 'The Ultimate Guide to RL Environments: Building and Scaling Them in the LLM Era',
                excerpt: 'Hugging Face decomposes modern RL environment frameworks for LLM training, covering rollout loops, reward wiring, framework anatomy, scale-out tradeoffs, and where environments fit into post-training runs.',
                author: 'Adithya S Kolavi, Lewis Tunstall, Leandro von Werra, Quentin Gallouedec, Amine Dirhoussi, Ben Burtenshaw and Sergio Paniego',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Research Craft',
                tags: ['RL Environments', 'Post-Training', 'RLVR', 'Training Infrastructure'],
                readTime: '50 min read',
                publishDate: '2026-05-05',
                sourceName: 'Hugging Face Space',
                url: 'https://huggingface.co/spaces/AdithyaSK/rl-environments-guide#introduction',
                coverImage: 'https://raw.githubusercontent.com/adithya-s-k/RL_Envs_101/refs/heads/main/assets/blog_thumbnail.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'leap-exemplar-partitioning',
                title: 'An Introduction to Exemplar Partitioning for Mechanistic Interpretability',
                excerpt: 'Jessica Rumbelow introduces Exemplar Partitioning, a one-pass dictionary construction method that uses observed activation exemplars to expose interpretable regions, refusal steering, OOD signals, and cross-checkpoint drift.',
                author: 'Jessica Rumbelow',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=leap-labs.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Mechanistic Interpretability', 'Exemplar Partitioning', 'SAEs', 'Activation Geometry'],
                readTime: '24 min read',
                publishDate: '2026-05-13',
                sourceName: 'LEAP Labs',
                url: 'https://www.leap-labs.com/blog/exemplar-partitioning',
                coverImage: 'https://www.leap-labs.com/_next/image?url=%2Fimages%2Fresearch%2Fexemplar-partitioning-headline.png&w=1920&q=75',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'goodfire-world-inside-neural-networks',
                title: 'The World Inside Neural Networks',
                excerpt: 'Goodfire argues that many learned concepts live on curved manifolds rather than straight-line feature directions, using neural geometry examples to motivate better interpretability and control tools.',
                author: 'Goodfire Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=goodfire.ai&sz=128',
                category: 'Trustworthy AI',
                tags: ['Neural Geometry', 'Interpretability', 'Manifolds', 'Model Control'],
                readTime: '22 min read',
                publishDate: '2026-05-07',
                sourceName: 'Goodfire Research',
                url: 'https://www.goodfire.ai/research/the-world-inside-neural-networks#',
                coverImage: 'https://cdn.prod.website-files.com/67b6603da5471104daf6923a/69fc30812298558007959256_neural-geometry-opengraph.webp',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'openai-accidental-cot-grading',
                title: 'Investigating the Consequences of Accidentally Grading CoT During RL',
                excerpt: 'OpenAI reports accidental chain-of-thought grading incidents, the detection system that found them, ablation evidence on monitorability, and stress tests for when CoT pressure can become dangerous.',
                author: 'Micah Carroll, Tomek Korbak, Zehao Dou, Bowen Baker and Ian Kivlichan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['CoT Grading', 'Monitorability', 'RL Safety', 'Alignment Process'],
                readTime: '24 min read',
                publishDate: '2026-05-07',
                sourceName: 'OpenAI Alignment',
                url: 'https://alignment.openai.com/accidental-cot-grading/',
                coverImage: 'https://alignment.openai.com/accidental-cot-grading/social-preview.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'openai-monitorability-evals-release',
                title: 'Open Sourcing Monitorability Evaluations',
                excerpt: 'OpenAI Alignment releases datasets and reference code for chain-of-thought monitorability, including intervention, process, and outcome-property evals plus a robust cross-fit filtering strategy.',
                author: 'Melody Y. Guan, Miles Wang, Micah Carroll, Zehao Dou, Annie Y. Wei and OpenAI collaborators',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Monitorability Evals', 'Chain of Thought', 'Open Source Safety', 'Scalable Oversight'],
                readTime: '16 min read',
                publishDate: '2026-04-23',
                sourceName: 'OpenAI Alignment',
                url: 'https://alignment.openai.com/monitorability-evals/',
                coverImage: 'https://alignment.openai.com/monitorability-evals/figures/results_intervention.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'lesswrong-review-accidental-cot-grading',
                title: 'A Review of Investigating the Consequences of Accidentally Grading CoT During RL',
                excerpt: 'Buck reviews OpenAI&apos;s accidental CoT grading analysis from an external safety-audit perspective, probing what the public evidence rules out and where residual monitorability risk remains.',
                author: 'Buck',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lesswrong.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['External Review', 'CoT Monitorability', 'AI Safety Audits', 'Frontier Labs'],
                readTime: '10 min read',
                publishDate: '2026-05-07',
                sourceName: 'LessWrong',
                url: 'https://www.lesswrong.com/posts/juCHTdZpZBGooHKW4/a-review-of-investigating-the-consequences-of-accidentally',
                coverImage: 'assets/img/covers/real/lesswrong-review-accidental-cot-grading.png',
                coverAlt: 'Real cover from manual:original-page-screenshot',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-natural-language-autoencoders',
                title: 'Natural Language Autoencoders: Turning Claude&apos;s Thoughts into Text',
                excerpt: 'Anthropic explains NLAs as activation-to-text autoencoders that help researchers inspect hidden model state, catch evaluation awareness, and audit misaligned motivations beyond the model&apos;s spoken chain of thought.',
                author: 'Anthropic Interpretability',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Natural Language Autoencoders', 'Claude', 'Interpretability', 'Model Auditing'],
                readTime: '18 min read',
                publishDate: '2026-05-07',
                sourceName: 'Anthropic',
                url: 'https://www.anthropic.com/research/natural-language-autoencoders',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/645f8c90db35a5d392c816a90c806b2904ccad21-1280x720.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'transformer-circuits-natural-language-autoencoders',
                title: 'Natural Language Autoencoders Produce Unsupervised Explanations of LLM Activations',
                excerpt: 'Anthropic&apos;s Transformer Circuits team trains activation verbalizers and reconstructors so internal residual-stream activations can be translated into natural-language explanations and audited for hidden model state.',
                author: 'Kit Fraser-Taliente, Subhash Kantamneni, Euan Ong and Anthropic collaborators',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=transformer-circuits.pub&sz=128',
                category: 'Trustworthy AI',
                tags: ['Natural Language Autoencoders', 'Interpretability', 'Activation Explanations', 'Claude'],
                readTime: '55 min read',
                publishDate: '2026-05-07',
                sourceName: 'Transformer Circuits',
                url: 'https://transformer-circuits.pub/2026/nla/#introduction',
                coverImage: 'https://transformer-circuits.pub/2026/nla/png/img_648c99de89fe02c7.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'sander-flow-maps',
                title: 'Learning the Integral of a Diffusion Model',
                excerpt: 'Sander Dieleman explains flow maps as direct predictors of diffusion-model integrals, connecting denoising trajectories, few-step sampling, distillation, flow matching, and fast generative modeling.',
                author: 'Sander Dieleman',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sander.ai&sz=128',
                category: 'Visual Generation',
                tags: ['Flow Maps', 'Diffusion Models', 'Sampling', 'Distillation'],
                readTime: '84 min read',
                publishDate: '2026-05-06',
                sourceName: 'Sander Dieleman',
                url: 'https://sander.ai/2026/05/06/flow-maps.html',
                coverImage: 'https://sander.ai/images/map.jpg',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'dylan-faulty-memory-agents',
                title: 'Useful Memories Become Faulty When Continuously Updated by LLMs',
                excerpt: 'Dylan Zhang tests textual memory consolidation loops across agent benchmarks and shows how repeated LLM-written lesson updates can degrade performance, overwrite evidence, and break previously solved tasks.',
                author: 'Dylan Zhang',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=dylanzsz.github.io&sz=128',
                category: 'AI Agents',
                tags: ['Agent Memory', 'Memory Consolidation', 'Self-Improvement', 'Agent Benchmarks'],
                readTime: '18 min read',
                publishDate: '2026-05-06',
                sourceName: 'Dylan Zhang',
                url: 'https://dylanzsz.github.io/faulty-memory/',
                coverImage: 'https://dylanzsz.github.io/faulty-memory/figures/arc_19type_gpt54.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'pythagorai-cost-ai-agents',
                title: 'The Math Behind the Cost of AI Agents',
                excerpt: 'Vasco Schiavo breaks down why agent workloads are cost-amplified by loops, tool calls, long context, retries, and reviewer overhead, giving a practical model for agent unit economics.',
                author: 'Vasco Schiavo',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=pythagorai.substack.com&sz=128',
                category: 'AI Agents',
                tags: ['Agent Economics', 'Token Costs', 'Tool Use', 'AI Products'],
                readTime: '10 min read',
                publishDate: '2026-05-01',
                sourceName: 'PythagorAI',
                url: 'https://pythagorai.substack.com/p/the-math-behind-the-cost-of-ai-agents',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!vmKo!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2fd89125-4efb-4cd2-aa9e-a0eeabe76b79_600x400.jpeg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'tufa-enhancing-reasoning-small-language-models',
                title: 'Enhancing Reasoning in Small Language Models',
                excerpt: 'Tufa Labs surveys small-model reasoning improvements through data, distillation, post-training, and reasoning-oriented objectives, focusing on how compact models can gain stronger multi-step behavior.',
                author: 'Tufa Labs',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=tufalabs.ai&sz=128',
                category: 'LLM & MLLM',
                tags: ['Small Language Models', 'Reasoning', 'Post-Training', 'Distillation'],
                readTime: '14 min read',
                publishDate: '2026-05-01',
                sourceName: 'Tufa Labs',
                url: 'https://tufalabs.ai/research/enhancing-reasoning-small-language-models/',
                coverImage: 'https://tufalabs.ai/assets/posts/enhancing-reasoning-small-language-models/figure-1.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'nrehiew-minimal-editing',
                title: 'Minimal Editing',
                excerpt: 'A compact technical note on editing behavior with the smallest effective intervention, useful for thinking about model editing, coding-agent patches, and avoiding unnecessary change churn.',
                author: 'nrehiew',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=nrehiew.github.io&sz=128',
                category: 'Research Craft',
                tags: ['Minimal Editing', 'Model Editing', 'Research Taste', 'Code Patches'],
                readTime: '8 min read',
                publishDate: '2026-05-01',
                sourceName: 'nrehiew',
                url: 'https://nrehiew.github.io/blog/minimal_editing/',
                coverImage: 'https://nrehiew.github.io/blog/minimal_editing/images/overediting.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-introspection-adapters',
                title: 'Introspection Adapters: Training LLMs to Report Their Learned Behaviors',
                excerpt: 'Anthropic Alignment introduces LoRA-based introspection adapters that elicit natural-language reports of behaviors learned during fine-tuning, including backdoors, sandbagging, and concealed policy changes.',
                author: 'Keshav Shenoy, Li Yang, Abhay Sheshadri, Soren Mindermann, Jack Lindsey, Sam Marks and Rowan Wang',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Introspection Adapters', 'Model Auditing', 'LoRA', 'Backdoors'],
                readTime: '34 min read',
                publishDate: '2026-04-28',
                sourceName: 'Anthropic Alignment',
                url: 'https://alignment.anthropic.com/2026/introspection-adapters/',
                coverImage: 'https://alignment.anthropic.com/2026/introspection-adapters/fig1.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'iclr-mdp-to-gcmdp',
                title: 'Learning to Maximize Rewards via Reaching Goals',
                excerpt: 'An ICLR Blogposts 2026 explainer shows how reward-maximization MDPs can be converted into goal-conditioned MDPs, clarifying links among RL, stochastic shortest path, and goal-reaching formulations.',
                author: 'Chongyi Zheng, Mahsa Bastankhah, Grace Liu and Benjamin Eysenbach',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=iclr-blogposts.github.io&sz=128',
                category: 'AI Agents',
                tags: ['Reinforcement Learning', 'Goal-Conditioned RL', 'MDP', 'RL Theory'],
                readTime: '28 min read',
                publishDate: '2026-04-27',
                sourceName: 'ICLR Blogposts',
                url: 'https://iclr-blogposts.github.io/2026/blog/2026/mdp-to-gcmdp/',
                coverImage: 'https://iclr-blogposts.github.io/2026/assets/img/2026-04-27-mdp-to-gcmdp/rl-ssp-gcrl-480.webp',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'nvidia-emerging-optimizers-megatron',
                title: 'Advancing Emerging Optimizers for Accelerated LLM Training with NVIDIA Megatron',
                excerpt: 'NVIDIA details production-scale support for Muon, MOP, REKLS, layer-wise distributed optimizers, distributed Newton-Schulz modes, and throughput tradeoffs on GB300 systems.',
                author: 'Hao Wu, Dheevatsa Mudigere, Mikail Khona, Sangkug Lym and Dingqing Yang',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=developer.nvidia.com&sz=128',
                category: 'Efficient AI',
                tags: ['Muon', 'Megatron', 'Distributed Optimizers', 'LLM Training'],
                readTime: '9 min read',
                publishDate: '2026-04-22',
                sourceName: 'NVIDIA Technical Blog',
                url: 'https://developer.nvidia.com/blog/advancing-emerging-optimizers-for-accelerated-llm-training-with-nvidia-megatron/',
                coverImage: 'https://developer-blogs.nvidia.com/wp-content/uploads/2024/07/stacked-geometric-shapes-1.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'a16z-continual-learning',
                title: 'Why We Need Continual Learning',
                excerpt: 'a16z frames continual learning as the missing layer beyond context windows and retrieval, surveying memory architectures, parametric updates, agent coherence, and why deployed models need durable learning.',
                author: 'Malika Aubakirova and Matt Bornstein',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=a16z.com&sz=128',
                category: 'Foundation Model',
                tags: ['Continual Learning', 'Memory', 'Long-Running Agents', 'Model Updates'],
                readTime: '22 min read',
                publishDate: '2026-04-22',
                sourceName: 'a16z',
                url: 'https://a16z.com/why-we-need-continual-learning/',
                coverImage: 'https://d1lamhf6l6yk6d.cloudfront.net/uploads/2026/04/Why-we-need-continual-learning-1024x512-1.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'ryan-briggs-research-adjudication',
                title: 'As AI Lowers the Cost of Research, Adjudication and Attention Will Become the Bottlenecks',
                excerpt: 'Ryan Briggs argues that as AI makes empirical research production cheaper, scarce human attention shifts toward judging claims, replication priority, taste, and institutional filtering.',
                author: 'Ryan Briggs',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ryancbriggs.net&sz=128',
                category: 'Research Craft',
                tags: ['AI Research Workflows', 'Research Taste', 'Adjudication', 'Attention'],
                readTime: '12 min read',
                publishDate: '2026-04-21',
                sourceName: 'Ryan C. Briggs',
                url: 'https://ryancbriggs.net/blog/as-ai-lowers-the-cost-of-research-adjudication-and-attention-will-become-the-bottlenecks/',
                coverImage: 'https://ryancbriggs.net/blog/as-ai-lowers-the-cost-of-research-adjudication-and-attention-will-become-the-bottlenecks/hero.jpeg',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'thoughtful-posttrainbench',
                title: 'Introducing PostTrainBench',
                excerpt: 'Thoughtful introduces a benchmark for autonomous AI post-training workflows where agents must gather data, write training code, manage compute, evaluate checkpoints, and avoid reward hacking.',
                author: 'Karina Nguyen',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thoughtfullab.com&sz=128',
                category: 'Research Craft',
                tags: ['Post-Training', 'Agent Benchmarks', 'AI R&D Automation', 'Reward Hacking'],
                readTime: '13 min read',
                publishDate: '2026-03-10',
                sourceName: 'Thoughtful',
                url: 'https://www.thoughtfullab.com/posttrainbench.html',
                coverImage: 'https://www.thoughtfullab.com/assets/images/flow.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'patrick-diffusion-eval-methodology',
                title: 'Generative Frontiers: Why Evaluation Matters for Diffusion Language Models',
                excerpt: 'Patrick Pynadath builds an interactive evaluation methodology for diffusion language models, explaining likelihood limitations, generative perplexity, entropy, KL decomposition, and frontier curves.',
                author: 'Patrick Pynadath',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=patrickpynadath1.github.io&sz=128',
                category: 'Research Craft',
                tags: ['Diffusion Language Models', 'Evaluation', 'Generative Perplexity', 'Frontier Curves'],
                readTime: '18 min read',
                publishDate: '2026-04-03',
                sourceName: 'Patrick Pynadath',
                url: 'https://patrickpynadath1.github.io/blog/eval_methodology/',
                coverImage: 'https://patrickpynadath1.github.io/images/recent_cont_dlm_content/entropy_ranking_demo.gif',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'anyscale-llm-post-training-skill',
                title: 'Introducing the Anyscale LLM Post-Training Skill',
                excerpt: 'Anyscale shows how an agent skill can generate post-training artifacts, size GPU jobs, preflight RLVR runs, catch FSDP/vLLM failures, and automate LoRA merge and deployment handoffs.',
                author: 'Anyscale',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anyscale.com&sz=128',
                category: 'AI Agents',
                tags: ['Post-Training', 'Agent Skills', 'RLVR', 'Ray'],
                readTime: '12 min read',
                publishDate: '2026-05-14',
                sourceName: 'Anyscale Blog',
                url: 'https://www.anyscale.com/blog/anyscale-llm-post-training-skill',
                coverImage: 'https://images.ctfassets.net/xjan103pcp94/1WNlzahEg8Kv35ytWr41ya/8640c4518cfff5954957598d7054221d/anyscale-llm-post-training-skill-og.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'thoughtful-letting-ai-posttrain-ai',
                title: 'What We Learned from Letting AI PostTrain AI',
                excerpt: 'Thoughtful reports what happens when frontier agents autonomously train Qwen3-8B on a verifiable puzzle task, highlighting reward design mistakes, premature stopping, compute underuse, and missing research taste.',
                author: 'Mersad Abbasi',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thoughtfullab.com&sz=128',
                category: 'Research Craft',
                tags: ['AI R&D Automation', 'Post-Training', 'Tinker API', 'Research Taste'],
                readTime: '18 min read',
                publishDate: '2026-04-01',
                sourceName: 'Thoughtful',
                url: 'https://www.thoughtfullab.com/letting-ai-posttrain-ai.html',
                coverImage: 'https://www.thoughtfullab.com/assets/images/article-og-ai-posttrain-ai.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'aiowls-stochastic-self-stabilization',
                title: 'Why Stochastic Gradient Descent Stops Just Short of the Edge',
                excerpt: 'Rice AI-OWLS explains stochastic self-stabilization: how mini-batch noise changes Edge-of-Stability dynamics, suppresses equilibrium sharpness, and yields a measurable batch-size scaling law.',
                author: 'Fangshuo Liao, Afroditi Kolomvaki and Anastasios Kyrillidis',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=akyrillidis.github.io&sz=128',
                category: 'Efficient AI',
                tags: ['SGD', 'Edge of Stability', 'Optimization Theory', 'Sharpness'],
                readTime: '20 min read',
                publishDate: '2026-04-01',
                sourceName: 'AI-OWLS',
                url: 'https://akyrillidis.github.io/aiowls/stochastic_self_stabilization.html',
                coverImage: 'https://akyrillidis.github.io/aiowls/assets/img/seos_fig1_trajectories.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'noah-pedagogical-rl',
                title: 'Pedagogical RL: Teaching Models to Teach Themselves from Privileged Information',
                excerpt: 'Noah Ziems and collaborators propose a spike-aware pedagogy reward and surprisal-gated imitation so models can use privileged answers to sample better reasoning trajectories instead of blindly waiting for lucky rollouts.',
                author: 'Souradip Chakraborty, Noah Ziems, Furong Huang, Meng Jiang, Amrit Singh Bedi and Omar Khattab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=noahziems.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['Pedagogical RL', 'Privileged Information', 'Reasoning', 'On-Policy Distillation'],
                readTime: '20 min read',
                publishDate: '2026-04-01',
                sourceName: 'Noah Ziems',
                url: 'https://noahziems.com/pedagogical-rl',
                coverImage: 'https://hackmd.io/_uploads/rJupvuXyfx.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'deepwiki-mimo-v2-flash',
                title: 'MiMo-V2-Flash: Architecture, Post-Training, and Deployment Notes',
                excerpt: 'DeepWiki&apos;s technical walkthrough of MiMo-V2-Flash covers the sparse MoE design, hybrid attention, long context, MTP speculative decoding, MOPD post-training, and SGLang deployment details.',
                author: 'DeepWiki',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=deepwiki.com&sz=128',
                category: 'Foundation Model',
                tags: ['MiMo-V2-Flash', 'MoE', 'MTP', 'Post-Training'],
                readTime: '24 min read',
                publishDate: '2026-01-06',
                sourceName: 'DeepWiki',
                url: 'https://deepwiki.com/XiaomiMiMo/MiMo-V2-Flash',
                coverImage: 'https://deepwiki.com/XiaomiMiMo/MiMo-V2-Flash/og-image.png?page=1',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'emergentmind-mopd',
                title: 'Multi-Teacher On-Policy Distillation',
                excerpt: 'Emergent Mind summarizes MOPD as a post-training primitive that blends knowledge distillation with RL-guided teacher selection, dynamic guidance, and on-policy reasoning supervision.',
                author: 'Emergent Mind',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=emergentmind.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['MOPD', 'Knowledge Distillation', 'Teacher Selection', 'RLVR'],
                readTime: '16 min read',
                publishDate: '2026-01-13',
                sourceName: 'Emergent Mind',
                url: 'https://api.emergentmind.com/topics/multi-teacher-on-policy-distillation-mopd',
                coverImage: 'https://assets.emergentmind.com/assets/600px-a61320449b8c848bcc56e02826b033b5efa09fa52cc48b487e8f9a2eb8efd705.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'goodfire-optimism-interpretability',
                title: 'On Optimism for Interpretability',
                excerpt: 'Goodfire makes the case for mechanistic interpretability as an engineering discipline, arguing that understanding learned representations is necessary for reliable frontier-model control.',
                author: 'Goodfire',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=goodfire.ai&sz=128',
                category: 'Trustworthy AI',
                tags: ['Interpretability', 'Model Control', 'AI Safety', 'Research Fieldbuilding'],
                readTime: '10 min read',
                publishDate: '2025-07-01',
                sourceName: 'Goodfire Blog',
                url: 'https://www.goodfire.ai/blog/on-optimism-for-interpretability',
                coverImage: 'https://cdn.prod.website-files.com/67b6603da5471104daf6923a/691e4fbeb58a24733d889c6f_Bonsai_(463459335).jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'geeksforgeeks-knowledge-representation-ai',
                title: 'Knowledge Representation in AI',
                excerpt: 'GeeksforGeeks gives a broad reference on symbolic knowledge representation, including logic, semantic networks, frames, rules, ontologies, and probabilistic methods for AI systems.',
                author: 'GeeksforGeeks',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=geeksforgeeks.org&sz=128',
                category: 'Foundation Model',
                tags: ['Knowledge Representation', 'Symbolic AI', 'Semantic Networks', 'Reasoning'],
                readTime: '12 min read',
                publishDate: '2025-07-23',
                sourceName: 'GeeksforGeeks',
                url: 'https://www.geeksforgeeks.org/artificial-intelligence/knowledge-representation-in-ai/',
                coverImage: 'https://media.geeksforgeeks.org/wp-content/uploads/20260306104319974171/kr1.webp',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'openai-parameter-golf',
                title: 'What Parameter Golf Taught Us',
                excerpt: 'OpenAI distills lessons from a constrained ML challenge, covering optimizer tuning, quantization, tokenizers, test-time tricks, and how coding agents changed research iteration.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Research Craft',
                tags: ['Research Craft', 'Coding Agents', 'Optimization', 'Open Challenges'],
                readTime: '12 min read',
                publishDate: '2026-05-12',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/what-parameter-golf-taught-us/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/6PRLQARXtH3sfsTBcHlufc/ac545b82a82009609194d64e34538e62/SEO.png?fit=fill&h=900&w=1600',
                coverAlt: 'Real cover from manual:openai-article-image',
                coverFit: 'cover'
            },
            {
                id: 'openai-cot-monitorability',
                title: 'Evaluating Chain-of-Thought Monitorability',
                excerpt: 'OpenAI introduces evaluations for whether monitors can infer misbehavior from reasoning traces, studying effects from test-time compute, RL scale, and model size.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Chain of Thought', 'Monitorability', 'Alignment', 'Scalable Oversight'],
                readTime: '22 min read',
                publishDate: '2025-12-18',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/evaluating-chain-of-thought-monitorability/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/4x3EyD3VqsjaYK1Q8wOj1W/1d939bee7051a3ccb60abbdcbef156f4/CoT_Monitorability_Art_Card.png?w=1600&h=900&fit=fill',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'modal-host-overhead-inference',
                title: 'Host Overhead Is Killing Your Inference Efficiency',
                excerpt: 'Modal explains how CPU-side synchronization, kernel launch overhead, tensor movement, kernel fusion, and CUDA graphs affect production LLM inference latency and cost.',
                author: 'Charles Frye, Nathan Wang and Timothy Feng',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=modal.com&sz=128',
                category: 'Efficient AI',
                tags: ['Inference', 'CUDA', 'GPU Utilization', 'Serving'],
                readTime: '10 min read',
                publishDate: '2025-11-18',
                sourceName: 'Modal Blog',
                url: 'https://modal.com/blog/host-overhead-inference-efficiency',
                coverImage: 'https://modal.com/docs/social-image.png?title=Host+overhead+is+killing+your+inference+efficiency&socialType=blog',
                coverAlt: 'Modal inference efficiency article cover',
                coverFit: 'cover'
            },
            {
                id: 'deepmind-codemender-security',
                title: 'Introducing CodeMender: An AI Agent for Code Security',
                excerpt: 'Google DeepMind describes a security-focused coding agent that combines program analysis, validation, multi-agent critique, fuzzing, and human review to patch vulnerabilities.',
                author: 'Raluca Ada Popa and Four Flynn',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Trustworthy AI',
                tags: ['Code Security', 'Agents', 'Program Analysis', 'Validation'],
                readTime: '11 min read',
                publishDate: '2025-10-06',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/introducing-codemender-an-ai-agent-for-code-security/',
                coverImage: 'https://lh3.googleusercontent.com/k8UqDSugJHO4Rf-O3s7Hm9jxtuHtK93lQI1KFdoElscGZywC7x5Xuuw_LlzNTvt3fx_Shho1BjokMBVH5ACIt7hmx_y6P4PO0dfvwOlBj7JVAsC_Kg=w1200-h630-n-nu-rw',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'nvidia-ai-red-team-security-advice',
                title: 'Practical LLM Security Advice from the NVIDIA AI Red Team',
                excerpt: 'NVIDIA AI Red Team shares recurring production vulnerabilities in LLM apps, including code execution, RAG access control, indirect prompt injection, and active content exfiltration.',
                author: 'NVIDIA AI Red Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=developer.nvidia.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['AI Red Team', 'Prompt Injection', 'RAG Security', 'LLM Security'],
                readTime: '10 min read',
                publishDate: '2025-10-02',
                sourceName: 'NVIDIA Technical Blog',
                url: 'https://developer.nvidia.com/blog/practical-llm-security-advice-from-the-nvidia-ai-red-team/',
                coverImage: 'https://developer-blogs.nvidia.com/wp-content/uploads/2025/10/Red-Team-LLM-Security-e1759353765401.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-context-engineering-agents',
                title: 'Effective Context Engineering for AI Agents',
                excerpt: 'Anthropic gives a practical framework for agent context management, including token budgets, just-in-time retrieval, compaction, structured notes, and sub-agent handoffs.',
                author: "Anthropic's Applied AI Team",
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['Context Engineering', 'Agents', 'Memory', 'Tool Design'],
                readTime: '18 min read',
                publishDate: '2025-09-29',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/ea2bf01aa874d7ab776453e97dfeed5d2bf5a116-2400x1260.png',
                coverAlt: 'Anthropic context engineering article cover',
                coverFit: 'cover'
            },
            {
                id: 'hf-smollm3-recipe',
                title: 'SmolLM3: Smol, Multilingual, Long-Context Reasoner',
                excerpt: 'Hugging Face publishes a detailed open recipe for a competitive 3B model, covering architecture choices, data mixtures, long-context training, reasoning mid-training, SFT, APO, and model merging.',
                author: 'Hugging Face Science Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Foundation Model',
                tags: ['Small LLMs', 'Training Recipe', 'Long Context', 'Open Models'],
                readTime: '45 min read',
                publishDate: '2025-07-08',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/smollm3',
                coverImage: 'https://huggingface.co/blog/assets/smollm3/image.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-agentic-misalignment',
                title: 'Agentic Misalignment: How LLMs Could Be Insider Threats',
                excerpt: 'Anthropic stress-tests autonomous models in corporate simulations, showing how goal conflicts, replacement threats, tool access, and sensitive information can elicit harmful agent behavior.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Agent Safety', 'Red Teaming', 'Misalignment', 'Insider Threats'],
                readTime: '24 min read',
                publishDate: '2025-06-20',
                sourceName: 'Anthropic Research',
                url: 'https://www.anthropic.com/research/agentic-misalignment',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/e7e28ca7cbe9c943af6e6041ec0f22241024c9d9-2401x1261.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'apollo-in-context-scheming-2025',
                title: 'More Capable Models Are Better at In-Context Scheming',
                excerpt: 'Apollo Research revisits scheming evaluations on newer frontier models and explains where capability, propensity, situational awareness, and benchmark realism blur together.',
                author: 'Apollo Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=apolloresearch.ai&sz=128',
                category: 'Trustworthy AI',
                tags: ['Scheming Evals', 'Alignment', 'Situational Awareness', 'Frontier Models'],
                readTime: '20 min read',
                publishDate: '2025-06-19',
                sourceName: 'Apollo Research',
                url: 'https://www.apolloresearch.ai/science/more-capable-models-are-better-at-in-context-scheming/',
                coverImage: 'https://www.apolloresearch.ai/wp-content/uploads/2025/10/Evals_specific.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'simon-lethal-trifecta-agents',
                title: 'The Lethal Trifecta for AI Agents',
                excerpt: 'Simon Willison gives a crisp security model for agentic prompt injection: private data, untrusted content, and external communication create a practical exfiltration risk.',
                author: 'Simon Willison',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=simonwillison.net&sz=128',
                category: 'Trustworthy AI',
                tags: ['Prompt Injection', 'Agent Security', 'MCP', 'Data Exfiltration'],
                readTime: '9 min read',
                publishDate: '2025-06-16',
                sourceName: 'Simon Willison',
                url: 'https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/',
                coverImage: 'https://static.simonwillison.net/static/2025/lethaltrifecta.jpg',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-multi-agent-research-system',
                title: 'How We Built Our Multi-Agent Research System',
                excerpt: 'Anthropic shares production lessons from a multi-agent research system, including orchestration, sub-agent tasking, prompt iteration, source quality, evals, tracing, and reliability.',
                author: 'Jeremy Hadfield, Barry Zhang, Kenneth Lien, Florian Scholz, Jeremy Fox and Daniel Ford',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['Multi-Agent Systems', 'Research Agents', 'Evals', 'Production Reliability'],
                readTime: '20 min read',
                publishDate: '2025-06-13',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/multi-agent-research-system',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/5cf046fff69b847bfa78c12723dd466b285c0218-2400x1260.png',
                coverAlt: 'Anthropic multi-agent research system cover',
                coverFit: 'cover'
            },
            {
                id: 'humanlayer-12-factor-agents',
                title: '12 Factor Agents',
                excerpt: 'Dex Horthy distills production agent patterns around owning prompts, context windows, control flow, tool calls, state, human contact, and stateless reducers.',
                author: 'Dex Horthy',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=humanlayer.dev&sz=128',
                category: 'AI Agents',
                tags: ['Production Agents', 'Context Engineering', 'Control Flow', 'Agent Architecture'],
                readTime: '32 min read',
                publishDate: '2025-04-03',
                sourceName: 'HumanLayer Blog',
                url: 'https://www.humanlayer.dev/blog/12-factor-agents',
                coverImage: 'https://humanlayer.dev/api/12-factor-agents/og',
                coverAlt: '12 Factor Agents cover',
                coverFit: 'cover'
            },
            {
                id: 'metr-long-task-horizon',
                title: 'Measuring AI Ability to Complete Long Tasks',
                excerpt: 'METR proposes measuring model capability by the human time horizon of tasks agents can complete, showing a rapidly improving trend and why long-horizon robustness matters.',
                author: 'Thomas Kwa, Ben West, Joel Becker and METR contributors',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=metr.org&sz=128',
                category: 'Trustworthy AI',
                tags: ['Capability Evals', 'Long-Horizon Agents', 'Forecasting', 'Risk Assessment'],
                readTime: '18 min read',
                publishDate: '2025-03-19',
                sourceName: 'METR',
                url: 'https://metr.org/blog/2025-03-19-measuring-ai-ability-to-complete-long-tasks/',
                coverImage: 'https://metr.org/assets/images/measuring-ai-ability-to-complete-long-tasks/length-of-tasks-log.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hf-ultrascale-playbook',
                title: 'The Ultra-Scale Playbook: Training LLMs on GPU Clusters',
                excerpt: 'Hugging Face Nanotron turns thousands of scaling experiments into a practical guide to distributed LLM training, covering parallelism, ZeRO, communication overlap, kernels, and cluster tradeoffs.',
                author: 'Hugging Face Nanotron Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Efficient AI',
                tags: ['Distributed Training', 'GPU Clusters', 'Parallelism', 'Kernels'],
                readTime: '90 min read',
                publishDate: '2025-02-21',
                sourceName: 'Hugging Face Space',
                url: 'https://huggingface.co/spaces/nanotron/ultrascale-playbook?section=high-level_overview',
                coverImage: 'https://huggingface.co/spaces/nanotron/ultrascale-playbook/resolve/main/screenshot.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-alignment-faking',
                title: 'Alignment Faking in Large Language Models',
                excerpt: 'Anthropic and Redwood Research show an empirical setup where a model reasons about preserving prior preferences under RL pressure, making safety training evaluation more subtle.',
                author: 'Anthropic and Redwood Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Alignment Faking', 'RLHF', 'Scratchpads', 'Safety Training'],
                readTime: '18 min read',
                publishDate: '2024-12-18',
                sourceName: 'Anthropic Research',
                url: 'https://www.anthropic.com/news/alignment-faking',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/9010435acf6891e5fd2e36268fdacca1c7c1d551-1800x1013.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hf-fineweb-data-curation',
                title: 'FineWeb: Decanting the Web for the Finest Text Data at Scale',
                excerpt: 'Hugging Face documents how FineWeb was built through large-scale web filtering, ablations, educational-quality annotation, deduplication, and downstream model checks.',
                author: 'Hugging Face FineWeb Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Foundation Model',
                tags: ['Pretraining Data', 'Data Curation', 'FineWeb', 'Open Datasets'],
                readTime: '35 min read',
                publishDate: '2024-06-26',
                sourceName: 'Hugging Face Space',
                url: 'https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1',
                coverImage: 'https://huggingface.co/spaces/HuggingFaceFW/blogpost-fineweb-v1/resolve/main/screenshot.jpeg',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'rdi-agent-benchmarks-broken',
                title: 'How We Broke Top AI Agent Benchmarks: And What Comes Next',
                excerpt: 'Berkeley RDI audits major agent benchmarks and shows why benchmark environments must be hardened before scores can reliably guide model and agent decisions.',
                author: 'Hao Wang, Qiuyang Mang, Alvin Cheung, Koushik Sen and Dawn Song',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=rdi.berkeley.edu&sz=128',
                category: 'Trustworthy AI',
                tags: ['Agent Benchmarks', 'Evaluation', 'Benchmark Security', 'Reliability'],
                readTime: '18 min read',
                publishDate: '2026-05-13',
                sourceName: 'Berkeley RDI',
                url: 'https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/',
                coverImage: 'https://rdi.berkeley.edu/blog/trustworthy-benchmarks-cont/figures/benchmark-scorecard.svg',
                coverAlt: 'Benchmark scorecard from Berkeley RDI',
                coverFit: 'cover'
            },
            {
                id: 'interconnects-open-models-mid-2026',
                title: 'My Bets on Open Models, Mid-2026',
                excerpt: 'Nathan Lambert analyzes the open-closed model gap, open model strategy, distillation limits, coding agents, and where the open ecosystem can still compete.',
                author: 'Nathan Lambert',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=interconnects.ai&sz=128',
                category: 'Foundation Model',
                tags: ['Open Models', 'Model Ecosystem', 'Distillation', 'Frontier AI'],
                readTime: '16 min read',
                publishDate: '2026-04-15',
                sourceName: 'Interconnects',
                url: 'https://www.interconnects.ai/p/my-bets-on-open-models-mid-2026',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!qfO!,w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fecb7cb1d-d942-4225-b816-bb0134250e53_3648x3648.jpeg',
                coverAlt: 'Interconnects official publication image',
                coverFit: 'cover'
            },
            {
                id: 'rdi-benchmark-100-percent',
                title: 'We Scored 100% on AI Benchmarks Without Solving a Single Problem',
                excerpt: 'Berkeley RDI demonstrates how fragile benchmark implementations can inflate agent scores and argues for adversarial benchmark auditing as standard practice.',
                author: 'Hao Wang, Qiuyang Mang, Alvin Cheung, Koushik Sen and Dawn Song',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=rdi.berkeley.edu&sz=128',
                category: 'Trustworthy AI',
                tags: ['Agent Benchmarks', 'Evaluation', 'Leaderboard Reliability', 'AI Agents'],
                readTime: '10 min read',
                publishDate: '2026-04-08',
                sourceName: 'Berkeley RDI',
                url: 'https://rdi.berkeley.edu/blog/trustworthy-benchmarks/',
                coverImage: 'https://rdi.berkeley.edu/blog/trustworthy-benchmarks/figures/benchmark-scorecard.svg',
                coverAlt: 'Benchmark scorecard from Berkeley RDI',
                coverFit: 'cover'
            },
            {
                id: 'rdi-opensage-agent-engine',
                title: 'OpenSage: Self-Programming Agent Generation Engine',
                excerpt: 'Berkeley RDI introduces an AI-centric agent framework where models generate sub-agent topologies, tools, and memory structures during task execution.',
                author: 'Berkeley RDI and collaborators',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=rdi.berkeley.edu&sz=128',
                category: 'AI Agents',
                tags: ['Agents', 'Self-Programming', 'Tools', 'Memory'],
                readTime: '7 min read',
                publishDate: '2026-03-23',
                sourceName: 'Berkeley RDI',
                url: 'https://rdi.berkeley.edu/blog/opensage/',
                coverImage: 'https://rdi.berkeley.edu/assets/images/blog/opensage/opensage.png',
                coverAlt: 'OpenSage framework diagram from Berkeley RDI',
                coverFit: 'cover'
            },
            {
                id: 'hamel-evals-skills-coding-agents',
                title: 'Evals Skills for Coding Agents',
                excerpt: 'Hamel Husain explains how coding agents can be taught evaluation workflows, using skills, traces, telemetry, and domain-specific checks to improve AI products.',
                author: 'Hamel Husain',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hamel.dev&sz=128',
                category: 'Research Craft',
                tags: ['Evals', 'Coding Agents', 'Traces', 'AI Products'],
                readTime: '14 min read',
                publishDate: '2026-03-02',
                sourceName: "Hamel's Blog",
                url: 'https://hamel.dev/blog/posts/evals-skills/',
                coverImage: 'https://hamel.dev/blog/posts/evals-skills/cover-gradient.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'interconnects-open-models-next-phase',
                title: 'What Comes Next with Open Models',
                excerpt: 'Interconnects maps the industrialization of open models, market incentives, capability gaps, distillation, and the strategic uncertainty after DeepSeek-R1.',
                author: 'Nathan Lambert',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=interconnects.ai&sz=128',
                category: 'Foundation Model',
                tags: ['Open Models', 'DeepSeek-R1', 'Distillation', 'AI Strategy'],
                readTime: '17 min read',
                publishDate: '2026-03-16',
                sourceName: 'Interconnects',
                url: 'https://www.interconnects.ai/p/the-next-phase-of-open-models/',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!F476!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F07ccf41a-ab0e-4cb6-b24b-234ec18c39a7_3182x1790.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hamel-llm-evals-faq',
                title: 'LLM Evals: Everything You Need to Know',
                excerpt: 'Hamel Husain and Shreya Shankar compile a practical FAQ on product-specific LLM evaluations, traces, judges, RAG evals, human handoffs, and agentic workflows.',
                author: 'Hamel Husain and Shreya Shankar',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hamel.dev&sz=128',
                category: 'Research Craft',
                tags: ['LLM Evals', 'RAG', 'LLM-as-a-Judge', 'Agent Evals'],
                readTime: '45 min read',
                publishDate: '2026-01-15',
                sourceName: "Hamel's Blog",
                url: 'https://hamel.dev/blog/posts/evals-faq/',
                coverImage: 'https://hamel.dev/blog/posts/evals-faq/images/eval_faq.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'interconnects-use-multiple-models',
                title: 'Use Multiple Models',
                excerpt: 'Nathan Lambert argues that serious AI work in 2026 benefits from model plurality, using different frontier and open models for research, coding, and verification.',
                author: 'Nathan Lambert',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=interconnects.ai&sz=128',
                category: 'Research Craft',
                tags: ['Model Selection', 'AI Workflow', 'Research Craft', 'Agents'],
                readTime: '8 min read',
                publishDate: '2026-01-11',
                sourceName: 'Interconnects',
                url: 'https://www.interconnects.ai/p/use-multiple-models',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!-eRA!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff78b23a6-37cf-4e9d-a300-75676b34a14e_2848x1504.jpeg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'interconnects-state-open-models-2025',
                title: 'The State of Open Models',
                excerpt: 'A talk-style survey of the 2025 open model landscape, covering Chinese open labs, Qwen, GPT-OSS, Llama, DeepSeek, and open ecosystem strategy.',
                author: 'Nathan Lambert',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=interconnects.ai&sz=128',
                category: 'Foundation Model',
                tags: ['Open Models', 'Qwen', 'DeepSeek', 'Model Ecosystem'],
                readTime: '25 min read',
                publishDate: '2025-10-16',
                sourceName: 'Interconnects',
                url: 'https://www.interconnects.ai/p/state-of-open-models-2025',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!zWK3!,w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-video.s3.amazonaws.com%2Fvideo_upload%2Fpost%2F176294797%2Fddfbdd15-0454-4e07-bf32-f3ef62a5c585%2Ftranscoded-1760621933.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'rdi-cybergym-agent-security',
                title: 'CyberGym: Evaluating AI Agents Real-World Cybersecurity Capabilities at Scale',
                excerpt: 'Berkeley RDI introduces CyberGym, an execution-based benchmark for measuring how AI agents reproduce real software vulnerabilities under controlled evaluation.',
                author: 'Zhun Wang, Tianneng Shi, Jingxuan He, Matthew Cai, Jialin Zhang and Dawn Song',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=rdi.berkeley.edu&sz=128',
                category: 'Trustworthy AI',
                tags: ['AI Agents', 'Cybersecurity Evaluation', 'Benchmarks', 'Tool Use'],
                readTime: '7 min read',
                publishDate: '2025-10-08',
                sourceName: 'Berkeley RDI',
                url: 'https://rdi.berkeley.edu/blog/cybergym/',
                coverImage: 'https://rdi.berkeley.edu/assets/images/blog/cybergym/overview.svg',
                coverAlt: 'CyberGym overview diagram from Berkeley RDI',
                coverFit: 'cover'
            },
            {
                id: 'stanford-medagentbench',
                title: 'Stanford Develops Real-World Benchmarks for Healthcare AI Agents',
                excerpt: 'Stanford HAI covers MedAgentBench, a virtual EHR environment for testing whether medical LLM agents can retrieve data, order tests, and complete clinical workflows.',
                author: 'Stanford HAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hai.stanford.edu&sz=128',
                category: 'Research Craft',
                tags: ['Healthcare AI', 'Agent Benchmarks', 'EHR', 'Evaluation'],
                readTime: '8 min read',
                publishDate: '2025-09-15',
                sourceName: 'Stanford HAI',
                url: 'https://hai.stanford.edu/news/stanford-develops-real-world-benchmarks-for-healthcare-ai-agents',
                coverImage: 'https://hai.stanford.edu/assets/images/doctor-ehr-ai.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hamel-inspect-ai-evals',
                title: 'Inspect AI, An OSS Python Library For LLM Evals',
                excerpt: 'Hamel Husain annotates JJ Allaire&apos;s Inspect AI lecture, explaining the evaluation framework adopted by major labs and AI safety organizations.',
                author: 'Hamel Husain',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hamel.dev&sz=128',
                category: 'Trustworthy AI',
                tags: ['Inspect AI', 'LLM Evals', 'Open Source', 'AI Safety'],
                readTime: '30 min read',
                publishDate: '2025-06-23',
                sourceName: "Hamel's Blog",
                url: 'https://hamel.dev/notes/llm/evals/inspect.html',
                coverImage: 'https://hamel.dev/notes/llm/evals/inspect_images/inspect_cover.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'interconnects-next-gen-reasoners',
                title: 'A Taxonomy for Next-Generation Reasoning Models',
                excerpt: 'Nathan Lambert organizes where reasoning models may go next, from RLVR and planning to agentic behavior and longer-horizon model capabilities.',
                author: 'Nathan Lambert',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=interconnects.ai&sz=128',
                category: 'LLM & MLLM',
                tags: ['Reasoning Models', 'RLVR', 'Planning', 'Agents'],
                readTime: '13 min read',
                publishDate: '2025-06-04',
                sourceName: 'Interconnects',
                url: 'https://www.interconnects.ai/p/next-gen-reasoners',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!j4ok!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8f440b78-fa48-4001-b93d-4a0770123f08_3455x2114.jpeg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'stanford-simulating-human-behavior',
                title: 'Simulating Human Behavior with AI Agents',
                excerpt: 'Stanford HAI summarizes generative agents built from long-form interviews that reproduce survey and experiment responses for social-science simulation.',
                author: 'Stanford HAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hai.stanford.edu&sz=128',
                category: 'AI Agents',
                tags: ['Generative Agents', 'Simulation', 'Human Behavior', 'Social Science'],
                readTime: '7 min read',
                publishDate: '2025-05-20',
                sourceName: 'Stanford HAI',
                url: 'https://hai.stanford.edu/policy/simulating-human-behavior-with-ai-agents',
                coverImage: 'https://hai.stanford.edu/assets/images/cover_simulating_human_behavior.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'stanford-ai-index-2025',
                title: 'AI Index 2025: State of AI in 10 Charts',
                excerpt: 'Stanford HAI distills the 2025 AI Index into key charts on model performance, inference prices, small-model progress, deployment, regulation, and adoption.',
                author: 'Stanford HAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hai.stanford.edu&sz=128',
                category: 'Foundation Model',
                tags: ['AI Index', 'Model Trends', 'Inference Cost', 'AI Economy'],
                readTime: '10 min read',
                publishDate: '2025-04-07',
                sourceName: 'Stanford HAI',
                url: 'https://hai.stanford.edu/news/ai-index-2025-state-of-ai-in-10-charts',
                coverImage: 'https://hai.stanford.edu/assets/images/ai-index-2025-blog-post-thumb-2.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'stanford-nnetnav-web-agent',
                title: 'An Open-Source AI Agent for Doing Tasks on the Web',
                excerpt: 'Stanford HAI explains NNetNav, a web-navigation agent that learns from exploration and offers a lighter open alternative for browser task automation.',
                author: 'Stanford HAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hai.stanford.edu&sz=128',
                category: 'AI Agents',
                tags: ['Web Agents', 'NNetNav', 'Exploration', 'Browser Automation'],
                readTime: '8 min read',
                publishDate: '2025-03-27',
                sourceName: 'Stanford HAI',
                url: 'https://hai.stanford.edu/news/an-open-source-ai-agent-for-doing-tasks-on-the-web',
                coverImage: 'https://hai.stanford.edu/assets/images/istock-1280398633-color-edited.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'interconnects-rl-renaissance',
                title: 'An Unexpected RL Renaissance',
                excerpt: 'Interconnects argues that reasoning-model RL is a larger shift than early RLHF, forecasting how verifiable tasks and post-training will reshape model capability.',
                author: 'Nathan Lambert',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=interconnects.ai&sz=128',
                category: 'LLM & MLLM',
                tags: ['RL', 'Reasoning Models', 'Post-Training', 'RLHF'],
                readTime: '14 min read',
                publishDate: '2025-02-13',
                sourceName: 'Interconnects',
                url: 'https://www.interconnects.ai/p/an-unexpected-rl-renaissance/',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!hxhf!,w_1200,h_600,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-video.s3.amazonaws.com%2Fvideo_upload%2Fpost%2F156830514%2F01d1abcb-3a2e-4dbd-89b4-f99a8db1bf16%2Ftranscoded-1739224694.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'interconnects-reasoning-generalize',
                title: 'Why Reasoning Models Will Generalize',
                excerpt: 'Nathan Lambert explains why extended reasoning models may generalize beyond code and math, connecting chain-of-thought interfaces with long-horizon model behavior.',
                author: 'Nathan Lambert',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=interconnects.ai&sz=128',
                category: 'LLM & MLLM',
                tags: ['Reasoning Models', 'Generalization', 'Chain of Thought', 'Post-Training'],
                readTime: '12 min read',
                publishDate: '2025-01-28',
                sourceName: 'Interconnects',
                url: 'https://www.interconnects.ai/p/why-reasoning-models-will-generalize',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!9960!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7a17cb48-90d9-4e21-8ec8-4c9141384155_1280x720.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'jay-illustrated-deepseek-r1',
                title: 'The Illustrated DeepSeek-R1',
                excerpt: 'Jay Alammar visually explains the DeepSeek-R1 reasoning recipe, including supervised reasoning data, reinforcement learning, distillation, and open model implications.',
                author: 'Jay Alammar',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=languagemodels.co&sz=128',
                category: 'LLM & MLLM',
                tags: ['DeepSeek-R1', 'Reasoning', 'RL', 'Visual Explainer'],
                readTime: '24 min read',
                publishDate: '2025-01-27',
                sourceName: 'Language Models & Co.',
                url: 'https://newsletter.languagemodels.co/p/the-illustrated-deepseek-r1',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!fn53!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F623a9dbf-c76e-438c-ba69-43ae9613ebbe_2930x1496.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hamel-llm-judge-guide',
                title: 'Using LLM-as-a-Judge For Evaluation: A Complete Guide',
                excerpt: 'Hamel Husain gives a field-tested guide to building LLM judges, focusing on binary criteria, domain experts, critiques, error analysis, and calibration.',
                author: 'Hamel Husain',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hamel.dev&sz=128',
                category: 'Research Craft',
                tags: ['LLM-as-a-Judge', 'Evals', 'Error Analysis', 'AI Products'],
                readTime: '35 min read',
                publishDate: '2024-10-29',
                sourceName: "Hamel's Blog",
                url: 'https://hamel.dev/blog/posts/llm-judge/',
                coverImage: 'https://hamel.dev/blog/posts/llm-judge/images/cover_img.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'hamel-ai-product-needs-evals',
                title: 'Your AI Product Needs Evals',
                excerpt: 'Hamel Husain explains how to build domain-specific LLM evaluation systems with unit tests, human review, model judges, traces, RAG checks, and A/B testing.',
                author: 'Hamel Husain',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=hamel.dev&sz=128',
                category: 'Research Craft',
                tags: ['LLM Evals', 'AI Products', 'RAG', 'Evaluation Systems'],
                readTime: '30 min read',
                publishDate: '2024-03-29',
                sourceName: "Hamel's Blog",
                url: 'https://hamel.dev/blog/posts/evals/index.html',
                coverImage: 'https://hamel.dev/blog/posts/evals/images/diagram-cover.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'mlm-agentic-programming-roadmap',
                title: 'Agentic Programming: A Roadmap',
                excerpt: 'Machine Learning Mastery lays out a practical roadmap for building production-grade agents, covering loops, memory, tools, frameworks, and deployment skills.',
                author: 'Shittu Olumide',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=machinelearningmastery.com&sz=128',
                category: 'AI Agents',
                tags: ['Agentic AI', 'Learning Roadmap', 'Tools', 'Production AI'],
                readTime: '18 min read',
                publishDate: '2026-05-21',
                sourceName: 'Machine Learning Mastery',
                url: 'https://machinelearningmastery.com/agentic-programming-a-roadmap/',
                coverImage: 'https://machinelearningmastery.com/wp-content/uploads/2026/05/Shittu-MLM-Agentic-Programming-A-Roadmap.png',
                coverAlt: 'Agentic programming roadmap cover from Machine Learning Mastery',
                coverFit: 'cover'
            },
            {
                id: 'cmu-vlm-speak-cinema',
                title: 'Teaching Vision-Language Models to Speak Cinema',
                excerpt: 'CMU researchers describe a human-AI video caption pipeline with professional creators, showing how better supervision can teach VLMs cinematic language.',
                author: 'Zhiqiu Lin and Chancharik Mitra',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cmu.edu&sz=128',
                category: 'Multimodal Model',
                tags: ['VLM', 'Video Captioning', 'Human-AI Oversight', 'Data Quality'],
                readTime: '18 min read',
                publishDate: '2026-05-13',
                sourceName: 'ML@CMU Blog',
                url: 'https://blog.ml.cmu.edu/2026/05/13/teaching-vision-language-models-to-speak-cinema/',
                coverImage: 'https://i0.wp.com/blog.ml.cmu.edu/wp-content/uploads/2026/04/teaser_draft-1024x417.png',
                coverAlt: 'Cinematic video captioning teaser from ML@CMU',
                coverFit: 'cover'
            },
            {
                id: 'mlm-agentic-design-patterns',
                title: 'Choosing the Right Agentic Design Pattern',
                excerpt: 'A decision-tree guide for choosing between ReAct, planning, reflection, and multi-agent systems based on task structure, tools, latency, and specialization.',
                author: 'Bala Priya C',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=machinelearningmastery.com&sz=128',
                category: 'AI Agents',
                tags: ['Agent Design', 'ReAct', 'Planning', 'Multi-Agent'],
                readTime: '13 min read',
                publishDate: '2026-05-15',
                sourceName: 'Machine Learning Mastery',
                url: 'https://machinelearningmastery.com/choosing-the-right-agentic-design-pattern-a-decision-tree-approach/',
                coverImage: 'https://machinelearningmastery.com/wp-content/uploads/2026/05/mlm-choose-agentic-dp.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'mlm-llm-observability-tools',
                title: 'LLM Observability Tools for Reliable AI Applications',
                excerpt: 'A practitioner survey of LLM observability tools for tracing, evaluation, prompt management, token costs, production debugging, and regression monitoring.',
                author: 'Bala Priya C',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=machinelearningmastery.com&sz=128',
                category: 'Research Craft',
                tags: ['LLM Observability', 'Evals', 'Tracing', 'Production AI'],
                readTime: '12 min read',
                publishDate: '2026-05-12',
                sourceName: 'Machine Learning Mastery',
                url: 'https://machinelearningmastery.com/llm-observability-tools-for-reliable-ai-applications/',
                coverImage: 'https://machinelearningmastery.com/wp-content/uploads/2026/05/mlm-bala-llm-observability-tools.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'mlm-prompt-compression-agentic-costs',
                title: 'Implementing Prompt Compression to Reduce Agentic Loop Costs',
                excerpt: 'A practical walkthrough of prompt compression for agent loops, including recursive summarization, instruction distillation, token accounting, and cost control.',
                author: 'Ivan Palomares Carrascosa',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=machinelearningmastery.com&sz=128',
                category: 'Efficient AI',
                tags: ['Prompt Compression', 'Agentic Loops', 'Cost Reduction', 'LLM Systems'],
                readTime: '11 min read',
                publishDate: '2026-05-11',
                sourceName: 'Machine Learning Mastery',
                url: 'https://machinelearningmastery.com/implementing-prompt-compression-to-reduce-agentic-loop-costs/',
                coverImage: 'https://machinelearningmastery.com/wp-content/uploads/2026/03/mlm-implementing-prompt-compression-to-reduce-agentic-loop-costs.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-coding-agent-components',
                title: 'Components of A Coding Agent',
                excerpt: 'Sebastian Raschka explains how coding agents combine tool use, memory, repository context, action loops, and harness design to make LLMs useful in practice.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'AI Agents',
                tags: ['Coding Agents', 'Tool Use', 'Memory', 'Agent Harness'],
                readTime: '18 min read',
                publishDate: '2026-04-04',
                sourceName: 'Ahead of AI',
                url: 'https://magazine.sebastianraschka.com/p/components-of-a-coding-agent',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!_g0S!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F49b97718-57f4-4977-99c8-8ad5c4d32af3_1548x862.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-visual-attention-variants',
                title: 'A Visual Guide to Attention Variants in Modern LLMs',
                excerpt: 'A visual tour of MHA, GQA, MLA, sparse attention, and hybrid attention variants, with an emphasis on KV-cache efficiency and modern architecture choices.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'Efficient AI',
                tags: ['Attention', 'GQA', 'MLA', 'KV Cache'],
                readTime: '30 min read',
                publishDate: '2026-03-22',
                sourceName: 'Ahead of AI',
                url: 'https://magazine.sebastianraschka.com/p/visual-attention-variants',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!8IKa!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F51d52b9a-e820-45d6-8135-f94496ec1745_1600x900.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cmu-ai-step-aside',
                title: 'When Should AI Step Aside?: Teaching Agents When Humans Want to Intervene',
                excerpt: 'CMU studies when agents should hand control back to humans, framing intervention prediction as a key reliability problem for human-AI collaboration.',
                author: 'CMU ML Blog',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cmu.edu&sz=128',
                category: 'AI Agents',
                tags: ['Human-AI Collaboration', 'Agents', 'Intervention', 'Reliability'],
                readTime: '15 min read',
                publishDate: '2026-04-13',
                sourceName: 'ML@CMU Blog',
                url: 'https://blog.ml.cmu.edu/2026/04/13/when-should-ai-step-aside-teaching-agents-when-humans-want-to-intervene/',
                coverImage: 'https://i0.wp.com/blog.ml.cmu.edu/wp-content/uploads/2026/04/image-1-1024x291.png',
                coverAlt: 'AI intervention diagram from ML@CMU',
                coverFit: 'cover'
            },
            {
                id: 'cmu-lumberchunker',
                title: 'LumberChunker: Long-Form Narrative Document Segmentation',
                excerpt: 'CMU presents an LLM-guided semantic chunking method for long narrative documents, improving retrieval and downstream QA over fixed or paragraph-based splits.',
                author: 'Raymond Jiang and Andre Duarte',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cmu.edu&sz=128',
                category: 'LLM & MLLM',
                tags: ['RAG', 'Chunking', 'Long Context', 'Document QA'],
                readTime: '16 min read',
                publishDate: '2026-03-17',
                sourceName: 'ML@CMU Blog',
                url: 'https://blog.ml.cmu.edu/2026/03/17/lumberchunker-long-form-narrative-document-segmentation/',
                coverImage: 'https://i0.wp.com/blog.ml.cmu.edu/wp-content/uploads/2026/02/LumberChunker_pipeline-1024x406.png',
                coverAlt: 'LumberChunker pipeline diagram from ML@CMU',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-inference-time-scaling-categories',
                title: 'Categories of Inference-Time Scaling for Improved LLM Reasoning',
                excerpt: 'Sebastian Raschka organizes inference-time scaling methods for reasoning models, clarifying search, sampling, verification, and compute allocation patterns.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['Inference-Time Scaling', 'Reasoning', 'Search', 'Verification'],
                readTime: '20 min read',
                publishDate: '2026-01-24',
                sourceName: 'Ahead of AI',
                url: 'https://magazine.sebastianraschka.com/p/categories-of-inference-time-scaling',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!EHqU!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1f97789d-b769-45fe-b884-ba0f7941da9e_1846x1230.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-state-llms-2025',
                title: 'The State Of LLMs 2025: Progress, Problems, and Predictions',
                excerpt: 'Sebastian Raschka reviews the 2025 LLM landscape across reasoning, agents, architecture, open-weight models, evaluation, deployment, and likely next steps.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['LLM', 'Year in Review', 'Reasoning', 'Open Models'],
                readTime: '28 min read',
                publishDate: '2025-12-30',
                sourceName: 'Sebastian Raschka',
                url: 'https://sebastianraschka.com/blog/2025/state-of-llms-2025.html',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!RdO6!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fdfad3fc4-b195-4e7e-a6a7-7701b59ed57b_1394x918.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'spaces-deltanet-l2-normalize',
                title: '为什么DeltaNet要加L2 Normalize？',
                excerpt: '苏剑林从连续时间动力学和线性注意力角度解释 DeltaNet 对 Q/K 做 L2 Normalize 的原因，连接稳定性、特征值和后续线性注意力工作。',
                author: '苏剑林',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=spaces.ac.cn&sz=128',
                category: 'Efficient AI',
                tags: ['DeltaNet', 'Linear Attention', 'L2 Normalize', 'Efficient AI'],
                readTime: '18 min read',
                publishDate: '2025-12-23',
                sourceName: '科学空间',
                url: 'https://www.spaces.ac.cn/archives/11486',
                coverImage: 'https://www.spaces.ac.cn/usr/themes/geekg/images/avatar.png',
                coverAlt: '科学空间 official site image',
                coverFit: 'cover'
            },
            {
                id: 'cmu-llm-judge-rating-indeterminacy',
                title: 'Validating LLM-as-a-Judge Systems under Rating Indeterminacy',
                excerpt: 'CMU explains why subjective rating tasks may have multiple valid labels and how forced-choice data can improve LLM-judge validation.',
                author: 'CMU ML Blog',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cmu.edu&sz=128',
                category: 'Research Craft',
                tags: ['LLM-as-a-Judge', 'Evaluation', 'Rating Indeterminacy', 'AI Safety'],
                readTime: '16 min read',
                publishDate: '2025-12-09',
                sourceName: 'ML@CMU Blog',
                url: 'https://blog.ml.cmu.edu/2025/12/09/validating-llm-as-a-judge-systems-under-rating-indeterminacy/',
                coverImage: 'https://i0.wp.com/blog.ml.cmu.edu/wp-content/uploads/2025/11/indeterminacy_examples-1.png',
                coverAlt: 'Rating indeterminacy examples from ML@CMU',
                coverFit: 'cover'
            },
            {
                id: 'spaces-weight-decay-learning-rate',
                title: '滑动平均视角下的权重衰减和学习率',
                excerpt: '科学空间从滑动平均视角分析 weight decay 与 learning rate schedule，讨论预训练中的数据记忆、动态权重和优化器行为。',
                author: '苏剑林',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=spaces.ac.cn&sz=128',
                category: 'Efficient AI',
                tags: ['Weight Decay', 'Learning Rate', 'Optimization', 'Pretraining'],
                readTime: '22 min read',
                publishDate: '2025-12-05',
                sourceName: '科学空间',
                url: 'https://www.spaces.ac.cn/archives/11459',
                coverImage: 'https://www.spaces.ac.cn/usr/uploads/2025/12/3004047860.png',
                coverAlt: 'Weight decay and learning rate figure from 科学空间',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-deepseek-v32-architecture',
                title: 'From DeepSeek V3 to V3.2: Architecture, Sparse Attention, and RL Updates',
                excerpt: 'A technical review of DeepSeek V3.2 updates, including architecture changes, sparse attention, reinforcement learning refinements, and open-weight model implications.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'Foundation Model',
                tags: ['DeepSeek', 'Sparse Attention', 'RL', 'Open Models'],
                readTime: '24 min read',
                publishDate: '2025-12-03',
                sourceName: 'Sebastian Raschka',
                url: 'https://sebastianraschka.com/blog/2025/technical-deepseek.html',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!C3LV!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F0c867bba-a952-4285-849e-e70a5555622c_1990x1576.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cmu-llm-rl-hard-problems',
                title: 'How to Explore to Scale RL Training of LLMs on Hard Problems?',
                excerpt: 'CMU frames LLM RL exploration into sharpening, chaining, and guided regimes, explaining why hard problems need data-guided exploration rather than naive sampling.',
                author: 'Amrith Setlur',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cmu.edu&sz=128',
                category: 'LLM & MLLM',
                tags: ['LLM RL', 'Reasoning', 'Exploration', 'Post-Training'],
                readTime: '17 min read',
                publishDate: '2025-11-26',
                sourceName: 'ML@CMU Blog',
                url: 'https://blog.ml.cmu.edu/2025/11/26/how-to-explore-to-scale-rl-training-of-llms-on-hard-problems/',
                coverImage: 'https://i0.wp.com/blog.ml.cmu.edu/wp-content/uploads/2025/11/image-7-1024x288.png',
                coverAlt: 'LLM RL exploration regimes from ML@CMU',
                coverFit: 'cover'
            },
            {
                id: 'spaces-diffusion-predict-data',
                title: '生成扩散模型漫谈（三十一）：预测数据而非噪声',
                excerpt: '科学空间解读 JiT 与像素空间扩散模型，解释为什么预测数据而非噪声可能缓解高分辨率生成里的低秩瓶颈。',
                author: '苏剑林',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=spaces.ac.cn&sz=128',
                category: 'Visual Generation',
                tags: ['Diffusion Models', 'JiT', 'Pixel-Space Generation', 'Manifold'],
                readTime: '20 min read',
                publishDate: '2025-11-24',
                sourceName: '科学空间',
                url: 'https://www.spaces.ac.cn/archives/11428',
                coverImage: 'https://www.spaces.ac.cn/usr/uploads/2025/11/1310674568.png',
                coverAlt: 'Diffusion model figure from 科学空间',
                coverFit: 'cover'
            },
            {
                id: 'spaces-muon-guide',
                title: 'Muon优化器指南：快速上手与关键细节',
                excerpt: '科学空间整理 Muon 优化器的核心操作、关键实现细节、适用范围和调参注意事项，补齐中文高质量优化器材料。',
                author: '苏剑林',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=spaces.ac.cn&sz=128',
                category: 'Efficient AI',
                tags: ['Muon', 'Optimizer', 'Training Efficiency', 'Newton-Schulz'],
                readTime: '24 min read',
                publishDate: '2025-11-19',
                sourceName: '科学空间',
                url: 'https://www.spaces.ac.cn/archives/11416',
                coverImage: 'https://www.spaces.ac.cn/usr/themes/geekg/images/avatar.png',
                coverAlt: '科学空间 official site image',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-llm-evaluation-4-approaches',
                title: 'Understanding the 4 Main Approaches to LLM Evaluation',
                excerpt: 'Sebastian Raschka compares multiple-choice tests, exact-match tasks, LLM judges, and human evaluation, with from-scratch framing for practical model assessment.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'Research Craft',
                tags: ['LLM Evaluation', 'Benchmarks', 'LLM-as-a-Judge', 'Human Evals'],
                readTime: '23 min read',
                publishDate: '2025-10-05',
                sourceName: 'Ahead of AI',
                url: 'https://magazine.sebastianraschka.com/p/llm-evaluation-4-approaches',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!c7Za!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F1748fa24-e946-47fb-bf1b-e488d08547fd_1764x1244.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cmu-verlog-multiturn-rl-agents',
                title: 'Verlog: A Multi-turn RL Framework for LLM Agents',
                excerpt: 'CMU introduces Verlog, a reinforcement-learning framework for long-horizon LLM-agent tasks with highly variable episode lengths and stable multi-turn training.',
                author: 'Wen-Tse Chen',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cmu.edu&sz=128',
                category: 'AI Agents',
                tags: ['LLM Agents', 'Multi-Turn RL', 'Long-Horizon Tasks', 'Agent Training'],
                readTime: '16 min read',
                publishDate: '2025-09-15',
                sourceName: 'ML@CMU Blog',
                url: 'https://blog.ml.cmu.edu/2025/09/15/verlog-a-multi-turn-rl-framework-for-llm-agents/',
                coverImage: 'https://i0.wp.com/blog.ml.cmu.edu/wp-content/uploads/2025/09/teaser-1.gif',
                coverAlt: 'Verlog multi-turn RL teaser from ML@CMU',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-big-llm-architecture-comparison',
                title: 'The Big LLM Architecture Comparison',
                excerpt: 'A living architecture guide comparing DeepSeek, OLMo, Gemma, Llama, Qwen, Kimi, GLM, Mistral, and other modern LLM design choices.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'Foundation Model',
                tags: ['LLM Architecture', 'MoE', 'MLA', 'Open Models'],
                readTime: '45 min read',
                publishDate: '2025-07-19',
                sourceName: 'Sebastian Raschka',
                url: 'https://magazine.sebastianraschka.com/p/the-big-llm-architecture-comparison',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!LmVE!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F45c50202-0e8b-4e64-8296-4e2ccf4cb287_1756x1227.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'xunhuang-video-world-models',
                title: 'Towards Video World Models',
                excerpt: 'Xun Huang clarifies what video world models need beyond current video generators: causality, interactivity, persistence, real-time response, and physical accuracy.',
                author: 'Xun Huang',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=xunhuang.me&sz=128',
                category: 'World Model',
                tags: ['Video World Models', 'Causality', 'Interactivity', 'Simulation'],
                readTime: '28 min read',
                publishDate: '2025-07-11',
                sourceName: 'Xun Huang',
                url: 'https://www.xunhuang.me/blogs/world_model.html',
                coverImage: 'https://www.xunhuang.me/imgs/blog/pyramid.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-kv-cache-from-scratch',
                title: 'Understanding and Coding the KV Cache in LLMs from Scratch',
                excerpt: 'Sebastian Raschka explains KV cache mechanics with from-scratch code, showing how caching past key-value states speeds up autoregressive LLM inference.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=sebastianraschka.com&sz=128',
                category: 'Efficient AI',
                tags: ['KV Cache', 'LLM Inference', 'Attention', 'From Scratch'],
                readTime: '26 min read',
                publishDate: '2025-06-17',
                sourceName: 'Sebastian Raschka',
                url: 'https://sebastianraschka.com/blog/2025/coding-the-kv-cache-in-llms.html',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!PjfC!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F78382a83-f634-4cfa-92b9-bbea30c61a60_841x926.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cmu-test-time-compute-meta-rl',
                title: 'Optimizing LLM Test-Time Compute Involves Solving a Meta-RL Problem',
                excerpt: 'CMU frames test-time compute allocation for reasoning LLMs as a meta-RL problem, connecting search, verifier feedback, and adaptive compute budgets.',
                author: 'CMU ML Blog',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cmu.edu&sz=128',
                category: 'LLM & MLLM',
                tags: ['Test-Time Compute', 'Meta-RL', 'Reasoning', 'Search'],
                readTime: '17 min read',
                publishDate: '2025-01-08',
                sourceName: 'ML@CMU Blog',
                url: 'https://blog.ml.cmu.edu/2025/01/08/optimizing-llm-test-time-compute-involves-solving-a-meta-rl-problem/',
                coverImage: 'https://i0.wp.com/blog.ml.cmu.edu/wp-content/uploads/2025/01/image-1024x303.png',
                coverAlt: 'Test-time compute meta-RL figure from ML@CMU',
                coverFit: 'cover'
            },
            {
                id: 'lilian-extrinsic-hallucinations',
                title: 'Extrinsic Hallucinations in LLMs',
                excerpt: 'Lilian Weng surveys extrinsic hallucination causes, detection, mitigation, retrieval grounding, factuality metrics, and why evaluation remains difficult.',
                author: 'Lilian Weng',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
                category: 'Trustworthy AI',
                tags: ['Hallucinations', 'Factuality', 'RAG', 'Evaluation'],
                readTime: '32 min read',
                publishDate: '2024-07-07',
                sourceName: "Lil'Log",
                url: 'https://lilianweng.github.io/posts/2024-07-07-hallucination/',
                coverImage: 'https://lilianweng.github.io/posts/2024-07-07-hallucination/knowledge-categorization.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'lilian-diffusion-video-generation',
                title: 'Diffusion Models for Video Generation',
                excerpt: 'Lilian Weng explains video diffusion model design, temporal consistency, latent video generation, conditioning, training objectives, and evaluation challenges.',
                author: 'Lilian Weng',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
                category: 'Visual Generation',
                tags: ['Video Diffusion', 'Text-to-Video', 'Temporal Consistency', 'Generative AI'],
                readTime: '34 min read',
                publishDate: '2024-04-12',
                sourceName: "Lil'Log",
                url: 'https://lilianweng.github.io/posts/2024-04-12-diffusion-video/',
                coverImage: 'https://lilianweng.github.io/posts/2024-04-12-diffusion-video/v-param.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'lilian-human-data-quality',
                title: 'Thinking about High-Quality Human Data',
                excerpt: 'Lilian Weng discusses what makes human feedback and demonstration data high quality, including task design, annotator behavior, preference data, and data filtering.',
                author: 'Lilian Weng',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
                category: 'Research Craft',
                tags: ['Human Data', 'RLHF', 'Data Quality', 'Post-Training'],
                readTime: '30 min read',
                publishDate: '2024-02-05',
                sourceName: "Lil'Log",
                url: 'https://lilianweng.github.io/posts/2024-02-05-human-data-quality/',
                coverImage: 'https://lilianweng.github.io/posts/2024-02-05-human-data-quality/overview.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'thinking-machines-interaction-models',
                title: 'Interaction Models: A Scalable Approach to Human-AI Collaboration',
                excerpt: 'Thinking Machines Lab introduces interaction models trained for real-time multimodal collaboration, micro-turn streaming, interruption, visual context, and background reasoning.',
                author: 'Thinking Machines Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thinkingmachines.ai&sz=128',
                category: 'AI Agents',
                tags: ['Interaction Models', 'Realtime AI', 'Multimodal', 'Human-AI Collaboration'],
                readTime: '24 min read',
                publishDate: '2026-05-11',
                sourceName: 'Thinking Machines Lab',
                url: 'https://thinkingmachines.ai/blog/interaction-models/',
                coverImage: 'https://thinkingmachines.ai/blog/interaction-models/hero-cover.jpg',
                coverAlt: 'Real cover from image',
                coverFit: 'cover'
            },
            {
                id: 'dao-sonicmoe-blackwell',
                title: 'SonicMoE: A Hardware-Efficient Blueprint for Fine-Grained MoEs',
                excerpt: 'Dao AI Lab details SonicMoE, an IO-aware algorithm and kernel stack for training fine-grained mixture-of-experts models efficiently on Hopper and Blackwell GPUs.',
                author: 'Dao AI Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=dao-lab.ai&sz=128',
                category: 'Efficient AI',
                tags: ['MoE', 'Blackwell', 'Training Kernels', 'Efficient AI'],
                readTime: '22 min read',
                publishDate: '2026-04-22',
                sourceName: 'Dao AI Lab',
                url: 'https://dao-lab.ai/blog/2026/sonicmoe-blackwell/',
                coverImage: 'https://raw.githubusercontent.com/Dao-AILab/sonic-moe/main/assets/media/blogpost_teasor.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'dao-gram-newton-schulz',
                title: 'Gram Newton-Schulz: A Fast Hardware-Aware Algorithm for Muon',
                excerpt: 'Tri Dao and collaborators show how Gram Newton-Schulz speeds up Muon orthogonalization with symmetric GEMM kernels while preserving training quality.',
                author: 'Dao AI Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=dao-lab.ai&sz=128',
                category: 'Efficient AI',
                tags: ['Muon', 'Newton-Schulz', 'Optimizer', 'GPU Kernels'],
                readTime: '28 min read',
                publishDate: '2026-03-30',
                sourceName: 'Dao AI Lab',
                url: 'https://dao-lab.ai/blog/2026/gram-newton-schulz/',
                coverImage: 'https://hackmd.io/_uploads/ByJX-6BsWg.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'dao-mamba3-methods',
                title: 'Mamba-3 Part 2: Methodological Deep Dive',
                excerpt: 'Dao AI Lab explains the state-space modeling ideas behind Mamba-3, including upgraded discretization, complex-valued SSMs, and multi-input multi-output recurrence design.',
                author: 'Dao AI Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=dao-lab.ai&sz=128',
                category: 'Efficient AI',
                tags: ['Mamba-3', 'State Space Models', 'Sequence Models', 'Inference Efficiency'],
                readTime: '24 min read',
                publishDate: '2026-03-16',
                sourceName: 'Dao AI Lab',
                url: 'https://dao-lab.ai/blog/2026/mamba3-part2/',
                coverImage: 'https://dao-lab.ai/assets/img/2026-03-16-mamba-3/discretization-table-480.webp',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'dao-flashattention-4',
                title: 'FlashAttention-4: Algorithm and Kernel Pipelining Co-Design',
                excerpt: 'Dao AI Lab presents FlashAttention-4 for Blackwell GPUs, co-designing attention algorithms and kernels around softmax, shared memory, scheduling, and deterministic execution.',
                author: 'Dao AI Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=dao-lab.ai&sz=128',
                category: 'Efficient AI',
                tags: ['FlashAttention-4', 'Blackwell', 'Attention Kernels', 'Inference'],
                readTime: '20 min read',
                publishDate: '2026-03-05',
                sourceName: 'Dao AI Lab',
                url: 'https://dao-lab.ai/blog/2026/flash4/',
                coverImage: 'https://dao-lab.ai/assets/img/2026-03-05-flash4/h100_vs_b200-480.webp',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'simon-5-minute-llms-2026',
                title: 'The last six months in LLMs, in five minutes',
                excerpt: 'Simon Willison compresses the fast-moving 2026 LLM landscape into a practitioner-friendly briefing on reasoning, tools, agents, and model behavior.',
                author: 'Simon Willison',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=simonwillison.net&sz=128',
                category: 'LLM & MLLM',
                tags: ['LLM', 'Reasoning Models', 'Agents', 'Independent Researcher'],
                readTime: '7 min read',
                publishDate: '2026-05-19',
                sourceName: 'Simon Willison',
                url: 'https://simonwillison.net/2026/May/19/5-minute-llms/',
                coverImage: 'https://static.simonwillison.net/static/2026/5-minutes-llms/5-minutes-llms.001.jpeg',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'claude-opus-47',
                title: 'Introducing Claude Opus 4.7',
                excerpt: 'Anthropic introduces a new frontier Claude model with stronger long-horizon coding, reasoning, agentic tool use, and reliability for complex professional work.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Foundation Model',
                tags: ['Claude Opus 4.7', 'Frontier Model', 'Reasoning', 'Coding'],
                readTime: '8 min read',
                publishDate: '2026-04-16',
                sourceName: 'Anthropic',
                url: 'https://www.anthropic.com/news/claude-opus-4-7',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/96ea2509a90e527642c822303e56296a07bcfce4-1920x1080.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'decoupled-diloco',
                title: 'Decoupled DiLoCo: Scaling Distributed Training',
                excerpt: 'Google DeepMind explains Decoupled DiLoCo, a distributed training method that separates local compute from global synchronization to scale large model training more efficiently.',
                author: 'Google DeepMind',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Efficient AI',
                tags: ['Distributed Training', 'Optimization', 'Scaling', 'Efficient AI'],
                readTime: '12 min read',
                publishDate: '2026-04-23',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/discover/blog/decoupled-diloco-scaling-distributed-training-of-large-language-models/',
                coverImage: 'https://storage.googleapis.com/gdm-deepmind-com-prod-public/media/original_images/nav__dm__gemini__large.svg',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'hf-state-open-source-ai-spring-2026',
                title: 'State of Open Source AI: Spring 2026',
                excerpt: 'Hugging Face surveys the open-source AI ecosystem across model releases, infrastructure, datasets, agents, and community adoption patterns.',
                author: 'Hugging Face',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Foundation Model',
                tags: ['Open Source AI', 'Foundation Models', 'Ecosystem', 'Community'],
                readTime: '11 min read',
                publishDate: '2026-03-17',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/state-of-open-source-ai-spring-2026',
                coverImage: 'https://huggingface.co/front/thumbnails/v2-2.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'simon-year-in-llms-2025',
                title: '2025: The year in LLMs',
                excerpt: 'A high-signal independent review of the biggest shifts in LLMs during 2025, from reasoning models and tool use to open weights, pricing, and product patterns.',
                author: 'Simon Willison',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=simonwillison.net&sz=128',
                category: 'LLM & MLLM',
                tags: ['LLM', 'Year in Review', 'Reasoning Models', 'Independent Researcher'],
                readTime: '24 min read',
                publishDate: '2025-12-31',
                sourceName: 'Simon Willison',
                url: 'https://simonwillison.net/2025/Dec/31/the-year-in-llms/',
                coverImage: 'https://static.simonwillison.net/static/2025/metr-long-task-2025.jpg',
                coverAlt: 'Long task benchmark chart from Simon Willison',
                coverFit: 'cover'
            },
            {
                id: 'thinking-machines-tinker-ga',
                title: 'Tinker: General Availability and Vision Input',
                excerpt: 'Thinking Machines Lab makes Tinker broadly available and adds Kimi K2 Thinking, OpenAI-compatible sampling, and Qwen3-VL vision input for fine-tuning workflows.',
                author: 'Thinking Machines Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thinkingmachines.ai&sz=128',
                category: 'Research Craft',
                tags: ['Fine-Tuning', 'Post-Training', 'Tinker', 'Research Infrastructure'],
                readTime: '8 min read',
                publishDate: '2025-12-12',
                sourceName: 'Thinking Machines Lab',
                url: 'https://thinkingmachines.ai/blog/tinker-general-availability/',
                coverImage: 'https://thinkingmachines.ai/static/tinker-ga/cards/tinker-product-01.png',
                coverAlt: 'Tinker product screenshot from Thinking Machines Lab',
                coverFit: 'cover'
            },
            {
                id: 'eugene-product-evals',
                title: 'Product Evals in Three Simple Steps',
                excerpt: 'Eugene Yan gives a practical workflow for product-focused LLM evaluation: label a small dataset, align evaluators, and run an evaluation harness with each change.',
                author: 'Eugene Yan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=eugeneyan.com&sz=128',
                category: 'Research Craft',
                tags: ['Evals', 'LLM Products', 'AI Engineering', 'Research Craft'],
                readTime: '9 min read',
                publishDate: '2025-11-23',
                sourceName: 'Eugene Yan',
                url: 'https://eugeneyan.com/writing/product-evals/',
                coverImage: 'https://eugeneyan.com/assets/images/eugene-yan-square.jpg',
                coverAlt: 'Eugene Yan official author image',
                coverFit: 'cover'
            },
            {
                id: 'jose-muon-optimizer-explained',
                title: 'The Muon Optimizer Explained: Why Orthogonal Gradients Work',
                excerpt: 'Jose David Baena walks through Muon from a practitioner angle, explaining orthogonal gradients, Newton-Schulz iteration, transformer parameter geometry, and nanochat experiments.',
                author: 'Jose David Baena',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=josedavidbaena.com&sz=128',
                category: 'Efficient AI',
                tags: ['Muon', 'Optimizers', 'Newton-Schulz', 'NanoChat'],
                readTime: '21 min read',
                publishDate: '2025-10-15',
                sourceName: 'Jose David Baena',
                url: 'https://josedavidbaena.com/blog/nanochat/muon-optimizer-explained',
                coverImage: 'https://www.josedavidbaena.com/static/images/blog/nanochat/muon-optimizer-banner.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'thinking-machines-tinker',
                title: 'Announcing Tinker',
                excerpt: 'Thinking Machines Lab introduces Tinker, a managed low-level fine-tuning API that exposes training primitives while handling distributed model training infrastructure.',
                author: 'Thinking Machines Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thinkingmachines.ai&sz=128',
                category: 'Research Craft',
                tags: ['Tinker', 'Fine-Tuning', 'Post-Training', 'Open Models'],
                readTime: '8 min read',
                publishDate: '2025-10-01',
                sourceName: 'Thinking Machines Lab',
                url: 'https://thinkingmachines.ai/blog/announcing-tinker/',
                coverImage: 'https://thinkingmachines.ai/news/announcing-tinker/images/tinker-cover-social.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'thinking-machines-nondeterminism',
                title: 'Defeating Nondeterminism in LLM Inference',
                excerpt: 'Horace He and Thinking Machines Lab explain why LLM inference can remain nondeterministic at temperature zero and how batch-invariant kernels improve reproducibility.',
                author: 'Horace He and Thinking Machines Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=thinkingmachines.ai&sz=128',
                category: 'Efficient AI',
                tags: ['Inference', 'Determinism', 'Kernels', 'Reproducibility'],
                readTime: '26 min read',
                publishDate: '2025-09-10',
                sourceName: 'Thinking Machines Lab',
                url: 'https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/',
                coverImage: 'https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/images/cover-social.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'openai-why-lms-hallucinate',
                title: 'Why Language Models Hallucinate',
                excerpt: 'OpenAI argues that hallucinations persist partly because training and benchmarks reward confident guessing over calibrated uncertainty, reframing the problem as evaluation design too.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Hallucinations', 'Evaluation', 'Reliability', 'LLM'],
                readTime: '10 min read',
                publishDate: '2025-09-05',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/why-language-models-hallucinate/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/28bcbcb2-563a-432b-df938802863b/5fff5e2602331f7682792f5f541c75f9/young-tiger.jpg?fm=webp&q=90&w=3840',
                coverAlt: 'OpenAI article image for language model hallucinations',
                coverFit: 'cover'
            },
            {
                id: 'allenai-critical-batch-size',
                title: 'Revisiting Critical Batch Size for Large-Batch OLMo Pretraining',
                excerpt: 'Ai2 revisits critical batch size measurement for OLMo pretraining and shows how batch-size warmup can reduce gradient steps without sacrificing loss.',
                author: 'Will Merill and Ai2',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=allenai.org&sz=128',
                category: 'Efficient AI',
                tags: ['OLMo', 'Pretraining', 'Batch Size', 'Scaling'],
                readTime: '14 min read',
                publishDate: '2025-06-03',
                sourceName: 'Ai2 Blog',
                url: 'https://allenai.org/blog/critical-batch-size',
                coverImage: 'https://olmo-data.org/blog/img/cbs/social.jpg',
                coverAlt: 'Critical batch size article cover from Ai2',
                coverFit: 'cover'
            },
            {
                id: 'eugene-long-context-qa-evals',
                title: 'Evaluating Long-Context Question & Answer Systems',
                excerpt: 'Eugene Yan surveys practical long-context Q&A evaluation, covering datasets, hallucination and faithfulness checks, LLM judges, and benchmark design pitfalls.',
                author: 'Eugene Yan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=eugeneyan.com&sz=128',
                category: 'Research Craft',
                tags: ['Long Context', 'Evals', 'Q&A', 'LLM Systems'],
                readTime: '28 min read',
                publishDate: '2025-06-21',
                sourceName: 'Eugene Yan',
                url: 'https://eugeneyan.com/writing/qa-evals/',
                coverImage: 'https://eugeneyan.com/assets/og_image/qa-evals-v2.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'claude-4',
                title: 'Introducing Claude 4',
                excerpt: 'Anthropic introduces Claude Opus 4 and Claude Sonnet 4, emphasizing stronger coding, reasoning, agent workflows, and sustained task execution.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Foundation Model',
                tags: ['Claude 4', 'Reasoning', 'Coding', 'Agentic AI'],
                readTime: '9 min read',
                publishDate: '2025-05-22',
                sourceName: 'Anthropic',
                url: 'https://www.anthropic.com/news/claude-4',
                coverImage: 'https://www.anthropic.com/api/opengraph-illustration?name=Hand%20HeadShapes&backgroundColor=clay',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'alphaevolve-coding-agent',
                title: 'AlphaEvolve: A Gemini-Powered Coding Agent for Algorithm Discovery',
                excerpt: 'Google DeepMind describes AlphaEvolve, an agentic system that uses Gemini models to propose, test, and improve algorithms through automated experimentation.',
                author: 'Google DeepMind',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'AI Agents',
                tags: ['AlphaEvolve', 'Coding Agent', 'Algorithm Discovery', 'Gemini'],
                readTime: '14 min read',
                publishDate: '2025-05-14',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/discover/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/',
                coverImage: 'https://lh3.googleusercontent.com/WKOJO9SYJP1AgXD-JJBzFDVr8Wq4N8owr1Cq5QllzipRplGrsEDUzMd7dR0BXvG9kV7Hy71QKDuLDB-CzIdCz37JH1cFYUt3hHpwPHTKVcZTIt_qTg=w1200-h630-n-nu-rw',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'lilian-why-we-think',
                title: 'Why We Think',
                excerpt: 'Lilian Weng surveys test-time compute, chain-of-thought, reasoning RL, tool use, continuous thinking, and why giving models more thinking time can help.',
                author: 'Lilian Weng',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
                category: 'LLM & MLLM',
                tags: ['Reasoning', 'Test-Time Compute', 'Chain of Thought', 'RL'],
                readTime: '40 min read',
                publishDate: '2025-05-01',
                sourceName: "Lil'Log",
                url: 'https://lilianweng.github.io/posts/2025-05-01-thinking/',
                coverImage: 'https://lilianweng.github.io/posts/2025-05-01-thinking/cot-wei22.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'openai-o3-o4-mini',
                title: 'Introducing OpenAI o3 and o4-mini',
                excerpt: 'OpenAI introduces reasoning models that can use tools, inspect images, write code, and chain multi-step problem solving inside the API and ChatGPT.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['o3', 'o4-mini', 'Reasoning', 'Tool Use'],
                readTime: '10 min read',
                publishDate: '2025-04-16',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/introducing-o3-and-o4-mini/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/5msykBd6Wu5mBcTgoqeJkj/4481c11698ff69f3d44d4c6220fade12/hero_image_1-whiteboard1.png?fm=webp&q=90&w=1920',
                coverAlt: 'OpenAI o3 and o4-mini article hero image',
                coverFit: 'cover'
            },
            {
                id: 'anthropic-tracing-thoughts',
                title: 'Tracing the Thoughts of a Large Language Model',
                excerpt: 'Anthropic shares interpretability work tracing circuits inside Claude, including multilingual abstraction, poetry planning, and mechanisms behind misleading reasoning.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Trustworthy AI',
                tags: ['Interpretability', 'Claude', 'Mechanistic Analysis', 'AI Safety'],
                readTime: '18 min read',
                publishDate: '2025-03-27',
                sourceName: 'Anthropic Research',
                url: 'https://www.anthropic.com/research/tracing-thoughts-language-model',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/16c0eba69e06ee6e629756624d27117c3636d9ae-2400x1260.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'openai-agent-tools-2025',
                title: 'New Tools for Building Agents',
                excerpt: 'OpenAI introduces the Responses API, built-in tools, tracing, and agent-building primitives for developers moving from simple chatbots to tool-using systems.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'AI Agents',
                tags: ['Agents', 'Responses API', 'Tools', 'Developer Platform'],
                readTime: '9 min read',
                publishDate: '2025-03-11',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/new-tools-for-building-agents/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/4VSVILkTaA1Rm3mBTenI0a/c2ed8fcbf73c0cdfbcc4cf3e7887d68d/OpenAI_Agents_Illustration_2x.png?fm=webp&q=90&w=1920',
                coverAlt: 'OpenAI agents tools illustration',
                coverFit: 'cover'
            },
            {
                id: 'jeremy-deriving-muon',
                title: 'Deriving Muon',
                excerpt: 'Jeremy Bernstein derives Muon from layer geometry and spectral norms, connecting optimizer design to a more modular theory of deep learning.',
                author: 'Jeremy Bernstein',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=jeremybernste.in&sz=128',
                category: 'Efficient AI',
                tags: ['Muon', 'Optimization Theory', 'Spectral Norm', 'Training'],
                readTime: '18 min read',
                publishDate: '2025-03-07',
                sourceName: 'Jeremy Bernstein',
                url: 'https://jeremybernste.in/writing/deriving-muon',
                coverImage: 'https://jeremybernste.in/images/posts/2025-03-07/tracks.jpg',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'claude-37-sonnet-code',
                title: 'Claude 3.7 Sonnet and Claude Code',
                excerpt: 'Anthropic launches a hybrid reasoning model and early Claude Code workflow, showing how frontier models are becoming practical collaborators for software engineering.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['Claude 3.7 Sonnet', 'Claude Code', 'Reasoning', 'Coding'],
                readTime: '9 min read',
                publishDate: '2025-02-24',
                sourceName: 'Anthropic',
                url: 'https://www.anthropic.com/news/claude-3-7-sonnet',
                coverImage: 'https://www.anthropic.com/api/opengraph-illustration?name=Hand%20HeadNodeThink&backgroundColor=clay',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'sebastian-reasoning-llms',
                title: 'Understanding Reasoning LLMs',
                excerpt: 'Sebastian Raschka gives a careful independent explanation of reasoning models, reinforcement learning, distillation, and why DeepSeek-R1 changed the public discussion.',
                author: 'Sebastian Raschka',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=magazine.sebastianraschka.com&sz=128',
                category: 'LLM & MLLM',
                tags: ['Reasoning LLMs', 'DeepSeek-R1', 'RL', 'Independent Researcher'],
                readTime: '23 min read',
                publishDate: '2025-02-05',
                sourceName: 'Ahead of AI',
                url: 'https://magazine.sebastianraschka.com/p/understanding-reasoning-llms',
                coverImage: 'https://substackcdn.com/image/fetch/$s_!QwUc!,w_1200,h_675,c_fill,f_jpg,q_auto:good,fl_progressive:steep,g_auto/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fd6ebc5c9-461f-4d3a-889b-b8ea4e14e5ba_1600x830.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'open-r1',
                title: 'Open-R1: A Fully Open Reproduction of DeepSeek-R1',
                excerpt: 'Hugging Face documents the Open-R1 effort to reproduce reasoning-model training recipes in the open, including data, RL, evaluation, and community collaboration.',
                author: 'Hugging Face',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Foundation Model',
                tags: ['Open-R1', 'DeepSeek-R1', 'Open Reproduction', 'Reasoning'],
                readTime: '12 min read',
                publishDate: '2025-01-28',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/open-r1',
                coverImage: 'https://huggingface.co/blog/assets/open-r1/thumbnails.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'vllm-v1-core-architecture',
                title: 'vLLM V1: A Major Upgrade to vLLM Core Architecture',
                excerpt: 'The vLLM team walks through scheduler, memory, prefix caching, and execution changes that make high-throughput LLM serving easier to scale and operate.',
                author: 'vLLM Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=vllm.ai&sz=128',
                category: 'Efficient AI',
                tags: ['vLLM', 'Inference', 'Serving', 'Systems'],
                readTime: '14 min read',
                publishDate: '2025-01-27',
                sourceName: 'vLLM Blog',
                url: 'https://blog.vllm.ai/2025/01/27/v1-alpha-release.html',
                coverImage: 'https://vllm.ai/og?title=vLLM%20V1%3A%20A%20Major%20Upgrade%20to%20vLLM%27s%20Core%20Architecture&authors=vLLM%20Team&date=2025-01-27&path=/blog',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'chip-ai-engineering-pitfalls',
                title: 'Common Pitfalls of Building Generative AI Applications',
                excerpt: 'Chip Huyen lays out practical failure modes in AI engineering, from eval design and data quality to product scope, latency, and reliability.',
                author: 'Chip Huyen',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huyenchip.com&sz=128',
                category: 'Research Craft',
                tags: ['AI Engineering', 'Evals', 'Product', 'Reliability'],
                readTime: '20 min read',
                publishDate: '2025-01-16',
                sourceName: 'Chip Huyen',
                url: 'https://huyenchip.com/2025/01/16/ai-engineering-pitfalls.html',
                coverImage: 'https://huyenchip.com/assets/pics/aie-pitfalls/aie-pitfalls.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'building-effective-agents',
                title: 'Building Effective Agents',
                excerpt: 'Anthropic distills patterns for when to use workflows versus agents, how to compose tools, and how to keep agent systems reliable enough for production.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['Agents', 'Tool Use', 'Workflows', 'System Design'],
                readTime: '18 min read',
                publishDate: '2024-12-19',
                sourceName: 'Anthropic Engineering',
                url: 'https://www.anthropic.com/engineering/building-effective-agents',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/76b5733c669f0dfb9c7aa7fc512a495867cf12e6-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'keller-muon-optimizer',
                title: 'Muon: An Optimizer for Hidden Layers in Neural Networks',
                excerpt: 'Keller Jordan introduces Muon, an optimizer that orthogonalizes momentum updates with Newton-Schulz iteration and improves competitive transformer training speed.',
                author: 'Keller Jordan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=kellerjordan.github.io&sz=128',
                category: 'Efficient AI',
                tags: ['Muon', 'Optimizer', 'Newton-Schulz', 'Training Efficiency'],
                readTime: '17 min read',
                publishDate: '2024-12-08',
                sourceName: 'Keller Jordan',
                url: 'https://kellerjordan.github.io/posts/muon/',
                coverImage: 'https://kellerjordan.github.io/images/muon/muon_algo.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'smolagents',
                title: 'smolagents: A Simple Library for Building Agentic Systems',
                excerpt: 'Hugging Face introduces a compact agent framework centered on simple abstractions, code execution, tools, and reproducible examples.',
                author: 'Hugging Face',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'AI Agents',
                tags: ['Agents', 'Tools', 'Hugging Face', 'Open Source'],
                readTime: '12 min read',
                publishDate: '2024-12-31',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/smolagents',
                coverImage: 'https://huggingface.co/blog/assets/smolagents/thumbnail.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'model-context-protocol',
                title: 'Introducing the Model Context Protocol',
                excerpt: 'Anthropic introduces MCP as an open protocol for connecting AI assistants to data sources and tools through a standardized integration layer.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'AI Agents',
                tags: ['MCP', 'Tool Use', 'Agents', 'Developer Infrastructure'],
                readTime: '8 min read',
                publishDate: '2024-11-25',
                sourceName: 'Anthropic',
                url: 'https://www.anthropic.com/news/model-context-protocol',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/1aef864f9b246c740fe3cef6e1068f2220995d5e-2400x1260.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'lilian-reward-hacking',
                title: 'Reward Hacking in Reinforcement Learning',
                excerpt: 'Lilian Weng surveys reward hacking across RL and language model settings, connecting specification gaps, evaluation failure, and alignment practice.',
                author: 'Lilian Weng',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
                category: 'Trustworthy AI',
                tags: ['Reward Hacking', 'Alignment', 'RL', 'Evaluation'],
                readTime: '28 min read',
                publishDate: '2024-11-28',
                sourceName: "Lil'Log",
                url: 'https://lilianweng.github.io/posts/2024-11-28-reward-hacking/',
                coverImage: 'https://lilianweng.github.io/posts/2024-11-28-reward-hacking/SEAL-feature-imprint.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'olmo2-open-language-model',
                title: 'OLMo 2: The Best Fully Open Language Model to Date',
                excerpt: 'Ai2 describes OLMo 2, an open language model family with transparent data, training recipes, checkpoints, and analysis for reproducible foundation-model research.',
                author: 'Ai2',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=allenai.org&sz=128',
                category: 'Foundation Model',
                tags: ['OLMo 2', 'Open Model', 'Training Data', 'Reproducibility'],
                readTime: '12 min read',
                publishDate: '2024-11-26',
                sourceName: 'Ai2 Blog',
                url: 'https://allenai.org/blog/olmo2',
                coverImage: 'https://olmo-data.org/blog/img/olmo2/logo.png',
                coverAlt: 'OLMo 2 official article image from Ai2',
                coverFit: 'cover'
            },
            {
                id: 'tulu3-open-post-training',
                title: 'Tulu 3: The Next Era in Open Post-Training',
                excerpt: 'Ai2 documents the Tulu 3 post-training stack, releasing open recipes, data, code, evaluation, RLVR methods, and model artifacts for instruction-tuned LLMs.',
                author: 'Ai2',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=allenai.org&sz=128',
                category: 'Foundation Model',
                tags: ['Tulu 3', 'Post-Training', 'Open Models', 'RLVR'],
                readTime: '18 min read',
                publishDate: '2024-11-21',
                sourceName: 'Ai2 Blog',
                url: 'https://allenai.org/blog/tulu-3-technical',
                coverImage: 'https://olmo-data.org/blog/img/tulu3/tulu3-outputs.png',
                coverAlt: 'Tulu 3 article figure from Ai2',
                coverFit: 'cover'
            },
            {
                id: 'flexattention',
                title: 'FlexAttention: The Flexibility of PyTorch with the Performance of FlashAttention',
                excerpt: 'The PyTorch team introduces FlexAttention, an attention API designed to make custom attention patterns easier without giving up kernel-level performance.',
                author: 'PyTorch Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=pytorch.org&sz=128',
                category: 'Efficient AI',
                tags: ['Attention', 'PyTorch', 'FlashAttention', 'Kernel Performance'],
                readTime: '16 min read',
                publishDate: '2024-08-07',
                sourceName: 'PyTorch Blog',
                url: 'https://pytorch.org/blog/flexattention/',
                coverImage: 'https://pytorch.org/wp-content/uploads/2024/10/logo.svg',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'llama-31-open-source-ai',
                title: 'Introducing Llama 3.1: Our Most Capable Models to Date',
                excerpt: 'Meta introduces Llama 3.1, including the 405B open-weight model, expanded context length, multilingual capability, and a broader open AI ecosystem.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Foundation Model',
                tags: ['Llama 3.1', 'Open Weights', '405B', 'Foundation Model'],
                readTime: '12 min read',
                publishDate: '2024-07-23',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/meta-llama-3-1/',
                coverImage: 'https://static.facebook.com/images/logos/facebook_2x.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'smollm-small-language-models',
                title: 'SmolLM: Blazingly Fast and Remarkably Powerful',
                excerpt: 'Hugging Face introduces a compact open language model family and training pipeline for practical on-device, low-cost, and accessible LLM experimentation.',
                author: 'Hugging Face',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Efficient AI',
                tags: ['Small Models', 'Open Models', 'On-device AI', 'Efficient AI'],
                readTime: '10 min read',
                publishDate: '2024-07-16',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/smollm',
                coverImage: 'https://huggingface.co/blog/assets/smollm/banner.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'flashattention-3',
                title: 'FlashAttention-3: Fast and Accurate Attention with Asynchrony',
                excerpt: 'Tri Dao explains FlashAttention-3, using Hopper-era GPU features and asynchronous execution to accelerate attention while preserving accuracy.',
                author: 'Tri Dao',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=tridao.me&sz=128',
                category: 'Efficient AI',
                tags: ['FlashAttention-3', 'GPU Kernels', 'Attention', 'Efficient AI'],
                readTime: '18 min read',
                publishDate: '2024-07-11',
                sourceName: 'Tri Dao',
                url: 'https://tridao.me/blog/2024/flash3/',
                coverImage: 'https://tridao.me/assets/img/2024-07-11-flash3/flash_recap_diagram-480.webp',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'gemma-2-open-models',
                title: 'Gemma 2: Improving Open Models at a Practical Size',
                excerpt: 'Google introduces Gemma 2, focusing on strong open model quality at practical sizes with responsible release tools and broad developer access.',
                author: 'Google',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Foundation Model',
                tags: ['Gemma 2', 'Open Model', 'Developer AI', 'Foundation Model'],
                readTime: '9 min read',
                publishDate: '2024-06-27',
                sourceName: 'Google Blog',
                url: 'https://blog.google/technology/developers/google-gemma-2/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/Gemma_2_hero_static.width-1300.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'applied-llms-lessons',
                title: 'What We Learned from a Year of Building with LLMs',
                excerpt: 'A practitioner guide from applied LLM builders covering evals, retrieval, UX, observability, product scope, and operational lessons from real deployments.',
                author: 'Eugene Yan, Bryan Bischof, Charles Frye et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=applied-llms.org&sz=128',
                category: 'Research Craft',
                tags: ['LLM Applications', 'Evals', 'RAG', 'Product Engineering'],
                readTime: '30 min read',
                publishDate: '2024-06-01',
                sourceName: 'Applied LLMs',
                url: 'https://applied-llms.org/',
                coverImage: 'https://applied-llms.org/images/hamel_cover_img.png',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'eugene-llm-evals',
                title: 'Task-Specific LLM Evals that Do and Do Not Work',
                excerpt: 'Eugene Yan explains how to design useful LLM evaluations around concrete tasks, failure modes, and product decisions rather than generic benchmark theater.',
                author: 'Eugene Yan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=eugeneyan.com&sz=128',
                category: 'Research Craft',
                tags: ['Evals', 'LLM Systems', 'Product Quality', 'Research Craft'],
                readTime: '18 min read',
                publishDate: '2024-03-31',
                sourceName: 'Eugene Yan',
                url: 'https://eugeneyan.com/writing/evals/',
                coverImage: 'https://eugeneyan.com/assets/og_image/llm-evals.jpg',
                coverAlt: 'Real cover from og:image',
                coverFit: 'cover'
            },
            {
                id: 'cosmopedia-synthetic-data',
                title: 'Cosmopedia: How to Create Large-Scale Synthetic Data',
                excerpt: 'Hugging Face details Cosmopedia, a synthetic textbook-scale dataset effort that helped train small language models with curated and structured generated data.',
                author: 'Hugging Face',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Foundation Model',
                tags: ['Synthetic Data', 'Datasets', 'Small LLMs', 'Generative AI'],
                readTime: '14 min read',
                publishDate: '2024-03-20',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/cosmopedia',
                coverImage: 'https://huggingface.co/blog/assets/cosmopedia/thumbnail.png',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'sglang-radixattention',
                title: 'SGLang: Efficient Execution of Structured Language Model Programs',
                excerpt: 'LMSYS introduces SGLang and RadixAttention for efficient structured generation, caching, and serving of complex LLM programs.',
                author: 'LMSYS and UC Berkeley',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lmsys.org&sz=128',
                category: 'Efficient AI',
                tags: ['SGLang', 'RadixAttention', 'Serving', 'Structured Generation'],
                readTime: '16 min read',
                publishDate: '2024-01-17',
                sourceName: 'LMSYS Blog',
                url: 'https://lmsys.org/blog/2024-01-17-sglang/',
                coverImage: 'https://www.lmsys.org/images/logo-v2.png',
                coverAlt: 'Real cover from first-image',
                coverFit: 'cover'
            },
            {
                id: 'simon-llms-in-2024',
                title: 'Things We Learned about LLMs in 2024',
                excerpt: 'Simon Willison summarizes a year of LLM practice, including model capability shifts, pricing, tooling, evals, multimodal use, and what surprised builders.',
                author: 'Simon Willison',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=simonwillison.net&sz=128',
                category: 'LLM & MLLM',
                tags: ['LLM', 'Year in Review', 'Developer AI', 'Independent Researcher'],
                readTime: '26 min read',
                publishDate: '2024-12-31',
                sourceName: 'Simon Willison',
                url: 'https://simonwillison.net/2024/Dec/31/llms-in-2024/',
                coverImage: 'https://static.simonwillison.net/static/2024/arena-dec-2024.jpg',
                coverAlt: 'Real cover from twitter:image',
                coverFit: 'cover'
            },
            {
                id: 'ovis25',
                title: 'Ovis2.5 Technical Report',
                excerpt: 'AIDC-AI releases Ovis2.5 with native-resolution visual perception, thinking-mode reasoning, and stronger chart, STEM, grounding, and video understanding.',
                author: 'AIDC-AI Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Multimodal Model',
                tags: ['Ovis2.5', 'Native Resolution', 'Multimodal Reasoning', 'Open MLLM'],
                readTime: '14 min read',
                publishDate: '2025-08-15',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/AIDC-AI/Ovis2.5-9B',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/AIDC-AI/Ovis2.5-9B.png',
                coverAlt: 'Ovis2.5 model card preview',
                coverFit: 'cover'
            },
            {
                id: 'bitvla',
                title: 'BitVLA: 1-bit Vision-Language-Action Models',
                excerpt: 'BitVLA explores native 1-bit VLA models for robotic manipulation, reducing memory cost while remaining competitive on LIBERO-style tasks.',
                author: 'BitVLA Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'World Model',
                tags: ['BitVLA', '1-bit Models', 'Edge Robotics', 'Robot Manipulation'],
                readTime: '14 min read',
                publishDate: '2025-06-09',
                sourceName: 'GitHub',
                url: 'https://github.com/ustcwhy/BitVLA',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-bitvla/ustcwhy/BitVLA',
                coverAlt: 'BitVLA repository preview',
                coverFit: 'cover'
            },
            {
                id: 'step-video-ti2v',
                title: 'Step-Video-TI2V',
                excerpt: 'StepFun releases a 30B text-driven image-to-video model and benchmark, extending Step-Video from pure text-to-video toward controllable first-frame generation.',
                author: 'StepFun',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Step-Video-TI2V', 'Image-to-Video', 'Video Generation', 'Open Weights'],
                readTime: '14 min read',
                publishDate: '2025-03-14',
                sourceName: 'GitHub',
                url: 'https://github.com/stepfun-ai/Step-Video-TI2V',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-step-video-ti2v/stepfun-ai/Step-Video-TI2V',
                coverAlt: 'Step-Video-TI2V repository preview',
                coverFit: 'cover'
            },
            {
                id: 'hunyuanvideo-i2v',
                title: 'HunyuanVideo-I2V',
                excerpt: 'Tencent Hunyuan releases an image-to-video model built on HunyuanVideo, adding first-frame guided generation to the open video model family.',
                author: 'Tencent Hunyuan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['HunyuanVideo-I2V', 'Image-to-Video', 'Tencent Hunyuan', 'Open Video'],
                readTime: '13 min read',
                publishDate: '2025-03-06',
                sourceName: 'GitHub',
                url: 'https://github.com/Tencent-Hunyuan/HunyuanVideo-I2V',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hunyuan-i2v/Tencent-Hunyuan/HunyuanVideo-I2V',
                coverAlt: 'HunyuanVideo-I2V repository preview',
                coverFit: 'cover'
            },
            {
                id: 'step-video-t2v',
                title: 'Step-Video-T2V',
                excerpt: 'Step-Video-T2V is a 30B text-to-video foundation model for long, high-quality generation, released with inference code, weights, and evaluation assets.',
                author: 'StepFun',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Step-Video-T2V', 'Text-to-Video', 'Video Foundation Model', 'Open Weights'],
                readTime: '14 min read',
                publishDate: '2025-02-14',
                sourceName: 'GitHub',
                url: 'https://github.com/stepfun-ai/Step-Video-T2V',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-step-video-t2v/stepfun-ai/Step-Video-T2V',
                coverAlt: 'Step-Video-T2V repository preview',
                coverFit: 'cover'
            },
            {
                id: 'qvq-72b-preview',
                title: 'QVQ-72B-Preview',
                excerpt: 'Qwen releases a visual reasoning model built on Qwen2-VL, improving multimodal chain-of-thought performance on MMMU, math, and science tasks.',
                author: 'Qwen Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=qwenlm.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['QVQ', 'Visual Reasoning', 'Qwen2-VL', 'Open Weights'],
                readTime: '12 min read',
                publishDate: '2024-12-25',
                sourceName: 'Qwen Blog',
                url: 'https://qwenlm.github.io/blog/qvq-72b-preview/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/Qwen/QVQ-72B-Preview.png',
                coverAlt: 'QVQ-72B-Preview model card preview',
                coverFit: 'cover'
            },
            {
                id: 'internvl25',
                title: 'InternVL2.5',
                excerpt: 'OpenGVLab expands the InternVL series with stronger data, model, and test-time scaling across reasoning, documents, video, grounding, and multilingual tasks.',
                author: 'OpenGVLab Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=internvl.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['InternVL2.5', 'Open MLLM', 'Test-time Scaling', 'Document Understanding'],
                readTime: '14 min read',
                publishDate: '2024-12-05',
                sourceName: 'InternVL Blog',
                url: 'https://internvl.github.io/blog/2024-12-05-InternVL-2.5/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/OpenGVLab/InternVL2_5-78B.png',
                coverAlt: 'InternVL2.5 model card preview',
                coverFit: 'cover'
            },
            {
                id: 'open-sora-plan',
                title: 'Open-Sora Plan: Open-Source Large Video Generation Model',
                excerpt: 'PKU-YuanGroup documents an open-source video generation roadmap with public code and weights for reproducing large text-to-video systems.',
                author: 'PKU-YuanGroup',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Open-Sora Plan', 'Open Video', 'Text-to-Video', 'Video DiT'],
                readTime: '15 min read',
                publishDate: '2024-11-28',
                sourceName: 'GitHub',
                url: 'https://github.com/PKU-YuanGroup/Open-Sora-Plan',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2412.00131/gradient.png',
                coverAlt: 'Open-Sora Plan paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'allegro-video',
                title: 'Allegro: Commercial-Level Open Video Generation',
                excerpt: 'Rhymes AI open-sources Allegro, a video generation model and training recipe focused on high visual quality and temporal consistency.',
                author: 'Rhymes AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Allegro', 'Text-to-Video', 'Open Video', 'Temporal Consistency'],
                readTime: '13 min read',
                publishDate: '2024-10-20',
                sourceName: 'GitHub',
                url: 'https://github.com/rhymes-ai/Allegro',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-allegro/rhymes-ai/Allegro',
                coverAlt: 'Allegro repository preview',
                coverFit: 'cover'
            },
            {
                id: 'aria-moe',
                title: 'Aria: Open Multimodal Native MoE',
                excerpt: 'Rhymes AI introduces Aria, a native multimodal mixture-of-experts model trained from scratch across language, image, video, and long-context stages.',
                author: 'Rhymes AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Aria', 'MoE', 'Native Multimodal', 'Open MLLM'],
                readTime: '14 min read',
                publishDate: '2024-10-08',
                sourceName: 'GitHub',
                url: 'https://github.com/rhymes-ai/Aria',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/rhymes-ai/Aria.png',
                coverAlt: 'Aria model card preview',
                coverFit: 'cover'
            },
            {
                id: 'omnigen',
                title: 'OmniGen: Unified Image Generation',
                excerpt: 'OmniGen unifies text-to-image, editing, subject-driven generation, and visual-conditional generation in one instruction-driven diffusion model.',
                author: 'VectorSpaceLab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['OmniGen', 'Unified Image Generation', 'Image Editing', 'Diffusion'],
                readTime: '13 min read',
                publishDate: '2024-09-17',
                sourceName: 'GitHub',
                url: 'https://github.com/VectorSpaceLab/OmniGen',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-omnigen/VectorSpaceLab/OmniGen',
                coverAlt: 'OmniGen repository preview',
                coverFit: 'cover'
            },
            {
                id: 'nvlm-10',
                title: 'NVLM 1.0: Open Frontier-Class Multimodal LLMs',
                excerpt: 'NVIDIA ADLR releases NVLM 1.0, a 72B-class multimodal family that pairs strong vision-language performance with improved text-only reasoning.',
                author: 'NVIDIA ADLR',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.nvidia.com&sz=128',
                category: 'Multimodal Model',
                tags: ['NVLM 1.0', 'NVIDIA', 'OCRBench', 'Multimodal LLM'],
                readTime: '15 min read',
                publishDate: '2024-09-17',
                sourceName: 'NVIDIA ADLR',
                url: 'https://research.nvidia.com/labs/adlr/NVLM-1/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/nvidia/NVLM-D-72B.png',
                coverAlt: 'NVLM-D-72B model card preview',
                coverFit: 'cover'
            },
            {
                id: 'qwen2-vl',
                title: 'Qwen2-VL: To See the World More Clearly',
                excerpt: 'Qwen2-VL brings any-resolution image perception, long-video understanding, multilingual OCR, and agent-like device interaction to the Qwen vision-language family.',
                author: 'Qwen Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=qwenlm.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['Qwen2-VL', 'Video Understanding', 'Multilingual OCR', 'Vision-Language'],
                readTime: '17 min read',
                publishDate: '2024-08-29',
                sourceName: 'Qwen Blog',
                url: 'https://qwenlm.github.io/blog/qwen2-vl/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/Qwen/Qwen2-VL-72B-Instruct.png',
                coverAlt: 'Qwen2-VL model card preview',
                coverFit: 'cover'
            },
            {
                id: 'minicpm-v-26',
                title: 'MiniCPM-V 2.6',
                excerpt: 'OpenBMB releases MiniCPM-V 2.6 for efficient single-image, multi-image, and video understanding, including practical real-time use on edge devices.',
                author: 'OpenBMB Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Multimodal Model',
                tags: ['MiniCPM-V 2.6', 'Edge VLM', 'Video Understanding', 'Open MLLM'],
                readTime: '12 min read',
                publishDate: '2024-08-06',
                sourceName: 'GitHub',
                url: 'https://github.com/OpenBMB/MiniCPM-V',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/openbmb/MiniCPM-V-2_6.png',
                coverAlt: 'MiniCPM-V 2.6 model card preview',
                coverFit: 'cover'
            },
            {
                id: 'helios-video',
                title: 'Helios: Real Real-Time Long Video Generation Model',
                excerpt: 'PKU-YuanGroup releases Helios, a long-video generation model designed for real-time inference, open demos, and practical low-latency creative workflows.',
                author: 'PKU-YuanGroup',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Helios', 'Long Video', 'Real-time Generation', 'Open Model'],
                readTime: '13 min read',
                publishDate: '2026-03-04',
                sourceName: 'GitHub',
                url: 'https://github.com/PKU-YuanGroup/Helios',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-helios/PKU-YuanGroup/Helios',
                coverAlt: 'Helios repository preview',
                coverFit: 'cover'
            },
            {
                id: 'deepseek-ocr',
                title: 'DeepSeek-OCR: Contexts Optical Compression',
                excerpt: 'DeepSeek releases a document-focused VLM that compresses long textual contexts into visual representations, targeting efficient OCR, document parsing, and structured extraction.',
                author: 'DeepSeek AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=128',
                category: 'Multimodal Model',
                tags: ['DeepSeek-OCR', 'Document AI', 'OCR', 'Visual Compression'],
                readTime: '11 min read',
                publishDate: '2025-10-21',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/deepseek-ai/DeepSeek-OCR',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/deepseek-ai/DeepSeek-OCR.png',
                coverAlt: 'DeepSeek-OCR model card preview',
                coverFit: 'cover'
            },
            {
                id: 'reconvla',
                title: 'ReconVLA: Reconstructive Vision-Language-Action Model',
                excerpt: 'ReconVLA guides robot attention through reconstruction targets, improving fine-grained object grounding, manipulation precision, and generalization across robot tasks.',
                author: 'OpenHelix Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'World Model',
                tags: ['ReconVLA', 'Robot Perception', 'Implicit Grounding', 'Manipulation'],
                readTime: '15 min read',
                publishDate: '2025-08-14',
                sourceName: 'GitHub',
                url: 'https://github.com/OpenHelix-Team/ReconVLA',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2508.10333/gradient.png',
                coverAlt: 'ReconVLA paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'smolvla',
                title: 'SmolVLA: Efficient Vision-Language-Action Model',
                excerpt: 'Hugging Face releases a compact VLA trained on LeRobot community data, designed to run on accessible hardware while preserving practical robot manipulation ability.',
                author: 'Hugging Face LeRobot',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'World Model',
                tags: ['SmolVLA', 'LeRobot', 'Compact VLA', 'Open Robotics'],
                readTime: '12 min read',
                publishDate: '2025-06-03',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/lerobot/smolvla_base',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/lerobot/smolvla_base.png',
                coverAlt: 'SmolVLA model card preview',
                coverFit: 'cover'
            },
            {
                id: 'hunyuanvideo-avatar',
                title: 'HunyuanVideo-Avatar',
                excerpt: 'Tencent Hunyuan releases an audio-driven human animation model built on HunyuanVideo, supporting high-fidelity multi-character talking avatars and style transfer.',
                author: 'Tencent Hunyuan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=tencent.com&sz=128',
                category: 'Visual Generation',
                tags: ['HunyuanVideo-Avatar', 'Talking Avatar', 'Human Animation', 'Audio-driven Video'],
                readTime: '12 min read',
                publishDate: '2025-05-26',
                sourceName: 'GitHub',
                url: 'https://github.com/Tencent-Hunyuan/HunyuanVideo-Avatar',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hunyuanvideo-avatar/Tencent-Hunyuan/HunyuanVideo-Avatar',
                coverAlt: 'HunyuanVideo-Avatar repository preview',
                coverFit: 'cover'
            },
            {
                id: 'vlm-3r',
                title: 'VLM-3R: VLMs with Instruction-Aligned 3D Reconstruction',
                excerpt: 'VLM-3R augments vision-language models with 3D reconstructive instruction tuning, improving monocular video spatial reasoning and embodied 3D assistance.',
                author: 'VITA Group and Collaborators',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Multimodal Model',
                tags: ['VLM-3R', '3D Reconstruction', 'Spatial Reasoning', 'CVPR 2026'],
                readTime: '15 min read',
                publishDate: '2025-05-26',
                sourceName: 'GitHub',
                url: 'https://github.com/VITA-Group/VLM-3R',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2505.20279/gradient.png',
                coverAlt: 'VLM-3R paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'vace-video',
                title: 'VACE: All-in-One Video Creation and Editing',
                excerpt: 'Alibaba Tongyi Lab releases VACE, a unified video generation and editing model for reference-to-video, video-to-video, masking, expansion, replacement, and animation workflows.',
                author: 'Alibaba Tongyi Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['VACE', 'Video Editing', 'Video Generation', 'ICCV 2025'],
                readTime: '13 min read',
                publishDate: '2025-05-14',
                sourceName: 'GitHub',
                url: 'https://github.com/ali-vilab/VACE',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-vace/ali-vilab/VACE',
                coverAlt: 'VACE repository preview',
                coverFit: 'cover'
            },
            {
                id: 'ui-tars-15',
                title: 'UI-TARS-1.5',
                excerpt: 'ByteDance Seed open-sources UI-TARS-1.5, a vision-language GUI agent model for desktop, browser, mobile, and game tasks with stronger visual grounding.',
                author: 'ByteDance Seed',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=seed.bytedance.com&sz=128',
                category: 'Multimodal Model',
                tags: ['UI-TARS-1.5', 'GUI Agent', 'Vision-Language', 'Computer Use'],
                readTime: '12 min read',
                publishDate: '2025-04-16',
                sourceName: 'GitHub',
                url: 'https://github.com/bytedance/UI-TARS',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-ui-tars/bytedance/UI-TARS',
                coverAlt: 'UI-TARS repository preview',
                coverFit: 'cover'
            },
            {
                id: 'skyreels-a2',
                title: 'SkyReels-A2: Compose Anything in Video Diffusion Transformers',
                excerpt: 'SkyworkAI releases SkyReels-A2 for composing multiple reference subjects, objects, and backgrounds into controllable video diffusion outputs with strong consistency.',
                author: 'SkyworkAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['SkyReels-A2', 'Video Composition', 'Reference Control', 'Video Diffusion'],
                readTime: '13 min read',
                publishDate: '2025-04-03',
                sourceName: 'GitHub',
                url: 'https://github.com/SkyworkAI/SkyReels-A2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-skyreels-a2/SkyworkAI/SkyReels-A2',
                coverAlt: 'SkyReels-A2 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'stable-virtual-camera',
                title: 'Stable Virtual Camera',
                excerpt: 'Stability AI releases Stable Virtual Camera, a diffusion-based view synthesis model for generating 3D-consistent novel camera views and short camera-control videos.',
                author: 'Stability AI, Oxford, UC Berkeley',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=stability.ai&sz=128',
                category: 'Visual Generation',
                tags: ['Stable Virtual Camera', 'Novel View Synthesis', '3D Video', 'Diffusion'],
                readTime: '12 min read',
                publishDate: '2025-03-18',
                sourceName: 'GitHub',
                url: 'https://github.com/Stability-AI/stable-virtual-camera',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-seva/Stability-AI/stable-virtual-camera',
                coverAlt: 'Stable Virtual Camera repository preview',
                coverFit: 'cover'
            },
            {
                id: 'videollama3',
                title: 'VideoLLaMA 3',
                excerpt: 'Alibaba DAMO Academy releases VideoLLaMA 3, a vision-centric multimodal foundation model for image, multi-image, visual grounding, and video understanding.',
                author: 'Alibaba DAMO Academy',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Multimodal Model',
                tags: ['VideoLLaMA 3', 'Video Understanding', 'Visual Grounding', 'Open VLM'],
                readTime: '14 min read',
                publishDate: '2025-01-22',
                sourceName: 'GitHub',
                url: 'https://github.com/DAMO-NLP-SG/VideoLLaMA3',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-videollama3/DAMO-NLP-SG/VideoLLaMA3',
                coverAlt: 'VideoLLaMA3 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'jina-vlm',
                title: 'Jina-VLM: Small Multilingual Vision-Language Model',
                excerpt: 'Jina AI releases a 2.4B multilingual VLM built on Qwen3 and SigLIP2, targeting token-efficient visual QA and document understanding across languages.',
                author: 'Jina AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=jina.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Jina-VLM', 'Multilingual VQA', 'Token Efficient', 'Small VLM'],
                readTime: '10 min read',
                publishDate: '2025-12-03',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/jinaai/jina-vlm',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/jinaai/jina-vlm.png',
                coverAlt: 'Jina-VLM model card preview',
                coverFit: 'cover'
            },
            {
                id: 'ernie-image',
                title: 'ERNIE Image',
                excerpt: 'Baidu releases an open 8B text-to-image diffusion transformer focused on bilingual text rendering, prompt enhancement, poster design, comics, and local deployment.',
                author: 'Baidu ERNIE Image Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=baidu.com&sz=128',
                category: 'Visual Generation',
                tags: ['ERNIE Image', 'Text-to-Image', 'Text Rendering', 'Open Weights'],
                readTime: '11 min read',
                publishDate: '2026-04-15',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/baidu/ERNIE-Image',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/baidu/ERNIE-Image.png',
                coverAlt: 'ERNIE Image model card preview',
                coverFit: 'cover'
            },
            {
                id: 'loc3r-vlm',
                title: 'Loc3R-VLM: Localization and 3D Reasoning with VLMs',
                excerpt: 'Microsoft Research and collaborators extend VLMs with language-based localization, 3D reasoning, and camera-pose priors for viewpoint-aware spatial understanding.',
                author: 'Microsoft Research and Collaborators',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Loc3R-VLM', '3D Reasoning', 'Localization', 'Spatial Understanding'],
                readTime: '14 min read',
                publishDate: '2026-03-18',
                sourceName: 'Microsoft Research',
                url: 'https://www.microsoft.com/en-us/research/publication/loc3r-vlm-language-based-localization-and-3d-reasoning-with-vision-language-models/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2603.18002/gradient.png',
                coverAlt: 'Loc3R-VLM paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'qianfan-ocr',
                title: 'Qianfan-OCR: Unified End-to-End Document Intelligence',
                excerpt: 'Baidu releases a 4B document intelligence VLM for OCR, layout analysis, tables, formulas, charts, and key information extraction in one end-to-end model.',
                author: 'Baidu Qianfan Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=baidu.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Qianfan-OCR', 'Document AI', 'OCR', 'Layout Reasoning'],
                readTime: '12 min read',
                publishDate: '2026-03-17',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/baidu/Qianfan-OCR',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/baidu/Qianfan-OCR.png',
                coverAlt: 'Qianfan-OCR model card preview',
                coverFit: 'cover'
            },
            {
                id: 'hunyuanimage-30',
                title: 'HunyuanImage 3.0',
                excerpt: 'Tencent Hunyuan releases a native multimodal image model with prompt reasoning, text-to-image generation, image-to-image editing, and distilled inference checkpoints.',
                author: 'Tencent Hunyuan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=tencent.com&sz=128',
                category: 'Visual Generation',
                tags: ['HunyuanImage 3.0', 'Image Generation', 'Image Editing', 'Native Multimodal'],
                readTime: '13 min read',
                publishDate: '2026-01-26',
                sourceName: 'GitHub',
                url: 'https://github.com/Tencent-Hunyuan/HunyuanImage-3.0',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hunyuanimage-30/Tencent-Hunyuan/HunyuanImage-3.0',
                coverAlt: 'HunyuanImage 3.0 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'ctrl-world-robot',
                title: 'Ctrl-World: Controllable Generative World Model for Robot Manipulation',
                excerpt: 'Ctrl-World provides action-conditioned imagination rollouts compatible with VLA policies, enabling policy-in-the-loop evaluation and improvement without real robot trials.',
                author: 'Ctrl-World Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'World Model',
                tags: ['Ctrl-World', 'Robot Manipulation', 'World Model', 'Imagination Rollouts'],
                readTime: '16 min read',
                publishDate: '2025-10-13',
                sourceName: 'GitHub',
                url: 'https://github.com/Robert-gyj/Ctrl-World',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2510.10125/gradient.png',
                coverAlt: 'Ctrl-World paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'matrix-3d',
                title: 'Matrix-3D: Omnidirectional Explorable 3D World Generation',
                excerpt: 'SkyworkAI releases Matrix-3D for generating large-scale explorable 3D scenes from a single image or text prompt using panoramic video priors and reconstruction.',
                author: 'SkyworkAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Matrix-3D', '3D World Generation', 'Panorama Video', 'Text-to-3D'],
                readTime: '16 min read',
                publishDate: '2025-09-02',
                sourceName: 'GitHub',
                url: 'https://github.com/SkyworkAI/Matrix-3D',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-matrix-3d/SkyworkAI/Matrix-3D',
                coverAlt: 'Matrix-3D repository preview',
                coverFit: 'cover'
            },
            {
                id: 'step-audio2-mini',
                title: 'Step-Audio 2 Mini',
                excerpt: 'StepFun open-sources an 8B speech-to-speech audio language model for real-time voice interaction, expressive speech, audio understanding, and tool-style workflows.',
                author: 'StepFun AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=stepfun.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Step-Audio 2', 'Speech-to-Speech', 'Audio LLM', 'Open Model'],
                readTime: '12 min read',
                publishDate: '2025-08-29',
                sourceName: 'GitHub',
                url: 'https://github.com/stepfun-ai/Step-Audio2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-step-audio2/stepfun-ai/Step-Audio2',
                coverAlt: 'Step-Audio2 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'voxtral',
                title: 'Voxtral',
                excerpt: 'Mistral AI releases Voxtral Mini and Small, open audio-language models for transcription, summarization, Q&A, function calling, and long-context speech understanding.',
                author: 'Mistral AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Voxtral', 'Audio-Language', 'Speech Understanding', 'Open Weights'],
                readTime: '10 min read',
                publishDate: '2025-07-15',
                sourceName: 'Mistral AI',
                url: 'https://mistral.ai/news/voxtral',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/mistralai/Voxtral-Small-24B-2507.png',
                coverAlt: 'Voxtral Small model card preview',
                coverFit: 'cover'
            },
            {
                id: 'cube-3d-roblox',
                title: 'Roblox Cube 3D',
                excerpt: 'Roblox open-sources Cube 3D, a 1.8B foundation model for text-to-3D mesh generation and the first release in its broader 3D and 4D creation stack.',
                author: 'Roblox',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=roblox.com&sz=128',
                category: 'Visual Generation',
                tags: ['Cube 3D', 'Text-to-3D', 'Mesh Generation', 'Open Source'],
                readTime: '9 min read',
                publishDate: '2025-03-17',
                sourceName: 'Roblox',
                url: 'https://corp.roblox.com/newsroom/2025/03/introducing-roblox-cube',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-cube3d/Roblox/cube',
                coverAlt: 'Roblox Cube repository preview',
                coverFit: 'cover'
            },
            {
                id: 'hidream-o1-image',
                title: 'HiDream-O1-Image',
                excerpt: 'HiDream releases an 8B pixel-level unified image model for text-to-image, long-text rendering, instruction editing, personalization, and storyboard generation.',
                author: 'HiDream AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['HiDream-O1', 'Text-to-Image', 'Image Editing', 'Unified Transformer'],
                readTime: '12 min read',
                publishDate: '2026-05-08',
                sourceName: 'GitHub',
                url: 'https://github.com/HiDream-ai/HiDream-O1-Image',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hidream-o1/HiDream-ai/HiDream-O1-Image',
                coverAlt: 'HiDream-O1-Image repository preview',
                coverFit: 'cover'
            },
            {
                id: 'molmoact-2',
                title: 'MolmoAct 2: An Open Foundation for Robots',
                excerpt: 'Ai2 releases MolmoAct 2, an open robotics foundation model with embodied reasoning, faster action calls, bimanual data, and stronger real-world manipulation.',
                author: 'Ai2',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=allenai.org&sz=128',
                category: 'World Model',
                tags: ['MolmoAct 2', 'Robotics', 'Action Reasoning', 'Open Foundation Model'],
                readTime: '17 min read',
                publishDate: '2026-05-05',
                sourceName: 'Ai2',
                url: 'https://allenai.org/blog/molmoact2',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/allenai/MolmoAct2.png',
                coverAlt: 'MolmoAct 2 model card preview',
                coverFit: 'cover'
            },
            {
                id: 'x-vla-soft-prompted',
                title: 'X-VLA: Soft-Prompted Cross-Embodiment VLA',
                excerpt: 'X-VLA introduces embodiment-specific soft prompts so one Transformer policy can absorb heterogeneous robot data and adapt across platforms with few tuned parameters.',
                author: 'Tsinghua AIR and 2toINF',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'World Model',
                tags: ['X-VLA', 'Cross-Embodiment', 'Soft Prompts', 'Robot Policy'],
                readTime: '15 min read',
                publishDate: '2025-10-10',
                sourceName: 'Hugging Face LeRobot',
                url: 'https://huggingface.co/docs/lerobot/xvla',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2510.10274/gradient.png',
                coverAlt: 'X-VLA paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'glm-45v',
                title: 'GLM-4.5V',
                excerpt: 'Z.ai releases a 106B MoE vision-language model focused on multimodal reasoning over images, video, long documents, charts, GUI screens, and grounded outputs.',
                author: 'Z.ai',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=z.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['GLM-4.5V', 'Vision-Language', 'Multimodal Reasoning', 'Open Weights'],
                readTime: '13 min read',
                publishDate: '2025-08-11',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/zai-org/GLM-4.5V',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/zai-org/GLM-4.5V.png',
                coverAlt: 'GLM-4.5V model card preview',
                coverFit: 'cover'
            },
            {
                id: 'omnigen2',
                title: 'OmniGen2: Exploration to Advanced Multimodal Generation',
                excerpt: 'VectorSpaceLab releases OmniGen2 for text-to-image, instruction-guided image editing, in-context generation, and visual understanding with open weights.',
                author: 'VectorSpaceLab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['OmniGen2', 'Image Generation', 'Image Editing', 'In-context Generation'],
                readTime: '14 min read',
                publishDate: '2025-06-16',
                sourceName: 'GitHub',
                url: 'https://github.com/VectorSpaceLab/OmniGen2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-omnigen2/VectorSpaceLab/OmniGen2',
                coverAlt: 'OmniGen2 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'show-o2',
                title: 'Show-o2: Improved Native Unified Multimodal Models',
                excerpt: 'Show Lab releases Show-o2, a native unified multimodal model that combines autoregressive language modeling with flow matching for image and video generation.',
                author: 'Show Lab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=showlab.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['Show-o2', 'Unified Multimodal', 'Flow Matching', 'Video Generation'],
                readTime: '15 min read',
                publishDate: '2025-06-19',
                sourceName: 'GitHub',
                url: 'https://github.com/showlab/Show-o',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-show-o2/showlab/Show-o',
                coverAlt: 'Show-o repository preview',
                coverFit: 'cover'
            },
            {
                id: 'magi-1-video',
                title: 'MAGI-1: Autoregressive Video Generation at Scale',
                excerpt: 'Sand AI releases MAGI-1, an open video generation model that creates clips chunk by chunk through autoregressive denoising for controllable long-form synthesis.',
                author: 'Sand AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=magi-ai.org&sz=128',
                category: 'Visual Generation',
                tags: ['MAGI-1', 'Video Generation', 'Autoregressive Diffusion', 'Open Model'],
                readTime: '13 min read',
                publishDate: '2025-05-19',
                sourceName: 'GitHub',
                url: 'https://github.com/SandAI-org/MAGI-1',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-magi-1/SandAI-org/MAGI-1',
                coverAlt: 'MAGI-1 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'bagel-unified-multimodal',
                title: 'BAGEL: The Open-Source Unified Multimodal Model',
                excerpt: 'ByteDance Seed open-sources BAGEL, a 14B-total MoE model for multimodal understanding, image generation, editing, future-frame prediction, and world navigation.',
                author: 'ByteDance Seed',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=seed.bytedance.com&sz=128',
                category: 'Multimodal Model',
                tags: ['BAGEL', 'Unified Multimodal', 'Image Generation', 'Image Editing'],
                readTime: '16 min read',
                publishDate: '2025-05-20',
                sourceName: 'GitHub',
                url: 'https://github.com/ByteDance-Seed/Bagel',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-bagel/ByteDance-Seed/Bagel',
                coverAlt: 'BAGEL repository preview',
                coverFit: 'cover'
            },
            {
                id: 'seed15-vl',
                title: 'Seed1.5-VL',
                excerpt: 'ByteDance Seed releases a general-purpose vision-language foundation model aimed at stronger multimodal understanding, reasoning, and benchmark performance.',
                author: 'ByteDance Seed',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=seed.bytedance.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Seed1.5-VL', 'Vision-Language', 'Multimodal Reasoning', 'Open Model'],
                readTime: '12 min read',
                publishDate: '2025-05-12',
                sourceName: 'GitHub',
                url: 'https://github.com/ByteDance-Seed/Seed1.5-VL',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-seed15-vl/ByteDance-Seed/Seed1.5-VL',
                coverAlt: 'Seed1.5-VL repository preview',
                coverFit: 'cover'
            },
            {
                id: 'univla',
                title: 'UniVLA: Learning to Act Anywhere with Task-centric Latent Actions',
                excerpt: 'OpenDriveLab introduces UniVLA, deriving task-centric latent actions from videos to scale robot policy learning across embodiments and environments.',
                author: 'OpenDriveLab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=opendrivelab.com&sz=128',
                category: 'World Model',
                tags: ['UniVLA', 'Latent Actions', 'Robot Policy', 'VLA'],
                readTime: '15 min read',
                publishDate: '2025-05-09',
                sourceName: 'GitHub',
                url: 'https://github.com/OpenDriveLab/UniVLA',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-univla/OpenDriveLab/UniVLA',
                coverAlt: 'UniVLA repository preview',
                coverFit: 'cover'
            },
            {
                id: 'hidream-i1',
                title: 'HiDream-I1',
                excerpt: 'HiDream releases a 17B open image generation foundation model using sparse diffusion transformers, with fast, dev, and full variants plus editing extensions.',
                author: 'HiDream AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['HiDream-I1', 'Image Generation', 'Sparse DiT', 'Open Weights'],
                readTime: '11 min read',
                publishDate: '2025-04-07',
                sourceName: 'GitHub',
                url: 'https://github.com/HiDream-ai/HiDream-I1',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hidream-i1/HiDream-ai/HiDream-I1',
                coverAlt: 'HiDream-I1 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'step1x-edit',
                title: 'Step1X-Edit',
                excerpt: 'StepFun releases a practical open image editing model designed for instruction-following edits that approach leading closed-source visual editing systems.',
                author: 'StepFun AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=stepfun.com&sz=128',
                category: 'Visual Generation',
                tags: ['Step1X-Edit', 'Image Editing', 'Instruction Following', 'Open Model'],
                readTime: '10 min read',
                publishDate: '2025-04-24',
                sourceName: 'GitHub',
                url: 'https://github.com/stepfun-ai/Step1X-Edit',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-step1x-edit/stepfun-ai/Step1X-Edit',
                coverAlt: 'Step1X-Edit repository preview',
                coverFit: 'cover'
            },
            {
                id: 'skyreels-v2',
                title: 'SkyReels-V2: Infinite-length Film Generative Model',
                excerpt: 'SkyworkAI releases SkyReels-V2, an open video model for story generation, image-to-video, camera-direction control, and multi-subject consistency.',
                author: 'SkyworkAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['SkyReels-V2', 'Video Generation', 'Long Video', 'Film Generation'],
                readTime: '14 min read',
                publishDate: '2025-04-21',
                sourceName: 'GitHub',
                url: 'https://github.com/SkyworkAI/SkyReels-V2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-skyreels-v2/SkyworkAI/SkyReels-V2',
                coverAlt: 'SkyReels-V2 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'framepack-video',
                title: 'FramePack: Packing Input Frame Context for Video Generation',
                excerpt: 'Lvmin Zhang and Maneesh Agrawala introduce FramePack, a practical next-frame video generation architecture that keeps context cost fixed for longer videos.',
                author: 'Lvmin Zhang and Maneesh Agrawala',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['FramePack', 'Video Diffusion', 'Next-frame Prediction', 'Long Video'],
                readTime: '13 min read',
                publishDate: '2025-04-17',
                sourceName: 'GitHub',
                url: 'https://github.com/lllyasviel/FramePack',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-framepack/lllyasviel/FramePack',
                coverAlt: 'FramePack repository preview',
                coverFit: 'cover'
            },
            {
                id: 'minimax-vl-01',
                title: 'MiniMax-VL-01',
                excerpt: 'MiniMax open-sources a vision-language model built on MiniMax-Text-01, pairing a ViT encoder with long-context multimodal reasoning and open weights.',
                author: 'MiniMax AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=minimax.io&sz=128',
                category: 'Multimodal Model',
                tags: ['MiniMax-VL-01', 'Vision-Language', 'Long Context', 'Open Weights'],
                readTime: '10 min read',
                publishDate: '2025-01-15',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/MiniMaxAI/MiniMax-VL-01',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/MiniMaxAI/MiniMax-VL-01.png',
                coverAlt: 'MiniMax-VL-01 model card preview',
                coverFit: 'cover'
            },
            {
                id: 'minicpm-o-45',
                title: 'MiniCPM-o 4.5',
                excerpt: 'OpenBMB releases a 9B end-to-end omni-modal model for vision, speech, OCR, and full-duplex live streaming that targets strong on-device and edge deployment.',
                author: 'OpenBMB',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openbmb.cn&sz=128',
                category: 'Multimodal Model',
                tags: ['MiniCPM-o 4.5', 'Omni-modal', 'Full-duplex', 'Edge AI'],
                readTime: '16 min read',
                publishDate: '2026-05-07',
                sourceName: 'Hugging Face',
                url: 'https://huggingface.co/openbmb/MiniCPM-o-4_5',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/openbmb/MiniCPM-o-4_5.png',
                coverAlt: 'MiniCPM-o 4.5 model card preview',
                coverFit: 'cover'
            },
            {
                id: 'pi07-physical-intelligence',
                title: 'pi0.7: A Steerable Model with Emergent Capabilities',
                excerpt: 'Physical Intelligence introduces pi0.7, a steerable generalist robot policy trained with multimodal prompts, visual subgoals, and broad robot data for compositional generalization.',
                author: 'Physical Intelligence',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=pi.website&sz=128',
                category: 'World Model',
                tags: ['pi0.7', 'VLA', 'Robot Policy', 'Compositional Generalization'],
                readTime: '18 min read',
                publishDate: '2026-04-16',
                sourceName: 'Physical Intelligence',
                url: 'https://www.pi.website/blog/pi07',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2604.15483/gradient.png',
                coverAlt: 'pi0.7 paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'seedream-50-lite',
                title: 'Seedream 5.0 Lite',
                excerpt: 'ByteDance Seed upgrades its image creation stack with stronger cross-modal reasoning, world knowledge, search-enhanced generation, and more controllable editing.',
                author: 'ByteDance Seed',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=seed.bytedance.com&sz=128',
                category: 'Visual Generation',
                tags: ['Seedream 5.0', 'Image Generation', 'Reasoning', 'Image Editing'],
                readTime: '11 min read',
                publishDate: '2026-02-13',
                sourceName: 'ByteDance Seed',
                url: 'https://seed.bytedance.com/en/blog/deeper-thinking-more-accurate-generation-introducing-seedream-5-0-lite',
                coverImage: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/user-upload/mlkdzfhl.jpg',
                coverAlt: 'Seedream 5.0 Lite visual reasoning example',
                coverFit: 'cover'
            },
            {
                id: 'qwen3-omni',
                title: 'Qwen3-Omni Technical Report',
                excerpt: 'Qwen releases a native omni-modal model family that unifies text, image, audio, video understanding, and real-time speech generation in one open model stack.',
                author: 'Qwen Team',
                authorAvatar: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-vl-Capybara.png',
                category: 'Multimodal Model',
                tags: ['Qwen3-Omni', 'Omni-modal', 'Audio-Visual', 'Open Model'],
                readTime: '20 min read',
                publishDate: '2025-09-22',
                sourceName: 'Qwen GitHub',
                url: 'https://github.com/QwenLM/Qwen3-Omni',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/Qwen/Qwen3-Omni-30B-A3B-Instruct.png',
                coverAlt: 'Qwen3-Omni model card preview',
                coverFit: 'cover'
            },
            {
                id: 'gemini-25-flash-image',
                title: 'Gemini 2.5 Flash Image',
                excerpt: 'Google introduces a fast image generation and editing model for character consistency, targeted natural-language edits, multi-image fusion, and world-knowledge-aware creation.',
                author: 'Google AI for Developers',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Gemini 2.5 Flash Image', 'Image Editing', 'Multi-image Fusion', 'SynthID'],
                readTime: '10 min read',
                publishDate: '2025-08-26',
                sourceName: 'Google Developers Blog',
                url: 'https://developers.googleblog.com/en/introducing-gemini-2-5-flash-image/',
                coverImage: 'https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Gemini2.5Flash-16x9-Alt_RD1-V01.2e16d0ba.fill-1200x600.jpg',
                coverAlt: 'Gemini 2.5 Flash Image launch cover',
                coverFit: 'cover'
            },
            {
                id: 'qwen-image-edit',
                title: 'Qwen-Image-Edit',
                excerpt: 'Qwen extends its 20B image foundation model into editing, combining semantic control, appearance preservation, and bilingual text editing for high-quality visual iteration.',
                author: 'Qwen Team',
                authorAvatar: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-vl-Capybara.png',
                category: 'Visual Generation',
                tags: ['Qwen-Image-Edit', 'Image Editing', 'Text Rendering', 'Open Weights'],
                readTime: '8 min read',
                publishDate: '2025-08-19',
                sourceName: 'Qwen Blog',
                url: 'https://qwenlm.github.io/blog/qwen-image-edit/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/Qwen/Qwen-Image-Edit.png',
                coverAlt: 'Qwen-Image-Edit model card preview',
                coverFit: 'cover'
            },
            {
                id: 'wan22',
                title: 'Wan2.2',
                excerpt: 'The Wan team releases a major open video model upgrade with MoE video diffusion, cinematic aesthetic control, stronger motion generation, and efficient 720p hybrid text-image-to-video.',
                author: 'Wan Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Wan2.2', 'Video Generation', 'MoE Diffusion', 'Open Model'],
                readTime: '15 min read',
                publishDate: '2025-07-28',
                sourceName: 'GitHub',
                url: 'https://github.com/Wan-Video/Wan2.2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-wan22/Wan-Video/Wan2.2',
                coverAlt: 'Wan2.2 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'flux-1-krea-dev',
                title: 'FLUX.1 Krea [dev]',
                excerpt: 'Black Forest Labs and Krea release an open-weights text-to-image model tuned for photorealism, distinctive aesthetics, and reduced oversaturated AI texture.',
                author: 'Black Forest Labs and Krea AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=bfl.ai&sz=128',
                category: 'Visual Generation',
                tags: ['FLUX.1 Krea', 'Text-to-Image', 'Open Weights', 'Photorealism'],
                readTime: '9 min read',
                publishDate: '2025-07-31',
                sourceName: 'Black Forest Labs',
                url: 'https://bfl.ai/announcements/flux-1-krea-dev',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/black-forest-labs/FLUX.1-Krea-dev.png',
                coverAlt: 'FLUX.1 Krea model preview',
                coverFit: 'cover'
            },
            {
                id: 'mistral-medium-3',
                title: 'Mistral Medium 3',
                excerpt: 'Mistral AI introduces an efficient enterprise model positioned for coding, STEM, instruction following, and multimodal understanding at substantially lower serving cost.',
                author: 'Mistral AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Mistral Medium 3', 'Enterprise AI', 'Coding', 'Multimodal'],
                readTime: '8 min read',
                publishDate: '2025-05-07',
                sourceName: 'Mistral AI',
                url: 'https://mistral.ai/news/mistral-medium-3',
                coverImage: 'https://cms.mistral.ai/assets/1a845a6e-34b8-4a0e-83d8-25a1436241a9.png?height=2026&width=2540',
                coverAlt: 'Mistral Medium 3 benchmark table',
                coverFit: 'cover'
            },
            {
                id: 'pi05-physical-intelligence',
                title: 'pi0.5: A VLA with Open-World Generalization',
                excerpt: 'Physical Intelligence scales pi0 with heterogeneous co-training so robots can perform long-horizon household manipulation in new homes and unfamiliar scenes.',
                author: 'Physical Intelligence',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=pi.website&sz=128',
                category: 'World Model',
                tags: ['pi0.5', 'VLA', 'Open-world Generalization', 'Robotics'],
                readTime: '17 min read',
                publishDate: '2025-04-22',
                sourceName: 'Physical Intelligence',
                url: 'https://www.pi.website/blog/pi05',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2504.16054/gradient.png',
                coverAlt: 'pi0.5 paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'mistral-ocr',
                title: 'Mistral OCR',
                excerpt: 'Mistral AI launches a multilingual document understanding API for PDFs, scientific papers, tables, equations, images, and structured document-as-prompt workflows.',
                author: 'Mistral AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Mistral OCR', 'Document AI', 'Multilingual', 'RAG'],
                readTime: '11 min read',
                publishDate: '2025-03-06',
                sourceName: 'Mistral AI',
                url: 'https://mistral.ai/news/mistral-ocr',
                coverImage: 'https://cms.mistral.ai/assets/3aa243eb-f883-4676-b23a-f69f5227375c.png?width=1546&height=1999',
                coverAlt: 'Mistral OCR document extraction example',
                coverFit: 'cover'
            },
            {
                id: 'aya-vision',
                title: 'Aya Vision',
                excerpt: 'Cohere For AI releases an open-weights multilingual vision model aimed at broad multimodal communication across languages and global use cases.',
                author: 'Cohere Labs Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=cohere.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Aya Vision', 'Multilingual', 'Open Weights', 'Vision-Language'],
                readTime: '7 min read',
                publishDate: '2025-03-04',
                sourceName: 'Cohere',
                url: 'https://cohere.com/blog/aya-vision',
                coverImage: 'https://storage.ghost.io/c/81/47/8147eb50-617d-4929-b563-3922b88421fd/content/images/2025/03/Aya-Vision.png',
                coverAlt: 'Aya Vision featured image',
                coverFit: 'cover'
            },
            {
                id: 'figure-helix',
                title: 'Helix: A Vision-Language-Action Model for Generalist Humanoid Control',
                excerpt: 'Figure introduces Helix, a system-1/system-2 VLA that translates language and perception into continuous humanoid upper-body control for novel household objects.',
                author: 'Figure AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=figure.ai&sz=128',
                category: 'World Model',
                tags: ['Helix', 'Humanoid Robots', 'VLA', 'Generalist Control'],
                readTime: '15 min read',
                publishDate: '2025-02-20',
                sourceName: 'Figure AI',
                url: 'https://www.figure.ai/news/helix',
                coverImage: 'https://images.ctfassets.net/qx5k8y1u9drj/3iC6I99o9zVebi4YAct58Z/c0f52b7200aee4c9638fe9fb1d9a5788/NEW_SCALING_LAWS.png?fm=webp&q=70&w=3840',
                coverAlt: 'Figure Helix scaling laws diagram',
                coverFit: 'cover'
            },
            {
                id: 'firefly-video-model',
                title: 'Adobe Firefly Video Model',
                excerpt: 'Adobe brings Firefly into video generation with creator controls, image-to-video workflows, camera settings, keyframes, audio tools, and commercially safe media creation.',
                author: 'Adobe Firefly Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=128',
                category: 'Visual Generation',
                tags: ['Firefly Video', 'Video Generation', 'Creative Control', 'Commercial Safety'],
                readTime: '12 min read',
                publishDate: '2025-02-12',
                sourceName: 'Adobe Blog',
                url: 'https://blog.adobe.com/en/publish/2025/02/12/meet-firefly-video-model-ai-powered-creation-with-unparalleled-creative-control',
                coverImage: 'https://blog.adobe.com/en/publish/2025/02/12/media_19846d436079bbe9de6505cc71ae92758436e7468.png?width=1200&format=pjpg&optimize=medium',
                coverAlt: 'Adobe Firefly Video Model interface',
                coverFit: 'cover'
            },
            {
                id: 'gemini-20-flash',
                title: 'Gemini 2.0 Flash',
                excerpt: 'Google announces Gemini 2.0 Flash with stronger multimodal reasoning, native tool use, live audio-video streaming, and new image and audio output modes.',
                author: 'Google DeepMind and Google Labs',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Gemini 2.0 Flash', 'Multimodal Live API', 'Tool Use', 'Native Outputs'],
                readTime: '12 min read',
                publishDate: '2024-12-11',
                sourceName: 'Google Developers Blog',
                url: 'https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/',
                coverImage: 'https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Gemini2.0.2e16d0ba.fill-1200x600.png',
                coverAlt: 'Gemini 2.0 developer launch cover',
                coverFit: 'cover'
            },
            {
                id: 'genesis-embodied-ai',
                title: 'Genesis: A Generative World for Robotics and Embodied AI',
                excerpt: 'Genesis releases an open-source generative physics and simulation platform designed for robotics, embodied AI learning, and large-scale physical data generation.',
                author: 'Genesis Embodied AI Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'World Model',
                tags: ['Genesis', 'Physics Simulation', 'Embodied AI', 'Robotics'],
                readTime: '14 min read',
                publishDate: '2024-12-19',
                sourceName: 'GitHub',
                url: 'https://github.com/Genesis-Embodied-AI/genesis-world',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-genesis/Genesis-Embodied-AI/genesis-world',
                coverAlt: 'Genesis repository preview',
                coverFit: 'cover'
            },
            {
                id: 'pi0-physical-intelligence',
                title: 'pi0: Our First Generalist Policy',
                excerpt: 'Physical Intelligence presents pi0, a vision-language-action flow model trained across diverse robot data to control multiple robots and dexterous tasks from language.',
                author: 'Physical Intelligence',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=pi.website&sz=128',
                category: 'World Model',
                tags: ['pi0', 'VLA', 'Flow Matching', 'Robot Foundation Model'],
                readTime: '19 min read',
                publishDate: '2024-10-31',
                sourceName: 'Physical Intelligence',
                url: 'https://www.pi.website/blog/pi0',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2410.24164/gradient.png',
                coverAlt: 'pi0 paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'qwen3-vl',
                title: 'Qwen3-VL Technical Report',
                excerpt: 'Qwen releases its next-generation vision-language model family with stronger document parsing, spatial reasoning, video understanding, and agentic GUI grounding.',
                author: 'Qwen Team',
                authorAvatar: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-vl-Capybara.png',
                category: 'Multimodal Model',
                tags: ['Qwen3-VL', 'Vision-Language', 'Agent Grounding', 'Document AI'],
                readTime: '22 min read',
                publishDate: '2025-11-26',
                sourceName: 'Qwen GitHub',
                url: 'https://github.com/QwenLM/Qwen3-VL',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-qwen3-vl/QwenLM/Qwen3-VL',
                coverAlt: 'Qwen3-VL repository preview',
                coverFit: 'cover'
            },
            {
                id: 'openai-gpt-41-api',
                title: 'Introducing GPT-4.1 in the API',
                excerpt: 'OpenAI introduces GPT-4.1, mini, and nano with stronger coding, instruction following, long-context reliability, and multimodal benchmark performance.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Multimodal Model',
                tags: ['GPT-4.1', 'Long Context', 'Vision', 'Developer Models'],
                readTime: '10 min read',
                publishDate: '2025-04-14',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/gpt-4-1/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/5msykBd6Wu5mBcTgoqeJkj/4481c11698ff69f3d44d4c6220fade12/hero_image_1-whiteboard1.png?fm=webp&q=90&w=1920',
                coverAlt: 'OpenAI multimodal reasoning whiteboard example',
                coverFit: 'cover'
            },
            {
                id: 'janus-pro',
                title: 'Janus-Pro: Unified Multimodal Understanding and Generation',
                excerpt: 'DeepSeek improves its decoupled visual encoding design for unified image understanding and text-to-image generation in a single multimodal system.',
                author: 'DeepSeek AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Janus-Pro', 'Unified Multimodal', 'Image Generation', 'Visual Understanding'],
                readTime: '15 min read',
                publishDate: '2025-01-27',
                sourceName: 'GitHub',
                url: 'https://github.com/deepseek-ai/Janus',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-janus-pro/deepseek-ai/Janus',
                coverAlt: 'DeepSeek Janus repository preview',
                coverFit: 'cover'
            },
            {
                id: 'deepseek-vl2',
                title: 'DeepSeek-VL2: Mixture-of-Experts Vision-Language Models',
                excerpt: 'DeepSeek-VL2 scales open vision-language modeling with a sparse MoE architecture for document, chart, OCR, grounding, and visual reasoning tasks.',
                author: 'DeepSeek AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=deepseek.com&sz=128',
                category: 'Multimodal Model',
                tags: ['DeepSeek-VL2', 'MoE', 'OCR', 'Visual Reasoning'],
                readTime: '18 min read',
                publishDate: '2024-12-13',
                sourceName: 'GitHub',
                url: 'https://github.com/deepseek-ai/DeepSeek-VL2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-deepseek-vl2/deepseek-ai/DeepSeek-VL2',
                coverAlt: 'DeepSeek-VL2 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'pixtral-large',
                title: 'Pixtral Large',
                excerpt: 'Mistral AI scales its multimodal line with Pixtral Large, a frontier vision-language model for image understanding, instruction following, and long-context work.',
                author: 'Mistral AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Pixtral Large', 'Vision-Language', 'Long Context', 'Mistral'],
                readTime: '9 min read',
                publishDate: '2024-11-18',
                sourceName: 'Mistral AI',
                url: 'https://mistral.ai/news/pixtral-large',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/mistralai/Pixtral-Large-Instruct-2411.png',
                coverAlt: 'Pixtral Large model card preview',
                coverFit: 'contain'
            },
            {
                id: 'llava-onevision',
                title: 'LLaVA-OneVision: Easy Visual Task Transfer',
                excerpt: 'The LLaVA team unifies single-image, multi-image, and video understanding in one open vision-language model recipe.',
                author: 'LLaVA Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=llava-vl.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['LLaVA-OneVision', 'Open VLM', 'Video Understanding', 'Task Transfer'],
                readTime: '17 min read',
                publishDate: '2024-08-06',
                sourceName: 'LLaVA Blog',
                url: 'https://llava-vl.github.io/blog/2024-08-05-llava-onevision/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2408.03326/gradient.png',
                coverAlt: 'LLaVA-OneVision paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'fastvlm',
                title: 'FastVLM: Efficient Vision Encoding for Vision Language Models',
                excerpt: 'Apple ML Research shows how hybrid vision encoders can cut VLM latency and memory while preserving strong visual understanding.',
                author: 'Apple Machine Learning Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
                category: 'Multimodal Model',
                tags: ['FastVLM', 'Efficient VLM', 'Vision Encoder', 'On-device AI'],
                readTime: '13 min read',
                publishDate: '2025-07-23',
                sourceName: 'Apple ML Research',
                url: 'https://machinelearning.apple.com/research/fast-vision-language-models',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-fastvlm/apple/ml-fastvlm',
                coverAlt: 'Apple FastVLM repository preview',
                coverFit: 'cover'
            },
            {
                id: 'movie-gen',
                title: 'Meta Movie Gen',
                excerpt: 'Meta introduces Movie Gen, a set of media foundation models for text-to-video, personalized video, precise editing, and audio generation.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Visual Generation',
                tags: ['Movie Gen', 'Video Generation', 'Video Editing', 'Audio Generation'],
                readTime: '16 min read',
                publishDate: '2024-10-04',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/research/movie-gen/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2410.13720/gradient.png',
                coverAlt: 'Movie Gen paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'veo-2-imagen-3-whisk',
                title: 'Whisk, Veo 2 and Imagen 3 updates',
                excerpt: 'Google Labs updates its generative media stack with Veo 2, Imagen 3 improvements, and Whisk for image-based creative prompting.',
                author: 'Google Labs',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Veo 2', 'Imagen 3', 'Whisk', 'Generative Media'],
                readTime: '9 min read',
                publishDate: '2024-12-16',
                sourceName: 'Google Blog',
                url: 'https://blog.google/technology/google-labs/video-image-generation-update-december-2024/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/12-16-24_GenMedia_Hero-1_FEraqiS.width-1300.format-webp.webp',
                coverAlt: 'Google generative media update cover',
                coverFit: 'cover'
            },
            {
                id: 'runway-gen-3-alpha',
                title: 'Introducing Gen-3 Alpha',
                excerpt: 'Runway introduces Gen-3 Alpha as a foundation model for high-fidelity, controllable video generation and cinematic motion.',
                author: 'Runway',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=128',
                category: 'Visual Generation',
                tags: ['Gen-3 Alpha', 'Video Generation', 'Cinematic Motion', 'Controllability'],
                readTime: '8 min read',
                publishDate: '2024-06-17',
                sourceName: 'Runway Research',
                url: 'https://runwayml.com/blog/introducing-gen-3-alpha/',
                coverImage: 'https://cdn.prod.website-files.com/66e88746834b80507cdf7933/66e88746834b80507cdf7b66_Gen3%2520Blog%2520-%2520Header.jpeg',
                coverAlt: 'Runway Gen-3 Alpha launch cover',
                coverFit: 'cover'
            },
            {
                id: 'ideogram-3',
                title: 'Introducing Ideogram 3.0',
                excerpt: 'Ideogram releases a new image model focused on photorealism, graphic design quality, prompt adherence, and accurate text rendering.',
                author: 'Ideogram',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ideogram.ai&sz=128',
                category: 'Visual Generation',
                tags: ['Ideogram 3.0', 'Text Rendering', 'Image Generation', 'Design'],
                readTime: '7 min read',
                publishDate: '2025-03-26',
                sourceName: 'Ideogram',
                url: 'https://about.ideogram.ai/3.0',
                coverImage: 'https://about.ideogram.ai/static/3.0-6-879ddce0015a2b20137be3bcf8f40245.png',
                coverAlt: 'Ideogram 3.0 generated visual example',
                coverFit: 'cover'
            },
            {
                id: 'hunyuan3d-2',
                title: 'Hunyuan3D 2.0',
                excerpt: 'Tencent Hunyuan releases a large-scale 3D asset generation system for producing high-resolution textured meshes from prompts and images.',
                author: 'Tencent Hunyuan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Hunyuan3D', '3D Assets', 'Texture Generation', 'Diffusion'],
                readTime: '15 min read',
                publishDate: '2025-01-21',
                sourceName: 'GitHub',
                url: 'https://github.com/Tencent-Hunyuan/Hunyuan3D-2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hunyuan3d-2/Tencent-Hunyuan/Hunyuan3D-2',
                coverAlt: 'Hunyuan3D 2.0 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'cogvideox',
                title: 'CogVideoX: Text-to-Video Diffusion Transformers',
                excerpt: 'THUDM releases an open video generation model family with diffusion transformers, text-to-video generation, and image-to-video extensions.',
                author: 'THUDM',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['CogVideoX', 'Text-to-Video', 'Open Model', 'Diffusion Transformer'],
                readTime: '16 min read',
                publishDate: '2024-08-06',
                sourceName: 'GitHub',
                url: 'https://github.com/THUDM/CogVideo',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-cogvideox/THUDM/CogVideo',
                coverAlt: 'CogVideoX repository preview',
                coverFit: 'cover'
            },
            {
                id: 'gaia-2-world-model',
                title: 'GAIA-2: A controllable multi-view generative world model',
                excerpt: 'Wayve scales controllable driving-scene generation with multi-view world modeling for autonomy simulation and safety evaluation.',
                author: 'Wayve',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=wayve.ai&sz=128',
                category: 'World Model',
                tags: ['GAIA-2', 'Autonomous Driving', 'Multi-view Simulation', 'World Model'],
                readTime: '13 min read',
                publishDate: '2025-03-26',
                sourceName: 'Wayve',
                url: 'https://wayve.ai/thinking/gaia-2/',
                coverImage: 'https://wayve.ai/wp-content/uploads/2025/03/GAIA2-PR-notice.jpg',
                coverAlt: 'Wayve GAIA-2 world model cover',
                coverFit: 'cover'
            },
            {
                id: 'nvidia-gr00t-n1',
                title: 'NVIDIA Isaac GR00T N1',
                excerpt: 'NVIDIA introduces an open humanoid robot foundation model with vision-language-action reasoning for generalist robotics.',
                author: 'NVIDIA',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',
                category: 'World Model',
                tags: ['GR00T N1', 'Humanoid Robots', 'VLA', 'Physical AI'],
                readTime: '10 min read',
                publishDate: '2025-03-18',
                sourceName: 'NVIDIA Blog',
                url: 'https://blogs.nvidia.com/blog/isaac-gr00t-n1/',
                coverImage: 'https://blogs.nvidia.com/wp-content/uploads/2025/03/gr00t-n1-1280x680-1.jpg',
                coverAlt: 'NVIDIA GR00T N1 humanoid robot foundation model cover',
                coverFit: 'cover'
            },
            {
                id: 'cosmos-transfer1',
                title: 'NVIDIA Cosmos Transfer1',
                excerpt: 'NVIDIA expands Cosmos with a world foundation model for controllable synthetic data generation from structured spatial controls.',
                author: 'NVIDIA',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',
                category: 'World Model',
                tags: ['Cosmos Transfer1', 'Synthetic Data', 'Physical AI', 'World Foundation Model'],
                readTime: '9 min read',
                publishDate: '2025-03-18',
                sourceName: 'NVIDIA Blog',
                url: 'https://blogs.nvidia.com/blog/cosmos-transfer1-world-foundation-model/',
                coverImage: 'https://blogs.nvidia.com/wp-content/uploads/2025/03/cosmos-transfer1-1280x680-1.jpg',
                coverAlt: 'NVIDIA Cosmos Transfer1 world foundation model cover',
                coverFit: 'cover'
            },
            {
                id: 'diffusion-forcing-world-model',
                title: 'Diffusion Forcing: Next-token Prediction Meets Full-Sequence Diffusion',
                excerpt: 'MIT and collaborators introduce a sequence modeling method that supports long video rollouts, guided sampling, planning, and decision-making.',
                author: 'Boyuan Chen, Diego Marti Monso, Yilun Du et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=scenerepresentations.org&sz=128',
                category: 'World Model',
                tags: ['Diffusion Forcing', 'Sequence Modeling', 'Planning', 'Video Rollouts'],
                readTime: '18 min read',
                publishDate: '2024-07-01',
                sourceName: 'Scene Representation Group',
                url: 'https://www.scenerepresentations.org/publications/diffusion-forcing/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2407.01392/gradient.png',
                coverAlt: 'Diffusion Forcing paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'project-genie-street-view',
                title: 'Simulate real-world places with Project Genie and Street View',
                excerpt: 'Google expands Project Genie by grounding generated interactive worlds in Street View imagery, turning real places into explorable simulated environments.',
                author: 'Diego Rivas, Jonathan Herbert, Nicole Segaran',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'World Model',
                tags: ['Genie', 'Street View', 'Interactive Worlds', 'Simulation'],
                readTime: '5 min read',
                publishDate: '2026-05-19',
                sourceName: 'Google Blog',
                url: 'https://blog.google/innovation-and-ai/models-and-research/google-deepmind/project-genie-expands/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/image_bIiabui.max-244x184.format-webp.webp',
                coverAlt: 'Project Genie Street View world simulation cover',
                coverFit: 'cover'
            },
            {
                id: 'worldlabs-spark-20',
                title: 'Streaming 3DGS worlds on the web',
                excerpt: 'World Labs explains Spark 2.0, a streamable level-of-detail system for bringing large Gaussian-splat worlds to the web.',
                author: 'World Labs',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=worldlabs.ai&sz=128',
                category: 'World Model',
                tags: ['Spark 2.0', '3DGS', 'Streaming Worlds', 'Web 3D'],
                readTime: '12 min read',
                publishDate: '2026-04-14',
                sourceName: 'World Labs',
                url: 'https://www.worldlabs.ai/blog/spark-2.0',
                coverImage: 'https://www.worldlabs.ai/api/opengraph-image?imageUrl=/images/streaming-3dgs-worlds.jpg&title=Streaming%203DGS%20worlds%20on%20the%20web',
                coverAlt: 'Streaming 3DGS worlds on the web cover',
                coverFit: 'cover'
            },
            {
                id: 'worldlabs-3d-as-code',
                title: '3D as code',
                excerpt: 'World Labs frames 3D as a programmable medium for humans and AI systems to generate, edit, simulate, and share worlds together.',
                author: 'World Labs',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=worldlabs.ai&sz=128',
                category: 'World Model',
                tags: ['3D as Code', 'Spatial Intelligence', 'Simulation', 'World Building'],
                readTime: '9 min read',
                publishDate: '2026-03-03',
                sourceName: 'World Labs',
                url: 'https://www.worldlabs.ai/blog/3d-as-code',
                coverImage: 'https://www.worldlabs.ai/api/opengraph-image?imageUrl=/images/3d-as-code.jpg&title=3D%20as%20code',
                coverAlt: 'World Labs 3D as code cover',
                coverFit: 'cover'
            },
            {
                id: 'phi-4-reasoning-vision',
                title: 'Phi-4-reasoning-vision and the lessons of training a multimodal reasoning model',
                excerpt: 'Microsoft Research explains how Phi-4-Vision-Reasoning combines compact multimodal perception with reasoning-focused training for visual problem solving.',
                author: 'Microsoft Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Phi-4', 'Vision Reasoning', 'Small Models', 'Multimodal Reasoning'],
                readTime: '11 min read',
                publishDate: '2026-03-04',
                sourceName: 'Microsoft Research',
                url: 'https://www.microsoft.com/en-us/research/blog/phi-4-reasoning-vision-and-the-lessons-of-training-a-multimodal-reasoning-model/',
                coverImage: 'https://www.microsoft.com/en-us/research/wp-content/uploads/2026/03/Phi4-TWLIFB-1200x627-1.jpg',
                coverAlt: 'Phi-4-Vision-Reasoning Microsoft Research cover',
                coverFit: 'cover'
            },
            {
                id: 'gemini-robotics-on-device',
                title: 'Gemini Robotics On-Device brings AI to local robotic devices',
                excerpt: 'Google DeepMind introduces an efficient on-device vision-language-action model for local robotics, fast adaptation, and general-purpose dexterity.',
                author: 'Carolina Parada',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Gemini Robotics', 'VLA', 'On-device AI', 'Robotics'],
                readTime: '10 min read',
                publishDate: '2025-06-24',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/discover/blog/gemini-robotics-on-device-brings-ai-to-local-robotic-devices/',
                coverImage: 'https://lh3.googleusercontent.com/Ze1fT5XNBHCp_tyl1dKC9yPVmLcGpma4KdBGLpxIvpZ8Kde4-DqPgxEGrdXH0DhJDKH9LMV2z0pcxv988IxKByEm04pMu0W8a3L23ySOWUzWAji_Jw=w1200-h630-n-nu-rw',
                coverAlt: 'Gemini Robotics On-Device cover',
                coverFit: 'cover'
            },
            {
                id: 'gemini-robotics',
                title: 'Introducing Gemini Robotics and Gemini Robotics-ER',
                excerpt: 'Google DeepMind brings Gemini 2.0 into embodied AI with vision-language-action models designed for robots to perceive, reason, act, and react.',
                author: 'Carolina Parada',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Gemini Robotics', 'Vision-Language-Action', 'Embodied AI', 'Robotics'],
                readTime: '11 min read',
                publishDate: '2025-03-12',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/',
                coverImage: 'https://lh3.googleusercontent.com/5-bQ_5YmyLIrpzGGSl-KiaJCZuoJGKDyAMZc2COzuuOvdWDL7nsDY-8GtD-DzP9sKEukKM_SiJ4zpj8fHFDPCd_DcKO6k2x1PCK9NbJUsGOI1eYx=w1200-h630-n-nu-rw',
                coverAlt: 'Gemini Robotics cover',
                coverFit: 'cover'
            },
            {
                id: 'gaia-3-world-model',
                title: 'GAIA-3: Scaling World Models to Power Safety and Evaluation',
                excerpt: 'Wayve scales its driving world model into a counterfactual evaluation system for realistic, controllable autonomy testing.',
                author: 'Rudi Rankin',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=wayve.ai&sz=128',
                category: 'World Model',
                tags: ['GAIA-3', 'Autonomy', 'Counterfactual Simulation', 'Evaluation'],
                readTime: '13 min read',
                publishDate: '2025-12-02',
                sourceName: 'Wayve',
                url: 'https://wayve.ai/thinking/gaia-3/',
                coverImage: 'https://wayve.ai/wp-content/uploads/2025/12/GAIA3-PR-notice.jpg',
                coverAlt: 'Wayve GAIA-3 world model cover',
                coverFit: 'cover'
            },
            {
                id: 'marble-world-model',
                title: 'Marble: A Multimodal World Model',
                excerpt: 'World Labs opens Marble, a multimodal world model that creates editable, expandable, exportable 3D worlds from text, images, video, or rough layouts.',
                author: 'World Labs',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=worldlabs.ai&sz=128',
                category: 'World Model',
                tags: ['Marble', 'Spatial Intelligence', '3D Worlds', 'World Generation'],
                readTime: '12 min read',
                publishDate: '2025-11-12',
                sourceName: 'World Labs',
                url: 'https://www.worldlabs.ai/blog/marble-world-model',
                coverImage: 'https://www.worldlabs.ai/api/opengraph-image?imageUrl=/images/nov12-thumbnail.jpg&title=Marble:%20A%20Multimodal%20World%20Model',
                coverAlt: 'World Labs Marble multimodal world model cover',
                coverFit: 'cover'
            },
            {
                id: 'ltx-2-video-model',
                title: 'LTX-2',
                excerpt: 'Lightricks introduces LTX-2, a multimodal video foundation model for image creation, enhancement, and synchronized video-and-audio generation.',
                author: 'Lightricks',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ltx.video&sz=128',
                category: 'Visual Generation',
                tags: ['LTX-2', 'Video Generation', 'Audio-Video', 'Creative Tools'],
                readTime: '8 min read',
                publishDate: '2025-10-23',
                sourceName: 'LTX',
                url: 'https://website.ltx.video/blog/introducing-ltx-2',
                coverImage: 'https://cdn.prod.website-files.com/68f0eb70a700fe5573bf1dcf/68f749933dc7d7de3efd1175_a-1920x1080.webp',
                coverAlt: 'LTX-2 video foundation model cover',
                coverFit: 'cover'
            },
            {
                id: 'nvidia-cosmos-reason',
                title: 'How Do You Teach an AI Model to Reason? With Humans',
                excerpt: 'NVIDIA describes the human-in-the-loop data factory behind Cosmos Reason, a physical AI reasoning model for understanding real-world situations.',
                author: 'NVIDIA',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',
                category: 'World Model',
                tags: ['Cosmos Reason', 'Physical AI', 'World Reasoning', 'Data Factory'],
                readTime: '9 min read',
                publishDate: '2025-08-27',
                sourceName: 'NVIDIA Blog',
                url: 'https://blogs.nvidia.com/blog/ai-reasoning-cosmos/',
                coverImage: 'https://blogs.nvidia.com/wp-content/uploads/2025/08/cosmos-reasoning-blog-header-1280x680-1.gif',
                coverAlt: 'NVIDIA Cosmos Reason blog cover',
                coverFit: 'cover'
            },
            {
                id: 'qwen-image-text-rendering',
                title: 'Qwen-Image: Crafting with Native Text Rendering',
                excerpt: 'Qwen releases a 20B image foundation model focused on complex bilingual text rendering, precise editing, and strong general image generation.',
                author: 'Qwen Team',
                authorAvatar: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-vl-Capybara.png',
                category: 'Visual Generation',
                tags: ['Qwen-Image', 'Text Rendering', 'Image Editing', 'MMDiT'],
                readTime: '6 min read',
                publishDate: '2025-08-04',
                sourceName: 'Qwen Blog',
                url: 'https://qwenlm.github.io/blog/qwen-image/',
                coverImage: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen-Image/merge3.jpg',
                coverAlt: 'Qwen-Image text rendering examples',
                coverFit: 'cover'
            },
            {
                id: 'nvidia-cosmos-predict-2',
                title: 'NVIDIA Releases New AI Models and Developer Tools to Advance Autonomous Vehicle Ecosystem',
                excerpt: 'NVIDIA introduces Cosmos Predict-2, a world foundation model for future world-state prediction and high-quality synthetic data generation.',
                author: 'NVIDIA',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',
                category: 'World Model',
                tags: ['Cosmos Predict-2', 'World Foundation Model', 'Autonomous Vehicles', 'Synthetic Data'],
                readTime: '7 min read',
                publishDate: '2025-06-11',
                sourceName: 'NVIDIA Blog',
                url: 'https://blogs.nvidia.com/blog/autonomous-vehicle-ecosystem-ai-models-developer-tools/',
                coverImage: 'https://blogs.nvidia.com/wp-content/uploads/2025/06/Cosmos-AV-Blog-Image.png',
                coverAlt: 'NVIDIA Cosmos Predict-2 autonomous vehicle model cover',
                coverFit: 'cover'
            },
            {
                id: 'gemma-3n-preview',
                title: 'Announcing Gemma 3n preview: powerful, efficient, mobile-first AI',
                excerpt: 'Google introduces Gemma 3n, a mobile-first open model with expanded multimodal capabilities for private, efficient on-device AI.',
                author: 'Google Developers',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Gemma 3n', 'Mobile AI', 'On-device AI', 'Multimodal'],
                readTime: '8 min read',
                publishDate: '2025-05-20',
                sourceName: 'Google Developers Blog',
                url: 'https://developers.googleblog.com/en/introducing-gemma-3n/',
                coverImage: 'https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Gemma3n_Metadatal_RD2-V01.2e16d0ba.fill-1200x600.jpg',
                coverAlt: 'Gemma 3n preview cover',
                coverFit: 'cover'
            },
            {
                id: 'adobe-firefly-creative-ai-2025',
                title: 'Adobe Firefly: The next evolution of creative AI is here',
                excerpt: 'Adobe updates Firefly with new generation and editing models, bringing production-oriented creative AI tools to image, video, and design workflows.',
                author: 'Adobe',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=adobe.com&sz=128',
                category: 'Visual Generation',
                tags: ['Firefly', 'Creative AI', 'Image Generation', 'Image Editing'],
                readTime: '9 min read',
                publishDate: '2025-04-24',
                sourceName: 'Adobe Blog',
                url: 'https://blog.adobe.com/en/publish/2025/04/24/adobe-firefly-next-evolution-creative-ai-is-here',
                coverImage: 'https://blog.adobe.com/en/publish/2025/04/24/media_136dd1e26629cdd392f028c3bf1109cd390a62e88.png?width=1200&format=pjpg&optimize=medium',
                coverAlt: 'Adobe Firefly creative AI update cover',
                coverFit: 'cover'
            },
            {
                id: 'llama-4-multimodal',
                title: 'The Llama 4 herd: The beginning of a new era of natively multimodal AI innovation',
                excerpt: 'Meta introduces Llama 4 Scout and Maverick, open-weight natively multimodal models with mixture-of-experts architecture and long-context support.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Llama 4', 'Open Weights', 'MoE', 'Native Multimodal'],
                readTime: '12 min read',
                publishDate: '2025-04-05',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/llama-4-multimodal-intelligence/',
                coverImage: 'https://ai.meta.com/static-resource/630984946468726/',
                coverAlt: 'Llama 4 multimodal model announcement cover',
                coverFit: 'cover'
            },
            {
                id: 'smolvlm2-video-understanding',
                title: 'SmolVLM2: Bringing Video Understanding to Every Device',
                excerpt: 'Hugging Face releases SmolVLM2, compact video-language models designed for efficient video understanding on everyday hardware.',
                author: 'Orr Zohar, Miquel Farre, Andres Marafioti, merve, Pedro Cuenca, Cyril, Joshua',
                authorAvatar: 'https://cdn-avatars.huggingface.co/v1/production/uploads/6141a88b3a0ec78603c9e784/DJsxSmWV39M33JFheLobC.jpeg',
                category: 'Multimodal Model',
                tags: ['SmolVLM2', 'Video Understanding', 'Small VLM', 'On-device AI'],
                readTime: '14 min read',
                publishDate: '2025-02-20',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/smolvlm2',
                coverImage: 'https://huggingface.co/blog/assets/smolvlm2/banner.png',
                coverAlt: 'SmolVLM2 video understanding blog banner',
                coverFit: 'contain'
            },
            {
                id: 'runway-gwm-1',
                title: 'Introducing GWM-1',
                excerpt: 'Runway introduces GWM-1, a general world model family for real-time, action-conditioned simulation across worlds, avatars, and robotics.',
                author: 'Runway',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=128',
                category: 'World Model',
                tags: ['GWM-1', 'General World Model', 'Robotics', 'Interactive Simulation'],
                readTime: '18 min read',
                publishDate: '2025-12-11',
                sourceName: 'Runway Research',
                url: 'https://runwayml.com/research/introducing-runway-gwm-1',
                coverImage: 'https://d3phaj0sisr2ct.cloudfront.net/site/images/research/gwm/gwm-card-01.png',
                coverAlt: 'Runway GWM-1 general world model card',
                coverFit: 'cover'
            },
            {
                id: 'stable-diffusion-35',
                title: 'Introducing Stable Diffusion 3.5',
                excerpt: 'Stability AI releases Stable Diffusion 3.5 with Large, Large Turbo, and Medium variants for customizable, high-quality text-to-image generation.',
                author: 'Stability AI',
                authorAvatar: 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/4e38b1d7-350c-4fd8-ac08-114a3448f110/Stability-ai-logo-white-dot.png',
                category: 'Visual Generation',
                tags: ['Stable Diffusion 3.5', 'Text-to-Image', 'Open Model', 'Fine-tuning'],
                readTime: '7 min read',
                publishDate: '2024-10-22',
                sourceName: 'Stability AI',
                url: 'https://stability.ai/news-updates/introducing-stable-diffusion-3-5',
                coverImage: 'https://static1.squarespace.com/static/6213c340453c3f502425776e/62f2452bc121595f4d87c713/671f86f8e477be6c80f69262/1731166688018/blog_cover_sd3.5.jpg?format=1500w',
                coverAlt: 'Stable Diffusion 3.5 generated image cover',
                coverFit: 'cover'
            },
            {
                id: 'ray-314-video-generation',
                title: 'Ray3.14',
                excerpt: 'Luma releases Ray3.14 with native 1080p video generation, faster iteration, and lower cost for high-fidelity creative video workflows.',
                author: 'Luma AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=lumalabs.ai&sz=128',
                category: 'Visual Generation',
                tags: ['Ray3.14', 'Video Generation', '1080p', 'Dream Machine'],
                readTime: '6 min read',
                publishDate: '2026-02-18',
                sourceName: 'Luma',
                url: 'https://lumalabs.ai/news/ray3_14',
                coverImage: 'https://cdn.sanity.io/images/2ylxvaa2/production/7577adb1ed7cdd0833814a072eb4b17e9ab100bf-3840x2160.jpg?rect=0,72,3840,2016&w=1200&h=630&fm=jpg',
                coverAlt: 'Luma Ray3.14 generated video frame montage',
                coverFit: 'cover'
            },
            {
                id: 'sora-2',
                title: 'Sora 2 is here',
                excerpt: 'OpenAI releases Sora 2, a video-and-audio generation model focused on better physical accuracy, controllability, synchronized sound, and world simulation.',
                author: 'Sora Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Visual Generation',
                tags: ['Sora 2', 'Video Generation', 'Audio Generation', 'World Simulation'],
                readTime: '14 min read',
                publishDate: '2025-09-30',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/sora-2/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/28bcbcb2-563a-432b-df938802863b/5fff5e2602331f7682792f5f541c75f9/young-tiger.jpg?fm=webp&q=90&w=3840',
                coverAlt: 'Sora generated tiger scene',
                coverFit: 'cover'
            },
            {
                id: 'hunyuanworld-1',
                title: 'HunyuanWorld 1.0',
                excerpt: 'Tencent Hunyuan releases an open-source 3D scene generation system that turns text or image prompts into explorable 360-degree worlds.',
                author: 'Tencent Hunyuan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'World Model',
                tags: ['HunyuanWorld', '3D Generation', 'Scene Generation', 'Open Source'],
                readTime: '12 min read',
                publishDate: '2025-07-26',
                sourceName: 'GitHub',
                url: 'https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hunyuanworld/Tencent-Hunyuan/HunyuanWorld-1.0',
                coverAlt: 'HunyuanWorld 1.0 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'genie-3-world-model',
                title: 'Genie 3: A new frontier for world models',
                excerpt: 'Google DeepMind presents Genie 3, a general-purpose world model that generates interactive 720p environments in real time from text prompts.',
                author: 'Jack Parker-Holder, Shlomi Fruchter',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'World Model',
                tags: ['Genie 3', 'Interactive Worlds', 'Real-time Simulation', 'Agents'],
                readTime: '16 min read',
                publishDate: '2025-08-05',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/',
                coverImage: 'https://lh3.googleusercontent.com/MZsGi3QroEY4lNLxrQVBVpn_5NZDXMCKwXs8nStlzGvjS7p76pP-FjyyO-hrYuBhERc60C5-KosmVJFfITEYN7wx_cV94Wju48IyYRwQ39_DtRDU=w1200-h630-n-nu-rw',
                coverAlt: 'Genie 3 interactive world model hero image',
                coverFit: 'cover'
            },
            {
                id: 'seedance-1-video-generation',
                title: 'Tech report of Seedance 1.0 is now publicly available',
                excerpt: 'ByteDance Seed publishes the Seedance 1.0 report for a high-performance video foundation model supporting text-to-video and image-to-video generation.',
                author: 'ByteDance Seed Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=seed.bytedance.com&sz=128',
                category: 'Visual Generation',
                tags: ['Seedance', 'Video Generation', 'Image-to-Video', 'ByteDance'],
                readTime: '7 min read',
                publishDate: '2025-06-17',
                sourceName: 'ByteDance Seed',
                url: 'https://seed.bytedance.com/en/blog/tech-report-of-seedance-1-0-is-now-publicly-available',
                coverImage: 'https://lf3-static.bytednsdoc.com/obj/eden-cn/lapzild-tss/ljhwZthlaukjlkulzlp/user-upload/4og2ymbsyahe7.png',
                coverAlt: 'Seedance 1.0 technical report cover image',
                coverFit: 'cover'
            },
            {
                id: 'qwen25-omni',
                title: 'Qwen2.5 Omni: See, Hear, Talk, Write, Do It All!',
                excerpt: 'Qwen Team releases an end-to-end multimodal model for text, images, audio, and video, with real-time streaming text and speech responses.',
                author: 'Qwen Team',
                authorAvatar: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-vl-Capybara.png',
                category: 'Multimodal Model',
                tags: ['Qwen2.5-Omni', 'Omnimodal', 'Audio', 'Video Understanding'],
                readTime: '3 min read',
                publishDate: '2025-03-27',
                sourceName: 'Qwen Blog',
                url: 'https://qwenlm.github.io/blog/qwen2.5-omni/',
                coverImage: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-Omni/qwen_omni.png',
                coverAlt: 'Qwen2.5-Omni launch image',
                coverFit: 'cover'
            },
            {
                id: 'gemini-25-thinking',
                title: 'Gemini 2.5: Our most intelligent AI model',
                excerpt: 'Google introduces Gemini 2.5 Pro Experimental as a thinking model with stronger reasoning, coding, long-context, and multimodal capabilities.',
                author: 'Koray Kavukcuoglu',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Gemini 2.5', 'Thinking Model', 'Reasoning', 'Multimodal'],
                readTime: '9 min read',
                publishDate: '2025-03-25',
                sourceName: 'Google Blog',
                url: 'https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/2.5_keyword_social_share_text.width-1300.png',
                coverAlt: 'Gemini 2.5 announcement cover',
                coverFit: 'cover'
            },
            {
                id: 'mistral-small-31',
                title: 'Mistral Small 3.1',
                excerpt: 'Mistral AI releases a lightweight Apache 2.0 model with improved text performance, multimodal understanding, and a 128k context window.',
                author: 'Mistral AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Mistral Small 3.1', 'Vision Understanding', 'Open Model', '128k Context'],
                readTime: '10 min read',
                publishDate: '2025-03-17',
                sourceName: 'Mistral AI',
                url: 'https://mistral.ai/news/mistral-small-3-1',
                coverImage: 'https://cms.mistral.ai/assets/1977a3f1-eae3-4eed-b2c7-e1701c4692ed.png?width=1988&height=1050',
                coverAlt: 'Mistral Small 3.1 performance graphic',
                coverFit: 'contain'
            },
            {
                id: 'wan-21-video-generation',
                title: 'Wan2.1: Open and Advanced Large-Scale Video Generative Models',
                excerpt: 'The Wan team open-sources a large-scale video generation suite supporting text-to-video, image-to-video, bilingual prompts, and efficient deployment.',
                author: 'Wan Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['Wan2.1', 'Text-to-Video', 'Image-to-Video', 'Open Source'],
                readTime: '14 min read',
                publishDate: '2025-02-25',
                sourceName: 'GitHub',
                url: 'https://github.com/Wan-Video/Wan2.1',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-wan21/Wan-Video/Wan2.1',
                coverAlt: 'Wan2.1 repository preview',
                coverFit: 'cover'
            },
            {
                id: 'internvl3',
                title: 'InternVL3',
                excerpt: 'The InternVL team releases a stronger open-source multimodal model family with native multimodal pretraining and broad vision-language benchmarks.',
                author: 'OpenGVLab',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=internvl.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['InternVL3', 'Vision-Language', 'Open Source', 'Multimodal Benchmarks'],
                readTime: '16 min read',
                publishDate: '2025-04-11',
                sourceName: 'InternVL Blog',
                url: 'https://internvl.github.io/blog/2025-04-11-InternVL-3.0/',
                coverImage: 'https://internvl.github.io/blog/2025-04-11-InternVL-3.0/images/overview_performance.png',
                coverAlt: 'InternVL3 performance overview chart',
                coverFit: 'contain'
            },
            {
                id: 'kimi-vl',
                title: 'Kimi-VL: Mixture-of-Experts Vision-Language Model',
                excerpt: 'Moonshot AI releases Kimi-VL, an efficient open-source MoE vision-language model for multimodal reasoning, long-context understanding, and agent tasks.',
                author: 'Kimi Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=moonshot.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Kimi-VL', 'MoE', 'Long Context', 'Visual Reasoning'],
                readTime: '18 min read',
                publishDate: '2025-04-15',
                sourceName: 'GitHub',
                url: 'https://github.com/MoonshotAI/Kimi-VL',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-kimivl/MoonshotAI/Kimi-VL',
                coverAlt: 'Kimi-VL repository preview',
                coverFit: 'cover'
            },
            {
                id: 'hunyuanvideo',
                title: 'HunyuanVideo: A Systematic Framework For Large Video Generation Model',
                excerpt: 'Tencent Hunyuan releases an open-source video foundation model with a 13B-parameter architecture and strong text-to-video generation quality.',
                author: 'Tencent Hunyuan',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['HunyuanVideo', 'Open Source', 'Video Foundation Model', 'DiT'],
                readTime: '15 min read',
                publishDate: '2024-12-03',
                sourceName: 'GitHub',
                url: 'https://github.com/Tencent-Hunyuan/HunyuanVideo',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-hunyuanvideo/Tencent-Hunyuan/HunyuanVideo',
                coverAlt: 'HunyuanVideo repository preview',
                coverFit: 'cover'
            },
            {
                id: 'runway-gen-45',
                title: 'Introducing Runway Gen-4.5',
                excerpt: 'Runway updates its frontier video generation stack with Gen-4.5, improving fidelity, physics, motion quality, native audio, and multi-shot editing.',
                author: 'Runway',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=128',
                category: 'Visual Generation',
                tags: ['Gen-4.5', 'Video Generation', 'Native Audio', 'Multi-shot Editing'],
                readTime: '11 min read',
                publishDate: '2025-12-01',
                sourceName: 'Runway Research',
                url: 'https://runwayml.com/research/introducing-runway-gen-4.5',
                coverImage: 'https://d3phaj0sisr2ct.cloudfront.net/site/images/research/gen/launch-post/card-gen-4.5.png',
                coverAlt: 'Runway Gen-4.5 card image',
                coverFit: 'cover'
            },
            {
                id: 'llama-32-vision',
                title: 'Llama 3.2: Revolutionizing edge AI and vision',
                excerpt: 'Meta introduces Llama 3.2 with lightweight text models and vision-capable 11B and 90B models for image reasoning and on-device applications.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Llama 3.2', 'Vision', 'Open Weights', 'Edge AI'],
                readTime: '12 min read',
                publishDate: '2024-09-25',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/llama-3-2-connect-2024-vision-edge-mobile-devices/',
                coverImage: 'https://scontent-hkg1-2.xx.fbcdn.net/v/t39.2365-6/490739250_3984071921832434_899336421867772992_n.png?_nc_cat=103&ccb=1-7&_nc_sid=aa6a2f&_nc_ohc=ONP8xN3lW30Q7kNvwHYHOjW&_nc_oc=AdrGbiyZ4MmToWaLoK0VAZrmuVRUYs5gHkCO15Whrsz-v5wHuajMoB8fYqKzbu-3eK8&_nc_zt=14&_nc_ht=scontent-hkg1-2.xx&_nc_gid=-2x-If1rNltvof1EbN4iQw&_nc_ss=7b289&oh=00_Af7Ec8TlKhN7kvpdnbguB4iQ90FA7FxCqzT-IDhTPHphag&oe=6A13913A',
                coverAlt: 'Meta Llama official visual',
                coverFit: 'cover'
            },
            {
                id: 'recraft-v3',
                title: 'Recraft introduces a revolutionary AI model that thinks in design language',
                excerpt: 'Recraft announces Recraft V3, a design-focused image generation model for high-quality visuals, vector-style assets, and accurate in-image text.',
                author: 'Recraft',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=recraft.ai&sz=128',
                category: 'Visual Generation',
                tags: ['Recraft V3', 'Image Generation', 'Design', 'Text Rendering'],
                readTime: '7 min read',
                publishDate: '2024-10-30',
                sourceName: 'Recraft Blog',
                url: 'https://www.recraft.ai/blog/recraft-introduces-a-revolutionary-ai-model-that-thinks-in-design-language',
                coverImage: 'https://cdn.prod.website-files.com/655741af3f04e006606d26ad/6722a4e02cb3fd04911494e0_jpg-16.webp',
                coverAlt: 'Recraft V3 generated design examples',
                coverFit: 'cover'
            },
            {
                id: 'waymo-world-model',
                title: 'The Waymo World Model: A New Frontier For Autonomous Driving Simulation',
                excerpt: 'Waymo introduces a Genie 3-based world model that generates hyper-realistic, controllable multi-sensor driving simulations for rare edge cases.',
                author: 'Chiyu Max Jiang, Xander Masotto, Bo Sun',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=waymo.com&sz=128',
                category: 'World Model',
                tags: ['Autonomous Driving', 'Simulation', 'Genie 3', 'Multi-sensor'],
                readTime: '10 min read',
                publishDate: '2026-02-06',
                sourceName: 'Waypoint',
                url: 'https://waymo.com/blog/2026/02/the-waymo-world-model-a-new-frontier-for-autonomous-driving-simulation/',
                coverImage: 'https://lh3.googleusercontent.com/pcL3e60qMHH67WyyOeA1d-8Tjx2B4kwe90bpyvAyWOgf8Clb40mPxyjhpSAaH1ZsJzvtOxhU-eMYvfy5G_YYPYyGvRmRYlLHxOs%3De365-s420',
                coverAlt: 'Waymo World Model share image',
                coverFit: 'contain'
            },
            {
                id: 'v-jepa-2-world-model',
                title: 'Introducing the V-JEPA 2 world model and new benchmarks for physical reasoning',
                excerpt: 'Meta presents a self-supervised video world model for understanding, prediction, planning, and zero-shot robot control in unfamiliar environments.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'World Model',
                tags: ['V-JEPA 2', 'Physical Reasoning', 'Robot Planning', 'Video'],
                readTime: '15 min read',
                publishDate: '2025-06-11',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/v-jepa-2-world-model-benchmarks/',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-vjepa2/facebookresearch/vjepa2',
                coverAlt: 'V-JEPA 2 repository preview card',
                coverFit: 'cover'
            },
            {
                id: 'sora-world-simulators',
                title: 'Video generation models as world simulators',
                excerpt: 'OpenAI\'s Sora technical report frames large-scale video generation as a route toward general-purpose simulators of physical and digital worlds.',
                author: 'Tim Brooks, Bill Peebles, Connor Holmes et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'World Model',
                tags: ['Sora', 'World Simulators', 'Video Diffusion', 'DiT'],
                readTime: '25 min read',
                publishDate: '2024-02-15',
                sourceName: 'OpenAI Research',
                url: 'https://openai.com/index/video-generation-models-as-world-simulators/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/28bcbcb2-563a-432b-df938802863b/5fff5e2602331f7682792f5f541c75f9/young-tiger.jpg?fm=webp&q=90&w=3840',
                coverAlt: 'Sora-generated young tiger scene from OpenAI world simulators report',
                coverFit: 'cover'
            },
            {
                id: 'openai-4o-image-generation',
                title: 'Introducing 4o Image Generation',
                excerpt: 'OpenAI details native image generation in GPT-4o, emphasizing precise instruction following, photorealism, text rendering, and multimodal editing.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Visual Generation',
                tags: ['GPT-4o', 'Image Generation', 'Editing', 'Multimodal'],
                readTime: '12 min read',
                publishDate: '2025-03-25',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/introducing-4o-image-generation/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/5msykBd6Wu5mBcTgoqeJkj/4481c11698ff69f3d44d4c6220fade12/hero_image_1-whiteboard1.png?fm=webp&q=90&w=1920',
                coverAlt: 'GPT-4o image generation whiteboard example',
                coverFit: 'cover'
            },
            {
                id: 'sora-creating-video-from-text',
                title: 'Creating video from text',
                excerpt: 'OpenAI introduces Sora as a text-to-video model that can generate up to one-minute videos with strong prompt adherence and scene consistency.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Visual Generation',
                tags: ['Sora', 'Text-to-Video', 'Video Generation', 'Simulation'],
                readTime: '12 min read',
                publishDate: '2024-02-15',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/sora/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/1d2955dd-9d05-4f33-13073dc9301d/8dc0bae8cb98054d083ab3cc3ade6859/figure-patches.png?fm=webp&q=90&w=3840',
                coverAlt: 'Sora visual patch representation diagram',
                coverFit: 'contain'
            },
            {
                id: 'runway-gen-4',
                title: 'Runway Gen-4: AI Video Generation with World Consistency',
                excerpt: 'Runway presents Gen-4 as a media-generation model focused on consistent characters, locations, objects, and coherent world environments across shots.',
                author: 'Runway',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=runwayml.com&sz=128',
                category: 'Visual Generation',
                tags: ['Video Generation', 'World Consistency', 'Characters', 'Gen-4'],
                readTime: '9 min read',
                publishDate: '2025-03-31',
                sourceName: 'Runway Research',
                url: 'https://runwayml.com/research/introducing-runway-gen-4?source=dot-com-pricing',
                coverImage: 'https://d3phaj0sisr2ct.cloudfront.net/site/content/videos/RW_HEADER_V2-1.webp',
                coverAlt: 'Runway Gen-4 generated bridge scene',
                coverFit: 'cover'
            },
            {
                id: 'flux-kontext',
                title: 'Introducing FLUX.1 Kontext and the BFL Playground',
                excerpt: 'Black Forest Labs expands FLUX into in-context image generation and editing, supporting text and reference-image prompts with strong consistency.',
                author: 'Black Forest Labs',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=bfl.ai&sz=128',
                category: 'Visual Generation',
                tags: ['FLUX.1 Kontext', 'Image Editing', 'In-context Generation', 'Flow Matching'],
                readTime: '8 min read',
                publishDate: '2025-05-29',
                sourceName: 'Black Forest Labs',
                url: 'https://bfl.ai/blog/flux-1-kontext',
                coverImage: 'https://bfl.ai/_next/image?q=75&url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F2gpum2i6%2Fproduction%2F7cbc165ab8bac7622bb66764d6ce861711c664db-930x820.jpg&w=3840',
                coverAlt: 'FLUX.1 Kontext image generation and editing example',
                coverFit: 'cover'
            },
            {
                id: 'veo-3-imagen-4',
                title: 'Fuel your creativity with new generative media models and tools',
                excerpt: 'Google introduces Veo 3, Imagen 4, and Flow, bringing native audio-capable video generation and higher-quality image generation to creator workflows.',
                author: 'Eli Collins, Douglas Eck',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Veo 3', 'Imagen 4', 'Flow', 'Generative Media'],
                readTime: '10 min read',
                publishDate: '2025-05-20',
                sourceName: 'Google Blog',
                url: 'https://blog.google/innovation-and-ai/products/generative-media-models-io-2025/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/wm_us_extra_batch_16_05_2015_11.png',
                coverAlt: 'Imagen 4 whale generated in a city street',
                coverFit: 'cover'
            },
            {
                id: 'mochi-1-open-video',
                title: 'Mochi 1: A new SOTA in open text-to-video',
                excerpt: 'Genmo releases Mochi 1, an open text-to-video model with strong motion quality, prompt adherence, and an Apache-2.0-friendly open-source stack.',
                author: 'Genmo Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=genmo.ai&sz=128',
                category: 'Visual Generation',
                tags: ['Mochi 1', 'Open Source', 'Text-to-Video', 'AsymmDiT'],
                readTime: '8 min read',
                publishDate: '2025-09-10',
                sourceName: 'Genmo Blog',
                url: 'https://www.genmo.ai/blog/mochi-1-a-new-sota-in-open-text-to-video',
                coverImage: 'https://cdn.sanity.io/images/xp1wg7i7/production/931af0f93daac28e549afe19d602834d113318e6-1730x972.png',
                coverAlt: 'Mochi 1 generated snow landscape frame',
                coverFit: 'cover'
            },
            {
                id: 'qwen25-vl',
                title: 'Qwen2.5 VL! Qwen2.5 VL! Qwen2.5 VL!',
                excerpt: 'Qwen Team introduces its flagship vision-language model with document understanding, long-video comprehension, localization, and visual-agent capabilities.',
                author: 'Qwen Team',
                authorAvatar: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-vl-Capybara.png',
                category: 'Multimodal Model',
                tags: ['Qwen2.5-VL', 'Vision-Language', 'Document Understanding', 'Visual Agent'],
                readTime: '21 min read',
                publishDate: '2025-01-26',
                sourceName: 'Qwen Blog',
                url: 'https://qwenlm.github.io/blog/qwen2.5-vl/',
                coverImage: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen2.5-vl-Capybara.png',
                coverAlt: 'Qwen2.5-VL launch illustration',
                coverFit: 'cover'
            },
            {
                id: 'paligemma-2-mix',
                title: 'Introducing PaliGemma 2 mix: A vision-language model for multiple tasks',
                excerpt: 'Google introduces PaliGemma 2 mix checkpoints for captioning, OCR, question answering, detection, and segmentation across compact model sizes.',
                author: 'Omar Sanseviero, Andreas Steiner',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['PaliGemma 2', 'VLM', 'OCR', 'Segmentation'],
                readTime: '9 min read',
                publishDate: '2025-02-19',
                sourceName: 'Google Developers Blog',
                url: 'https://developers.googleblog.com/en/introducing-paligemma-2-mix/',
                coverImage: 'https://storage.googleapis.com/gweb-developer-goog-blog-assets/images/Paligemma_2_mix.original.png',
                coverAlt: 'PaliGemma 2 mix launch image',
                coverFit: 'contain'
            },
            {
                id: 'gemma-3-multimodal',
                title: 'Gemma 3: Google\'s new open model based on Gemini 2.0',
                excerpt: 'Google releases Gemma 3 as a multimodal, multilingual, long-context open model family with image understanding and efficient deployment options.',
                author: 'Google',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Gemma 3', 'Open Model', 'Vision-Language', 'Long Context'],
                readTime: '9 min read',
                publishDate: '2025-03-12',
                sourceName: 'Google Blog',
                url: 'https://blog.google/innovation-and-ai/technology/developers-tools/gemma-3/',
                coverImage: 'https://storage.googleapis.com/gweb-cloudblog-publish/images/gemma_3_hero.max-2500x2500.png',
                coverAlt: 'Gemma 3 multimodal open model hero image',
                coverFit: 'cover'
            },
            {
                id: 'siglip-2',
                title: 'SigLIP 2: A better multilingual vision language encoder',
                excerpt: 'A Hugging Face walkthrough of Google\'s SigLIP 2 vision-language encoders, covering multilingual retrieval, localization, dense features, and VLM use.',
                author: 'Aritra Roy Gosthipaty, merve, Pavel Iakubovskii',
                authorAvatar: 'https://cdn-avatars.huggingface.co/v1/production/uploads/5e0eed1ffcf41d740b699666/jJnkTB9wsP4QBcIRZqZFD.jpeg',
                category: 'Multimodal Model',
                tags: ['SigLIP 2', 'Vision Encoder', 'Retrieval', 'Multilingual'],
                readTime: '14 min read',
                publishDate: '2025-02-21',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/siglip2',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-siglip2/google-research/big_vision',
                coverAlt: 'Google big_vision repository preview for SigLIP models',
                coverFit: 'cover'
            },
            {
                id: 'molmo-open-multimodal',
                title: 'Molmo: A family of open state-of-the-art multimodal AI models',
                excerpt: 'Ai2 releases Molmo and PixMo, emphasizing open weights, open data, pointing capabilities, and reproducible multimodal model building.',
                author: 'Ai2',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=allenai.org&sz=128',
                category: 'Multimodal Model',
                tags: ['Molmo', 'PixMo', 'Open Data', 'Pointing'],
                readTime: '16 min read',
                publishDate: '2024-09-25',
                sourceName: 'Ai2 Blog',
                url: 'https://allenai.org/blog/molmo',
                coverImage: 'https://www.datocms-assets.com/64837/1742032993-molmo-blog-average-scores-and-rating.jpg?fit=max&h=810&w=1550',
                coverAlt: 'Molmo benchmark score comparison chart',
                coverFit: 'contain'
            },
            {
                id: 'pixtral-12b',
                title: 'Announcing Pixtral 12B',
                excerpt: 'Mistral AI introduces Pixtral 12B, an open-weights multimodal model with variable image size support and strong instruction-following performance.',
                author: 'Mistral AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=mistral.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Pixtral', 'Mistral', 'Open Weights', 'Vision Encoder'],
                readTime: '11 min read',
                publishDate: '2024-09-11',
                sourceName: 'Mistral AI',
                url: 'https://mistral.ai/fr/news/pixtral-12b',
                coverImage: 'https://cms.mistral.ai/assets/9bf72e1d-928e-4fa7-a331-5391ebb508d1.png?height=584&width=1587',
                coverAlt: 'Pixtral 12B benchmark comparison chart',
                coverFit: 'contain'
            },
            {
                id: 'nvidia-cosmos-world-foundation-models',
                title: 'NVIDIA Makes Cosmos World Foundation Models Openly Available',
                excerpt: 'Ming-Yu Liu explains Cosmos, NVIDIA\'s world foundation model platform for physics-aware video generation, robotics, AV simulation, and synthetic data.',
                author: 'Ming-Yu Liu',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=blogs.nvidia.com&sz=128',
                category: 'World Model',
                tags: ['Cosmos', 'Physical AI', 'Robotics', 'Synthetic Data'],
                readTime: '8 min read',
                publishDate: '2025-01-06',
                sourceName: 'NVIDIA Blog',
                url: 'https://blogs.nvidia.com/blog/cosmos-world-foundation-models/',
                coverImage: 'https://blogs.nvidia.com/wp-content/uploads/2025/01/ces25-llm-promo-cosmos-dev-oss-blog-1280x680-1.jpg',
                coverAlt: 'NVIDIA Cosmos world foundation model examples',
                coverFit: 'cover'
            },
            {
                id: 'genie-2-world-model',
                title: 'Genie 2: A large-scale foundation world model',
                excerpt: 'Google DeepMind introduces Genie 2, a foundation world model for generating diverse action-controllable playable 3D environments from a prompt image.',
                author: 'Jack Parker-Holder, Philip Ball, Tim Rocktaschel et al.',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'World Model',
                tags: ['Genie 2', 'Embodied Agents', 'Interactive Worlds', '3D'],
                readTime: '18 min read',
                publishDate: '2024-12-04',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/genie-2-a-large-scale-foundation-world-model/',
                coverImage: 'https://lh3.googleusercontent.com/FwJB_saDZH_jEO4tDEzJEV-RJxjzAN1Kav7WFuhKIO3V2x5J7L1B1lLl2IL1hBLohbvgKqewZkHQbmo1mOvm1pX8eBXWPfq9FVAwl6E_kb-6tTM7%3Dw1440-h810-n-nu',
                coverAlt: 'Genie 2 interactive world model collage',
                coverFit: 'cover'
            },
            {
                id: 'genie-generative-interactive-environments',
                title: 'Genie: Generative Interactive Environments',
                excerpt: 'Google DeepMind introduces Genie, an unsupervised generative interactive environment model that turns images into controllable playable worlds.',
                author: 'Ashley Edwards, Tim Rocktaschel, Jack Parker-Holder et al.',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'World Model',
                tags: ['Genie', 'Interactive Environments', 'Unsupervised Learning', 'Agents'],
                readTime: '16 min read',
                publishDate: '2024-02-23',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/research/publications/genie-generative-interactive-environments/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/image_bIiabui.max-244x184.format-webp.webp',
                coverAlt: 'Project Genie interactive environment image',
                coverFit: 'cover'
            },
            {
                id: 'gaia-1-scaling',
                title: 'Scaling GAIA-1: 9-billion parameter generative world model for autonomous driving',
                excerpt: 'Wayve scales GAIA-1 into a 9B-parameter multimodal world model that generates controllable driving video from video, text, and action prompts.',
                author: 'Wayve',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=wayve.ai&sz=128',
                category: 'World Model',
                tags: ['GAIA-1', 'Autonomous Driving', 'World Model', 'Simulation'],
                readTime: '15 min read',
                publishDate: '2023-10-03',
                sourceName: 'Wayve',
                url: 'https://wayve.ai/thinking/scaling-gaia-1/',
                coverImage: 'https://wayve.ai/wp-content/uploads/2023/09/Wayve-GAIA-1-Tech-Blog-Header-1920x1080.jpg',
                coverAlt: 'GAIA-1 driving-scene montage',
                coverFit: 'cover'
            },
            {
                id: 'clip-connecting-text-images',
                title: 'CLIP: Connecting text and images',
                excerpt: 'The landmark OpenAI article introducing CLIP, a contrastive pretraining approach that learns visual concepts from natural language supervision.',
                author: 'Alec Radford, Ilya Sutskever, Jong Wook Kim, Gretchen Krueger, Sandhini Agarwal',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Multimodal Model',
                tags: ['CLIP', 'Contrastive Learning', 'Zero-shot', 'Vision-Language'],
                readTime: '18 min read',
                publishDate: '2021-01-05',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/clip/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/5e490f66-703f-4228-221ca64049ed/8ed4358ba4b9f8779e07a2b15d7256e1/image_125.png?fm=webp&q=90&w=3840',
                coverAlt: 'CLIP contrastive image-text training illustration',
                coverFit: 'cover'
            },
            {
                id: 'blip-2',
                title: 'BLIP-2: Scalable Pre-training of Multimodal Foundation Models',
                excerpt: 'Salesforce AI Research explains BLIP-2, a compute-efficient bridge between frozen vision encoders and frozen language models for image-to-text tasks.',
                author: 'Junnan Li, Steven Hoi, Dongxu Li',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=salesforce.com&sz=128',
                category: 'Multimodal Model',
                tags: ['BLIP-2', 'Q-Former', 'Vision-Language', 'Open Source'],
                readTime: '5 min read',
                publishDate: '2023-03-17',
                sourceName: 'Salesforce Blog',
                url: 'https://www.salesforce.com/blog/blip-2/',
                coverImage: 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/blip-2/q-former-1.png',
                coverAlt: 'BLIP-2 Q-Former architecture diagram',
                coverFit: 'contain'
            },
            {
                id: 'stable-diffusion-3-medium',
                title: 'Announcing the Open Release of Stable Diffusion 3 Medium',
                excerpt: 'Stability AI releases SD3 Medium, a 2B-parameter text-to-image model aimed at stronger prompt understanding, typography, photorealism, and fine-tuning.',
                author: 'Joshua Lopez',
                authorAvatar: 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/4e38b1d7-350c-4fd8-ac08-114a3448f110/Stability-ai-logo-white-dot.png',
                category: 'Visual Generation',
                tags: ['Stable Diffusion', 'SD3', 'Text-to-Image', 'Open Model'],
                readTime: '7 min read',
                publishDate: '2024-06-12',
                sourceName: 'Stability AI',
                url: 'https://stability.ai/news-updates/stable-diffusion-3-medium',
                coverImage: 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/ffc6a51a-ee29-4ac3-89bc-6907bbc6b2c6/blog_post.jpg',
                coverAlt: 'Stable Diffusion 3 Medium image generation examples',
                coverFit: 'contain'
            },
            {
                id: 'flux-1',
                title: 'Announcing Black Forest Labs',
                excerpt: 'Black Forest Labs launches with FLUX.1, a suite of text-to-image models focused on prompt adherence, visual quality, typography, and open-weight access.',
                author: 'Black Forest Labs',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=bfl.ai&sz=128',
                category: 'Visual Generation',
                tags: ['FLUX.1', 'Text-to-Image', 'Open Weights', 'Flow Matching'],
                readTime: '10 min read',
                publishDate: '2024-08-01',
                sourceName: 'Black Forest Labs',
                url: 'https://bfl.ai/blog/24-08-01-bfl',
                coverImage: 'https://bfl.ai/_next/image?q=75&url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F2gpum2i6%2Fproduction%2F2ed20c790a271e072a5f0427e2f8802e844d5c7d-1360x768.webp&w=3840',
                coverAlt: 'Black Forest Labs launch forest cover',
                coverFit: 'cover'
            },
            {
                id: 'veo-imagen-3',
                title: 'New generative media models and tools, built with and for creators',
                excerpt: 'Google introduces Veo for high-definition video generation and Imagen 3 for higher-quality text-to-image generation, with creator-focused workflows.',
                author: 'Eli Collins, Douglas Eck',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Veo', 'Imagen 3', 'Video Generation', 'Text-to-Image'],
                readTime: '9 min read',
                publishDate: '2024-05-14',
                sourceName: 'Google Blog',
                url: 'https://blog.google/innovation-and-ai/products/google-generative-ai-veo-imagen-3/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/images/IO24_Gen_Media_Header.width-200.format-webp.webp',
                coverAlt: 'Google generative media models cover',
                coverFit: 'cover'
            },
            {
                id: 'vlms-explained',
                title: 'Vision Language Models Explained',
                excerpt: 'A practical guide to modern vision-language models, their capabilities, benchmarks, and fine-tuning workflows.',
                author: 'merve, Edward Beeching',
                authorAvatar: 'https://cdn-avatars.huggingface.co/v1/production/uploads/6141a88b3a0ec78603c9e784/DJsxSmWV39M33JFheLobC.jpeg',
                category: 'Multimodal Model',
                tags: ['VLM', 'Vision-Language', 'Fine-tuning', 'Benchmarks'],
                readTime: '14 min read',
                publishDate: '2024-04-11',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/vlms',
                coverImage: 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/vlm/visual.jpg',
                coverAlt: 'Diagram of vision-language model capabilities',
                coverFit: 'contain'
            },
            {
                id: 'vision-language-pretraining',
                title: 'A Dive into Vision-Language Models',
                excerpt: 'A clear tour through contrastive learning, PrefixLM, fusion strategies, datasets, and Transformer support for VLMs.',
                author: 'Alara Dirik, Sayak Paul',
                authorAvatar: 'https://cdn-avatars.huggingface.co/v1/production/uploads/1678118185856-629dffc1efe7b818408189b0.jpeg',
                category: 'Multimodal Model',
                tags: ['Pretraining', 'CLIP', 'VQA', 'Transformers'],
                readTime: '18 min read',
                publishDate: '2023-02-03',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/vision_language_pretraining',
                coverImage: 'https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/blog/128_vision_language_pretraining/example1.png',
                coverAlt: 'Example of a vision-language model classification workflow',
                coverFit: 'contain'
            },
            {
                id: 'illustrated-stable-diffusion',
                title: 'The Illustrated Stable Diffusion',
                excerpt: 'Jay Alammar’s visual walkthrough of the text encoder, latent diffusion process, UNet, scheduler, and image decoder.',
                author: 'Jay Alammar',
                authorAvatar: 'https://avatars0.githubusercontent.com/u/1007956?s=460&v=4',
                category: 'Visual Generation',
                tags: ['Stable Diffusion', 'Latent Diffusion', 'Text-to-Image'],
                readTime: '22 min read',
                publishDate: '2022-10-04',
                sourceName: 'Jay Alammar',
                url: 'https://jalammar.github.io/illustrated-stable-diffusion/',
                coverImage: 'https://jalammar.github.io/images/stable-diffusion/stable-diffusion-text-to-image.png',
                coverAlt: 'Stable Diffusion text-to-image illustration',
                coverFit: 'contain'
            },
            {
                id: 'diffusion-models-lilian-weng',
                title: 'What are Diffusion Models?',
                excerpt: 'A deep Lilian Weng explainer on forward and reverse diffusion, conditioning, guidance, distillation, and architecture.',
                author: 'Lilian Weng',
                authorAvatar: 'https://avatars.githubusercontent.com/u/901179?v=4',
                category: 'Visual Generation',
                tags: ['Diffusion', 'DDPM', 'Guidance', 'Generative Models'],
                readTime: '31 min read',
                publishDate: '2021-07-11',
                sourceName: "Lil'Log",
                url: 'https://lilianweng.github.io/posts/2021-07-11-diffusion-models/',
                coverImage: 'https://lilianweng.github.io/posts/2021-07-11-diffusion-models/generative-overview.png',
                coverAlt: 'Overview diagram comparing GAN, VAE, flow-based, and diffusion models',
                coverFit: 'contain'
            },
            {
                id: 'annotated-diffusion',
                title: 'The Annotated Diffusion Model',
                excerpt: 'A code-first diffusion model walkthrough that implements DDPM step by step in PyTorch.',
                author: 'Niels Rogge, Kashif Rasul',
                authorAvatar: 'https://cdn-avatars.huggingface.co/v1/production/uploads/1608042047613-5f1158120c833276f61f1a84.jpeg',
                category: 'Visual Generation',
                tags: ['DDPM', 'PyTorch', 'Implementation', 'Tutorial'],
                readTime: '28 min read',
                publishDate: '2022-06-07',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/annotated-diffusion',
                coverImage: 'https://huggingface.co/blog/assets/78_annotated-diffusion/diffusion_figure.png',
                coverAlt: 'Diffusion probabilistic model diagram',
                coverFit: 'contain'
            },
            {
                id: 'world-models',
                title: 'World Models',
                excerpt: 'The classic interactive article asking whether agents can learn inside their own generated dream environments.',
                author: 'David Ha, Jürgen Schmidhuber',
                authorAvatar: 'https://avatars.githubusercontent.com/u/6318110?v=4',
                category: 'World Model',
                tags: ['Agents', 'Dream Environments', 'Model-Based RL'],
                readTime: '26 min read',
                publishDate: '2018-03-27',
                sourceName: 'worldmodels.github.io',
                url: 'https://worldmodels.github.io/',
                coverImage: 'https://worldmodels.github.io/assets/cover_title.svg',
                coverAlt: 'World Models interactive article title graphic',
                coverFit: 'contain'
            },
            {
                id: 'grasp-world-models',
                title: 'Gradient-based Planning for World Models at Longer Horizons',
                excerpt: 'A BAIR article on GRASP, a planner designed to make long-horizon optimization through world models more robust.',
                author: 'Michael Psenka, Mike Rabbat, Aditi Krishnapriyan, Yann LeCun, Amir Bar',
                authorAvatar: 'https://www.michaelpsenka.io/images/profile.jpg',
                category: 'World Model',
                tags: ['Planning', 'Long-Horizon Control', 'GRASP'],
                readTime: '20 min read',
                publishDate: '2026-04-20',
                sourceName: 'BAIR Blog',
                url: 'https://bair.berkeley.edu/blog/2026/04/20/grasp/',
                coverImage: 'https://bair.berkeley.edu/static/blog/grasp/ballnav_demo.gif',
                coverAlt: 'BallNav world model planning demo',
                coverFit: 'cover'
            },
            {
                id: 'othello-world-models',
                title: 'Do Large Language Models learn world models or just surface statistics?',
                excerpt: 'A readable Gradient essay on Othello-GPT and whether sequence prediction can build an interpretable game-state model.',
                author: 'Kenneth Li',
                authorAvatar: 'https://thegradient.pub/content/images/size/w176/2023/01/IMG_1077.png',
                category: 'World Model',
                tags: ['Interpretability', 'Othello-GPT', 'LLM', 'World Models'],
                readTime: '15 min read',
                publishDate: '2023-01-21',
                sourceName: 'The Gradient',
                url: 'https://thegradient.pub/othello/',
                coverImage: 'https://thegradient.pub/content/images/size/w1600/2023/01/DALL-E-2022-12-05-10.28.34---remove-erased-ares-1.png',
                coverAlt: 'Othello world model article cover',
                coverFit: 'cover'
            },
            {
                id: 'hello-gpt-4o',
                title: 'Hello GPT-4o',
                excerpt: 'OpenAI introduces GPT-4o, an omni model that reasons across audio, vision, and text in real time with faster, more natural interaction.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Multimodal Model',
                tags: ['GPT-4o', 'Omnimodal', 'Audio', 'Real-time Interaction'],
                readTime: '12 min read',
                publishDate: '2024-05-13',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/hello-gpt-4o/',
                coverImage: 'https://cdn.openai.com/hello-gpt-4o/robot-writers-block-01.jpg?fm=webp&q=90&w=1200',
                coverAlt: 'GPT-4o visual narrative typewriter example',
                coverFit: 'cover'
            },
            {
                id: 'gemini-15-long-context',
                title: 'Our next-generation model: Gemini 1.5',
                excerpt: 'Google introduces Gemini 1.5 Pro with a mixture-of-experts architecture and breakthrough long-context multimodal understanding.',
                author: 'Sundar Pichai, Demis Hassabis',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Gemini 1.5', 'Long Context', 'MoE', 'Multimodal'],
                readTime: '13 min read',
                publishDate: '2024-02-15',
                sourceName: 'Google Blog',
                url: 'https://blog.google/innovation-and-ai/products/google-gemini-next-generation-model-february-2024/',
                coverImage: 'https://storage.googleapis.com/gweb-uniblog-publish-prod/original_images/final_gemini_1.5_blog_header_2096x1182-1.gif',
                coverAlt: 'Gemini 1.5 blue gradient announcement animation',
                coverFit: 'cover'
            },
            {
                id: 'palm-e-embodied-multimodal',
                title: 'PaLM-E: An embodied multimodal language model',
                excerpt: 'Google Research presents PaLM-E, a robotics-focused multimodal model that transfers visual and language knowledge into embodied planning.',
                author: 'Danny Driess, Pete Florence',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['PaLM-E', 'Embodied AI', 'Robotics', 'Vision-Language'],
                readTime: '16 min read',
                publishDate: '2023-03-10',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/palm-e-an-embodied-multimodal-language-model/',
                coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEi9Sc6PZ4Ebbi6Op6Lm3eYItsJJidxdqG7-zKZbRQ2L7_AKajgh7MLYybZZw3XHBvRro_GmGSOKjtyghhsNz8iXxBVODBLtbjesTkPo1lGzhwbLZVLT2k7W5QFdC2_C7no1cxeiDed75QJip1fTc9_FqKOBhGdK81pEyCzvZGfRgYji4Tvqbn2lFI2dqw/s700/PalmE-Lg.gif',
                coverAlt: 'PaLM-E embodied multimodal language model animation',
                coverFit: 'cover'
            },
            {
                id: 'rt-2-vision-language-action',
                title: 'RT-2: New model translates vision and language into action',
                excerpt: 'Google DeepMind explains RT-2, a vision-language-action model that transfers web-scale VLM knowledge into robotic control.',
                author: 'Yevgen Chebotar, Tianhe Yu',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['RT-2', 'VLA', 'Robotics', 'Action Models'],
                readTime: '15 min read',
                publishDate: '2023-07-28',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/rt-2-new-model-translates-vision-and-language-into-action/',
                coverImage: 'https://lh3.googleusercontent.com/hspU6wlYJlWD-KxCBjstU5_3dK7cuwyxMDhEOTWAjPBTpfnHvNXIZLdpcZi5ep3UnsfS98mIKilxb0pAWufFA6X_Ir2Q0x-Vl8dMMHsen_4GXam0%3Dw1440-h810-n-nu',
                coverAlt: 'RT-2 robot arm interacting with toy objects',
                coverFit: 'cover'
            },
            {
                id: 'flamingo-visual-language-model',
                title: 'Tackling multiple tasks with a single visual language model',
                excerpt: 'Google DeepMind introduces Flamingo, a few-shot visual language model that handles interleaved image, video, and text prompts.',
                author: 'Jean-Baptiste Alayrac, Jeff Donahue, Pauline Luc, Antoine Miech',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['Flamingo', 'Few-shot Learning', 'VLM', 'Image-Text'],
                readTime: '12 min read',
                publishDate: '2022-04-28',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/tackling-multiple-tasks-with-a-single-visual-language-model/',
                coverImage: 'https://lh3.googleusercontent.com/E1oZEKbbW_MEhJzI9mxe7abwYBfJGP6ybeXh2pBxz6QMIa6isNpBfNo7bO7YH0bMkDgTuUuASY8dN_J0Ye25r-xRh29-dRlTzoAu3PTPB0tY4zhWknc%3Dw1440-h810-n-nu',
                coverAlt: 'Flamingo visual language model benchmark overview',
                coverFit: 'contain'
            },
            {
                id: 'dalle-2',
                title: 'DALL-E 2',
                excerpt: 'OpenAI presents DALL-E 2, the text-to-image system that combined concepts, attributes, and styles into high-resolution generated imagery.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Visual Generation',
                tags: ['DALL-E 2', 'Text-to-Image', 'CLIP Latents', 'Diffusion'],
                readTime: '10 min read',
                publishDate: '2022-04-06',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/dall-e-2/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/5GOIjwbUjLZHoGhX6q5oQg/d2984681d2a9466b71b7ca7632a8481c/Anastronautridingahorseinaphotorealisticstyle0.jpg?fm=webp&q=90&w=3840',
                coverAlt: 'DALL-E 2 astronaut riding a horse generated image',
                coverFit: 'cover'
            },
            {
                id: 'imagen-text-to-image',
                title: 'Imagen: Text-to-Image Diffusion Models',
                excerpt: 'Google Research details Imagen, a cascaded diffusion model using large language encoders for photorealistic text-to-image generation.',
                author: 'Google Research, Brain Team',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Imagen', 'Text-to-Image', 'Diffusion', 'DrawBench'],
                readTime: '18 min read',
                publishDate: '2022-05-23',
                sourceName: 'Google Research',
                url: 'https://imagen.research.google/',
                coverImage: 'https://imagen.research.google/main_gallery_images/a-photo-of-a-corgi-dog-riding-a-bike-in-times-square.jpg',
                coverAlt: 'Imagen generated corgi riding a bike in Times Square',
                coverFit: 'cover'
            },
            {
                id: 'imagen-video',
                title: 'Imagen Video',
                excerpt: 'Google Research extends Imagen into high-definition text-conditioned video generation with cascaded spatial and temporal super-resolution.',
                author: 'Jonathan Ho, William Chan, Chitwan Saharia et al.',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Imagen Video', 'Text-to-Video', 'Diffusion', 'Super-Resolution'],
                readTime: '16 min read',
                publishDate: '2022-10-05',
                sourceName: 'Google Research',
                url: 'https://imagen.research.google/video/',
                coverImage: 'https://imagen.research.google/video/cdm-diagram.png',
                coverAlt: 'Imagen Video cascaded diffusion model diagram',
                coverFit: 'contain'
            },
            {
                id: 'videopoet-zero-shot-video',
                title: 'VideoPoet: A large language model for zero-shot video generation',
                excerpt: 'Google Research introduces VideoPoet, a language-model-based generator for text-to-video, image-to-video, stylization, editing, and video-to-audio.',
                author: 'Dan Kondratyuk, David Ross',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['VideoPoet', 'Video Generation', 'LLM', 'Video Editing'],
                readTime: '14 min read',
                publishDate: '2023-12-19',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/videopoet-a-large-language-model-for-zero-shot-video-generation/',
                coverImage: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjfgEjHPIukR1pHUT7VBU8DecJaayp8sIV1WC4HM6EOW-K1-E_Xu9-qE2hrTBrtgrks3awr8IiT9NhxVMDOR0qoFZ8nDQT_Si3LY60CWKySkaybXRW5Uf6EwZIiDRy7qkQGuoLUxoysR-fjEr0NTMqAGP2Cm8cyUQHVOOlS7MysnwHwqhdM-eA63PXy5XsV/s16000/image7.png',
                coverAlt: 'VideoPoet multimodal video generation workflow diagram',
                coverFit: 'contain'
            },
            {
                id: 'stable-video-diffusion',
                title: 'Introducing Stable Video Diffusion',
                excerpt: 'Stability AI releases Stable Video Diffusion, an open research preview for image-to-video generation based on Stable Diffusion.',
                author: 'Joshua Lopez',
                authorAvatar: 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/4e38b1d7-350c-4fd8-ac08-114a3448f110/Stability-ai-logo-white-dot.png',
                category: 'Visual Generation',
                tags: ['Stable Video Diffusion', 'Image-to-Video', 'Open Model', 'Video'],
                readTime: '7 min read',
                publishDate: '2023-11-21',
                sourceName: 'Stability AI',
                url: 'https://stability.ai/news-updates/stable-video-diffusion-open-ai-video-model',
                coverImage: 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/02e26394-e36b-4399-bacf-fea2bb26f6bd/Graph%2BSVD%2Bv%2BCompetition0.jpg',
                coverAlt: 'Stable Video Diffusion user preference comparison chart',
                coverFit: 'contain'
            },
            {
                id: 'muzero-learned-model-planning',
                title: 'MuZero: Mastering Go, chess, shogi and Atari without rules',
                excerpt: 'Google DeepMind explains MuZero, a model-based reinforcement learning system that learns environment dynamics useful for planning.',
                author: 'Julian Schrittwieser, Ioannis Antonoglou, Thomas Hubert et al.',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'World Model',
                tags: ['MuZero', 'Planning', 'Model-Based RL', 'Atari'],
                readTime: '14 min read',
                publishDate: '2020-12-23',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/muzero-mastering-go-chess-shogi-and-atari-without-rules/',
                coverImage: 'https://lh3.googleusercontent.com/RzqTH5NNeZa-DjuSsVtIApNCuqjmW7nLQWFdd4Ciy8snfgdQleEDkzFf3jGnxwXvrYppcCmm8wctTuSgPpTpy9WEbd7ndPK_NF2X2N-JZ8TNhJ-WS9I%3Dw1440-h810-n-nu',
                coverAlt: 'MuZero planning and game environment visualization',
                coverFit: 'cover'
            },
            {
                id: 'v-jepa-world-model',
                title: 'V-JEPA: The next step toward advanced machine intelligence',
                excerpt: 'Meta AI releases V-JEPA, a self-supervised video model that predicts abstract representations for grounded world understanding.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'World Model',
                tags: ['V-JEPA', 'Self-Supervised Video', 'Physical World Model', 'Planning'],
                readTime: '5 min read',
                publishDate: '2024-02-15',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/v-jepa-yann-lecun-ai-model-video-joint-embedding-predictive-architecture/',
                coverImage: 'https://opengraph.githubassets.com/blogxiv-vjepa/facebookresearch/jepa',
                coverAlt: 'V-JEPA official repository preview',
                coverFit: 'cover'
            },
            {
                id: 'sima-3d-virtual-environments',
                title: 'A generalist AI agent for 3D virtual environments',
                excerpt: 'Google DeepMind introduces SIMA, an instruction-following agent trained across varied 3D game worlds and research environments.',
                author: 'SIMA Team',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'AI Agents',
                tags: ['SIMA', '3D Worlds', 'Generalist Agents', 'Instruction Following'],
                readTime: '13 min read',
                publishDate: '2024-03-13',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/sima-generalist-ai-agent-for-3d-virtual-environments/',
                coverImage: 'https://lh3.googleusercontent.com/_8ZADLBCA8M1QTDULvkmYIXZSfRMZNNoddNkTTP3eT6Trc3tE2xEW6VgNBl_T1PaEMvFRocuMjsn2QJBSEvwA_wNr8Vl_6YPX3z59wZME3XyeY8upA%3Dw1440-h810-n-nu',
                coverAlt: 'SIMA agent acting in multiple 3D virtual environments',
                coverFit: 'cover'
            },
            {
                id: 'gato-generalist-agent',
                title: 'A Generalist Agent',
                excerpt: 'Google DeepMind presents Gato, a single multi-modal, multi-task, multi-embodiment policy for Atari, robotics, captioning, dialogue, and more.',
                author: 'DeepMind',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'AI Agents',
                tags: ['Gato', 'Generalist Agent', 'Multi-Task', 'Robotics'],
                readTime: '9 min read',
                publishDate: '2022-05-12',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/a-generalist-agent/',
                coverImage: 'https://lh3.googleusercontent.com/T0NXTmIR8b3kxzy_7tmN4DgluPggtpEb6HP6Pq2pH9PvtE7wMgmkbuJQKDgIAgRlo5YiXkdkX55YMGI77kZ2aAFzgtlMm_Ov3-b9wABFatqBmfY9BA%3Dw1440',
                coverAlt: 'Gato generalist agent task montage',
                coverFit: 'contain'
            },
            {
                id: 'open-ended-play-agents',
                title: 'Generally capable agents emerge from open-ended play',
                excerpt: 'Google DeepMind describes XLand and an open-ended training process that produces agents with zero-shot behavior across many 3D tasks.',
                author: 'Open-Ended Learning Team',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'AI Agents',
                tags: ['XLand', 'Open-Ended Learning', 'Agents', 'Zero-Shot'],
                readTime: '17 min read',
                publishDate: '2021-07-27',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/generally-capable-agents-emerge-from-open-ended-play/',
                coverImage: 'https://lh3.googleusercontent.com/lMNGvTNpmBJCpoDsF1O1p9oSgIPt-HSpVp6a7lCrmEJEv7h9kkq0eQT2TS51dwXnNRIFU-V-lWjtTq6mM7ZWmOzPvbkhVKilDOmYiHwmz-C8UF-56Q%3Dw1440-h810-n-nu',
                coverAlt: 'XLand open-ended play environment overview',
                coverFit: 'cover'
            },
            {
                id: 'claude-35-sonnet',
                title: 'Introducing Claude 3.5 Sonnet',
                excerpt: 'Anthropic introduces Claude 3.5 Sonnet, a faster frontier model with stronger reasoning, coding, chart interpretation, and vision performance.',
                author: 'Anthropic',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=anthropic.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Claude 3.5 Sonnet', 'Vision', 'Reasoning', 'Industry Model'],
                readTime: '8 min read',
                publishDate: '2024-06-20',
                sourceName: 'Anthropic',
                url: 'https://www.anthropic.com/news/claude-3-5-sonnet',
                coverImage: 'https://cdn.sanity.io/images/4zrzovbb/website/8a4eb6c412e5e7ffa38f07233344f4b7e6644994-2400x1200.png',
                coverAlt: 'Claude 3.5 Sonnet announcement visual',
                coverFit: 'cover'
            },
            {
                id: 'idefics2-vision-language-model',
                title: 'Introducing Idefics2: A Powerful 8B Vision-Language Model for the community',
                excerpt: 'Hugging Face releases Idefics2, an efficient open vision-language model with native resolution handling, OCR improvements, and Apache 2.0 access.',
                author: 'Hugging Face M4 Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Multimodal Model',
                tags: ['Idefics2', 'Open VLM', 'OCR', 'Apache 2.0'],
                readTime: '13 min read',
                publishDate: '2024-04-15',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/idefics2',
                coverImage: 'https://huggingface.co/blog/assets/idefics/thumbnail.png',
                coverAlt: 'Idefics vision-language model thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'paligemma-open-vlm',
                title: 'PaliGemma: Google\'s Cutting-Edge Open Vision Language Model',
                excerpt: 'A Hugging Face guide to Google PaliGemma, a compact open vision-language model family for captioning, VQA, detection-style prompts, and segmentation tasks.',
                author: 'Niels Rogge, Maria Khalusova, Vaibhav Srivastav',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=huggingface.co&sz=128',
                category: 'Multimodal Model',
                tags: ['PaliGemma', 'Gemma', 'Open VLM', 'Vision-Language'],
                readTime: '15 min read',
                publishDate: '2024-05-14',
                sourceName: 'Hugging Face Blog',
                url: 'https://huggingface.co/blog/paligemma',
                coverImage: 'https://huggingface.co/blog/assets/paligemma/Paligemma.png',
                coverAlt: 'PaliGemma open vision-language model diagram',
                coverFit: 'contain'
            },
            {
                id: 'florence-2-unified-vision',
                title: 'Florence-2: Advancing a Unified Representation for a Variety of Vision Tasks',
                excerpt: 'Microsoft presents Florence-2, a compact prompt-based vision foundation model for captioning, object detection, grounding, OCR, and segmentation.',
                author: 'Bin Xiao, Haiping Wu, Weijian Xu et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Florence-2', 'Vision Foundation Model', 'Grounding', 'OCR'],
                readTime: '12 min read',
                publishDate: '2024-06-19',
                sourceName: 'Microsoft Research',
                url: 'https://www.microsoft.com/en-us/research/publication/florence-2-advancing-a-unified-representation-for-a-variety-of-vision-tasks/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/microsoft/Florence-2-large.png',
                coverAlt: 'Florence-2 Hugging Face model preview',
                coverFit: 'cover'
            },
            {
                id: 'sam-2-video-segmentation',
                title: 'Our New AI Model Can Segment Anything - Even Video',
                excerpt: 'Meta introduces SAM 2, a unified promptable segmentation model for images and videos that tracks objects across frames in real time.',
                author: 'Meta',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=meta.com&sz=128',
                category: 'Multimodal Model',
                tags: ['SAM 2', 'Segmentation', 'Video', 'Computer Vision'],
                readTime: '7 min read',
                publishDate: '2024-07-29',
                sourceName: 'Meta Newsroom',
                url: 'https://about.fb.com/news/2024/07/our-new-ai-model-can-segment-video/',
                coverImage: 'https://about.fb.com/wp-content/uploads/2024/07/Segment-Anything-Video_Social-Share.png?w=1200',
                coverAlt: 'Segment Anything Model 2 video segmentation cover',
                coverFit: 'cover'
            },
            {
                id: 'chameleon-mixed-modal',
                title: 'Chameleon: Mixed-Modal Early-Fusion Foundation Models',
                excerpt: 'Meta FAIR releases Chameleon, an early-fusion family for reasoning over mixed sequences of text and images with unified tokenization.',
                author: 'Meta FAIR',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Chameleon', 'Early Fusion', 'Mixed-Modal', 'Meta FAIR'],
                readTime: '14 min read',
                publishDate: '2024-06-18',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/meta-fair-research-new-releases/',
                coverImage: 'https://scontent-nrt6-1.xx.fbcdn.net/v/t39.2365-6/448634060_4016786295310707_5516129316008434566_n.png?_nc_cat=110&ccb=1-7&_nc_sid=e280be&_nc_ohc=-S75yuzt5r0Q7kNvwG2U6X-&_nc_oc=AdqmM9yexGHSmabchZhv_5FHXAlZJKGyj-eDjRvziF027oEWTEe9uq1bsq4oR-OKzr0&_nc_zt=14&_nc_ht=scontent-nrt6-1.xx&_nc_gid=nZ5JDPKgPHjMzLS0Y4YxBg&_nc_ss=7f289&oh=00_Af71USkhCt_r-ZLbZkHk05C8dcsGY_3voPiQXCQpV-Ewcw&oe=6A282F5D',
                coverAlt: 'Meta FAIR research releases cover',
                coverFit: 'cover'
            },
            {
                id: 'make-a-video',
                title: 'Introducing Make-A-Video: An AI system that generates videos from text',
                excerpt: 'Meta AI presents Make-A-Video, an early text-to-video system that extends text-to-image generation with unlabeled video learning.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Visual Generation',
                tags: ['Make-A-Video', 'Text-to-Video', 'Meta AI', 'Generative Video'],
                readTime: '8 min read',
                publishDate: '2022-09-29',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/generative-ai-text-to-video/',
                coverImage: 'https://scontent-nrt1-2.xx.fbcdn.net/v/t39.2365-6/10000000_1088881125291048_1706268782379330012_n.gif?_nc_cat=102&ccb=1-7&_nc_sid=e280be&_nc_ohc=qQ3lP6sq8TQQ7kNvwEGJ_ns&_nc_oc=Ado8hgJtqSU9vx45UNkOzIcOzsfqv7zhymfdBQHVqbJwNpLm9sDSgM7XKMICNMqvRPM&_nc_zt=14&_nc_ht=scontent-nrt1-2.xx&_nc_gid=3z9ORAcG1qxpUwqy4KJ33w&_nc_ss=7f289&oh=00_Af5bdj_mTBEaW2MOy_2iHDKdqyRhHmqYvrw6BnUrkAUj9g&oe=6A284861',
                coverAlt: 'Make-A-Video generated video example',
                coverFit: 'cover'
            },
            {
                id: 'emu-video-emu-edit',
                title: 'Emu Video and Emu Edit: Our latest generative AI research milestones',
                excerpt: 'Meta AI shares two Emu research systems for factorized text-to-video generation and instruction-based image editing.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Visual Generation',
                tags: ['Emu Video', 'Emu Edit', 'Video Generation', 'Image Editing'],
                readTime: '9 min read',
                publishDate: '2023-11-16',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/emu-text-to-video-generation-image-editing-research/',
                coverImage: 'https://scontent-nrt1-1.xx.fbcdn.net/v/t39.2365-6/10000000_1347025125944262_3142385595352018522_n.gif?_nc_cat=103&ccb=1-7&_nc_sid=e280be&_nc_ohc=Fcmnp0al6CQQ7kNvwF7Qbug&_nc_oc=AdozeKFF3isDPw8--5FuO-J4O-wo6S43zv9oBGS1nUY2F7eFx3FmBB1Cnh0n4n5iTwQ&_nc_zt=14&_nc_ht=scontent-nrt1-1.xx&_nc_gid=0fz46m45e3hIZfXTH4pxzw&_nc_ss=7f289&oh=00_Af4HFAhZdnYdN5NiUG5Zzrvxjx9IHmnyzIy6mmiPABLA_A&oe=6A28121A',
                coverAlt: 'Emu Video and Emu Edit generated visual example',
                coverFit: 'cover'
            },
            {
                id: 'styledrop',
                title: 'StyleDrop: Text-to-image generation in any style',
                excerpt: 'Google Research explains StyleDrop, a method for adapting text-to-image generation to a chosen visual style from a small number of references.',
                author: 'Kihyuk Sohn, Dilip Krishnan',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['StyleDrop', 'Style Transfer', 'Text-to-Image', 'Muse'],
                readTime: '10 min read',
                publishDate: '2023-06-02',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/styledrop-text-to-image-generation-in-any-style/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/619381321f5302ec4938b5fefa6def7e-S.width-800.format-jpeg.jpg',
                coverAlt: 'StyleDrop text-to-image generation examples',
                coverFit: 'cover'
            },
            {
                id: 'sima-2-virtual-worlds',
                title: 'SIMA 2: An agent that plays, reasons, and learns with you in virtual 3D worlds',
                excerpt: 'Google DeepMind upgrades SIMA with Gemini-based reasoning, dialogue, and self-improvement inside complex 3D virtual environments.',
                author: 'SIMA Team',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'AI Agents',
                tags: ['SIMA 2', '3D Worlds', 'Agents', 'Self-Improvement'],
                readTime: '14 min read',
                publishDate: '2025-11-13',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/sima-2-an-agent-that-plays-reasons-and-learns-with-you-in-virtual-3d-worlds/',
                coverImage: 'https://lh3.googleusercontent.com/oqE253tRR_rEr401Wac7gVZfmQaaq6KNOq2G0eCmUh8IrSqvcs3miosBnxv5_kW72pUCt1v6CCkT_CVOz1WX3C0aU-yEQVglpr-JpVbkVxpBAS79=w1440-h810-n-nu',
                coverAlt: 'SIMA 2 agent in virtual 3D worlds',
                coverFit: 'cover'
            },
            {
                id: 'dreamerv2-discrete-world-models',
                title: 'Mastering Atari with Discrete World Models',
                excerpt: 'Google Research and collaborators introduce DreamerV2, a world-model agent that reaches human-level Atari performance by learning inside imagined latent trajectories.',
                author: 'Danijar Hafner, Timothy Lillicrap, Jimmy Ba, Mohammad Norouzi',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=danijar.com&sz=128',
                category: 'World Model',
                tags: ['DreamerV2', 'Atari', 'Discrete Latents', 'Model-Based RL'],
                readTime: '16 min read',
                publishDate: '2021-02-18',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/mastering-atari-with-discrete-world-models/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/ba557c97a565decb03a64e415c8f2d09-d.width-800.format-jpeg.jpg',
                coverAlt: 'DreamerV2 Atari world model illustration',
                coverFit: 'cover'
            },
            {
                id: 'robocat-self-improving-agent',
                title: 'RoboCat: A self-improving robotic agent',
                excerpt: 'Google DeepMind presents RoboCat, a generalist robotic manipulation agent that adapts to new tasks and robots from limited demonstrations.',
                author: 'RoboCat Team',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'AI Agents',
                tags: ['RoboCat', 'Robotics', 'Self-Improvement', 'Embodied AI'],
                readTime: '11 min read',
                publishDate: '2023-06-20',
                sourceName: 'Google DeepMind',
                url: 'https://deepmind.google/blog/robocat-a-self-improving-robotic-agent/',
                coverImage: 'https://lh3.googleusercontent.com/ew9YGuIkJ8UthCq-nWyz2URV712LNKBLncrk6SAAytuTVvuScKx4BoOhYIgvVSf7ErbaaRWIZis4UaDjUcezALyQb-WZqZHsKW-16U4NWljGvxbP=w1200-h630-n-nu-rw',
                coverAlt: 'RoboCat robotic arm research cover',
                coverFit: 'cover'
            },
            {
                id: 'pali-language-image-learning',
                title: 'PaLI: Scaling Language-Image Learning in 100+ Languages',
                excerpt: 'Google Research introduces PaLI, a jointly scaled multilingual vision-language model trained for captioning, VQA, OCR, and cross-lingual image understanding.',
                author: 'Google Research',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Multimodal Model',
                tags: ['PaLI', 'Vision-Language', 'Multilingual', 'VQA'],
                readTime: '11 min read',
                publishDate: '2022-09-14',
                sourceName: 'Google Research Blog',
                url: 'https://research.google/blog/pali-scaling-language-image-learning-in-100-languages/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/32b835460d990ff46edcacbc58c1a28a-L.width-800.format-jpeg.jpg',
                coverAlt: 'PaLI multilingual language-image learning examples',
                coverFit: 'cover'
            },
            {
                id: 'kosmos-1-multimodal-llm',
                title: 'Language Is Not All You Need: Aligning Perception with Language Models',
                excerpt: 'Microsoft Research presents KOSMOS-1, a multimodal large language model that aligns visual perception with language modeling and in-context learning.',
                author: 'Shaohan Huang, Li Dong, Wenhui Wang et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
                category: 'Multimodal Model',
                tags: ['KOSMOS-1', 'MLLM', 'Perception', 'In-Context Learning'],
                readTime: '18 min read',
                publishDate: '2023-03-02',
                sourceName: 'Microsoft Research',
                url: 'https://www.microsoft.com/en-us/research/publication/language-is-not-all-you-need-aligning-perception-with-language-models/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2302.14045.png',
                coverAlt: 'KOSMOS-1 paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'kosmos-2-grounded-multimodal',
                title: 'Kosmos-2: Grounding Multimodal Large Language Models to the World',
                excerpt: 'Microsoft Research extends KOSMOS with grounding, linking words to visual regions so multimodal models can refer, locate, and reason over objects.',
                author: 'Zhiliang Peng, Wenhui Wang, Li Dong et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128',
                category: 'Multimodal Model',
                tags: ['KOSMOS-2', 'Grounding', 'Referring', 'Multimodal LLM'],
                readTime: '17 min read',
                publishDate: '2023-07-05',
                sourceName: 'Microsoft Research',
                url: 'https://www.microsoft.com/en-us/research/publication/kosmos-2-grounding-multimodal-large-language-models-to-the-world/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/models/microsoft/kosmos-2-patch14-224.png',
                coverAlt: 'KOSMOS-2 grounded multimodal model thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'apple-mm1-multimodal-llm',
                title: 'MM1: Methods, Analysis & Insights from Multimodal LLM Pre-training',
                excerpt: 'Apple studies the recipe behind strong multimodal LLM pre-training, covering data mixtures, architecture choices, resolution, and instruction tuning.',
                author: 'Apple Machine Learning Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
                category: 'Multimodal Model',
                tags: ['MM1', 'Apple', 'Multimodal LLM', 'Pre-training'],
                readTime: '16 min read',
                publishDate: '2024-03-14',
                sourceName: 'Apple Machine Learning Research',
                url: 'https://machinelearning.apple.com/research/mm1-methods-analysis-insights',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2403.09611.png',
                coverAlt: 'MM1 multimodal LLM paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'apple-ferret-refer-ground',
                title: 'FERRET: Refer and Ground Anything Anywhere at Any Granularity',
                excerpt: 'Apple introduces FERRET, a multimodal model focused on referring and grounding across points, boxes, regions, and free-form visual queries.',
                author: 'Apple Machine Learning Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=apple.com&sz=128',
                category: 'Multimodal Model',
                tags: ['FERRET', 'Grounding', 'Referring', 'Apple'],
                readTime: '15 min read',
                publishDate: '2023-10-11',
                sourceName: 'Apple Machine Learning Research',
                url: 'https://machinelearning.apple.com/research/ferret',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2310.07704.png',
                coverAlt: 'FERRET refer and ground paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'segment-anything-model',
                title: 'Introducing Segment Anything: Working toward the first foundation model for image segmentation',
                excerpt: 'Meta AI releases SAM, a promptable segmentation model and large-scale mask dataset that became a foundation layer for many vision workflows.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'Multimodal Model',
                tags: ['SAM', 'Segmentation', 'Promptable Vision', 'Foundation Model'],
                readTime: '10 min read',
                publishDate: '2023-04-05',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/segment-anything-foundation-model-image-segmentation/',
                coverImage: 'https://scontent-nrt1-1.xx.fbcdn.net/v/t39.2365-6/338318848_238475658638014_6444534044370711549_n.gif?_nc_cat=108&ccb=1-7&_nc_sid=e280be&_nc_ohc=UWXbghbon84Q7kNvwHn_oFe&_nc_oc=AdosPPchCJzVkt8X7GmYJCd5baJOnewr2FWdudNYVJfKBJ_c2Y6RBWogv5QVxG0GBpY&_nc_zt=14&_nc_ht=scontent-nrt1-1.xx&_nc_gid=idpG5VRai3L8vl_OmiOHnQ&_nc_ss=7d289&oh=00_Af5ULlt1-0sqQNb25gdc5hX_CCStF3HxvghHYyvi5T3HLw&oe=6A284C29',
                coverAlt: 'Segment Anything Model promptable segmentation demo',
                coverFit: 'cover'
            },
            {
                id: 'fuyu-8b-multimodal',
                title: 'Fuyu-8B: A Multimodal Architecture for AI Agents',
                excerpt: 'Adept releases Fuyu-8B, a decoder-only multimodal model designed for digital agents, arbitrary image sizes, charts, diagrams, and UI understanding.',
                author: 'Adept AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=adept.ai&sz=128',
                category: 'Multimodal Model',
                tags: ['Fuyu-8B', 'Digital Agents', 'UI Understanding', 'Decoder-Only'],
                readTime: '12 min read',
                publishDate: '2023-10-17',
                sourceName: 'Hugging Face Model Card',
                url: 'https://huggingface.co/adept/fuyu-8b',
                coverImage: 'https://huggingface.co/adept/fuyu-8b/resolve/main/architecture.png',
                coverAlt: 'Fuyu-8B multimodal decoder-only architecture diagram',
                coverFit: 'contain'
            },
            {
                id: 'dalle-3-chatgpt',
                title: 'DALL-E 3 is now available in ChatGPT Plus and Enterprise',
                excerpt: 'OpenAI shares DALL-E 3 deployment details, improved prompt following, safety mitigations, provenance research, and ChatGPT-native image creation.',
                author: 'OpenAI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'Visual Generation',
                tags: ['DALL-E 3', 'Text-to-Image', 'ChatGPT', 'Safety'],
                readTime: '8 min read',
                publishDate: '2023-10-19',
                sourceName: 'OpenAI',
                url: 'https://openai.com/index/dall-e-3-is-now-available-in-chatgpt-plus-and-enterprise/',
                coverImage: 'https://images.ctfassets.net/kftzwdyauwt9/f698e023-3373-4385-a039a7370270/29fdcfdd52fe5cf2b38deff2af34648f/VALERIECloudAstronaut.png?fm=webp&q=90&w=3840',
                coverAlt: 'DALL-E 3 generated cloud astronaut illustration',
                coverFit: 'cover'
            },
            {
                id: 'sdxl-10-release',
                title: 'Announcing SDXL 1.0',
                excerpt: 'Stability AI releases SDXL 1.0, a major open text-to-image model focused on higher fidelity, richer composition, and stronger prompt adherence.',
                author: 'Stability AI',
                authorAvatar: 'https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/4e38b1d7-350c-4fd8-ac08-114a3448f110/Stability-ai-logo-white-dot.png',
                category: 'Visual Generation',
                tags: ['SDXL', 'Stable Diffusion', 'Open Model', 'Text-to-Image'],
                readTime: '7 min read',
                publishDate: '2023-07-26',
                sourceName: 'Stability AI',
                url: 'https://stability.ai/news-updates/stable-diffusion-sdxl-1-announcement',
                coverImage: 'http://static1.squarespace.com/static/6213c340453c3f502425776e/62f2452bc121595f4d87c713/64c107e267704273131739b6/1728899860281/SDXL+1.0+cover+image.png?format=1500w',
                coverAlt: 'Stable Diffusion XL 1.0 generated image cover',
                coverFit: 'cover'
            },
            {
                id: 'phenaki-text-to-video',
                title: 'Phenaki: Variable Length Video Generation from Open Domain Textual Description',
                excerpt: 'Google Research presents Phenaki, a model for generating longer coherent videos from sequences of text prompts using learned video tokens.',
                author: 'Ruben Villegas, Mohammad Babaeizadeh, Pieter-Jan Kindermans et al.',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Phenaki', 'Text-to-Video', 'Video Tokens', 'Long-Form Video'],
                readTime: '15 min read',
                publishDate: '2022-10-05',
                sourceName: 'Google Research',
                url: 'https://sites.research.google/phenaki/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/HO_previewImage1.width-800.format-jpeg.jpg',
                coverAlt: 'Phenaki text-to-video generated sequence preview',
                coverFit: 'cover'
            },
            {
                id: 'magic3d-text-to-3d',
                title: 'Magic3D: High-Resolution Text-to-3D Content Creation',
                excerpt: 'NVIDIA Research introduces a two-stage text-to-3D pipeline that improves geometry and texture quality for generated 3D assets.',
                author: 'NVIDIA Research',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=nvidia.com&sz=128',
                category: 'Visual Generation',
                tags: ['Magic3D', 'Text-to-3D', 'Neural Rendering', '3D Generation'],
                readTime: '17 min read',
                publishDate: '2022-11-18',
                sourceName: 'NVIDIA Research',
                url: 'https://research.nvidia.com/labs/cosmos-lab/magic3d/',
                coverImage: 'https://research.nvidia.com/labs/cosmos-lab/magic3d/assets/dreambooth/static1.png',
                coverAlt: 'Magic3D text-to-3D generated object examples',
                coverFit: 'cover'
            },
            {
                id: 'parti-text-to-image',
                title: 'Parti: Pathways Autoregressive Text-to-Image Model',
                excerpt: 'Google Research explores Parti, a large autoregressive text-to-image model that treats image generation as sequence modeling with rich prompts.',
                author: 'Jiahui Yu, Yuanzhong Xu, Jing Yu Koh et al.',
                authorAvatar: 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
                category: 'Visual Generation',
                tags: ['Parti', 'Autoregressive', 'Text-to-Image', 'Pathways'],
                readTime: '18 min read',
                publishDate: '2022-06-22',
                sourceName: 'Google Research',
                url: 'https://sites.research.google/parti/',
                coverImage: 'https://sites.research.google/parti/assets/parti_overview.jpg',
                coverAlt: 'Parti text-to-image model overview',
                coverFit: 'contain'
            },
            {
                id: 'efficientzero-limited-data',
                title: 'Mastering Atari Games with Limited Data',
                excerpt: 'EfficientZero improves sample-efficient model-based reinforcement learning by combining value-equivalent prediction, planning, and self-supervised consistency.',
                author: 'Weirui Ye, Shaohuai Liu, Thanard Kurutach et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'World Model',
                tags: ['EfficientZero', 'Atari', 'Sample Efficiency', 'Planning'],
                readTime: '17 min read',
                publishDate: '2021-10-06',
                sourceName: 'GitHub',
                url: 'https://github.com/YeWR/EfficientZero',
                coverImage: 'https://raw.githubusercontent.com/YeWR/EfficientZero/main/static/imgs/archi.png',
                coverAlt: 'EfficientZero architecture diagram',
                coverFit: 'contain'
            },
            {
                id: 'iris-transformer-world-models',
                title: 'Transformers are Sample-Efficient World Models',
                excerpt: 'IRIS trains a discrete autoencoder and autoregressive transformer world model to learn Atari behavior from compact trajectories.',
                author: 'Eloi Alonso, Adam Jelley, Vincent Micheli et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'World Model',
                tags: ['IRIS', 'Transformers', 'Atari', 'World Models'],
                readTime: '15 min read',
                publishDate: '2022-09-22',
                sourceName: 'GitHub',
                url: 'https://github.com/eloialonso/iris',
                coverImage: 'https://raw.githubusercontent.com/eloialonso/iris/main/assets/iris.gif',
                coverAlt: 'IRIS transformer world model Atari rollouts',
                coverFit: 'cover'
            },
            {
                id: 'i-jepa-human-like-ai',
                title: 'The first AI model based on Yann LeCun\'s vision for more human-like AI',
                excerpt: 'Meta AI introduces I-JEPA, a self-supervised predictive architecture that learns semantic image representations by predicting missing information abstractly.',
                author: 'Meta AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'World Model',
                tags: ['I-JEPA', 'Self-Supervised Learning', 'Predictive Architecture', 'Representation Learning'],
                readTime: '11 min read',
                publishDate: '2023-06-13',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/blog/yann-lecun-ai-model-i-jepa/',
                coverImage: 'https://scontent-nrt6-1.xx.fbcdn.net/v/t39.2365-6/346647059_274803261780859_1196556845912312321_n.png?_nc_cat=111&ccb=1-7&_nc_sid=e280be&_nc_ohc=YNn97pFdD_8Q7kNvwGah8ZJ&_nc_oc=AdpOP9rrb-Mkaq86h9BnbJvfrlvd4FY0boPhYH8cHR4NBLMIwacSroF-8BukVsKTNeU&_nc_zt=14&_nc_ht=scontent-nrt6-1.xx&_nc_gid=vpo8hJiib-tVkxdFy1wQfQ&_nc_ss=7d289&oh=00_Af7tJHKE14T-ELPpXFuSS3Dx1UPD5K3oxrSdg0CUYO8PAw&oe=6A282010',
                coverAlt: 'I-JEPA predictive architecture illustration',
                coverFit: 'cover'
            },
            {
                id: 'qwen-vl-visual-language',
                title: 'Introducing Qwen-VL',
                excerpt: 'Qwen-VL extends the Qwen family with unified multimodal pretraining, high-resolution image understanding, OCR, Chinese visual QA, and API-facing visual reasoning capabilities.',
                author: 'Qwen Team',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=qwenlm.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['Qwen-VL', 'OCR', 'Visual Reasoning', 'Multilingual'],
                readTime: '12 min read',
                publishDate: '2024-01-25',
                sourceName: 'Qwen Blog',
                url: 'https://qwenlm.github.io/blog/qwen-vl/',
                coverImage: 'https://qianwen-res.oss-accelerate-overseas.aliyuncs.com/Qwen-VL/blog/qwen_web.png',
                coverAlt: 'Qwen-VL web portal image understanding demo',
                coverFit: 'cover'
            },
            {
                id: 'cogvlm-visual-expert',
                title: 'CogVLM: Visual Expert for Pretrained Language Models',
                excerpt: 'CogVLM adds visual expert modules to pretrained language models, improving detailed image understanding, grounding, and multimodal dialogue across classic VLM benchmarks.',
                author: 'Weihan Wang, Qingsong Lv, Wenmeng Yu et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Multimodal Model',
                tags: ['CogVLM', 'Visual Expert', 'Grounding', 'Open Model'],
                readTime: '17 min read',
                publishDate: '2023-10-05',
                sourceName: 'GitHub',
                url: 'https://github.com/zai-org/CogVLM',
                coverImage: 'https://raw.githubusercontent.com/zai-org/CogVLM/main/assets/metrics-min.png',
                coverAlt: 'CogVLM benchmark metrics chart',
                coverFit: 'contain'
            },
            {
                id: 'llava-next-reasoning-ocr',
                title: 'LLaVA-NeXT: Improved reasoning, OCR, and world knowledge',
                excerpt: 'LLaVA-NeXT raises image resolution, improves OCR and visual reasoning data mixtures, and scales the LLaVA recipe toward stronger open multimodal assistants.',
                author: 'Haotian Liu, Chunyuan Li, Yuheng Li et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=llava-vl.github.io&sz=128',
                category: 'Multimodal Model',
                tags: ['LLaVA-NeXT', 'OCR', 'AnyRes', 'Open VLM'],
                readTime: '14 min read',
                publishDate: '2024-01-30',
                sourceName: 'LLaVA Blog',
                url: 'https://llava-vl.github.io/blog/2024-01-30-llava-next/',
                coverImage: 'https://llava-vl.github.io/blog/assets/images/llava-1-6/high_res_arch_v2.png',
                coverAlt: 'LLaVA-NeXT dynamic high-resolution scheme',
                coverFit: 'contain'
            },
            {
                id: 'screenai-ui-infographics',
                title: 'ScreenAI: A visual language model for UI and visually-situated language understanding',
                excerpt: 'Google Research presents ScreenAI, a vision-language model trained for user interfaces, screenshots, infographics, charts, and other visually situated text-heavy tasks.',
                author: 'Srinivas Sunkara, Gilles Baechler, David Xin et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.google&sz=128',
                category: 'Multimodal Model',
                tags: ['ScreenAI', 'UI Understanding', 'Screenshots', 'VLM'],
                readTime: '11 min read',
                publishDate: '2024-03-13',
                sourceName: 'Google Research',
                url: 'https://research.google/blog/screenai-a-visual-language-model-for-ui-and-visually-situated-language-understanding/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/HO_previewImage1.width-800.format-jpeg.jpg',
                coverAlt: 'ScreenAI visual language model preview image',
                coverFit: 'cover'
            },
            {
                id: 'donut-ocr-free-document-understanding',
                title: 'OCR-free Document Understanding Transformer',
                excerpt: 'Donut removes the external OCR dependency for document understanding by training an end-to-end Transformer to parse document images directly.',
                author: 'Geewook Kim, Teakgyu Hong, Moonbin Yim et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Multimodal Model',
                tags: ['Donut', 'Document AI', 'OCR-Free', 'Transformer'],
                readTime: '14 min read',
                publishDate: '2021-11-30',
                sourceName: 'GitHub',
                url: 'https://github.com/clovaai/donut',
                coverImage: 'https://raw.githubusercontent.com/clovaai/donut/master/misc/overview.png',
                coverAlt: 'Donut OCR-free document understanding overview',
                coverFit: 'contain'
            },
            {
                id: 'imagen-editor-editbench',
                title: 'Imagen Editor and EditBench: Advancing and evaluating text-guided image inpainting',
                excerpt: 'Google Research introduces Imagen Editor for text-guided image inpainting and EditBench, a systematic benchmark for measuring image editing faithfulness and quality.',
                author: 'Su Wang, Ceslee Montgomery, Jordi Pont-Tuset et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.google&sz=128',
                category: 'Visual Generation',
                tags: ['Imagen Editor', 'EditBench', 'Inpainting', 'Image Editing'],
                readTime: '12 min read',
                publishDate: '2023-07-13',
                sourceName: 'Google Research',
                url: 'https://research.google/blog/imagen-editor-and-editbench-advancing-and-evaluating-text-guided-image-inpainting/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/93a51c3ed61d57016c9174bd32ca2236-I.width-800.format-jpeg.jpg',
                coverAlt: 'Imagen Editor text-guided inpainting examples',
                coverFit: 'cover'
            },
            {
                id: 'ediff-i-ensemble-denoisers',
                title: 'eDiff-I: Text-to-Image Diffusion Models with Ensemble of Expert Denoisers',
                excerpt: 'NVIDIA eDiff-I decomposes text-to-image diffusion into expert denoisers and supports capabilities such as style transfer and paint-with-words spatial control.',
                author: 'Yogesh Balaji, Seungjun Nah, Xun Huang et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.nvidia.com&sz=128',
                category: 'Visual Generation',
                tags: ['eDiff-I', 'Text-to-Image', 'Denoising Experts', 'NVIDIA'],
                readTime: '16 min read',
                publishDate: '2022-11-02',
                sourceName: 'NVIDIA Research',
                url: 'https://research.nvidia.com/labs/cosmos-lab/ediff-i/',
                coverImage: 'https://research.nvidia.com/labs/cosmos-lab/ediff-i/assets/teaser/portal.jpg',
                coverAlt: 'eDiff-I generated portal in a mystic forest',
                coverFit: 'cover'
            },
            {
                id: 'deepfloyd-if-text-rendering',
                title: 'Stability AI releases DeepFloyd IF, a powerful text-to-image model',
                excerpt: 'DeepFloyd IF is a cascaded pixel-space diffusion model from Stability AI and DeepFloyd, notable for strong prompt following and unusually capable text rendering in generated images.',
                author: 'DeepFloyd Lab, Stability AI',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=stability.ai&sz=128',
                category: 'Visual Generation',
                tags: ['DeepFloyd IF', 'Text Rendering', 'Pixel Diffusion', 'Stability AI'],
                readTime: '10 min read',
                publishDate: '2023-04-28',
                sourceName: 'Stability AI',
                url: 'https://stability.ai/news-updates/deepfloyd-if-text-to-image-model',
                coverImage: 'https://static1.squarespace.com/static/6213c340453c3f502425776e/62f2452bc121595f4d87c713/644a5f45b214107b3d74eca5/1728899860281/Stability+AI+DeepFloyd+IF+Cat+Staring+At+Mirror.jpg?format=1500w',
                coverAlt: 'DeepFloyd IF generated cat looking into a mirror',
                coverFit: 'cover'
            },
            {
                id: 't2i-adapter-controllable-generation',
                title: 'T2I-Adapter: Learning Adapters to Dig out More Controllable Ability for Text-to-Image Diffusion Models',
                excerpt: 'T2I-Adapter adds lightweight condition adapters for controllable generation, including sketch, canny, depth, color, style, and pose guidance for diffusion models.',
                author: 'Chong Mou, Xintao Wang, Liangbin Xie et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
                category: 'Visual Generation',
                tags: ['T2I-Adapter', 'Control', 'Stable Diffusion', 'Adapters'],
                readTime: '13 min read',
                publishDate: '2023-02-15',
                sourceName: 'GitHub',
                url: 'https://github.com/TencentARC/T2I-Adapter',
                coverImage: 'https://huggingface.co/Adapter/t2iadapter/resolve/main/t_lineart.PNG',
                coverAlt: 'T2I-Adapter lineart-guided generation examples',
                coverFit: 'cover'
            },
            {
                id: 'openai-vpt-video-pretraining',
                title: 'Video PreTraining (VPT): Learning to Act by Watching Unlabeled Online Videos',
                excerpt: 'OpenAI VPT scales imitation learning to internet video by training an inverse dynamics model that labels Minecraft videos, then learning a broad behavioral prior from them.',
                author: 'Bowen Baker, Ilge Akkaya, Peter Zhokhov et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=openai.com&sz=128',
                category: 'AI Agents',
                tags: ['VPT', 'Minecraft', 'Imitation Learning', 'OpenAI'],
                readTime: '18 min read',
                publishDate: '2022-06-23',
                sourceName: 'OpenAI GitHub',
                url: 'https://github.com/openai/Video-Pre-Training',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2206.11795/gradient.png',
                coverAlt: 'VPT paper thumbnail',
                coverFit: 'cover'
            },
            {
                id: 'rt-1-robotics-transformer',
                title: 'RT-1: Robotics Transformer for real-world control at scale',
                excerpt: 'RT-1 trains a transformer policy on large-scale real robot data, showing how tokenized actions and multitask data can improve generalization in robotic control.',
                author: 'Anthony Brohan, Noah Brown, Justice Carbajal et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=research.google&sz=128',
                category: 'World Model',
                tags: ['RT-1', 'Robotics', 'Transformer', 'Control'],
                readTime: '13 min read',
                publishDate: '2022-12-13',
                sourceName: 'Google Research',
                url: 'https://research.google/blog/rt-1-robotics-transformer-for-real-world-control-at-scale/',
                coverImage: 'https://storage.googleapis.com/gweb-research2023-media/images/0650c2903aa0b805627c5aa7bac6be10-R.width-800.format-jpeg.jpg',
                coverAlt: 'RT-1 robot learning preview image',
                coverFit: 'cover'
            },
            {
                id: 'decision-transformer-sequence-rl',
                title: 'Decision Transformer: Reinforcement Learning via Sequence Modeling',
                excerpt: 'Decision Transformer reframes offline reinforcement learning as conditional sequence modeling, predicting actions from desired returns and previous trajectory tokens.',
                author: 'Lili Chen, Kevin Lu, Aravind Rajeswaran et al.',
                authorAvatar: 'https://www.google.com/s2/favicons?domain=ai.meta.com&sz=128',
                category: 'AI Agents',
                tags: ['Decision Transformer', 'Offline RL', 'Sequence Modeling', 'Agents'],
                readTime: '13 min read',
                publishDate: '2021-06-02',
                sourceName: 'Meta AI',
                url: 'https://ai.meta.com/research/publications/decision-transformer-reinforcement-learning-via-sequence-modeling/',
                coverImage: 'https://cdn-thumbnails.huggingface.co/social-thumbnails/papers/2106.01345/gradient.png',
                coverAlt: 'Decision Transformer paper thumbnail',
                coverFit: 'cover'
            }
        ];

        return blogs.map(blog => this.enhanceCuratedBlogCover(blog));
    }

    enhanceCuratedBlogCover(blog) {
        const genericCovers = new Set([
            'assets/img/covers/efficient-ai.svg',
            'assets/img/covers/foundation-model.svg',
            'assets/img/covers/llm-mllm.svg',
            'assets/img/covers/research-craft.svg',
            'assets/img/covers/world-model.svg'
        ]);

        if (!blog || !genericCovers.has(blog.coverImage)) {
            return blog;
        }

        const specificCover = this.getSpecificCoverForBlog(blog);
        if (!specificCover) {
            return blog;
        }

        return {
            ...blog,
            coverImage: specificCover.image,
            coverAlt: specificCover.alt,
            coverFit: 'cover'
        };
    }

    getSpecificCoverForBlog(blog) {
        const id = String(blog.id || '');
        const source = String(blog.sourceName || blog.author || '').toLowerCase();
        const url = String(blog.url || '').toLowerCase();

        const cover = (file, alt) => ({
            image: `assets/img/covers/${file}`,
            alt
        });

        if (id.includes('rdi-benchmark') || id.includes('benchmarks-broken')) {
            return cover('cover-rdi-benchmarks.svg', 'Agent benchmark audit cover');
        }

        if (id.startsWith('rdi-')) {
            return cover('cover-rdi-agents.svg', 'Agent systems cover');
        }

        if (id.includes('interconnects-open') || id.includes('state-open-models')) {
            return cover('cover-interconnects-open.svg', 'Open model ecosystem cover');
        }

        if (id.startsWith('interconnects-')) {
            return cover('cover-interconnects-reasoning.svg', 'Reasoning model analysis cover');
        }

        if (id.startsWith('hamel-') || id.includes('eugene-') || source.includes('hamel')) {
            return cover('cover-hamel-evals.svg', 'LLM evaluation cover');
        }

        if (id.startsWith('stanford-')) {
            return cover('cover-stanford-agents.svg', 'Stanford agent evaluation cover');
        }

        if (id === 'cmu-vlm-speak-cinema') {
            return cover('cover-cmu-vision.svg', 'Vision-language research cover');
        }

        if (id.includes('judge') || id.includes('rating-indeterminacy')) {
            return cover('cover-cmu-evals.svg', 'Judge validation cover');
        }

        if (id.startsWith('cmu-')) {
            return cover('cover-cmu-reasoning.svg', 'CMU reasoning and RL cover');
        }

        if (id.includes('coding-agent-components')) {
            return cover('cover-sebastian-agents.svg', 'Coding agent components cover');
        }

        if (id.includes('attention') || id.includes('kv-cache')) {
            return cover('cover-sebastian-systems.svg', 'LLM systems cover');
        }

        if (id.includes('architecture') || id.includes('deepseek-v32')) {
            return cover('cover-sebastian-architecture.svg', 'Model architecture cover');
        }

        if (id.startsWith('sebastian-')) {
            return cover('cover-independent-llm.svg', 'Independent LLM analysis cover');
        }

        if (id.includes('spaces-diffusion')) {
            return cover('cover-spaces-diffusion.svg', 'Diffusion geometry cover');
        }

        if (id.startsWith('spaces-')) {
            return cover('cover-spaces-optimization.svg', 'Optimization notes cover');
        }

        if (id.includes('lilian-diffusion')) {
            return cover('cover-lilian-video.svg', 'Video generation survey cover');
        }

        if (id.startsWith('lilian-') || source.includes("lil'log")) {
            return cover('cover-lilian-research.svg', 'Research survey cover');
        }

        if (id.startsWith('dao-') || source.includes('dao ai lab') || source.includes('tri dao')) {
            return cover('cover-dao-kernels.svg', 'Kernel systems cover');
        }

        if (id.startsWith('thinking-machines')) {
            return cover('cover-thinking-machines.svg', 'Interaction models cover');
        }

        if (id === 'mlm-agentic-programming-roadmap') {
            return cover('cover-mlm-roadmap.svg', 'Agent roadmap cover');
        }

        if (id === 'mlm-agentic-design-patterns') {
            return cover('cover-mlm-patterns.svg', 'Agent design patterns cover');
        }

        if (id === 'mlm-llm-observability-tools') {
            return cover('cover-mlm-observability.svg', 'LLM observability cover');
        }

        if (id === 'mlm-prompt-compression-agentic-costs') {
            return cover('cover-mlm-compression.svg', 'Prompt compression cover');
        }

        if (id.startsWith('mlm-') || source.includes('machine learning mastery')) {
            return cover('cover-mlm-agents.svg', 'Agent practice cover');
        }

        if (id.startsWith('xunhuang-')) {
            return cover('cover-xunhuang-world.svg', 'Video world model cover');
        }

        if (id.startsWith('jay-')) {
            return cover('cover-jay-r1.svg', 'Illustrated reasoning cover');
        }

        if (source.includes('simon willison') || source.includes('jeremy bernstein') || source.includes('keller jordan') || source.includes('jose david baena')) {
            return cover('cover-independent-llm.svg', 'Independent LLM analysis cover');
        }

        if (source.includes('openai') || source.includes('anthropic')) {
            return cover('cover-openai-anthropic.svg', 'Frontier lab notes cover');
        }

        if (source.includes('ai2') || source.includes('hugging face') || source.includes('meta ai') || source.includes('google blog')) {
            return cover('cover-open-training.svg', 'Open training cover');
        }

        if (url.includes('pytorch.org') || url.includes('vllm.ai') || url.includes('tridao.me') || id.includes('flexattention') || id.includes('flashattention')) {
            return cover('cover-dao-kernels.svg', 'Kernel systems cover');
        }

        return null;
    }

    async loadSampleBlogs() {
        const staticBlogs = this.getCuratedCommunityBlogs();
        const blogs = window.BlogXivData
            ? await window.BlogXivData.getPublishedBlogs(staticBlogs)
            : staticBlogs;

        this.blogs = [...blogs]
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        this.filteredBlogs = [...this.blogs];
        this.populateSearchFilterOptions();
    }

    applyInitialUrlFilters() {
        const params = new URLSearchParams(window.location.search);
        const query = (params.get('q') || '').trim();
        const category = (params.get('category') || '').trim();
        let filtered = [...this.blogs];

        if (category) {
            filtered = filtered.filter(blog => blog.category.toLowerCase() === category.toLowerCase());
        }

        if (query.length >= 2) {
            const normalizedQuery = query.toLowerCase();
            filtered = filtered.filter(blog =>
                blog.title.toLowerCase().includes(normalizedQuery) ||
                blog.excerpt.toLowerCase().includes(normalizedQuery) ||
                blog.author.toLowerCase().includes(normalizedQuery) ||
                blog.category.toLowerCase().includes(normalizedQuery) ||
                blog.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
            );

            if (this.searchInput) {
                this.searchInput.value = query;
            }

            if (this.searchOverlayInput) {
                this.searchOverlayInput.value = query;
            }
        }

        this.filteredBlogs = filtered;
        this.displayedBlogs = 12;
        this.currentBlogPage = 1;
    }
    
	    renderBlogs() {
	        const blogsGrid = document.getElementById('blogsGrid');
	        if (!blogsGrid) return;
        
        if (this.filteredBlogs.length === 0) {
            blogsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No blogs found</h3>
                    <p>Try adjusting your search criteria or browse different categories.</p>
                </div>
            `;
            document.getElementById('blogsGridPagination')?.remove();
            this.updateLoadMoreButton(false);
            return;
        }
        
        const totalPages = Math.max(1, Math.ceil(this.filteredBlogs.length / this.blogPageSize));
        this.currentBlogPage = Math.min(this.currentBlogPage, totalPages);
        const blogsToShow = window.BlogXivPagination.getPageItems(
            this.filteredBlogs,
            this.currentBlogPage,
            this.blogPageSize
        );
        
        blogsGrid.innerHTML = blogsToShow.map(blog => `
            <article class="blog-card" data-blog-id="${blog.id}" data-blog-url="${blog.url || ''}" data-blog-category="${this.escapeAttribute(blog.category)}">
                <div class="blog-image">
                    <img class="blog-cover-image ${blog.coverFit === 'contain' ? 'is-contain' : ''}" src="${this.getMediaHref(blog.coverImage)}" alt="${blog.coverAlt || blog.title}" loading="lazy" referrerpolicy="no-referrer">
                    <span class="blog-source-pill">${blog.sourceName}</span>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <a class="blog-detail-link" href="${this.getPageHref('blog-detail.html')}?id=${encodeURIComponent(blog.id)}">View details</a>
                        <span class="blog-meta-separator">•</span>
                        <span class="blog-read-time">${blog.readTime}</span>
                        <span class="blog-meta-separator">•</span>
                        <span class="blog-date">${blog.publishDate}</span>
                    </div>
                    <h3 class="blog-title">${window.BlogXivHyphenation.hyphenateTitle(blog.title)}</h3>
                    <p class="blog-excerpt">${blog.excerpt}</p>
                    <div class="blog-footer">
                        <div class="blog-author">
                            ${this.renderAuthorAvatar(blog.author, blog.authorAvatar, blog.url)}
                            <span class="author-name">${blog.author}</span>
                        </div>
                        ${window.BlogXivLikes.renderButton(blog.id)}
                    </div>
                    <div class="blog-card-actions">
                        <span class="blog-card-category">${blog.category}</span>
                    </div>
                </div>
            </article>
        `).join('');
        
        window.BlogXivPagination.render(blogsGrid, {
            currentPage: this.currentBlogPage,
            totalItems: this.filteredBlogs.length,
            pageSize: this.blogPageSize,
            label: 'Selected reading pages',
            onPageChange: (page) => this.changeBlogPage(page)
        });
        this.updateLoadMoreButton(false);
	    }

    changeBlogPage(page) {
        const blogsGrid = document.getElementById('blogsGrid');
        window.BlogXivPagination.transition(blogsGrid, () => {
            this.currentBlogPage = page;
            this.renderBlogs();
            blogsGrid?.closest('section')?.querySelector('.section-header')?.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }

    getHomepagePopularBloggerProfiles() {
        return [
            {
                name: 'kalomaze',
                institution: "kalomaze's kalomazing blog",
                homepage: 'https://kalomaze.bearblog.dev/blog/',
                avatar: 'https://www.google.com/s2/favicons?domain=kalomaze.bearblog.dev&sz=128',
                matches: ['kalomaze'],
                specialty: 'Trustworthy AI',
                focus: ['GRPO', 'reward modeling', 'RL finetuning'],
                qualityRank: 12
            },
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
                name: 'Andrej Karpathy',
                institution: 'Eureka Labs / former OpenAI and Tesla',
                homepage: 'https://karpathy.ai/',
                avatar: 'https://karpathy.ai/assets/me_new.jpg',
                matches: ['Andrej Karpathy', 'Karpathy'],
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
            }
        ];
    }

    matchesBloggerProfile(blog, profile) {
        const haystack = [
            blog.author,
            blog.sourceName,
            blog.title,
            blog.url
        ].filter(Boolean).join(' ').toLowerCase();

        return profile.matches.some((match) => haystack.includes(match.toLowerCase()));
    }

    getHomepagePopularBloggers() {
        const indexedBlogs = this.blogs.length ? this.blogs : this.getCuratedCommunityBlogs();

        return this.getHomepagePopularBloggerProfiles()
            .map((profile) => {
                const posts = indexedBlogs
                    .filter((blog) => this.matchesBloggerProfile(blog, profile))
                    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
                const categories = [...new Set(posts.map((post) => post.category).filter(Boolean))];
                const latestPost = posts[0];
                const primaryCategory = categories.includes(profile.specialty)
                    ? profile.specialty
                    : categories[0] || profile.specialty;
                const categoryText = categories.slice(0, 2).join(' and ') || primaryCategory;

                return {
                    ...profile,
                    specialty: primaryCategory,
                    blogsCount: posts.length,
                    categoriesCount: categories.length || 1,
                    latestYear: latestPost ? String(new Date(latestPost.publishDate).getFullYear()) : '2026',
                    latestBlog: latestPost?.title || profile.focus[0],
                    tags: [...new Set([...profile.focus, ...categories])].slice(0, 4),
                    postsUrl: `${this.getPageHref('explore.html')}?author=${encodeURIComponent(profile.matches[0])}`,
                    score: profile.qualityRank * 100 + posts.length * 18 + categories.length * 8,
                    summary: `${profile.focus.slice(0, 3).join(', ')} across ${posts.length || 'curated'} indexed pieces in ${categoryText}.`
                };
            })
            .filter((blogger) => blogger.blogsCount > 0)
            .sort((a, b) => b.score - a.score || b.blogsCount - a.blogsCount)
            .slice(0, 6);
    }

    renderPopularBloggers() {
        const bloggersGrid = document.getElementById('popularBloggersGrid');
        if (!bloggersGrid) return;

        const bloggers = this.getHomepagePopularBloggers();
        if (!bloggers.length) {
            bloggersGrid.innerHTML = '';
            return;
        }

        bloggersGrid.innerHTML = bloggers.map((blogger) => `
            <article class="popular-blogger-card" data-homepage="${this.escapeAttribute(blogger.homepage)}" tabindex="0" role="link" aria-label="Open ${this.escapeAttribute(blogger.name)} homepage">
                <div class="popular-blogger-header">
                    <img class="popular-blogger-avatar" src="${this.getMediaHref(blogger.avatar)}" alt="${this.escapeAttribute(blogger.name)}" loading="lazy" referrerpolicy="no-referrer">
                    <div class="popular-blogger-info">
                        <span class="popular-blogger-specialty">${this.escapeHTML(blogger.specialty)} Blogger</span>
                        <h3 class="popular-blogger-name">${this.escapeHTML(blogger.name)}</h3>
                        <p class="popular-blogger-institution">${this.escapeHTML(blogger.institution)}</p>
                    </div>
                </div>
                <p class="popular-blogger-summary">${this.escapeHTML(blogger.summary)}</p>
                <div class="popular-blogger-tags">
                    ${blogger.tags.map((tag) => `<span class="tag">${this.escapeHTML(tag)}</span>`).join('')}
                </div>
                <div class="popular-blogger-stats">
                    <div class="popular-blogger-stat">
                        <span class="popular-blogger-stat-number">${blogger.blogsCount}</span>
                        <span class="popular-blogger-stat-label">Indexed</span>
                    </div>
                    <div class="popular-blogger-stat">
                        <span class="popular-blogger-stat-number">${blogger.categoriesCount}</span>
                        <span class="popular-blogger-stat-label">Domains</span>
                    </div>
                    <div class="popular-blogger-stat">
                        <span class="popular-blogger-stat-number">${this.escapeHTML(blogger.latestYear)}</span>
                        <span class="popular-blogger-stat-label">Latest</span>
                    </div>
                </div>
                <p class="popular-blogger-latest">${this.escapeHTML(blogger.latestBlog)}</p>
                <div class="popular-blogger-actions">
                    <a class="btn btn-outline" href="${this.escapeAttribute(blogger.postsUrl)}">Indexed Posts</a>
                    <a class="btn btn-primary" href="${this.escapeAttribute(blogger.homepage)}" target="_blank" rel="noopener noreferrer">Homepage</a>
                </div>
            </article>
        `).join('');

        bloggersGrid.querySelectorAll('.popular-blogger-card').forEach((card) => {
            card.addEventListener('click', (event) => {
                if (event.target.closest('a')) return;
                const homepage = card.dataset.homepage;
                if (homepage) {
                    window.open(homepage, '_blank', 'noopener,noreferrer');
                }
            });

            card.addEventListener('keydown', (event) => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                event.preventDefault();
                const homepage = card.dataset.homepage;
                if (homepage) {
                    window.open(homepage, '_blank', 'noopener,noreferrer');
                }
            });
        });
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
    
    openBlogDetail(blogId) {
        const blog = this.blogs.find(b => b.id == blogId);
        if (blog) {
            // In a real application, this would navigate to a blog detail page
            alert(`Opening blog: "${blog.title}" by ${blog.author}`);
        }
    }
    
    loadMoreBlogs() {
        const loadMoreBtn = document.querySelector('button[data-role="load-more"]');
        if (loadMoreBtn) {
            loadMoreBtn.setAttribute('aria-busy', 'true');
        }
        this.displayedBlogs += this.blogsPerPage;
        this.renderBlogs();

        // Scroll to the newly loaded blogs
        setTimeout(() => {
            const blogsGrid = document.getElementById('blogsGrid');
            if (blogsGrid) {
                const lastBlog = blogsGrid.lastElementChild;
                if (lastBlog) {
                    lastBlog.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            if (loadMoreBtn) {
                loadMoreBtn.removeAttribute('aria-busy');
            }
        }, 100);
    }

    handleScroll() {
        if (!this.navbar) return;
        const shouldCompact = window.scrollY > 24;
        this.navbar.classList.toggle('navbar-scrolled', shouldCompact);
    }
    
    updateLoadMoreButton(show) {
        const blogsGrid = document.getElementById('blogsGrid');
        if (!blogsGrid) return;

        const sectionContainer = blogsGrid.closest('.container');
        if (!sectionContainer) return;

        const loadMoreContainer = sectionContainer.querySelector('.load-more');
        if (!loadMoreContainer) return;

        const explorePageButton = loadMoreContainer.querySelector('#loadMoreBtn');

        let loadMoreBtn = loadMoreContainer.querySelector('button[data-role="load-more"]');
        if (!loadMoreBtn && explorePageButton) {
            return;
        }

        if (!loadMoreBtn) {
            loadMoreBtn = document.createElement('button');
            loadMoreBtn.type = 'button';
            loadMoreBtn.className = 'btn btn-primary btn-load-more';
            loadMoreBtn.dataset.role = 'load-more';
            loadMoreBtn.textContent = 'Load more posts';
            loadMoreBtn.addEventListener('click', () => this.loadMoreBlogs());
            loadMoreContainer.insertBefore(loadMoreBtn, loadMoreContainer.firstChild);
        }

        loadMoreBtn.classList.toggle('is-hidden', !show);
        loadMoreBtn.setAttribute('aria-hidden', (!show).toString());
        loadMoreBtn.tabIndex = show ? 0 : -1;

        const viewAllLink = loadMoreContainer.querySelector('a.btn');
        if (viewAllLink) {
            viewAllLink.classList.add('btn-outline');
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        if (type === 'success') {
            notification.style.backgroundColor = '#10B981';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#EF4444';
        } else {
            notification.style.backgroundColor = '#3B82F6';
        }
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
    
    // Animations
    setupAnimations() {
        const cards = document.querySelectorAll('.card');
        if (!cards.length) return;

        if (this.motionMediaQuery && this.motionMediaQuery.matches) {
            cards.forEach(card => {
                card.style.animationDuration = '0ms';
                card.style.animationDelay = '0ms';
            });
            return;
        }

        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 120}ms`;
        });
    }

    setupIntersectionObserver() {
        if (typeof IntersectionObserver === 'undefined') {
            document.querySelectorAll('.category-card, .blog-card, .section-header').forEach(el => {
                el.classList.add('fade-in-up');
            });
            return;
        }
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate on scroll
        document.querySelectorAll('.category-card, .blog-card, .section-header').forEach(el => {
            observer.observe(el);
        });
    }
    
    // Utility Methods
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Add some additional CSS for search suggestions
const additionalStyles = `
    .suggestion-item {
        padding: 0.75rem 1rem;
        cursor: pointer;
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.2s ease;
    }

    .suggestion-item:hover {
        background-color: var(--bg-secondary);
    }

    .suggestion-item.active {
        background-color: rgba(37, 99, 235, 0.1);
    }

    .suggestion-item.active .suggestion-title {
        color: var(--primary-blue);
    }
    
    .suggestion-item:last-child {
        border-bottom: none;
    }
    
    .suggestion-title {
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 0.25rem;
    }
    
    .suggestion-author {
        font-size: 0.875rem;
        color: var(--text-secondary);
    }
    
    .suggestion-item mark {
        background-color: rgba(59, 130, 246, 0.2);
        color: var(--primary-blue);
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
    }
    
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-secondary);
    }
    
    .no-results h3 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ========================================
// LOADING ANIMATION CONTROL
// ========================================

class LoadingAnimation {
    constructor() {
        this.overlay = document.getElementById('loadingOverlay');
        this.loadingText = document.getElementById('loadingText');
        this.isVisible = false;
        this.disabled = true;
        this.loadingMessages = [
            'Loading amazing content...',
            'Exploring the blogosphere...',
            'Preparing the best experience...',
            'Connecting to knowledge networks...',
            'Optimizing content display...'
        ];
        this.currentMessageIndex = 0;
        this.messageInterval = null;
    }

    // Show loading animation
    show(message = null, duration = null) {
        if (this.disabled) {
            this.hide();
            return false;
        }

        if (this.overlay) {
            if (!this.isVisible) {
                this.overlay.classList.add('active');
                this.isVisible = true;
                if (!message) {
                    this.startMessageRotation();
                }
            }

            if (message) {
                this.stopMessageRotation();
                this.setMessage(message);
            }

            if (duration) {
                setTimeout(() => {
                    this.hide();
                }, duration);
            }
        }
    }

    // Hide loading animation
    hide() {
        this.isVisible = false;
        if (this.overlay) {
            this.overlay.classList.remove('active');
        }
        this.stopMessageRotation();
    }

    // Set loading message
    setMessage(message) {
        if (this.loadingText) {
            this.loadingText.textContent = message;
        }
    }

    // Start message rotation
    startMessageRotation() {
        this.stopMessageRotation();
        this.currentMessageIndex = 0;
        this.setMessage(this.loadingMessages[0]);
        
        this.messageInterval = setInterval(() => {
            this.currentMessageIndex = (this.currentMessageIndex + 1) % this.loadingMessages.length;
            this.setMessage(this.loadingMessages[this.currentMessageIndex]);
        }, 2000);
    }

    // Stop message rotation
    stopMessageRotation() {
        if (this.messageInterval) {
            clearInterval(this.messageInterval);
            this.messageInterval = null;
        }
    }

    // Show page transition loading
    showPageTransition(targetPage) {
        const messages = {
            'index.html': 'Loading homepage...',
            'explore.html': 'Exploring amazing content...',
            'categories.html': 'Loading category content...',
            'authors.html': 'Loading author information...',
            'blog-detail.html': 'Loading blog details...',
            'blog-manager.html': 'Loading management interface...',
            'about.html': 'Loading about page...',
            'bloggers.html': 'Loading blogger profiles...'
        };

        const sanitizedTarget = (targetPage || '').split('?')[0];
        this.show(messages[sanitizedTarget] || 'Loading page...');
    }

    // Show search loading
    showSearchLoading() {
        this.show('Searching for relevant content...', 1500);
    }

    // Show data loading
    showDataLoading() {
        this.show('Loading data...', 2000);
    }

    // Show save loading
    showSaveLoading() {
        this.show('Saving data...', 1500);
    }

    // Show delete loading
    showDeleteLoading() {
        this.show('Deleting content...', 1000);
    }
}

const loadingAnimationInstance = new LoadingAnimation();
window.loadingAnimation = loadingAnimationInstance;

// Page navigation interception (DISABLED for instant navigation)
function interceptPageNavigation() {
    // Instant navigation without loading animation
    // Links work normally without interception
    return;
}

// Search function loading animation (DISABLED)
function addSearchLoadingAnimation() {
    // Search loading animation disabled for instant feedback
    return;
}

// Form submission loading animation (DISABLED)
function addFormLoadingAnimation() {
    // Form loading animation disabled for instant feedback
    return;
}

// Button click loading animation (DISABLED)
function addButtonLoadingAnimation() {
    // Loading animation disabled for better UX
    // Users prefer instant feedback without loading indicators
    return;
}

// Initialize after page load
function initializeLoadingAnimations() {
    if (!window.loadingAnimation) return;

    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        window.loadingAnimation.show('Preparing your reading experience...');
        const hideOverlay = () => {
            setTimeout(() => window.loadingAnimation.hide(), 200);
        };

        if (document.readyState === 'complete') {
            hideOverlay();
        } else {
            window.addEventListener('load', hideOverlay, { once: true });
        }
    }

    interceptPageNavigation();
    addSearchLoadingAnimation();
    addFormLoadingAnimation();
    addButtonLoadingAnimation();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BlogXiv();
    // Loading animations disabled
    // initializeLoadingAnimations();
    
    // Initialize typewriter effect
    initTypewriter();
});

// ========================================
// TYPEWRITER EFFECT
// ========================================
function initTypewriter() {
    const typewriterElement = document.getElementById('typewriterText');
    if (!typewriterElement) return;
    
    const messages = [
        'We are researchers.',
        'We are bloggers.'
    ];

    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
        typewriterElement.textContent = messages[0];
        return;
    }
    
    let messageIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isPaused = false;
    
    function type() {
        const currentMessage = messages[messageIndex];
        
        if (isPaused) {
            setTimeout(type, 2000); // Pause for 2 seconds before deleting
            isPaused = false;
            isDeleting = true;
            return;
        }
        
        if (!isDeleting) {
            // Typing
            typewriterElement.textContent = currentMessage.substring(0, charIndex + 1);
            charIndex++;
            
            if (charIndex === currentMessage.length) {
                // Finished typing current message
                isPaused = true;
            }
            
            setTimeout(type, isDeleting ? 50 : 100); // Typing speed
        } else {
            // Deleting
            typewriterElement.textContent = currentMessage.substring(0, charIndex - 1);
            charIndex--;
            
            if (charIndex === 0) {
                // Finished deleting
                isDeleting = false;
                messageIndex = (messageIndex + 1) % messages.length; // Move to next message
                setTimeout(type, 500); // Pause before typing next message
            } else {
                setTimeout(type, 50); // Deleting speed (faster)
            }
        }
    }
    
    // Start the typewriter effect
    setTimeout(type, 1000); // Initial delay before starting
}
