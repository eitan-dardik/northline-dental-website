# Data quality — `07-enquiries-export.csv`

Every column in `inquiries_import` is `text`, so nothing was rejected on
import. 
Examples below describe the shape of a problem. They do not reproduce real
names, phone numbers or email addresses from the file.

Rows in the table: <4>


---

## Problems found

### 1. Inconsistent and ambiguous date formats

| | |
|---|---|
| **Column** | date|
| **Rows affected** |4 of 4 inconsistent, 1 of 4 ambiguous |
| **Pattern** | 03/01/2026, 02/28/2026, 2026-06-17 |
| **What it breaks** | Any query grouping by month, weekday or period|
| **How I would fix it** | Store as a date column, not text. Enforce one format at entry. Validate the existing rows against the original enquiry|

### 2. Inconsistent capitalization in a free-text category 

| | |
|---|---|
| **Column** |heard_about_us |
| **Rows affected** |3 |
| **Pattern** | facebook, Walk-In|
| **What it breaks** | Nothing today, but can create duplicate values for capitalized and non capitalized facebook, Facebook ; similar values under different category i.e friend and co-worker|
| **How I would fix it** | A fixed list of options. for existing data manually use lower()+trim() in ('sample value1, '2') then 'Real category' |


### 3. Sensitive or Clinical information in a free-text field

| | |
|---|---|
| **Column** | notes|
| **Rows affected** |all |
| **Pattern** | A name of a dental procedure a person asked about|
| **What it breaks** |clinical data should not be saved in this DB it's a legal constraint |
| **How I would fix it** | Remove the column from this table. If the service requested must be captured, use a separate table of defined services linked by foreign key |

### 4. Completeness

| | |
|---|---|
| **Column** |Entire data as a whole |
| **Rows affected** |all |
| **Pattern** | 25% of rows have no email, 50% of all leads came from facebook, most busy place is XXX|
| **What it breaks** |conclusions derived from DB query may produce a biased view based on a low sample size |
| **How I would fix it** | input all available data |


### 5. Inconsistent phone formats

| | |
|---|---|
| **Column** |phone |
| **Rows affected** |4 |
| **Pattern** | (123) 456-7890, 1234567890, 123.456.7890|
| **What it breaks** | Any follow-up that dials or texts automatically, and any duplicate check — the same number written two ways looks like two people. No country code, which is acceptable for a US practice but should be stated rather than assumed|
| **How I would fix it** | Store digits only in one agreed format and format for display. Same rule as the website form |

## Personal data

| Column | Identifies a person? | Could hold something sensitive? | Must never go |
|---|---|---|---|
| `date` | X|X | |
| `name` | V|V |Repo, Screenshots,Evidence Pack,Issues and PRs, Analytics, Email subject lines , AI tools |
| `phone` | V| V|Repo, Screenshots,Evidence Pack,Issues and PRs, Analytics, Email subject lines , AI tools |
| `email` | V|V |Repo, Screenshots,Evidence Pack,Issues and PRs, Analytics, Email subject lines , AI tools |
| `heard_about_us` | X|V |Repo, Screenshots,Evidence Pack,Issues and PRs, Analytics, Email subject lines , AI tools |
| `location` | X|X| |
| `notes` | V|V |Repo, Screenshots,Evidence Pack,Issues and PRs, Analytics, Email subject lines , AI tools |

+ Name — Direct identifier.
+ Phone and Email — Direct identifiers, and also adds a second risk: if leaked, they enable someone to reach the person, not just recognize them.
+ Notes - This is the most sensitive column in the table. Under NIST, medical information is listed as linkable to an individual. Because it's free text, we can't predict what else staff have typed there.
+ Date and Location - Alone, neither identifies anyone. But when combined with the others they increase the chance of identifying someone.
+ Heard_about_us - not identifiable if it remains as a fixed list, but as a free text it can contain names or other sensitive data.
