# AI Skills Marketplace

[English](./README.md) | [中文](./README.zh-CN.md)

个人 Claude Skills 集合，专注于提升 AI 辅助开发和设计的效率。

## Skills 列表

| Skill                                       | 描述               | 关键能力                                                    |
| ------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| **[ui-ux-pro-max](./skills/ui-ux-pro-max)** | UI/UX 设计智能助手 | 50 种设计风格、21 套配色方案、50 组字体搭配、9 种技术栈支持 |
| **[xlsx](./skills/xlsx)**                   | Excel 电子表格处理 | 创建、编辑、分析、公式计算、数据可视化                      |

## 快速开始

### Claude Code

将此仓库注册为 Claude Code Plugin marketplace：

```bash
/plugin marketplace add lixw1994/ai-skills
```

安装 skills：

```bash
/plugin install ai-skills@lixw1994-ai-skills
```

### Claude.ai

1. 下载 skill 文件夹
2. 按照 [Using skills in Claude](https://support.claude.com/en/articles/12512180-using-skills-in-claude) 上传

### Claude API

参考 [Skills API Quickstart](https://docs.claude.com/en/api/skills-guide#creating-a-skill)

## 仓库结构

```
ai-skills/
├── .claude-plugin/        # Plugin 配置
│   └── marketplace.json   # Marketplace 配置文件
├── skills/                # Skills 集合
│   ├── ui-ux-pro-max/     # UI/UX 设计智能
│   └── xlsx/              # Excel 处理
├── template/              # Skill 模板
└── spec/                  # Agent Skills 规范
```

## 创建自定义 Skill

### 方式一：使用模板

以 `template/SKILL.md` 作为起点：

```markdown
---
name: my-skill-name
description: 描述 skill 的功能和使用场景
---

# Skill 名称

[在此添加 Claude 需要遵循的指令]
```

### 方式二：使用 skill-creator

如果你已安装 [anthropics/skills](https://github.com/anthropics/skills) 插件，可以使用 `skill-creator` 技能：

```
帮我创建一个用于 [你的使用场景] 的 skill
```

skill-creator 会引导你设计有效的 skill，包括正确的结构、触发条件和指令。

### 参考资料

- [What are skills?](https://support.claude.com/en/articles/12512176-what-are-skills)
- [Creating custom skills](https://support.claude.com/en/articles/12512198-creating-custom-skills)
- [Agent Skills Specification](https://agentskills.io/specification)
