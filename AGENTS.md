# AGENTS.md

kubb-labs/config holds the shared configuration and reusable GitHub Actions for the Kubb
ecosystem. Every other kubb-labs repo consumes these actions at `@main`, so a change here reaches
them on their next workflow run.

## High-level architecture

- `.github/setup/` is the composite action that sets up the standard Kubb build environment
- `.github/actions/release/` wraps `changesets/action` to version and stage-publish a release
- `.github/actions/promote/` verifies the npm registry and creates the GitHub releases
- `vitest.config.ts` and the `*.test.mjs` files next to each action cover the action scripts

[README.md](README.md) documents every action, its inputs, its outputs, and how to call it.

## Repository setup

| Aspect | Choice |
| --- | --- |
| Module system | ESM-only (`type: "module"`) |
| Node version | 22 |
| Package manager | pnpm 11+ |
| Tests | Vitest |
| CI/CD | GitHub Actions |

## Commands

```bash
pnpm install        # Install dependencies
pnpm test           # Run the action tests once
pnpm test:watch     # Run them in watch mode
```

## Consumers

Every action here is consumed by tag-free reference (`kubb-labs/config/.github/setup@main`), so
treat `main` as production. A renamed or removed input breaks every caller at once. Add an input
with a default instead, and update `README.md` in the same PR.

## How agents read this repo

`AGENTS.md` is the canonical instruction file. `CLAUDE.md` and `GEMINI.md` symlink to it. Skills
live in `.agents/skills/` (open `SKILL.md` format, cross-provider), symlinked at
`.claude/skills/`, and `.claude/commands/` holds the slash commands.

<skills>

## Skills

You have new skills. If any skill might be relevant then you MUST read it.

- [pr](.agents/skills/pr/SKILL.md) - Open or update a pull request in this repo. Covers the checks to run, the downstream consumers to think about, Conventional Commit titles, how to fill the PR template, and what to do once CI runs.
</skills>
