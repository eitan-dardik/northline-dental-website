import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import config from '../../../../landing-template/config.json';

const NAV_ITEMS = [
    { to: '/', label: 'Home', end: true },
    { to: '/about', label: 'About Us' },
    { to: '/services', label: 'Services' },
    { to: '/insurance', label: 'Insurance' },
    { to: '/contact', label: 'Contact' },
];

export default function SiteLayout() {
    const facebook = config['social-media']?.find((s) => s.id === 'facebook');
    const facebookUrl = facebook ? facebook.link : '#';

    return (
        <div className="page-wrap">
            <header className="site-header">
                <Link to="/" className="logo">
                    <img src={config.brand.logo} alt={config.customer.name} width="240" height="90" />
                </Link>
                <div className="header-right">
                    <p className="header-tag">{config.customer.header}</p>
                    <p className="header-sub">{config.customer.subhead}</p>
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
                        <h4>{config.customer.name}</h4>
                        <p>{config.customer.tagline} since {config.customer.established}</p>
                    </div>
                    <div>
                        <h4>Insurance &amp; Payment</h4>
                        <p>We accept most major insurance plans.</p>
                    </div>
                </div>
            </footer>
            <div className="footer-bottom">
                © {new Date().getFullYear()} {config.customer.name} ·{' '}
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer">
                    Find us on Facebook
                </a>
            </div>
        </div>
    );
}
