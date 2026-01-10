---
name: kubb-config
description: Set up and configure kubb.config.ts for API code generation. Use when creating or modifying Kubb configuration files.
---

# Kubb Configuration

Configure `kubb.config.ts` for generating type-safe code from OpenAPI specifications.

## Basic Structure

See `references/basic-structure.md` for the minimal configuration template.

Three required fields:
- **input**: Path to OpenAPI spec or inline data
- **output**: Generated code destination directory
- **plugins**: Array of code generators (always include `pluginOas()` first)

## Common Setups

Choose a configuration pattern based on your needs:

### TypeScript Types Only
Generate TypeScript interfaces and types from OpenAPI schemas.
See `assets/typescript-config.ts`

### React Query + TypeScript
Generate React Query hooks with TypeScript types for API calls.
See `assets/react-query-config.ts`

### Full Stack
Complete setup with types, validation, hooks, and client.
See `assets/full-stack-config.ts`

### Multi-API
Configure multiple OpenAPI specs in one file.
See `assets/multi-api-config.ts`

## Plugin Options

Common plugin configurations:
- **pluginTs**: `enumType`, `dateType`, `optionalType` - See `references/plugin-options.md`
- **pluginZod**: `coerce`, `typed` - See `references/plugin-options.md`
- **pluginReactQuery**: `infinite`, `suspense` - See `references/plugin-options.md`

For filtering and grouping: `output`, `group`, `include`, `exclude` options.
See `references/common-options.md`

## Running

```bash
npx kubb                    # Auto-discover config
npx kubb --config ./path    # Specify config file
npx kubb --watch            # Watch mode
```

## Best Practices

1. Use TypeScript config (`kubb.config.ts`) for type safety
2. Set `clean: true` to prevent stale files
3. `pluginOas()` must be first in plugins array
4. Use relative paths from project root
5. Organize output by plugin (separate paths)
6. Group by tags for logical file structure

## Common Issues

**Missing pluginOas**: All plugins require `pluginOas()` first
**Path resolution**: Plugin paths are relative to config `output.path`

See `references/troubleshooting.md` for solutions.
