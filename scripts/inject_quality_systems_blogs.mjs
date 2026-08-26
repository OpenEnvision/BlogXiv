#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = path.join(repoRoot, 'admin/accepted-quality-systems-craft-frontier.json');
const appPath = path.join(repoRoot, 'site/assets/js/app.js');
const sqlPath = path.join(repoRoot, 'admin/upsert-quality-systems-craft-frontier.sql');
const coverDir = path.join(repoRoot, 'site/assets/img/covers/real');
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36';

const escapeJs = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const escapeSql = (value) => String(value ?? '').replace(/'/g, "''");
const domainOf = (url) => {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
};

const decodeHtml = (value = '') => value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
  if (entity[0] === '#') {
    const isHex = entity[1]?.toLowerCase() === 'x';
    const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : match;
  }
  return ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[entity] || match;
});

const getAttr = (tag, attrName) => {
  const match = tag.match(new RegExp(`${attrName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decodeHtml(match?.[2] || match?.[3] || match?.[4] || '');
};

const pickOgImage = (html, baseUrl) => {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const prop = `${getAttr(tag, 'property')} ${getAttr(tag, 'name')}`.toLowerCase();
    if (prop.includes('og:image') || prop.includes('twitter:image')) {
      const content = getAttr(tag, 'content');
      if (content) {
        try { return new URL(content, baseUrl).href; } catch { /* ignore */ }
      }
    }
  }
  return '';
};

const extensionOf = (url) => {
  const clean = url.split('?')[0].toLowerCase();
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'jpg';
  if (clean.endsWith('.webp')) return 'webp';
  if (clean.endsWith('.gif')) return 'gif';
  if (clean.endsWith('.svg')) return 'svg';
  return 'png';
};

const fetchText = async (url) => {
  const response = await fetch(url, { headers: { 'user-agent': userAgent, accept: 'text/html' }, redirect: 'follow' });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return { html: await response.text(), finalUrl: response.url };
};

const downloadCover = async (blog) => {
  const domain = domainOf(blog.url);
  try {
    const { html, finalUrl } = await fetchText(blog.url);
    const imageUrl = pickOgImage(html, finalUrl);
    if (!imageUrl) return blog.coverImage || '';
    const imageResponse = await fetch(imageUrl, { headers: { 'user-agent': userAgent }, redirect: 'follow' });
    if (!imageResponse.ok) return imageUrl;
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    if (buffer.length < 800) return imageUrl;
    await mkdir(coverDir, { recursive: true });
    const ext = extensionOf(imageUrl);
    const fileName = `${blog.id}.${ext}`;
    await writeFile(path.join(coverDir, fileName), buffer);
    return `assets/img/covers/real/${fileName}`;
  } catch {
    return blog.coverImage || '';
  }
};

const formatJsBlog = (blog) => `            {
                id: '${escapeJs(blog.id)}',
                title: '${escapeJs(blog.title)}',
                excerpt: '${escapeJs(blog.excerpt)}',
                author: '${escapeJs(blog.author)}',
                authorAvatar: '${escapeJs(blog.authorAvatar)}',
                category: '${escapeJs(blog.category)}',
                tags: [${blog.tags.map((tag) => `'${escapeJs(tag)}'`).join(', ')}],
                readTime: '${escapeJs(blog.readTime)}',
                publishDate: '${escapeJs(blog.publishDate)}',
                sourceName: '${escapeJs(blog.sourceName)}',
                url: '${escapeJs(blog.url)}',
                coverImage: '${escapeJs(blog.coverImage)}',
                coverAlt: '${escapeJs(blog.coverAlt)}',
                coverFit: '${escapeJs(blog.coverFit || 'cover')}'
            }`;

const formatSqlRow = (blog) => `(
  '${escapeSql(blog.id)}',
  '${escapeSql(blog.title)}',
  '${escapeSql(blog.excerpt)}',
  '${escapeSql(blog.author)}',
  '${escapeSql(blog.authorAvatar)}',
  '${escapeSql(blog.category)}',
  array[${blog.tags.map((tag) => `'${escapeSql(tag)}'`).join(',')}],
  '${escapeSql(blog.readTime)}',
  '${escapeSql(blog.publishDate)}',
  '${escapeSql(blog.sourceName)}',
  '${escapeSql(blog.url)}',
  '${escapeSql(blog.coverImage)}',
  '${escapeSql(blog.coverAlt)}',
  '${escapeSql(blog.coverFit || 'cover')}',
  'published',
  false
)`;

const blogs = JSON.parse(await readFile(jsonPath, 'utf8'));
const enriched = [];
for (const blog of blogs) {
  const domain = domainOf(blog.url);
  const next = {
    ...blog,
    authorAvatar: blog.authorAvatar || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : ''),
    coverAlt: blog.coverAlt || `${blog.title} article cover`,
    coverFit: blog.coverFit || 'cover'
  };
  if (!next.coverImage || next.coverImage.startsWith('http')) {
    const local = await downloadCover(next);
    if (local) next.coverImage = local;
  }
  if (!next.coverImage) {
    next.coverImage = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  enriched.push(next);
  process.stdout.write(`prepared ${next.id}\n`);
}

const method = `    getQualitySystemsCraftFrontierBlogs() {
        return [
${enriched.map(formatJsBlog).join(',\n')}
        ];
    }

`;

let source = await readFile(appPath, 'utf8');
if (!source.includes('getQualitySystemsCraftFrontierBlogs()')) {
  source = source.replace(
    '    getCuratedCommunityBlogs() {',
    `${method}    getCuratedCommunityBlogs() {`
  );
  source = source.replace(
    '...this.getRecentCommunityBlogAdditions(),',
    '...this.getRecentCommunityBlogAdditions(),\n            ...this.getQualitySystemsCraftFrontierBlogs(),'
  );
  await writeFile(appPath, source);
}

await writeFile(jsonPath, `${JSON.stringify(enriched, null, 2)}\n`);
await writeFile(sqlPath, `-- Quality pass: Efficient AI, Trustworthy AI, Research Craft, Frontier.
-- Run in the Supabase SQL Editor for the public BlogrXiv project.

insert into public.blogs (
  id,
  title,
  excerpt,
  author,
  author_avatar,
  category,
  tags,
  read_time,
  publish_date,
  source_name,
  url,
  cover_image,
  cover_alt,
  cover_fit,
  status,
  featured
) values
${enriched.map(formatSqlRow).join(',\n')}
on conflict (id) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  author = excluded.author,
  author_avatar = excluded.author_avatar,
  category = excluded.category,
  tags = excluded.tags,
  read_time = excluded.read_time,
  publish_date = excluded.publish_date,
  source_name = excluded.source_name,
  url = excluded.url,
  cover_image = excluded.cover_image,
  cover_alt = excluded.cover_alt,
  cover_fit = excluded.cover_fit,
  status = excluded.status;

`);

console.log(`injected ${enriched.length} blogs`);
