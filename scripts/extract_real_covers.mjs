import fs from 'node:fs';
import vm from 'node:vm';

const scriptPath = new URL('../site/assets/js/app.js', import.meta.url);
const scriptText = fs.readFileSync(scriptPath, 'utf8');

function createElementStub() {
  return {
    style: {},
    classList: {
      add() {},
      remove() {},
      toggle() {}
    },
    dataset: {},
    setAttribute() {},
    appendChild() {},
    insertBefore() {},
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
}

const documentStub = {
  addEventListener() {},
  createElement: createElementStub,
  head: createElementStub(),
  body: createElementStub(),
  documentElement: createElementStub(),
  querySelector() { return null; },
  querySelectorAll() { return []; },
  getElementById() { return null; }
};

const sandbox = {
  console,
  document: documentStub,
  localStorage: {
    getItem() { return null; },
    setItem() {}
  },
  window: {
    matchMedia() {
      return {
        matches: false,
        addEventListener() {},
        removeEventListener() {}
      };
    }
  }
};
vm.createContext(sandbox);
vm.runInContext(`${scriptText}\nthis.BlogXiv = BlogXiv;`, sandbox);
const blogXiv = Object.create(sandbox.BlogXiv.prototype);
const blogs = blogXiv.getCuratedCommunityBlogs();

const localSvgPlaceholder = /^assets\/img\/covers\/(?!real\/).+\.svg$/;
const truncatedSubstackCover = /^https:\/\/substackcdn\.com\/image\/fetch\/\$s_![^,/]+!?$/;
const targetBlogs = blogs.filter(blog => {
  const coverImage = String(blog.coverImage || '');
  return localSvgPlaceholder.test(coverImage) || truncatedSubstackCover.test(coverImage);
});
const limit = Number.parseInt(process.env.COVER_LIMIT || '', 10);
const selectedBlogs = Number.isFinite(limit) && limit > 0 ? targetBlogs.slice(0, limit) : targetBlogs;

const manualImageOverrides = {
  'openai-codex-agent-loop': {
    image: 'https://images.ctfassets.net/kftzwdyauwt9/6o1H1yOkWlMxAOLzzsBAjJ/b45d21128635360c408f43da0138b319/Agent_loop_desktop-light.svg?q=90&w=3840',
    source: 'manual:openai-article-image'
  },
  'transformer-circuits-mathematical-framework': {
    image: 'https://cdn.sanity.io/images/4zrzovbb/website/6d4a0d28992ade92d6fa63646fd9c9d318245c6c-2400x1260.jpg',
    source: 'manual:anthropic-official-mirror'
  },
  'openai-parameter-golf': {
    image: 'https://images.ctfassets.net/kftzwdyauwt9/6PRLQARXtH3sfsTBcHlufc/ac545b82a82009609194d64e34538e62/SEO.png?fit=fill&h=900&w=1600',
    source: 'manual:openai-article-image'
  },
  'iclr2026-unigramlm-manual': {
    image: 'assets/img/covers/real/iclr2026-unigramlm-manual.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2026-precision-extraction': {
    image: 'assets/img/covers/real/iclr2026-precision-extraction.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2026-llm-bitter-lesson': {
    image: 'assets/img/covers/real/iclr2026-llm-bitter-lesson.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2026-layered-ontology-model': {
    image: 'assets/img/covers/real/iclr2026-layered-ontology-model.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2025-do-not-write-jailbreak-papers': {
    image: 'assets/img/covers/real/iclr2025-do-not-write-jailbreak-papers.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2025-llm-democracy': {
    image: 'assets/img/covers/real/iclr2025-llm-democracy.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2025-vlm-understanding': {
    image: 'assets/img/covers/real/iclr2025-vlm-understanding.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2025-steering-llms-behavior': {
    image: 'assets/img/covers/real/iclr2025-steering-llms-behavior.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2024-language-model-development-as-a-new-subfield': {
    image: 'assets/img/covers/real/iclr2024-language-model-development-as-a-new-subfield.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2024-dpi-fsvi': {
    image: 'assets/img/covers/real/iclr2024-dpi-fsvi.png',
    source: 'manual:original-page-screenshot'
  },
  'iclr2022-representation-change-in-model-agnostic-meta-learning': {
    image: 'assets/img/covers/real/iclr2022-representation-change-in-model-agnostic-meta-learning.png',
    source: 'manual:original-page-screenshot'
  },
  'yao-fu-gpt-ability-sources': {
    image: 'assets/img/covers/real/yao-fu-gpt-ability-sources.png',
    source: 'manual:original-page-screenshot'
  },
  'karpathy-recipe-training-neural-networks': {
    image: 'assets/img/covers/real/karpathy-recipe-training-neural-networks.png',
    source: 'manual:original-page-screenshot'
  },
  'lesswrong-review-accidental-cot-grading': {
    image: 'assets/img/covers/real/lesswrong-review-accidental-cot-grading.png',
    source: 'manual:original-page-screenshot'
  }
};

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
  const decoded = (() => {
    try {
      return decodeURIComponent(lower);
    } catch {
      return lower;
    }
  })();
  const haystack = `${lower} ${decoded}`;
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/.test(haystack)) return false;
  if (haystack.includes('favicon') || haystack.includes('apple-touch-icon')) return false;
  if (haystack.includes('gravatar') || haystack.includes('/avatar') || haystack.includes('profile')) return false;
  if (haystack.includes('rssicon') || haystack.includes('colab-badge')) return false;
  if (haystack.includes('logo') || haystack.includes('/brand/') || haystack.includes('memoji')) return false;
  if (haystack.includes('/images/meta/default') || haystack.includes('gfg_200x200')) return false;
  if (haystack.includes('public/opengraph-image.png')) return false;
  if (haystack.includes('cognition.ai/opengraph-image.jpg')) return false;
  if (haystack.includes('thoughtfullab.com/assets/images/social-thumbnail.png')) return false;
  if (haystack.includes('new_mississippi_river_fjdmww.jpg')) return false;
  if (haystack.includes('pixel') || haystack.includes('tracking') || haystack.includes('spacer')) return false;
  if (haystack.endsWith('.ico')) return false;
  try {
    const width = Number.parseInt(new URL(url).searchParams.get('w') || '', 10);
    if (Number.isFinite(width) && width > 0 && width <= 128) return false;
  } catch {
    // Ignore URLs that passed the absolute URL check but still fail URL parsing.
  }
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
  const manualImage = manualImageOverrides[blog.id];
  if (manualImage) {
    suggestions.push({
      id: blog.id,
      title: blog.title,
      url: blog.url,
      currentCover: blog.coverImage,
      image: manualImage.image,
      source: manualImage.source,
      status: 'manual'
    });
    continue;
  }

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
