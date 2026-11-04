# Week 5 Evidence

| # | Item | Proof |
|---|---|---|
| 1 | Rules for dev and main, empty bypass lists | [Rulesets](#row-1-rulesets): img/12-dev-ruleset.png, img/14-main-ruleset.png, rulesets/dev.json, rulesets/main.json |
| 2 | Three refusals, word for word | refusals.md |
| 3 | Signed commit and CODEOWNERS | [Signed commit output](#row-3-signed-commit); CODEOWNERS on [main](https://github.com/eitan-dardik/northline-dental-website/blob/main/.github/CODEOWNERS) and [dev](https://github.com/eitan-dardik/northline-dental-website/blob/dev/.github/CODEOWNERS) |CODEOWNERS) |
| 4 | CI: workflow, a passing run, a blocked failing run, the staging build | [ci.yml](https://github.com/eitan-dardik/northline-dental-website/blob/dev/.github/workflows/ci.yml); [passing run](https://github.com/eitan-dardik/northline-dental-website/actions/runs/41830732177) on [PR #99](https://github.com/eitan-dardik/northline-dental-website/pull/99); failing run: task 19; staging build: [see below](#row-4-ci) |
| 5 | Release v0.5.0 | pull request link; tag link; img/21-deployments.png |
| 6 | RELEASE.md | link |
| 7 | Incident 1 comment and Incident 2 times | comment link; rollback.md |
| 8 | Umami backup, upgrade and rollback | umami.md; logs/ |
| 9 | Decision brief, board, multiplier, retrospective | decision.md; img/23-board.png |
| 10 | Knowledge gate | course links; img/28-w3schools.png |


## Row 1: rulesets

Both rulesets are **active**, and both bypass lists are **empty**: the rules apply to everyone, the owner included.

| Rule | dev | main |
|---|---|---|
| Restrict deletions | On | On |
| Require signed commits | On | On |
| Require a pull request before merging | On, 0 approvals | On, 1 approval |
| Require review from Code Owners | Off | On |
| Extra approval for unattributed Copilot PRs (GitHub default) | On (no effect at 0 approvals) | On (a Copilot-only PR needs 2 approvals) |
| Require status checks to pass: `ci` (GitHub Actions) | On | On |
| Block force pushes | On | On |
| Allowed merge methods | Merge, Squash | Merge only |

**dev:** ![dev ruleset](img/12-dev-ruleset.png)
Export: [rulesets/dev.json](rulesets/dev.json)

**main:** ![main ruleset](img/14-main-ruleset.png)
Export: [rulesets/main.json](rulesets/main.json)


## Row 3: signed commit

Commit 7ee68c8, checked with `git log --show-signature -1`:

```
commit 7ee68c841d1cb825265557131347477fa76b923a (HEAD -> evidence/w5)
Good "git" signature for 278788152+eitan-dardik@users.noreply.github.com with ED25519 key SHA256:Q87+2Z/LeO8XLnXULMLVfCcG9BnVvUsCnjOBhLhifQg
Author: Eitan <278788152+eitan-dardik@users.noreply.github.com>
Date:   Tue Nov 3 13:29:49 2026 +0200
```

Unsigned commits on dev but not on main (`git rev-list --count origin/main..origin/dev`): **0**


## Row 4: CI

**Staging build after merging PR #99** (Hostinger, branch dev, commit 6387a8d, Node 24.x, the same as `ci.yml`):

![staging build](img/11-staging-deploy.png)