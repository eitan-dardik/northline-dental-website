# Restore drill before event-v1.0.0 (W7 task 43, #172)

Thu 19 Nov 2026, on the server, before the release (the merge of #195 is from 16:00 Israel).

| | |
|---|---|
| **Backup** | `event-2026-11-19-0925.dump`: `pg_dump -Fc -t public.leads` of the production database (`northline-prod-db-1`, PostgreSQL 17.6) |
| **Taken at** | **09:25 UTC = 11:25 Israel**, before the release |
| **Size** | 3,447 bytes; kept in `~/backups`, `chmod 600`, not in the repo |
| **Restored into** | a throwaway `postgres:17` container (`event-restore`), deleted after the test with `docker rm -fv event-restore`; the 17 Northline containers kept running |

## The counts

| | Production | Restored copy |
|---|---|---|
| Rows in `public.leads` | **0** | **0** |
| Columns | 8 | 8 |
| Policies | 1 | 1 |
| Constraints | 2 | 2 |

`pg_restore` printed no errors.

```
$ select count(*) from public.leads;     # production → 0, restored → 0
$ columns | policies | constraints        # production → 8 | 1 | 2, restored → 8 | 1 | 2
```

**Why 0 rows:** nobody has sent the production contact form yet; the live site has no real visitors. So the row count alone can't tell a restored table from a missing one. The columns, the policy and the constraints prove the table came back whole, with its rule.

**The full nightly backup** (`nightly-prod-2026-11-19-0230.dump`, 188K, all tables, `backup.log`: `ok`) was restore-tested the same way on Sun 15 Nov: all 8 tables matched ([#147](https://github.com/eitan-dardik/northline-dental-website/issues/147)).

The registrations table is not on production yet; it's added after this drill, with the release (task 45).
