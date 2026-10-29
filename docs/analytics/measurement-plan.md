# Measurement plan: Northline Dental

- Money action: a saved lead
- Source of truth: the leads table (staging and production databases). Umami shows where leads come from, not how many.
- Office values are the ids in the locations table, with `-` written as `_` (e.g. `<office-id>` is sent as `<office_id>`)
- form_error counts are always read by reason: validation sends one event per failed field, so an unfiltered total mixes field mistakes with failed saves
- New values, not in the house standard's core list: the event `whatsapp_click`, and `failure_message` as a `location` of `call_click`

| Business question | Event | Properties (allowed values) | Fires when | Looks wrong when | Then we |
|---|---|---|---|---|---|
| Are people abandoning the form? | form_start vs form_submit | form (contact) | form_start: first input, once per form view. form_submit: submitLead() returned no error | under 40% of starts become submits over a month | cut or simplify fields |
| Is the form failing to save? | form_error | form (contact); reason (network, rejected) | a submit fails and the failure message with the fallback phone shows; never together with form_submit | any network or rejected error in a week | check the API and the leads policy (runbook) |
| Do people understand the form? | form_error | form (contact); reason (validation); field (name, phone, email, location, message, contact) | the form refuses a submit: one event for each field that failed (contact = neither phone nor email), so a refused submit can send several | one field causing most of them, or more than 3 per form_submit over a month | rewrite that field's label and hint |
| Do people prefer the form, a call or WhatsApp? | form_submit, call_click, whatsapp_click | call_click counted without location = failure_message | see their rows | one channel's share changes sharply from one month to the next | find what changed on the site that month. Clicks are intent and submits are saved leads, so compare trends, not the numbers to each other |
| Where do people find our phone number? | call_click | location (header, footer, contact_page, office_card, failure_message) | click on any tel: link | almost no calls from the header or footer | make the number more visible there |
| Which office gets the most calls? | call_click | office (`<office_id>`, one per row in locations), only when the number belongs to one office; none on failure_message | click on an office's tel: link | one office far below the others | check its number and hours on the site |
| Which office gets the most form submits? | form_submit | form (contact); office (`<office_id>`, one per row in locations) | submitLead() returned no error | an office the client says is busy gets almost none | check that office is in the form's list |
| Does "Book an appointment" lead to contact? | cta_click | location (banner; a new button adds its position here first); label (book) | click on any "Book an appointment" | many cta_click, but few form_start and contact_page call_click after it | shorten the path from the button to the form or phone |
| Is WhatsApp worth keeping? (new event) | whatsapp_click | location (header, footer, contact_page) | click on the WhatsApp link | near 0 over three months | remove the link |
| Do failures send people to the phone? | call_click | location (failure_message); no office | click on the fallback phone in a failure message | any, together with form_error (reason network or rejected) | treat it as a failing form (runbook) |