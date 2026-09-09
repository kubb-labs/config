---
name: pr
description: Open or update a pull request in this repo. Covers the checks to run, the downstream consumers a change reaches, Conventional Commit titles derived from the branch, how to fill the PR template, and what to do once CI runs. Use when asked to open a PR, push a branch for review, fix a red PR, or judge whether a branch is ready to merge.
---

# PR skill

Take a branch from "the change is written" to "a reviewer can merge this". Work the steps in
order. When you cannot finish a step, say so in the PR body rather than skipping it quietly.

Every other kubb-labs repo consumes these actions at `@main`, so a merge here ships to all of
them on their next workflow run. There is no release step to catch a mistake.

## When to use

- Opening a pull request, or pushing a branch you expect to become one.
- Updating a pull request after a review comment or a failing CI run.
- Answering whether a branch is ready to merge.

## 1. Confirm the branch

Never commit to `main`. Check where you are, and branch from an up-to-date `main` if you are
still on it:

```bash
git status
git branch --show-current
git fetch origin main
git switch -c <type>/<short-slug> origin/main
```

Use the same Conventional Commit type you plan to use in the title, so `feat/`, `fix/`,
`docs/`, `chore/`, `refactor/`, `test/`, or `perf/`.

## 2. Run the checks before you push

```bash
pnpm install
pnpm test
```

An action script you changed needs a test next to it. Read the composite action's YAML back after
an edit, because a shell step that fails only at runtime passes every check here.

Fix the root cause of a failure. Do not skip a test to get a green run.

## 3. Think about the consumers

- A renamed or removed input breaks every caller at once. Add an input with a default instead.
- Update the input, output, and usage tables in `README.md` in the same PR.
- Pin a third-party action by commit SHA with the version in a trailing comment, the way the
  workflows here already do. Never pin by tag alone.
- Keep the permissions block as narrow as the step needs.
- Name the repos you expect to be affected in the PR body, so a reviewer knows what to watch
  after the merge.

## 4. Commit

One Conventional Commit per logical change, in the imperative, with no trailing period:

```
feat(setup): add a bun-version input
```

Check `git diff --cached` before every commit. Never commit a secret or a token. A workflow
reads a credential from `secrets`, never from a literal in the file.

## 5. Write the title and body

### Title

One Conventional Commit line, imperative, under 72 characters, no trailing period.

Read it off the branch you already named:

1. Take the type from the branch prefix, so `feat/`, `fix/`, `docs/`, `chore/`, `refactor/`,
   `test/`, or `perf/`.
2. Turn the kebab-case slug into a sentence, imperative and in the present tense.
3. Add the action name in parentheses as the scope, such as `setup`, `release`, or `promote`.

`fix/setup-turbo-cache-miss` becomes `fix(setup): stop the Turbo cache missing on a rerun`.

Put the issue number in the body with `Closes #123`, not in the title.

### Body

Fill `.github/pull_request_template.md`. Keep its headings and their order, replace each HTML
comment with real content, and delete no section.

Under **Changes**, write two to five sentences. Lead with what changed, then why. Name the action
a reviewer should open first.

Under **Checklist**, tick a box only for something you actually did on this branch. An unticked
box with a one-line reason under it is honest and useful. A ticked box you did not verify is the
one thing never to do here.

Under **Downstream impact**, name the repos that consume the action and say whether a caller has
to change anything.

Keep the body in plain language: short sentences, active voice, exact paths and commands.

### How to test

Fill it as a short list, one step per line, replacing the placeholders:

- Step 1: [Clear reproduction step]
- Step 2: [Next step]
- Step 3: [Expected result]

For a workflow change, link a run that exercised it, either on this branch or from a downstream
repo pointed at the branch with `kubb-labs/config/.github/setup@<branch>`.

## 6. Push and open the PR

```bash
git fetch origin main
git pull --ff-only
git push -u origin <branch>

gh pr create \
  --base main \
  --title "<conventional commit title>" \
  --body-file <body>.md \
  --assignee @me
```

Use the `gh` CLI rather than a GitHub MCP server or any other bot token, so the PR is authored by
whoever ran it and lands in their own list.

Open it ready for review, not draft. Mark a draft ready with `gh pr ready` once the branch is
finished and the checks pass.

Add a label the repo already uses. `gh label list` shows them, and inventing one is worse than
leaving the PR unlabeled.

Squash the commits and delete the branch on merge, which `gh pr merge --squash --delete-branch`
does in one step.

One PR does one thing. When you notice unrelated work along the way, leave it out and mention it
in the body instead.

## 7. After CI runs

A red PR is work now. Read the failing job, reproduce the failure locally, fix the cause, and
push again. Re-running a job is only worth it when the failure never reached a real step, such as
a checkout or install error.

Watch the first downstream run after the merge. When it breaks, revert here first and fix
forward in a new PR.

Answer every review comment, and say what you changed and how to check it.

## Guardrails

- Keep the diff to what was asked.
- Never force-push a branch someone else may have checked out.
- Use USA English in the title, body, and commits.
