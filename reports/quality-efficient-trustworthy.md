# Quality Ingestion Report: Efficient AI & Trustworthy AI

Date: 2026-08-25
Scope: `blog.md` sections "Efficient AI" and "Trustworthy AI" (remaining A+/A items), plus canonical gap-closing extras.
Artifacts: `admin/accepted-quality-efficient-trustworthy.json`, `admin/upsert-quality-efficient-trustworthy.sql`, helper `getQualityEfficientTrustworthyBlogs()` in `site/assets/js/app.js`, covers in `site/assets/img/covers/real/`.

## Summary

| | Before (main) | Added | After |
|---|---|---|---|
| Efficient AI | 51 | **39** (38 from blog.md + 1 extra) | **90** |
| Trustworthy AI | 49 | **22** (20 from blog.md + 2 extras) | **71** |
| Total new entries | | **61** | |

Every ingested URL was live-verified (HTTP 200, browser user agent, redirects followed). The four `openai.com/index/` pages return HTTP 403 to non-browser clients (bot protection); they were verified live via a metadata service (which also supplied their real og:images) and independent web coverage. `blog.md` was updated with `[x]` only on the 58 lines actually added here.

## Added — Efficient AI (39)

From blog.md (38):

1. Kernel Fusion in NVIDIA CUDA (NVIDIA, 2026-07-10)
2. System Performance Optimizations (Lei Mao, 2026-02-16)
3. Achieve SOTA Inference Latencies with Speculative Decoding (Modal, 2026-06-24) — A+
4. Optimizing Inference on LLMs with TensorRT-LLM, Now Publicly Available (NVIDIA, 2023-10-19)
5. Introducing New KV Cache Reuse Optimizations in TensorRT-LLM (NVIDIA, 2025-01-16)
6. NVFP4 KV Cache for Long Context and Large Batches (NVIDIA, 2025-12-08)
7. TensorRT-LLM Speculative Decoding, Llama 3.3 70B 3x (NVIDIA, 2024-12-17)
8. DeepSpeed Ulysses-Offload / FPDT (DeepSpeed, 2024-12-05)
9. Parameter-Efficient Fine-Tuning using PEFT (Hugging Face, 2023-02-10)
10. LoRA and DoRA From Scratch (Sebastian Raschka, 2024-02-18)
11. Assisted Generation (Hugging Face, 2023-05-11)
12. 4-Bit Quantization with bitsandbytes/QLoRA (Hugging Face, 2023-05-24)
13. Profiling in PyTorch Part 3: Attention (Hugging Face, 2026-07-10)
14. Native-Speed vLLM Transformers Backend (Hugging Face, 2026-07-08)
15. Pushing Intelligence to 4-Bit (NVIDIA Research EAI, 2026-06-16)
16. Accelerating Gemini Nano with Frozen Multi-Token Prediction (Google Research, 2026-06-26)
17. KV Cache Compression and Its Infra Problems (NVIDIA Research EAI, 2026-06-12) — ingested at canonical `/blogs/` URL; blog.md's `/post/` URL redirects there
18. Profiling in PyTorch Part 2: Fused MLP (Hugging Face, 2026-06-11)
19. Gemma 4 Quantization-Aware Training (Google, 2026-06-05)
20. ThunderKittens 2.0 (Hazy Research, 2026-02-19)
21. ThunderKittens: A Simple Embedded DSL (Hazy Research, 2024-05-12)
22. Minions: Small On-Device LMs (Hazy Research, 2025-02-24)
23. LoLCATs Part 2: Linearizing LLMs (Hazy Research, 2024-10-14)
24. Just Read Twice (Hazy Research, 2024-07-01)
25. BASED One Year Retrospective (Hazy Research, 2025-03-24)
26. Inference Economics of Language Models (Epoch AI, 2025-06-05)
27. TinyAgent: Function Calling at the Edge (BAIR, 2024-05-29)
28. How to Scale Your Model (JAX ML / Google DeepMind, 2025-02-04) — book landing page only, per instruction
29. Transformer Inference Arithmetic (kipply, 2022-03-30)
30. Making Deep Learning Go Brrrr From First Principles (Horace He, 2022-03-16)
31. Mastering LLM Techniques: Inference Optimization (NVIDIA, 2023-11-17)
32. Accelerating LLM Inference with GemLite, TorchAO and SGLang (PyTorch, 2025-01-21)
33. FlashAttention: Fast Transformer Training with Long Sequences (Hazy Research, 2023-01-12) — A+
34. FlashFFTConv (Hazy Research, 2023-11-13)
35. Looking Back at Speculative Decoding (Google Research, 2024-12-06)
36. FlashAttention-2 (Hazy Research, 2023-07-17) — A+
37. GSPMD (Google Research, 2021-12-08) — A+
38. Scaling Language Model Training to a Trillion Parameters Using Megatron (NVIDIA, 2021-04-12) — A+

Extras (1):

39. Accelerating Generative AI with PyTorch II: GPT, Fast (PyTorch, 2023-11-30) — canonical torch.compile/quantization/speculative-decoding systems essay missing from the corpus

## Added — Trustworthy AI (22)

From blog.md (20):

1. How Our Control Red Team Is Stress-Testing Frontier Monitors (UK AISI, 2026-07-23) — A+
2. Prioritizing Threats for AI Control (Ryan Greenblatt / Redwood, 2025-03-19)
3. Strengthening Our Frontier Safety Framework (Google DeepMind, 2025-09-22)
4. An Early Warning System for Novel AI Risks (Google DeepMind, 2023-05-25)
5. A Shared Playbook for Trustworthy Third Party Evaluations (OpenAI, 2026-05-29)
6. OpenAI and Hugging Face Security Incident During Model Evaluation (OpenAI, 2026-07-21) — technical incident writeup (zero-day chain, sandbox escape, containment)
7. Safety and Alignment in an Era of Long-Horizon Models (OpenAI, 2026-07-20)
8. An Off Switch for Dual-Use Knowledge (AE Studio + Anthropic, 2026-07-08)
9. Securing Internal Systems Against Imperfectly Aligned AI (Google DeepMind, 2026-06-18)
10. Measuring LLMs' Impact on N-Day Exploits (Anthropic, 2026-06-08)
11. Mapping AI-Enabled Cyber Threats (Anthropic, 2026-06-03)
12. Trustworthy Agents in Practice (Anthropic, 2026-04-09)
13. Protecting People from Harmful Manipulation (Google DeepMind, 2026-03-26)
14. A "Diff" Tool for AI (Anthropic, 2026-03-13)
15. A Discussion of "Adversarial Examples Are Not Bugs, They Are Features" (Distill, 2019-08-06)
16. The Building Blocks of Interpretability (Distill, 2018-03-06)
17. Thread: Circuits (Distill, 2020-03-10) — thread landing page only
18. How Undesired Goals Can Arise with Correct Rewards (Google DeepMind, 2022-10-07)
19. Deliberative Alignment (OpenAI, 2024-12-20)
20. Simple Probes Can Catch Sleeper Agents (Anthropic, 2024-04-23)

Extras (2):

21. Feature Visualization (Distill, 2017-11-07) — canonical interpretability classic missing from corpus
22. Specification Gaming: The Flip Side of AI Ingenuity (Google DeepMind, 2020-04-21) — the canonical counterpart to the goal-misgeneralisation post

## Skipped

Already indexed in main (left unchecked in blog.md since nothing was added):

| Item | Existing URL in app.js |
|---|---|
| Continuous Batching from First Principles (A+) | `huggingface.co/blog/continuous_batching` |
| FlashInfer inference kernels (A+) | `developer.nvidia.com/blog/run-high-performance-llm-inference-kernels-...` |
| Training MoEs at Scale with PyTorch (A+) | `pytorch.org/blog/training-moes/` |
| vLLM TurboQuant study (A+) | `vllm.ai/blog/2026-05-11-turboquant` |
| Modal High-Performance LLM Inference guide (A+) | `modal.com/docs/guide/high-performance-llm-inference` |
| ZeRO & DeepSpeed (A+) | `microsoft.com/en-us/research/blog/zero-deepspeed-...` |
| PyTorch FSDP API (A+) | `pytorch.org/blog/introducing-pytorch-fully-sharded-data-parallel-api/` |
| Agentic Misalignment in Summer 2026 (A+) | `alignment.anthropic.com/2026/agentic-misalignment-summer-2026/` |
| Cheating behaviour in frontier model evaluations (A+) | `aisi.gov.uk/blog/cheating-behaviour-in-frontier-model-evaluations` |
| Introducing LinuxArena (A+) | `blog.redwoodresearch.org/p/introducing-linuxarena` |

Editorial skips (live, but outside the bar):

- **Optimum Intel 2.0** (`huggingface.co/blog/jeffboudier/optimum-intel-v2`) — library release announcement (breaking changes, install streamlining, migration notes); reads as a product/toolkit release rather than a systems essay with methods or measurements.
- **Is a Compute Crunch Coming?** (`epoch.ai/gradient-updates/is-a-compute-crunch-coming`) — compute-supply macroeconomic forecast; does not fit the Efficient AI boundary (kernels, parallelism, inference/serving, quantization, memory, training systems, compiler/fusion). Better suited to Frontier.

Extras considered but already indexed (no action): FlashAttention-3 (`tridao.me/blog/2024/flash3/`), vLLM PagedAttention (`vllm.ai/blog/2023-06-20-vllm`), FlexAttention (`pytorch.org/blog/flexattention/`).

## Cover log

- 55 covers downloaded directly from live pages; 3 Substack CDN covers (Raschka, kipply, Redwood) required quoting-safe re-download; 2 NVIDIA Research EAI covers decoded from inline (base64) article figures because the page og:image is the site icon.
- Fallbacks (logged per instruction):
  - `deepspeed-ulysses-offload-fpdt` → `assets/img/covers/efficient-ai.svg` (tutorial page exposes no og:image and no content images).
  - 9 Hazy Research posts, 2 Google Research posts, Horace He, and 2 PyTorch posts use the first in-article figure (`coverAlt: "Real cover from first-image"`) because their og:image is a site logo/generic preview or absent.
  - 4 OpenAI covers are the real og:images (ctfassets.net) obtained via a metadata API because openai.com blocks non-browser fetches.
  - 3 Anthropic research posts (n-days, attack-navigator, probes) share Anthropic's generic research og:image card; noted in `coverAlt` source comments in this repo's accepted JSON (`og:image (generic Anthropic research card)` in the working dataset).

## Verification

- `node --check site/assets/js/app.js` — pass.
- Helper extraction smoke test: `getQualityEfficientTrustworthyBlogs()` returns 61 entries, full schema present (id/title/excerpt/author/authorAvatar/category/tags/readTime/publishDate/sourceName/url/coverImage/coverAlt/coverFit), all dates `YYYY-MM-DD`, ≥3 tags each, all local cover files exist.
- No duplicate ids or URLs across the full app.js corpus (566 ids, all unique).
- Repo test scripts `test-blog-data.mjs`, `test-blog-manager.mjs`, `test-highlights.mjs` — pass.
- SQL uses the `import_a_plus_blogs.mjs` upsert pattern with `status='published'`, `featured=false`, `on conflict (id) do update`, and a trailing verification `select`.
