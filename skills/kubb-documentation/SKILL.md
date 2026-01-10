---
name: kubb-documentation
description: Guidelines for creating and maintaining Kubb documentation. Use when working on documentation in the Kubb project (Markdown/MDX with VitePress).
---

# Kubb Documentation Skill

This skill provides comprehensive guidelines for AI coding assistants working on Kubb documentation.

## Scope

Documentation in the `docs/` folder (Markdown/MDX with VitePress)

## Goal

Create clear, concise, practical documentation optimized for developer experience.

## When to Update Documentation

**Always update docs when:**
- Adding a new plugin, feature, or option
- Changing plugin behavior or API signatures
- Fixing bugs that affect user-facing behavior

## Folder Structure

```
docs/
├── .vitepress/           # VitePress configuration
├── migration-guide.md    # Updated after major releases
├── changelog.md          # Updated with every PR (via changeset)
├── getting-started/      # Getting started guides
├── blog/                 # Blog posts (after major releases)
├── helpers/              # Extra packages (CLI, OAS core)
├── knowledge-base/       # Feature deep-dives and how-tos
├── plugins/              # Plugin documentation
│   ├── core/             # Shared plugin options
│   └── plugin-*/         # Individual plugin docs
├── tutorials/            # Step-by-step tutorials
├── examples/             # Playground and examples
└── builders/             # Builder integrations (unplugin, etc.)
```

## File Naming Conventions

- **Use kebab-case**: `how-to-do-thing.md`
- **Be descriptive**: `multipart-form-data.md` not `form.md`
- **Match URL structure**: File name becomes the URL path

## Frontmatter Requirements

Every documentation file must include YAML frontmatter:

```yaml
---
layout: doc          # Always use 'doc' for documentation pages
title: Page Title     # Displayed in browser tab and page header
outline: deep        # Enables deep table of contents
---
```

For plugin documentation:

```yaml
---
layout: doc
title: \@kubb/plugin-name  # Escape @ symbol
outline: deep
---
```

## Plugin Documentation Template

Every plugin doc follows this order:

1. **Title and one-sentence description**
   ```markdown
   # @kubb/plugin-name
   
   Generate TypeScript types from OpenAPI schemas.
   ```

2. **Installation** (with code-group for all package managers)

3. **Options** (one section per option, in logical order)
   - Start with `output` options (path, barrelType, etc.)
   - Then feature-specific options
   - End with advanced/rare options

4. **Examples** (complete working configurations)

5. **Links** (optional, if relevant)

## Options Documentation Format

For each option, use this structure:

```markdown
### optionName

Brief one-sentence description of what this option does.

> [!TIP]
> Additional context: when to use it, performance implications, or helpful notes

|           |             |
|----------:|:------------|
|     Type: | `string`    |
| Required: | `false`     |
|  Default: | `'default'` |

**Example:**

\`\`\`typescript
// Show minimal usage example
\`\`\`
```

**Rules:**
- **One sentence description**: Start with what it does, not why
- **Type accuracy**: Use exact TypeScript types from the code
- **Always include Required**: `true` or `false`, never omit
- **Always include Default**: If there's a default, specify it. If no default, omit this row
- **Use callouts correctly**: `> [!TIP]`, `> [!WARNING]`, `> [!NOTE]`, `> [!IMPORTANT]`, `> [!CAUTION]`
- **Add examples**: For complex options, show a working example

## Code Examples Structure

Place examples at the bottom of each page, after all options are documented.

**Always include:**
- All required imports
- Minimal but complete configuration
- Standard example file: `petStore.yaml`
- All prerequisite plugins (e.g., `pluginOas()`)

**Example structure:**

```typescript [kubb.config.ts]
import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginTs } from '@kubb/plugin-ts'

export default defineConfig({
  input: {
    path: './petStore.yaml',
  },
  output: {
    path: './src/gen',
  },
  plugins: [
    pluginOas(),
    pluginTs({
      // Show the relevant options being documented
      output: { path: 'models' },
      enumType: 'asConst',
    }),
  ],
})
```

**Guidelines:**
- Use `twoslash` annotation for TypeScript: enables type checking
- Show only relevant options, omit unrelated configuration
- Use code groups for multiple package managers (installation examples)
- Include expected output when helpful (for CLI commands, generated code samples)

## Code Groups for Package Managers

Use code groups for multiple package managers (always include bun, pnpm, npm, yarn in that order):

```markdown
::: code-group

```shell [bun]
bun add -d @kubb/plugin-name
```

```shell [pnpm]
pnpm add -D @kubb/plugin-name
```

```shell [npm]
npm install --save-dev @kubb/plugin-name
```

```shell [yarn]
yarn add -D @kubb/plugin-name
```
:::
```

## Writing Style Guidelines

### Clarity Over Marketing
- **Direct and technical**: Avoid marketing language like "powerful", "amazing", "seamless"
- **Concrete over abstract**: Prefer "Generates TypeScript types from OpenAPI schemas" over "Transforms your API into typed code"
- **Short paragraphs**: 1-3 sentences per paragraph
- **Active voice**: "The plugin generates types" not "Types are generated"

### Structure: What → Why → When → How
1. **What**: Brief description of the feature/option
2. **Why**: Use case or problem it solves (optional, if not obvious)
3. **When**: When to use it vs alternatives (optional)
4. **How**: Example showing usage

### Examples Must Be:
- **Realistic**: Use actual OpenAPI schema snippets, not placeholders
- **Complete**: Include all required configuration
- **Tested**: Verify examples work before committing
- **Minimal**: Show only what's necessary to understand the feature

## Common Mistakes to Avoid

- **Don't invent features**: Only document what exists in the code
- **Don't reference internals**: Unless they're part of the public API
- **Don't assume knowledge**: Explain acronyms and concepts on first use
- **Don't hide gotchas**: Call out edge cases and limitations explicitly

## Including Shared Content

Use VitePress `@include` directive to reuse shared content:

```markdown
### contentType
<!--@include: ../core/contentType.md-->
```

**Common includes:**
- `../core/contentType.md` - Content type option
- `../core/barrelTypes.md` - Barrel type explanations
- `../core/group.md` - Grouping options
- `../core/groupTypes.md` - Group type options

**Location**: `docs/plugins/core/`

## Testing Documentation Changes

Before committing documentation:

1. **Preview locally**
   ```shell
   cd docs
   pnpm start
   ```

2. **Verify all changes**
   - Check links work
   - Verify code examples render correctly
   - Test that all code groups display properly
   - Validate frontmatter syntax

## Links and Cross-References

- **Internal links**: Use relative paths: `/plugins/plugin-ts/`
- **Anchor links**: Link to specific sections: `/plugins/plugin-ts/#output-path`
- **External links**: Use full URLs with descriptive text
- **Placement**: Add links section at the very end of the document
