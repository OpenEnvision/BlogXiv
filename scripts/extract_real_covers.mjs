import fs from 'node:fs';

const scriptPath = new URL('../site/assets/js/app.js', import.meta.url);
const scriptText = fs.readFileSync(scriptPath, 'utf8');

const methodStart = scriptText.indexOf('getCuratedCommunityBlogs()');
const arrayStart = scriptText.indexOf('const blogs = [', methodStart) + 'const blogs = '.length;
const arrayEnd = scriptText.indexOf('\n        ];', arrayStart) + '\n        ]'.length;
const blogs = Function(`return ${scriptText.slice(arrayStart, arrayEnd)};`)();

const genericPrefix = 'assets/img/covers/';
const truncatedSubstackCover = /^https:\/\/substackcdn\.com\/image\/fetch\/\$s_![^,/]+!?$/;
const targetBlogs = blogs.filter(blog => {
  const coverImage = String(blog.coverImage || '');
  return coverImage.startsWith(genericPrefix) || truncatedSubstackCover.test(coverImage);
});
const limit = Number.parseInt(process.env.COVER_LIMIT || '', 10);
const selectedBlogs = Number.isFinite(limit) && limit > 0 ? targetBlogs.slice(0, limit) : targetBlogs;

const htmlEntities = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>'
};

function decodeHtml(value = '') {
  return value.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity[0] === '#') {
      const isHex = entity[1]?.toLowerCase() === 'x';
      const code = Number.parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : match;
    }
    return htmlEntities[entity] || match;
  });
}

function getAttr(tag, attrName) {
  const match = tag.match(new RegExp(`${attrName}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return decodeHtml(match?.[2] || match?.[3] || match?.[4] || '');
}

function getFirstSrcsetUrl(value = '') {
  return value.split(',')[0]?.trim().split(/\s+/)[0] || value;
}

function absoluteUrl(value, baseUrl) {
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return '';
  try {
    return new URL(value.trim(), baseUrl).href;
  } catch {
    return '';
  }
}

function isUsefulImageUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  const lower = url.toLowerCase();
  if (lower.includes('favicon') || lower.includes('apple-touch-icon')) return false;
  if (lower.includes('gravatar') || lower.includes('/avatar') || lower.includes('profile')) return false;
  if (lower.includes('pixel') || lower.includes('tracking') || lower.includes('spacer')) return false;
  if (lower.endsWith('.ico')) return false;
  return true;
}

function getMetaImage(html, finalUrl) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  const candidates = [];

  for (const tag of metaTags) {
    const key = (getAttr(tag, 'property') || getAttr(tag, 'name') || getAttr(tag, 'itemprop')).toLowerCase();
    if (!['og:image', 'og:image:url', 'og:image:secure_url', 'twitter:image', 'twitter:image:src', 'image', 'thumbnailurl'].includes(key)) {
      continue;
    }
    const content = getAttr(tag, 'content');
    const url = absoluteUrl(content, finalUrl);
    if (isUsefulImageUrl(url)) {
      candidates.push({ url, source: key });
    }
  }

  return candidates[0] || null;
}

function getJsonLdImage(html, finalUrl) {
  const scripts = html.match(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi) || [];
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
        if (isUsefulImageUrl(url)) return { url, source: 'json-ld:image' };
        queue.push(...Object.values(item).filter(value => value && typeof value === 'object'));
      }
    } catch {
      // Ignore malformed JSON-LD.
    }
  }
  return null;
}

function getFirstArticleImage(html, finalUrl) {
  const tags = html.match(/<(img|source)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const srcset = getAttr(tag, 'srcset') || getAttr(tag, 'data-srcset');
    const raw = getAttr(tag, 'src') || getAttr(tag, 'data-src') || getAttr(tag, 'data-original') || getFirstSrcsetUrl(srcset);
    const url = absoluteUrl(raw, finalUrl);
    if (isUsefulImageUrl(url)) return { url, source: 'first-image' };
  }
  return null;
}

function chooseImage(html, finalUrl) {
  return getMetaImage(html, finalUrl) || getJsonLdImage(html, finalUrl) || getFirstArticleImage(html, finalUrl);
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36'
      }
    });
    const text = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url || url,
      html: text
    };
  } finally {
    clearTimeout(timeout);
  }
}

const suggestions = [];
const failures = [];

for (const [index, blog] of selectedBlogs.entries()) {
  process.stderr.write(`[${index + 1}/${selectedBlogs.length}] ${blog.id}\n`);
  try {
    const result = await fetchHtml(blog.url);
    const image = chooseImage(result.html, result.finalUrl);
    if (image) {
      suggestions.push({
        id: blog.id,
        title: blog.title,
        url: blog.url,
        currentCover: blog.coverImage,
        image: image.url,
        source: image.source,
        status: result.status
      });
    } else {
      failures.push({
        id: blog.id,
        title: blog.title,
        url: blog.url,
        currentCover: blog.coverImage,
        status: result.status,
        reason: result.ok ? 'no image found' : 'http error without image'
      });
    }
  } catch (error) {
    failures.push({
      id: blog.id,
      title: blog.title,
      url: blog.url,
      currentCover: blog.coverImage,
      reason: error.message
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  totalBlogs: blogs.length,
  targetLocalCovers: targetBlogs.length,
  processed: selectedBlogs.length,
  suggestions,
  failures
};

const reportsDir = new URL('../reports/', import.meta.url);
fs.mkdirSync(reportsDir, { recursive: true });
fs.writeFileSync(new URL('cover-audit-report.json', reportsDir), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({
  totalBlogs: report.totalBlogs,
  targetLocalCovers: report.targetLocalCovers,
  processed: report.processed,
  suggestions: suggestions.length,
  failures: failures.length,
  report: 'reports/cover-audit-report.json'
}, null, 2));
