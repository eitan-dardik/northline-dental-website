import React from 'react';
import { resolveImageCaption } from '../lib/locations';
import { useContent } from '../contexts/ContentProvider.jsx';

/**
 * Renders a config-driven photo: the framed <img> plus its caption, if it
 * has one. Handles both kinds of image entries in config.json:
 *   - location-tied images (locationId + "{location}" in the caption) —
 *     the caption disappears automatically if that location closes
 *   - plain images with a fixed caption (no locationId) — caption is
 *     shown as-is
 *   - images with no "caption" field at all — no caption line is rendered
 *
 * Usage: <FramedPhoto imageConfig={config.images?.homeOffice} fallbackAlt="Our main office" />
 */
export default function FramedPhoto({ imageConfig, fallbackAlt = '', maxWidth }) {
	const state = useContent();
	const locations = state.status === 'ready' ? state.content.locations : [];
	const caption = resolveImageCaption(imageConfig, locations);

	return (
		<>
			<div className="photo-frame" style={maxWidth ? { maxWidth } : undefined}>
				<img src={imageConfig?.src || '/assets/placeholder.svg'} alt={imageConfig?.alt || fallbackAlt} />
			</div>
			{caption && <p className="photo-caption">{caption}</p>}
		</>
	);
}
