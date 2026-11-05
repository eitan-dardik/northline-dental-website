# Release and rollback

## Part 1: Release (dev → main)

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

Every change into `main`, including a revert, needs the CEO's approval (code owner). There is no bypass.

**Reach the CEO with both:**
1. A comment on the fix PR, starting with `@autonomoose-tech`.
2. A Telegram message in this format:
   ```
   🔴 Production down since HH:MM Israel
   What's broken: <one line>
   Fix PR: <link> (ci passed / running)
   Need: your approval on the PR
   ```

**Working hours** 

CEO is 7h behind Israel most of the year. 
Since he is available from 09:00-23:00 Toronto time intermittently, a problem found between 08:30 and 16:00 Israel time can wait up to 7½ hours for approval. 
So: **release to `main` only between 16:00 and 22:00 Israel**, when a fix can be approved quickly.

### What visitors see while they wait

The broken site. Hostinger keeps serving the last build of `main` until the fix is merged and built. 
Pointing DNS at staging is not an option: DNS changes are slow, and staging has different data.

**Telling the client:** the CEO decides who tells the customer, and when. A message to a contact person saying what's broken, what we're doing, and when we expect it fixed.

**Proposal (not set up yet):** an uptime monitor that alerts me and the CEO when production is down for more than 5 minutes.