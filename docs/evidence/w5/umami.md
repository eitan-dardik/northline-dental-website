# Umami: backup, restore, upgrade and rollback (tasks 25 and 27)

## Task 25: backup and restore

**Image pinned by digest** ([PR #110](https://github.com/eitan-dardik/northline-dental-website/pull/110)):

```
ghcr.io/umami-software/umami:3.4.0@sha256:85909afc45bdcda1917394594a087421fdbb05610fded0fa9f6fb861abb2f367
```

Before replacing the server's `compose.yaml`, I checked that it matched the repo: same content, only CRLF vs LF line endings (`diff --strip-trailing-cr`). After `docker compose up -d`, only Umami was recreated; the database stayed up.

**Backup**

| | Value |
|---|---|
| Postgres version | 18.6 |
| Backup time | 2026-11-08 09:37:13 UTC |
| File | `~/backups/umami-2026-11-08-0937.dump` (outside the repo), 86,906 bytes |
| Copy on my laptop | same SHA-256 as the server's: `f8178da91d43fe363fa43c12bde7038bc7b19e138399ebfefc680ff3de87bbf4` |

**Restore** into a temporary `postgres:18.6` container (no open ports), then count the events from before the backup time in both databases:

```sql
select count(*) from website_event where created_at < '2026-11-08 09:37:13+00';
```

| Database | Count |
|---|---|
| Live Umami | **339** |
| Restored from the backup | **339** |

The counts match, so the backup restores. The temporary container was deleted with `docker rm -fv umami-restore`.

## Task 27: upgrade and rollback

**Fresh backup** before the upgrade: `~/backups/FILL.dump`, at **FILL UTC**. Events before that time: **339**.

**Digests**

| Version | Image |
|---|---|
| 3.4.0 (before, and after the rollback) | `ghcr.io/umami-software/umami:3.4.0@sha256:85909afc45bdcda1917394594a087421fdbb05610fded0fa9f6fb861abb2f367` |
| 3.4.1 (the upgrade) | `ghcr.io/umami-software/umami:3.4.1@sha256:e69d1a7932e9dab0fc523edc7be1f3a53f3c261f57856fc2167ae74a8fc022e8` |

3.4.1 was pulled **before** the upgrade, while 3.4.0 kept running, so the download caused no downtime. Before the upgrade I kept a copy of the 3.4.0 compose file (`compose.yaml.340`); the rollback was copying it back and running `docker compose up -d`.

**Downtime**, measured from my laptop with a poll about every 0.95 s (each `curl` took ~0.45 s, plus `sleep 0.5`, so ±1 s):

| Change | Last 200 | First failure | First 200 again | Downtime |
|---|---|---|---|---|
| Upgrade 3.4.0 → 3.4.1 | 09:50:42.943 | 09:50:43.887 | 09:51:00.937 | **about 17 s, ±1 s** |
| Rollback 3.4.1 → 3.4.0 | 09:54:24.391 | 09:54:25.369 | 09:54:40.575 | **about 15 s, ±1 s** |

During each restart, Caddy answered `502` (Umami not reachable), then one `000` (no answer within 2 s) while Umami booted. Logs: [umami-upgrade-poll.log](logs/umami-upgrade-poll.log), [umami-rollback-poll.log](logs/umami-rollback-poll.log).

**No data lost:** events before the backup time, in the live database:

| Moment | Version | Count |
|---|---|---|
| Before the upgrade | 3.4.0 | 339 |
| After the upgrade | 3.4.1 | 339 |
| After the rollback | 3.4.0 | 339 |

The database container (`analytics-db-1`) was never restarted ("Up 3 weeks" throughout); only Umami's container changed.

**Was going back to the old image a real rollback?**

Going back to the old image was a real rollback. The upgrade changed only the Umami container, not the data: the 3.4.1 release notes list "Migrations: None" (task 7), and the count of events before the backup time stayed 339 after the upgrade and after the rollback. Rolling back brought back the 3.4.0 code, by its digest, and the data stayed unchanged, so Umami was exactly as before. If a future release changes the schema, starting the old image on the new schema may not work, so swapping the image back would not be a real rollback. Then only restoring the backup taken before the upgrade would take us back, and anything written after the backup would be lost.

## Task 27 bonus: vulnerability scan

The task asks for a scan of the Umami image, so I first scanned **3.4.0**, the version running after the rollback. It had 5 critical findings, so I decided to scan **3.4.1** too, to check whether the upgrade patches them. It does: **0 critical** in 3.4.1.

Both scanned with **Trivy 0.76.2**, by digest, from a `docker save` copy of each image (`--scanners vuln --severity CRITICAL`):

| | **3.4.0** (running after the rollback) | **3.4.1** |
|---|---|---|
| Image | `umami@sha256:85909afc…` | `umami@sha256:e69d1a79…` |
| Base OS | Alpine 3.24.1 | Alpine 3.24.3 |
| Next.js | 16.3.4 | 16.4.2 |
| **CRITICAL findings** | **5** | **0** |

**3.4.0's critical findings** (not fixed, as the task says):

| Package | Vulnerability | Installed | Fixed in | What it is |
|---|---|---|---|---|
| `brotli-libs` (OS) | CVE-2026-111497 | 1.2.0-r1 | 1.2.1-r0 | Out-of-bounds write in the Brotli decoder |
| `next` | GHSA-2464-fhr4-w9xw | 16.3.4 | 16.4.1 | Unauthenticated remote code execution (image optimization, SVG) |
| `next` | GHSA-673q-mjm6-r5xr | 16.3.4 | 16.4.1 | Unauthenticated remote code execution (`use cache`) |
| `next` | GHSA-vcvr-r3jv-pc5j | 16.3.4 | 16.3.6 | Remote code execution (`next/og`) |
| `shell-quote` | CVE-2026-102422 | 1.10.0 | 1.11.0 | Arbitrary command execution |

The 3.4.1 scan confirms its release notes: Next.js 16.4.2 and the newer base image fix all five. Umami is publicly reachable through Caddy, so I reported this to the CEO with a proposal to upgrade to 3.4.1. Waiting for his OK; I didn't change production on my own.

**Secret scan.** Trivy's docs say vulnerability **and secret** scanning are both on by default. A secret found in the image would be printed into the report, and the reports go into this public repo. So I ran the scans separately:
1. the vulnerability scan with `--scanners vuln` only, for `trivy.txt`;
2. the secret scan with `--scanners secret`, into its own file, kept on the server until I had read it.

The secret scan found **0 secrets** (no `(secrets)` section; every target is clean or not scanned). Only after checking that did I copy [trivy-secrets.txt](logs/trivy-secrets.txt) here.

Trivy also warned about six large files in `root/.cache/pnpm/` (~210 MB of package-manager cache left in the 3.4.0 image), which may be part of why 3.4.0 is larger than 3.4.1 (1.47 GB vs 1.36 GB).

Reports: [trivy.txt](logs/trivy.txt) (3.4.0), [trivy-341.txt](logs/trivy-341.txt) (3.4.1).

**Bonus not done yet:** log rotation (planned together with the 3.4.1 upgrade, so Umami restarts once), image prune, disk limit in RELEASE.md.