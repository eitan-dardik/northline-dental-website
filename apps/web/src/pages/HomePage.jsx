import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import FramedPhoto from '../components/FramedPhoto';
import config from '../../../../landing-template/config.json';

export default function HomePage() {
	return (
		<>
			<Helmet>
				<title>
					{config.customer.name} — {config.customer.tagline} in {config.customer.city}, {config.customer.state}
				</title>
				<meta
					name="description"
					content={`${config.customer.tagline}. ${config.customer.name} has served the ${config.customer.city} area since ${config.customer.established}.`}
				/>
			</Helmet>

			<div className="banner">
				<h1>{config.customer.tagline}.</h1>
				<p>
					{config.customer.header} across the {config.customer.city} area.
					<br />
					Proudly serving the community since {config.customer.established}.
				</p>
				<p className="banner-actions">
					<Link className="btn" to="/services">
						Our Services
					</Link>
					<Link className="btn btn-alt" to="/about">
						Meet the Team
					</Link>
				</p>
			</div>

			<div className="content">
				<div className="two-col">
					<div className="col-text">
						<h2>Welcome to {config.customer.name}</h2>
						<p>
							Since {config.customer.established}, {config.customer.name} has cared for families across the{' '}
							{config.customer.city} area with comfortable, honest dentistry. Whether you&rsquo;re due for a
							cleaning, thinking about Invisalign, or need a crown in a hurry, our team takes the time to
							explain your options and treat you like a neighbor — because you are one.
						</p>
						<p>
							New patients are always welcome, and we accept most major insurance plans. Our team
							makes every visit straightforward, comfortable, and personal.
						</p>
					</div>
					<div className="col-photo">
						<FramedPhoto imageConfig={config.images?.receptionMainOffice} fallbackAlt="Dental office reception" />
					</div>
				</div>

				<div className="box-row">
					<div className="info-box">
						<h3>Family Dentistry</h3>
						<p>
							From first checkups to grandpa&rsquo;s bridge, we care for every smile in the family —
							children included.
						</p>
						<p>
							<Link to="/services">Our services &raquo;</Link>
						</p>
					</div>
					<div className="info-box">
						<h3>Cosmetic Dentistry</h3>
						<p>
							Teeth whitening, Invisalign clear aligners, and natural-looking crowns, bridges, and
							fillings.
						</p>
						<p>
							<Link to="/services">See what we offer &raquo;</Link>
						</p>
					</div>
					<div className="info-box">
						<h3>Insurance &amp; Payment</h3>
						<p>
							We accept most major insurance, including Delta Dental, Cigna, MetLife, Aetna, and
							Guardian.
						</p>
						<p>
							<Link to="/insurance">Insurance &amp; payment &raquo;</Link>
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
