import { createClient } from '@supabase/supabase-js';

// Supabase requires strings for initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fnrhhsdnlcbxdzodsfca.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucmhoc2RubGNieGR6b2RzZmNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MzY4MjIsImV4cCI6MjA5MTExMjgyMn0.c5yLu5mRHyiqctYOSRBHVif5KUeDn9o9gOl5yaEFEwo';

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
