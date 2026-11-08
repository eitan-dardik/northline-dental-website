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

(next)