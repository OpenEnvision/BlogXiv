## Submission type

- [ ] Original writing submission
- [x] Metadata or content correction
- [x] Site improvement

## For original writing

- [ ] I wrote this work or have permission to submit it.
- [ ] I grant BlogrXiv permission to review and publish this work if accepted.
- [ ] I used `submissions/template.md`.
- [ ] I included references for papers, code, datasets, or quoted material.
- [ ] I understand publication is not guaranteed.

## Summary

Fills the Efficient AI and Trustworthy AI categories with a complete, live-verified corpus from `blog.md` plus canonical gap-closing extras.

**Counts**

| Category | Before (main) | Added | After |
|---|---|---|---|
| Efficient AI | 51 | 39 (38 blog.md + 1 extra) | 90 |
| Trustworthy AI | 49 | 22 (20 blog.md + 2 extras) | 71 |

**What's included**

- Every remaining live, in-scope A+/A item from the `blog.md` Efficient AI and Trustworthy AI sections: FlashAttention/FA2, FlashFFTConv, Megatron trillion-parameter scaling, GSPMD, ThunderKittens 1/2, Horace He "Brrrr", Kipply inference arithmetic, JAX scaling book (landing page only), TensorRT-LLM family, NVFP4/KV-cache infra, PEFT/LoRA/DoRA, speculative decoding retrospectives; Distill circuits/building blocks/advex discussion, sleeper-agent probes, deliberative alignment, goal misgeneralisation, UK AISI control red team, OpenAI eval-security incident and long-horizon safety, Anthropic and DeepMind safety systems posts.
- Extras closing canonical gaps: PyTorch "GPT, Fast", Distill "Feature Visualization", DeepMind "Specification Gaming".
- Skipped: 10 items already indexed in main (FSDP, ZeRO, TurboQuant, continuous batching, FlashInfer, MoE training, Modal inference guide, agentic misalignment, AISI cheating-in-evals, LinuxArena) and 2 editorial skips (Optimum Intel 2.0 — product release note; Epoch compute-crunch — Frontier-scope macroeconomics). Full log in `reports/quality-efficient-trustworthy.md`.

**Implementation**

- `admin/accepted-quality-efficient-trustworthy.json` — full-schema records with 2–3 sentence excerpts (concrete claim + caveat), unique kebab ids, favicon avatars, real dates.
- New `getQualityEfficientTrustworthyBlogs()` helper spread into `getCuratedCommunityBlogs()` in `site/assets/js/app.js` (purely additive; no unrelated reformatting).
- 60 real covers downloaded to `site/assets/img/covers/real/` (55 og:image, 2 decoded inline NVIDIA EAI figures, 3 Substack CDN re-fetches); 1 category-SVG fallback (DeepSpeed tutorial has no article image). Fallbacks logged in the report.
- `blog.md`: `[x]` set only on the 58 lines added by this PR.

**SQL operator note**

`admin/upsert-quality-efficient-trustworthy.sql` follows the `scripts/import_a_plus_blogs.mjs` pattern: single `insert into public.blogs ... on conflict (id) do update`, all rows `status='published'`, `featured=false`, with a trailing verification `select`. Run it against the Supabase project after merging so the hosted index matches the static corpus; it is idempotent and safe to re-run.

**Verification**

- `node --check site/assets/js/app.js` passes; repo test scripts (`test-blog-data.mjs`, `test-blog-manager.mjs`, `test-highlights.mjs`) pass.
- 566 ids and all URLs unique across the corpus; helper returns 61 entries with full schema and existing cover files.
- All 61 URLs live-verified HTTP 200 (the four `openai.com` pages block non-browser clients with 403; verified live via metadata API and independent coverage, and their real ctfassets og:images were retrieved).
