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

## Workflows

### `.github/workflows/release.yml`

A reusable workflow (`workflow_call`) that runs a [Changesets](https://github.com/changesets/changesets)
release. It checks out the repo, runs the [`setup`](#githubsetup) action, builds, optionally tests,
and then either stages or publishes the packages. Publishing uses npm
[OIDC trusted publishing](https://docs.npmjs.com/trusted-publishers) with provenance, so no
`NPM_TOKEN` secret is required.

The `mode` input selects the release type:

- `staged` (default) — runs `release:stage:ci`, staging every package on npm **without** touching the
  `latest` tag. A maintainer promotes it later with 2FA.
- `publish` — runs `release` (`changeset publish`), promoting straight to the `latest` tag.

#### Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `mode` | `publish` or `staged` | `staged` |
| `owner` | Repository owner allowed to release (guards forks) | `kubb-labs` |
| `node-version` | Node.js version to use | `22` |
| `build-command` | Command used to build packages | `pnpm run build` |
| `test-command` | Optional test command; skipped when empty | `''` |
| `codecov` | Upload coverage to Codecov after tests | `false` |
| `commit` | Commit message for the Changesets version PR | `ci(changesets): version packages` |
| `notify` | Send a Discord notification after a release | `false` |

#### Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| `DISCORD_WEBHOOK_URL` | Webhook used when `notify: true` | No |
| `CODECOV_TOKEN` | Token used when `codecov: true` | No |

> `GITHUB_TOKEN` is provided automatically to the called workflow.

The consumer repo must define the scripts the chosen mode calls: `release` for `publish` mode and
`release:stage:ci` for `staged` mode.

#### Usage

```yaml
name: Release
on:
  workflow_dispatch:
    inputs:
      mode:
        description: 'Release mode'
        type: choice
        options: [staged, publish]
        default: staged
  push:
    branches: ['main', 'alpha', 'beta', 'rc']
    paths:
      - '.changeset/**'
      - 'packages/**'

permissions: {}

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

jobs:
  release:
    permissions:
      contents: write
      id-token: write
      packages: write
      pull-requests: write
      issues: write
    uses: kubb-labs/config/.github/workflows/release.yml@main
    with:
      mode: ${{ inputs.mode || 'staged' }}
      owner: 'kubb-labs'
      notify: true
    secrets:
      DISCORD_WEBHOOK_URL: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

## License

[MIT](./LICENSE)
