---
argument-hint: [note to work into the PR body]
description: Get the current branch ready for review and open the pull request
---

!`git status --short --branch`

!`git diff --stat origin/main...HEAD`

Get this branch ready for review and open the pull request. Follow the `pr` skill for the full
sequence, and treat `$ARGUMENTS` as extra context for the body when it is not empty.

1. Run `pnpm install` and `pnpm test`, and fix what fails.
2. Confirm every third-party action is pinned by commit SHA, and that no input was renamed or
   removed without a default.
3. Update the input, output, and usage tables in `README.md`.
4. Commit anything outstanding with a Conventional Commit message.
5. Bring the branch up to date with `git fetch origin main`, then `git push -u origin <branch>`.
6. Derive the title from the branch name as one Conventional Commit line.
7. Open the PR with `gh pr create --base main --assignee @me`, ready for review. Fill every
   section of `.github/pull_request_template.md`, name the downstream repos the change reaches,
   and tick only the boxes you verified.

Report the PR URL and anything you left unticked.
