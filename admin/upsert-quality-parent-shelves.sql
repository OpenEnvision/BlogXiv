-- Upsert unique PR #12 leftovers not already on main.
-- Generated while merging PR #12 onto main after PRs #1-#11.

insert into public.blogs (
  id, title, excerpt, author, author_avatar, category, tags, read_time,
  publish_date, source_name, url, cover_image, cover_alt, cover_fit, status, featured
) values
(
  'jalammar-illustrated-gpt2',
  'The Illustrated GPT-2',
  'Jay Alammar unpacks GPT-2’s decoder-only stack, byte-pair encoding, and how autoregressive sampling actually walks the network. It is still the clearest public explanation of that generation of LMs, with the caveat that tokenizer and attention variants have changed substantially since 2019.',
  'Jay Alammar',
  'https://www.google.com/s2/favicons?domain=jalammar.github.io&sz=128',
  'LLM & MLLM',
  array['GPT-2', 'Language Models', 'Illustrated Guide', 'Decoding'],
  '28 min read',
  '2019-08-12',
  'Jay Alammar',
  'https://jalammar.github.io/illustrated-gpt2/',
  'https://www.google.com/s2/favicons?domain=jalammar.github.io&sz=128',
  'The Illustrated GPT-2 source mark',
  'cover',
  'published',
  false
),
(
  'lilian-weng-controllable-text-generation',
  'Controllable Neural Text Generation',
  'Lilian Weng surveys control knobs for neural text generation, from decoding constraints and weighted decoding to plug-and-play and prefix-style control. It is a 2021 map of the design space; instruction-tuned chat models later absorbed some of these controls into prompting and post-training.',
  'Lilian Weng',
  'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
  'LLM & MLLM',
  array['Controllable Generation', 'Decoding', 'Language Models', 'Survey'],
  '30 min read',
  '2021-01-02',
  'Lilian Weng',
  'https://lilianweng.github.io/posts/2021-01-02-controllable-text-generation/',
  'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
  'Controllable Neural Text Generation source mark',
  'cover',
  'published',
  false
),
(
  'lilian-weng-llm-powered-autonomous-agents',
  'LLM Powered Autonomous Agents',
  'Lilian Weng’s 2023 survey of LLM agents—planning, memory, tool use, and the ReAct-style loop—became the field’s default map. It predates modern computer-use and long-horizon RL agents; read it as architecture vocabulary, not a 2026 capability report.',
  'Lilian Weng',
  'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
  'AI Agents',
  array['LLM Agents', 'Planning', 'Memory', 'Tool Use'],
  '35 min read',
  '2023-06-23',
  'Lilian Weng',
  'https://lilianweng.github.io/posts/2023-06-23-agent/',
  'https://www.google.com/s2/favicons?domain=lilianweng.github.io&sz=128',
  'LLM Powered Autonomous Agents source mark',
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
where id in (
  'jalammar-illustrated-gpt2',
  'lilian-weng-controllable-text-generation',
  'lilian-weng-llm-powered-autonomous-agents'
);
