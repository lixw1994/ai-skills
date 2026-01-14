# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Claude Skills marketplace repository. Skills are markdown-based instruction sets that extend Claude's capabilities for specific domains.

## Architecture

```
ai-skills/
├── .claude-plugin/marketplace.json  # Plugin registry - each skill is a separate plugin entry
├── skills/                          # Individual skill directories
│   └── <skill-name>/
│       ├── SKILL.md                 # Main skill definition (required)
│       ├── references/              # Supporting documentation (optional)
│       └── scripts/                 # Python tools (optional)
├── template/SKILL.md                # Skill template for new skills
└── .claude/skills/skill-picker/     # Local skill for downloading from GitHub
```

## Key Files

- **`.claude-plugin/marketplace.json`**: Plugin registry. Each skill must have its own plugin entry with `source` pointing to the skill directory and `skills: ["./SKILL.md"]`.
- **`skills/<name>/SKILL.md`**: Skill definition with YAML frontmatter (`name`, `description`) and markdown instructions.

## Adding New Skills

### Option 1: Download from GitHub

```bash
npx gitpick <github-url> -o skills/<skill-name>
```

### Option 2: Create Custom Skill

1. Create directory: `skills/<skill-name>/`
2. Create `SKILL.md` with frontmatter:
   ```markdown
   ---
   name: skill-name
   description: When Claude should use this skill
   ---

   # Skill Name

   [Instructions for Claude]
   ```
3. Optionally add `references/` and `scripts/` subdirectories

### Required Updates (for both options)

1. Add plugin entry to `.claude-plugin/marketplace.json`:
   ```json
   {
     "name": "<skill-name>",
     "description": "<description>",
     "source": "./skills/<skill-name>",
     "strict": false,
     "skills": ["./SKILL.md"]
   }
   ```

2. Update skill tables in both:
   - `README.md` (English)
   - `README.zh-CN.md` (Chinese)

## Lessons Learned

- **marketplace.json structure**: Each skill must be a separate plugin entry. Do NOT combine multiple skills into one plugin with multiple paths in the `skills` array - this breaks plugin installation.
- **Dual README maintenance**: Always update both English (`README.md`) and Chinese (`README.zh-CN.md`) when adding skills.
- **Skill path format**: In marketplace.json, `source` points to the skill directory, and `skills` array contains relative paths from that source (typically `["./SKILL.md"]`).

## References

- [Agent Skills Specification](https://agentskills.io/specification)
- [Creating custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
