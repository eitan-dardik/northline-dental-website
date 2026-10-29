// The only place content is read (Supabase stays in lib/data)
//loadContent() runs the four queries in parallel and returns the content, or throws one error
import { getSupabase } from './supabase.js';

function readLocations (supabase, signal) {
    return supabase
    .from('locations')
    .select('*, location_hours(*)')
    .eq('active', true)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'location_hours' })
    .abortSignal(signal);

}

function readTeam (supabase, signal) {
    return supabase
    .from('team_members')
    .select('*, locations(id, name, sort_order)')
    .eq('locations.active', true)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'locations' })
    .abortSignal(signal);

}

function readServices (supabase, signal) {
    return supabase
    .from('services')
    .select('*')
    .order('sort_order')
    .abortSignal(signal);

}

function readNotice (supabase, signal) {
    return supabase
    .from('site_notice')
    .select('*')
    .eq('active', true)
    .abortSignal(signal)
    .maybeSingle();      // it changes the result's shape, so I put it at the end
    
}

// The loader function
export async function loadContent() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not configured: a site setting is missing');

  const signal = AbortSignal.timeout(8000);              // one 8-second limit, shared by all four
  const [locations, team, services, notice] = await Promise.all([
    readLocations(supabase, signal),
    readTeam(supabase, signal),
    readServices(supabase, signal),
    readNotice(supabase, signal),
  ]);

    // supabase-js returns { error } instead of throwing, so check each one
  for (const result of [locations, team, services, notice]) {
    if (result.error) throw result.error;
  }

  // An empty list with no error almost always means a missing select policy
  if (locations.data.length === 0) {
    throw new Error('No locations returned: check the select policy on locations');
  }

  return {
    locations: locations.data,
    team: team.data,
    services: services.data,
    notice: notice.data,          // an object, or null when there's no active notice
  };
}