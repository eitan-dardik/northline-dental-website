# Event count (an event-day helper, beside the #182 monitor)

During an event, `event_count.py` sends the event's numbers to Telegram at set times (for the Open Morning: every 15 minutes, 17:00–19:00 Israel). They are the numbers the run of show needs for each line (task 57: registrations, check-ins, visitors on the page). It is **not** part of #182: it reads two databases, which the monitor never does, and it runs only for an event.

It sits next to `monitor.py` and **builds on it**: it imports `monitor.py` (the Telegram sender, the time line, the schedule) and loads `monitor.env` first. So it needs `monitor.py` and a working `monitor.env` in the same folder.

## The message

```
🎉 Northline: event count
🕒 Tue 24 Nov · 15:15 UTC · 17:15 Israel · 10:15 Eastern

👥 Registered: 24
✅ Arrived (registered): 3 of 24
🚶 Walk-ups: 1
🧮 People so far: 6 (every group counted)
👀 On the page: 2 visitors in the last 15 min · 5 since 17:00
📈 since 17:00: +3 arrived, +1 walk-ups
```

| Line | What it counts |
|---|---|
| 👥 Registered | sign-ups from the page (not walk-ups), my test rows left out |
| ✅ Arrived (registered) | those sign-ups that were checked in at the desk |
| 🚶 Walk-ups | guests the desk added who hadn't signed up (always checked in) |
| 🧮 People so far | everyone checked in, each group's size added (a sign-up for 3 counts 3) |
| 👀 On the page | Umami: distinct visitors of the event page in the last 15 minutes, and since the first count of the day |
| 📈 since … | the change since the previous count (not on the first) |

The run of show's "check-ins" is Arrived + Walk-ups. "Arrived" counts registered guests only, so a walk-up is never counted twice.

## What it reads

Read only: two `SELECT`s, nothing written to any database.

- **The registrations:** `docker exec` into `EVENT_DB_CONTAINER`, `psql` as `EVENT_DB_USER` on `EVENT_DB_NAME`, one query on the `registrations` table for `EVENT_ID`. Rows whose email matches `EVENT_TEST_RE` (my tests) are left out.
- **Umami's own database:** `docker exec` into `UMAMI_DB_CONTAINER`, `psql` as `UMAMI_DB_USER` on `UMAMI_DB_NAME`, one query on `website_event` for `UMAMI_WEBSITE_ID` only, so staging's visits never count. No Umami token is needed. If this part fails, the registrations still go out, with "Umami's count failed" on that line.

The values go into the SQL as `psql` variables (`:'ev'`), never pasted into the query text. The queries run as the users you set, through `docker exec`, the way the team reads them on the server; the script only ever sends `SELECT`s.

**For a real client:** run both queries through a database user that can only `SELECT` (a read-only role), not the application's own user. Then "read only" is a fact of the database, not a promise of the script.

## How the settings work: two files

| | `monitor.env` (loaded first) | `event_count.env` (added on top) |
|---|---|---|
| **What** | what both bots share: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_IDS`, `NAME`, `TIMEZONE`, `SHOW_TIMES` | the ten settings only this script uses: `EVENT_COUNT_AT`, `EVENT_DB_CONTAINER`, `EVENT_DB_USER`, `EVENT_DB_NAME`, `EVENT_ID`, `EVENT_TEST_RE`, `UMAMI_DB_CONTAINER`, `UMAMI_DB_USER`, `UMAMI_DB_NAME`, `UMAMI_WEBSITE_ID` |
| **If it's broken** | the event count stops too, with monitor.py's Telegram warning | the event count stops: "⚠️ Event count is NOT running: event_count.env: missing or empty …" |
| **Example** | [`monitor.env.example`](monitor.env.example) | [`event_count.env.example`](event_count.env.example) |

One place for what both share: a new bot token or a new chat id is changed once, in `monitor.env`, and both bots follow. After the event, `event_count.env` is deleted and `monitor.env` stays as it was.

## Where it runs

```
~/northline/monitor/              700
  monitor.py              700     the monitor (#182), imported by event_count.py
  monitor.env             600     shared settings and secrets
  event_count.py          700     this script (copied from ops/monitor/ in the repository)
  event_count.env         600     its own settings; never in git
  event_state.json        600     the last count sent and its numbers, for "📈 since" (written by the script)
  monitor.log             600     one line per run, shared with the monitor
```

`event_count.env` and `event_state.json` are in the repository's `.gitignore`.

## Run it

```bash
cd ~/northline/monitor
chmod 700 event_count.py && chmod 600 event_count.env
python3 event_count.py now --dry-run    # print the count now; sends nothing, writes nothing
python3 event_count.py now              # send the count now
```

From cron, every 5 minutes; it sends only at the `EVENT_COUNT_AT` times, once each, with the same rules as the monitor's `STATUS_AT` (the first run at or after each time; after a pause only the newest missed count, never a backlog):

```
*/5 * * * * umask 077 && cd $HOME/northline/monitor && /usr/bin/python3 event_count.py >> monitor.log 2>&1
```

Add it without touching the other cron lines:

```bash
( crontab -l; echo '*/5 * * * * umask 077 && cd $HOME/northline/monitor && /usr/bin/python3 event_count.py >> monitor.log 2>&1' ) | crontab -
crontab -l
```

## After the event

```bash
crontab -l | grep -v 'event_count.py' | crontab -
rm ~/northline/monitor/event_count.env ~/northline/monitor/event_state.json
```

The monitor keeps running; its cron line and `monitor.env` are untouched.

It doesn't replace the run of show: the line for each 15 minutes is still written there by hand, from this message.
