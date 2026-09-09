import React from 'react';

export const LOCATIONS = [
    {
        name: 'Maple Ridge main office',
        address: '1847 Maple Ridge Road, Suite 200, Northline OH 44094',
        phone: '(440) 555-0140',
        hours: 'Mon–Thu 8:00–5:00 · Fri 8:00–2:00 · Sat 9:00–1:00 (first and third Saturday)',
    },
    {
        name: 'Fairview',
        address: '92 Fairview Crossing, Northline OH 44095',
        phone: '(440) 555-0161',
        hours: 'Mon–Fri 9:00–5:00',
    },
    {
        name: 'Grandon',
        address: '14 Grandon Street, Grandon OH 44099',
        phone: '(440) 555-0178',
        hours: 'Tue, Wed, Thu 9:00–4:00',
    },
];

export default function LocationsTable() {
    return (
        <table className="locations-table">
            <tbody>
                {LOCATIONS.map((loc) => (
                    <tr key={loc.name}>
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
