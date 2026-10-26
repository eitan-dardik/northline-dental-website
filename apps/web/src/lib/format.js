// Used wherever a list of names (locations, occurrences) becomes text.
// Joins items into a sentence: "A", "A and B", "A, B, and C". , so adding/removing an item never needs a code change. 
export const formatList = (items) => {
    if (!items || items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
};

// Turns a display phone number into a valid `tel:` by stripping everything except digits and leading "+". 
// Keeps the punctuated version for display and the raw version for the link, without needing two copies in config.json.
export const telHref = (phone) => `tel:${String(phone || '').replace(/[^\d+]/g, '')}`;

/**
 * Parses the DB's `date` of "YYYY-MM-DD" string into local midnight, or null if it's empty or malformed.
 * local midnight means each visitor will show the notice until the end of the day in their own timezone
 */
export const parseISODate = (value) => {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
	if (!match) return null;
	const [year, month, day] = match.slice(1).map(Number);
	return new Date(year, month - 1, day);
};

// Postgres time "08:00:00" → "8:00" (no seconds, no leading zero).
export const shortTime = (time) => String(time || '').slice(0, 5).replace(/^0/, '');

const ORDINALS = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth' };
// 3 → "third"
export const ordinal = (n) => ORDINALS[n] ?? String(n);

const DAY_NAMES = {
	Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday',
	Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday',
};
// "Sat" → "Saturday" (anything else, like "Mon-Thu", is returned as is)
export const dayName = (abbr) => DAY_NAMES[abbr] ?? abbr;