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

// Fetch rules (rules text + pdf) for a campaign
export async function fetchRules(campaignId) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch(`/data/campaign/${campaignId}/rules`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(result?.message || ('Rules fetch failed with status ' + response.status));
    }

    return result;
  } catch (error) {
    console.error('Error fetching rules:', error);
    return null;
  }
}

// Save recap text and retrieve updated PDF
export async function saveRecap(campaignId, userId, recapText) {
  console.log('saveRecap called with userId ' + userId + ' and campaignId ' + campaignId);
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch("/data/campaign/recap", {
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

// Save rules text and retrieve updated PDF
export async function saveRules(campaignId, userId, rulesText) {
  console.log('saveRules called with userId ' + userId + ' and campaignId ' + campaignId);
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch("/data/campaign/rules", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ campaignId, userId, rulesText })
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      console.log("Rules request failed:", result);
      throw new Error(result?.message || ('Rules request failed with status ' + response.status));
    }

    return result;
  } catch (error) {
    console.error('Error saving rules:', error);
    return null;
  }
}

//Fetches username
export async function fetchUsername(userId){
  const response = await apiFetch('/user/fetchUsername', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({userId})
  });
  const result = await response.json();
  return result;
}

//Fetches user email

export async function fetchEmail(userId){
  const response = await apiFetch('/user/fetchEmail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({userId})
  });
  const result = await response.json();
  return result;
}

export async function submitTicket(username, email, issue, description){
console.log("submitTroubleTicket was called for user: " + username + ".");
console.log("It used email " + email + ", and the type of issue was: " + issue + ", with the description: " + description);

const response = await apiFetch('/data/submit-ticket',{
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({username, email, issue, description})
});

const result = await response.json();
return result;

}

export async function checkShowTutorial(userId){
  const response = await apiFetch('/user/checkShowTutorial',{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({userId})
    });
    const result = await response.json();
    return result;
}

export async function disableTutorial(userId) {
  const response = await apiFetch('/user/disableTutorial', {
    method: 'POST',
    body: JSON.stringify({ userId }), 
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response) {
    console.log("I failed to disable the tutorial");
  }
  return response;
}