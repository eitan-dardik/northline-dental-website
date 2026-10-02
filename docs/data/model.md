# Northline database model

This explains the `leads` table: what it stores, the rules that protect it,
and how the website is allowed to use it.

## 1. Table, row, column
**In my words:**
A table is a way to store information by using attributes (columns). Values inserted to the table create a row. inside a row each value belong to a separate column.
This is called Relational Database.
**In our project:**
The leads table with columns like Name, Phone etc is located inside public "folder" (schema) database. 
the database itself is written in PostgreSQL and is stored and access from a docker container run by a tool called Supabase.
The instructions for building the table is called schema and are built from migration files stored at supabase/migrations/ 
The rows (values) are at the moment not saved to file anywhere. 
**What would go wrong without it:**
with the migration files - we will get an empty database with no table every time we will try to run npx supabase start
without supabase we won't have any database server to work with so the form will fail to send and leads wont be collected.

## 2. Data type
**In my words:**
Each column in a table has to have a type associated with it, so that a value can be correctly added to it. 
It is a syntax problem but moreover a conceptual problem. 
working with the wrong data type can cause problems accessing and writing to the table. for example numbers could be interpreted as text so sums are not possible.
**In our project:**
in the first migration file the command for creating the table consist of declaring each column name and data type so Name is text while crated_at is timestamptz.
phone are regraded as text because people often use - () + . and space. also it can start with a zero. 
**What would go wrong without it:**
the date column is text type. so any type of string can be added to it. and there is no one date format for it either. 
so right now date has to be validated and normalized before we can use it in our queries.
phone numbers should also be validated and formatted better in form and in the db itself.

## 3. Primary key and default values
**In my words:**
The tables has to have a why to identify a specific row regardless of the values of other columns in the row. for that one of the columns is regarded as primary key it is unique across the table.
default values are a way to insert values for a column in case no other value got inserted. for example every column of "color" will default to green when creating a row unless another value was given.
**In our project:**
the primary key is the id column it is not accessible as a field by the contact form but is created automatically when the insert query is sent to the db.
it has a default gen_random_uuid() which by default put a random generated string inside each row upon creating it.
**What would go wrong without it:**
if i didn't use a primary key I'll have no reliable way to point to one specific lead. 
and if i didn't put a default value I would have to do it manually making sure it's unique across all rows. which is not easy and also could be a security concern if it's not randomize because people can assume the size of the table.
## 4. NULL vs empty text
**In my words:**
NULL is define as a undeclared value while empty text is considered a string referenced as '' with no content inside. 
In SQL an empty cell is still considered a data so functions like count(email) see it. on the other hand the same function skips NULL cell as some other queries in SQL,
so it's need to be specifically checked or referenced.
**In our project:**
The 1st migration file make sure name is type text and not null. 
while 2nd migration file alters the table so that message and location can't be NULL also.
**What would go wrong without it:**
the contact form use this: email: form.email.trim() || null
to make sure that if only spaces for input for email they will be considered as NULL before being sent. 
but if someone uses the publishable key via api call it will allow him do input empty spaces so that is a problem needed fixing. 
## 5. Constraints
**In my words:**
these are a way to control input of specific data when updating or inserting to the table. 
**In our project:**
in the 2nd migration file we put constraint named "leads_phone_or_email_required" which check if phone is not null or email is not null before excepting the insert.
and on both the migration file we used a NOT NULL constraint on some of the columns.
**What would go wrong without it:**
although the form itself has a function which checks if either is filled, we still need this in case an insert is made via the api.
without the constraint both fields will be accepted if they are null .
## 6. Migrations, seed data and scratch data
**In my words:**
migrations are a step by step blueprint on how the database should be built when running the supabase containers using the supabase start. the actual data (values=rows) isn't part of this and is kept as a seed file that will be added after the migrations are done loading. we do not put real data in this file because seed are uploaded with fake files for testing.
any change made to the database which are not save to a seed or migration file are erased when the db resets and considered scratch data.
**In our project:**
we don't have seed file only 2 migrations file under supabase/migrations/.
**What would go wrong without it:**
running either npx supabase db reset or npx supabase stop --no-backup (and then npx supabase start)- 
deletes all scratch data and changes and create the lead table fresh from the migrations file.
## 7. Roles and row level security
**In my words:**
roles allow to give access based on specific need. in supabase and postgres we seen so far 3: anon, service_role and postgres(the owner/superuser in postgres). 
RLS (row level security) is a security policy which if enabled block all access to the table rows for unauthorized roles like anon- while service_role is allowed to bypass it.
RLS can have policies to allow anon role specific access or action.
**In our project:**
alter table leads enable row level security;

create policy "anon may insert leads"
  on leads for insert
  to anon
  with check (true);
this allows anon only insert and block him the rest
**What would go wrong without it:**
in supabase the default is that anon can do all if RLS is disabled that's because it changes the default postgres way and grant anon access to table in the first place.

## 8. Publishable key vs Secret key
**In my words:**
PK is used in public and can be shown in the browser it is the way the anon is authenticated with the API. SK however is the way service_role connect to the API which means it has the ability to bypass RLS and select, delete, insert and update data in a table (if it has a grant to it in the first place).
**In our project:**
these are shown as output when running 
npx supabase status.
the PK is saved as VITE_SUPABASE_PUBLISHABLE_KEY in the apps/web/.env.local and is read in apps/web/src/lib/data/supabase.js
in order to use it in code to communicate with the supabase API.
**What would go wrong without it:**
without the PK there could be no way to authenticated with the API
which mean that supabase and the db itself are unlinked from the project.
without SK- if i work locally like now it not much of a difference because in studio I authenticate as postgres which is the superuser. but later we will move supabase to a VPS and we'll need to authenticated as admin via the APIand for that we need SK 