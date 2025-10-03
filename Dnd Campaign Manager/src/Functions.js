// //This will be a file to make multiple functions for the database

// //Connect to Supabase
// //import { createClient } from '@supabase/supabase-js'

// //This is to solve the issue of it not finding the supabaseClient.js file
// import { supabase } from './lib/supabaseClient.js';



// //This section will be specifically for username and password functions

// //This is the user login validation function **INCOMPLETE and UNTESTED**

// //Need to look into maybe making a encryption function for passwords
// //could use the built in authenticator from supabase recommended by AI 
// //with built in supabase Auth API. 

// // async was added to allow for the await keyword to be used recommended by AI
// // The try and catch block was added to handle any potential errors during the async operation
// // which was also recommended by AI

// const username = "Damien";
// const password = "VerysecurePa55w.rd";

// async function validateUsername(username, password) {
//    try{
//     //Query for the given username and password
//     const { data, error } = await supabase
//     .from('users')
//     .select('*')
//     .eq('username', username)
//     .eq('userpassword', password)
//     .single(); //This is to ensure only one result is returned

//     if (error) {
//        console.error('Error fetching user:', error);
//        return false;
//     }

//     if (!data) {
//        console.error('User not found');
//        return false;
//     }

//     //Finally if everything checks out return true **Don't know if this will work**
//     if (data.username === username && data.userpassword === password) {
//          return true;
//     }


//    } catch (error) {
//        console.error('Error validating user:', error);
//        return false;
//    }
// }

// // Run test immediately if file is executed directly
// //Fix this to work with node . command
// console.log("Testing user validation function");
// validateUsername(username, password)
//    .then(isValid => {
//        console.log('Login valid:', isValid);
//    })
//    .catch(error => {
//        console.error('Error testing user validation function:', error);
//    });


// Modified with help from AI to fix enviroment variable loading issue sperately just
// case it doesn't work and I dont want to pull from previous commits.
// Functions.js
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // make sure Node loads your env first

import { supabase } from './lib/supabaseClient.js';

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
