# Week 5 Evidence

| # | Item | Proof |
|---|---|---|
| 1 | Rules for dev and main, empty bypass lists | img/12-dev-ruleset.png, img/14-main-ruleset.png |
| 2 | Three refusals, word for word | refusals.md |
| 3 | Signed commit and CODEOWNERS | [Signed commit output](#row-3-signed-commit); CODEOWNERS on [main](https://github.com/eitan-dardik/northline-dental-website/blob/main/.github/CODEOWNERS) and [dev](https://github.com/eitan-dardik/northline-dental-website/blob/dev/.github/CODEOWNERS) |CODEOWNERS) |
| 4 | CI: workflow, a passing run, a blocked failing run, the staging build | links; img/11-staging-deploy.png; img/19-failing-check.png |
| 5 | Release v0.5.0 | pull request link; tag link; img/21-deployments.png |
| 6 | RELEASE.md | link |
| 7 | Incident 1 comment and Incident 2 times | comment link; rollback.md |
| 8 | Umami backup, upgrade and rollback | umami.md; logs/ |
| 9 | Decision brief, board, multiplier, retrospective | decision.md; img/23-board.png |
| 10 | Knowledge gate | course links; img/28-w3schools.png |


## Row 3: signed commit

Commit 7ee68c8, checked with `git log --show-signature -1`:

```
commit 7ee68c841d1cb825265557131347477fa76b923a (HEAD -> evidence/w5)
Good "git" signature for 278788152+eitan-dardik@users.noreply.github.com with ED25519 key SHA256:Q87+2Z/LeO8XLnXULMLVfCcG9BnVvUsCnjOBhLhifQg
Author: Eitan <278788152+eitan-dardik@users.noreply.github.com>
Date:   Tue Nov 3 13:29:49 2026 +0200
```

Unsigned commits on dev but not on main (`git rev-list --count origin/main..origin/dev`): **0**