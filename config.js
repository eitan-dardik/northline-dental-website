/* Open Morning event kit: the ONE file you edit.
   Everything the pages show or connect to comes from here. Change values, not names.
   Every value marked REPLACE must be filled in before that environment works; until then the
   pages show the "call us" message instead of the form, so a half-set environment never loses a guest.
   The publishable key is public by design (it is in every visitor's browser). Never put a secret
   key, a service role key or a password in this file: it is published with the pages. */
window.EVENT_KIT_CONFIG = {
  // ---- The event (from Denise's details and your PLAN.md) --------------------------------------
  event: {
    id: '2026-11-open-morning',           // stored on every row; must match the desk code row (README step 5)
    name: 'Northline Open Morning',
    organizer: 'Northline Dental Group',
    logoUrl: '',   // shown in the header; leave '' for the name only
    siteUrl: 'https://northline.holistech.tech',                   // the header links back to the main site
    heroImageUrl: 'https://northline.holistech.tech/assets/logo.svg',                      // optional: a photo beside the title; leave '' for none
    tagline: 'Free 10-minute smile checks, a short talk on caring for children\'s teeth, and a chance to meet the team.',
    forWhom: 'For our patients and neighbors, and especially families with children.',
    dateText: 'Tuesday 24 November 2026',
    timeText: '10:00 to 12:00 (Eastern time)',
    startsAt: '2026-11-24T10:00:00-05:00', // used for "Add to calendar"; Toronto is UTC-5 in November
    endsAt: '2026-11-24T12:00:00-05:00',
    address: '1847 Maple Ridge Road, Suite 200',
    mapUrl: '',                            // optional: a map link for the address; leave '' for none
    phone: '+14405550140',                 // Northline's phone (digits, with +1)
    phoneText: '(440) 555-0140',           // the same number, as people read it
    timetable: [
      { time: '10:00', what: 'Doors open, and free smile checks (10-minute slots)' },
      { time: '10:30', what: 'A short talk on caring for children\'s teeth' },
      { time: '11:00', what: 'Meet the team' },
      { time: '12:00', what: 'Close' }
    ],
    offer: 'Everyone who comes gets a free check-up in the first two weeks of December.',
    // What guests read on the page. Change the words freely; Denise approves them.
    beforeYouCome: [                       // shown only after a guest confirms their email
      'You don\'t need to bring anything.',
      'Come at 10:00 if you can: the smile checks are first come, first served.',
      'Write down any questions you have about your teeth or your children\'s teeth.',
      'Bringing the family? Tell the front desk how many of you there are when you arrive.'
    ],
    highlights: [
      { title: 'A free 10-minute smile check', text: 'A quick look at your teeth, and a plain answer about how they are doing.' },
      { title: 'A short talk on children\'s teeth', text: 'Practical advice for parents at 10:30. Bring your questions.' },
      { title: 'Meet the team', text: 'Put faces to names, and see the office before your next visit.' }
    ],
    team: [                                // from your team_members table
      { name: 'Dr. Anjali Patel, DDS', role: 'Practice Principal' },
      { name: 'Dr. Marcus Feld, DDS', role: 'General Dentist' },
      { name: 'Denise Kowalczyk', role: 'Office Manager' }
    ],
    faq: [
      { q: 'Is it really free?', a: 'Yes. The smile check and the talk cost nothing.' },
      { q: 'Do I have to be a patient?', a: 'No. Our patients and our neighbors are all welcome.' },
      { q: 'Can I bring my children?', a: 'Please do. The morning is planned with families in mind.' },
      { q: 'Do I need to sign up?', a: 'Please do, so we can plan the smile checks. If you decide on the day, come anyway.' },
      { q: 'Do I need to bring anything?', a: 'No, nothing at all.' },
      { q: 'What if I can no longer come?', a: 'Call the number at the top of this page, and we will free your place.' }
    ],
    // The page changes by itself at startsAt and endsAt (see the README).
    liveText: 'Happening now, until 12:00. You can still come, no need to sign up.',
    afterText: 'The Open Morning has ended. Thank you to everyone who came.',
    registration: 'closed',                  // 'soon' = shows "Registration opens soon"; 'open'; 'closed' = after the event
    privacy: 'We keep your name, email, phone number (if you give it) and your answers only for the Open Morning: to confirm your place, remind you the day before, and send one email the day after with our offer and a short survey. We never share them or use them for anything else.'  },

  // ---- The form (from your CAPTURE.md) ---------------------------------------------------------
  form: {
    askPhone: true,                        // show an optional phone field
    askGuests: true,                       // show "How many people are coming?"
    maxGuests: 7
  },

  // ---- The two quick questions, shown after a guest confirms their email (confirm/) ---------------
  questionnaire: {
    intro: 'Two quick questions, so we can plan your morning.',
    patientQuestion: 'Are you a Northline patient today?',
    childrenQuestion: 'Are you bringing children?',
    done: 'Thank you! We will use this to plan your morning.'
  },

  // ---- After the event: the booking page (book/) ------------------------------------------------
  booking: {
    url: '',                               // optional: Northline's online booking page; leave '' to show the phone and the form only
    deadlineText: 'within 7 days of the Open Morning',
    // The offices and dentists a guest can ask for. Check them against your locations and team_member_locations tables.
    offices: [
      { value: 'maple-ridge', label: 'Maple Ridge', doctors: [{ value: 'patel', label: 'Dr. Patel' }] },
      { value: 'fairview', label: 'Fairview', doctors: [{ value: 'patel', label: 'Dr. Patel' }, { value: 'feld', label: 'Dr. Feld' }] },
      { value: 'grandon', label: 'Grandon', doctors: [{ value: 'feld', label: 'Dr. Feld' }] }
    ]
  },

  // ---- After the event: the guest survey (feedback/) ---------------------------------------------
  // The thank-you email links to feedback/?t=<token>; the "sorry we missed you" email to feedback/?t=<token>&k=missed.
  // Change the words freely. Each "value" is what the database stores: lowercase letters, digits and _ only,
  // at most 40 characters. Keep 2 to 5 choices in each list. A change to the questions needs the CEO's yes first.
  survey: {
    intro: 'Three quick questions about the Open Morning. It takes under a minute, and your answers help us plan the next one.',
    ratingQuestion: 'How was the Open Morning for you?',
    ratingLow: 'Poor',                     // shown under 1
    ratingHigh: 'Excellent',               // shown under 5
    usefulQuestion: 'What was most useful?',
    useful: [                              // the parts of the morning, from the timetable above
      { value: 'smile_check', label: 'The free smile check' },
      { value: 'talk', label: 'The talk on children\'s teeth' },
      { value: 'team', label: 'Meeting the team' }
    ],
    recommendQuestion: 'Would you recommend Northline to a friend?',
    recommendLabels: { yes: 'Yes', maybe: 'Maybe', no: 'No' },
    commentQuestion: 'Anything else you would like to tell us?',
    commentMax: 500,                       // the database refuses more than 500 characters
    contactLabel: 'Please contact me about booking a visit',
    missedIntro: 'We are sorry we missed you. One quick question, so we can plan the next one better.',
    missedQuestion: 'What kept you away?',
    keptAway: [
      { value: 'time', label: 'The time did not suit me' },
      { value: 'ill', label: 'Someone was ill' },
      { value: 'forgot', label: 'I forgot' },
      { value: 'other', label: 'Something else' }
    ]
  },

  // ---- Database tables (must match supabase/migration.sql) -------------------------------------
  tables: {
    registrations: 'registrations',
    visitRequests: 'visit_requests',
    feedback: 'event_feedback'
  },

  // ---- Measurement (from your MEASURE.md) -------------------------------------------------------
  utm: {
    campaign: '2026-11-open-morning'       // all lowercase; the same in all three links
  },

  // ---- Environments: picked by the address the page is opened on -------------------------------
  // One entry per hostname. Staging and production build the same files; only this block differs.
  // supabaseUrl: your API hostname (the one Caddy serves), https, no trailing slash.
  // umamiScriptUrl: https://<your analytics host>/script.js · umamiWebsiteId: that environment's website id.
  environments: {
    'event-stage.holistech.tech': {
      label: 'staging',
      supabaseUrl: 'https://northline-api-stage.holistech.tech',
      publishableKey: 'sb_publishable_YO2heWSVlg6v-7_wZgHMf8_jrV-EoYz',
      umamiScriptUrl: 'https://analytics.holistech.tech/script.js',
      umamiWebsiteId: '58d4cb58-4873-4d5b-929e-192d9170a3a4'
    },
    'event.holistech.tech': {
      label: 'production',
      supabaseUrl: 'https://northline-api.holistech.tech',
      publishableKey: 'sb_publishable_1j6ru6IFHakfr-R_2CtMyA_Znk7CPaE',
      umamiScriptUrl: 'https://analytics.holistech.tech/script.js',
      umamiWebsiteId: 'e89c00dc-f225-4981-b5d0-0773c1e579fb'
    }
  }
}
