-- Requires the fields the contact form always collects, enforced at
-- the database level. name was already required in 001. This adds
-- location and message, plus a rule for phone/email that a single
-- NOT NULL column can't express: the form requires at least one of
-- the two, not both — so this uses a check constraint across both
-- columns instead.
--
-- This matters beyond matching the form: the anon insert policy in
-- 001 allows any insert from the public, so someone could submit
-- directly to the API with the anon key, bypassing the form's
-- JavaScript validation entirely. This is the enforcement that
-- actually can't be skipped.

alter table leads
  alter column location set not null,
  alter column message set not null;

alter table leads
  add constraint leads_phone_or_email_required
  check (phone is not null or email is not null);
