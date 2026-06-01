#!/usr/bin/env bash
# Canary version stamper for Changesets pre-mode repos.
#
# Repos that sit in Changesets pre-mode (`beta`/`alpha`/`rc`) cannot use
# `changeset version --snapshot` — the snapshot command is rejected while a
# `.changeset/pre.json` is present. This script provides the timestamp-based
# alternative: bump the next minor, then rewrite the version to a unique
# `-canary.<UTC timestamp>` prerelease so every push publishes a distinct,
# installable canary under the `canary` dist-tag (never `latest`).
#
# Run it from a package directory (it edits the `./package.json` in the current
# working directory). The reusable release workflow runs it per package via
# `pnpm -r exec` before building and `pnpm publish --tag canary`.
npm --no-git-tag-version version minor || true

version=$(node -p "require('./package.json').version")
canary_date=$(date +'%Y%m%dT%H%M%S')
canary_version=$(echo $version'-canary.'$canary_date)

echo "Version that will be published: $canary_version"
npm --no-git-tag-version version $canary_version || true
