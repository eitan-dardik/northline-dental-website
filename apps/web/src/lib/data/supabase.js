//creates the client from the two settings in .env.local for interacting with database
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY — see .env.example');
}

const supabase = createClient(url, key);

export { supabase };