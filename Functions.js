//This will be a file to make multiple functions for the database

//Connect to Supabase
import { createClient } from '@supabase/supabase-js'

//This section will be specifically for username and password functions

//This is the user login validation function
function validateUsername(username, password) {
    //Store string into a variable
    const str = username;
    //Look through supabase database for username *WIP*
    const validUsername = str.includes("username");
    //If username is found, return true
    if (validUsername) {
        //Here we will check directly here for the password connected to the username
        if(password === "password") {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}




