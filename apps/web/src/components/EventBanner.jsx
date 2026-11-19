import React from 'react';
import { env } from '../lib/config/env.js';

/**
 * The Open Morning banner (W7 task 38): one line that links to the event page with the website tags.
 * The event page's address is the build setting VITE_EVENT_URL, set per site in hPanel (staging: the
 * event's staging page; production: the event page), so each site links to its own event page.
 * Not set → renders null (production shows nothing until its setting is added after event-v1.0.0).
 * Hidden after the Open Morning ends. No click event here: the event page counts the visit by its
 * tags (MEASURE.md). Reuses the notice-banner styles; rendered next to NoticeBanner in SiteLayout.
 */
const EVENT_URL = env.eventUrl.replace(/\/+$/, '');
const EVENT_STARTS = new Date('2026-11-24T10:00:00-05:00');   // online registration closes then (the event page does the same)
const LINK = `${EVENT_URL}/?utm_source=website&utm_medium=banner&utm_campaign=2026-11-open-morning`;

export default function EventBanner() {
	if (!EVENT_URL || new Date() >= EVENT_STARTS) return null;
	return (
		<div className="notice-banner event-banner" role="status">
			<p className="notice-banner-heading">
				Open Morning, Tue 24 Nov: free smile checks. <a href={LINK}>Register&nbsp;&rarr;</a>
			</p>
		</div>
	);
}