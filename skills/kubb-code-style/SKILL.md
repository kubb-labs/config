---
name: kubb-code-style
description: Code style, testing, and PR guidelines for the Kubb repository. Use when writing or reviewing code for Kubb projects.
---

# Kubb Code Style and Testing Skill

This skill provides comprehensive guidelines for code style, testing, and pull requests in the Kubb repository.

## Repository Facts

- **Monorepo**: Managed by pnpm workspaces and Turborepo
- **Module system**: ESM-only (`type: "module"` across repo)
- **Node version**: 20
- **Versioning**: Changesets for versioning and publishing
- **CI/CD**: GitHub Actions

## Setup Commands

```bash
pnpm install                # Install dependencies
pnpm clean                  # Clean build artifacts
pnpm build                  # Build all packages
pnpm generate               # Generate code from OpenAPI specs
pnpm perf                   # Run performance tests
pnpm test                   # Run tests
pnpm typecheck              # Type check all packages
pnpm typecheck:examples     # Type check examples
pnpm format                 # Format code
pnpm lint                   # Lint code
pnpm lint:fix               # Lint and fix issues
pnpm changeset              # Create changelog entry
pnpm run upgrade && pnpm i  # Upgrade dependencies
```

## Code Style Guidelines

### Basic Style Rules

- **Quotes**: Single quotes, no semicolons (see `biome.json`)
- **Patterns**: Prefer functional patterns
- **Ternary operators**: Keep ternary operators to one level deep for readability. For nested conditions, use if/else statements or extract to a helper function.

**Example:**

```typescript
// ❌ Avoid - nested ternary
const style = pathParameters.style || (inKey === 'query' ? 'form' : inKey === 'path' ? 'simple' : 'simple')

// ✅ Correct - use helper function
const getDefaultStyle = (location: string): string => {
  if (location === 'query') return 'form'
  if (location === 'path') return 'simple'
  return 'simple'
}
const style = pathParameters.style || getDefaultStyle(inKey)
```

### TypeScript Conventions

- **Module resolution**: `"bundler"`; ESM only
- **Strict typing**: NEVER use `any` type or `as any` casts. Always use proper types, generics, or unknown/never when appropriate.
- **Files**: `.ts` for libraries, `.tsx` for React components, `.vue` for Vue components
- **DTS output**: Managed by `tsdown`

### Import Best Practices

Always use proper import statements at the module level instead of inline type imports:

```typescript
// ✅ Correct - module-level import
import type { Operation } from '@kubb/oas'

function myFunction(op: Operation) {
  // ...
}

// ❌ Avoid - inline type import
function myFunction(op: import('@kubb/oas').Operation) {
  // ...
}
```

This improves code readability and follows TypeScript best practices.

### Type Definitions

Define types at the root level of the file, not inside functions:

```typescript
// ✅ Correct - root-level type
type MyOptions = {
  name: string
  value: number
}

function processOptions(options: MyOptions) {
  // ...
}

// ❌ Avoid - type inside function
function processOptions(options: { name: string; value: number }) {
  type MyOptions = typeof options // Don't define types here
  // ...
}
```

This improves reusability, makes types easier to find, and follows TypeScript best practices.

### Function Syntax in Objects

Use function syntax (not arrow functions) in object methods to enable use of `this` keyword:

```typescript
// ✅ Correct - function syntax
const handlers = {
  enum(tree, options) {
    // Can use this.someMethod() if needed
  }
}

// ❌ Avoid - arrow function syntax
const handlers = {
  enum: (tree, options) => {
    // Cannot use this keyword
  }
}
```

### Naming Conventions

- **File/directory names**: `camelCase`
- **Variables/functions**: `camelCase`
- **Types/Interfaces**: `PascalCase`
- **React components**: `PascalCase`

### Exports

Packages use `"exports"` map and `typesVersions` as needed. Keep public API stable.

## Testing Instructions

- **Test framework**: Vitest
- **Test location**: `*.test.ts` or `*.test.tsx` in `src` folders
- **CI plan**: `.github/workflows/quality` folder

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific tests
pnpm test "<test name>"

# Run tests from package root
pnpm test
```

### Testing Guidelines

- **Always add or update tests for code changes**
- **Fix all test and type errors until suite is green**
- **After moving files or changing imports**: Run `pnpm lint && pnpm typecheck`
- **For docs changes**: Preview locally with `pnpm start` in `docs/` folder before committing

### Writing Tests

Tests should be:
- **Focused**: Test one thing at a time
- **Isolated**: Don't depend on other tests
- **Repeatable**: Same results every time
- **Fast**: Keep tests quick
- **Clear**: Easy to understand what's being tested

**Example test structure:**

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from './myFunction'

describe('myFunction', () => {
  it('should return expected value for valid input', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
  
  it('should handle edge cases', () => {
    expect(myFunction('')).toBe('')
    expect(myFunction(null)).toBe(null)
  })
})
```

## PR Instructions

### General Requirements

- **Title format**: `[<plugin-name>] <Title>`
- **Before committing**: Run `pnpm format && pnpm lint:fix`, `pnpm typecheck`, and `pnpm test`
- **Before committing**: Run `pnpm generate` and `pnpm typecheck:examples` in a separate commit

### Changelog and Documentation

**Required for every PR with code changes:**

1. **Create a changeset** using `pnpm changeset` to specify the version bump (major/minor/patch) for affected packages
2. **Update `docs/changelog.md`** with the new version entry describing the changes
3. **Update docs in the same PR as code changes** (unless it's a docs-only PR)

### Changelog Format

When updating `docs/changelog.md`, follow this structure:

```markdown
## X.Y.Z

### ✨ Features (or 🐛 Bug Fixes, 🚀 Breaking Changes, 📦 Dependencies)

#### [`plugin-name`](/plugins/plugin-name/)

Description of the change.

::: code-group
```typescript [Before]
// Old code example
```

```typescript [After]
// New code example
```
:::
```

**Category prefixes:**
- ✨ **Features** - New functionality and enhancements
- 🐛 **Bug Fixes** - Bug fixes and corrections
- 🚀 **Breaking Changes** - Changes that may require code updates
- 📦 **Dependencies** - Package updates and dependency changes

**Best practices:**
- Use `##` for version headings (not `#`)
- Use `###` for change type sections
- Use `####` for individual plugin names
- Group related plugin changes under single sections when applicable
- Add code examples using VitePress code groups for before/after comparisons
- Use VitePress callouts (`::: warning`, `::: tip`, `::: info`) for important notes
- Include links to plugins using `[`plugin-name`](/plugins/plugin-name/)`

### When to Update Documentation

**Update docs when:**
- Adding a new plugin or feature
- Changing plugin options or behavior
- Fixing bugs that affect user-facing behavior
- Adding new examples or tutorials
- Updating API signatures or types
- When fixing bugs: update relevant docs if the fix changes behavior, add notes if it affects user workflow, update examples if they were incorrect

## Security and Best Practices

### Security

- **Never commit secrets or credentials**
- If an agent PR contains secrets, immediately close the PR and rotate exposed secrets
- Use repository secrets and Actions masked variables for CI

### Code Quality

- **Follow existing patterns**: Look at similar code in the repository
- **Keep changes focused**: One logical change per PR
- **Write clear commit messages**: Explain what and why, not how
- **Add comments sparingly**: Only when necessary to explain complex logic
- **Refactor incrementally**: Don't mix refactoring with feature additions

### Performance

- **Consider performance implications**: Especially for core utilities
- **Benchmark when needed**: Use `pnpm perf` for performance testing
- **Avoid premature optimization**: Focus on clarity first, optimize when needed

## Review Checklist

Before submitting a PR:

- [ ] Does CI pass? (unit tests, linters, typechecks)
- [ ] Is the change small and well-scoped?
- [ ] Are there any secrets, tokens, or sensitive data accidentally added?
- [ ] Are dependency updates pinned to safe versions and tested?
- [ ] Documentation: is content accurate and matches repository conventions?
- [ ] Factual accuracy: verify all information is correct
- [ ] Consistency: follow existing code and documentation patterns
- [ ] Completeness: all features and options are documented

## Common Issues

### Build Issues

```bash
# Clean and rebuild
pnpm clean
pnpm build

# If node_modules is corrupted
rm -rf node_modules
pnpm install
```

### Type Issues

```bash
# Type check all packages
pnpm typecheck

# Type check examples
pnpm typecheck:examples
```

### Lint Issues

```bash
# Auto-fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

## Resources

See `references/code-examples.md` for more code examples and patterns.
