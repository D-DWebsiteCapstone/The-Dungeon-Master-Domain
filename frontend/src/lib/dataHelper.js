import { apiFetch } from './api'

/*
* Backend connection to pull from the routes grabbing information from the database
*/

export async function checkLoginCredentials(username, password) {
    console.log("checkLoginCredentials() called with:", username, password);
    try {
        const response = await apiFetch("/user/login", {
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
}

