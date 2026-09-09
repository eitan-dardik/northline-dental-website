import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import LocationsTable from '../components/LocationsTable';

const WAITING_ROOM_URL = 'https://images.hostinger.com/5ebc1a5c-6bd0-4644-8403-e85ee880e385.png';

export default function HomePage() {
    return (
        <>
            <Helmet>
                <title>Northline Dental Group — Family &amp; Cosmetic Dentistry in Northline, Ohio</title>
                <meta
                    name="description"
                    content="Comfortable, honest dentistry for the whole family. Northline Dental Group has served the Northline area since 2011."
                />
            </Helmet>

            <div className="banner">
                <h1>Comfortable, honest dentistry for the whole family.</h1>
                <p>
                    Family &amp; cosmetic dentistry for neighbors across the Northline area. Proudly serving the
                    community since 2011.
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
                        <h2>Welcome to Northline Dental Group</h2>
                        <p>
                            Since 2011, Northline Dental Group has cared for families across the Northline area
                            with comfortable, honest dentistry. Whether you&rsquo;re due for a cleaning, thinking
                            about Invisalign, or need a crown in a hurry, our team takes the time to explain your
                            options and treat you like a neighbor — because you are one.
                        </p>
                        <p>
                            New patients are always welcome, and we accept most major insurance plans. Our team
                            makes every visit straightforward, comfortable, and personal.
                        </p>
                    </div>
                    <div className="col-photo">
                        <div className="photo-frame">
                            <img src={WAITING_ROOM_URL} alt="The waiting room at our Maple Ridge main office" />
                        </div>
                        <p className="photo-caption">The waiting room at our Maple Ridge main office.</p>
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
