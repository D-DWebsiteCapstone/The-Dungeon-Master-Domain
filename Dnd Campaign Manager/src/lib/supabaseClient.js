// import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// export const supabase = createClient(supabaseUrl, supabasePublishableKey)

//This is to help with an issue I am hitting that is causing the data to hiccup
//when trying to access the supabase client from other files

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly point to your .env.local in the project root
dotenv.config({ path: path.resolve('../.env.local') });

const supabaseUrl =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL
    ? import.meta.env.VITE_SUPABASE_URL
    : process.env.VITE_SUPABASE_URL;

const supabaseKey =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY
    ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    : process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
