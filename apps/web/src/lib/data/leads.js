import { getSupabase } from './supabase.js';

// Exports submitLead(lead), which inserts one row into leads and returns { error }.
export async function submitLead(lead){
    const supabase = getSupabase();
    //true when it's null = no client for supabase so return an error
    if (!supabase){
        const error = new Error('Supabase is not configured: a site setting is missing');
        console.error(error);                   //Actual Postgres error in DevTool
        return { error };                       // same shape as a database error, so the form handles it the same way
    }
    
    //the normal path- Supabase answers with an object like { data, error }
    const { error } = await supabase.from('leads').insert(lead); //destructuring pulls out just the error part. If the insert worked, error is null.
    if (error) {
        console.error(error);   //Actual Postgres error in DevTools
    }
    return { error }; 
}
