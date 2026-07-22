#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(repoRoot, 'site/assets/js/app.js');
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

const usage = `Usage:
  node scripts/add_blog.mjs path/to/blog.json

Example:
  cp admin/new-blog-template.json admin/accepted-blog.json
  node scripts/add_blog.mjs admin/accepted-blog.json`;

const inputPath = process.argv[2];
if (!inputPath || inputPath === '-h' || inputPath === '--help') {
  console.log(usage);
  process.exit(inputPath ? 0 : 1);
}

const slugify = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 72);

const escapeJsString = (value) => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/'/g, "\\'")
  .replace(/\r?\n/g, ' ');

const estimateReadTime = (text) => {
  const wordCount = String(text || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
};

const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const validate = (blog) => {
  const required = ['title', 'excerpt', 'author', 'category', 'publishDate', 'sourceName', 'url'];
  const errors = [];

  required.forEach((field) => {
    if (!String(blog[field] || '').trim()) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (blog.category && !categories.has(blog.category)) {
    errors.push(`Unknown category: ${blog.category}`);
  }

  if (!Array.isArray(blog.tags) || blog.tags.length === 0) {
    errors.push('tags must be a non-empty array');
  }

  if (blog.publishDate && !/^\d{4}-\d{2}-\d{2}$/.test(blog.publishDate)) {
    errors.push('publishDate must use YYYY-MM-DD');
  }

  try {
    new URL(blog.url);
  } catch {
    errors.push('url must be a valid absolute URL');
  }

  return errors;
};

const formatBlog = (blog) => {
  const domain = getDomain(blog.url);
  const normalized = {
    id: blog.id || slugify(`${blog.author} ${blog.title}`),
    title: blog.title,
    excerpt: blog.excerpt,
    author: blog.author,
    authorAvatar: blog.authorAvatar || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : ''),
    category: blog.category,
    tags: blog.tags,
    readTime: blog.readTime || estimateReadTime(`${blog.title} ${blog.excerpt}`),
    publishDate: blog.publishDate,
    sourceName: blog.sourceName,
    url: blog.url,
    coverImage: blog.coverImage || '',
    coverAlt: blog.coverAlt || 'Editorial cover image',
    coverFit: blog.coverFit || 'cover'
  };

  const lines = [
    '            {',
    `                id: '${escapeJsString(normalized.id)}',`,
    `                title: '${escapeJsString(normalized.title)}',`,
    `                excerpt: '${escapeJsString(normalized.excerpt)}',`,
    `                author: '${escapeJsString(normalized.author)}',`,
    `                authorAvatar: '${escapeJsString(normalized.authorAvatar)}',`,
    `                category: '${escapeJsString(normalized.category)}',`,
    `                tags: [${normalized.tags.map((tag) => `'${escapeJsString(tag)}'`).join(', ')}],`,
    `                readTime: '${escapeJsString(normalized.readTime)}',`,
    `                publishDate: '${escapeJsString(normalized.publishDate)}',`,
    `                sourceName: '${escapeJsString(normalized.sourceName)}',`,
    `                url: '${escapeJsString(normalized.url)}',`,
    `                coverImage: '${escapeJsString(normalized.coverImage)}',`,
    `                coverAlt: '${escapeJsString(normalized.coverAlt)}',`,
    `                coverFit: '${escapeJsString(normalized.coverFit)}'`,
    '            }'
  ];

  return { id: normalized.id, block: lines.join('\n') };
};

const insertBlog = (source, block, id) => {
  if (source.includes(`id: '${id}'`) || source.includes(`id: "${id}"`)) {
    throw new Error(`A blog with id "${id}" already exists in app.js`);
  }

  const match = source.match(/(\n\s+getRecentCommunityBlogAdditions\(\)\s*\{\s*\n\s+return\s+\[\s*\n)/);
  if (!match || typeof match.index !== 'number') {
    throw new Error('Could not find getRecentCommunityBlogAdditions() insertion point');
  }

  const insertAt = match.index + match[0].length;
  return `${source.slice(0, insertAt)}${block},\n${source.slice(insertAt)}`;
};

const raw = await readFile(path.resolve(repoRoot, inputPath), 'utf8');
const blog = JSON.parse(raw);
const errors = validate(blog);
if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

const { id, block } = formatBlog(blog);
const source = await readFile(appPath, 'utf8');
const updated = insertBlog(source, block, id);
await writeFile(appPath, updated);

console.log(`Added blog "${id}" to site/assets/js/app.js`);
console.log('Next: run `node --check site/assets/js/app.js` and preview the site.');
