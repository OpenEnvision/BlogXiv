#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(repoRoot, 'site/assets/js/app.js');
const upsertPath = path.join(repoRoot, 'admin/upsert-a-plus-blogs.sql');
const outputDir = path.join(repoRoot, 'site/assets/img/covers/real/a-plus');
const reportPath = path.join(repoRoot, 'reports/a-plus-real-cover-report.json');
const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36';

const htmlEntities = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>'
};

const decodeHtml = (value = '') => value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
  if (entity[0] === '#') {
    const isHex = entity[1]?.toLowerCase() === 'x';
    const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
    return Number.isFinite(code) ? String.fromCodePoint(code) : match;
  }
  return htmlEntities[entity] || match;
});

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapeJsString = (value) => String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const escapeSqlString = (value) => String(value ?? '').replace(/'/g, "''");
const shellQuote = (value) => `'${String(value).replace(/'/g, "'\\''")}'`;

const slugify = (value) => String(value || '')
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 74);

const getAttr = (tag, attrName) => {
  const match = tag.match(new RegExp(`${attrName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decodeHtml(match?.[2] || match?.[3] || match?.[4] || '');
};

const getFirstSrcsetUrl = (value = '') => value.split(',')[0]?.trim().split(/\s+/)[0] || value;

const absoluteUrl = (value, baseUrl) => {
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return '';
  try {
    return new URL(value.trim(), baseUrl).href;
  } catch {
    return '';
  }
};

const isUsefulImageUrl = (url) => {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  const lower = url.toLowerCase();
  const decoded = (() => {
    try {
      return decodeURIComponent(lower);
    } catch {
      return lower;
    }
  })();
  const haystack = `${lower} ${decoded}`;
  if (/\.(mp4|webm|mov|m4v|pdf)(\?|#|$)/.test(haystack)) return false;
  if (haystack.includes('favicon') || haystack.includes('apple-touch-icon')) return false;
  if (haystack.includes('gravatar') || haystack.includes('/avatar') || haystack.includes('profile')) return false;
  if (haystack.includes('/logo') || haystack.includes('huggingface_logo') || haystack.includes('/brand/')) return false;
  if (haystack.includes('pixel') || haystack.includes('tracking') || haystack.includes('spacer')) return false;
  if (haystack.endsWith('.ico')) return false;
  try {
    const width = Number.parseInt(new URL(url).searchParams.get('w') || '', 10);
    if (Number.isFinite(width) && width > 0 && width <= 128) return false;
  } catch {
    // Ignore URL parsing issues here.
  }
  return true;
};

const getMetaImages = (html, finalUrl) => {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const candidates = [];

  for (const tag of metaTags) {
    const key = (getAttr(tag, 'property') || getAttr(tag, 'name') || getAttr(tag, 'itemprop')).toLowerCase();
    if (!['og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image', 'twitter:image:src', 'image', 'thumbnailurl'].includes(key)) {
      continue;
    }
    const url = absoluteUrl(getAttr(tag, 'content'), finalUrl);
    if (isUsefulImageUrl(url)) candidates.push({ url, source: key });
  }

  return candidates;
};

const getJsonLdImages = (html, finalUrl) => {
  const scripts = html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
  const candidates = [];

  for (const script of scripts) {
    const jsonText = script.replace(/^<script\b[^>]*>/i, '').replace(/<\/script>$/i, '').trim();
    try {
      const parsed = JSON.parse(decodeHtml(jsonText));
      const queue = Array.isArray(parsed) ? [...parsed] : [parsed];
      while (queue.length) {
        const item = queue.shift();
        if (!item || typeof item !== 'object') continue;
        const image = item.image || item.thumbnailUrl;
        const imageValue = Array.isArray(image) ? image[0] : image;
        const raw = typeof imageValue === 'string'
          ? imageValue
          : (imageValue && typeof imageValue === 'object' ? imageValue.url : '');
        const url = absoluteUrl(raw, finalUrl);
        if (isUsefulImageUrl(url)) candidates.push({ url, source: 'json-ld:image' });
        queue.push(...Object.values(item).filter(value => value && typeof value === 'object'));
      }
    } catch {
      // Ignore malformed JSON-LD.
    }
  }

  return candidates;
};

const getFirstArticleImages = (html, finalUrl) => {
  const tags = html.match(/<(img|source)\b[^>]*>/gi) || [];
  const candidates = [];
  for (const tag of tags) {
    const srcset = getAttr(tag, 'srcset') || getAttr(tag, 'data-srcset');
    const raw = getAttr(tag, 'src') || getAttr(tag, 'data-src') || getAttr(tag, 'data-original') || getFirstSrcsetUrl(srcset);
    const url = absoluteUrl(raw, finalUrl);
    if (isUsefulImageUrl(url)) candidates.push({ url, source: 'first-image' });
  }
  return candidates;
};

const chooseImages = (html, finalUrl) => [
  ...getMetaImages(html, finalUrl),
  ...getJsonLdImages(html, finalUrl),
  ...getFirstArticleImages(html, finalUrl)
].filter((candidate, index, all) => all.findIndex(item => item.url === candidate.url) === index);

const runCurl = async (args, options = {}) => {
  const command = ['curl', ...args.map(shellQuote)].join(' ');
  return execFileAsync('/bin/zsh', ['-lc', command], {
    maxBuffer: options.maxBuffer || 20 * 1024 * 1024
  });
};

const curlText = async (url) => {
  const { stdout } = await runCurl([
    '-L',
    '-sS',
    '--retry',
    '2',
    '--retry-delay',
    '1',
    '--max-time',
    '30',
    '-A',
    userAgent,
    url
  ], { maxBuffer: 20 * 1024 * 1024 });
  return stdout;
};

const curlDownload = async (url, outputPath) => {
  await runCurl([
    '-L',
    '-sS',
    '--retry',
    '2',
    '--retry-delay',
    '1',
    '--max-time',
    '45',
    '-A',
    userAgent,
    '-o',
    outputPath,
    url
  ], { maxBuffer: 1024 * 1024 });
};

const detectExtension = (buffer, sourceUrl) => {
  const start = buffer.subarray(0, 64).toString('utf8').trimStart().toLowerCase();
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (buffer.length >= 6 && buffer.subarray(0, 6).toString('ascii').startsWith('GIF')) return 'gif';
  if (start.startsWith('<svg') || start.startsWith('<?xml')) return 'svg';
  try {
    const ext = path.extname(new URL(sourceUrl).pathname).replace('.', '').toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(ext)) return ext === 'jpeg' ? 'jpg' : ext;
  } catch {
    // Ignore.
  }
  return '';
};

const parseAPlusBlogs = (source) => {
  const objectMatches = source.match(/\{\n\s+id: '[^']+',[\s\S]*?\n\s+\}/g) || [];
  return objectMatches.map((objectText) => {
    const field = (name) => objectText.match(new RegExp(`${name}: '((?:\\\\'|[^'])*)'`))?.[1]?.replace(/\\'/g, "'") || '';
    return {
      id: field('id'),
      title: field('title'),
      url: field('url'),
      coverImage: field('coverImage')
    };
  }).filter(blog => blog.coverImage.startsWith('assets/img/covers/a-plus/'));
};

const replaceCoverInApp = (source, blog, newCover, sourceLabel) => {
  const objectPattern = new RegExp(`(\\{\\n\\s+id: '${escapeRegex(escapeJsString(blog.id))}',[\\s\\S]*?\\n\\s+\\})`, 'm');
  const match = source.match(objectPattern);
  if (!match) return source;
  let objectText = match[1];
  objectText = objectText.replace(/coverImage: '[^']*',/, `coverImage: '${escapeJsString(newCover)}',`);
  objectText = objectText.replace(/coverAlt: '[^']*',/, `coverAlt: 'Real cover from ${escapeJsString(sourceLabel)}',`);
  return source.slice(0, match.index) + objectText + source.slice(match.index + match[1].length);
};

const replaceCoverInSql = (source, oldCover, newCover, sourceLabel) => source
  .replaceAll(`'${escapeSqlString(oldCover)}'`, `'${escapeSqlString(newCover)}'`)
  .replaceAll(/'[^']* A\+ BlogrXiv cover'/g, (match) => match)
  .replaceAll(
    `'${escapeSqlString(oldCover.replace(/^assets\/img\/covers\/a-plus\//, '').replace(/\.svg$/, ''))} A+ BlogrXiv cover'`,
    `'Real cover from ${escapeSqlString(sourceLabel)}'`
  );

await mkdir(outputDir, { recursive: true });
await mkdir(path.dirname(reportPath), { recursive: true });

let appSource = await readFile(appPath, 'utf8');
let upsertSource = await readFile(upsertPath, 'utf8');
const blogs = parseAPlusBlogs(appSource);
const successes = [];
const failures = [];

for (const [index, blog] of blogs.entries()) {
  process.stderr.write(`[${index + 1}/${blogs.length}] ${blog.title}\n`);
  try {
    if (blog.url.toLowerCase().endsWith('.pdf')) {
      failures.push({ ...blog, reason: 'PDF source; keeping generated SVG cover' });
      continue;
    }

    const html = await curlText(blog.url);
    const candidates = chooseImages(html, blog.url);
    if (!candidates.length) {
      failures.push({ ...blog, reason: 'No useful image found in page metadata or article images' });
      continue;
    }

    let downloaded = null;
    for (const candidate of candidates.slice(0, 5)) {
      const tempPath = path.join(outputDir, `${slugify(blog.title)}.download`);
      try {
        await curlDownload(candidate.url, tempPath);
        const buffer = await readFile(tempPath);
        if (buffer.length < 1024) {
          await rm(tempPath, { force: true });
          continue;
        }
        const extension = detectExtension(buffer, candidate.url);
        if (!extension) {
          await rm(tempPath, { force: true });
          continue;
        }
        const fileName = `${slugify(blog.title)}.${extension}`;
        const finalPath = path.join(outputDir, fileName);
        await rename(tempPath, finalPath);
        downloaded = {
          ...candidate,
          coverImage: `assets/img/covers/real/a-plus/${fileName}`,
          bytes: buffer.length
        };
        break;
      } catch (error) {
        await rm(tempPath, { force: true });
      }
    }

    if (!downloaded) {
      failures.push({ ...blog, reason: 'Image candidates found but downloads were unusable', candidates });
      continue;
    }

    appSource = replaceCoverInApp(appSource, blog, downloaded.coverImage, downloaded.source);
    upsertSource = upsertSource.replaceAll(`'${escapeSqlString(blog.coverImage)}'`, `'${escapeSqlString(downloaded.coverImage)}'`);
    upsertSource = upsertSource.replace(
      `'${escapeSqlString(blog.title)} A+ BlogrXiv cover'`,
      `'Real cover from ${escapeSqlString(downloaded.source)}'`
    );
    successes.push({ ...blog, ...downloaded });
  } catch (error) {
    failures.push({ ...blog, reason: error.message });
  }
}

await writeFile(appPath, appSource, 'utf8');
await writeFile(upsertPath, upsertSource, 'utf8');
await writeFile(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  processed: blogs.length,
  successes,
  failures
}, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  processed: blogs.length,
  downloaded: successes.length,
  keptGenerated: failures.length,
  outputDir: path.relative(repoRoot, outputDir),
  report: path.relative(repoRoot, reportPath)
}, null, 2));
