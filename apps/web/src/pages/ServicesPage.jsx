import React from 'react';
import { Helmet } from 'react-helmet';
import FramedPhoto from '../components/FramedPhoto';
import { config } from '../lib/config/index.js';
import { useContent } from '../contexts/ContentProvider.jsx';
import ContentStatus from '../components/ContentStatus.jsx';

export default function ServicesPage() {
	const state = useContent();
	const services = state.status === 'ready' ? state.content.services : [];

	return (
		<>
			<Helmet>
				<title>Our Services — {config.customer.name}</title>
				<meta name="description" content={services.map((s) => s.name.toLowerCase()).join(', ')} />
			</Helmet>

			<div className="content">
				<h1>Our Services</h1>

				<div className="two-col">
					<div className="col-text">
						<p>
							We provide complete family and cosmetic dentistry at all of our locations.
							From six-month cleanings to full cosmetic work, most of what your family needs can
							be done right here — no referrals across town.
						</p>
						<p>
							Not sure what you need? Call the office nearest you and we&rsquo;ll help you figure
							it out. If something hurts, don&rsquo;t wait — we keep time open every business day
							for emergencies.
						</p>
					</div>
					<div className="col-photo">
						<FramedPhoto imageConfig={config.images?.treatmentRoom} fallbackAlt="Treatment room" />
					</div>
				</div>
				{state.status === 'ready' ? (
					<div className="box-grid">
						{services.map((service) => (
							<div className="info-box" key={service.id}>
								<h3>{service.name}</h3>
								<p>{service.description}</p>
							</div>
						))}
					</div>
				) : (
					<ContentStatus status={state.status} />
				)}
			</div>
		</>
	);
}
