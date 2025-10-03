//This will be a file to make multiple functions for the database

//Connect to Supabase
// The supabase client lives in src/lib/supabaseClient.js; import it with a relative path from this file's location
import { supabase } from './src/lib/supabaseClient.js';

//This section will be specifically for username and password functions

//This is the user login validation function **INCOMPLETE and UNTESTED**

//Need to look into maybe making a encryption function for passwords
//could use the built in authenticator from supabase recommended by AI 
//with built in supabase Auth API. 

// async was added to allow for the await keyword to be used recommended by AI
// The try and catch block was added to handle any potential errors during the async operation
// which was also recommended by AI

async function validateUsername(username, password) {
   try{
    
      //Query for the given username and password
    const { data, error } = await supabase
    .from('Users')
    .select('*')
    .eq('username', username)
    .eq('userpassword', password)
    .single(); //This is to ensure only one result is returned

    if (error) {
      console.log("Error fetching user");
       console.error('Error fetching user:', error);
       return false;
    }

    if (!data) {
      console.log("Couldn't find user");
       console.error('User not found');
       return false;
    }

    //Finally if everything checks out return true **Don't know if this will work**
    if (data.username === username && data.userpassword === password) {
         console.log("Success. User validation is true.");
         return true;
    }
   } catch (error) {
      console.log("Error validating user");
       console.error('Error validating user:', error);
       return false;
   }
}

validateUsername("Connor", "securepassword");





