# BlogXiv

<p align="center">
  <img src="site/assets/img/brand/blogxiv.svg" alt="BlogXiv" width="360">
</p>

<p align="center">
  <strong>A curated index for technical AI research writing</strong>
</p>

<p align="center">
  <a href="https://github.com/OpenEnvision/BlogXiv/actions/workflows/pages.yml"><img alt="GitHub Pages Deployment" src="https://github.com/OpenEnvision/BlogXiv/actions/workflows/pages.yml/badge.svg"></a>
  <img alt="Static Site" src="https://img.shields.io/badge/site-static-blue">
  <img alt="Editorial Curation" src="https://img.shields.io/badge/curation-editorial-6f42c1">
  <img alt="Maintained by OpenEnvision" src="https://img.shields.io/badge/maintainer-OpenEnvision-0f4c81">
</p>

## Abstract

**BlogXiv** is an editorially curated index of high-quality technical writing on artificial intelligence research. It is designed for researchers, engineers, graduate students, and research leaders who rely on research blogs, lab notes, technical essays, and conference blog-track articles as part of the modern AI knowledge infrastructure.

The project treats research blogs as a serious scholarly and engineering medium: faster than survey papers, more implementation-aware than abstracts, and often richer in methodological reflection than social media. BlogXiv therefore emphasizes technical insight, source attribution, taxonomic clarity, and durable discoverability rather than undifferentiated aggregation.

Production URL:

```text
https://blogxiv.org/
```

Repository:

```text
https://github.com/OpenEnvision/BlogXiv
```

## Contents

- [Motivation](#motivation)
- [What BlogXiv Is](#what-blogxiv-is)
- [Scope](#scope)
- [Editorial Standard](#editorial-standard)
- [Selection Protocol](#selection-protocol)
- [Design Principles](#design-principles)
- [Information Architecture](#information-architecture)
- [Metadata Model](#metadata-model)
- [Search and Discovery Metadata](#search-and-discovery-metadata)
- [Quality Assurance](#quality-assurance)
- [Attribution and Ethics](#attribution-and-ethics)
- [Local Development](#local-development)
- [GitHub Pages Deployment](#github-pages-deployment)
- [Repository Hygiene](#repository-hygiene)
- [Governance](#governance)
- [Citation](#citation)

## Motivation

AI research increasingly circulates through materials that sit between formal publication and informal commentary. Lab essays explain system design decisions; independent researchers publish careful methodological notes; conference blog tracks translate emerging papers into accessible but technically substantive narratives; engineering teams document failure modes, evaluation protocols, and deployment lessons that rarely appear in papers.

This layer is valuable, but difficult to search, compare, and revisit. BlogXiv addresses this problem by constructing a curated, source-linked, taxonomy-aware index of technical AI research writing. The goal is not to replace papers, benchmarks, or bibliographic databases, but to preserve and organize the interpretive layer around them.

## What BlogXiv Is

BlogXiv is:

- A curated discovery system for AI research blogs and technical essays.
- A static, auditable, source-linked index with no backend dependency.
- A taxonomy for navigating technical writing across research areas.
- A reading interface for researchers who value explanation, mechanism, and methodological detail.

BlogXiv is not:

- A paper mirror.
- A news feed.
- A leaderboard.
- A ranking of authors, labs, or institutions.
- A general-purpose blog directory.

## Scope

BlogXiv indexes technical blog posts, research notes, lab essays, conference blog-track articles, and engineering write-ups that make a substantive contribution to AI research understanding.

The current corpus emphasizes:

| Category | Scope |
| --- | --- |
| Foundation Model | Pretraining, scaling behavior, representation learning, model architecture, and emergent capability analysis. |
| LLM & MLLM | Language models, multimodal language models, reasoning, instruction tuning, evaluation, and post-training behavior. |
| Multimodal Model | Vision-language systems, video-language systems, perception, grounding, and embodied understanding. |
| Visual Generation | Diffusion, image and video generation, controllability, generative evaluation, and media synthesis systems. |
| World Model | Learned simulators, planning representations, dynamics models, spatial reasoning, and embodied AI. |
| AI Agents | Tool use, computer use, memory, orchestration, multi-agent workflows, autonomy, and agent evaluation. |
| Efficient AI | Optimization, systems, inference, training efficiency, compression, kernels, and hardware-aware methods. |
| Trustworthy AI | Safety, alignment, interpretability, robustness, monitoring, auditing, governance, and risk evaluation. |
| Research Craft | Evaluation methodology, research taste, scientific process, writing, adjudication, and field-building. |

## Editorial Standard

BlogXiv prioritizes posts that satisfy at least one of the following criteria:

- They explain a mechanism, method, system, empirical result, or failure mode in a way that changes how a technical reader understands the topic.
- They provide implementation-level detail, evaluation discipline, or design trade-offs that are useful for research or engineering practice.
- They connect academic research and industrial practice without reducing the work to product marketing.
- They synthesize a research area with clear references, diagrams, examples, or careful argumentation.
- They surface important perspectives from academic groups, independent researchers, research labs, engineering teams, and technical communities.

The index deliberately excludes low-information summaries, shallow announcements, purely promotional writing, and paper-only listings that do not add independent technical insight.

## Selection Protocol

Candidate posts are evaluated along five dimensions:

| Dimension | Guiding Question |
| --- | --- |
| Technical contribution | Does the post teach a mechanism, method, system behavior, or research lesson? |
| Specificity | Does it provide enough detail to support technical judgment rather than generic commentary? |
| Source quality | Is the author, lab, venue, or community context identifiable and credible? |
| Reusability | Will the post remain useful after the immediate news cycle has passed? |
| Taxonomic fit | Can the post be assigned to a meaningful category and searchable topic tags? |

Posts are not selected solely because they are recent, popular, affiliated with a prominent organization, or attached to a paper. Popularity can help discover candidates, but it is not a sufficient editorial criterion.

## Design Principles

BlogXiv follows several design principles:

| Principle | Implication |
| --- | --- |
| Static first | The site should remain inspectable, portable, and easy to deploy without infrastructure dependencies. |
| Source-linked | Every entry should point to its canonical source rather than duplicating or obscuring authorship. |
| Taxonomy-aware | Discovery should be organized by research concept, not only by recency or popularity. |
| Editorially conservative | Inclusion should be justified by technical value, not by trend pressure. |
| Search readable | Metadata should be legible to both humans and crawlers. |

## Information Architecture

BlogXiv is implemented as a static research index. The site has no server-side runtime, database, authentication layer, or package installation requirement.

| Surface | Purpose |
| --- | --- |
| `index.html` | Repository-level homepage entry point. It loads assets from `site/` so the project can be opened from the repository root. |
| `site/index.html` | Homepage, search entry point, category overview, and curated discovery surface. |
| `site/explore.html` | Searchable and filterable index of curated posts. |
| `site/categories.html` | Taxonomy-level browsing and category descriptions. |
| `site/bloggers.html` | Discovery page for high-quality researchers, labs, and technical writers represented in the corpus. |
| `site/blog-detail.html` | Detail template for indexed entries. |
| `site/assets/js/app.js` | Canonical in-browser corpus, shared UI behavior, search behavior, filtering logic, and rendering utilities. |
| `site/assets/js/pages/` | Page-specific controllers for explore, detail, category, blogger, author, and management surfaces. |
| `site/assets/css/` | Global, enhancement, and page-specific stylesheets. |
| `site/assets/img/brand/` | BlogXiv and OpenEnvision brand assets. |
| `site/assets/img/covers/` | Local thematic cover assets for indexed entries and category representation. |
| `docs/ARCHITECTURE.md` | Repository structure, ownership boundaries, and maintenance guidance. |
| `scripts/` | Local maintenance utilities for cover extraction and corpus upkeep. |

## Metadata Model

Each indexed entry follows a compact metadata schema:

```js
{
  id: "stable-slug",
  title: "Post title",
  excerpt: "Editorial summary of the technical contribution",
  author: "Author, lab, or publication",
  authorAvatar: "Avatar or favicon URL",
  category: "Taxonomy label",
  tags: ["Topic", "Method", "System"],
  readTime: "Estimated reading time",
  publishDate: "YYYY-MM-DD",
  sourceName: "Source publication or organization",
  url: "Canonical source URL",
  coverImage: "Local or remote cover asset",
  coverAlt: "Accessible image description",
  coverFit: "cover"
}
```

The metadata model is intentionally small. BlogXiv favors transparent editorial structure over a complex ingestion pipeline, which keeps review, correction, and deployment lightweight.

## Search and Discovery Metadata

The repository includes public metadata for indexing and platform presentation:

| File or Metadata | Role |
| --- | --- |
| `site/robots.txt` | Allows indexing and points crawlers to the sitemap. |
| `site/sitemap.xml` | Lists major public pages for crawler discovery. |
| `site/site.webmanifest` | Declares the BlogXiv application name, theme color, and icon assets. |
| Open Graph tags | Provide title, description, site name, and image metadata for rich previews. |
| Twitter Card tags | Provide concise social preview metadata. |
| Schema.org JSON-LD | Declares `WebSite`, site name, canonical URL, logo, publisher, and site search action. |

The canonical domain is currently configured as:

```text
https://blogxiv.org/
```

If the site is deployed only as a GitHub project page at `https://openenvision.github.io/BlogXiv/`, update `site/index.html`, `site/robots.txt`, `site/sitemap.xml`, and any canonical metadata accordingly.

## Quality Assurance

Before deployment, recommended checks are:

| Check | Purpose |
| --- | --- |
| `node --check site/assets/js/app.js` | Verifies that the primary JavaScript bundle is syntactically valid. |
| YAML parse of `.github/workflows/pages.yml` | Verifies that the GitHub Pages workflow is structurally valid. |
| Local static server smoke test | Confirms that `site/index.html`, `site/robots.txt`, `site/sitemap.xml`, and `site/site.webmanifest` are directly accessible. |
| Manual homepage inspection | Confirms that the BlogXiv logo, wordmark, navigation, search, and category links render as expected. |
| Metadata inspection | Confirms that canonical URL, Open Graph tags, Twitter Card tags, and Schema.org JSON-LD are present. |

## Attribution and Ethics

BlogXiv indexes external writing and does not claim ownership of the original posts. Each entry should preserve the canonical source URL, author or lab attribution, source name, and enough context for readers to evaluate provenance.

Summaries should be editorial and concise. They should not replace the original article, reproduce substantial portions of copyrighted content, or imply endorsement by the original author unless such endorsement is explicit.

## Local Development

No build step is required. Serve the `site/` directory with any static server:

```bash
python3 -m http.server 8000 --directory site
```

Then open:

```text
http://127.0.0.1:8000/index.html
```

Recommended local checks:

```bash
node --check site/assets/js/app.js
```

```bash
ruby -e "require 'yaml'; YAML.load_file('.github/workflows/pages.yml'); puts 'workflow yaml ok'"
```

## GitHub Pages Deployment

This repository is prepared for deployment from:

```text
OpenEnvision/BlogXiv
```

The included workflow at `.github/workflows/pages.yml` publishes the `site/` directory as a static GitHub Pages artifact when changes are pushed to `main`. The top-level `index.html` is kept for repository-level preview and local opening from the project root.

Repository settings:

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

If using the custom domain `blogxiv.org`, keep `site/CNAME` and configure DNS for GitHub Pages. If using the default GitHub Pages project URL, remove `site/CNAME` and update the production metadata described above.

## Repository Hygiene

BlogXiv is static by design. There are no runtime secrets, server credentials, or installation-time dependencies. The `.gitignore` excludes local operating-system artifacts, caches, logs, environment files, and temporary audit outputs.

Files such as `.DS_Store`, local reports under `reports/`, temporary crawl artifacts, and machine-specific caches should not be committed.

## Governance

BlogXiv is maintained by **OpenEnvision** as a curated AI research discovery project. Editorial changes should preserve three invariants:

1. Technical depth over breadth.
2. Transparent source attribution.
3. Searchable taxonomy over undifferentiated aggregation.

New entries should be added only when their source, author, topic, cover treatment, and category placement can be justified from the content itself.

## Citation

If BlogXiv is useful in academic or technical work, please cite the project as:

```bibtex
@misc{openenvision_blogxiv_2026,
  title        = {BlogXiv: A Curated Index for Technical AI Research Writing},
  author       = {{OpenEnvision}},
  year         = {2026},
  howpublished = {\url{https://blogxiv.org/}},
  note         = {Curated research blog index}
}
```

## Acknowledgment

BlogXiv recognizes the growing importance of research blogs, lab notes, conference blog tracks, and independent technical essays as part of the AI research record. The project is built to make that record easier to navigate, compare, and revisit.
