# BlogrXiv Editorial Moderation Model

BlogrXiv is a static, editorially curated index. It uses GitHub Discussions for recommended links, Pull Requests for original writing, and labels, comments, reviews, and commits as the moderation system. Email is a fallback intake channel for people who cannot or do not want to use GitHub.

Submissions are never published directly from an intake form. A recommended link starts as a Discussion or email. Original writing starts as a Pull Request or email. Editors review the submission, record a decision, and only accepted work is converted into static site metadata or merged as static content.

## Design Principles

| Principle | BlogrXiv implementation |
| --- | --- |
| Pending by default | New Discussions and Pull Requests start with `pending-review`; email submissions are manually mirrored into the same review process. |
| Explicit approval | A submission becomes public only after an editor marks it `accepted`, prepares metadata or content changes, and merges or commits the static update. |
| Public read boundary | Public pages read from committed static files such as `site/assets/js/app.js`; rejected submissions, drafts, contact details, and review notes are not part of the public corpus. |
| Source-linked | Accepted link submissions point to the canonical source URL rather than duplicating the original article. |
| Authorship-aware | Original writing must be submitted by the author or with explicit permission. |
| Auditable decisions | Labels, comments, PR reviews, commits, and merge history record moderation decisions. |
| Reversible removal | If a published entry later needs removal, remove it from the static index and record the reason in a GitHub Discussion, PR, or maintainer note. |

## Submission Paths

| Path | Primary intake | Email fallback | Best for | Public before approval? |
| --- | --- | --- | --- | --- |
| Blog link recommendation | GitHub Discussion using the repository's `Ideas` category and `.github/DISCUSSION_TEMPLATE/ideas.yml` | Email with title, URL, author, BlogrXiv category, summary, and recommendation reason | Existing public posts, including the recommender's own blog | No |
| Original writing | Pull Request using `submissions/template.md` | Email with Markdown attachment/body and author permission statement | Unpublished or repository-hosted writing by the submitter | No |

## State Model

Use GitHub labels as the state machine:

| Label | Meaning | Public effect |
| --- | --- | --- |
| `submission` | External blog link submitted for review. | Not public. |
| `original-writing` | Original Markdown writing submitted or proposed. | Not public. |
| `pending-review` | Awaiting editorial review. | Not public unless already published before a correction request. |
| `needs-info` | Submitter needs to provide more information. | Not public. |
| `accepted` | Approved for inclusion, but not yet shipped. | Not public until static metadata/content is committed. |
| `published` | Added to the public site and deployed. | Public. |
| `rejected` | Not accepted after review. | Not public. |
| `duplicate` | Already indexed or already submitted. | No new public entry. |
| `out-of-scope` | Outside BlogrXiv scope. | Not public. |
| `hidden` | Previously published entry removed from the public index. | Removed from public pages. |
| `appealed` | Decision is being reconsidered. | Public only if the entry is still present in static files. |

Closed items should have one clear terminal disposition: `published`, `rejected`, `duplicate`, `out-of-scope`, or `hidden`.

## Link Recommendation Requirements

Recommended public blogs should include:

| Field | Purpose |
| --- | --- |
| Blog title | Identifies the recommended post. |
| Canonical URL | Preserves source attribution and avoids content duplication. |
| Author / lab / organization | Makes provenance legible. |
| Suggested BlogrXiv category | Places the post in the BlogrXiv taxonomy. |
| Suggested tags | Improves search and discovery. |
| Short summary | Gives editors a quick understanding of the post. |
| Recommendation reason | Explains the technical mechanism, implementation detail, evaluation insight, or durable research lesson. |
| Related paper or code | Optional supporting context. |

## Original Writing Requirements

Original writing should include:

| Field | Purpose |
| --- | --- |
| Markdown article | The full proposed article body. |
| Front matter | Title, author, author URL, category, tags, canonical URL, and license statement. |
| Author confirmation | Confirms the submitter wrote the piece or has permission. |
| Summary | Helps editors evaluate fit quickly. |
| Value statement | Explains the technical contribution or research lesson. |
| References | Identifies papers, code, datasets, images, and quoted material. |

## Public Metadata Contract

Accepted link submissions are converted into the compact public schema already used by BlogrXiv:

```js
{
  id: "stable-slug",
  title: "Post title",
  excerpt: "Editorial summary",
  author: "Author, lab, or publication",
  authorAvatar: "Avatar or favicon URL",
  category: "Taxonomy label",
  tags: ["Topic", "Method"],
  readTime: "Estimated reading time",
  publishDate: "YYYY-MM-DD",
  sourceName: "Canonical source",
  url: "https://canonical.example/post",
  coverImage: "assets/img/covers/example.svg",
  coverAlt: "Accessible cover description",
  coverFit: "cover"
}
```

Do not copy submitter email, private review comments, internal scoring notes, or personal contact details into this public object.

## Editorial Decision Record

For acceptance, rejection, removal, or appeal, leave a concise GitHub comment when a Discussion, Issue, or PR exists. Email-only submissions should be mirrored into a maintainer-created Discussion or recorded in the commit/PR that publishes the accepted item.

Use `admin/review-decision-template.md` as the decision comment shape. Keep decision notes factual, concise, and free of unnecessary personal data.

## Publishing Gate

Before adding a submission to the public site:

1. Confirm the Discussion, PR, or email has enough metadata to identify title, URL, author, source, category, tags, and publication date.
2. Confirm the content is technically substantive, source-linked, and within BlogrXiv scope.
3. Add or record `accepted`.
4. For link submissions, convert the item with `admin/new-blog-template.json` and `node scripts/add_blog.mjs`.
5. For original writing, merge the reviewed Markdown or convert it into an indexed/static page.
6. Run `node --check site/assets/js/app.js`.
7. Preview the site.
8. Commit the static metadata/content change.
9. After deployment, add or record `published` and reply to the Discussion or PR when one exists.

## Removal Gate

If an accepted entry needs to be removed:

1. Open or locate a correction/removal Discussion or PR.
2. Add `pending-review`.
3. Explain the reason briefly without reproducing private details.
4. Remove the item from `site/assets/js/app.js` or the relevant static content file.
5. Add `hidden` after deployment and reply to the Discussion or PR.

This keeps BlogrXiv conservative, static, and auditable while still allowing both GitHub-native and email-based submissions.
