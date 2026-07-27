-- Upsert the FLUX 3 BlogrXiv entry.

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
) values (
  'black-forest-labs-flux-3-real-world-models',
  'FLUX 3 - Real World Models: Towards Multimodal Flow Models as the Backbone of Visual Intelligence',
  'Black Forest Labs introduces FLUX 3, a multimodal flow model trained jointly across images, video, audio, language, and action prediction, positioning visual generation as a foundation for real-world visual intelligence.',
  'Black Forest Labs',
  'https://www.google.com/s2/favicons?domain=bfl.ai&sz=128',
  'Visual Generation',
  array['FLUX 3', 'Multimodal Flow Models', 'Video Generation', 'Physical AI'],
  '5 min read',
  '2026-07-23',
  'Black Forest Labs',
  'https://bfl.ai/blog/flux-3',
  'assets/img/covers/real/flux3.png',
  'FLUX 3 article cover',
  'cover',
  'published',
  false
)
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

select id, title, category, publish_date, status
from public.blogs
where id = 'black-forest-labs-flux-3-real-world-models';
