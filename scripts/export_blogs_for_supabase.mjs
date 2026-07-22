#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(repoRoot, 'site/assets/js/app.js');
const outputPath = path.resolve(repoRoot, process.argv[2] || 'admin/blogs-supabase-import.csv');

const categories = new Set([
  'Foundation Model',
  'LLM & MLLM',
  'Multimodal Model',
  'Visual Generation',
  'World Model',
  'AI Agents',
  'Efficient AI',
  'Trustworthy AI',
  'Research Craft',
  'Frontier Developments',
  'Research Experience'
]);

const createElementStub = () => ({
  addEventListener() {},
  appendChild() {},
  classList: { add() {}, remove() {}, toggle() {} },
  dataset: {},
  querySelector() { return null; },
  querySelectorAll() { return []; },
  setAttribute() {},
  style: {}
});

const windowStub = {
  addEventListener() {},
  location: { href: 'https://blogxiv.org/', pathname: '/', search: '' },
  matchMedia: () => ({ addEventListener() {}, matches: true }),
  requestAnimationFrame(callback) { callback(); },
  setTimeout() { return 0; }
};

const documentStub = {
  addEventListener() {},
  body: createElementStub(),
  createElement: createElementStub,
  documentElement: createElementStub(),
  getElementById() { return null; },
  head: createElementStub(),
  querySelector() { return null; },
  querySelectorAll() { return []; }
};

const sandbox = {
  URL,
  URLSearchParams,
  clearTimeout() {},
  console,
  document: documentStub,
  localStorage: { getItem() { return null; }, setItem() {} },
  navigator: {},
  setTimeout() { return 0; },
  window: windowStub
};

windowStub.document = documentStub;
windowStub.localStorage = sandbox.localStorage;
windowStub.navigator = sandbox.navigator;
windowStub.window = windowStub;

const source = await readFile(appPath, 'utf8');
const context = vm.createContext(sandbox);
vm.runInContext(`${source}\n;globalThis.__BlogXiv = BlogXiv;`, context, { filename: appPath });

const BlogXiv = context.__BlogXiv;
if (!BlogXiv?.prototype?.getCuratedCommunityBlogs) {
  throw new Error('Could not load BlogXiv.getCuratedCommunityBlogs() from app.js');
}

const blogs = BlogXiv.prototype.getCuratedCommunityBlogs();
if (!Array.isArray(blogs) || blogs.length === 0) {
  throw new Error('The static corpus is empty');
}

const requiredFields = ['id', 'title', 'excerpt', 'author', 'category', 'publishDate', 'sourceName', 'url'];
const errors = [];
const ids = new Map();
const urls = new Map();

blogs.forEach((blog, index) => {
  const label = `row ${index + 1} (${blog?.id || 'missing id'})`;

  requiredFields.forEach((field) => {
    if (!String(blog?.[field] ?? '').trim()) errors.push(`${label}: missing ${field}`);
  });

  if (blog?.category && !categories.has(blog.category)) {
    errors.push(`${label}: unsupported category "${blog.category}"`);
  }

  if (blog?.publishDate && !/^\d{4}-\d{2}-\d{2}$/.test(blog.publishDate)) {
    errors.push(`${label}: invalid publishDate "${blog.publishDate}"`);
  }

  if (!Array.isArray(blog?.tags)) errors.push(`${label}: tags must be an array`);
  if (blog?.coverFit && !['cover', 'contain'].includes(blog.coverFit)) {
    errors.push(`${label}: unsupported coverFit "${blog.coverFit}"`);
  }

  const id = String(blog?.id || '');
  const url = String(blog?.url || '');
  if (ids.has(id)) errors.push(`${label}: duplicate id also used by row ${ids.get(id)}`);
  if (urls.has(url)) errors.push(`${label}: duplicate URL also used by row ${urls.get(url)}`);
  ids.set(id, index + 1);
  urls.set(url, index + 1);
});

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

const toPostgresArray = (values) => `{${values.map((value) => `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
const columns = [
  'id', 'title', 'excerpt', 'author', 'author_avatar', 'category', 'tags', 'read_time',
  'publish_date', 'source_name', 'url', 'cover_image', 'cover_alt', 'cover_fit', 'status', 'featured'
];

const rows = blogs.map((blog) => [
  blog.id,
  blog.title,
  blog.excerpt,
  blog.author,
  blog.authorAvatar || '',
  blog.category,
  toPostgresArray(blog.tags || []),
  blog.readTime || '',
  blog.publishDate,
  blog.sourceName,
  blog.url,
  blog.coverImage || '',
  blog.coverAlt || blog.title,
  blog.coverFit || 'cover',
  'published',
  'false'
]);

const csv = [columns.map(csvCell), ...rows.map((row) => row.map(csvCell))]
  .map((row) => row.join(','))
  .join('\n') + '\n';

await writeFile(outputPath, csv, 'utf8');
console.log(`Exported ${rows.length} blogs to ${path.relative(repoRoot, outputPath)}`);
