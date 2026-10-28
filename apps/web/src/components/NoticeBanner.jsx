import React from 'react';
import { parseISODate } from '../lib/format';
import { useContent } from '../contexts/ContentProvider.jsx';

/**
 * Site-wide notice banner (e.g. holiday closures), driven by the site_notice table (when active=true). 
 * Renders null (no DOM node) while:
 * content is loading or failed, when there's no active notice, or when `until` ("YYYY-MM-DD") has passed. 
 * Changing the message or dates is a seed.sql change only. `until` null = shown with no end date.
 *
 * role="status" instead of a heading tag — a heading here would sit
 * ahead of each page's own <h1>, breaking heading order for screen readers.
 *
 * Rendered outside .page-wrap (see SiteLayout) so it's full width regardless of that container's fixed layout.
 */
export default function NoticeBanner() {
	const content = useContent();
	if (content.status !== 'ready') return null;	 // no banner while loading or failed
	
	const notice = content.content.notice;         // the active row, or null
	if (!notice) return null;                     

	const untilDate = parseISODate(notice.until);
	if (untilDate) {
		// Keep the notice up through the whole "until" day, not just until
		// midnight at its start.
		const endOfUntilDay = new Date(
			untilDate.getFullYear(),
			untilDate.getMonth(),
			untilDate.getDate(),
			23, 59, 59, 999
		);
		if (new Date() > endOfUntilDay) return null;
	}

	return (
		<div className="notice-banner" role="status">
			<p className="notice-banner-heading">{notice.heading}</p>
			{notice.body && <p className="notice-banner-body">{notice.body}</p>}
		</div>
	);
}