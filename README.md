<div align="center">
  <a href="https://kubb.dev" target="_blank" rel="noopener noreferrer">
    <img src="https://kubb.dev/og.png" alt="Kubb banner">
  </a>
</div>

# kubb-labs/config

Shared configuration and reusable GitHub Actions for [Kubb](https://github.com/kubb-labs/kubb) packages.

## Actions

### `.github/setup`

A composite action that sets up the standard Kubb development environment:

- [step-security/harden-runner](https://github.com/step-security/harden-runner) egress monitoring
- [pnpm](https://pnpm.io/) package manager
- [Bun](https://bun.sh/) runtime
- [Node.js](https://nodejs.org/)
- [safe-chain](https://github.com/AikidoSec/safe-chain) supply-chain protection (blocks known-malicious packages, enforces a 48h minimum package age)
- Git user configuration
- pnpm store cache
- [Turbo](https://turbo.build/) remote cache

#### Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `node-version` | Node.js version to use (e.g., `22`, `24`, or `22.x`) | `22.22.3` |
| `cache` | Set to `false` to skip the Turbo cache | `turbo` |
| `force-install` | Re-fetch dependencies with `pnpm install --frozen-lockfile --force` instead of `--prefer-offline` | `false` |

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

### `.github/actions/release`

A composite action that wraps `changesets/action` to version and stage-publish a changesets release, using a bundled `release.mjs`. `createGithubReleases` stays off, since a staged version isn't public until `.github/actions/promote` confirms npm approval.

#### Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `github-token` | Token for `changesets/action` (needs `contents: write`, `pull-requests: write`, `issues: write`) | (required) |
| `version-script` | Command that bumps package versions, to run extra steps after `changeset version` | `pnpm exec changeset version` |

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

#### Trusted publishing

There is no `NPM_TOKEN`. `release.mjs` publishes through npm trusted publishing, so the job needs
`permissions: id-token: write` and every package needs a trusted publisher on npm pointing at this
repository and workflow.

When the token exchange fails, pnpm only warns (`Skipped OIDC: …`) and retries the publish
anonymously, which npm rejects with a 401. `release.mjs` stops on that warning and prints the real
reason, so read the `Skipped OIDC` line rather than the 401 under it.

Known pnpm constraint: `pnpm stage publish` cannot complete the exchange on pnpm 12.4.0 or 12.4.1
(the `next-12` line), while plain `pnpm publish` still can. Keep repos that use this action on the
`latest` line, currently pnpm 12.3.4.

### `.github/actions/promote`

A composite action that verifies staged package versions are live on npm, tags the release, and creates GitHub Releases, using bundled `verifyRegistry.mjs` and `createReleases.mjs`. Runs after a maintainer approves the staged versions on npm and the environment review for the job calling this action.

#### Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `staged-packages` | JSON array of `{name, version}` staged by `.github/actions/release` | (required) |
| `github-token` | Token for `gh release create` (`contents: write`) | (required) |
| `release-mode` | `combined` for one release per version (fixed/linked packages), unset/`per-package` otherwise | (empty, i.e. per-package) |

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
