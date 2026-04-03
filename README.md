# AI Skills Marketplace

[English](./README.md) | [中文](./README.zh-CN.md)

Personal Claude Skills collection focused on enhancing AI-assisted development and design efficiency.

## Skills

| Skill                                                             | Description                    | Key Features                                                           |
| ----------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------- |
| **[xlsx](./skills/xlsx)**                                         | Excel Spreadsheet Processing   | Create, edit, analyze, formulas, data visualization                    |
| **[ceo-advisor](./skills/ceo-advisor)**                           | CEO Executive Leadership       | Strategy analyzer, financial modeling, board governance, investor relations |
| **[cto-advisor](./skills/cto-advisor)**                           | CTO Technical Leadership       | Tech debt analyzer, team scaling, DORA metrics, ADR templates          |
| **[content-creator](./skills/content-creator)**                   | Content Marketing              | Brand voice analyzer, SEO optimizer, content frameworks, social templates |
| **[content-research-writer](./skills/content-research-writer)**   | Content Research & Writing     | Research, citations, hooks, outlines, section feedback                 |
| **[git-guardrails-claude-code](./skills/git-guardrails-claude-code)** | Git Safety Guardrails    | Block dangerous git commands (push, reset --hard, clean, branch -D)   |
| **[ubiquitous-language](./skills/ubiquitous-language)**           | DDD Ubiquitous Language        | Extract glossary, flag ambiguities, propose canonical terms            |
| **[write-a-prd](./skills/write-a-prd)**                         | PRD Writer                     | User interview, codebase exploration, module design, local prd/ output |
| **[gh-pr-code-review](./skills/gh-pr-code-review)**             | GitHub PR Code Review          | Interactive setup, batch parallel review, custom rules, test scope suggestions |
| **[test-driven-development](./skills/test-driven-development)** | Test-Driven Development        | Red-Green-Refactor cycle, failing test first, minimal code, anti-patterns guide |
| **[brainstorming](./skills/brainstorming)**                     | Creative Brainstorming         | Intent exploration, requirements discovery, visual companion, spec review       |
| **[write-a-skill](./skills/write-a-skill)**                     | Skill Authoring Guide          | TDD for skills, CSO optimization, pressure testing, anti-patterns              |
| **[lixw-youtube-transcript](./skills/lixw-youtube-transcript)** | YouTube Transcript Downloader | Multi-language subtitles, translation, chapters, speaker identification        |
| **[lixw-fal-image](./skills/lixw-fal-image)**                   | fal.ai Image Generator        | GPT Image 1/1.5, Nano Banana 2, text-to-image, local save                     |
| **[lixw-article-illustrator](./skills/lixw-article-illustrator)** | Article Illustrator         | Analyze structure, identify illustration positions, Type x Style generation    |
| **[lixw-comic](./skills/lixw-comic)**                           | Knowledge Comic Creator        | Multiple art styles, panel layouts, sequential image generation                |
| **[lixw-compress-image](./skills/lixw-compress-image)**         | Image Compressor               | WebP/PNG compression, automatic tool selection                                 |
| **[lixw-cover-image](./skills/lixw-cover-image)**               | Cover Image Generator          | 5-dimension customization, 10 palettes, 7 rendering styles                    |
| **[lixw-translate](./skills/lixw-translate)**         | Document Translator            | Quick/normal/refined modes, custom glossaries, terminology consistency          |
| **[lixw-format-markdown](./skills/lixw-format-markdown)**       | Markdown Formatter             | Frontmatter, headings, bold, lists, code blocks, formatted output              |
| **[lixw-paper](./skills/lixw-paper)**                   | Paper Reader                   | Extract ideas from research papers, non-academic focus, arxiv/PDF support      |
| **[lixw-invest](./skills/lixw-invest)**                 | Investment Analyzer            | Deep investment analysis, order-creation evaluation, founder interview analysis |
| **[lixw-learn](./skills/lixw-learn)**                   | Concept Anatomist              | 8 exploration dimensions, dialectics, phenomenology, epiphany compression      |
| **[lixw-relationship](./skills/lixw-relationship)**     | Relationship Analyst           | 5-layer structural diagnostics, psychoanalytic depth, transference patterns    |
| **[lixw-roundtable](./skills/lixw-roundtable)**         | Roundtable Discussion          | Truth-seeking moderator, multi-perspective debate, dialectical framework       |
| **[lixw-travel](./skills/lixw-travel)**                 | Travel Researcher              | Museum & architecture research, knowledge docs, portable reference cards       |
| **[lixw-writes](./skills/lixw-writes)**                 | Writing Engine                 | Develop ideas through writing, structured thinking process                     |
| **[lixw-card](./skills/lixw-card)**                     | Content Caster                 | 6 mold types (long card, infograph, comic, whiteboard, etc.), PNG output       |
| **[lixw-paper-flow](./skills/lixw-paper-flow)**         | Paper Workflow                 | Read papers + cast cards in one go, batch arxiv/PDF processing                 |
| **[lixw-x-download](./skills/lixw-x-download)**         | X/Twitter Media Downloader     | Download images and videos from X/Twitter posts                                |
| **[lixw-fomo](./skills/lixw-fomo)**                     | FOMO Killer                    | Kill tech FOMO in 10 min, structured knowledge note + summary card             |
| **[lixw-preface](./skills/lixw-preface)**               | Recommendation Preface         | Standalone essay with hook opening, opinion-first, seamless quote integration  |
| **[lixw-arrow](./skills/lixw-arrow)**                   | Root-Tracing Arrow             | Vertical drilling from surface to bedrock, layer by layer to irreducible truth |
| **[lixw-market-research](./skills/lixw-market-research)** | Market Research Analyst      | Pain-level diagnosis, competitive matrix, ROI three-scenario model, outside insight calibration |

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
│   ├── xlsx/              # Excel processing
│   └── lixw-*/            # Personal skills collection
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
