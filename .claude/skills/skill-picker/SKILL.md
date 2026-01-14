---
name: skill-picker
description: "Download skills from GitHub to local skills/ directory using npx gitpick. Triggers: 'gitpick <url>', 'download skill from github', 'install skill from <url>', 'fetch skill', 'add skill from github'. Use when user provides a GitHub URL and wants to download it as a skill."
---

# Skill Picker

Download GitHub directories to `skills/` using `npx gitpick`.

## Command

```bash
npx gitpick <github-url> -o skills/<skill-name>
```

## Workflow

1. Extract skill name from URL (last path segment)
2. Run: `npx gitpick <url> -o skills/<skill-name>`
3. Verify: `ls -la skills/<skill-name>/`

## URL Formats

```
# Directory (recommended)
https://github.com/owner/repo/tree/branch/path/to/skill

# Repository root
https://github.com/owner/repo
```

## Examples

```bash
# From subdirectory
npx gitpick https://github.com/user/repo/tree/main/.claude/skills/my-skill -o skills/my-skill

# From repo root
npx gitpick https://github.com/user/awesome-skill -o skills/awesome-skill
```
