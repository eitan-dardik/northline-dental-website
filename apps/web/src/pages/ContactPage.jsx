import React from 'react';
import { Helmet } from 'react-helmet';
import { LOCATIONS } from '../components/LocationsTable';

const FACEBOOK_URL = 'https://www.facebook.com/NorthlineDentalGroup';

export default function ContactPage() {
    return (
        <>
            <Helmet>
                <title>Contact Us — Northline Dental Group</title>
                <meta
                    name="description"
                    content="Contact Northline Dental Group at one of our three locations — Maple Ridge, Fairview, or Grandon. Call the office nearest you to schedule an appointment."
                />
            </Helmet>

            <div className="content">
                <h1>Contact Us</h1>
                <p>
                    To schedule an appointment, please call the office nearest you. Our phones are answered
                    during business hours; if you reach our voicemail, leave a message and we&rsquo;ll call you
                    back the same business day.
                </p>

                <div className="box-row">
                    {LOCATIONS.map((loc) => (
                        <div className="info-box" key={loc.name}>
                            <h3>{loc.name}</h3>
                            <p>{loc.address}</p>
                            <p>
                                <strong>{loc.phone}</strong>
                            </p>
                            <p>{loc.hours}</p>
                        </div>
                    ))}
                </div>

                <h2>Find Us on Facebook</h2>
                <p>
                    Follow{' '}
                    <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
                        Northline Dental Group on Facebook
                    </a>{' '}
                    for office news, holiday hours, and the occasional smile tip. Please don&rsquo;t send
                    personal health information through Facebook — for anything private, give us a call.
                </p>
            </div>
        </>
    );
}
