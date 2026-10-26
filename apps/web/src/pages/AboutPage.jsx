import React from 'react';
import { Helmet } from 'react-helmet';
import FramedPhoto from '../components/FramedPhoto';
import { formatList } from '../lib/format';
import { config } from '../lib/config/index.js';
import { useContent } from '../contexts/ContentProvider.jsx';
import ContentStatus from '../components/ContentStatus.jsx';

export default function AboutPage() {
	const state = useContent();
	const ready = state.status === 'ready';
	const locations = ready ? state.content.locations : [];
	const team = ready ? state.content.team : [];

	const locationCount = locations.length;
	const locationNames = formatList(locations.map((loc) => loc.name));

	return (
		<>
			<Helmet>
				<title>About Us — {config.customer.name}</title>
				<meta
					name="description"
					content={`Founded in ${config.customer.established}, ${config.customer.name} is a ${config.customer.staffSize}-person team providing family and cosmetic dentistry across ${ready ? `${locationCount} ` : ''}${config.customer.city}-area locations.`}
				/>
			</Helmet>

			<div className="content">
				<h1>About Us</h1>

				<div className="two-col">
					<div className="col-text">
						<h2>Our Practice</h2>
						<p>
							{config.customer.name} was founded in {config.customer.established}, built on
							the kind of practice we&rsquo;d want for our own family: unhurried appointments,
							plain-spoken advice, and treatment plans that respect your budget.
						</p>
						{ready && (
							<p>
								What began as a single office has grown to {locationCount} locations
								{locationNames ? ` — ${locationNames} — ` : ' '}
								but the idea hasn&rsquo;t changed: {config.customer.tagline}
							</p>
						)}
					</div>
					<div className="col-photo">
						<FramedPhoto imageConfig={config.images?.homeOffice} fallbackAlt="Our main office" />
					</div>
				</div>

				<hr className="sep" />

				<h2>The Team</h2>
				<p>
					{config.customer.staffSize} people keep {config.customer.city} running: our dentists,
					hygiene team, dental assistants, and the front-desk staff who greet you by name.
				</p>
				<FramedPhoto
					imageConfig={config.images?.aboutTeam}
					fallbackAlt={`${config.customer.name} team`}
					maxWidth="620px"
				/>
				
				{ready ? (
					<div className="bio-list">
						{team.map((member) => {
							const memberLocationNames = formatList(member.locations.map((loc) => loc.name));

							return (
								<div className="bio-row" key={member.id}>
									<div className="bio-photo">
										<FramedPhoto imageConfig={config.images?.[member.image_key]} fallbackAlt={member.name} />
									</div>
									<div className="bio-text">
										<h3>{member.name}</h3>
										<p className="bio-role">{member.role}</p>
										<p>{member.bio}</p>
										{memberLocationNames && (
											<p className="bio-locations">
												Sees patients at our {memberLocationNames}{' '}
												{member.locations.length === 1 ? 'office' : 'offices'}.
											</p>
										)}
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<ContentStatus status={state.status} />
				)}
			</div>
		</>
	);
}
