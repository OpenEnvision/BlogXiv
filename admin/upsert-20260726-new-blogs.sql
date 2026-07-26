-- Add the July 2026 BlogrXiv posts to Supabase.
-- Run this in the Supabase SQL Editor for the project backing the public site.

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
  'yuan-huang-good-toy-example-diffusion-models',
  'What Makes a Good Toy Example for Diffusion Models?',
  'Liangyu Yuan and Yufei Huang examine how two-dimensional toy distributions can clarify diffusion and flow-matching behavior while also encoding researcher choices, using Leaves to study guidance, class separation, and within-class structure.',
  'Liangyu Yuan, Yufei Huang',
  'https://www.google.com/s2/favicons?domain=diffusiontoy.github.io&sz=128',
  'Visual Generation',
  array['Diffusion Models', 'Toy Examples', 'Flow Matching', 'Guidance'],
  '8 min read',
  '2026-07-26',
  'Diffusion Toy Examples',
  'https://diffusiontoy.github.io/',
  'assets/img/covers/real/What Makes a Good Toy Example for Diffusion Models? .png',
  'What Makes a Good Toy Example for Diffusion Models article cover',
  'cover',
  'published',
  false
),
(
  'lilian-harness-engineering-self-improvement',
  'Harness Engineering for Self-Improvement',
  'Lilian Weng studies how external harnesses shape self-improving agent systems, covering verifiers, feedback loops, task environments, data generation, and the practical engineering needed to make iterative improvement measurable.',
  'Lilian Weng',
  'https://github.com/lilianweng.png',
  'AI Agents',
  array['Self-Improvement', 'Agent Harnesses', 'Evaluation', 'Feedback Loops'],
  '25 min read',
  '2026-07-04',
  'Lil''Log',
  'https://lilianweng.github.io/posts/2026-07-04-harness/',
  'assets/img/covers/real/Harness Engineering for Self-Improvement .png',
  'Harness Engineering for Self-Improvement article cover',
  'cover',
  'published',
  false
),
(
  'lilian-scaling-laws-carefully',
  'Scaling Laws, Carefully',
  'Lilian Weng revisits scaling laws as empirical modeling tools, emphasizing what can and cannot be inferred from power-law fits, dataset quality, compute allocation, evaluation choices, and extrapolation assumptions.',
  'Lilian Weng',
  'https://github.com/lilianweng.png',
  'Foundation Model',
  array['Scaling Laws', 'Model Training', 'Compute', 'Empirical AI'],
  '28 min read',
  '2026-06-24',
  'Lil''Log',
  'https://lilianweng.github.io/posts/2026-06-24-scaling-laws/',
  'assets/img/covers/real/Scaling Laws, Carefully .png',
  'Scaling Laws, Carefully article cover',
  'cover',
  'published',
  false
),
(
  'feifei-functional-taxonomy-world-models',
  'A Functional Taxonomy of World Models',
  'Fei-Fei Li proposes a functional taxonomy for world models, organizing renderers, simulators, planners, and the feedback loop that connects them across embodied intelligence, video generation, and agent learning.',
  'Fei-Fei Li',
  'https://www.google.com/s2/favicons?domain=drfeifei.substack.com&sz=128',
  'World Model',
  array['World Models', 'Embodied AI', 'Representation', 'Planning'],
  '14 min read',
  '2026-06-03',
  'Fei-Fei Li',
  'https://drfeifei.substack.com/p/a-functional-taxonomy-of-world-models',
  'assets/img/covers/real/A Functional Taxonomy of World Models .png',
  'A Functional Taxonomy of World Models article cover',
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

select id, title, publish_date, status
from public.blogs
where id in (
  'yuan-huang-good-toy-example-diffusion-models',
  'lilian-harness-engineering-self-improvement',
  'lilian-scaling-laws-carefully',
  'feifei-functional-taxonomy-world-models'
)
order by publish_date desc;
