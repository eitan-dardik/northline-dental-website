/*exports submitLead(lead), which calls
supabase.from('leads').insert(lead) and returns { error } */
import { supabase } from './supabase.js';

export async function submitLead(lead){
    const { error } = await supabase
    .from('leads')
    .insert(lead)
if (error) console.error(error)
    return { error }; //output actual Postgres error in the console
}
