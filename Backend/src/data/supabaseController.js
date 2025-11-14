import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { nanoid } from 'nanoid'

// Read in environment variables
dotenv.config()
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:3000'
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badKey'

// Make database client object (does not connect until first query)
export const DBClient = createClient(SUPABASE_URL, SUPABASE_PUB_KEY)

// Maximum number of results allowed to return
const MIN_RESULTS = 1
const MAX_RESULTS = 100

export async function listCampaigns(offset, perPage) {
    // Clamp per-page value to something reasonable
    const clampedPerPage = Math.max(MIN_RESULTS, Math.min(MAX_RESULTS, perPage))

    // Do query for campaign with matching ID
  const { data, error } = await DBClient
    .from('updatedCampaign').select('id, title')
        .range(offset, offset + (clampedPerPage - 1))

    // Throw errors back to the route
    if (error) {
        console.error(error)
        throw error
    }

    // Return data
    return data
}

export async function getCampaign(campaignId) {
    // Do query for campaign with matching ID
    const { data, error } = await DBClient
    .from('updatedCampaign')
        .select()
        .eq('id', campaignId)

    // Throw errors back to the route
    if (error) {
        console.error(error)
        throw error
    }

    // Return data
    return data[0]
}

/*export async function loginUser(username, password) {
 const form = document.getElementById('loginForm');
        const resultDiv = document.getElementById('result');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('/user/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                resultDiv.textContent = JSON.stringify(result, null, 2);
            } catch (err) {
                resultDiv.textContent = 'Error: ' + err.message;
            }
        });
}*/

export async function getLogin(username, password) {
    /*const {data, error} = await DBClient 
        .from('Users').select().eq('username', username, 'password', password)

        if (error) {
            console.error(error)
            throw error
        }

        const validLogin = false;

        if (username === data.username && password === data.password) {
            validLogin = true;
        }
        return validLogin;*/
        try {
    const { data, error } = await DBClient
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
    return true;
    //return data.username === username && data.userpassword === password;
  } catch (error) {
    console.error('Error validating user:', error.message);
    return false;
  }
}

//Ban user from campaign
export function banUser(userId, campaignId) {
  const { data, error } = DBClient
  .from('bannedUsers')
  .insert([{userId, campaignId}])
  .select()

  if (userId)
  if (error) throw error;
  return data;
}

//Checks what the user's role is in a campaign
export async function checkUserRole(userId, campaignId) {
  // Returns the roleName (string) for a user in a specific campaign, or null
  // The DB column is named `roleName` in the schema — use that to avoid
  // mismatches with the PostgREST schema cache.
  const { data, error } = await DBClient
    .from('inCampaign')
    .eq('userId', userId)
    .eq('campaignId', campaignId)
    .select('Role')
    .single()

  if (error) throw error
  return data?.roleName ?? null
}

export async function insertCampaign({ id, title, joinCode, sessionRecap = null }) {
  const { data, error } = await DBClient
    .from('updatedCampaign')
    .insert([{ id, title, joinCode, sessionRecap }])
    .select()

  if (error) throw error
  return data[0]
}

export async function insertInCampaign({ userId, campaignId, role }) {
  const { data, error } = await DBClient
    .from('inCampaign')
    .insert([{ userId, campaignId, Role: role }])
    .select()

  if (error) {
    console.error('Error inserting into inCampaign:', error)
    throw error
  }

  return data?.[0] || null
}

// supabaseController.js
export async function isUserInCampaign(userId, campaignId) {
  const { data, error } = await DBClient
    .from('inCampaign')
    .select('connectionID')
    .eq('userId', userId)
    .eq('campaignId', campaignId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') throw error
  return !!data
}


export async function getCampaignByJoinCode(joinCode) {
  const { data, error } = await DBClient
    .from('updatedCampaign')
    .select('*')
    .eq('joinCode', joinCode)
    .single() // only one campaign should have this code

  if (error) {
    console.error('Error getting campaign by join code:', error)
    throw error
  }

  return data
}

export function generateJoinCode() {
  return nanoid(12)
}

export async function refreshJoinCodes() {
  try {
    // Get all campaigns
    const { data: campaigns, error } = await DBClient
      .from('updatedCampaign')
      .select('id')

    if (error) throw error
    if (!campaigns?.length) return console.log('No campaigns found to refresh join codes.')

    console.log(`Refreshing join codes for ${campaigns.length} campaigns...`)

    // For each campaign, update with a *new unique code*
    for (const campaign of campaigns) {
      const newCode = generateJoinCode()

      const { error: updateError } = await DBClient
        .from('updatedCampaign')
        .update({ joinCode: newCode })
        .eq('id', campaign.id)

      if (updateError) console.error(`Error updating joinCode for ${campaign.id}:`, updateError)
    }

    console.log('All join codes refreshed successfully.')
  } catch (err) {
    console.error('Error refreshing join codes:', err)
  }
}

// This will be for chararcter functions since they somehow got deleted during the pull request

// --- Character helpers --------------------------------------------------
// We will try to query similar to the way campaigns are queried above.

//This will be to edit character entries in the database 
// NOT FINSIHED YET need to make sure id specic character is being edited
export async function editCharacter({ id, name, image, backstory }) {
  const { data, error } = await DBClient
    .from('character')
    .update({ name, image, backstory })
    .eq('id', id)
    .select() // ← this ensures `data` is returned!

  if (error) throw error
  // data is an array of updated rows; return the single updated object for caller convenience
  return data && data[0]
}

//This will be to create the character entries in the database
export async function createCharacter({ id, name, image, backstory }) {
  const { data, error } = await DBClient
    .from('character')
    .insert([{ id, name, image, backstory }])
    .select() // ← this ensures `data` is returned!

  if (error) throw error
    return { data }
}

//this will get character by their ID or more specifically UUID
export async function getCharacterById(characterId) {
    console.log("Getting character by ID:", characterId);
    const { data, error } = await DBClient
        .from('character').select().eq('id', characterId)
    if (error) {
        console.error(error)
        console.log("No character found with that ID.");
        throw error
    }
    console.log("Character data retrieved:", data);
    return data[0]
}

//Get character by their name
export async function getCharacterByName(characterName) {
    const { data, error } = await DBClient
        .from('character').select().eq('name', characterName)
    if (error) {
        console.error(error)
        console.log("No character found with that name.");
        throw error
    }
    return data[0]
}

// Return a page of characters (offset, per-page). Mirrors listCampaigns for characters.
export async function getAllCharacters(offset = 0, perPage = 50) {
    const MIN_RESULTS = 1
    const MAX_RESULTS = 100
    const clampedPerPage = Math.max(MIN_RESULTS, Math.min(MAX_RESULTS, perPage))
    const { data, error } = await DBClient
        .from('character').select().range(offset, offset + (clampedPerPage - 1))

    if (error) {
        console.error('Error fetching characters:', error)
        throw error
    }
    return data
}

// Get character by exact image value
export async function getCharacterByImage(imageValue) {
    const { data, error } = await DBClient
        .from('character').select().eq('image', imageValue)

    if (error) {
        console.error('Error fetching character by image:', error)
        throw error
    }
    return data[0]
}

// Get character by exact backstory value
export async function getCharacterByBackstory(backstoryValue) {
    const { data, error } = await DBClient
        .from('character').select().eq('backstory', backstoryValue)

    if (error) {
        console.error('Error fetching character by backstory:', error)
        throw error
    }
    return data[0]
}
