# BlogrXiv Submission Review Workflow

BlogrXiv is a static, editorially curated index. GitHub Discussions receive recommended blog links, Pull Requests receive original writing, and email is a fallback intake channel. GitHub Pages remains the deployment surface. New submissions are pending by default, and only accepted items that have been converted into static metadata or merged content become public.

For the full state model and public metadata boundary, see `docs/EDITORIAL_MODERATION_MODEL.md`.

## Submission Types

| Type | Intake | Best for | Publication path |
| --- | --- | --- | --- |
| Blog link recommendation | GitHub Discussion, or email if GitHub is unavailable | Existing public posts, including the recommender's own blog | Add accepted metadata to the static index |
| Original writing submission | GitHub Pull Request, or email if GitHub is unavailable | Markdown articles authored by the submitter | Review, request edits, then index or publish as static content |

## Labels

Use these labels to track state:

| Label | Meaning |
| --- | --- |
| `submission` | External blog link submitted for review |
| `original-writing` | Original Markdown writing submitted or proposed |
| `pending-review` | Awaiting editorial review |
| `needs-info` | Submitter needs to provide more information |
| `accepted` | Approved for inclusion, not yet published |
| `rejected` | Not accepted |
| `published` | Added to the public site |
| `duplicate` | Already indexed or already submitted |
| `out-of-scope` | Outside BlogrXiv scope |
| `hidden` | Previously published entry removed from the public index |
| `appealed` | Decision is being reconsidered |

## Review Criteria

Evaluate every submission across five dimensions:

| Dimension | Question |
| --- | --- |
| Technical contribution | Does it explain a mechanism, method, system behavior, experiment, failure mode, or research lesson? |
| Specificity | Does it provide concrete detail instead of generic commentary? |
| Source quality | Are the author, lab, venue, or community context identifiable and credible? |
| Reusability | Will the post remain useful after the immediate news cycle? |
| Taxonomic fit | Can it be assigned to a BlogrXiv category and meaningful tags? |

## Link Submission Flow

1. New Discussion arrives with `submission` and `pending-review`, or a maintainer mirrors an email submission into the same review process.
2. Check the URL, author identity, scope, technical value, and duplicate status.
3. If more context is needed, add `needs-info` and comment with requested changes.
4. If rejected, add `rejected` or `out-of-scope`, explain briefly, and close the issue.
5. If accepted, add `accepted`, leave an editorial decision comment when a GitHub record exists, prepare a static metadata entry, and add it to `site/assets/js/app.js`.
6. Run `node --check site/assets/js/app.js`.
7. After deployment, add `published` and reply with the publication link.

## Original Writing Flow

1. Pull Requests should follow `submissions/template.md`; email submissions should include the same fields and article body.
2. Confirm author permission, license, references, category, tags, summary, and technical value.
3. Review Markdown structure and request edits in PR comments when needed.
4. If accepted, add an editorial decision comment, merge the PR, and decide whether to index the piece, link to the repository file, or convert it into a static post page.
5. After publication, mark the related issue or PR as `published`; for email-only submissions, record publication in the publishing commit or a maintainer-created tracking issue.

## Editorial Decision Comments

For every acceptance, rejection, removal, or appeal, comment with `admin/review-decision-template.md` when a GitHub record exists. Treat the comment as the moderation event: concise, factual, and free of unnecessary personal data.

Public metadata must never include submitter contact details, internal review notes, or reviewer-only discussion. Public pages should expose only accepted static metadata and canonical source links.

## Static Index Entry

Accepted link submissions should be converted into the existing metadata shape:

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
    coverImage: "assets/img/covers/cover-independent-llm.svg",
    coverAlt: "Accessible image description",
    coverFit: "cover"
}
```

## Fast Admin Publishing

For accepted submissions, maintainers can avoid editing `site/assets/js/app.js` by hand:

1. Copy `admin/new-blog-template.json` to a working file such as `admin/accepted-blog.json`.
2. Fill in the accepted title, URL, author, category, tags, excerpt, source, and publication date.
3. Run `node scripts/add_blog.mjs admin/accepted-blog.json`.
4. Run `node --check site/assets/js/app.js`.
5. Preview the site, then commit the generated change.

The script inserts the new entry at the top of `getRecentCommunityBlogAdditions()`, generates a stable id when one is not supplied, fills a favicon avatar from the submitted URL when needed, and refuses duplicate ids.
