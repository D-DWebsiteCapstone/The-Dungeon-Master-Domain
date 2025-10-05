// //This will be a file to make multiple functions for the database

// Modified with help from AI to fix enviroment variable loading issue sperately just
// case it doesn't work and I dont want to pull from previous commits.
// Functions.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env' }); // make sure Node loads your env first

import { supabase } from './lib/backendSupabaseClient.js';

// Test credentials
const username = "Damien";
const password = "VerysecurePa55w.rd";

// User login validation function
async function validateUsername(username, password) {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .eq('username', username)
      .eq('userpassword', password)
      .single();

    if (error) {
      console.error('Error fetching user:', error.message);
      return false;
    }

    if (!data) {
      console.error('User not found');
      return false;
    }

    return data.username === username && data.userpassword === password;
  } catch (error) {
    console.error('Error validating user:', error.message);
    return false;
  }
}

// Run test immediately if file is executed directly
if (process.argv[1].includes('Functions.js')) {
  (async () => {
    const result = await validateUsername(username, password);
    console.log('Login valid:', result);
  })();
}

const testlogin = validateUsername(username, password);
export { validateUsername, testlogin };