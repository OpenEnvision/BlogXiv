-- Upsert the four retained blogs from the image-link batch.
-- Run this file in the Supabase SQL Editor.

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
(
  'meta-circle-ophis-autoresearch',
  'Ophis: A New Paradigm for Autoresearch',
  'Meta Circle introduces Ophis and a new autoresearch workflow for using AI systems to explore, execute, and refine research ideas with less manual orchestration.',
  'Meta Circle',
  'https://www.google.com/s2/favicons?domain=meta-circle.com&sz=128',
  'AI Agents',
  array['Autoresearch', 'Research Agents', 'Automation', 'Scientific Discovery'],
  '10 min read',
  '2026-08-10',
  'Meta Circle',
  'https://meta-circle.com/blog/ophis-a-new-paradigm-for-autoresearch',
  'assets/img/covers/real/Towards Mechanistic Auto-Research.png',
  'Real article cover downloaded from the source page',
  'cover',
  'published',
  false
),
(
  'lesswrong-ai-generated-content-mechanistic-analysis',
  'An Analysis of AI-Generated Content at the Mechanistic Level',
  'A mechanistic investigation of AI-generated content that examines internal model behavior rather than relying only on surface-level output characteristics.',
  'LessWrong Community',
  'https://www.google.com/s2/favicons?domain=lesswrong.com&sz=128',
  'Trustworthy AI',
  array['Mechanistic Interpretability', 'AI-Generated Content', 'Model Analysis', 'Interpretability'],
  '12 min read',
  '2026-08-10',
  'LessWrong',
  'https://www.lesswrong.com/posts/r7FBQ8XDs6qBYc4K4/an-analysis-of-ai-generated-content-at-the-mechanistic',
  'assets/img/covers/real/An analysis of AI-generated content at the Mechanistic Interpretability Workshop.png',
  'Real article cover downloaded from the source page',
  'cover',
  'published',
  false
),
(
  'ruhan-wang-harness-handbook',
  'Harness Handbook',
  'A practical handbook for understanding and building agent harnesses, covering the execution environment, tools, context, feedback, and evaluation around an underlying model.',
  'Ruhan Wang',
  'https://www.google.com/s2/favicons?domain=ruhan-wang.github.io&sz=128',
  'AI Agents',
  array['Agent Harnesses', 'Coding Agents', 'Tool Use', 'Evaluation'],
  '15 min read',
  '2026-08-10',
  'Ruhan Wang',
  'https://ruhan-wang.github.io/Harness-Handbook/',
  'assets/img/covers/real/Harness Handbook.png',
  'Real article cover downloaded from the source page',
  'cover',
  'published',
  false
),
(
  '01-research-interaction-scaling',
  'Interaction Scaling',
  'A research exploration of interaction scaling and how increasing iterative exchanges between models, tools, environments, or users can unlock additional capability.',
  '01 Research',
  'https://www.google.com/s2/favicons?domain=01.me&sz=128',
  'Foundation Model',
  array['Interaction Scaling', 'Reasoning', 'Test-Time Compute', 'Model Capability'],
  '10 min read',
  '2026-08-10',
  '01 Research',
  'https://01.me/research/interaction-scaling/#idea',
  'assets/img/covers/real/What if the model could check its work — and why you’d never know it helped.png',
  'Real article cover downloaded from the source page',
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

select id, title, category, cover_image, status
from public.blogs
where id in (
  'meta-circle-ophis-autoresearch',
  'lesswrong-ai-generated-content-mechanistic-analysis',
  'ruhan-wang-harness-handbook',
  '01-research-interaction-scaling'
)
order by publish_date desc, id asc;
