<<<<<<< HEAD
=======
import { apiFetch } from './api'

>>>>>>> c5eef29530b4d2813f55c74ca5a0eb6c73d04e18
/*
* Backend connection to pull from the routes grabbing information from the database
*/

export async function checkLoginCredentials(username, password) {
    console.log("checkLoginCredentials() called with:", username, password);
    try {
<<<<<<< HEAD
        //const response = await fetch(`${process.env.BACKEND_URL}/user/login`, {
        const response = await fetch("https://localhost:3000/user/login", {
=======
        const response = await apiFetch("/user/login", {
>>>>>>> c5eef29530b4d2813f55c74ca5a0eb6c73d04e18
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.status === 200) {
            const result = await response.json();
            console.log("Login successful:", result);
            return result;
        } else {
            console.log("Login Failed:", result);
            throw new Error('Login request failed with status ' + response.status);
        }
    } catch (error) {
        console.error('Error during login request:', error);
        return null;
    }
}

<<<<<<< HEAD
export async function recap(campaignId, userId){
    console.log('recap function called with userId ' + userId + ' and campaignId ' + campaignId);
    try{
       const response = await fetch("https://localhost:3000/data/campaign/notes", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId, userId })
        }); 

        if (response.status === 200) {
            const result = await response.json();
            console.log("Recap Opened:", result);
            return result;
        } else {
            console.log("Recap Did Not Opern REEEEEEEEE!:", result);
            throw new Error('Recap request failed with status ' + response.status);
        }
    }
    catch (error){
        console.error('Error during login request:', error);
        return null;
    }
=======
// Fetch recap (recap text + pdf) for a campaign
export async function fetchRecap(campaignId) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch(`/data/campaign/${campaignId}/recap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(result?.message || ('Recap fetch failed with status ' + response.status));
    }

    return result;
  } catch (error) {
    console.error('Error fetching recap:', error);
    return null;
  }
}

// Save recap text and retrieve updated PDF
export async function saveRecap(campaignId, userId, recapText) {
  console.log('saveRecap called with userId ' + userId + ' and campaignId ' + campaignId);
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch("/data/campaign/notes", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ campaignId, userId, recapText })
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      console.log("Recap request failed:", result);
      throw new Error(result?.message || ('Recap request failed with status ' + response.status));
    }

    return result;
  } catch (error) {
    console.error('Error saving recap:', error);
    return null;
  }
>>>>>>> c5eef29530b4d2813f55c74ca5a0eb6c73d04e18
}

