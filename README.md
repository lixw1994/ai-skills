# AI Skills Marketplace

[English](./README.md) | [中文](./README.zh-CN.md)

Personal Claude Skills collection focused on enhancing AI-assisted development and design efficiency.

## Skills

| Skill                                                             | Description                    | Key Features                                                           |
| ----------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| **[ui-ux-pro-max](./skills/ui-ux-pro-max)**                       | UI/UX Design Intelligence      | 50 styles, 21 color palettes, 50 font pairings, 9 tech stacks          |
| **[xlsx](./skills/xlsx)**                                         | Excel Spreadsheet Processing   | Create, edit, analyze, formulas, data visualization                    |
| **[ceo-advisor](./skills/ceo-advisor)**                           | CEO Executive Leadership       | Strategy analyzer, financial modeling, board governance, investor relations |
| **[cto-advisor](./skills/cto-advisor)**                           | CTO Technical Leadership       | Tech debt analyzer, team scaling, DORA metrics, ADR templates          |
| **[content-creator](./skills/content-creator)**                   | Content Marketing              | Brand voice analyzer, SEO optimizer, content frameworks, social templates |
| **[content-research-writer](./skills/content-research-writer)**   | Content Research & Writing     | Research, citations, hooks, outlines, section feedback                 |

## Quick Start

### Claude Code

Register this repository as a Claude Code Plugin marketplace:

```bash
/plugin marketplace add lixw1994/ai-skills
```

Install skills:

```bash
/plugin install ai-skills@lixw1994-ai-skills
```

### Claude.ai

1. Download the skill folder
2. Follow [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude) to upload

### Claude API

See [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)

## Repository Structure

```
ai-skills/
├── .claude-plugin/        # Plugin configuration
│   └── marketplace.json   # Marketplace config file
├── skills/                # Skills collection
│   ├── ui-ux-pro-max/     # UI/UX design intelligence
│   └── xlsx/              # Excel processing
├── template/              # Skill template
└── spec/                  # Agent Skills specification
```

## Creating Custom Skills

### Option 1: Use Template

Start with `template/SKILL.md`:

```markdown
---
name: my-skill-name
description: Describe what the skill does and when to use it
---

# Skill Name

[Add instructions for Claude to follow]
```

### Option 2: Use skill-creator

If you have the [anthropics/skills](https://github.com/anthropics/skills) plugin installed, use the `skill-creator` skill:

```
Help me create a skill for [your use case]
```

The skill-creator will guide you through designing effective skills with proper structure, triggers, and instructions.

### Resources

- [What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Creating custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Agent Skills Specification](https://agentskills.io/specification)
