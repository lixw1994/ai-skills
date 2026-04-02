# Workflow Mechanics

Details for source materialization, output directory creation, and conflict resolution.

## Materialize Source

| Input Type | Action |
|------------|--------|
| File | Copy to `{source-dir}/{slug}/source.md` |
| Inline text | Save to `translate/{slug}/source.md` |
| URL | Fetch content, save to `translate/{slug}/source.md` |

`{slug}`: 2-4 word kebab-case slug derived from content topic.

## Create Output Directory

Output directory is a language subdirectory under `{slug}/`: `{slug}/{target-lang}/`

Examples:
- URL input → `translate/ai-future/source.md` + `translate/ai-future/zh-CN/`
- File `posts/article.md` → `posts/article/source.md` + `posts/article/zh-CN/`

## Conflict Resolution

If the output directory already exists, rename the existing one to `{name}.backup-YYYYMMDD-HHMMSS/` before creating the new one. Never overwrite existing results.
