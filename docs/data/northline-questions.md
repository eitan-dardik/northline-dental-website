# Enquiry data — five questions

Source: `07-enquiries-export.csv`, loaded into a scratch table
`inquiries_import` (every column `text`, so nothing is rejected on import).

## How the data was loaded

```sql
create table inquiries_import (
  date text, name text, phone text, email text,
  heard_about_us text, location text, notes text
);
```

```bash
docker exec -i supabase_db_northline-dental-website psql -U postgres -d postgres \
  -c "\copy inquiries_import from stdin with (format csv, header)" \
  < <path-to-csv>
```

Rows loaded: 4 (the whole file — `wc -l` shows 5 lines, one of them the header)

---

## 1. How many enquiries did each location receive?

**The SQL**

```sql
select location, count(location) 
from inquiries_import 
group by location;
```

**The result**

|location|count |
|---|---|
| Maple Ridge|3|
| Fairview|1|

**For Denise**

Maple Ridge got 3 enquiries and Fairview got 1.

**Can she trust it?**

Partly. Assumptions and limits:
1. The location recorded is assumed to be the practice the patient contacted. That fits a walk-in, but two enquiries came from Facebook, where it is not obvious how a location gets assigned.
2. Sample Size - four records is too few to show which location is actually busier.

---

## 2. How many enquiries arrived in each month?

**The SQL**

```sql
with parsed as (

  select *,
    case
      when date ~ '^\d{4}-\d{2}-\d{2}$' then to_date(date, 'YYYY-MM-DD')
      when date ~ '^\d{2}/\d{2}/\d{4}$' then to_date(date, 'MM/DD/YYYY')
    end as parsed_date
  from inquiries_import

)
select to_char(parsed_date, 'Month - YY') as month, count(*) as enquiries
from parsed
group by month
order by min(parsed_date);
```

**The result**

|month|enquiries|
|---|---|
|October - 25|1|
|February - 26|1|
|March - 26|1|
|June - 26|1|

**For Denise**

Over the nine months this file covers, there were four enquiries in total — one each in October, February, March and June — which is too few to show any pattern.

**Can she trust it?**

Partly. The dates in the data are entered in different formats.
Two of the four enquiries are clearly US `MM/DD/YYYY`, because their day
value is above 12. A third uses the same slash format but is ambiguous
(`03/01/2026` could be 1 March or 3 January); I have read it as US order,
consistent with the two that can be confirmed and with Northline being a
US practice. The fourth is `YYYY-MM-DD`, the international standard,
which is unambiguous.

The query picks a format per row by testing the shape of the text first,
and I checked that all four rows parsed to the dates I expected.


---

## 3. Which five channels ("how did you hear about us") bring the most enquiries?

**The SQL**

```sql
select heard_about_us as channel, count(*) as enquiries
from inquiries_import
group by heard_about_us
order by enquiries desc
limit 5;
```

**The result**

|channel|enquiries|
|---|---|
|facebook|2|
|friend|1|
|Walk-In|1|

**For Denise**

Two of the four enquiries came from Facebook, one from a friend's recommendation, and one was a walk-in.

**Can she trust it?**

Partly. The counts are accurate, but four enquiries cannot rank anything —
the top channel has two.

The question asks for five channels; the data contains three (facebook,
friend, Walk-In). I kept `limit 5` so the query still works when there is
more data.

Capitalization is inconsistent (`Walk-In` against `facebook` and `friend`).
Nothing is being miscounted today, but as soon as someone types `Facebook`
it would be counted as a separate channel from `facebook`. A fixed list of
options at the point of entry would prevent this.

---

## 4. What percentage of enquiries have no email address?

**The SQL**

```sql
select round(100.0 * count(*) filter (where email is null or trim(email) = '') / count (*),2) as percent 
from inquiries_import;
```

**The result**

25.00

**For Denise**

1 of 4 enquiries has no email address (25%)

**Can she trust it?**

Partly. 
Sample size of 4 can be varied significantly be even one inquiry.
The query treats an empty string or a space as "no email", not just a NULL
value, because a blank field in the CSV could be loaded as an empty string rather
than as NULL.

It only checks whether something was entered, not whether it is a working
address. A value can look like an email and still be mistyped or out of date.

---

## 5. Which day of the week gets the most enquiries?

**The SQL**

```sql
with parsed as (

  select *,
    case
      when date ~ '^\d{4}-\d{2}-\d{2}$' then to_date(date, 'YYYY-MM-DD')
      when date ~ '^\d{2}/\d{2}/\d{4}$' then to_date(date, 'MM/DD/YYYY')
    end as parsed_date
  from inquiries_import

)
select to_char(parsed_date, 'FMDay') as day_of_the_week, count(*) as enquiries
from parsed
group by day_of_the_week
order by count(*) desc;
```

**The result**

| day_of_the_week| enquiries|
|---|---|
| Monday| 1|
| Wednesday| 1|
| Saturday| 1|
| Sunday| 1|

**For Denise**

The four enquiries each came in on a different day of the week, so there's no busiest day in this data.

**Can she trust it?**

No.

Four enquiries spread across four days cannot show which day is busiest —
every day has a count of one, so there is nothing to compare.

Worse, the answer depends on an assumption. The weekday is derived from the
date, and one date is ambiguous. Read as US month-first, `03/01/2026` is
1 March, a Sunday, and all four enquiries land on different days. Read as
day-first, it is 3 January, a Saturday — which would join `02/28/2026`
(also a Saturday) and make Saturday the busiest day with two. The same four
records give two different answers depending on which format I assume.

I have read it as US format, consistent with Northline being a US practice
and with the two slash dates whose format can be confirmed. But that is a
decision I made, not something the data tells me.


---
