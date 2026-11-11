# Speed and accessibility baseline

- **Date:** Wed 11 Nov 2026, 14:19–14:42 Israel
- **Tool:** Chrome DevTools Lighthouse 13.5.0
- **Settings:** Navigation · Mobile · Performance + Accessibility
- **Browser:** Incognito window (no extensions)
- **Clear storage:** off. With it on, Hostinger's bot check answers 403, and Lighthouse measures the check page instead of the site.
- **Runs:** 3 per page; the run with the middle Performance score is kept.
- **Reports:** all 18 runs saved as JSON on my laptop (not in the repo).

## Production (what visitors get today)

- **Commit:** e18483f (v0.5.0)

| Page | Performance | Accessibility | LCP | CLS | Total Blocking Time |
|---|---|---|---|---|---|
| Home `/` | **89** (runs 4–6: 89, 61, 91) | 90 | 3.2 s | 0.004 | 80 ms |
| Contact `/contact` | **63** (runs 63, 91, 60) | 90 | 6.6 s | 0.011 | 60 ms |

## Staging, before the contrast fix

The fix goes to dev first, so staging before → staging after shows the effect of the fix alone.

- **Commit:** 742d854 (#139 merged)

| Page | Performance | Accessibility | LCP | CLS | Total Blocking Time |
|---|---|---|---|---|---|
| Home `/` | **90** (runs 87, 90, 91) | 90 | 3.2 s | 0 | 90 ms |
| Contact `/contact` | **95** (runs 95, 96, 91) | 90 | 2.3 s | 0 | 40 ms |
| Services `/services` (extra) | **82** (runs 54, 83, 82) | 88 | 4.4 s | 0 | 50 ms |

## The first three accessibility issues (the same on every page)

1. **Small grey text is too light.** The tagline, the photo captions and the note under the contact form use `#9a948e` on white: 2.99:1, where normal text needs 4.5:1.
2. **Links look like plain text.** "on Facebook" in the contact text and "Find us on Facebook" / "WhatsApp us" in the footer differ from the text around them only by a very similar color (1.02:1 and 1.35:1) and have no underline.
3. **Headings skip a level** ("Northline Dental Group" on Contact, "General dentistry" on Services), which confuses screen-reader users who move through a page by its headings.

## Notes

- **Network noise:** some runs had ~450–490 ms network round-trips from my connection. Lighthouse's simulated throttling scales that up, so those runs are much slower: production home runs 1–3 (61, 58, 90; replaced by runs 4–6), production contact 63 and 60, staging services 54. Production contact's middle (63) is one of them; its Accessibility result is the same as in the steady runs.
- **The teal `#4FA8A0` from #2 no longer appears;** the accent is `#2F6E68`. The failing color is the muted grey `#9a948e`.
- **Umami:** the production runs show up as test visits in production Umami, 11 Nov 14:19–14:34 Israel.