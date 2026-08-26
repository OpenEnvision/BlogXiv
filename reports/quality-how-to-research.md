# How to Research shelf — canonical research-practice essays (quality pass)

Date: 2026-08-25
Scope: fill the `How to Research` category from the `blog.md` "How to Research" section (A+ first, then A), plus vetted extras. Every URL below was live-fetched during this pass (HTML 200 or PDF 200).

Artifacts:

- `admin/accepted-quality-how-to-research.json` — 39 accepted entries, full schema
- `site/assets/js/app.js` — new helper `getQualityHowToResearchBlogs()` spread into `getCuratedCommunityBlogs()`
- `admin/upsert-quality-how-to-research.sql` — Supabase upsert mirroring the JSON (operator must run manually)
- `blog.md` — 38 items flipped to `[x]` (only items added in this pass)

Shelf totals: 5 previously indexed + 39 added = 44 static entries with `category: 'How to Research'` (plus 7 ids reassigned to the shelf via `getCategoryReassignments()`).

## Added (39)

### A+ canon (from blog.md / mission list)

| Work | Author | URL used | Date |
| --- | --- | --- | --- |
| How to do Research At the MIT AI Lab | David Chapman et al. | dspace.mit.edu PDF (AI_WP_316) | 1988-09 |
| Film Study for Research | Jacob Steinhardt | jsteinhardt.stat.berkeley.edu/blog/film-study | 2021-06-28 |
| You and Your Research | Richard Hamming | cs.virginia.edu transcript (live, no mirror needed) | 1986-03-07 |
| Principles of Effective Research | Michael Nielsen | michaelnielsen.org | 2004-07-27 |
| How to Read a Paper | S. Keshav | Cambridge PDF (see PDF-canonical notes) | 2007-07 |

(The other A+ canon items — Feamster/Gray research course, Steinhardt stochastic decision process, Britz replication issues, Albrecht Becoming an AI Researcher, and the Peyton Jones Microsoft Research video — were already indexed in `app.js` and were left untouched.)

### Qualifying A (from blog.md)

- Terence Tao: Learn and Relearn Your Field (2007), On the Importance of Partial Progress (2012-07-17), Take the Initiative (2007) — all real career-advice posts, live.
- Stephen Stearns, Some Modest Advice for Graduate Students (1987) — stearnslab.yale.edu.
- Ronald Azuma, So Long, and Thanks for the Ph.D.! (1997, rev. 2019).
- Andrej Karpathy, A Survival Guide to a PhD (2016-09-07).
- John Schulman, An Opinionated Guide to ML Research — kept **HTTP** scheme (`http://joschu.net/...`): HTTPS handshake fails, HTTP returns 200. Link-health caveat recorded in the excerpt. Dated 2020-01-01 (first Wayback capture 2020-01-31).
- Matt Might: The Illustrated Guide to a Ph.D. (~2010) and A Ph.D. Thesis Proposal Is a Contract (first Wayback capture 2010-08).
- Chris Olah, Research Taste Exercises (2021-01-09).
- Nick Feamster, Cultivating Your Research Taste (Practice Space, 2025-10-29) — real essay, Substack og:image used.
- Jason Eisner, How to Find Research Problems (page states "Written by Jason Eisner in 1997").
- John Regehr, Picking a Research Topic in Computer Systems (2010-03-21).
- David Patterson, How to Have a Bad Career in Research/Academia (see PDF-canonical notes).
- Eugene Yan, Choosing Problems in Data Science and Machine Learning (2021-03-21, og:image used).
- Stanford Engineering / Michael Fischbach, How to Pick and Solve the Next Great Problem (2024-10-23, og:image used).
- Distill: Research Debt (2017-03-22) and Communicating with Interactive Articles (2020-09-11) — both use Distill thumbnails. Research Debt is about explaining/communicating research, which fits How to Research per the mission note.
- Google Brain Team's Approach to Research (Jeff Dean, 2017-09-13, og:image used).
- VisionBook (Torralba/Isola/Freeman, 2024): How to Do Research, How to Write Papers, How to Give Talks — all three are substantial book chapters, not link hubs.
- Stanford CS PhD Advising Guide — **included**: it is a substantive prose essay on the purpose of advising, rotations, and mutual advisor/student expectations, not a bureaucratic handbook. Dated 2023-01-01 (first Wayback capture at the canonical URL; the guide itself is older).
- UMD, Choosing a Research Advisor (A. Udaya Shankar) — short but a genuine essay (area vs. style framework). Page is undated; 2010-01-01 is an approximation.
- Noah A. Smith, Grad School Advice — a real essay (5 KB prose, 3 links), first Wayback capture 2007.
- Simon Peyton Jones: How to Write a Great Research Proposal and How to Give a Great Research Talk (see PDF-canonical notes).
- Mor Harchol-Balter, Applying to Ph.D. Programs in Computer Science — blog.md already points at the PDF; last revised 2014.
- CS Guides, Computer Science Graduate Job and Interview Guide — borderline call: it is about the post-PhD job market rather than day-to-day research method, but it is a substantial community-written guide with a clear through-line (not a link dump), listed in blog.md; included with that caveat in the excerpt. Dated 2020-01-01 (first Wayback capture).
- Jason Wei, Practicing AI Research (2023-02-07).
- Neel Guha, Templates for Machine Learning Research Papers (2026-03-24).
- Microsoft Research, How to Make a First Accomplishment in the NLP Field (2017-12-05).

### Extras beyond blog.md (1)

- Jacob Steinhardt, **Advice for Authors** (2017-02-28, jsteinhardt.stat.berkeley.edu/blog/advice-for-authors) — additional Steinhardt research-practice post found while checking his blog index; local-style paper-writing advice distilled from ICML reviewing.

Extras searched but **not added**:

- Hamming mirrors — unnecessary; the cs.virginia.edu transcript is live.
- "Write papers so people can reproduce them" — no canonical live essay with this identity could be found; web search only surfaced 2026 agent-reproducibility news posts, none of which is the referenced classic. Not added.
- "The Scientific Paper is Obsolete" (James Somers, The Atlantic, 2018) — excluded: it is a media essay about publishing formats, not research-practice guidance.
- Additional Steinhardt research-taste posts — his newer blog (bounded-regret.ghost.io) is mostly forecasting/alignment content; only Advice for Authors qualified.

## Skipped (with reasons)

| blog.md item | URL | Reason |
| --- | --- | --- |
| Advice on Research and Writing (CMU / Mark Leone mirror) | cs.cmu.edu/~eginting/how-to.html | Pure link collection (~1 KB prose, 17 links), no through-line |
| Advice on Grad School and Research (Jason Hong) | cs.cmu.edu/~jasonh/advice.html | Annotated link collection ("All of these links worked as of Sept 20, 2006") |
| Collected Advice on Research, Writing, and Speaking | cs.cmu.edu/~dpwu/knowhow.html | Predominantly a reference/link collection (Polya books, paper links) with only a short original section |
| Doctoral Advising Resources (CMU SCS) | cs.cmu.edu/education/phd/doctoral-advising/resources | Bureaucratic process FAQ (how to change advisers, funding procedures), not an essay |
| Writing a Good Scientific Paper (MPI-IS) | is.mpg.de/ps/news/writing-a-good-scientific-paper | Host serves a bot-detection challenge to non-browser clients; content could not be verified live |
| How to Create a Distill Article | distill.pub/guide/ | Authoring/submission documentation for one venue, not research-practice guidance |

Already indexed (left unchecked in blog.md per instructions, since they were not added in this pass): noise-lab research course, Steinhardt stochastic decision process, Britz replication issues, Albrecht phd-in-ai.com, Peyton Jones Microsoft Research video.

## PDF-canonical choices (HTML hub → PDF on same host)

1. **Chapman, How to do Research At the MIT AI Lab** — `https://dspace.mit.edu/bitstream/handle/1721.1/41487/AI_WP_316.pdf` (200, application/pdf via DSpace CDN). The old CSAIL HTML mirror returns 403; blog.md already pointed at this PDF.
2. **Keshav, How to Read a Paper** — blog.md's `htrap.html` is a thin hub (translations + link list); indexed the canonical two-page paper on the same host: `https://svr-sk818-web.cl.cam.ac.uk/keshav/papers/07/paper-reading.pdf` (200).
3. **Patterson, How to Have a Bad Career** — blog.md's `talks/research.html` is a bare abstract with no outgoing links; indexed the talk deck on the same host: `https://people.eecs.berkeley.edu/~pattrsn/talks/BadCareer.pdf` (200).
4. **Simon Peyton Jones proposal/talk** — blog.md already points at the PDFs on simon.peytonjones.org; both return 200.
5. **Harchol-Balter admissions guide** — blog.md already points at the PDF; 200.

## Dead URLs

None. Every candidate URL in the blog.md How to Research section resolved. The only degraded hosts: `is.mpg.de` (bot-challenge wall — skipped, see above) and `joschu.net` (HTTPS broken, HTTP 200 — kept HTTP).

## Covers and avatars

- og:image used where present and fetchable: Practice Space (Substack CDN), Stanford Engineering (Fischbach), Eugene Yan, Distill x2, Google Research. The Microsoft Research og:image returns 403 to non-browser clients, so that entry uses a thematic SVG instead.
- Entries without a usable og:image (classic personal pages, PDFs) use existing thematic SVG covers: `cover-lilian-research.svg` (general advice/practice), `cover-research-adjudication.svg` (writing/talks/reviewing), `cover-knowledge-representation.svg` (taste/problem choice). The five "generic" category SVGs were deliberately avoided because `enhanceCuratedBlogCover()` rewrites them.
- Avatars are Google favicon-service URLs for each source domain.

## Date notes (approximations)

Exact dates were used where the page states them (Regehr 2010-03-21, Olah 2021-01-09, Film Study 2021-06-28, Advice for Authors 2017-02-28, Nielsen 2004-07-27, Eugene Yan 2021-03-21, Fischbach 2024-10-23, Jason Wei 2023-02-07, Neel Guha 2026-03-24, Distill dates, Google Brain 2017-09-13, MSR NLP 2017-12-05, Karpathy 2016-09-07, Tao partial progress 2012-07-17, Hamming 1986-03-07, Chapman 1988-09). Year-only or first-capture approximations (YYYY-01-01): Stearns 1987, Tao career pages 2007, Eisner 1997, Azuma 1997, Patterson 1997, Noah Smith 2007, SPJ talk 1993 / proposal 2004, Might 2010 x2, Harchol-Balter 2014, csguides 2020, Schulman 2020, Stanford advising 2023, VisionBook 2024, Heinonen 2025, Keshav 2007-07 (CCR issue), UMD undated → 2010.

## Verification run

- `node --check site/assets/js/app.js` — pass
- Unique ids and urls across all static entries — pass (no duplicates)
- Live fetch of all 39 entry URLs + 6 remote cover URLs — all 200
- `site/explore.html?category=How%20to%20Research` smoke test — new entries render under the category filter
