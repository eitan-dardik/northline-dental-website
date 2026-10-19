// this is the ONLY file that reads import.meta.env
// Vite copies each import.meta.env.VITE_... into the JavaScript at build time. 
// Write every name out in full: it is the form Vite documents, and a search for the name finds it.
const clean = (value) => (value ?? '').trim();

export const env = {
  supabaseUrl:            clean(import.meta.env.VITE_SUPABASE_URL),
  supabasePublishableKey: clean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
  umamiScriptUrl:         clean(import.meta.env.VITE_UMAMI_SCRIPT_URL),
  umamiWebsiteId:         clean(import.meta.env.VITE_UMAMI_WEBSITE_ID),
};