import React from 'react';
import { Helmet } from 'react-helmet';
import { LOCATIONS } from '../components/LocationsTable';
import config from '../../../../landing-template/config.json';

const facebook = config['social-media']?.find((s) => s.id === 'facebook');
const facebookUrl = facebook ? facebook.link : '#';

export default function ContactPage() {
    return (
        <>
            <Helmet>
                <title>Contact Us — {config.customer.name}</title>
                <meta
                    name="description"
                    content={'Contact ${config.customer.name} at one of our locations. Call the office nearest you to schedule an appointment.'}
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
