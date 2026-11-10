# Release and rollback

## Part 1: Release (dev → main)

**Before you start: check the server disk.** On the VPS, run `df -h /` and read `Use%`:
- **under 70 %:** continue to step 1.
- **70 % or more:** follow [RUNBOOK.md → The VPS disk is filling up](RUNBOOK.md#entry-the-vps-disk-is-filling-up) first. Over 85 %, don't release until it's below 70 %.

1. Open a pull request from `dev` into `main`, titled `release: vX.Y.Z`. Request the CEO's review. Note the time 🕝.
2. Wait for `ci` to pass ✅ and for the CEO's approval (code owner). Note the time 🕝.
3. Merge with **Create a merge commit**.
4. Tag (signed as Verified) and push:
   ```bash
   git switch main && git pull
   git tag -s vX.Y.Z -m "vX.Y.Z: <summary>"
   git push origin vX.Y.Z
   ```
5. In hPanel: check that the newest **production** deployment names the merge commit.
6. Check both sites with `curl`.
7. If there are database changes: apply them by hand, **staging first, then production**, through the SSH tunnel.

## Part 2: Rollback (undo a bad change)

**Never use Redeploy to undo a change.** Hostinger builds whatever the branch holds, so Redeploy builds the same broken code again.

1. Note the time you were told 🕝.
2. Open the merged pull request that caused the problem and select **Revert**. Note the time 🕝.
3. Wait for `ci` to pass ✅. Note the time 🕝.
4. Merge the revert PR. Note the time 🕝.
5. Wait for Hostinger to finish building. Note the time 🕝.
6. Check the site with `curl -sI https://SITEURL | head -1` (expect `200`). Note the time 🕝.

**On production:** the revert PR into `main` needs the CEO's approval.

### When a fix to production waits for approval

Every change into `main`, including a revert, needs the CEO's approval (code owner). There is no bypass and no break-glass account.

First check whether the fault is **critical** (the list under Working hours). If it isn't, it waits for the next window as a normal release.

**Until the CEO approves:**
1. **Check the cause:** reproduce the problem and find which merge or change caused it (Network tab, logs, the last merged PRs).
2. **Test the fix on staging first:** usually a Revert of the bad merge (Part 2), with `ci` passing. If dev has unreleased changes, the fix must not carry them into production.
3. **Open the fix PR into `main`** right away, so it's ready when the CEO looks at it.
4. **Reach the CEO** with both (below). If he can't be reached, see "Outside his hours" under Working hours.
5. **The client** is told the way the CEO decides (see "Telling the client" below).
6. **Keep checking** the live site, and note the times, as in Part 2.

**Reach the CEO with both:**
1. A comment on the fix PR, starting with `@autonomoose-tech`.
2. A Telegram message in this format:
   ```
   🔴 Critical fault on production since HH:MM Israel
   What's broken: <one line>
   Fix PR: <link> (ci passed / running)
   Need: your approval on the PR
   ```

**Working hours**

The CEO is 7 h behind Israel most of the year. He is available 09:00–23:00 Toronto time, not all the time, so a problem found between 08:30 and 16:00 Israel can wait up to 7½ hours for approval.
So: **release to `main` only between 16:00 and 22:00 Israel**, when a fix can be approved quickly.

**A critical fault** can't wait for the 16:00–22:00 window:
- production is down;
- the booking or contact form doesn't work (the clinic gets more phone calls than it can handle);
- sensitive data may be exposed;
- a critical vulnerability is found.

Anything else waits for the next window, as a normal release (Part 1).

**Outside his hours, for a critical fault:** if the CEO can't be reached for 1.5 hours or more, and all of these are true:
- the problem is on `main`;
- it is critical (the list above);
- the fix is verified on staging;
- only a change to `main` fixes it;

then **I phone him**, even outside his hours (the CEO's decision on #107, 9 Nov).

### What visitors see while they wait

The broken site. Hostinger keeps serving the last build of `main` until the fix is merged and built.
Pointing DNS at staging is not an option: DNS changes are slow, and staging has different data.

**Telling the client:** the CEO decides who tells the customer, and when. A message to a contact person saying what's broken, what we're doing, and when we expect it fixed.

**Proposal (not set up yet):** an uptime monitor that alerts me and the CEO when production is down for more than 5 minutes.