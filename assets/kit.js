/* Event kit: the shared code behind every page. Do not edit: everything you set is in config.js.
   What it does, in order:
     1. reads config.js and picks this address's environment (staging, production, or none);
     2. fills the page with the event details (elements with data-kit="...");
     3. sends Umami events through window.umami (loaded by analytics.js), never with a name, email or phone;
     4. checks each form in the browser, then sends it to Supabase's API (PostgREST) with the publishable key.
   Visitors can only ADD rows (insert-only rules in supabase/migration.sql). The desk page calls three
   database functions that need the desk code. Nothing here can read the guest list.
   The guest's private link key (?t=... in the confirmation and follow-up emails) is taken out of the address bar
   the moment this file runs, before analytics.js loads Umami, so Umami never sees it. */
(function () {
  'use strict'
  // ---- the private link key: read it, then remove it from the address (before analytics loads) ---------
  var TOKEN = null
  try {
    var sp = new URLSearchParams(location.search)
    if (sp.has('t')) {
      TOKEN = sp.get('t')
      sp.delete('t')
      var rest = sp.toString()
      history.replaceState(history.state, '', location.pathname + (rest ? '?' + rest : '') + location.hash)
    }
  } catch (e) { /* an old browser keeps the address; the key still never goes into an event */ }

  var cfg = window.EVENT_KIT_CONFIG || {}
  var ev = cfg.event || {}
  var env = (cfg.environments || {})[location.hostname] || null
  var placeholder = /REPLACE/
  var ready = !!(env && env.supabaseUrl && env.publishableKey &&
    !placeholder.test(env.supabaseUrl + env.publishableKey))

  // ---- small helpers ------------------------------------------------------------------------
  function $(sel, root) { return (root || document).querySelector(sel) }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)) }
  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k] }, obj)
  }
  function store(kind) { try { return window[kind] } catch (e) { return null } }
  function remember(key, value) { var s = store('sessionStorage'); try { if (s) s.setItem(key, value) } catch (e) { /* private mode */ } }
  function recall(key) { var s = store('sessionStorage'); try { return s ? s.getItem(key) : null } catch (e) { return null } }

  // ---- analytics: names and props from the house event list, no personal data (SOP R6) ----------
  var queue = []
  function track(name, data) {
    if (window.umami && typeof window.umami.track === 'function') {
      try { window.umami.track(name, data || {}) } catch (e) { /* analytics must never break a page */ }
    } else { queue.push([name, data]) }
  }
  function flush() {
    if (!(window.umami && typeof window.umami.track === 'function')) return
    var q = queue; queue = []
    q.forEach(function (x) { track(x[0], x[1]) })
  }

  // ---- UTM tags: kept for this visit, stored on the row (lowercase, short) -----------------------
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']
  function captureUtm() {
    var params = new URLSearchParams(location.search)
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k)
      if (v) remember('kit.' + k, v.toLowerCase().slice(0, 100))
    })
  }
  function utm() {
    var out = {}
    UTM_KEYS.forEach(function (k) { var v = recall('kit.' + k); if (v) out[k] = v })
    return out
  }

  // ---- the API (Supabase's REST endpoint, through your Caddy hostname) ----------------------------
  function headers() {
    var h = { 'Content-Type': 'application/json', apikey: env.publishableKey }
    // Older self-hosted keys are JWTs ("eyJ..."): they also go in Authorization. New "sb_publishable_" keys do not.
    if (/^eyJ/.test(env.publishableKey)) h.Authorization = 'Bearer ' + env.publishableKey
    return h
  }
  function call(path, body, prefer) {
    if (!ready) return Promise.reject({ reason: 'network' })
    var ctl = typeof AbortController === 'function' ? new AbortController() : null
    var timer = ctl ? setTimeout(function () { ctl.abort() }, 10000) : null
    var h = headers()
    if (prefer) h.Prefer = prefer
    return fetch(env.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + path, {
      method: 'POST', headers: h, body: JSON.stringify(body), signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      if (timer) clearTimeout(timer)
      return r.text().then(function (t) {
        var j = null
        try { j = t ? JSON.parse(t) : null } catch (e) { j = null }
        return { status: r.status, ok: r.ok, body: j }
      })
    }, function () {
      if (timer) clearTimeout(timer)
      throw { reason: 'network' }
    })
  }
  // Insert one row. 201 = stored. 409 = this email is already registered for this event: we show
  // the same "you are registered" message, so the page never tells anyone who else signed up.
  function insert(table, row) {
    return call(table, row, 'return=minimal').then(function (res) {
      if (res.status === 201 || res.status === 204 || res.status === 409) return true
      throw { reason: 'processor_error', status: res.status }
    })
  }
  function rpc(fn, args) {
    return call('rpc/' + fn, args).then(function (res) {
      if (!res.ok) throw { reason: 'processor_error', status: res.status }
      return res.body || {}
    })
  }

  // ---- fill the page from config.js --------------------------------------------------------------
  function fill() {
    if (ev.siteUrl) $all('[data-kit-site]').forEach(function (a) { a.href = ev.siteUrl })
    if (ev.logoUrl) $all('[data-kit-logo]').forEach(function (img) {
      img.src = ev.logoUrl; img.alt = ev.organizer || ''; img.hidden = false
      if (img.nextElementSibling) img.nextElementSibling.hidden = true
    })
    if (ev.heroImageUrl) $all('[data-kit-hero]').forEach(function (img) { img.src = ev.heroImageUrl; img.hidden = false })
    $all('[data-kit]').forEach(function (el) {
      var v = get(cfg, el.getAttribute('data-kit'))
      if (v != null && v !== '') el.textContent = v
    })
    $all('[data-kit-tel]').forEach(function (a) {
      a.href = 'tel:' + (ev.phone || '')
      if (!a.textContent.trim()) a.textContent = ev.phoneText || ev.phone || ''
      a.addEventListener('click', function () { track('cta_click', { location: a.getAttribute('data-kit-tel') || 'page', label: 'call' }) })
    })
    $all('[data-kit-map]').forEach(function (el) {
      if (ev.mapUrl) { var a = document.createElement('a'); a.href = ev.mapUrl; a.rel = 'noopener'; a.textContent = 'Map'; el.appendChild(document.createTextNode(' · ')); el.appendChild(a) }
    })
    var list = $('#timetable')
    if (list && Array.isArray(ev.timetable)) {
      list.textContent = ''
      ev.timetable.forEach(function (row) {
        var li = document.createElement('li')
        var t = document.createElement('span'); t.className = 't'; t.textContent = row.time
        var w = document.createElement('span'); w.textContent = row.what
        li.appendChild(t); li.appendChild(w); list.appendChild(li)
      })
    }
    var guests = $('#guests')
    if (guests) {
      var max = (cfg.form && cfg.form.maxGuests) || 6
      guests.textContent = ''
      for (var i = 1; i <= max; i++) {
        var o = document.createElement('option'); o.value = String(i); o.textContent = i === 1 ? '1 person' : i + ' people'
        guests.appendChild(o)
      }
    }
    if (cfg.form && cfg.form.askPhone === false) $all('[data-kit-field="phone"]').forEach(function (el) { el.remove() })
    if (cfg.form && cfg.form.askGuests === false) $all('[data-kit-field="guests"]').forEach(function (el) { el.remove() })
    if (ev.name && document.title.indexOf(ev.name) < 0) document.title = document.title.replace('Open Morning', ev.name)
  }

  // ---- "Add to calendar": a small .ics file made in the browser ----------------------------------
  function icsStamp(iso) { return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') }
  function icsText(s) { return String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n') }
  function calendar(location_) {
    track('cta_click', { location: location_, label: 'calendar' })
    if (!ev.startsAt || !ev.endsAt) return
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//event-kit//EN', 'BEGIN:VEVENT',
      'UID:' + (ev.id || 'event') + '@event-kit', 'DTSTAMP:' + icsStamp(new Date().toISOString()),
      'DTSTART:' + icsStamp(ev.startsAt), 'DTEND:' + icsStamp(ev.endsAt),
      'SUMMARY:' + icsText(ev.name), 'LOCATION:' + icsText(ev.address),
      'DESCRIPTION:' + icsText(ev.tagline + (ev.phoneText ? ' Questions: ' + ev.phoneText : '')),
      'END:VEVENT', 'END:VCALENDAR']
    var blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar' })
    var a = document.createElement('a')
    a.href = URL.createObjectURL(blob); a.download = (ev.id || 'event') + '.ics'
    document.body.appendChild(a); a.click()
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove() }, 1000)
  }

  // ---- form checks in the browser (the database checks again) ------------------------------------
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
  var PHONE = /^[0-9+()\-.\s]{7,20}$/
  var MESSAGES = {
    required: 'Please fill this in.',
    email: 'Please enter an email address like name@example.com.',
    phone: 'Please enter a phone number with 7 to 20 digits, or leave it empty.',
    length: 'Please keep this under 120 characters.'
  }
  function check(input) {
    var v = input.value.trim()
    var msg = ''
    if (input.required && !v) msg = input.tagName === 'SELECT' ? 'Please choose one.' : MESSAGES.required
    else if (v && input.type === 'email' && (!EMAIL.test(v) || v.length > 254)) msg = MESSAGES.email
    else if (v && input.type === 'tel' && !PHONE.test(v)) msg = MESSAGES.phone
    else if (v.length > 120 && input.type !== 'email') msg = MESSAGES.length
    var err = document.getElementById(input.id + '-error')
    if (msg) {
      input.setAttribute('aria-invalid', 'true')
      if (err) { err.textContent = msg; err.hidden = false }
    } else {
      input.removeAttribute('aria-invalid')
      if (err) { err.textContent = ''; err.hidden = true }
    }
    return !msg
  }
  function validate(form) {
    var inputs = $all('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select[required]', form).filter(function (i) { return !i.closest('.hp') })
    var bad = inputs.filter(function (i) { return !check(i) })
    if (bad.length) bad[0].focus()
    return bad.length === 0
  }
  function values(form) {
    var out = {}
    $all('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.closest('.hp')) return
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return
      var v = el.value.trim()
      if (v !== '') out[el.name] = v
    })
    return out
  }

  // Wire a form: form_start once, checks, send, then form_submit or form_error (no personal data).
  function wire(form, formName, send, onOk) {
    var started = false
    var btn = $('button[type=submit]', form)
    var err = document.getElementById(form.id + '-error')
    form.addEventListener('focusin', function () {
      if (!started) { started = true; track('form_start', { form: formName }) }
    })
    // Errors appear only when the guest presses the button; while they type, a fixed field's error goes away.
    // (Showing new errors on blur moves the button just as it is tapped, and the tap is lost.)
    $all('input, select', form).forEach(function (i) {
      i.addEventListener('input', function () { if (i.getAttribute('aria-invalid')) check(i) })
    })
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      if (err) { err.hidden = true; err.textContent = '' }
      if (!validate(form)) { track('form_error', { form: formName, reason: 'validation' }); return }
      var trap = $('.hp input', form)
      if (trap && trap.value) { onOk({}); return } // a bot filled the hidden field: pretend, store nothing
      if (btn) btn.disabled = true
      Promise.resolve().then(function () { return send(values(form)) }).then(function (result) {
        // A refused second answer (result.duplicate) is not a new submit, so it is not counted again.
        if (!(result && result.duplicate)) track('form_submit', { form: formName, channel: 'form' })
        onOk(result || {})
      }, function (x) {
        var reason = (x && x.reason) || 'processor_error'
        track('form_error', { form: formName, reason: reason })
        if (err) {
          err.textContent = (x && x.message) || ('We could not save this just now. Please call ' + (ev.phoneText || 'us') + ' and we will do it for you.')
          err.hidden = false
        }
      }).then(function () { if (btn) btn.disabled = false })
    })
  }

  // ---- pages ----------------------------------------------------------------------------------
  var pages = {}

  // ---- the page by the clock: before, during and after the event (startsAt and endsAt in config.js) ----
  function eventPhase() {
    var now = Date.now(), from = Date.parse(ev.startsAt), to = Date.parse(ev.endsAt)
    if (isNaN(from) || isNaN(to) || now < from) return 'before'
    return now < to ? 'live' : 'after'
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e }
  function fillContent() {
    var h = $('#highlights')
    if (h) (ev.highlights || []).forEach(function (x) {
      var c = el('div', 'highlight'); c.appendChild(el('h2', '', x.title)); c.appendChild(el('p', '', x.text)); h.appendChild(c)
    })
    var t = $('#team')
    if (t) (ev.team || []).forEach(function (x) {
      var li = el('li'); li.appendChild(el('strong', '', x.name)); li.appendChild(el('span', '', x.role)); t.appendChild(li)
    })
    var f = $('#faq')
    if (f) (ev.faq || []).forEach(function (x) {
      var d = el('details'); d.appendChild(el('summary', '', x.q)); d.appendChild(el('p', '', x.a)); f.appendChild(d)
    })
    var b = $('#before-you-come')
    if (b) (ev.beforeYouCome || []).forEach(function (x) { b.appendChild(el('li', '', x)) })
  }
  function markNow() {   // the timetable row that is on now, on the event's own clock (Toronto = Eastern)
    var hm = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit' }).format(new Date())
    var rows = $all('#timetable li'), at = -1
    ;(ev.timetable || []).forEach(function (r, i) { if (r.time <= hm) at = i })
    if (rows[at]) rows[at].classList.add('now')
  }
  pages.event = function () {
    captureUtm()
    fillContent()
    var phase = eventPhase()
    document.body.setAttribute('data-phase', phase)
    if (phase !== 'before') {
      var note = $('#phase-notice'); note.textContent = phase === 'live' ? ev.liveText : ev.afterText; note.hidden = false
    }
    if (phase === 'live') markNow()
    if (phase !== 'before') {   // once it has started, nobody signs up online: the desk takes walk-ups
      $('#register').hidden = true
      $('#hero-cta').hidden = true
    }
    if (phase === 'live') return
    if (phase === 'after') {
      var book = $('#phase-book'); book.hidden = false
      book.addEventListener('click', function () { track('cta_click', { location: 'hero', label: 'book' }) })
      return
    }
    var form = $('#register-form')
    var state = ev.registration || 'open'
    if (state !== 'open' || !ready) {
      form.hidden = true
      var box = $(state === 'soon' ? '#register-soon' : state === 'closed' ? '#register-closed' : '#register-unavailable')
      if (box) box.hidden = false
      if (!ready && state === 'open' && window.console) console.warn('event-kit: no ready environment for ' + location.hostname + ' in config.js')
      return
    }
    wire(form, 'event_registration', function (v) {
      var row = { event_id: ev.id, name: v.name, email: (v.email || '').toLowerCase(), phone: v.phone || null,
        guests: v.guests ? parseInt(v.guests, 10) : 1 }
      var u = utm(); Object.keys(u).forEach(function (k) { row[k] = u[k] })
      return insert(cfg.tables.registrations, row)
    }, function () {
      form.hidden = true
      var ok = $('#register-ok'); ok.hidden = false; ok.focus()
    })
    $all('[data-kit-calendar]').forEach(function (b) { b.addEventListener('click', function () { calendar('event') }) })
    $all('[data-kit-cta]').forEach(function (a) { a.addEventListener('click', function () { track('cta_click', { location: 'hero', label: a.getAttribute('data-kit-cta') }) }) })
  }

  // The confirmation email links here with ?t=<token>. The database checks the token and sets verified_at once.
  // The answer is only ok / already / invalid: nothing about the guest comes back to the page.
  function showOnly(ids, show) {
    ids.forEach(function (id) { var el = document.getElementById(id); if (el) el.hidden = id !== show })
    var el = document.getElementById(show)
    if (el) el.focus()
  }
  function verify() {
    var boxes = ['verify-wait', 'verify-ok', 'verify-already', 'verify-invalid', 'verify-error']
    if (TOKEN === null) return // opened without the email link: the page shows the event only
    if (!ready) { showOnly(boxes, 'verify-error'); return }
    showOnly(boxes, 'verify-wait')
    rpc('event_verify', { p_token: TOKEN }).then(function (res) {
      if (res.status === 'ok') {
        track('form_submit', { form: 'event_verification' })
        showOnly(boxes, 'verify-ok')
        $('#guest-pass').hidden = false
      } else if (res.status === 'already') {
        showOnly(boxes, 'verify-already')
        $('#guest-pass').hidden = false
      } else {
        track('form_error', { form: 'event_verification', reason: 'validation' })
        showOnly(boxes, 'verify-invalid')
      }
    }, function (x) {
      track('form_error', { form: 'event_verification', reason: (x && x.reason) || 'processor_error' })
      showOnly(boxes, 'verify-error')
    })
  }

  function questionnaire() {
    var q = cfg.questionnaire, form = $('#questionnaire-form')
    if (!q || !form) return
    var yesNo = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
    choices($('#q-patient'), 'is_patient', yesNo, 'q-patient-')
    choices($('#q-children'), 'with_children', yesNo, 'q-children-')
    wire(form, 'event_questionnaire', function (v) {
      if (!v.is_patient || !v.with_children) throw { reason: 'validation', message: 'Please answer both questions.' }
      var row = { event_id: ev.id, token: TOKEN, is_patient: v.is_patient, with_children: v.with_children }
      return call('event_questionnaire', row, 'return=minimal').then(function (res) {
        var code = res.body && res.body.code
        if (res.status === 201 || res.status === 204) return { duplicate: false }
        if (res.status === 409 && code === '23505') return { duplicate: true } // already answered: same thank-you
        throw { reason: 'processor_error', status: res.status }
      })
    }, function () {
      form.hidden = true
      var ok = $('#questionnaire-ok'); ok.hidden = false; ok.focus()
    })
  }
  pages.confirm = function () {
    captureUtm()
    fillContent()
    questionnaire()
    verify()
    $('#calendar-btn').addEventListener('click', function () { calendar('confirm') })
  }

  pages.book = function () {
    captureUtm()
    var online = $('#book-online')
    if (cfg.booking && cfg.booking.url) {
      online.href = cfg.booking.url; online.hidden = false
      online.addEventListener('click', function () { track('cta_click', { location: 'book', label: 'book_online' }) })
    }
    var officeSel = $('#office'), doctorSel = $('#doctor')
    var offices = (cfg.booking && cfg.booking.offices) || []
    function addOption(sel, value, label) { var o = document.createElement('option'); o.value = value; o.textContent = label; sel.appendChild(o) }
    function doctorsFor(office) {   // only the dentists who work at the chosen office
      var seen = {}
      doctorSel.length = 1
      offices.filter(function (x) { return office === 'any' || x.value === office }).forEach(function (x) {
        (x.doctors || []).forEach(function (d) { if (!seen[d.value]) { seen[d.value] = true; addOption(doctorSel, d.value, d.label) } })
      })
    }
    offices.forEach(function (x) { addOption(officeSel, x.value, x.label) })
    doctorsFor('any')
    officeSel.addEventListener('change', function () { doctorsFor(officeSel.value) })
    var form = $('#book-form')
    if (!ready) { form.hidden = true; $('#book-unavailable').hidden = false; return }
    wire(form, 'visit_booking', function (v) {
      var people = parseInt(v.patients, 10) || 1, kids = parseInt(v.children, 10) || 0
      if (kids > people) throw { reason: 'validation', message: 'The number of children cannot be more than the number of people.' }
      var row = { event_id: ev.id, name: v.name || null, email: (v.email || '').toLowerCase(), phone: v.phone || null,
        preferred: v.preferred || 'any', office: v.office || 'any', doctor: v.doctor || 'any',
        patients: people, children: kids, is_patient: v.is_patient || 'unknown' }
      var u = utm(); Object.keys(u).forEach(function (k) { row[k] = u[k] })
      return insert(cfg.tables.visitRequests, row)
    }, function () {
      form.hidden = true
      var ok = $('#book-ok'); ok.hidden = false; ok.focus()
    })
  }

  // The guest survey. The follow-up emails link here with ?t=<token> (and &k=missed for "sorry we missed you").
  // One answer per token: the database refuses a second one, and the page says so politely.
  // The answer row has no name and no email. Umami gets the rating only.
  function choices(box, name, list, idPrefix) {
    if (!box) return
    box.textContent = ''
    ;(list || []).forEach(function (c) {
      var id = idPrefix + c.value.replace(/_/g, '-')
      var wrap = document.createElement('div'); wrap.className = 'choice'
      var input = document.createElement('input'); input.type = 'radio'; input.name = name; input.id = id; input.value = c.value
      var label = document.createElement('label'); label.htmlFor = id; label.textContent = c.label
      wrap.appendChild(input); wrap.appendChild(label); box.appendChild(wrap)
    })
  }
  pages.feedback = function () {
    captureUtm()
    var sv = cfg.survey || {}
    var missed = new URLSearchParams(location.search).get('k') === 'missed'
    var form = $('#feedback-form')
    var max = sv.commentMax || 500
    $('#comment').maxLength = max
    $('#comment-help').textContent = 'Optional. Up to ' + max + ' characters.'
    $all('[data-kit-recommend]').forEach(function (l) {
      var k = l.getAttribute('data-kit-recommend')
      if (sv.recommendLabels && sv.recommendLabels[k]) l.textContent = sv.recommendLabels[k]
    })
    choices($('#useful-choices'), 'most_useful', sv.useful, 'useful-')
    choices($('#kept-choices'), 'kept_away', sv.keptAway, 'kept-')
    $all(missed ? '[data-kit-part="came"]' : '[data-kit-part="missed"]').forEach(function (el) { el.remove() })
    if (missed) { var intro = $('#feedback-intro'); if (intro && sv.missedIntro) intro.textContent = sv.missedIntro }
    if (TOKEN === null || !ready) {
      form.hidden = true
      $(TOKEN === null ? '#feedback-invalid' : '#feedback-unavailable').hidden = false
      return
    }
    function need(groupName, errId, msg) {
      var picked = $('input[name=' + groupName + ']:checked', form)
      var err = document.getElementById(errId)
      if (err) { err.textContent = picked ? '' : msg; err.hidden = !!picked }
      if (!picked) { var first = $('input[name=' + groupName + ']', form); if (first) first.focus() }
      return !!picked
    }
    wire(form, 'event_feedback', function (v) {
      var ok = missed ? need('kept_away', 'kept-error', 'Please choose one answer.')
        : need('rating', 'rating-error', 'Please choose a number from 1 to 5.')
      if (!ok) throw { reason: 'validation', message: 'Please answer the first question.' }
      var comment = (v.comment || '').slice(0, max)
      var row = { event_id: ev.id, token: TOKEN, kind: missed ? 'missed' : 'came', comment: comment || null,
        contact_me: v.contact_me === 'on' }
      if (missed) row.kept_away = v.kept_away
      else { row.rating = parseInt(v.rating, 10); row.most_useful = v.most_useful || null; row.recommend = v.recommend || null }
      return call(cfg.tables.feedback || 'event_feedback', row, 'return=minimal').then(function (res) {
        var code = res.body && res.body.code
        if (res.status === 201 || res.status === 204) {
          if (!missed) track('feedback_submit', { rating: row.rating })
          return { duplicate: false }
        }
        if (res.status === 409 && code === '23505') return { duplicate: true } // this link already answered
        if (res.status === 409 && code === '23503') {
          throw { reason: 'validation', message: 'This survey link does not work. Please call ' + (ev.phoneText || 'us') + ' and tell us what you think.' }
        }
        throw { reason: 'processor_error', status: res.status }
      })
    }, function (res) {
      form.hidden = true
      var box = $(res.duplicate ? '#feedback-already' : '#feedback-ok'); box.hidden = false; box.focus()
    })
  }

  // The desk: every call carries the desk code; the database checks it and allows nothing else.
  pages.checkin = function () {
    var code = $('#desk-code')
    var saved = recall('kit.desk')
    if (saved) code.value = saved
    code.addEventListener('change', function () { remember('kit.desk', code.value) })
    var ok = $('#checkin-ok')
    if (!ready) { $('#desk-unavailable').hidden = false; $all('form').forEach(function (f) { f.hidden = true }); return }

    function deskCode() {
      var v = code.value.trim()
      if (v.length < 8) {
        code.setAttribute('aria-invalid', 'true')
        var e = $('#desk-code-error'); e.textContent = 'Enter the desk code (8 characters or more).'; e.hidden = false
        code.focus()
        throw { reason: 'validation', message: 'Enter the desk code first.' }
      }
      code.removeAttribute('aria-invalid'); $('#desk-code-error').hidden = true
      remember('kit.desk', v)
      return v
    }
    var REASONS = {
      wrong_code: 'The desk code is not right. Check it and try again.',
      locked: 'Too many wrong codes. Wait 10 minutes, or use the printed list.',
      not_found: 'This email is not on the list. Check the spelling, or use the walk-up form below.',
      bad_input: 'Something in the form is not right. Check the name and email.'
    }
    function result(res) {
      if (!res.ok) throw { reason: 'validation', message: REASONS[res.reason] || REASONS.bad_input }
      return res
    }
    function shown(res, form) {
      var who = res.first_name ? res.first_name : 'Guest'
      var extra = res.already ? ' (already checked in earlier)' : res.matched ? ' (was on the list)' : ''
      var group = res.guests > 1 ? ' Group of ' + res.guests + '.' : ''
      $all('.formerr').forEach(function (e) { e.hidden = true; e.textContent = '' })
      ok.textContent = 'Checked in: ' + who + extra + '.' + group
      ok.hidden = false
      form.reset()
      // The next guest is most likely on the list: back to the email field, with the result in view.
      var next = $('#email'); if (next) next.focus()
      if (ok.scrollIntoView) ok.scrollIntoView({ block: 'nearest' })
      refresh()
    }
    wire($('#checkin-form'), 'event_checkin', function (v) {
      ok.hidden = true
      return rpc('event_check_in', { p_event: ev.id, p_code: deskCode(), p_email: (v.email || '').toLowerCase() }).then(result)
    }, function (res) { shown(res, $('#checkin-form')) })
    wire($('#walkup-form'), 'event_checkin', function (v) {
      ok.hidden = true
      return rpc('event_walk_up', { p_event: ev.id, p_code: deskCode(), p_name: v.name, p_email: v.email ? v.email.toLowerCase() : null,
        p_phone: v.phone || null, p_guests: v.guests ? parseInt(v.guests, 10) : 1, p_is_patient: v.is_patient }).then(result)
    }, function (res) { shown(res, $('#walkup-form')) })

    function refresh() {
      var v = code.value.trim()
      if (v.length < 8) return
      rpc('event_desk_count', { p_event: ev.id, p_code: v }).then(function (res) {
        if (!res.ok) return
        $('#arrived-count').textContent = String(res.arrived)
        $('#count-detail').textContent = 'of ' + res.registered + ' registered · ' + res.walk_ups + (res.walk_ups === 1 ? ' walk-up' : ' walk-ups')
      }, function () { $('#count-detail').textContent = 'Count not available: keep counting on the printed list.' })
    }
    $('#count-btn').addEventListener('click', refresh)
    refresh()
  }

  window.EventKit = {
    start: function (page) {
      fill()
      if (pages[page]) pages[page]()
    },
    analyticsReady: flush,
    env: env,
    ready: ready
  }
})()
