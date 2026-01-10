---
name: kubb-changelog
description: Guidelines for maintaining changelog and version management in Kubb. Use when updating changelog, creating changesets, or managing releases.
---

# Kubb Changelog and Versioning Skill

This skill provides guidelines for maintaining the changelog and managing versions in the Kubb repository.

## Overview

Kubb uses Changesets for version management and maintains a comprehensive changelog in `docs/changelog.md`.

## Changeset Workflow

### Creating a Changeset

For every PR with code changes, create a changeset:

```bash
pnpm changeset
```

**Interactive prompts:**
1. Select which packages are affected
2. Choose version bump type (major/minor/patch)
3. Write a summary of the changes

### Version Bump Types

- **Major** (breaking): Changes that break existing functionality
- **Minor** (feature): New features that don't break existing functionality
- **Patch** (fix): Bug fixes and minor improvements

**Examples:**

```bash
# Breaking change
What kind of change is this for @kubb/plugin-ts? › major

# New feature
What kind of change is this for @kubb/plugin-ts? › minor

# Bug fix
What kind of change is this for @kubb/plugin-ts? › patch
```

## Changelog Format

The changelog follows a specific structure in `docs/changelog.md`.

### Version Header

```markdown
## X.Y.Z
```

Use `##` for version headings (not `#`).

### Category Sections

Use `###` for change type sections with emoji prefixes:

- ✨ **Features** - New functionality and enhancements
- 🐛 **Bug Fixes** - Bug fixes and corrections
- 🚀 **Breaking Changes** - Changes that may require code updates
- 📦 **Dependencies** - Package updates and dependency changes

### Plugin Subsections

Use `####` for individual plugin names with links:

```markdown
#### [`plugin-name`](/plugins/plugin-name/)
```

### Complete Example

```markdown
## 2.5.0

### ✨ Features

#### [`plugin-ts`](/plugins/plugin-ts/)

Added support for generating union types with the new `unionType` option.

::: code-group
```typescript [Before]
// Generated separate types
export type PetDog = { type: 'dog'; bark: string }
export type PetCat = { type: 'cat'; meow: string }
```

```typescript [After]
// Now generates union
export type Pet = PetDog | PetCat
```
:::

#### [`plugin-react-query`](/plugins/plugin-react-query/)

Introduced infinite query support with `useInfiniteQuery` hook generation.

> [!TIP]
> Use `infinite: true` in your plugin options to enable this feature.

### 🐛 Bug Fixes

#### [`plugin-oas`](/plugins/plugin-oas/)

Fixed incorrect path resolution for nested schemas.

**Issue**: Schemas in deeply nested `$ref` paths were not resolved correctly.

**Fixed**: Now correctly resolves all schema references regardless of nesting depth.
```

## Writing Good Changelog Entries

### Structure: What → Why → How

1. **What**: Describe the change clearly
2. **Why**: Explain the problem it solves (optional, if not obvious)
3. **How**: Show code examples or usage

### Be Specific

```markdown
❌ Bad: Fixed bug in plugin-ts
✅ Good: Fixed incorrect enum type generation when using `enumType: 'asConst'`

❌ Bad: Added new feature
✅ Good: Added `groupBy` option to organize generated files by OpenAPI tags
```

### Use Code Examples

For significant changes, show before/after:

```markdown
::: code-group
```typescript [Before]
// Old behavior
export const PetType = 'dog' | 'cat'
```

```typescript [After]
// New behavior
export const PetType = {
  Dog: 'dog',
  Cat: 'cat',
} as const
```
:::
```

### Add Callouts for Important Information

Use VitePress callouts to highlight important notes:

```markdown
> [!WARNING]
> This is a breaking change. Update your configuration accordingly.

> [!TIP]
> You can enable this feature by setting `newOption: true`.

> [!NOTE]
> This fix only applies to OpenAPI 3.1 specifications.

> [!IMPORTANT]
> Make sure to regenerate your code after upgrading.

> [!CAUTION]
> This feature is experimental and may change in future versions.
```

## Grouping Changes

### Multiple Plugin Changes

When multiple plugins are affected by a single change, list them under a common description:

```markdown
### ✨ Features

#### Multiple Plugins

Added support for custom naming conventions across all generator plugins:
- [`plugin-ts`](/plugins/plugin-ts/)
- [`plugin-zod`](/plugins/plugin-zod/)
- [`plugin-react-query`](/plugins/plugin-react-query/)

Use the new `nameResolver` option to customize how generated names are formatted.
```

### Related Changes

Group related changes under a single section:

```markdown
### 🐛 Bug Fixes

#### [`plugin-oas`](/plugins/plugin-oas/)

**Schema Resolution Improvements:**
- Fixed circular reference handling in complex schemas
- Improved `allOf` composition resolution
- Corrected `oneOf` discriminator mapping

These fixes improve stability when working with complex OpenAPI specifications.
```

## Breaking Changes

### Marking Breaking Changes

Always clearly mark breaking changes:

```markdown
### 🚀 Breaking Changes

#### [`plugin-ts`](/plugins/plugin-ts/)

**Changed default value for `enumType` option**

The default value has changed from `'enum'` to `'asConst'` for better type safety.

::: warning BREAKING CHANGE
If you rely on the old behavior, explicitly set `enumType: 'enum'` in your configuration.
:::

**Migration:**

```typescript
// Update your config
export default defineConfig({
  plugins: [
    pluginTs({
      enumType: 'enum', // Explicitly set to maintain old behavior
    }),
  ],
})
```
```

### Migration Guide

For breaking changes, provide clear migration instructions:

```markdown
**Before (v1.x):**
```typescript
pluginTs({
  output: './types',
})
```

**After (v2.x):**
```typescript
pluginTs({
  output: {
    path: './types',
  },
})
```
```

## Dependency Updates

### Documenting Dependency Changes

```markdown
### 📦 Dependencies

#### Multiple Packages

**Updated dependencies:**
- `@kubb/core`: Updated peer dependency to `^2.5.0`
- `zod`: Upgraded from `^3.21.0` to `^3.22.0`
- `@tanstack/react-query`: Upgraded from `^4.0.0` to `^5.0.0`

> [!NOTE]
> The React Query upgrade includes breaking changes. See the [migration guide](/migration-guide.md#react-query-v5).
```

## Changelog Best Practices

### 1. Update Changelog in the Same PR

Always update the changelog in the same PR as your code changes:

```bash
# Make code changes
# Run tests
pnpm test

# Create changeset
pnpm changeset

# Update changelog
# Edit docs/changelog.md

# Commit everything together
git add .
git commit -m "[plugin-name] Add new feature"
```

### 2. Link to Documentation

Link to relevant documentation pages:

```markdown
See the [plugin documentation](/plugins/plugin-ts/) for more details.
```

### 3. Credit Contributors

For community contributions:

```markdown
Thanks to @username for this contribution! 🎉
```

### 4. Include Issue References

Reference related issues:

```markdown
Fixes #123
Closes #456
See #789 for background
```

### 5. Keep Entries Concise

- Use clear, direct language
- Avoid marketing speak
- Focus on technical details
- Include only relevant information

## Common Patterns

### Feature Addition

```markdown
### ✨ Features

#### [`plugin-zod`](/plugins/plugin-zod/)

Added `coerce` option to enable Zod's type coercion.

When enabled, generates validation schemas that automatically coerce input values:

```typescript
// With coerce: true
const schema = z.object({
  age: z.coerce.number(),
  active: z.coerce.boolean(),
})
```

Set `coerce: true` in plugin options to enable this feature.
```

### Bug Fix

```markdown
### 🐛 Bug Fixes

#### [`plugin-faker`](/plugins/plugin-faker/)

Fixed incorrect mock data generation for `date-time` format.

**Issue**: Generated dates were in the past instead of future dates.

**Fixed**: Now correctly generates future dates within a reasonable range.
```

### Performance Improvement

```markdown
### ✨ Features

#### [`core`](/getting-started/configure/)

**Performance Improvements:**
- Optimized file writing for large codebases (50% faster)
- Reduced memory usage during schema resolution (30% reduction)
- Improved plugin loading time (2x faster startup)

Large projects should see significant performance improvements.
```

## Version Release Process

### 1. Gather Changesets

Ensure all changesets are created:

```bash
pnpm changeset status
```

### 2. Update Versions

```bash
pnpm changeset version
```

This updates package.json files and generates changelog entries.

### 3. Update Main Changelog

Copy relevant entries to `docs/changelog.md` with proper formatting.

### 4. Review and Commit

```bash
git add .
git commit -m "chore: version packages"
```

### 5. Publish

```bash
pnpm release
```

## Resources

- Changesets Documentation: https://github.com/changesets/changesets
- VitePress Markdown Extensions: https://vitepress.dev/guide/markdown
