# ADR-006 Explicit, hand-set `slug` fields, not auto-derived from title

## Context
Needed human-readable URLs (`/[bookSlug]/[chapterSlug]`) without using the existing internal, non-readable `id` fields.

## Decision
Add an explicit `slug` field to both `Book` and `Chapter`, set manually per entry, separate from `id`.

## Reason
A slug computed live from the title would silently break any shared link the moment a title is edited — a real risk for content the author revises over time.

## Alternatives Considered
### Live slugify from title
No new field, but breaks existing shared links on any title edit.
### Existing `id`
Already unique and stable, but not human-readable (`short_story1` vs. `the-razor-sharp-heirloom`).

## Consequences
### Positive
- Readable URLs that stay stable across title edits.
- Applies consistently at both book and chapter level.
### Negative
- One more field to set per book/chapter; needs dev-time uniqueness validation to catch typos.

## Status
Accepted
