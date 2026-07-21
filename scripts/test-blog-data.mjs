import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(path.join(repoRoot, 'site/assets/js/blog-data.js'), 'utf8');

const createContext = (fetch) => {
  const window = {
    AbortController,
    URL,
    clearTimeout,
    console,
    fetch,
    setTimeout
  };
  const context = vm.createContext({
    AbortController,
    URL,
    clearTimeout,
    console,
    setTimeout,
    window
  });
  vm.runInContext(source, context, { filename: 'blog-data.js' });
  return window;
};

let requestCount = 0;
const successWindow = createContext(async () => {
  requestCount += 1;
  return {
    ok: true,
    async json() {
      return [{
        id: 'test-blog',
        title: 'Test Blog',
        excerpt: 'Test excerpt',
        author: 'Test Author',
        author_avatar: 'avatar.png',
        category: 'Research Craft',
        tags: ['Testing'],
        read_time: '5 min read',
        publish_date: '2026-07-21',
        source_name: 'Test Source',
        url: 'https://example.com/test-blog',
        cover_image: 'cover.png',
        cover_alt: 'Test cover',
        cover_fit: 'contain'
      }];
    }
  };
});

const firstResult = await successWindow.BlogXivData.getPublishedBlogs([]);
const secondResult = await successWindow.BlogXivData.getPublishedBlogs([]);
assert.equal(requestCount, 1, 'Supabase requests should be cached');
assert.notEqual(firstResult, secondResult, 'Callers should receive separate arrays');
assert.deepEqual(JSON.parse(JSON.stringify(firstResult[0])), {
  id: 'test-blog',
  title: 'Test Blog',
  excerpt: 'Test excerpt',
  author: 'Test Author',
  authorAvatar: 'avatar.png',
  category: 'Research Craft',
  tags: ['Testing'],
  readTime: '5 min read',
  publishDate: '2026-07-21',
  sourceName: 'Test Source',
  url: 'https://example.com/test-blog',
  coverImage: 'cover.png',
  coverAlt: 'Test cover',
  coverFit: 'contain'
});

const fallback = [{ id: 'static-blog' }];
const fallbackWindow = createContext(async () => { throw new Error('offline'); });
const fallbackResult = await fallbackWindow.BlogXivData.getPublishedBlogs(fallback);
assert.deepEqual(JSON.parse(JSON.stringify(fallbackResult)), fallback);

console.log('blog data tests passed');
