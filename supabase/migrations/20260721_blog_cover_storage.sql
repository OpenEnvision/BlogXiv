-- Public blog covers with write access restricted to BlogrXiv administrators.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-covers',
  'blog-covers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can read blog covers" on storage.objects;
create policy "Admins can read blog covers"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'blog-covers'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can upload blog covers" on storage.objects;
create policy "Admins can upload blog covers"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'blog-covers'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can update blog covers" on storage.objects;
create policy "Admins can update blog covers"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'blog-covers'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
  bucket_id = 'blog-covers'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

drop policy if exists "Admins can delete blog covers" on storage.objects;
create policy "Admins can delete blog covers"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'blog-covers'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);
