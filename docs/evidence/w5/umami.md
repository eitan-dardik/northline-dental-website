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

**Bonus (not done):** log rotation, image prune, disk limit, Trivy scan.