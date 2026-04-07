import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let client = null;
try {
    // Only attempt to create client if a valid URL formatted string is provided
    if (supabaseUrl && supabaseUrl.startsWith('http') && supabaseKey) {
        client = createClient(supabaseUrl, supabaseKey);
    }
} catch {
    console.warn('Invalid Supabase configuration. Running in local fallback mode.');
}

export const supabase = client;
