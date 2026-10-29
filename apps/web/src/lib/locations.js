import { formatList, shortTime, ordinal, dayName } from './format.js';

// Helpers for the locations loaded from the database (see lib/data/content.js).
// They receive the locations as an argument; the loader already returns only
// active offices (.eq('active', true)), so no filtering is needed here.

// Resolves an image's caption text ONLY if its assigned location is currently active.
// config.json stores the template on `caption` (e.g. "Our main office at {location}").
export function resolveImageCaption(imageConfig, locations) {
  if (!imageConfig) return null;

  // Is this photo tied to an office at all?
  // If no locationId is specified, render the caption as-is
  if (!imageConfig.locationId) {
    return imageConfig.caption || null;
  }
  //If this photo tied to an office is it an active office?
  // Look up the office among the loaded (active) locations
  const activeOffice = (locations || []).find((loc) => loc.id === imageConfig.locationId);

  // Office closed, or locations not loaded yet: no caption
  if (!activeOffice) return null;

  return imageConfig.caption
    ? imageConfig.caption.replace('{location}', activeOffice.name)
    : activeOffice.name;
}

// "Sat" + [1, 3] → "first and third Saturday"
function describeOccurrences(days, occurrences) {
  return `${formatList(occurrences.map(ordinal))} ${dayName(days)}`;
}

// Formats a location's hours into a readable string, e.g.
// "Mon-Thu 8:00–17:00 · Fri 8:00–14:00 · Sat 9:00–13:00 (first and third Saturday)"
function formatHours(hours) {
  if (!hours || hours.length === 0) return '';

  return hours
    .map((h) => {
      const timeStr = `${h.days} ${shortTime(h.opens)}–${shortTime(h.closes)}`;
      return h.occurrences
        ? `${timeStr} (${describeOccurrences(h.days, h.occurrences)})`
        : timeStr;                                   // null occurrences = every week
    })
    .join(' · ');
}

// Used by ContactPage.jsx: the loaded (active) locations, shaped for display.
export function formatLocations(locations) {
  return (locations || []).map((loc) => ({
    id: loc.id,
    name: loc.is_primary ? `${loc.name} main office` : loc.name,
    address: loc.address,
    phone: loc.phone,
    hours: formatHours(loc.location_hours),
  }));
}