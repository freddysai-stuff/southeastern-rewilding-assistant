# Data Docs

This directory is the **source of truth** for the domain knowledge that
powers the app's modules (Plant Library, Soil & Lawn Rebuilding, Fertilizer &
Feeding, Seasonal Timing) and — in a later phase — the AI assistant's
retrieval system.

## Structure

```
/data/
  plants/        Plant entries (JSON, validated against schema/plant.schema.json)
  soil/          Soil profile templates (JSON, validated against schema/soil-profile.schema.json)
  fertilizer/    Fertilizer/feeding recipes (JSON, validated against schema/fertilizer-recipe.schema.json)
  seasonal/      Zone-based seasonal guidance rules (JSON, validated against schema/seasonal-rule.schema.json)
  propagation/   Long-form propagation guides (Markdown with frontmatter)
  glossary/      Long-form glossary/reference content (Markdown)
  articles/      Distilled notes from research/chat sources (Markdown with frontmatter: id, title, tags, relatedPlants)
  _drafts/       Scratch area for AI-drafted docs pending human review (not loaded by the backend)
  schema/        JSON Schema definitions used for validation
  index.json     Registry listing every doc file, grouped by category
```

## Adding a new doc

1. Create the file under the appropriate subfolder (e.g. `plants/new-species.json`).
2. Add its relative path to the matching array in `index.json`.
3. Run `npm run validate:data` from the repo root to check it against the schema.
4. Commit and push — the backend's `DataDocService` loads these files at startup.

## Updating a doc

Edit the file, bump its `version` field (semantic versioning) and `updated`
date, re-validate, then commit.

## Removing a doc

Delete the file and remove its entry from `index.json`, then re-validate.

## Formats

- **JSON** — structured data that benefits from schema validation (plants,
  soil, fertilizer, seasonal rules).
- **Markdown** (with YAML frontmatter) — long-form guides (propagation
  steps, glossary entries, articles) where prose matters more than strict
  structure.

## Articles (distilled research/chat notes)

`articles/*.md` is for narrative content — e.g. content distilled from AI
chat history, research notes, or anything that doesn't cleanly fit the
strict plant/soil/fertilizer/seasonal schemas. Frontmatter convention:

```
---
id: white-dutch-clover-behavior
title: White Dutch Clover — Germination, Behavior & Soil Impact
tags: [clover, zone-9a, soil-building, ground-cover]
relatedPlants: [white-dutch-clover]
version: 1.0.0
updated: 2026-07-13
---
# White Dutch Clover — Germination, Behavior & Soil Impact
... body content, headings preserved ...
```

Only `id`/`title` are required by convention; `tags` and `relatedPlants` help
retrieval surface the article for relevant queries. If a clear structured
fact emerges (e.g. a plant's zone/water needs), also add a minimal entry to
the matching JSON category and cross-reference it.

## Content philosophy: invasives & "weeds"

SERA is native-habitat-first, but the practical reality of a real yard
includes invasive ornamentals and volunteer "weeds." The house style is
**control + work with the positives**, not blanket avoidance:

- Identify the plant/species clearly and flag control/containment needs
  (e.g. edging barriers, deadheading before seed-set, physical removal
  windows) rather than just saying "don't plant this."
- Always also note any genuine benefit it's providing in place (erosion
  control, pollinator value, organic matter, wildlife food, shading bare
  soil) so the user can make an informed call instead of reflexively
  ripping it out.
- Use `tags` like `invasive-caution` or `volunteer-weed` so this content is
  easy to find and cross-reference later.
- Reserve outright "avoid entirely" framing for species with no redeeming
  practical use and a serious ecological risk in the region.

See `articles/using-weeds-as-garden-inputs-overview.md` for the general
technique reference this policy is built on (chop-and-drop mulching, weed
tea fertilizer, reading weeds as soil indicators, and the "golden rule" for
reconciling deliberately-kept pollinator patches with keeping other areas
clean). `articles/birdseed-sprouts-in-lawn.md`, `dog-fennel-native-
volunteer-control-and-vase-use.md`, `spanish-needles-pollinator-weed-
containment.md`, and `bahia-grass-embracing-a-low-input-lawn-and-pasture.md`
are worked examples of the framing applied to specific species.

If a species/identity in a source transcript is not clearly confirmed
(e.g. the user expresses doubt or a photo ID is still pending), tag the doc
`unconfirmed-id` and say so explicitly in the body rather than presenting a
guess as settled fact — see `articles/unconfirmed-clinging-white-flowered-
monarch-vine.md` for the pattern.

## Future phases (not yet built)

Embedding these docs into a vector database for AI-assisted retrieval,
GitHub Actions auto-validation/re-embedding on commit, and a doc dashboard
are planned for later phases — see the project roadmap.
