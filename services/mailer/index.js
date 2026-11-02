// Every 15 seconds, email each new lead once.
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
    await mail.sendMail(alertEmail(lead)); // always: the internal alert to the practice
    if (lead.email) await mail.sendMail(confirmationEmail(lead)); // phone-only lead: alert only

    // Step 3a, success: record it, with the time both emails went out.
    await db.from('lead_emails').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('lead_id', lead.id);
    console.log(`sent: lead ${lead.id}`); // the id only, no personal data in logs
  } catch (err) {
    // Step 3b, failure: record why (cut to 500 characters). The row stays, so the lead is not retried.
    await db.from('lead_emails').update({ status: 'failed', error: String(err.message).slice(0, 500) }).eq('lead_id', lead.id);
    console.error(`failed: lead ${lead.id}: ${err.message}`);
  }
}

// round(): one pass over the database. Finds the leads nobody has handled yet, and handles each one.
async function round() {
  // 1. The leads from the last 24 hours (24 h × 60 min × 60 s × 1000 ms, back from now), oldest first.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
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

// loop(): runs forever. One round, then a 15-second pause, then the next round.
// The next round is scheduled only after this one finishes, so two rounds never overlap.
async function loop() {
  try {
    await round();
    // Only reached when the round worked: the healthcheck checks this file was written recently.
    writeFileSync('/tmp/heartbeat', String(Date.now()));
  } catch (err) {
    // A failed round (e.g. the database briefly down) is logged, not fatal: the next round tries again.
    console.error(`round failed: ${err.message}`);
  }
  setTimeout(loop, ROUND_MS); // call loop() again in 15 seconds
}

console.log('mailer started');
loop();