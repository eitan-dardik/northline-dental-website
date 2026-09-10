import config from '../../../../landing-template/config.json';

// Filtered list: contains ONLY locations where active is true.
// This is the single source of truth for "is this office open" — every
// other export here, and every page, is built from this array.
export const ACTIVE_LOCATIONS = (config.locations || []).filter(
  (loc) => loc.active !== false
);

// Resolves an image's caption text ONLY if its assigned location is currently active.
// config.json stores the template on `caption` (e.g. "Our main office at {location}").
export function resolveImageCaption(imageConfig) {
  if (!imageConfig) return null;

  // If no locationId is specified, render the caption as-is
  if (!imageConfig.locationId) {
    return imageConfig.caption || null;
  }

  // Look up the office strictly within ACTIVE_LOCATIONS
  const activeOffice = ACTIVE_LOCATIONS.find((loc) => loc.id === imageConfig.locationId);

  // If the office is closed (active: false), do not show the caption
  if (!activeOffice) return null;

  return imageConfig.caption
    ? imageConfig.caption.replace('{location}', activeOffice.name)
    : activeOffice.name;
}

// Formats an hours array into a readable string, e.g.
// "Mon-Thu 8:00–17:00 · Fri 8:00–14:00 · Sat 9:00–13:00 (first and third Saturday)"
function formatHours(hoursArray) {
  if (!hoursArray || hoursArray.length === 0) return '';

  return hoursArray
    .map((h) => {
      const timeStr = `${h.days} ${h.open.replace(/^0/, '')}–${h.close.replace(/^0/, '')}`;
      if (h.frequency === 'monthly' && h.occurrences) {
        return `${timeStr} (first and third Saturday)`;
      }
      return timeStr;
    })
    .join(' · ');
}

// Used by ContactPage.jsx. Built from ACTIVE_LOCATIONS (not config.locations),
// so a closed office drops out of this list too — not just the raw data.
export const LOCATIONS = ACTIVE_LOCATIONS.map((loc) => ({
  id: loc.id,
  name: loc.primary ? `${loc.name} main office` : loc.name,
  address: loc.address,
  phone: loc.phone,
  hours: formatHours(loc.hours),
}));
