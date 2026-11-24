#!/usr/bin/env python3
"""Server monitoring bot (#182). Runs on the server; Python 3 standard library only.

  python3 monitor.py check            every 5 minutes (cron): run the 5 checks; a Telegram message only when a
                                      check starts failing, and one when it is fixed. At each STATUS_AT time
                                      it also sends the status message (the first run at or after that time).
  python3 monitor.py status           send the status message now
  python3 monitor.py test             send one test message
  --dry-run                           print instead of sending; writes nothing (with check or status)

Every value about the server, the sites and the repository comes from monitor.env next to this file
(chmod 600, never in git). See monitor.env.example; nothing project-specific is written in this code.
"""
import json
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

HERE = Path(__file__).resolve().parent
ENV_FILE = HERE / 'monitor.env'
STATE_FILE = HERE / 'state.json'      # what is failing now, and the last status time sent
HOSTINGER_API = 'https://developers.hostinger.com/api/vps/v1/virtual-machines'   # public API, the same for every customer
HPANEL = 'https://hpanel.hostinger.com/vps'
TELEGRAM_API = 'https://api.telegram.org'
GITHUB_API = 'https://api.github.com/repos'

# Every setting must be written in monitor.env: there are no defaults in this code. A missing line, or an empty
# value that isn't allowed to be empty, stops the bot (and says so on Telegram). See monitor.env.example.
SETTINGS = (
    'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_IDS', 'HOSTINGER_API_TOKEN', 'VPS_ID',
    'NAME', 'STATUS_AT', 'TIMEZONE', 'SHOW_TIMES', 'SITES',
    'BACKUP_DIR', 'BACKUP_GLOB', 'BACKUP_LOG', 'NIGHTLY_MAX_HOURS', 'NIGHTLY_MIN_KB', 'WEEKLY_MAX_DAYS',
    'GITHUB_REPO', 'GITHUB_BRANCH',
)
MAY_BE_EMPTY = ('GITHUB_REPO', 'GITHUB_BRANCH')   # both empty: no GitHub lines in the status message


def parse_schedule(text):
    """'10:00, 17:00-19:00/15' -> [(10, 0), (17, 0), (17, 15), ... (19, 0)], sorted. A wrong item raises ValueError."""
    def hm(t):
        h, m = (int(x) for x in t.strip().split(':'))
        if not (0 <= h < 24 and 0 <= m < 60):
            raise ValueError(f'not a time: {t}')
        return h * 60 + m
    minutes = set()
    for item in text.split(','):
        item = item.strip()
        if not item:
            continue
        if '-' in item:
            span, _, step = item.partition('/')
            start, end = (hm(t) for t in span.split('-'))
            step = int(step or 60)
            if step <= 0 or end < start:
                raise ValueError(f'not a range: {item}')
            minutes.update(range(start, end + 1, step))
        else:
            minutes.add(hm(item))
    if not minutes:
        raise ValueError('STATUS_AT is empty')
    return sorted(divmod(m, 60) for m in minutes)


def load_env():
    """Read KEY=VALUE lines from monitor.env (so cron needs no environment of its own). Every setting must be there."""
    env = {}
    for line in ENV_FILE.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            key, value = line.split('=', 1)
            env[key.strip()] = value.strip()
    missing = [k for k in SETTINGS if k not in env]
    empty = [k for k in SETTINGS if k in env and not env[k] and k not in MAY_BE_EMPTY]
    if bool(env.get('GITHUB_REPO')) != bool(env.get('GITHUB_BRANCH')):
        empty.append('GITHUB_REPO and GITHUB_BRANCH (fill both, or leave both empty)')
    if missing or empty:
        problem = 'monitor.env: ' + '; '.join(
            ([f"missing {', '.join(missing)}"] if missing else []) + ([f"empty {', '.join(empty)}"] if empty else []))
        if env.get('TELEGRAM_BOT_TOKEN') and env.get('TELEGRAM_CHAT_IDS'):
            send(env, f'⚠️ Monitor is NOT checking anything: {problem}. Fix monitor.env.', dry=False)
        sys.exit(problem)
    try:                              # check the settings now, so a typo stops the bot with a clear message
        env['tz'] = ZoneInfo(env['TIMEZONE'])
        env['status_at'] = parse_schedule(env['STATUS_AT'])
        env['sites'] = [s.strip() for s in env['SITES'].split(',') if s.strip()]
        env['backup_dir'] = Path(env['BACKUP_DIR']).expanduser()
        env['nightly_max_hours'] = float(env['NIGHTLY_MAX_HOURS'])
        env['nightly_min'] = int(env['NIGHTLY_MIN_KB']) * 1024
        env['weekly_max'] = int(env['WEEKLY_MAX_DAYS'])
        env['show_times'] = []
        for item in env['SHOW_TIMES'].split(','):
            label, _, zone = item.strip().partition('=')
            env['show_times'].append((label, ZoneInfo(zone or label)))
    except Exception as e:            # noqa: BLE001
        # A typo must not turn the monitoring off unnoticed: say so on Telegram (every run, until it's fixed), then stop.
        problem = f'monitor.env: a setting is not valid ({type(e).__name__}: {e})'
        send(env, f'⚠️ Monitor is NOT checking anything: {problem}. Fix monitor.env.', dry=False)
        sys.exit(problem)
    return env


def now_utc():
    return datetime.now(timezone.utc)


def stamp(dt=None):
    return (dt or now_utc()).strftime('%Y-%m-%d %H:%M UTC')


def times(env, dt=None):
    """The same moment in every SHOW_TIMES zone: 'Tue 24 Nov · 11:08 UTC · 11:08 London'.
    The date is the first zone's; a zone on another day gets its own day name."""
    dt = dt or now_utc()
    first = dt.astimezone(env['show_times'][0][1])
    parts = [first.strftime('%a %d %b')]
    for label, zone in env['show_times']:
        local = dt.astimezone(zone)
        day = '' if local.date() == first.date() else local.strftime(' %a')
        parts.append(f"{local:%H:%M}{day} {label}")
    return ' · '.join(parts)


def http_get(url, headers=None, timeout=10):
    """Returns (status, body). status 0 = no answer at all (DNS, timeout, refused)."""
    req = urllib.request.Request(url, headers={'User-Agent': 'server-monitor', **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except Exception as e:                      # noqa: BLE001 - any network failure is "no answer"
        return 0, str(e).encode()


def hostinger(env, path):
    status, body = http_get(f"{HOSTINGER_API}/{env['VPS_ID']}{path}",
                            {'Authorization': f"Bearer {env['HOSTINGER_API_TOKEN']}", 'Accept': 'application/json'})
    data = json.loads(body) if status == 200 else None
    return status, data


def send(env, text, dry):
    """Send to every chat id. Returns True only if every chat got it."""
    if dry:
        print('--- would send ---\n' + text)
        return True
    ok = True
    for chat in env['TELEGRAM_CHAT_IDS'].split(','):
        data = urllib.parse.urlencode({'chat_id': chat.strip(), 'text': text}).encode()
        req = urllib.request.Request(f"{TELEGRAM_API}/bot{env['TELEGRAM_BOT_TOKEN']}/sendMessage", data=data)
        try:
            urllib.request.urlopen(req, timeout=10).read()
        except Exception as e:                  # noqa: BLE001
            print(f'{stamp()} telegram failed: {type(e).__name__}', file=sys.stderr)   # never print the token
            ok = False
    return ok


# ------------------------------------------------------------------ the five checks
# Each returns (failures, facts): failures = {key: text} (empty = pass); facts = values for the status message.

def check_sites(env):
    """Check 1: every site in SITES answers 200 within 10 s."""
    failures, ups = {}, 0
    for url in env['sites']:
        t0 = time.monotonic()
        status, _ = http_get(url, timeout=10)
        secs = time.monotonic() - t0
        if status == 200 and secs <= 10:
            ups += 1
        else:
            seen = f'HTTP {status}' if status else 'no answer'
            failures[f'site {url}'] = f'Site {url}: {seen} after {secs:.1f} s (want 200 within 10 s)'
    return failures, {'sites': f"{ups}/{len(env['sites'])} answer 200"}


def check_containers_local():
    """Check 2 with the local docker command (simpler, no rate limit). The expected services come from each
    compose project's own files, never from a number written here."""
    out = subprocess.run(['docker', 'compose', 'ls', '-a', '--format', 'json'],
                         capture_output=True, text=True, timeout=30, check=True).stdout
    failures, total, running, healthy = {}, 0, 0, 0
    for proj in json.loads(out or '[]'):
        name = proj['Name']
        files = [f for f in proj['ConfigFiles'].split(',') if f]
        args = ['docker', 'compose', '-p', name] + sum((['-f', f] for f in files), []) + ['config', '--services']
        cfg = subprocess.run(args, capture_output=True, text=True, timeout=30, cwd=str(Path(files[0]).parent))
        if cfg.returncode != 0:
            failures[f'compose {name}'] = f'Containers: cannot read the compose files of {name}'
            continue
        ps = subprocess.run(['docker', 'ps', '-a', '--filter', f'label=com.docker.compose.project={name}',
                             '--format', '{{.Label "com.docker.compose.service"}}\t{{.State}}\t{{.Status}}'],
                            capture_output=True, text=True, timeout=30, check=True).stdout
        seen = {}
        for line in ps.splitlines():
            service, state, status = line.split('\t')
            seen[service] = (state, status)
        for service in sorted(set(cfg.stdout.split())):
            total += 1
            state, status = seen.get(service, ('missing', ''))
            running += state == 'running'
            if '(unhealthy)' in status:
                health = 'unhealthy'
            elif '(health: starting)' in status:
                health = 'starting'
            else:
                health = 'healthy'                  # healthy, or no health check at all
            healthy += health == 'healthy'
            if state != 'running' or health != 'healthy':
                failures[f'container {name}/{service}'] = f'Container {name}/{service}: {state}, {health}'
    return failures, {'containers': f'{running}/{total} running · {healthy}/{total} healthy'}


def check_containers_api(env):
    """Fallback for check 2 when the local docker command fails: the provider's view of the compose projects."""
    status, projects = hostinger(env, '/docker')
    if status != 200:
        return {'containers api': f'Containers: docker failed locally, and the Hostinger API answered {status}'}, {}
    failures, total, running, healthy = {}, 0, 0, 0
    for proj in projects:
        for c in proj.get('containers', []):
            total += 1
            running += c.get('state') == 'running'
            healthy += c.get('health') in (None, '', 'healthy')
            if c.get('state') != 'running' or c.get('health') not in (None, '', 'healthy'):
                failures[f"container {proj['name']}/{c['name']}"] = f"Container {proj['name']}/{c['name']}: {c.get('state')}, {c.get('health')}"
    return failures, {'containers': f'{running}/{total} running · {healthy}/{total} healthy (from the Hostinger API: local docker failed)'}


def check_nightly(env):
    """Check 3: the newest dump in BACKUP_DIR is at most NIGHTLY_MAX_HOURS old, above NIGHTLY_MIN_KB,
    and the last line of BACKUP_LOG says ok."""
    backup_dir = env['backup_dir']
    dumps = sorted(backup_dir.glob(env['BACKUP_GLOB']), key=lambda p: p.stat().st_mtime)
    if not dumps:
        return {'nightly': f"Nightly backup: no {env['BACKUP_GLOB']} in {backup_dir}"}, {'nightly': 'none'}
    newest = dumps[-1]
    size = newest.stat().st_size
    age_h = (time.time() - newest.stat().st_mtime) / 3600
    log = backup_dir / env['BACKUP_LOG']
    last_log = (log.read_text().strip().splitlines() or [''])[-1] if log.exists() else ''
    failures = {}
    if age_h > env['nightly_max_hours']:
        failures['nightly age'] = f"Nightly backup: the newest, {newest.name}, is {age_h:.0f} h old (want {env['NIGHTLY_MAX_HOURS']} h or less)"
    if size <= env['nightly_min']:
        failures['nightly size'] = f"Nightly backup: {newest.name} is only {size // 1024}K (want above {env['NIGHTLY_MIN_KB']}K)"
    if ' ok ' not in f' {last_log} ':
        failures['nightly log'] = f'Nightly backup: the last log line does not say ok: {last_log[:120]}'
    word = 'ok' if ' ok ' in f' {last_log} ' else 'not ok'
    return failures, {'nightly': f'{newest.name} · {size // 1024}K · {age_h:.0f} h ago · log {word}'}


def parse_time(s):
    return datetime.fromisoformat(s.replace('Z', '+00:00'))


def check_weekly(env):
    """Check 4: the provider's newest weekly backup is WEEKLY_MAX_DAYS old or less."""
    status, data = hostinger(env, '/backups')
    if status != 200:
        return {'weekly api': f'Weekly backup: the Hostinger API answered {status}'}, {'weekly': f'API {status}'}
    backups = data.get('data', [])
    if not backups:
        return {'weekly none': 'Weekly backup: none in the list'}, {'weekly': 'none'}
    newest = max(backups, key=lambda b: parse_time(b['created_at']))
    when = parse_time(newest['created_at'])
    age = (now_utc() - when).days
    size_gb = newest.get('size', 0) / 1024 ** 2          # the API gives KB
    fact = f"{when:%d %b %H:%M} UTC ({age} days ago) · {size_gb:.2f} GB · {data.get('meta', {}).get('total', len(backups))} kept"
    if age > env['weekly_max']:
        return {'weekly old': f"Weekly backup: the newest is {age} days old (want {env['weekly_max']} or less)"}, {'weekly': fact}
    return {}, {'weekly': fact}


def check_snapshot(env):
    """Check 5: the snapshot exists. A 404 means there is none: reported in the status message, never an alert."""
    status, data = hostinger(env, '/snapshot')
    if status == 404:
        return {}, {'snapshot': 'none (404)'}
    if status != 200:
        return {'snapshot api': f'Snapshot: the Hostinger API answered {status}'}, {'snapshot': f'API {status}'}
    made, ends = parse_time(data['created_at']), data.get('expires_at')
    ends = parse_time(ends) if ends else None
    return {}, {'snapshot': f"{made:%d %b %H:%M} UTC · expires {ends:%d %b}" if ends else f"{made:%d %b %H:%M} UTC"}


def run_checks(env):
    failures, facts = {}, {}
    try:                                        # check 2: local docker first, the API only if docker itself fails
        containers = check_containers_local()
    except Exception:                           # noqa: BLE001
        containers = check_containers_api(env)
    for f, x in (check_sites(env), containers, check_nightly(env), check_weekly(env), check_snapshot(env)):
        failures.update(f)
        facts.update(x)
    return failures, facts


# ------------------------------------------------------------------ the status message

def metric_last(metrics, name):
    """The newest point of one metric (the usage is keyed by Unix time)."""
    m = (metrics or {}).get(name) or {}
    usage = m.get('usage') or {}
    if not usage:
        return None, m.get('unit', '')
    return usage[max(usage, key=int)], m.get('unit', '')


def fmt_amount(value, unit):
    """Bytes become GB; anything else is shown with its own unit."""
    if unit.lower() in ('b', 'byte', 'bytes'):
        return f'{value / 1024 ** 3:.1f} GB'
    return f'{value} {unit}'


def fmt_uptime(value, unit='seconds'):
    secs = value / 1000 if unit.startswith('mill') or unit == 'ms' else value
    d, rest = divmod(int(secs), 86400)
    return f'{d} d {rest // 3600} h'


def os_uptime():
    """The operating system's own uptime (since the last reboot). Hostinger's metric counts the virtual machine."""
    try:
        return float(Path('/proc/uptime').read_text().split()[0])
    except (OSError, ValueError, IndexError):
        return None


def github_lines(env):
    repo, branch = env['GITHUB_REPO'], env['GITHUB_BRANCH']
    if not repo:                                # optional: both empty in monitor.env
        return []

    def gh(path, pick):
        status, body = http_get(f'{GITHUB_API}/{repo}{path}', {'Accept': 'application/vnd.github+json'})
        try:
            return pick(json.loads(body)) if status == 200 else f'GitHub {status}'
        except (KeyError, IndexError, ValueError):
            return 'none'
    def day(iso):
        return parse_time(iso).strftime('%d %b')
    ci = gh(f'/actions/runs?branch={urllib.parse.quote(branch)}&per_page=1',
            lambda d: f"{d['workflow_runs'][0]['conclusion']} · {day(d['workflow_runs'][0]['created_at'])}")
    rel = gh('/releases?per_page=1', lambda d: f"{d[0]['tag_name']} · {day(d[0]['published_at'])}")
    mark = '✅' if ci.startswith('success') else '⚠️'
    return [f'{mark} CI on {branch}: {ci}', f'🏷️ Latest release: {rel}']


def status_text(env, failures, facts):
    s_vm, vm = hostinger(env, '')
    frm = (now_utc() - timedelta(hours=1)).strftime('%Y-%m-%dT%H:%M:%SZ')
    to = now_utc().strftime('%Y-%m-%dT%H:%M:%SZ')
    _, metrics = hostinger(env, f'/metrics?date_from={frm}&date_to={to}')
    up, up_unit = metric_last(metrics, 'uptime')
    cpu, cpu_unit = metric_last(metrics, 'cpu_usage')
    ram, ram_unit = metric_last(metrics, 'ram_usage')
    disk, disk_unit = metric_last(metrics, 'disk_space')
    def mark(*prefixes):
        """✅ when no failure key starts with one of these prefixes, else ❌."""
        return '❌' if any(k.startswith(prefixes) for k in failures) else '✅'
    os_up = os_uptime()
    vps = f"🖥️ VPS {vm.get('state') if vm else f'API {s_vm}'}"
    if os_up is not None:
        vps += f' · OS up {fmt_uptime(os_up)}'
    if up is not None:
        vps += f' · VM up {fmt_uptime(up, up_unit)} (Hostinger)'
    usage = ' · '.join(x for x in (
        f'CPU {cpu:.1f} %' if isinstance(cpu, (int, float)) and cpu_unit == '%' else (f'CPU {cpu} {cpu_unit}' if cpu is not None else ''),
        f'RAM {fmt_amount(ram, ram_unit)}' if ram is not None else '',
        f'disk {fmt_amount(disk, disk_unit)}' if disk is not None else '') if x)
    summary = ('✅ All checks pass' if not failures
               else f'❌ {len(failures)} failing:\n' + '\n'.join(f'  • {t}' for t in failures.values()))
    return '\n'.join([
        f"📋 {env['NAME']} status",
        f'🕒 {times(env)}',
        '',
        summary,
        '',
        vps,
        f'📊 {usage}' if usage else '📊 usage: no data',
        '',
        f"{mark('site ')} Sites: {facts.get('sites', '?')}",
        f"{mark('container', 'compose')} Containers: {facts.get('containers', '?')}",
        f"{mark('nightly')} Nightly backup: {facts.get('nightly', '?')}",
        f"{mark('weekly')} Weekly backup: {facts.get('weekly', '?')}",
        f"{mark('snapshot')} Snapshot: {facts.get('snapshot', '?')}",
        *([''] + github_lines(env) if env['GITHUB_REPO'] else []),
        '',
        f"🔗 Backups in hPanel: {HPANEL}/{env['VPS_ID']}/backups",
    ])


def status_due(env, state, local=None):
    """The newest STATUS_AT time of today that has come and is later than the last status sent, as 'YYYY-MM-DD HH:MM';
    None if nothing is due. After a pause (the server down), only the newest missed time is sent, never a backlog;
    changing STATUS_AT never sends a catch-up for a time already behind us today."""
    local = local or datetime.now(env['tz'])
    passed = [t for t in env['status_at'] if t <= (local.hour, local.minute)]
    if not passed:
        return None
    slot = f"{local.date().isoformat()} {passed[-1][0]:02d}:{passed[-1][1]:02d}"
    return slot if slot > state.get('status_sent', '') else None     # 'YYYY-MM-DD HH:MM' sorts like time


# ------------------------------------------------------------------ the modes

def read_state():
    state = json.loads(STATE_FILE.read_text()) if STATE_FILE.exists() else {}
    state.setdefault('failing', {})
    return state


def cmd_check(env, dry):
    failures, facts = run_checks(env)
    state = read_state()
    was, now_failing = state['failing'], {}
    name = env['NAME']
    for key, text in failures.items():
        if key in was:                          # already reported: no second message
            now_failing[key] = was[key]
        elif send(env, f'❌ {name}: {text}\n🕒 {times(env)}', dry):
            now_failing[key] = stamp()          # recorded only once the message went out, else retried next run
    for key, since in was.items():
        if key not in failures and not send(env, f'✅ {name}: fixed: {key}\n(failing since {since})\n🕒 {times(env)}', dry):
            now_failing[key] = since            # couldn't tell anyone: keep it, try again next run
    state['failing'] = now_failing
    status = ''
    slot = status_due(env, state)
    if slot and send(env, status_text(env, failures, facts), dry):
        state['status_sent'] = slot
        status = f'; status message for {slot[-5:]} ' + ('printed (dry run)' if dry else 'sent')
    if not dry:
        STATE_FILE.write_text(json.dumps(state, indent=1))
    print(f'{stamp()} check: {len(failures)} failing'
          + (f": {', '.join(sorted(failures))}" if failures else '') + status)


def main():
    args = sys.argv[1:]
    dry = '--dry-run' in args
    mode = next((a for a in args if not a.startswith('--')), 'check')
    env = load_env()
    if mode == 'check':
        cmd_check(env, dry)
    elif mode in ('status', 'morning'):
        failures, facts = run_checks(env)
        send(env, status_text(env, failures, facts), dry)
        print(f"{stamp()} status: {'printed (dry run)' if dry else 'sent'} ({len(failures)} failing)")
    elif mode == 'test':
        print('sent' if send(env, f"🧪 {env['NAME']} monitor: test\n🕒 {times(env)}", dry) else 'FAILED')
    else:
        sys.exit(__doc__)


if __name__ == '__main__':
    main()
