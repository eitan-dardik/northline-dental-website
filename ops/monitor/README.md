# Server monitor (#182)

A small bot on the VPS that checks the server every 5 minutes and messages Telegram. It only **sends**: it reads no commands and answers no messages, and it sends only to the chat ids in its env file. Python 3 standard library only: nothing to install.

Everything about our server (the sites, the VPS, the repository, the tokens) is in `monitor.env` on the server, never in this folder. The code has no defaults and no project values: [`monitor.env.example`](monitor.env.example) lists every setting.

## What it checks (every 5 minutes)

| # | Check | Passes when |
|---|---|---|
| 1 | The sites | every site in `SITES` answers 200 within 10 seconds |
| 2 | The containers | every service of every Docker Compose project is `running`, and every one with a health check is `healthy`. The expected services come from the compose projects' own files (`docker compose ls`, then `config --services`), never from a number in the code |
| 3 | Last night's backup | the newest file matching `BACKUP_GLOB` in `BACKUP_DIR` is at most `NIGHTLY_MAX_HOURS` old and above `NIGHTLY_MIN_KB`, and the last line of `BACKUP_LOG` says `ok` |
| 4 | Hostinger's weekly backup | the newest backup in the Hostinger API is at most `WEEKLY_MAX_DAYS` old |
| 5 | Hostinger's snapshot | it exists. A 404 means there is none: shown in the status message, never an alert |

**Check 2 uses the local `docker` command:** it's simpler, and it doesn't count against Hostinger's rate limit (90 requests a minute for the whole account). If `docker` itself fails, it falls back to the Hostinger API (`/docker`). Each run makes 2 Hostinger calls (backups, snapshot); a status message adds 2 more (the VPS, the metrics).

## The messages

**An alert** when a check fails **two runs in a row** (10 minutes): which check, what it saw, since when, and the time in every `SHOW_TIMES` zone. A check that fails once and passes the next run (one slow API call) is only written to the log, never messaged. One message per failure, not one every 5 minutes while it stays broken (`state.json` remembers what was sent and what is waiting for a second run), and one **"fixed"** message when it passes again.

```
❌ Northline: Site https://…: no answer after 10.0 s (want 200 within 10 s)
(failing since 2026-11-24 11:35 UTC)
🕒 Tue 24 Nov · 11:40 UTC · 13:40 Israel · 06:40 Eastern
```

**The status message** at each `STATUS_AT` time, with the real values: the verdict first, then one ✅ or ❌ per check.

```
📋 Northline status
🕒 Tue 24 Nov · 14:00 UTC · 16:00 Israel · 09:00 Eastern

✅ All checks pass

🖥️ VPS running · OS up 6 d 6 h · VM up 37 d 19 h (Hostinger)
📊 CPU 22.4 % · RAM 2.1 GB · disk 10.7 GB

✅ Sites: 5/5 answer 200
✅ Containers: 17/17 running · 17/17 healthy
✅ Nightly backup: nightly-prod-….dump · 231K · 12 h ago · log ok
✅ Weekly backup: 19 Nov 12:00 UTC (5 days ago) · 11.73 GB · 2 kept
✅ Snapshot: 24 Nov 10:16 UTC · expires 25 Nov

✅ CI on event: success · 18 Nov
🏷️ Latest release: event-v1.0.0 · 19 Nov

🔗 Backups in hPanel: https://hpanel.hostinger.com/vps/<id>/backups
```

- **Two uptimes:** the **operating system's** (`/proc/uptime`, since the last restart) and the **virtual machine's** (Hostinger's `uptime` metric, which a reboot inside the VPS doesn't reset).
- **The weekly backup's size:** the API gives it in KB (12302336 = hPanel's 11.73 GB); its dates are in UTC.
- **GitHub:** the last CI run on `GITHUB_BRANCH` and the repository's latest release (public API, no token). Leave both GitHub settings empty for no GitHub lines.

**`STATUS_AT`** takes times and ranges with a step in minutes, comma-separated, in `TIMEZONE`: `09:00` (#182's morning message; **ours runs at 08:30 Israel**, when the ops log is read, so the two match), or `08:30, 16:00-19:00/15` (also every 15 minutes during an event). The first run at or after each time sends it, so there's one cron line and nothing to change at summer time. After a pause (the server down), only the newest missed status goes out, never a backlog; changing `STATUS_AT` never sends a catch-up for a time already passed. Use a colon and 5-minute marks (`13:30`, not `13.29`): the bot runs every 5 minutes.

**Beyond #182:** #182 asks for one morning message; the event-window times are my addition (the same status, more often; no new check). The status message's layout (emoji marks) is mine too. The event's own numbers (registrations, check-ins, visitors) are a separate helper, `event_count.py`, in its own pull request: it reads databases, which this bot never does.

## Where it runs

On the VPS, by cron, in `~/northline/monitor/`. Not on a laptop: if the bot goes quiet, that itself says the server has a problem.

```
~/northline/monitor/          chmod 700: only my user can list or open it
  monitor.py          700     the bot (copied from ops/monitor/ in the repository)
  monitor.env         600     every setting and the secrets; never in git
  state.json          600     which checks are failing or waiting for a second run, and the last status time sent (written by the bot)
  monitor.lock        600     held by a run while it works, so two runs never overlap (created by `flock`)
  monitor.log         600     one line per run (written by cron)
```

The bot and cron create `state.json` and `monitor.log` themselves; the cron line starts with `umask 077`, so they're created private (600). `monitor.env`, `state.json` and `monitor.log` are in the repository's `.gitignore`, so they can't be committed by accident.

## Settings: `monitor.env`

Every setting must be in the file: **the code has no defaults**. A missing line, or an empty value that isn't optional, stops the bot, and it **says so on Telegram** every run until it's fixed ("⚠️ Monitor is NOT checking anything: monitor.env: missing …"). A typo (`13.29`) does the same. So the monitoring never goes quiet unnoticed.

| Setting | What it is |
|---|---|
| `TELEGRAM_BOT_TOKEN` | the bot's token (@BotFather) |
| `TELEGRAM_CHAT_IDS` | who gets the messages, comma-separated. Each person presses Start on the bot; `getUpdates` shows the id |
| `HOSTINGER_API_TOKEN` | hPanel → Profile → API |
| `VPS_ID` | from `GET /api/vps/v1/virtual-machines` (the VPS with our hostname) |
| `NAME` | the name at the start of every message |
| `STATUS_AT` | when the status message goes out (above) |
| `TIMEZONE` | the zone of `STATUS_AT` |
| `SHOW_TIMES` | every message shows the time in these zones, `label=zone` |
| `SITES` | check 1 |
| `BACKUP_DIR`, `BACKUP_GLOB`, `BACKUP_LOG`, `NIGHTLY_MAX_HOURS`, `NIGHTLY_MIN_KB` | check 3 |
| `WEEKLY_MAX_DAYS` | check 4 |
| `GITHUB_REPO`, `GITHUB_BRANCH` | optional (both empty: no GitHub lines) |

One `KEY=value` per line; comments only on their own lines (a `#` after a value would become part of it). Changing a setting is an edit of `monitor.env`, never a code change; cron uses it at the next run.

Nothing in this repository, in a commit or in a screenshot shows a token, a chat id or the VPS id.

## Set it up

```bash
mkdir -p ~/northline/monitor && cd ~/northline/monitor && chmod 700 .
# copy monitor.py and monitor.env.example here, then:
chmod 700 monitor.py
cp monitor.env.example monitor.env && chmod 600 monitor.env
nano monitor.env                       # fill every line
python3 monitor.py check --dry-run     # the checks; prints what it would send, sends nothing, writes nothing
                                       # (a dry run writes no state, so a failing check shows as "waiting for a second run")
python3 monitor.py status --dry-run    # the status message, printed
python3 monitor.py test                # one real test message to every chat id
```

The tokens are typed into `monitor.env` with an editor or `read -rs`, never on a command line (where they'd stay in the shell's history).

## Cron

One line; the status messages come from the same run. `flock -n` holds `monitor.lock` while a run works: if a run hangs (five sites at 10 s each, plus docker), the next one exits at once instead of starting a second copy:

```
*/5 * * * * umask 077 && cd $HOME/northline/monitor && /usr/bin/flock -n monitor.lock /usr/bin/python3 monitor.py check >> monitor.log 2>&1
```

Add it without touching the other lines (the nightly backup), then check both are there:

```bash
( crontab -l; echo '*/5 * * * * umask 077 && cd $HOME/northline/monitor && /usr/bin/flock -n monitor.lock /usr/bin/python3 monitor.py check >> monitor.log 2>&1' ) | crontab -
crontab -l
```

`tail ~/northline/monitor/monitor.log` shows one line per run.

## Stop it

`crontab -e` and delete (or comment out with `#`) the monitor's line. Nothing else runs. To stop it from the command line, keeping the other lines:

```bash
crontab -l | grep -v 'monitor.py' | crontab -
```

## Replace a token

- **Telegram:** @BotFather → `/revoke` → the bot → a new token; put it in `monitor.env`. The chat ids stay.
- **Hostinger:** hPanel → Profile → API: delete the old token, create a new one; put it in `monitor.env`.
- Then `python3 monitor.py test` and `python3 monitor.py check --dry-run`.

**Both tokens are replaced at the end of the internship.**

## What it doesn't check

The daily ops log still covers these: containers' restart counts, the disk's percentage (the status shows the disk used, but there's no alert), and a reboot waiting (`/var/run/reboot-required`). They're outside #182's list; worth a follow-up card.
