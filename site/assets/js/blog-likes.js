(function setupBlogLikes(global) {
    const voterKey = 'blogxiv:voter-id';
    const counts = new Map();
    let client = null;
    let readyPromise = null;
    let realtimeChannel = null;

    function getKey(blogId) {
        return `blog:${blogId}:liked`;
    }

    function isLiked(blogId) {
        try {
            return global.localStorage.getItem(getKey(blogId)) === 'true';
        } catch (error) {
            return false;
        }
    }

    function setLiked(blogId, liked) {
        try {
            if (liked) global.localStorage.setItem(getKey(blogId), 'true');
            else global.localStorage.removeItem(getKey(blogId));
            return true;
        } catch (error) {
            return false;
        }
    }

    function createUuid() {
        if (global.crypto?.randomUUID) return global.crypto.randomUUID();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const random = Math.floor(Math.random() * 16);
            const value = char === 'x' ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    }

    function getVoterId() {
        try {
            const stored = global.localStorage.getItem(voterKey);
            if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored || '')) {
                return stored;
            }
            const voterId = createUuid();
            global.localStorage.setItem(voterKey, voterId);
            return voterId;
        } catch (error) {
            return createUuid();
        }
    }

    function getCount(blogId) {
        return counts.get(String(blogId)) || 0;
    }

    function escapeAttribute(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function renderButton(blogId) {
        const id = escapeAttribute(blogId);
        const liked = isLiked(blogId);
        const label = liked ? 'Unlike this blog' : 'Like this blog';

        return `
            <button class="blog-like-button${liked ? ' is-liked' : ''}" type="button" data-blog-like="${id}" aria-label="${label}" aria-pressed="${liked}" title="${label}">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span class="blog-like-count" data-blog-like-count="${id}">${getCount(blogId)}</span>
            </button>
        `;
    }

    function updateButtons(blogId) {
        const id = String(blogId);
        const liked = isLiked(id);
        const count = getCount(id);
        global.document.querySelectorAll('[data-blog-like]').forEach((button) => {
            if (button.dataset.blogLike !== id) return;
            const label = liked ? 'Unlike this blog' : 'Like this blog';
            button.classList.toggle('is-liked', liked);
            button.setAttribute('aria-pressed', String(liked));
            button.setAttribute('aria-label', label);
            button.title = label;
            button.disabled = false;
        });
        global.document.querySelectorAll('[data-blog-like-count]').forEach((element) => {
            if (element.dataset.blogLikeCount === id) element.textContent = String(count);
        });
    }

    function publishCount(blogId, count) {
        const id = String(blogId);
        counts.set(id, Math.max(0, Number(count) || 0));
        updateButtons(id);
        global.dispatchEvent(new CustomEvent('blogxiv:likechange', {
            detail: { blogId: id, likeCount: getCount(id), liked: isLiked(id) }
        }));
    }

    async function loadCounts() {
        const rows = [];
        const pageSize = 1000;
        for (let offset = 0; ; offset += pageSize) {
            const { data, error } = await client
                .from('blog_like_counts')
                .select('blog_id,like_count')
                .range(offset, offset + pageSize - 1);
            if (error) throw error;
            rows.push(...data);
            if (data.length < pageSize) break;
        }
        rows.forEach((row) => counts.set(String(row.blog_id), Math.max(0, Number(row.like_count) || 0)));
        global.document.querySelectorAll('[data-blog-like]').forEach((button) => updateButtons(button.dataset.blogLike));
        return new Map(counts);
    }

    function subscribeToCounts() {
        if (realtimeChannel) return;
        realtimeChannel = client
            .channel('blog-like-counts')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'blog_like_counts'
            }, (payload) => {
                const row = payload.new || payload.old;
                if (!row?.blog_id) return;
                publishCount(row.blog_id, payload.eventType === 'DELETE' ? 0 : row.like_count);
            })
            .subscribe();
    }

    async function migrateStoredLikes() {
        const voterId = getVoterId();
        const blogIds = [];
        try {
            for (let index = 0; index < global.localStorage.length; index += 1) {
                const key = global.localStorage.key(index);
                const match = key?.match(/^blog:(.+):liked$/);
                if (match && global.localStorage.getItem(key) === 'true') blogIds.push(match[1]);
            }
        } catch (error) {
            return;
        }

        await Promise.all(blogIds.map(async (blogId) => {
            const { data, error } = await client.rpc('toggle_blog_like', {
                p_blog_id: blogId,
                p_voter_id: voterId,
                p_liked: true
            });
            if (!error && data?.[0]) publishCount(blogId, data[0].like_count);
        }));
    }

    async function init() {
        if (readyPromise) return readyPromise;
        readyPromise = (async () => {
            if (!global.supabase?.createClient || !global.BlogXivData?.config) {
                throw new Error('Supabase likes client is unavailable');
            }
            const { url, publishableKey } = global.BlogXivData.config;
            client = global.supabase.createClient(url, publishableKey, {
                auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
            });
            await loadCounts();
            subscribeToCounts();
            await migrateStoredLikes();
            return new Map(counts);
        })().catch((error) => {
            console.warn('Realtime blog likes are unavailable:', error.message);
            return new Map(counts);
        });
        return readyPromise;
    }

    async function toggle(blogId) {
        await init();
        if (!client) throw new Error('Realtime likes are unavailable');
        const id = String(blogId);
        const previousLiked = isLiked(id);
        const previousCount = getCount(id);
        const nextLiked = !previousLiked;

        setLiked(id, nextLiked);
        counts.set(id, Math.max(0, previousCount + (nextLiked ? 1 : -1)));
        updateButtons(id);

        const { data, error } = await client.rpc('toggle_blog_like', {
            p_blog_id: id,
            p_voter_id: getVoterId(),
            p_liked: nextLiked
        });

        if (error || !data?.[0]) {
            setLiked(id, previousLiked);
            counts.set(id, previousCount);
            updateButtons(id);
            throw error || new Error('Supabase returned no like result');
        }

        setLiked(id, Boolean(data[0].liked));
        publishCount(id, data[0].like_count);
        return { blogId: id, likeCount: getCount(id), liked: isLiked(id) };
    }

    global.document.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-blog-like]');
        if (!button) return;
        event.preventDefault();
        event.stopPropagation();
        button.disabled = true;
        try {
            await toggle(button.dataset.blogLike);
        } catch (error) {
            console.error('Could not update blog like:', error);
        } finally {
            button.disabled = false;
        }
    });

    global.addEventListener('storage', (event) => {
        const match = event.key?.match(/^blog:(.+):liked$/);
        if (match) updateButtons(match[1]);
    });

    global.document.addEventListener('DOMContentLoaded', () => init());

    global.BlogXivLikes = {
        getCount,
        getCounts: async () => new Map(await init()),
        getKey,
        getVoterId,
        init,
        isLiked,
        renderButton,
        toggle,
        updateButtons
    };
})(window);
