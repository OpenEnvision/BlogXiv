import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('site/assets/js/pages/highlights.js', 'utf8');
const context = {
  console,
  document: { addEventListener() {} },
  window: { addEventListener() {} }
};

vm.createContext(context);
vm.runInContext(`${source}\n;globalThis.HighlightsPageForTest = HighlightsPage;`, context);

const page = Object.create(context.HighlightsPageForTest.prototype);
page.blogs = [
  { id: 'older', title: 'Older', likeCount: 9, publishDate: '2026-01-01' },
  { id: 'lower', title: 'Lower', likeCount: 3, publishDate: '2026-07-21' },
  { id: 'newer-z', title: 'Zulu', likeCount: 9, publishDate: '2026-07-20' },
  { id: 'newer-a', title: 'Alpha', likeCount: 9, publishDate: '2026-07-20' }
];

page.sortBlogs();
assert.deepEqual(page.blogs.map((blog) => blog.id), ['newer-a', 'newer-z', 'older', 'lower']);
assert.equal(page.getDateValue('invalid'), 0);
assert.equal(page.escapeHTML('<Research & Safety>'), '&lt;Research &amp; Safety&gt;');

console.log('highlights tests passed');
