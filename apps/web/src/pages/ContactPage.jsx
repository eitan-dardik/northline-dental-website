import React from 'react';
import { Helmet } from 'react-helmet';
import { formatLocations } from '../lib/locations';
import { telHref } from '../lib/format';
import ContactForm from '../components/ContactForm';
import { config } from '../lib/config/index.js';
import { useContent } from '../contexts/ContentProvider.jsx';
import ContentStatus from '../components/ContentStatus.jsx';
import { toProp } from '../lib/analytics/umami.js';

const facebook = config['social-media']?.find((s) => s.id === 'facebook');
const facebookUrl = facebook ? facebook.link : '#';

export default function ContactPage() {
	const state = useContent();
	const locations = state.status === 'ready' ? formatLocations(state.content.locations) : [];
	
	return (
		<>
			<Helmet>
				<title>Contact Us — {config.customer.name}</title>
				<meta
					name="description"
					content={`Contact ${config.customer.name} — send a message online or call the office nearest you to schedule an appointment.`}
				/>
			</Helmet>

			<div className="content">
				<h1>Contact Us</h1>
				<p>
					Contact us using the form below — and we&rsquo;ll get back to you.<br></br>
                    Prefer to call? Scroll down to find the office nearest you.
				</p>

				<h2>Send Us a Message</h2>
				<ContactForm />

				<h2>Or Call a Location Directly</h2>
                <p>
                    Our phones are answered during business hours-<br></br>
                    if you reach our voicemail, leave a message and we&rsquo;ll call you back as soon as possible.
                </p>
				{state.status === 'ready' ? (
					<div className="box-row">
						{locations.map((loc) => (
							<div className="info-box" key={loc.id}>
								<h3>{loc.name}</h3>
								<p>{loc.address}</p>
								<p>
									<strong>
										<a href={telHref(loc.phone)}
										data-umami-event='call_click'
										data-umami-event-location='office_card'
										data-umami-event-office={toProp(loc.id)}
										>
										{loc.phone}
										</a>
									</strong>
								</p>
								<p>{loc.hours}</p>
							</div>
						))}
					</div>
				) : (
					<ContentStatus status={state.status} />
				)}
				<h2>Find Us on Facebook</h2>
				<p>
					Follow{' '}
					<a href={facebookUrl} target="_blank" rel="noopener noreferrer">
						{config.customer.name} on Facebook
					</a>{' '}
					for office news, holiday hours, and the occasional smile tip. Please don&rsquo;t send
					personal health information through Facebook — for anything private, give us a call.
				</p>
			</div>
		</>
	);
}
