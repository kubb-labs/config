# Kubb Skills

This directory contains skills for AI coding assistants working with the Kubb ecosystem. Each skill is a self-contained folder following the [Anthropic Skills](https://github.com/anthropics/skills) format and compatible with the [OpenSkills](https://github.com/numman-ali/openskills) loader.

## Available Skills

### Documentation & Style

- **[documentation](./documentation/)** - Guidelines for creating and maintaining Kubb documentation (Markdown/MDX with VitePress)
- **[code-style](./code-style/)** - Code style, testing, and PR guidelines for the Kubb repository
- **[changelog](./changelog/)** - Changelog maintenance and version management with Changesets

### Plugin Development

- **[plugin-development](./plugin-development/)** - Guidelines for developing Kubb plugins and understanding the plugin architecture
- **[react-components](./react-components/)** - Creating React components with @kubb/react-fabric for code generation
- **[openapi](./openapi/)** - Working with OpenAPI specifications, schemas, and operations in Kubb

## Skill Format

Each skill follows the Anthropic SKILL.md format:

```markdown
---
name: skill-name
description: When to use this skill
---

# Skill Title

Instructions and guidelines...
```

## Using Skills

### With GitHub Copilot

GitHub Copilot can access these skills when configured to use this repository as a knowledge source.

### With OpenSkills CLI

Install individual skills:

```bash
openskills install kubb-labs/config/skills/documentation
openskills install kubb-labs/config/skills/plugin-development
```

Or install from local directory:

```bash
openskills install ./skills/documentation
```

### Manual Usage

Each skill can be read directly and used as reference:

1. Navigate to the skill directory
2. Read the `SKILL.md` file
3. Follow the instructions and guidelines

## When to Use Each Skill

| Skill | Use When |
|-------|----------|
| documentation | Working on documentation files in the Kubb project |
| code-style | Writing or reviewing code for Kubb projects |
| changelog | Updating changelog, creating changesets, or managing releases |
| plugin-development | Creating or modifying Kubb plugins |
| react-components | Building code generation components with @kubb/react-fabric |
| openapi | Dealing with OpenAPI schemas and operations |

## Skill Structure

Each skill directory may contain:

```
skill-name/
├── SKILL.md          # Main skill instructions (required)
├── references/       # Additional documentation (optional)
├── scripts/          # Helper scripts (optional)
└── assets/           # Templates, configs, examples (optional)
```

## Contributing

When adding new skills:

1. Create a new directory under `skills/`
2. Add a `SKILL.md` file with YAML frontmatter
3. Follow the existing skill format and structure
4. Keep instructions clear, concise, and actionable
5. Use imperative form (not second person)
6. Update this README with the new skill

## References

- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [OpenSkills CLI](https://github.com/numman-ali/openskills)
- [Agent Skills Specification](https://agentskills.io)
- [Kubb Documentation](https://www.kubb.dev/)
- [Kubb AGENTS.md](https://github.com/kubb-labs/kubb/blob/main/AGENTS.md)

## License

These skills are provided under the same license as the Kubb project.
