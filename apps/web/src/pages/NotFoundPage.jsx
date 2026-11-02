import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { config } from '../lib/config/index.js';

// Shown for any URL that isn't one of the site's pages (the catch-all route in App.jsx).
// The server sends index.html for every unknown URL (public/.htaccess), so React decides what's "not found".
export default function NotFoundPage() {
	return (
		<>
			<Helmet>
				<title>{`Page not found — ${config.customer.name}`}</title>
				{/* The server still answers 200 here, so ask search engines not to index this page */}
				<meta name="robots" content="noindex" />
			</Helmet>

			<div className="banner">
				<h1>Page not found.</h1>
				<p>The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.</p>
				<p className="banner-actions">
					<Link className="btn" to="/">
						Home page
					</Link>
					<Link className="btn btn-alt" to="/contact">
						Contact us
					</Link>
				</p>
			</div>
		</>
	);
}