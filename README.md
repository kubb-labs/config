# Kubb Configuration & Skills

This repository contains configuration files and AI coding assistant skills for the [Kubb](https://github.com/kubb-labs/kubb) ecosystem.

## Contents

### Skills

The `skills/` directory contains AI coding assistant skills following the [Anthropic Skills](https://github.com/anthropics/skills) format, organized into two categories:

**Generic Skills** (reusable across projects):
- **Documentation** - VitePress documentation standards
- **Code Style** - TypeScript conventions and testing guidelines
- **Changelog** - Version management with Changesets

**Kubb-Specific Skills** (in `skills/kubbSkills/`):
- **Kubb Config** - Setting up kubb.config.ts for API code generation
- **Plugin Development** - Plugin architecture and patterns
- **React Components** - Code generation with @kubb/react-fabric
- **OpenAPI** - Working with API specifications in Kubb

See [skills/README.md](./skills/README.md) for detailed information about each skill.

## Using the Skills

### With GitHub Copilot

GitHub Copilot can access these skills when configured to use this repository as a knowledge source.

### With OpenSkills

Generic skills:
```bash
openskills install kubb-labs/config/skills/documentation
openskills install kubb-labs/config/skills/code-style
```

Kubb-specific skills:
```bash
openskills install kubb-labs/config/skills/kubbSkills/kubb-config
openskills install kubb-labs/config/skills/kubbSkills/plugin-development
```

### Manual

Browse the [skills](./skills/) directory and reference the SKILL.md files directly.

## About Kubb

Kubb is the ultimate toolkit for working with APIs. It generates type-safe code from OpenAPI specifications for:

- TypeScript types
- Zod schemas
- React Query hooks
- Axios/Fetch clients
- Mock data with Faker
- And more...

Learn more at [kubb.dev](https://www.kubb.dev/)

## Related Repositories

- [kubb-labs/kubb](https://github.com/kubb-labs/kubb) - Main Kubb repository
- [anthropics/skills](https://github.com/anthropics/skills) - Anthropic Skills repository
- [numman-ali/openskills](https://github.com/numman-ali/openskills) - OpenSkills CLI

## License

MIT License - see [LICENSE](./LICENSE) file for details.

Copyright (c) 2025 Stijn Van Hulle
