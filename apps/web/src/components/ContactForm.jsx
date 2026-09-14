import React, { useState } from 'react';
import { ACTIVE_LOCATIONS } from '../lib/locations';
import { telHref } from '../lib/format';
import config from '../../../../landing-template/config.json';

const EMPTY_FORM = { name: '', phone: '', email: '', location: '', message: '' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s()-]{7,20}$/;

// TEMPORARY placeholder. Part 6 only builds the database — wiring this
// form to it is Week 4's job. This always "fails" for now, so the error
// state below is visible and testable today. In Week 4, replace the
// body of this function with a real
//   supabase.from('leads').insert(lead)
// call. Nothing else in this component needs to change — the form,
// validation, and error/success UI don't know or care how this works.
async function submitLead(lead) {
	return { error: new Error('Not wired to a database yet') };
}

function validate(values) {
	const errors = {};

	const nameParts = values.name.trim().split(/\s+/).filter(Boolean);
	if (nameParts.length < 2) {
		errors.name = 'Please enter your first and last name.';
	}

	if (values.email.trim() && !EMAIL_RE.test(values.email.trim())) {
		errors.email = 'Please enter a valid email address.';
	}

	if (values.phone.trim() && !PHONE_RE.test(values.phone.trim())) {
		errors.phone = 'Please enter a valid phone number.';
	}

	if (!values.location) {
		errors.location = 'Please select a location.';
	}

	if (!values.message.trim()) {
		errors.message = 'Please tell us how we can help.';
	}

	if (!values.phone.trim() && !values.email.trim()) {
		errors.contact = 'Please provide a phone number or email so we can reach you.';
	}

	return errors;
}

export default function ContactForm() {
	const [form, setForm] = useState(EMPTY_FORM);
	const [status, setStatus] = useState('idle'); // idle | submitting | success | error
	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => {
			if (!prev[name] && !((name === 'phone' || name === 'email') && prev.contact)) return prev;
			const next = { ...prev };
			delete next[name];
			if (name === 'phone' || name === 'email') delete next.contact;
			return next;
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const validationErrors = validate(form);
		setErrors(validationErrors);
		if (Object.keys(validationErrors).length > 0) return;

		setStatus('submitting');

		const { error } = await submitLead({
			name: form.name.trim(),
			phone: form.phone.trim() || null,
			email: form.email.trim() || null,
			location: form.location || null,
			message: form.message.trim() || null,
			source: 'contact-page',
		});

		if (error) {
			setStatus('error');
			return;
		}

		setStatus('success');
		setForm(EMPTY_FORM);
	};

	if (status === 'success') {
		return (
			<div className="callout">
				<p>Thanks — we&rsquo;ve got your message and will be in touch soon.</p>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className="contact-form" noValidate>
			<div className="form-row">
				<label htmlFor="name">Name</label>
				<input id="name" name="name" type="text" value={form.name} onChange={handleChange} />
				{errors.name && <p className="form-error">{errors.name}</p>}
			</div>
			<div className="form-row">
				<label htmlFor="phone">Phone</label>
				<input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
				{errors.phone && <p className="form-error">{errors.phone}</p>}
				{errors.contact && <p className="form-error">{errors.contact}</p>}
			</div>
			<div className="form-row">
				<label htmlFor="email">Email</label>
				<input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
				{errors.email && <p className="form-error">{errors.email}</p>}
				{errors.contact && <p className="form-error">{errors.contact}</p>}
			</div>
			<div className="form-row">
				<label htmlFor="location">Preferred location</label>
				<select id="location" name="location" value={form.location} onChange={handleChange}>
					<option value="">Select a location</option>
					{ACTIVE_LOCATIONS.map((loc) => (
						<option key={loc.id} value={loc.name}>{loc.name}</option>
					))}
				</select>
				{errors.location && <p className="form-error">{errors.location}</p>}
			</div>
			<div className="form-row">
				<label htmlFor="message">How can we help?</label>
				<textarea id="message" name="message" value={form.message} onChange={handleChange} rows={4} />
				{errors.message && <p className="form-error">{errors.message}</p>}
				<p className="field-hint">
					Please don&rsquo;t include medical or symptom details here — we&rsquo;ll go over that
					when we call you back.
				</p>
			</div>

			{status === 'error' && (
				<p className="form-error">
					We're sorry — something went wrong and we couldn't save your message. Please call us at{' '}
					<a href={telHref(config.contact?.fallback_phone)}>{config.contact?.fallback_phone}</a>{' '}
					instead.
				</p>
			)}

			<button type="submit" className="btn" disabled={status === 'submitting'}>
				{status === 'submitting' ? 'Sending…' : 'Send message'}
			</button>
		</form>
	);
}