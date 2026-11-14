# Task 17: Revert drill

Drill, as agreed with the CEO: the real Incident 2 ([PR #101](https://github.com/eitan-dardik/northline-dental-website/pull/101)) was blocked by the signed-commits rule and never merged, so there was nothing to revert.

The change: a harmless HTML comment `<!-- revert drill W5 -->` in `apps/web/index.html`, merged into dev in [PR #108](https://github.com/eitan-dardik/northline-dental-website/pull/108). Reverted with GitHub's **Revert** button in [PR #109](https://github.com/eitan-dardik/northline-dental-website/pull/109).

| # | Step | Time (Israel) |
|---|---|---|
| 1 | Change live on staging (`curl … \| grep "revert drill"` finds it) | 16:15:43 |
| 2 | Revert PR #109 opened | 16:18:31 |
| 3 | `ci` passed on #109 (16 s) | 16:19:02 |
| 4 | #109 merged into dev | 16:19:28 |
| 5 | Hostinger staging build completed (started 16:19:35; build log: "Deployment completed in 1m 2s") | 16:20:37 |
| 6 | `curl` no longer finds the marker | 16:20:41 |
| | **Total (1 → 6)** | **4 min 58 s** |

Drill: there was no "told" moment, so the clock starts when the change was live on staging (step 1). The 4 min 58 s covers the Revert until staging was fixed, not detecting the problem.

Step 5: the hPanel header says 1 min 9 s (→ 16:20:44), but `curl` already saw the new page at 16:20:41, so I used the build log's 1 min 2 s (→ 16:20:37), which fits between the two `curl` checks (16:20:26 old page, 16:20:41 new page).

Check commands (`STAGING_URL` = the staging site's address):

```bash
curl -s https://STAGING_URL/ | grep "revert drill"
# 16:20:26: <!-- revert drill W5 -->   (old build still live)
curl -s https://STAGING_URL/ | grep "revert drill" || echo "gone"
# 16:20:41: gone
```

What took longest: step 1 → 2 (2 min 48 s), finding the merged PR and clicking Revert. `ci`, merge and build together took about 2 minutes.

On `main`, steps 3–4 would also wait for the CEO's approval.