import React from 'react';
import { parseDMY } from '../lib/format';

/**
 * Site-wide notice banner (e.g. holiday closures), fully driven by
 * config.json's `notice` block. Renders null (no DOM node) when
 * inactive, or when `until` ("DD/MM/YYYY") has passed. Editing the
 * message or dates is a config.json change only.
 *
 * role="status" instead of a heading tag — a heading here would sit
 * ahead of each page's own <h1>, breaking heading order for screen
 * readers.
 *
 * Rendered outside .page-wrap (see SiteLayout) so it's full width
 * regardless of that container's fixed layout.
 */
export default function NoticeBanner({ notice }) {
	if (!notice || !notice.active) return null;

	const untilDate = parseDMY(notice.until);
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