import { apiFetch } from './api'

/*
* Backend connection to pull from the routes grabbing information from the database
*/
// export async function fetchRecapFunctionality(campaignId) {
//   try {

//   } catch {

//   }
// }

export async function fetchRecap(campaignId) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch(`/Recaps/${campaignId}`, {
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

export async function deleteRecap(campaignId, recapId) {
  const res = await apiFetch(`/Recaps/${campaignId}/${recapId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  })
  return res.json()
}

export async function fetchRules(campaignId) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch(`/rules/${campaignId}`, {
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

export async function saveRule(campaignId, description) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch(`/rules/${campaignId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ description })
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      console.log('Rule request failed:', result);
      throw new Error(result?.message || ('Rule request failed with status ' + response.status));
    }

    return result;
  } catch (error) {
    console.error('Error saving rule:', error);
    return null;
  }
}

export async function editRule(campaignId, ruleId, description) {
  try {
    const token = localStorage.getItem('authToken');
    const response = await apiFetch(`/rules/${campaignId}/${ruleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ description })
    });

    const text = await response.text();
    const result = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(result?.message || ('Edit rule failed with status ' + response.status));
    }

    return result;
  } catch (error) {
    console.error('Error editing rule:', error);
    return null;
  }
}

export async function deleteRule(campaignId, ruleId) {
  try {
    const res = await apiFetch(`/rules/${campaignId}/${ruleId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return res.json();
  } catch (error) {
    console.error('Error deleting rule:', error);
    return null;
  }
}

//getting campaign role
export async function fetchUserCampaignRole(campaignId) {
  try {
    const token = localStorage.getItem('authToken');
    const res = await apiFetch(`/user/campaignRole/${campaignId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.role;
  } catch (err) {
    console.error('Error fetching campaign role: ', err);
    return null
  }
}

//getting recapFunctionality for players from database.
export async function fetchPlayerRecapFunctionality(campaignId) {
  try {
    const res = await apiFetch(`/Recaps/playerSettings/${campaignId}`);
    const data = await res.json();
    return data.allowPlayerRecaps;
  } catch (err) {
    console.error('Error fetching if players are allowed to edit/create recaps:', err);
    return false;
  }
}

//changing the reacp functionality
export async function sendPlayerRecapFunctionality(campaignId) {
  try {
    const token = localStorage.getItem('authToken')
    const res = await apiFetch(`/Recaps/playerSettings/${campaignId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    return data.allowPlayerRecaps;

  } catch {
    console.error("Error toggling player recap functionality");
    return false;
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

export async function fetchDiscordID(userId) {
  const response = await apiFetch('/user/fetchDiscordID', {
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

export async function fetchProfilePic(){
  const token = localStorage.getItem('authToken');
  const response = await apiFetch('/user/fetchProfilePic', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  const result = await response.json();
  return result;
}

export async function updateProfilePic(profilePicture) {
  const response = await apiFetch('/user/update-profile-pic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
    body: JSON.stringify({ profilePicture }),
  })

  return response.json()
}

export async function deleteProfilePic() {
  const response = await apiFetch('/user/delete-profile-pic', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`,
    },
  })
  return response.json()
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