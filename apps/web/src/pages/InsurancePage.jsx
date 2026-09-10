import React from 'react';
import { Helmet } from 'react-helmet';
import config from '../../../../landing-template/config.json';

export default function InsurancePage() {
    return (
        <>
            <Helmet>
                <title>Insurance &amp; Payment — {config.customer.name}</title>
                <meta
                    name="description"
                    content={'${config.customer.name} helps patients understand their insurance benefits, files claims, and offers flexible payment options.'}
                />
            </Helmet>

            <div className="content">
                <h1>Insurance &amp; Payment</h1>

                <div className="callout">
                    <p>
                        We&rsquo;re happy to help you understand your coverage and file insurance claims on your behalf.{' '}
                        <a href="https://insurance.example.com/dental-benefits" target="_blank" rel="noreferrer">
                            View insurance benefit information outside our website &raquo;
                        </a>
                    </p>
                </div>

                <h2>Insurance</h2>
                <p>
                    As a courtesy, we file all insurance claims for you and help you make the most of your
                    benefits. Please bring your insurance card to your first visit, and let us know if your
                    coverage changes.
                </p>
                <p>
                    Every plan is a little different, and coverage can vary even within the same insurer. If you
                    have questions about your specific plan, call the office — Denise or one of our front-desk
                    team will be glad to check your benefits before your appointment.
                </p>

                <h2>Payment Options</h2>
                <p>
                    Payment is due at the time of service. We accept cash, personal checks, and all major credit
                    cards. For larger treatment plans, ask us about payment arrangements — we&rsquo;ll do our
                    best to work with your budget.
                </p>

                <h2>No Insurance?</h2>
                <p>
                    You&rsquo;re still welcome here. Ask our front desk about options for patients without
                    dental insurance — we believe cost shouldn&rsquo;t keep anyone from a healthy smile.
                </p>
            </div>
        </>
    );
}
