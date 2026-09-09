import React from 'react';
import { Helmet } from 'react-helmet';
const EXTERIOR_URL = 'https://images.hostinger.com/155c700e-8e59-453a-ae14-89ce8b66a91c.png';
const TEAM_URL = 'https://images.hostinger.com/6f3d27b7-d060-4423-a982-d6c8d11ab14f.png';
const PATEL_URL = 'https://images.hostinger.com/4cf2be9d-0d63-4cae-af09-f719b3574355.png';
const TOOTHLESS_URL = 'https://images.hostinger.com/41dc4e0e-650e-45c2-a193-c443ee23ea48.png';
const DENISE_URL = 'https://images.hostinger.com/1f2442f1-75b4-4c7c-8467-eac2bcc05720.png';
export default function AboutPage() {
  return <>
            <Helmet>
                <title>About Us — Northline Dental Group</title>
                <meta name="description" content="Founded in 2011 by Dr. Anjali Patel, Northline Dental Group is a fourteen-person team providing family and cosmetic dentistry at three Northline-area locations." />
            </Helmet>

            <div className="content">
                <h1>About Us</h1>

                <div className="two-col">
                    <div className="col-text">
                        <h2>Our Practice</h2>
                        <p>
                            Northline Dental Group was founded in 2011 by Dr. Anjali Patel, who wanted to build
                            the kind of practice she&rsquo;d want for her own family: unhurried appointments,
                            plain-spoken advice, and treatment plans that respect your budget.
                        </p>
                        <p>
                            What began as a single office on Maple Ridge Road has grown to three locations —
                            Maple Ridge, Fairview, and Grandon — but the idea hasn&rsquo;t changed: comfortable,
                            honest dentistry for the whole family.
                        </p>
                    </div>
                    <div className="col-photo">
                        <div className="photo-frame">
                            <img src={EXTERIOR_URL} alt="Our Maple Ridge main office on Maple Ridge Road" />
                        </div>
                        <p className="photo-caption">Our Maple Ridge main office, where it all started in 2011.</p>
                    </div>
                </div>

                <hr className="sep" />

                <h2>The Team</h2>
                <p>Fourteen people keep Northline running: two dentists, our hygiene team, dental assistants, and the front-desk staff who greet you by name.</p>
                <div className="photo-frame" style={{
        maxWidth: '620px'
      }}>
                    <img src={TEAM_URL} alt="The Northline Dental Group team in the hallway of our Maple Ridge office" />
                </div>
                <p className="photo-caption">Some of the team at our Maple Ridge office, spring 2017.</p>

                <div className="bio-row">
                    <div className="bio-photo">
                        <div className="photo-frame">
                            <img src={PATEL_URL} alt="Dr. Anjali Patel, DDS" />
                        </div>
                    </div>
                    <div className="bio-text">
                        <h3>Dr. Anjali Patel, DDS</h3>
                        <p className="bio-role">Practice Principal</p>
                        <p>
                            Dr. Patel earned her Doctor of Dental Surgery degree from The Ohio State University
                            in 2007 and founded Northline Dental Group in 2011. She has a special interest in
                            restorative and cosmetic work, and sees patients at our Maple Ridge and Fairview
                            offices.
                        </p>
                    </div>
                </div>

                <div className="bio-row">
                    <div className="bio-photo">
                        <div className="photo-frame">
                            <img src={TOOTHLESS_URL} alt="Dr. Roy Toothless, DDS" />
                        </div>
                    </div>
                    <div className="bio-text">
                        <h3>Dr. Roy Toothless, DDS</h3>
                        <p className="bio-role">General Dentist</p>
                        <p>
                            Dr. Toothless earned his dental degree from Case Western Reserve University in 2001
                            and joined Northline in 2014. He focuses on family and preventive dentistry, and has
                            a real knack for putting nervous patients — kids especially — at ease. He sees
                            patients at our Grandon and Fairview offices.
                        </p>
                    </div>
                </div>

                <div className="bio-row">
                    <div className="bio-photo">
                        <div className="photo-frame">
                            <img src={DENISE_URL} alt="Denise Kowalczyk at the front desk" />
                        </div>
                    </div>
                    <div className="bio-text">
                        <h3>Denise Kowalczyk</h3>
                        <p className="bio-role">Office Manager</p>
                        <p>
                            Denise has been with Northline since our first year and runs the front desk —
                            scheduling, insurance questions, billing, and just about everything adjacent to it.
                            If you&rsquo;ve ever called one of our offices, there&rsquo;s a good chance
                            you&rsquo;ve already talked to her.
                        </p>
                    </div>
                </div>
            </div>
        </>;
}