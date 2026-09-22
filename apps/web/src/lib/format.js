//  Used anywhere config-driven lists (like active locations) get stitched
//  into a sentence, so adding/removing an item in config never needs a code change. 
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
 * Parses a "DD/MM/YYYY" string into a Date, or null if it's empty,
 * malformed, or an impossible date (e.g. "31/02/2026"). Not using
 * `new Date(string)` — that misreads day/month for this format.
 */
export const parseDMY = (value) => {
	const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(value || '').trim());
	if (!match) return null;

	const [day, month, year] = match.slice(1).map(Number);
	const date = new Date(year, month - 1, day);

	// Date() silently rolls invalid dates over (31/02 -> 3 March) — reject those.
	const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
	return isValid ? date : null;
};