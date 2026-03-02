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

## License

[MIT](./LICENSE)
