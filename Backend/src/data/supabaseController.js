import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Read in environment variables
dotenv.config()
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:3000'
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badKey'

// Make database client object (does not connect until first query)
const DBClient = createClient(SUPABASE_URL, SUPABASE_PUB_KEY)

// Maximum number of results allowed to return
const MIN_RESULTS = 1
const MAX_RESULTS = 100

export async function listCampaigns(offset, perPage) {
    // Clamp per-page value to something reasonable
    const clampedPerPage = Math.max(MIN_RESULTS, Math.min(MAX_RESULTS, perPage))

    // Do query for campaign with matching ID
    const { data, error } = await DBClient
        .from('Campaign').select('id, title')
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
        .from('Campaign').select().eq('id', campaignId)

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



export async function insertCampaign({ id, title, roleName, selectedCharacter }) {
  const { data, error } = await DBClient
    .from('Campaign')
    .insert([{ id, title, roleName, selectedCharacter }])
    .select() // ← this ensures `data` is returned!
  
  if (error) throw error
  return { data }
}

// --- Character helpers --------------------------------------------------
// These functions try to query common table name variants ('Characters' and 'characters')
// and return safe fallbacks on errors so the server doesn't crash during local dev.

const CHARACTER_TABLES = ['Characters', 'characters']

async function tryFromTables(queryBuilderFn) {
    for (const tbl of CHARACTER_TABLES) {
        try {
            const qb = DBClient.from(tbl)
            const result = await queryBuilderFn(qb)
            if (result && result.data !== undefined) return result
        } catch (err) {
            // try next table name
            console.debug(`table ${tbl} failed:`, err?.message ?? err)
        }
    }
    return { data: null, error: new Error('no-table-found') }
}

export async function getAllCharacters(offset = 0, perPage = 50) {
    const clampedPerPage = Math.max(MIN_RESULTS, Math.min(MAX_RESULTS, perPage))
    const { data, error } = await tryFromTables(qb => qb.select('*').range(offset, offset + clampedPerPage - 1))
    if (error) {
        console.error('getAllCharacters error:', error.message)
        return []
    }
    return data ?? []
}

export async function getCharacterById(id) {
    const { data, error } = await tryFromTables(qb => qb.select('*').eq('id', id).limit(1))
    if (error) {
        console.error('getCharacterById error:', error.message)
        return null
    }
    if (!data || data.length === 0) return null
    return data[0]
}

export async function getCharacterByName(name) {
    const { data, error } = await tryFromTables(qb => qb.select('*').eq('name', name).limit(1))
    if (error) {
        console.error('getCharacterByName error:', error.message)
        return null
    }
    return (data && data.length > 0) ? data[0] : null
}

export async function getCharacterByImage(image) {
    const { data, error } = await tryFromTables(qb => qb.select('*').eq('image', image).limit(1))
    if (error) {
        console.error('getCharacterByImage error:', error.message)
        return null
    }
    return (data && data.length > 0) ? data[0] : null
}

export async function getCharacterByBackstory(backstory) {
    // Use ilike to allow partial matches if supported
    const { data, error } = await tryFromTables(qb => qb.select('*').ilike('backstory', `%${backstory}%`).limit(1))
    if (error) {
        console.error('getCharacterByBackstory error:', error.message)
        return null
    }
    return (data && data.length > 0) ? data[0] : null
}

export async function createCharacter({ id, name, image, backstory }) {
    const payload = { id, name, image, backstory }
    const { data, error } = await tryFromTables(qb => qb.insert([payload]).select())
    if (error) {
        console.error('createCharacter error:', error.message)
        return null
    }
    // some tables return inserted row(s), others return data wrapper
    if (Array.isArray(data) && data.length > 0) return data[0]
    if (data && data[0]) return data[0]
    return null
}

export async function updateCharacter(id, updates = {}) {
    const { data, error } = await tryFromTables(qb => qb.update(updates).eq('id', id).select())
    if (error) {
        console.error('updateCharacter error:', error.message)
        return null
    }
    if (Array.isArray(data) && data.length > 0) return data[0]
    return data ?? null
}

export async function deleteCharacter(id) {
    const { data, error } = await tryFromTables(qb => qb.delete().eq('id', id).select())
    if (error) {
        console.error('deleteCharacter error:', error.message)
        return false
    }
    return true
}
