(function setupBlogLikes(global) {
    function getKey(blogId) {
        return `blog:${blogId}:liked`;
    }

    function isLiked(blogId) {
        try {
            return localStorage.getItem(getKey(blogId)) === 'true';
        } catch (error) {
            return false;
        }
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
        const label = liked ? 'You liked this blog' : 'Like this blog';

        return `
            <button class="blog-like-button${liked ? ' is-liked' : ''}" type="button" data-blog-like="${id}" aria-label="${label}" aria-pressed="${liked}" title="${label}">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </button>
        `;
    }

    function updateButtons(blogId) {
        const liked = isLiked(blogId);
        document.querySelectorAll('[data-blog-like]').forEach((button) => {
            if (button.dataset.blogLike !== String(blogId)) return;
            const label = liked ? 'You liked this blog' : 'Like this blog';
            button.classList.toggle('is-liked', liked);
            button.setAttribute('aria-pressed', String(liked));
            button.setAttribute('aria-label', label);
            button.title = label;
        });
    }

    function like(blogId) {
        if (isLiked(blogId)) return true;

        try {
            localStorage.setItem(getKey(blogId), 'true');
        } catch (error) {
            return false;
        }

        return true;
    }

    document.addEventListener('click', (event) => {
        const button = event.target.closest('[data-blog-like]');
        if (!button) return;

        event.preventDefault();
        event.stopPropagation();
        const blogId = button.dataset.blogLike;
        if (like(blogId)) updateButtons(blogId);
    });

    global.addEventListener('storage', (event) => {
        const match = event.key?.match(/^blog:(.+):liked$/);
        if (match) updateButtons(match[1]);
    });

    global.BlogXivLikes = { getKey, isLiked, like, renderButton, updateButtons };
})(window);
