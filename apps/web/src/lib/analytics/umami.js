// reads settings only through lib/config (env.js), never directly
import { env } from '../config/env.js';

export function loadUmami() {
  if (!env.umamiScriptUrl || !env.umamiWebsiteId) return;  // no analytics is fine; a broken page is not
  const s = document.createElement('script');
  s.defer = true;                               // Loads after the page
  s.src = env.umamiScriptUrl;                   // VITE_UMAMI_SCRIPT_URL, from Part 1
  s.dataset.websiteId = env.umamiWebsiteId;     // VITE_UMAMI_WEBSITE_ID, from Part 1
  s.dataset.performance = 'true';               // Core Web Vitals from real visitors
  document.head.appendChild(s);                 // Adds the tag; once the script loads, it creates window.umami
}

// window.umami? -- the script loads late and an ad blocker can stop it; the site must work without it
export function track(name, data) {
  window.umami?.track(name, data);              // If window.umami exists, call its track; otherwise do nothing, no error.
}

// property values are lower_snake: i.e id "office-place-holder" is sent as "office_place_holder"
// toProp(undefined) returns the text "undefined"
export const toProp = (id) => String(id).replace(/-/g, '_');