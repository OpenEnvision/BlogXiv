# Supabase Data Operations

BlogrXiv uses Supabase as the published blog metadata source and keeps the static corpus in `site/assets/js/app.js` as a read-only availability fallback.

## Public Runtime

`site/assets/js/blog-data.js` queries `public.blogs` through the Supabase REST API with the public publishable key. It reads only rows where `status = 'published'`, orders them by publication date, maps database snake_case columns to the existing browser data shape, and caches the request for all page controllers.

The publishable key is intentionally present in browser code. Never place a `service_role`, `sb_secret_` key, database password, JWT secret, or direct connection string in the repository.

## Required RLS Behavior

- `anon` and `authenticated` may select rows where `status = 'published'`.
- Only authenticated users whose `app_metadata.role` is `admin` may insert, update, or delete rows.
- Draft, pending, and hidden rows are not returned to the public website.

Add the authenticated admin read policy:

```sql
create policy "Admins can read all blogs"
on public.blogs
for select
to authenticated
using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

## Administrator Account

Create the account in Supabase Authentication, then assign its protected application metadata in the SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || '{"role":"admin"}'::jsonb
where email = 'YOUR_ADMIN_EMAIL';
```

Sign out and sign in again after changing the role so the refreshed access token contains `app_metadata.role = admin`. The public `site/blog-manager.html` page does not expose data-management controls to sessions without that role.

## Online Publishing And Covers

Run `supabase/migrations/20260721_blog_cover_storage.sql` in the Supabase SQL Editor. It creates a public `blog-covers` Storage bucket with a 5 MB file limit and permits only authenticated administrators to manage JPEG, PNG, WebP, and AVIF objects.

After the migration, an administrator can use `blog-manager.html` to create or edit all blog metadata, preview a local cover, upload it to Supabase Storage, save a draft, or publish immediately. `Publish now` writes `status = 'published'`, so the record becomes available to public pages without a Git commit or site redeployment. A cover is required for this action.

Unsaved editor fields are also cached in browser storage for seven days and restored for the same administrator after a refresh or session-token renewal. Browser security prevents restoring a locally selected file input, so upload the selected cover before leaving the page; an uploaded cover URL is restored with the other fields.

Uploaded files are not automatically removed when a blog is deleted or receives a replacement cover. This avoids deleting an object that another record might reference; unused objects can be removed manually in Supabase Storage.

## Static Corpus Export

Generate a validated Supabase import CSV with:

```bash
node scripts/export_blogs_for_supabase.mjs
```

The generated `admin/blogs-supabase-import.csv` is ignored by Git because it duplicates the static corpus. The exporter validates required fields, taxonomy values, date formats, tag arrays, cover-fit values, duplicate IDs, and duplicate canonical URLs before writing.

## Verification

```sql
select count(*) from public.blogs;

select status, count(*)
from public.blogs
group by status;

select category, count(*)
from public.blogs
where status = 'published'
group by category
order by category;
```

Run local regression checks with:

```bash
node scripts/test-blog-data.mjs
node scripts/test-blog-like.mjs
node scripts/test-blog-manager.mjs
node --check site/assets/js/app.js
```

## Failure Behavior

If Supabase times out, returns a non-success response, produces an invalid payload, or returns no published rows, the public pages use the static corpus from `app.js`. A warning is written to the browser console. This fallback protects availability, but database changes such as hiding a post will not affect the fallback corpus during an outage.

## Realtime Likes

Run `supabase/migrations/20260721_blog_likes.sql` in the Supabase SQL Editor. It creates private per-browser votes, public aggregate counts, an atomic toggle RPC, and adds the count table to the `supabase_realtime` publication.

Public clients may read `blog_like_counts` and execute `toggle_blog_like`. They cannot select `blog_votes` or directly update aggregate counts. The browser stores a random voter UUID locally, which prevents ordinary duplicate clicks but is not a substitute for authenticated voting or server-side abuse controls.
