# Skills Repository

This directory contains generic AI coding assistant skills that are framework-agnostic and can be used in any project.

For Kubb-specific skills, see the [`kubb-skills/`](../kubb-skills/) directory in the repository root.

## Available Generic Skills

- **[documentation](./documentation/)** - VitePress documentation standards (Markdown/MDX)
- **[code-style](./code-style/)** - TypeScript conventions, testing, and PR guidelines
- **[changelog](./changelog/)** - Changelog maintenance and version management with Changesets

## Kubb-Specific Skills

Kubb-specific skills are located in the [`kubb-skills/`](../kubb-skills/) directory:

- **[kubb-config](../kubb-skills/kubb-config/)** - Set up and configure kubb.config.ts for API code generation
- **[plugin-development](../kubb-skills/plugin-development/)** - Guidelines for developing Kubb plugins
- **[react-components](../kubb-skills/react-components/)** - Creating React components with @kubb/react-fabric
- **[openapi](../kubb-skills/openapi/)** - Working with OpenAPI specifications in Kubb

## Skill Format

Each skill follows the [Anthropic Skills](https://github.com/anthropics/skills) format:

\`\`\`markdown
---
name: skill-name
description: When to use this skill
---

# Skill Title

Instructions and guidelines...
\`\`\`

## Using Skills

### With GitHub Copilot

GitHub Copilot can access these skills when configured to use this repository as a knowledge source.

### With OpenSkills CLI

Install generic skills:
\`\`\`bash
openskills install kubb-labs/config/skills/documentation
openskills install kubb-labs/config/skills/code-style
\`\`\`

Install Kubb-specific skills:
\`\`\`bash
openskills install kubb-labs/config/kubb-skills/kubb-config
openskills install kubb-labs/config/kubb-skills/plugin-development
\`\`\`

### Manual Usage

Browse the skills directories and reference the SKILL.md files directly.

## When to Use Each Skill

### Generic Skills

| Skill | Use When |
|-------|----------|
| documentation | Working on VitePress documentation in any project |
| code-style | Writing or reviewing TypeScript code, running tests, or creating PRs |
| changelog | Updating changelog or managing versions with Changesets |

### Kubb-Specific Skills

| Skill | Use When |
|-------|----------|
| kubb-config | Setting up or modifying kubb.config.ts configuration |
| plugin-development | Creating or modifying Kubb plugins |
| react-components | Building code generation components with @kubb/react-fabric |
| openapi | Working with OpenAPI schemas and operations in Kubb |

## Skill Structure

Each skill directory may contain:

\`\`\`
skill-name/
├── SKILL.md          # Main skill instructions (required)
├── references/       # Additional documentation (optional)
├── scripts/          # Helper scripts (optional)
└── assets/           # Templates, configs, examples (optional)
\`\`\`

## Contributing

When adding new skills:

1. Determine if the skill is generic or Kubb-specific
2. Create directory under \`skills/\` (generic) or \`kubb-skills/\` (Kubb-specific)
3. Add a \`SKILL.md\` file with YAML frontmatter
4. Follow the existing skill format and structure
5. Keep instructions clear, concise, and actionable
6. Update this README with the new skill

## References

- [Anthropic Skills Repository](https://github.com/anthropics/skills)
- [OpenSkills CLI](https://github.com/numman-ali/openskills)
- [Agent Skills Specification](https://agentskills.io)
- [Claude Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- [Kubb Documentation](https://www.kubb.dev/)
- [Kubb AGENTS.md](https://github.com/kubb-labs/kubb/blob/main/AGENTS.md)

## License

These skills are provided under the same license as the Kubb project.
