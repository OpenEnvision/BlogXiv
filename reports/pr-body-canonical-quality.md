# Add 12 canonical articles: Research Craft, Frontier, How to Research, Trustworthy AI

## Summary

Adds 12 new canonical articles to the static corpus, all with verified live URLs and confirmed absent from main's `app.js` (checked by url and id, including normalized-URL comparison).

### New entries (3 per category)

**How to Research**
- Paul Graham — [How to Do Great Work](https://www.paulgraham.com/greatwork.html) (2023)
- Michael Nielsen — [Augmenting Long-term Memory](https://augmentingcognition.com/ltm.html) (2018)
- Richard Feynman — [Cargo Cult Science](https://calteches.library.caltech.edu/51/2/CargoCult.htm) (1974)

**Research Craft**
- Eugene Yan — [Patterns for Building LLM-based Systems & Products](https://eugeneyan.com/writing/llm-patterns/) (2023)
- Hamel Husain — [Fuck You, Show Me The Prompt.](https://hamel.dev/blog/posts/prompt/) (2024)
- Distill — [Why Momentum Really Works](https://distill.pub/2017/momentum/) (2017)

**Trustworthy AI**
- Distill — [Multimodal Neurons in Artificial Neural Networks](https://distill.pub/2021/multimodal-neurons/) (2021)
- METR — [Recent Frontier Models Are Reward Hacking](https://metr.org/blog/2025-06-05-recent-reward-hacking/) (2025)
- UK AISI — [Safety cases at AISI](https://www.aisi.gov.uk/blog/safety-cases-at-aisi) (2024)

**Frontier**
- Epoch AI — [Algorithmic Progress in Language Models](https://epoch.ai/publications/algorithmic-progress-in-language-models) (2024)
- Epoch AI — [How Much Does It Cost to Train Frontier AI Models?](https://epoch.ai/publications/how-much-does-it-cost-to-train-frontier-ai-models) (2024)
- Epoch AI — [Will We Run Out of Data?](https://epoch.ai/publications/will-we-run-out-of-data-limits-of-llm-scaling-based-on-human-generated-data) (2024)

### Dedup audit of main's app.js

Zero duplicate URLs or ids found (692 unique URLs before this change, 704 after; normalized comparison strips protocol, `www.`, and trailing slash). No fixes needed.

### Details

- Real covers: og:image downloads where available; headless-Chrome page screenshots for the three text-only classics (Paul Graham, Nielsen, Feynman). Stored under `site/assets/img/covers/real/`.
- Admin artifacts: `admin/accepted-20260825-canonical-quality.json` and `admin/upsert-20260825-canonical-quality.sql` (mirrors the static corpus, on-conflict upsert).
- `blog.md`: 12 checked entries added to the four category sections.
- Checks: `node --check site/assets/js/app.js` passes; all four test scripts pass (`test-blog-data`, `test-blog-like`, `test-blog-manager`, `test-highlights`).
