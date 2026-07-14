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
    URL,
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
            protocol: 'https:',
            href: 'https://openenvision.github.io/BlogXiv/site/blog-detail.html?id=card-blog#comments'
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
assert.equal(giscusAttributes.get('data-emit-metadata'), '1');

const manageCommentsLink = {
    href: '',
    setAttribute: () => {}
};
elements.set('manageCommentsLink', manageCommentsLink);
detail.updateManageCommentsLink();
assert.match(manageCommentsLink.href, /discussions\?discussions_q=/);
assert.match(decodeURIComponent(manageCommentsLink.href), /blog:card-blog/);

detail.handleGiscusMetadata({
    origin: 'https://giscus.app',
    data: { giscus: { discussion: { url: 'https://github.com/OpenEnvision/BlogXiv/discussions/42' } } }
});
assert.equal(manageCommentsLink.href, 'https://github.com/OpenEnvision/BlogXiv/discussions/42');

const linkedInShare = { href: '' };
const xShare = { href: '' };
elements.set('shareLinkedIn', linkedInShare);
elements.set('shareX', xShare);
detail.blog = { title: 'Gemini Research', excerpt: 'Research excerpt' };
detail.updateShareLinks();
assert.match(linkedInShare.href, /^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\//);
assert.match(decodeURIComponent(linkedInShare.href), /blog-detail\.html\?id=card-blog$/);
assert.match(xShare.href, /^https:\/\/twitter\.com\/intent\/tweet\?/);
assert.match(decodeURIComponent(xShare.href), /Gemini Research - BlogrXiv/);
assert.match(decodeURIComponent(xShare.href), /blog-detail\.html\?id=card-blog/);
assert.doesNotMatch(decodeURIComponent(xShare.href), /#comments/);

context.window.location.protocol = 'file:';
context.window.location.href = 'file:///Users/example/BlogrXiv/site/blog-detail.html?id=card-blog#comments';
assert.equal(detail.getShareUrl(), 'https://openenvision.github.io/BlogXiv/site/blog-detail.html?id=card-blog');
detail.updateShareLinks();
assert.match(decodeURIComponent(linkedInShare.href), /https:\/\/openenvision\.github\.io\/BlogXiv\/site\/blog-detail\.html\?id=card-blog$/);
assert.match(decodeURIComponent(xShare.href), /https:\/\/openenvision\.github\.io\/BlogXiv\/site\/blog-detail\.html\?id=card-blog/);
context.window.location.protocol = 'https:';
context.window.location.href = 'https://openenvision.github.io/BlogXiv/site/blog-detail.html?id=card-blog#comments';

detail.showNotification = (message, type) => detail.notifications.push({ message, type });
assert.equal(detail.navigateToSharePlatform(linkedInShare.href), true);
assert.match(context.window.location.href, /^https:\/\/www\.linkedin\.com\/sharing\/share-offsite\//);
assert.equal(detail.navigateToSharePlatform('https://example.com/not-allowed'), false);
assert.equal(detail.notifications.at(-1).type, 'error');
context.window.location.href = 'https://openenvision.github.io/BlogXiv/site/blog-detail.html?id=card-blog#comments';

const shareAttributes = new Map();
let firstShareItemFocused = false;
const shareButton = {
    setAttribute: (name, value) => shareAttributes.set(name, value)
};
const shareMenu = {
    hidden: true,
    querySelector: () => ({ focus: () => { firstShareItemFocused = true; } })
};
elements.set('shareBtn', shareButton);
elements.set('shareMenu', shareMenu);
detail.toggleShareMenu(true);
assert.equal(shareMenu.hidden, false);
assert.equal(shareAttributes.get('aria-expanded'), 'true');
assert.equal(firstShareItemFocused, true);
detail.toggleShareMenu(false);
assert.equal(shareMenu.hidden, true);
assert.equal(shareAttributes.get('aria-expanded'), 'false');

detail.handleGiscusMetadata({
    origin: 'https://example.com',
    data: { giscus: { discussion: { url: 'https://github.com/OpenEnvision/BlogXiv/discussions/99' } } }
});
assert.equal(manageCommentsLink.href, 'https://github.com/OpenEnvision/BlogXiv/discussions/42');

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

const hyphenationSource = fs.readFileSync('site/assets/js/blog-hyphenation.js', 'utf8');
vm.runInContext(hyphenationSource, context);
const hyphenateTitle = context.window.BlogXivHyphenation.hyphenateTitle;
const hyphenatedResearch = hyphenateTitle('AI research');
assert.equal(hyphenatedResearch.replaceAll('\u00AD', ''), 'AI research');
assert.equal((hyphenatedResearch.match(/\u00AD/g) || []).length, 5);
const hyphenatedGemini = hyphenateTitle('Gemini');
assert.equal(hyphenatedGemini.replaceAll('\u00AD', ''), 'Gemini');
assert.equal((hyphenatedGemini.match(/\u00AD/g) || []).length, 3);
const hyphenatedDeployment = hyphenateTitle('Deployment');
assert.equal(hyphenatedDeployment.replaceAll('\u00AD', ''), 'Deployment');
assert.equal((hyphenatedDeployment.match(/\u00AD/g) || []).length, 7);

console.log('blog like tests passed');
