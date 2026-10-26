begin;
-- ... delete content tables, children before parents
delete from team_member_locations;
delete from location_hours;
delete from locations;
delete from team_members;
delete from services;
delete from site_notice;

insert into locations (id, name, is_primary,  active, address, phone, sort_order) values
  ('maple-ridge', 'Maple Ridge', true,    true, '1847 Maple Ridge Road, Suite 200, Northline OH 44094', '+1-440-555-0140', 1),
  ('fairview',    'Fairview',    false,   true, '92 Fairview Crossing, Northline OH 44095', '+1-440-555-0161', 2),
  ('grandon',      'Grandon',    false,   true, '14 Grandon Street, Grandon OH 44099', '+1-440-555-0178' , 3);

insert into location_hours (location_id, days, opens, closes, occurrences, sort_order) values
  ('maple-ridge',       'Mon-Thu',        '08:00',    '17:00',     null,     1),
  ('maple-ridge',       'Fri',            '08:00',    '14:00',     null,     2),
  ('maple-ridge',       'Sat',            '09:00',    '13:00',    '{1,3}',   3),
  ('fairview',          'Mon,Wed,Fri',    '08:30',    '17:30',     null,     1),
  ('fairview',          'Tue, Thu',       '08:30',    '19:00',     null,     2),
  ('grandon',           'Mon-Thu',        '09:00',    '16:00',     null,     1);

insert into team_members (id, name, role, image_key, sort_order, bio) values
  ('patel',  'Dr. Anjali Patel, DDS', 'Practice Principal', 'aboutPatel',  1, 'Dr. Patel earned her Doctor of Dental Surgery degree from The Ohio State University in 2007 and founded Northline Dental Group in 2011. She has a special interest in restorative and cosmetic work.'),
  ('feld',   'Dr. Marcus Feld, DDS',  'General Dentist',    'aboutFeld',   2, 'A vital part of our team since 2019, Dr. Marcus is a 2016 Case Western graduate who provides comprehensive general and family dentistry. He also leads most of our children''s dental work. If you or your little ones get a bit anxious about dental visits, you are in the best hands.'),
  ('denise', 'Denise Kowalczyk',       'Office Manager',    'aboutDenise', 3, 'Denise has been with Northline since our first year and runs the front desk — scheduling, insurance questions, billing, and just about everything adjacent to it. If you''ve ever called one of our offices, there''s a good chance you''ve already talked to her.');

insert into team_member_locations (team_member_id, location_id) values
  ('patel', 'maple-ridge'),
  ('patel', 'fairview'),
  ('feld', 'grandon'),
  ('feld', 'fairview');

insert into services (id, name, sort_order, description) values
  ('general-dentistry',   'General dentistry',         1, 'Complete exams, digital X-rays, oral cancer screenings, and honest treatment planning for the whole family.'),
  ('cleanings-hygiene',   'Cleanings and hygiene',     2, 'Gentle, thorough cleanings from our hygiene team, plus practical advice for keeping your smile healthy between visits.'),
  ('fillings',            'Fillings',                  3, 'Tooth-colored composite fillings that blend in naturally and restore strength to decayed or damaged teeth.'),
  ('crowns-bridges',      'Crowns and bridges',        4, 'Durable, natural-looking crowns and bridges to repair broken teeth and replace missing ones.'),
  ('root-canal',          'Root canal treatment',      5, 'Comfortable root canal therapy that relieves pain and saves your natural tooth.'),
  ('extractions',         'Extractions',               6, 'Gentle tooth extractions — including troublesome wisdom teeth — with clear aftercare instructions.'),
  ('teeth-whitening',     'Teeth whitening',           7, 'Professional whitening that brightens your smile several shades, safely and quickly.'),
  ('invisalign',          'Invisalign clear aligners', 8, 'Straighten your teeth discreetly with clear, removable aligners. Ask us whether Invisalign is right for you.'),
  ('emergency',           'Emergency appointments',    9, 'Toothache, chipped tooth, or lost filling? Call us — we reserve time every business day for dental emergencies.'),
  ('childrens-dentistry', 'Children''s dentistry',     10, 'Friendly first visits and gentle care that helps kids grow up unafraid of the dentist.');

insert into site_notice (active, heading, body, until) values
  (true, 'Important Notice', 'Fairview is closed until next week','10/21/2026');

commit;