// ContentStatus draws the two “not ready” screens: “Loading…”, or the message + fallback phone from the config
// Shown instead of a page's content while it loads, or when it can't be loaded.
// The phone comes from config.contact.fallback_phone in config.json, never from the database.
import { config } from '../lib/config/index.js';
import { telHref } from '../lib/format';


export default function ContentStatus({ status }) {
  if (status === 'loading') {
    return ( 
    <p className="field-hint" aria-live="polite">
    Loading…
    </p>
    );
  }

  // With ?., the worst case is an empty phone, not a crash
  const phone = config.contact?.fallback_phone;
  
  return (
    <p className="form-error" role="alert">
      We're sorry, this information couldn't be loaded right now.
      Please call us at{' '}
      <a href={telHref(phone)}>{phone}</a>.
    </p>
  );
}