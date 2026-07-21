import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, script, migration] = await Promise.all([
  readFile(new URL('../site/blog-manager.html', import.meta.url), 'utf8'),
  readFile(new URL('../site/assets/js/pages/blog-manager.js', import.meta.url), 'utf8'),
  readFile(new URL('../supabase/migrations/20260721_blog_cover_storage.sql', import.meta.url), 'utf8')
]);

assert.match(html, /id="managerCoverFile"[^>]+accept="image\/jpeg,image\/png,image\/webp,image\/avif"/);
assert.match(html, /id="managerPublishBlog"[^>]+value="publish"/);
assert.match(script, /publishNow && !payload\.cover_image/);
assert.match(script, /if \(publishNow\) payload\.status = 'published'/);
assert.match(script, /\.from\('blog-covers'\)[\s\S]+\.upload\(objectPath, file/);
assert.match(script, /event === 'TOKEN_REFRESHED'/);
assert.match(script, /localStorage\.setItem\(this\.getDraftStorageKey\(\)/);
assert.match(script, /restoreEditorDraft\(\)/);
assert.match(script, /addEventListener\('beforeunload',[^\n]+saveEditorDraft\(\)/);
assert.match(script, /confirmDiscardChanges\('open another blog'\)/);
assert.match(migration, /'blog-covers',[\s\S]+true,[\s\S]+5242880/);
assert.match(migration, /auth\.jwt\(\) -> 'app_metadata' ->> 'role'\) = 'admin'/);

console.log('blog manager tests passed');
