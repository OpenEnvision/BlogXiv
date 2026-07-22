-- Align Supabase public.blogs with the current BlogrXiv project state.
-- Generated from admin/blogs-supabase-import.csv and the live Supabase REST snapshot.
-- Current local corpus: 593 published blogs.
-- Current remote corpus: 593 published blogs.

begin;

-- Allow the expanded BlogrXiv taxonomy before applying category updates.
alter table public.blogs
drop constraint if exists blogs_category_check;

alter table public.blogs
add constraint blogs_category_check
check (category in (
  'Foundation Model',
  'LLM & MLLM',
  'Multimodal Model',
  'Visual Generation',
  'World Model',
  'AI Agents',
  'Efficient AI',
  'Trustworthy AI',
  'Research Craft',
  'Frontier Developments',
  'Research Experience'
));

-- Keep this delete as an idempotent safeguard for the removed local post.
delete from public.blogs
where id = 'complex-systems-visualizer';

-- Apply local taxonomy reassignments for the new categories.
with updates(id, category) as (
  values
  ('iclr2026-why-ai-evaluations-need-error-bars', 'Research Experience'),
  ('iclr2026-unigramlm-manual', 'Research Experience'),
  ('iclr2026-rl-with-gnns', 'Research Experience'),
  ('iclr2025-opt-summary', 'Research Experience'),
  ('iclr2025-do-not-write-jailbreak-papers', 'Research Experience'),
  ('iclr2025-visualizing-training', 'Research Experience'),
  ('iclr2025-linear-gnn-convergence-restated', 'Research Experience'),
  ('iclr2025-towards-more-rigorous-llm-evals', 'Research Experience'),
  ('iclr2024-diffusion-theory-from-scratch', 'Research Experience'),
  ('iclr2024-bench-hvp', 'Research Experience'),
  ('iclr2024-the-n-implementation-details-of-rlhf-with-ppo', 'Research Experience'),
  ('openai-separating-signal-from-noise-coding-evaluations', 'Research Experience'),
  ('openai-gpt-5-6', 'Frontier Developments'),
  ('kimi-k3-open-frontier-intelligence', 'Frontier Developments'),
  ('thinking-machines-inkling-open-weights-model', 'Frontier Developments'),
  ('openai-deployment-simulation', 'Frontier Developments'),
  ('google-agentic-rag-sufficient-context', 'Frontier Developments'),
  ('huggingface-olmo-eval-workbench', 'Research Experience'),
  ('hylak-how-to-eval-ai-agents', 'Research Experience'),
  ('davies-ai-agent-evaluation-frameworks', 'Research Experience'),
  ('openai-macro-evals-agentic-systems', 'Research Experience'),
  ('shreya-agent-assisted-qualitative-analysis', 'Research Experience'),
  ('greg-goal-engineering', 'Research Experience'),
  ('dair-context-engineering-guide', 'Research Experience'),
  ('google-palm-scaling-pathways', 'Frontier Developments'),
  ('patrick-mineault-good-research-code', 'Research Experience'),
  ('karpathy-recipe-training-neural-networks', 'Research Experience'),
  ('anthropic-demystifying-evals-agents', 'Research Experience'),
  ('anthropic-ai-resistant-technical-evaluations', 'Research Experience'),
  ('braintrust-logs-evals-same-place', 'Research Experience'),
  ('metr-frontier-risk-report-2026', 'Frontier Developments'),
  ('claude-code-large-codebases', 'Research Experience'),
  ('manus-context-engineering-agents', 'Research Experience'),
  ('hf-rl-environments-guide', 'Research Experience'),
  ('nrehiew-minimal-editing', 'Research Experience'),
  ('ryan-briggs-research-adjudication', 'Research Experience'),
  ('thoughtful-letting-ai-posttrain-ai', 'Research Experience'),
  ('deepwiki-mimo-v2-flash', 'Frontier Developments'),
  ('openai-parameter-golf', 'Research Experience'),
  ('anthropic-multi-agent-research-system', 'Research Experience'),
  ('interconnects-open-models-mid-2026', 'Frontier Developments'),
  ('hamel-evals-skills-coding-agents', 'Research Experience'),
  ('interconnects-open-models-next-phase', 'Frontier Developments'),
  ('hamel-llm-evals-faq', 'Research Experience'),
  ('interconnects-state-open-models-2025', 'Frontier Developments'),
  ('stanford-ai-index-2025', 'Frontier Developments'),
  ('jay-illustrated-deepseek-r1', 'Frontier Developments'),
  ('hamel-llm-judge-guide', 'Research Experience'),
  ('hamel-ai-product-needs-evals', 'Research Experience'),
  ('sebastian-state-llms-2025', 'Frontier Developments'),
  ('sebastian-deepseek-v32-architecture', 'Frontier Developments'),
  ('sebastian-llm-evaluation-4-approaches', 'Research Experience'),
  ('thinking-machines-interaction-models', 'Frontier Developments'),
  ('simon-5-minute-llms-2026', 'Frontier Developments'),
  ('claude-opus-47', 'Frontier Developments'),
  ('hf-state-open-source-ai-spring-2026', 'Frontier Developments'),
  ('simon-year-in-llms-2025', 'Frontier Developments'),
  ('eugene-product-evals', 'Research Experience'),
  ('eugene-long-context-qa-evals', 'Research Experience'),
  ('claude-4', 'Frontier Developments'),
  ('alphaevolve-coding-agent', 'Frontier Developments'),
  ('claude-37-sonnet-code', 'Frontier Developments'),
  ('open-r1', 'Frontier Developments'),
  ('olmo2-open-language-model', 'Frontier Developments'),
  ('llama-31-open-source-ai', 'Frontier Developments'),
  ('gemma-2-open-models', 'Frontier Developments'),
  ('simon-llms-in-2024', 'Frontier Developments'),
  ('qvq-72b-preview', 'Frontier Developments'),
  ('open-sora-plan', 'Frontier Developments'),
  ('nvlm-10', 'Frontier Developments'),
  ('qwen2-vl', 'Frontier Developments'),
  ('deepseek-ocr', 'Frontier Developments'),
  ('glm-45v', 'Frontier Developments'),
  ('bagel-unified-multimodal', 'Frontier Developments'),
  ('minicpm-o-45', 'Frontier Developments'),
  ('qwen3-omni', 'Frontier Developments'),
  ('mistral-medium-3', 'Frontier Developments'),
  ('sima-2-virtual-worlds', 'Frontier Developments'),
  ('robocat-self-improving-agent', 'Frontier Developments'),
  ('qwen-vl-visual-language', 'Frontier Developments'),
  ('rt-1-robotics-transformer', 'Frontier Developments')
)
update public.blogs as blog
set
  category = updates.category,
  updated_at = now()
from updates
where blog.id = updates.id
  and blog.category is distinct from updates.category;

commit;

-- Verification
select count(*) as published_count
from public.blogs
where status = 'published';

select category, count(*)
from public.blogs
where status = 'published'
group by category
order by category;
