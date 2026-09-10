import React from 'react';
import { Helmet } from 'react-helmet';
import config from '../../../../landing-template/config.json';

export default function AboutPage() {
  return <>
            <Helmet>
                <title>About Us — {config.customer.name}</title>
                <meta name="description" content={'Founded in ${config.customer.established} by Dr. Anjali Patel, {config.customer.name} is a fourteen-person team providing family and cosmetic dentistry at three {config.customer.city}-area locations.'} />
            </Helmet>

            <div className="content">
                <h1>About Us</h1>

                <div className="two-col">
                    <div className="col-text">
                        <h2>Our Practice</h2>
                        <p>
                            {config.customer.name} was founded in {config.customer.established} by Dr. Anjali Patel, who wanted to build
                            the kind of practice she&rsquo;d want for her own family: unhurried appointments,
                            plain-spoken advice, and treatment plans that respect your budget.
                        </p>
                        <p>
                            What began as a single office on Maple Ridge Road has grown to three locations —
                            Maple Ridge, Fairview, and Grandon — but the idea hasn&rsquo;t changed: {config.customer.tagline}
                        </p>
                    </div>
                    <div className="col-photo">
                        <div className="photo-frame">
                            <img
                            src={config.images?.homeOffice || '/assets/placeholder.svg'} 
                            alt={`$our main office at {config.locations[0].name}`} />
                        </div>
                        <p className="photo-caption">Our {config.locations[0].name} main office, where it all started in {config.customer.established}.</p>
                    </div>
                </div>

                <hr className="sep" />

                <h2>The Team</h2>
                <p>Fourteen people keep {config.customer.city} running: two dentists, our hygiene team, dental assistants, and the front-desk staff who greet you by name.</p>
                <div className="photo-frame" style={{
        maxWidth: '620px'
      }}>
                    <img
                    src={config.images?.aboutTeam || '/assets/placeholder.svg'} 
                    alt={`${config.customer.name} team`}
                    />
                </div>
                <p className="photo-caption">Some of the team at our {config.locations[0].name} office.</p>

                <div className="bio-row">
                    <div className="bio-photo">
                        <div className="photo-frame">
                            <img 
                            src={config.images?.aboutPatel || '/assets/placeholder.svg'}
                            alt="Dr. Anjali Patel, DDS" />
                        </div>
                    </div>
                    <div className="bio-text">
                        <h3>Dr. Anjali Patel, DDS</h3>
                        <p className="bio-role">Practice Principal</p>
                        <p>
                            Dr. Patel earned her Doctor of Dental Surgery degree from The Ohio State University
                            in 2007 and founded {config.customer.name} in {config.customer.established}. She has a special interest in
                            restorative and cosmetic work, and sees patients at our Maple Ridge and Fairview
                            offices.
                        </p>
                    </div>
                </div>

                <div className="bio-row">
                    <div className="bio-photo">
                        <div className="photo-frame">
                            <img
                            src={config.images?.aboutFeld || '/assets/placeholder.svg'}
                            alt="Dr. Marcus Feld, DMD" />
                        </div>
                    </div>
                    <div className="bio-text">
                        <h3>Dr. Marcus Feld, DMD</h3>
                        <p className="bio-role">General Dentist</p>
                        <p>
                            A vital part of our team since 2019, 
                            Dr. Marcus is a 2016 Case Western graduate who provides comprehensive general and family dentistry.
                            He also leads most of our children’s dental work.
                            If you or your little ones get a bit anxious about dental visits, you are in the best hands.
                        </p>
                    </div>
                </div>

                <div className="bio-row">
                    <div className="bio-photo">
                        <div className="photo-frame">
                            <img
                            src={config.images?.aboutDenise || '/assets/placeholder.svg'}
                            alt="Denise Kowalczyk at the front desk" />
                        </div>
                    </div>
                    <div className="bio-text">
                        <h3>Denise Kowalczyk</h3>
                        <p className="bio-role">Office Manager</p>
                        <p>
                            Denise has been with {config.customer.city} since our first year and runs the front desk —
                            scheduling, insurance questions, billing, and just about everything adjacent to it.
                            If you&rsquo;ve ever called one of our offices, there&rsquo;s a good chance
                            you&rsquo;ve already talked to her.
                        </p>
                    </div>
                </div>
            </div>
        </>;
}