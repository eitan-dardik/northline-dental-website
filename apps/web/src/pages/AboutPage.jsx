import React from 'react';
import { Helmet } from 'react-helmet';
import { ACTIVE_LOCATIONS } from '../lib/locations';
import FramedPhoto from '../components/FramedPhoto';
import { formatList } from '../lib/format';
import config from '../../../../landing-template/config.json';

export default function AboutPage() {
	const locationCount = ACTIVE_LOCATIONS.length;
	const locationNames = formatList(ACTIVE_LOCATIONS.map((loc) => loc.name));

	return (
		<>
			<Helmet>
				<title>About Us — {config.customer.name}</title>
				<meta
					name="description"
					content={`Founded in ${config.customer.established}, ${config.customer.name} is a ${config.customer.staffSize}-person team providing family and cosmetic dentistry across ${locationCount} ${config.customer.city}-area locations.`}
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
						<p>
							What began as a single office has grown to {locationCount} locations
							{locationNames ? ` — ${locationNames} — ` : ' '}
							but the idea hasn&rsquo;t changed: {config.customer.tagline}
						</p>
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

				<div className="bio-list">
					{(config.team || []).map((member) => {
						const memberLocations = ACTIVE_LOCATIONS.filter((loc) =>
							(member.locationIds || []).includes(loc.id)
						);
						const memberLocationNames = formatList(memberLocations.map((loc) => loc.name));

						return (
							<div className="bio-row" key={member.id || member.name}>
								<div className="bio-photo">
									<FramedPhoto imageConfig={config.images?.[member.imageKey]} fallbackAlt={member.name} />
								</div>
								<div className="bio-text">
									<h3>{member.name}</h3>
									<p className="bio-role">{member.role}</p>
									<p>{member.bio}</p>
									{memberLocationNames && (
										<p className="bio-locations">
											Sees patients at our {memberLocationNames}{' '}
											{memberLocations.length === 1 ? 'office' : 'offices'}.
										</p>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</>
	);
}
