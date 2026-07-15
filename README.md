# kubb-labs/config

Shared configuration and reusable GitHub Actions for [Kubb](https://github.com/kubb-labs/kubb) packages.

## Actions

### `.github/setup`

A composite action that sets up the standard Kubb development environment:

- [pnpm](https://pnpm.io/) package manager
- [Bun](https://bun.sh/) runtime
- [Node.js](https://nodejs.org/) (default: `22.x`)
- Git user configuration
- pnpm store cache
- [Turbo](https://turbo.build/) remote cache

#### Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `node-version` | Node.js version to use | `22.x` |
| `cache` | Cache/build tool: `turbo` or `moon` | `turbo` |

#### Usage

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: kubb-labs/config/.github/setup@main

      - run: pnpm build
```

##### Specifying a Node.js version

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: kubb-labs/config/.github/setup@main
        with:
          node-version: '24.x'

      - run: pnpm build
```

##### Using moon instead of Turbo

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: kubb-labs/config/.github/setup@main
        with:
          cache: moon

      - run: moon ci
```

### `.github/actions/release`

A composite action that wraps `changesets/action` to version and stage-publish a changesets release, using a bundled `release.mjs`. `createGithubReleases` stays off, since a staged version isn't public until `.github/actions/promote` confirms npm approval.

#### Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `github-token` | Token for `changesets/action` (needs `contents: write`, `pull-requests: write`, `issues: write`) | (required) |
| `commit-message` | Commit message for the version-bump commit | `ci(changesets): version packages` |
| `title` | PR title for the version-bump PR | `ci(changesets): version packages` |

#### Outputs

| Output | Description |
|--------|-------------|
| `staged` | `true` if `release.mjs` staged at least one package |
| `staged_packages` | JSON array of `{name, version}` staged by `release.mjs` |

#### Usage

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      id-token: write
      pull-requests: write
      issues: write
    outputs:
      staged: ${{ steps.release.outputs.staged }}
      staged_packages: ${{ steps.release.outputs.staged_packages }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: kubb-labs/config/.github/setup@main

      - name: Release
        id: release
        uses: kubb-labs/config/.github/actions/release@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### `.github/actions/promote`

A composite action that verifies staged package versions are live on npm, tags the release, and creates GitHub Releases, using bundled `verifyRegistry.mjs` and `createReleases.mjs`. Runs after a maintainer approves the staged versions on npm and the environment review for the job calling this action.

#### Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `staged-packages` | JSON array of `{name, version}` staged by `.github/actions/release` | (required) |
| `github-token` | Token for `gh release create` (`contents: write`) | (required) |
| `release-mode` | `combined` for one release per version (fixed/linked packages), unset/`per-package` otherwise | (empty, i.e. per-package) |
| `verify-interval-seconds` | How often to re-poll npm while waiting for a staged version to propagate | `300` |
| `verify-retry-attempts` | How many times to poll npm before giving up | `10` |

#### Outputs

| Output | Description |
|--------|-------------|
| `approved` | `true` once every staged package is confirmed live on npm |

#### Usage

```yaml
jobs:
  promote:
    needs: [release]
    if: ${{ needs.release.outputs.staged == 'true' }}
    environment:
      name: npm-release-approval
    runs-on: ubuntu-latest
    permissions:
      contents: write
    outputs:
      approved: ${{ steps.promote.outputs.approved }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: kubb-labs/config/.github/setup@main

      - name: Promote
        id: promote
        uses: kubb-labs/config/.github/actions/promote@main
        with:
          staged-packages: ${{ needs.release.outputs.staged_packages }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          release-mode: combined
```

## License

[MIT](./LICENSE)
