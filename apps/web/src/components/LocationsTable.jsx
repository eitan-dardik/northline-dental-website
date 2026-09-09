import React from 'react';
import config from '../../../../landing-template/config.json';

// Format the hours array into the expected string layout
function formatHours(hoursArray) {
    if (!hoursArray || hoursArray.length === 0) return '';
    
    return hoursArray
        .map((h) => {
            const timeStr = `${h.days} ${h.open.replace(/^0/, '')}–${h.close.replace(/^0/, '')}`;
            if (h.frequency === 'monthly' && h.occurrences) {
                return `${timeStr} (first and third Saturday)`;
            }
            return timeStr;
        })
        .join(' · ');
}

// Re-exported so SiteLayout.jsx and any other components continue to work
export const LOCATIONS = config.locations.map((loc) => ({
    id: loc.id,
    name: loc.primary ? `${loc.name} main office` : loc.name,
    address: loc.address,
    phone: loc.phone,
    hours: formatHours(loc.hours),
}));

export default function LocationsTable() {
    return (
        <table className="locations-table">
            <tbody>
                {LOCATIONS.map((loc) => (
                    <tr key={loc.id || loc.name}>
                        <td className="loc-name">{loc.name}</td>
                        <td className="loc-addr">{loc.address}</td>
                        <td className="loc-phone">{loc.phone}</td>
                        <td>{loc.hours}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}