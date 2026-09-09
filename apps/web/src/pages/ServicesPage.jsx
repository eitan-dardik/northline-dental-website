import React from 'react';
import { Helmet } from 'react-helmet';

const OPERATORY_URL = 'https://images.hostinger.com/ec19a440-6dbb-457e-9404-ad98cbf36420.png';

const SERVICES = [
    {
        name: 'General Dentistry',
        text: 'Complete exams, digital X-rays, oral cancer screenings, and honest treatment planning for the whole family.',
    },
    {
        name: 'Cleanings & Hygiene',
        text: 'Gentle, thorough cleanings from our hygiene team, plus practical advice for keeping your smile healthy between visits.',
    },
    {
        name: 'Fillings',
        text: 'Tooth-colored composite fillings that blend in naturally and restore strength to decayed or damaged teeth.',
    },
    {
        name: 'Crowns & Bridges',
        text: 'Durable, natural-looking crowns and bridges to repair broken teeth and replace missing ones.',
    },
    {
        name: 'Root Canal Treatment',
        text: 'Comfortable root canal therapy that relieves pain and saves your natural tooth.',
    },
    {
        name: 'Extractions',
        text: 'Gentle tooth extractions — including troublesome wisdom teeth — with clear aftercare instructions.',
    },
    {
        name: 'Teeth Whitening',
        text: 'Professional whitening that brightens your smile several shades, safely and quickly.',
    },
    {
        name: 'Invisalign Clear Aligners',
        text: 'Straighten your teeth discreetly with clear, removable aligners. Ask us whether Invisalign is right for you.',
    },
    {
        name: 'Emergency Appointments',
        text: 'Toothache, chipped tooth, or lost filling? Call us — we reserve time every business day for dental emergencies.',
    },
    {
        name: "Children's Dentistry",
        text: 'Friendly first visits and gentle care that helps kids grow up unafraid of the dentist.',
    },
];

export default function ServicesPage() {
    return (
        <>
            <Helmet>
                <title>Our Services — Northline Dental Group</title>
                <meta
                    name="description"
                    content="General dentistry, cleanings and hygiene, fillings, crowns and bridges, root canal treatment, extractions, teeth whitening, Invisalign, emergency appointments, and children's dentistry."
                />
            </Helmet>

            <div className="content">
                <h1>Our Services</h1>

                <div className="two-col">
                    <div className="col-text">
                        <p>
                            We provide complete family and cosmetic dentistry at all three of our locations.
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
                        <div className="photo-frame">
                            <img src={OPERATORY_URL} alt="One of our treatment rooms" />
                        </div>
                        <p className="photo-caption">One of our treatment rooms at the Maple Ridge office.</p>
                    </div>
                </div>

                <div className="box-grid">
                    {SERVICES.map((service) => (
                        <div className="info-box" key={service.name}>
                            <h3>{service.name}</h3>
                            <p>{service.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
