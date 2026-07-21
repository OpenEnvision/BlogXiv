(function(global) {
    const config = Object.freeze({
        url: 'https://jlvupzkjrshnfzlwejqy.supabase.co',
        publishableKey: 'sb_publishable_MBtugKRhrAxt4JiHIVHpwQ_hKtFvajI',
        pageSize: 1000,
        timeoutMs: 10000
    });

    let publishedBlogsPromise = null;

    const mapBlog = (row) => ({
        id: row.id,
        title: row.title,
        excerpt: row.excerpt,
        author: row.author,
        authorAvatar: row.author_avatar || '',
        category: row.category,
        tags: Array.isArray(row.tags) ? row.tags : [],
        readTime: row.read_time || '',
        publishDate: row.publish_date,
        sourceName: row.source_name,
        url: row.url,
        coverImage: row.cover_image || '',
        coverAlt: row.cover_alt || row.title,
        coverFit: row.cover_fit || 'cover'
    });

    const fetchPage = async (offset) => {
        const endpoint = new URL(`${config.url}/rest/v1/blogs`);
        endpoint.searchParams.set('select', '*');
        endpoint.searchParams.set('status', 'eq.published');
        endpoint.searchParams.set('order', 'publish_date.desc,id.asc');

        const controller = new AbortController();
        const timeout = global.setTimeout(() => controller.abort(), config.timeoutMs);

        try {
            const response = await global.fetch(endpoint, {
                headers: {
                    apikey: config.publishableKey,
                    Authorization: `Bearer ${config.publishableKey}`,
                    Range: `${offset}-${offset + config.pageSize - 1}`
                },
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`Supabase returned ${response.status}`);
            }

            const rows = await response.json();
            if (!Array.isArray(rows)) throw new Error('Supabase returned an invalid blog payload');
            return rows;
        } finally {
            global.clearTimeout(timeout);
        }
    };

    const fetchPublishedBlogs = async () => {
        const rows = [];

        for (let offset = 0; ; offset += config.pageSize) {
            const page = await fetchPage(offset);
            rows.push(...page);
            if (page.length < config.pageSize) break;
        }

        if (rows.length === 0) throw new Error('Supabase returned no published blogs');
        return rows.map(mapBlog);
    };

    const getPublishedBlogs = async (staticFallback = []) => {
        if (!publishedBlogsPromise) {
            publishedBlogsPromise = fetchPublishedBlogs().catch((error) => {
                console.warn('BlogrXiv is using the static blog fallback:', error.message);
                return Array.isArray(staticFallback) ? [...staticFallback] : [];
            });
        }

        const blogs = await publishedBlogsPromise;
        if (blogs.length || !Array.isArray(staticFallback)) return [...blogs];
        return [...staticFallback];
    };

    global.BlogXivData = Object.freeze({
        config,
        getPublishedBlogs
    });
})(window);
