#!/usr/bin/env python3
"""Event counts to Telegram: registered, arrived, walk-ups, at the EVENT_COUNT_AT times.
Uses monitor.py's Telegram sender, time line and its monitor.env (the bot token, chat ids, NAME, TIMEZONE, SHOW_TIMES).
Read-only: two SELECTs (the registrations, and Umami's visits).

  python3 event_count.py            from cron every 5 minutes: sends at each EVENT_COUNT_AT time (once each)
  python3 event_count.py now        send the count now
  --dry-run                         print instead of sending; writes nothing

Its own settings, in event_count.env next to this file (chmod 600, never in git; all required):
  EVENT_COUNT_AT      when, in TIMEZONE, like STATUS_AT          e.g. 17:00-19:00/15
  EVENT_DB_CONTAINER  the database container                     e.g. app-db-1
  EVENT_DB_USER       its user, and EVENT_DB_NAME its database   e.g. postgres, postgres
  EVENT_DB_NAME
  EVENT_ID            the event in the registrations table       e.g. 2026-11-open-day
  EVENT_TEST_RE       a regex for my test addresses (left out)   e.g. \\+(og|test)
  UMAMI_DB_CONTAINER  Umami's database container                 e.g. umami-db-1
  UMAMI_DB_USER       its user, and UMAMI_DB_NAME its database   (docker exec <container> env | grep POSTGRES_)
  UMAMI_DB_NAME
  UMAMI_WEBSITE_ID    the website in Umami (the id in the page's config.js; not a secret)
"""
import json
import subprocess
from datetime import datetime, timezone
import sys
from pathlib import Path

import monitor

HERE = Path(__file__).resolve().parent
EVENT_ENV = HERE / 'event_count.env'
STATE_FILE = HERE / 'event_state.json'
KEYS = ('EVENT_COUNT_AT', 'EVENT_DB_CONTAINER', 'EVENT_DB_USER', 'EVENT_DB_NAME', 'EVENT_ID', 'EVENT_TEST_RE',
        'UMAMI_DB_CONTAINER', 'UMAMI_DB_USER', 'UMAMI_DB_NAME', 'UMAMI_WEBSITE_ID')
VISITS = """select count(distinct session_id) filter (where created_at > now() - interval '15 minutes'),
       count(distinct session_id) filter (where created_at >= :'since'::timestamptz)
from website_event
where website_id = :'site'::uuid;"""
QUERY = """select count(*) filter (where not walk_up),
       count(*) filter (where not walk_up and checked_in_at is not null),
       count(*) filter (where walk_up),
       coalesce(sum(guests) filter (where checked_in_at is not null), 0)
from registrations
where event_id = :'ev' and not (coalesce(email, '') ~ :'test');"""


def psql(container, user, db, query, **variables):
    """One read-only query through docker exec; the values go in as psql variables, never pasted into the SQL."""
    args = ['docker', 'exec', '-i', container, 'psql', '-U', user, '-d', db, '-At', '-F', '|', '-v', 'ON_ERROR_STOP=1']
    for k, v in variables.items():
        args += ['-v', f'{k}={v}']
    out = subprocess.run(args + ['-f', '-'], input=query, capture_output=True, text=True, timeout=30, check=True).stdout
    return tuple(int(x) for x in out.strip().split('|'))


def counts(env):
    """(registered, arrived of them, walk-ups, people in the clinic), test rows left out."""
    return psql(env['EVENT_DB_CONTAINER'], env['EVENT_DB_USER'], env['EVENT_DB_NAME'], QUERY,
                ev=env['EVENT_ID'], test=env['EVENT_TEST_RE'])


def visitors(env, start_local):
    """Umami: distinct visitors (sessions) of the website in the last 15 minutes, and since the first EVENT_COUNT_AT time."""
    since = start_local.astimezone(timezone.utc).isoformat()
    return psql(env['UMAMI_DB_CONTAINER'], env['UMAMI_DB_USER'], env['UMAMI_DB_NAME'], VISITS,
                site=env['UMAMI_WEBSITE_ID'], since=since)


def main():
    dry = '--dry-run' in sys.argv
    now = 'now' in sys.argv[1:]
    env = monitor.load_env()                    # monitor.env: Telegram, NAME, TIMEZONE, SHOW_TIMES...
    if EVENT_ENV.exists():                      # event_count.env: this script's own settings, same KEY=value format
        for line in EVENT_ENV.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env[key.strip()] = value.strip()
    missing = [k for k in KEYS if not env.get(k)]
    if missing:
        problem = f"event_count.env: missing or empty {', '.join(missing)}"
        monitor.send(env, f"⚠️ Event count is NOT running: {problem}", dry)
        sys.exit(problem)
    state = json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {}
    slot = None
    if not now:
        sched = dict(env, status_at=monitor.parse_schedule(env['EVENT_COUNT_AT']))
        slot = monitor.status_due(sched, {'status_sent': state.get('sent', '')})
        if not slot:
            return                              # nothing due: stay quiet
    try:
        reg, arrived, walk, people = counts(env)
    except Exception as e:                      # noqa: BLE001
        monitor.send(env, f"❌ {env['NAME']}: the event count failed ({type(e).__name__})\n🕒 {monitor.times(env)}", dry)
        sys.exit(f'count failed: {e}')
    first = monitor.parse_schedule(env['EVENT_COUNT_AT'])[0]
    start = datetime.now(env['tz']).replace(hour=first[0], minute=first[1], second=0, microsecond=0)
    try:
        recent, since = visitors(env, start)
        visits = f"\n👀 On the page: {recent} visitors in the last 15 min · {since} since {start:%H:%M}"
    except Exception as e:                      # noqa: BLE001 - the counts still go out without Umami
        visits = f"\n👀 On the page: Umami's count failed ({type(e).__name__})"
    last = state.get('last')
    change = f"\n📈 since {last['at']}: +{arrived - last['arrived']} arrived, +{walk - last['walk']} walk-ups" if last else ''
    text = (f"🎉 {env['NAME']}: event count\n🕒 {monitor.times(env)}\n\n"
            f"👥 Registered: {reg}\n✅ Arrived (registered): {arrived} of {reg}\n🚶 Walk-ups: {walk}\n"
            f"🧮 People so far: {people} (every group counted)" + visits + change)
    if monitor.send(env, text, dry) and not dry:
        state['last'] = {'at': monitor.datetime.now(env['tz']).strftime('%H:%M'), 'arrived': arrived, 'walk': walk}
        if slot:
            state['sent'] = slot
        STATE_FILE.write_text(json.dumps(state, indent=1))
    print(f'{monitor.stamp()} event count: {reg} registered, {arrived} arrived, {walk} walk-ups' + (' (dry run)' if dry else ''))


if __name__ == '__main__':
    main()
