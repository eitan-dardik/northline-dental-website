// Every 15 seconds: email each new lead once, and (Open Morning) each new registration its confirmation,
// and one reminder to confirm 24 hours later.
// Runs on the server only.
// What differs per server, and the secrets, come from mailer.env, never from code.
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { readFileSync, writeFileSync } from 'node:fs'; // Node's built-in file functions: reads config.json at start-up, writes the heartbeat file the healthcheck checks

// A required setting from mailer.env. Stops the mailer if it's missing: without it, nothing can be sent.
const env = (name) => {
  const value = (process.env[name] ?? '').trim();
  if (!value) throw new Error(`Missing setting: ${name}`);
  return value;
};

// The same config.json the website uses, mounted read-only, so the name, phone and colors live in one place.
const config = JSON.parse(readFileSync(process.env.CONFIG_PATH || '/app/config.json', 'utf8'));
const CLINIC = config.customer?.name;
const PHONE = config.contact?.fallback_phone;
const BRAND = config.brand?.primary;
const TEXT = config.brand?.text;
const ACCENT = config.brand?.accent;
if (!CLINIC || !PHONE || !BRAND || !TEXT || !ACCENT) {
  throw new Error('config.json is missing customer.name, contact.fallback_phone or a brand color (primary, text, accent)');
}

const ROUND_MS = 15_000;
const PRACTICE_TO = env('MAIL_TO'); // where internal alerts go (i.e a mailbox you own)
const FROM = env('SMTP_USER'); // send from the mailbox we log in as (DMARC alignment)

// The secret key: allowed only because this runs on the server. Over the Docker network, not the internet.
const db = createClient(env('SUPABASE_URL'), env('SUPABASE_SECRET_KEY'), {
  auth: { persistSession: false },
});

// Required, like the host: the port in use is always visible in mailer.env, for troubleshooting.
const SMTP_PORT = Number(env('SMTP_PORT'));
if (!Number.isInteger(SMTP_PORT)) throw new Error('SMTP_PORT must be a number, e.g. 465');

const mail = nodemailer.createTransport({
  host: env('SMTP_HOST'),
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // 465 = TLS from the start; 587 = STARTTLS upgrade
  auth: { user: FROM, pass: env('SMTP_PASS') },
});

// ---- Open Morning (W7) -----------------------------------------------------------------------------
// Optional: only a server whose mailer.env has EVENT_URL sends the event emails. Without it (for example
// production before its release), the mailer handles leads only, exactly as before.
const EVENT_URL = (process.env.EVENT_URL ?? '').trim().replace(/\/+$/, ''); // https://<the event host>, no trailing slash
const EVENT_ID = '2026-11-open-morning';                                     // the same id as config.js and the desk code
const EVENT_START = new Date('2026-11-24T10:00:00-05:00');                   // no reminder to confirm after the event starts
const EVENT_PHONE = '(440) 555-0140';                                         // the number in Denise's approved texts (EMAILS.md)
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_TRIES = 3;                                                          // per email, while the mailer runs; then it gives up and logs it
const tries = new Map();                                                      // "registration id:kind" -> failed sends so far

// Send one email and log the mail server's reply (W7 task 34): "250 ..." means the server accepted it.
// The log line has the id and the kind only: never a name or an email address.
async function send(message, label) {
  const info = await mail.sendMail(message);
  console.log(`sent: ${label}: ${info.response} (id ${info.messageId}; accepted ${info.accepted.length}, rejected ${info.rejected.length})`);
  return info;
}

// The visitor's text goes into HTML: escape it, so a message can't inject markup into the email.
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Email HTML: styles inline (email apps ignore stylesheets), colors from config.json,
// and the site's font named first with a safe fallback (email apps don't load web fonts).
const html = (title, body) => `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;color:${TEXT}">
    <h2 style="color:${BRAND};margin:0 0 12px;padding-bottom:8px;border-bottom:2px solid ${ACCENT}">${esc(title)}</h2>
    ${body}
    <p style="color:${TEXT};font-size:13px">${esc(CLINIC)} ·
      <a href="tel:${esc(PHONE.replace(/[^\d+]/g, ''))}" style="color:${ACCENT}">${esc(PHONE)}</a></p>
  </div>`;

// A link as a button, on its own line, so an email app never cuts it in two (kit README, "When something does not work").
const button = (href, label) =>
  `<p style="margin:20px 0"><a href="${esc(href)}" style="background:${BRAND};color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:700;display:inline-block">${esc(label)}</a></p>`;

// Internal alert, to the practice's own mailbox: the details in the body, but no personal data in the subject.
function alertEmail(lead) {
  const office = lead.location || 'no office chosen';
  const lines = [
    `Name: ${lead.name}`,
    `Phone: ${lead.phone || '-'}`,
    `Email: ${lead.email || '-'}`,
    `Office: ${office}`,
    `Message: ${lead.message || '-'}`,
    `Received: ${lead.created_at}`,
  ];
  return {
    from: `${CLINIC} website <${FROM}>`,
    to: PRACTICE_TO,
    subject: `New inquiry — ${office}`,
    text: lines.join('\n'),
    html: html(`New inquiry — ${office}`, lines.map((l) => `<p style="margin:4px 0">${esc(l)}</p>`).join('')),
  };
}

// Patient confirmation: says we got it and how to reach us. Never repeats their message.
function confirmationEmail(lead) {
  const text = `Hi ${lead.name},\n\nThanks for contacting ${CLINIC}. We've received your message and will call you back as soon as possible.\n\nIf it's urgent, call us at ${PHONE}.`;
  return {
    from: `${CLINIC} <${FROM}>`,
    to: lead.email,
    subject: 'We received your message',
    text,
    html: html('We received your message', text.split('\n\n').map((p) => `<p>${esc(p)}</p>`).join('')),
  };
}

// The confirm link: the row's own token, never its id (the id is not a secret). utm_source tells the two emails apart in Umami.
const confirmLink = (token, source) =>
  `${EVENT_URL}/confirm/?t=${token}&utm_source=${source}&utm_medium=email&utm_campaign=${EVENT_ID}`;

// Open Morning email 2, the confirmation: word for word the text Denise approved (docs/event/EMAILS.md, OK on #114, 17 Nov).
// The bold parts are bold in EMAILS.md too. The phone is the one in that text, the clinic's number for guests.
function eventConfirmationEmail(reg) {
  const link = confirmLink(reg.token, 'confirmation');
  const subject = 'Please confirm your place at the Open Morning';
  const first = `Hi ${reg.name},`;
  const when = 'Tuesday 24 November, 10:00–12:00';
  const visit = `Thank you for signing up! See you on ${when}, at 1847 Maple Ridge Road, Suite 200.`;
  const ask = 'Please press this link to confirm your email address:';
  const after = ["You don't need to bring anything.", `Can't come after all? Just call us at ${EVENT_PHONE}.`, 'Denise and the Northline team'];
  return {
    from: `${CLINIC} <${FROM}>`,
    to: reg.email,
    subject,
    text: [first, visit, ask, link, ...after].join('\n\n'),
    html: html(subject,
      `<p>${esc(first)}</p>`
      + `<p>Thank you for signing up! See you on <strong>${esc(when)}</strong>, at 1847 Maple Ridge Road, Suite 200.</p>`
      + `<p><strong>${esc(ask)}</strong></p>`
      + button(link, 'Confirm my place')
      + after.map((p) => `<p>${esc(p)}</p>`).join('')),
  };
}

// Open Morning email 2b, the reminder to confirm: once, 24 hours after the confirmation; word for word EMAILS.md 2b.
function verifyReminderEmail(reg) {
  const link = confirmLink(reg.token, 'verify-reminder');
  const subject = 'One tap to confirm your place';
  const first = `Hi ${reg.name},`;
  const visit = 'You signed up for our Open Morning on Tuesday 24 November. One tap confirms your email address:';
  const after = ['Your place is saved either way.', 'Denise and the Northline team'];
  return {
    from: `${CLINIC} <${FROM}>`,
    to: reg.email,
    subject,
    text: [first, visit, link, ...after].join('\n\n'),
    html: html(subject, [first, visit].map((p) => `<p>${esc(p)}</p>`).join('')
      + button(link, 'Confirm my place') + after.map((p) => `<p>${esc(p)}</p>`).join('')),
  };
}

// handle(): emails ONE lead, and records the result in lead_emails.
// Called by round() for each lead that has no lead_emails row yet.
async function handle(lead) {
  // Step 1, claim the lead: insert its lead_emails row with status 'sending'.
  // lead_id is the primary key, so a second claim fails (23505) and we skip it.
  // Whoever inserts first "owns" the lead, so it can never be emailed twice.
  const claim = await db.from('lead_emails').insert({ lead_id: lead.id, status: 'sending' });
  if (claim.error) {
    if (claim.error.code === '23505') return; // already claimed: not ours to send
    throw claim.error; // any other database error: stop, round() logs it
  }

  // Step 2, send. try/catch: if any line inside fails, jump straight to catch.
  try {
    await send(alertEmail(lead), `lead ${lead.id} alert`); // always: the internal alert to the practice
    if (lead.email) await send(confirmationEmail(lead), `lead ${lead.id} confirmation`); // phone-only lead: alert only

    // Step 3a, success: record it, with the time both emails went out.
    await db.from('lead_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('lead_id', lead.id);
  } catch (err) {
    // Step 3b, failure: record why (cut to 500 characters). The row stays, so the lead is not retried.
    await db.from('lead_emails').update({ status: 'failed', error: String(err.message).slice(0, 500) }).eq('lead_id', lead.id);
    console.error(`failed: lead ${lead.id}: ${err.message}`);
  }
}

// handleEvent(): sends ONE event email (kind 'confirmation' or 'verify_reminder') to ONE registration.
// The same claim-first idea as handle(): the (registration_id, kind) primary key of registration_emails
// lets only one insert win, so an email is never sent twice. registration_emails has no status column,
// so a failed send deletes its claim again: the next round retries it, up to MAX_TRIES.
async function handleEvent(reg, kind, build) {
  const key = `${reg.id}:${kind}`;
  if ((tries.get(key) ?? 0) >= MAX_TRIES) return; // gave up on this one (logged when it happened)

  const claim = await db.from('registration_emails').insert({ registration_id: reg.id, kind });
  if (claim.error) {
    if (claim.error.code === '23505') return; // already sent (or being sent)
    throw claim.error;
  }

  try {
    await send(build(reg), `registration ${reg.id} ${kind}`);
    await db.from('registration_emails').update({ sent_at: new Date().toISOString() })
      .eq('registration_id', reg.id).eq('kind', kind); // the time the mail server accepted it
  } catch (err) {
    await db.from('registration_emails').delete().eq('registration_id', reg.id).eq('kind', kind);
    const n = (tries.get(key) ?? 0) + 1;
    tries.set(key, n);
    console.error(`failed: registration ${reg.id} ${kind} (try ${n} of ${MAX_TRIES}): ${err.message}`);
  }
}

// round(): one pass over the database. Finds the leads nobody has handled yet, and handles each one.
async function round() {
  // 1. The leads from the last 24 hours (24 h × 60 min × 60 s × 1000 ms, back from now), oldest first.
  const since = new Date(Date.now() - DAY_MS).toISOString();
  const leads = await db.from('leads')
    .select('id, created_at, name, phone, email, location, message')
    .gte('created_at', since) // gte = "greater than or equal": created since then
    .order('created_at');
  if (leads.error) throw leads.error;
  if (leads.data.length === 0) return; // no recent leads: nothing to do this round

  // 2. Which of those leads already have a lead_emails row (sent, failed, or being sent).
  const done = await db.from('lead_emails').select('lead_id').in('lead_id', leads.data.map((l) => l.id));
  if (done.error) throw done.error;
  const handled = new Set(done.data.map((r) => r.lead_id)); // a Set: a quick "is this id in it?" list

  // 3. Handle the rest, one at a time (await = wait for each to finish before the next).
  for (const lead of leads.data) {
    if (!handled.has(lead.id)) await handle(lead);
  }
}

// eventRound(): the kit's queries 6 and 8 (supabase/queries.sql), through the API.
async function eventRound() {
  if (!EVENT_URL) return; // this server doesn't send event emails

  // Query 6: registrations from the page (an email, not a walk-up) with no confirmation yet.
  const regs = await db.from('registrations')
    .select('id, name, email, token, verified_at, created_at')
    .eq('event_id', EVENT_ID).eq('walk_up', false).not('email', 'is', null)
    .order('created_at');
  if (regs.error) throw regs.error;
  if (regs.data.length === 0) return;

  const sent = await db.from('registration_emails').select('registration_id, kind, sent_at')
    .in('registration_id', regs.data.map((r) => r.id));
  if (sent.error) throw sent.error;
  const has = (id, kind) => sent.data.find((e) => e.registration_id === id && e.kind === kind);

  for (const reg of regs.data) {
    if (!has(reg.id, 'confirmation')) await handleEvent(reg, 'confirmation', eventConfirmationEmail);
  }

  // Query 8: confirmation sent 24 hours ago or more, the link still not pressed, no reminder yet, the event not started.
  if (Date.now() >= EVENT_START.getTime()) return;
  const cutoff = Date.now() - DAY_MS;
  for (const reg of regs.data) {
    const conf = has(reg.id, 'confirmation');
    if (conf && !reg.verified_at && new Date(conf.sent_at).getTime() <= cutoff && !has(reg.id, 'verify_reminder')) {
      await handleEvent(reg, 'verify_reminder', verifyReminderEmail);
    }
  }
}

// loop(): runs forever. One round, then a 15-second pause, then the next round.
// The next round is scheduled only after this one finishes, so two rounds never overlap.
// Leads and the event each have their own try: a problem in one never stops the other.
async function loop() {
  let ok = true;
  try {
    await round();
  } catch (err) {
    ok = false;
    console.error(`round failed: ${err.message}`);
  }
  try {
    await eventRound();
  } catch (err) {
    ok = false;
    console.error(`event round failed: ${err.message}`);
  }
  // Only when both worked: the healthcheck checks this file was written recently.
  if (ok) writeFileSync('/tmp/heartbeat', String(Date.now()));
  setTimeout(loop, ROUND_MS); // call loop() again in 15 seconds
}

console.log(`mailer started${EVENT_URL ? '; event emails on' : '; event emails off (no EVENT_URL)'}`);
loop();