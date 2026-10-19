//No crash before React starts, so no white page (throw) while the page is loading
import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let client = null;
//this creates a client for supabase if it can't it returns null
export function getSupabase() {
  if (!env.supabaseUrl || !env.supabasePublishableKey) return null;   // missing setting: the caller shows the failure
  if (!client) client = createClient(env.supabaseUrl, env.supabasePublishableKey);
  return client;
}