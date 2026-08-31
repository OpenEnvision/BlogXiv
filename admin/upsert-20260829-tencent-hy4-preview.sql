-- Add the Tencent Hy4 preview blog to Supabase public.blogs.
-- The page is a foundation-model release: 770B MoE (49B active), 1M-token context,
-- recursive self-improvement loop optimizing its own training, data, evaluation and
-- inference stack, open weights and code under a permissive commercial license.
insert into public.blogs (id, title, excerpt, author, author_avatar, category, tags, read_time, publish_date, source_name, url, cover_image, cover_alt, cover_fit, status, featured)
values
('tencent-hy4-preview', 'Introducing Hy4 preview', 'Tencent Hunyuan releases Hy4 preview, a 770B-parameter MoE (49B active) with a 1M-token context and a recursive self-improvement loop in which the model participates in optimizing its own training methods, data strategy, evaluation, and inference operators, yielding a 31.8% end-to-end throughput gain; weights and code are open under a permissive commercial license.', 'Tencent Hunyuan', 'https://www.google.com/s2/favicons?domain=tencent.com&sz=128', 'Foundation Model', array['Hunyuan Hy4','MoE','Open Weights','1M Context','Recursive Self-Improvement','Model Release'], '10 min read', '2026-08-29', 'Tencent Hunyuan', 'https://hy.tencent.ai/research/hy4-preview', 'assets/img/covers/real/tencent-hy4-preview.jpg', 'Tencent Hy4 preview article cover', 'cover', 'published', false)
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
  status = excluded.status,
  featured = excluded.featured;
