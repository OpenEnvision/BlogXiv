import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('site/assets/js/pages/blog-detail.js', 'utf8');
const values = new Map();
const elements = new Map();

function createButton() {
    const classes = new Set();
    const attributes = new Map();

    return {
        classList: {
            contains: (name) => classes.has(name),
            toggle: (name, force) => force ? classes.add(name) : classes.delete(name)
        },
        setAttribute: (name, value) => attributes.set(name, value),
        getAttribute: (name) => attributes.get(name),
        title: ''
    };
}

const context = {
    console,
    localStorage: {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value)
    },
    document: {
        addEventListener: () => {},
        getElementById: (id) => elements.get(id) ?? null,
        documentElement: {
            getAttribute: () => 'light',
            setAttribute: () => {},
            style: {}
        }
    },
    window: {
        addEventListener: () => {},
        location: {
            protocol: 'https:'
        }
    }
};

vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.BlogDetailForTest = BlogDetail;`, context);

const BlogDetail = context.BlogDetailForTest;
const likeButton = createButton();
const likeCount = { textContent: '' };
elements.set('likeBtn', likeButton);
elements.set('likeCount', likeCount);

const detail = Object.create(BlogDetail.prototype);
detail.blog = { likes: 12 };
detail.blogLikeKey = 'blog:first:liked';
detail.liked = false;
detail.notifications = [];
detail.showNotification = (message, type) => detail.notifications.push({ message, type });

detail.renderLikeState();
assert.equal(likeCount.textContent, '12');
assert.equal(likeButton.getAttribute('aria-pressed'), 'false');

detail.likeBlog();
assert.equal(values.get('blog:first:liked'), 'true');
assert.equal(likeCount.textContent, '13');
assert.equal(likeButton.getAttribute('aria-pressed'), 'true');
assert.equal(likeButton.classList.contains('is-liked'), true);

detail.likeBlog();
assert.equal(likeCount.textContent, '13');
assert.equal(detail.notifications.at(-1).message, 'You have already liked this blog.');

const refreshedDetail = Object.create(BlogDetail.prototype);
refreshedDetail.blogLikeKey = 'blog:first:liked';
assert.equal(refreshedDetail.getStoredBlogLike(), true);

const otherBlog = Object.create(BlogDetail.prototype);
otherBlog.blogLikeKey = 'blog:second:liked';
assert.equal(otherBlog.getStoredBlogLike(), false);

const originalSetItem = context.localStorage.setItem;
context.localStorage.setItem = () => { throw new Error('storage unavailable'); };
otherBlog.blog = { likes: 5 };
otherBlog.liked = false;
otherBlog.notifications = [];
otherBlog.showNotification = (message, type) => otherBlog.notifications.push({ message, type });
otherBlog.likeBlog();
assert.equal(otherBlog.liked, false);
assert.equal(otherBlog.notifications.at(-1).type, 'error');
context.localStorage.setItem = originalSetItem;

const cardLikeSource = fs.readFileSync('site/assets/js/blog-likes.js', 'utf8');
context.document.querySelectorAll = () => [];
vm.runInContext(cardLikeSource, context);

assert.match(context.window.BlogXivLikes.renderButton('card-blog'), /data-blog-like="card-blog"/);
assert.match(context.window.BlogXivLikes.renderButton('card-blog'), /aria-pressed="false"/);
assert.equal(context.window.BlogXivLikes.like('card-blog'), true);
assert.equal(values.get('blog:card-blog:liked'), 'true');
assert.match(context.window.BlogXivLikes.renderButton('card-blog'), /aria-pressed="true"/);
assert.equal(context.window.BlogXivLikes.like('card-blog'), true);

const sourceButton = {
    hidden: true,
    href: '',
    removeAttribute(name) {
        if (name === 'href') this.href = '';
    }
};
elements.set('sourceBtn', sourceButton);
detail.blog = { ...detail.blog, url: 'https://example.com/article' };
detail.renderSourceLink();
assert.equal(sourceButton.hidden, false);
assert.equal(sourceButton.href, 'https://example.com/article');
detail.blog = { likes: 12 };
detail.renderSourceLink();
assert.equal(sourceButton.hidden, true);
assert.equal(sourceButton.href, '');

const giscusAttributes = new Map();
const giscusContainer = {
    dataset: {},
    child: null,
    replaceChildren() {
        this.child = null;
    },
    appendChild(child) {
        this.child = child;
    }
};
elements.set('giscusComments', giscusContainer);
context.document.createElement = () => ({
    setAttribute: (name, value) => giscusAttributes.set(name, value)
});
detail.blogId = 'card-blog';
detail.currentTheme = 'light';
detail.renderGiscus();
assert.equal(giscusContainer.child.src, 'https://giscus.app/client.js');
assert.equal(giscusAttributes.get('data-repo-id'), 'R_kgDOSk05GQ');
assert.equal(giscusAttributes.get('data-category-id'), 'DIC_kwDOSk05Gc4DBKN9');
assert.equal(giscusAttributes.get('data-mapping'), 'specific');
assert.equal(giscusAttributes.get('data-term'), 'blog:card-blog');
assert.equal(giscusAttributes.get('data-theme'), 'light');

const localGiscusContainer = {
    dataset: {},
    child: null,
    replaceChildren() {
        this.child = null;
    },
    appendChild(child) {
        this.child = child;
    }
};
elements.set('giscusComments', localGiscusContainer);
context.window.location.protocol = 'file:';
detail.renderGiscus();
assert.equal(localGiscusContainer.child.className, 'giscus-unavailable');
assert.match(localGiscusContainer.child.textContent, /served over HTTP/);

console.log('blog like tests passed');
