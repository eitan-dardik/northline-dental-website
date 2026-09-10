import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LOCATIONS } from './LocationsTable';
import config from '../../../../landing-template/config.json';

const FACEBOOK_URL = 'https://www.facebook.com/NorthlineDentalGroup';

const NAV_ITEMS = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/insurance', label: 'Insurance' },
    { to: '/contact', label: 'Contact' },
];

export default function SiteLayout() {
    return (
        <div className="page-wrap">
            <header className="site-header">
                <Link to="/" className="logo">
                    <img src={config.brand.logo} alt="Northline Dental Group" width="240" height="90" />
                </Link>
                <div className="header-right">
                    <p className="header-tag">Family &amp; Cosmetic Dentistry</p>

                    <p className="header-sub">Family care since 2011</p>
                </div>
            </header>

            <nav className="main-nav">
                <ul>
                    {NAV_ITEMS.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => (isActive ? 'active' : undefined)}
                            >
                                {item.label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <main>
                <Outlet />
            </main>

            <footer className="site-footer">
                <div className="footer-cols">
                    <div>
                        <h4>Northline Dental Group</h4>
                        <p>Comfortable, honest dentistry for the whole family.</p>
                    </div>
                    <div>
                        <h4>Insurance &amp; Payment</h4>
                        <p>We accept most major insurance plans.</p>
                    </div>
                </div>
            </footer>
            <div className="footer-bottom">
                © 2017 Northline Dental Group · All rights reserved ·{' '}
                <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer">
                    Find us on Facebook
                </a>
            </div>
        </div>
    );
}
