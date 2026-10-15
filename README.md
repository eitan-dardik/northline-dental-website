# Northline Dental Group website

The new Northline Dental Group website: a React + Vite + Tailwind CSS project located in `apps/web/`, with a Supabase backend.

## Requirements

- [Node.js](https://nodejs.org/) 20.10 or newer
- [Docker Desktop](https://www.docker.com/products/docker-desktop/), running, for the local Supabase database

## Getting started

1. Clone the repo and go into it, using either the GitHub CLI:
```bash
   gh repo clone eitan-dardik/northline-dental-website
   cd northline-dental-website
```
   or git:
```bash
   git clone https://github.com/eitan-dardik/northline-dental-website.git
   cd northline-dental-website
```
2. From root folder, install dependencies:
```bash
   npm install
```

3. Start the local Supabase stack (make sure Docker Desktop is running first):
```bash
   npx supabase start
```
   The first run downloads the Docker images and takes a few minutes. It also applies the database migrations and seed data from `supabase/`.
  
4. Create your local environment file:
```bash
   cp apps/web/.env.example apps/web/.env.local
```
   Then run:
```bash
   npx supabase status
```
   and copy these values into the newly created file at `apps/web/.env.local`:
   - **Project URL** (`http://127.0.0.1:54321`) → `VITE_SUPABASE_URL`
   - **Publishable key** (`sb_publishable_...`) → `VITE_SUPABASE_PUBLISHABLE_KEY`

   Never copy the **Secret key** into `.env.local`. Anything starting with `VITE_` is visible in the browser.

5. Run the site at http://localhost:3000, either as a development server that reloads as you edit:
```bash
   npm run dev
```
   or as a preview of the production build:
```bash
   npm run build
   npm run start
```
   `npm run build` outputs to `dist/apps/web/`, which is emptied and recreated on every build.

## Check the database is working
 
1. Go to http://localhost:3000/contact, fill in the form and send it.
2. Open **Supabase Studio** at http://127.0.0.1:54323, go to **Table Editor** → `leads`, and check that your message appears as a new row.
Studio is also where you can browse the other tables, view and edit rows, and run SQL queries against your local database.
 
> **Note:** `npx supabase db reset` rebuilds the local database from the migrations in `supabase/migrations/` and deletes all data, including leads submitted through the contact form. Only data from a seed file (`supabase/seed.sql`) is added back, and the project doesn't have one yet, so the tables start empty.
>
> Changes you make in Studio are *not* saved as migrations either, so they are lost on reset too. To change the database structure, add a migration.
 
When you're done, stop Supabase with `npx supabase stop`.
 