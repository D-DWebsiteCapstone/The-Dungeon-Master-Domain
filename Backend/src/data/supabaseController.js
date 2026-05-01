﻿import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { asNumber, PDFDocument } from "pdf-lib";
import { uploadCharacterImage } from '../../src/utils/uploadImage.js'


// Read in environment variables
dotenv.config()
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:3000'
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badKey'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

// Make database client object (does not connect until first query)
// Prefer service role key so server routes bypass RLS; fallback to anon/public if missing.
export const DBClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_PUB_KEY)
// Storage uploads must use service role, otherwise bucket RLS can block inserts.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const StorageAdminClient = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  : null

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


export async function getLogin(username, password) {
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
  } catch (error) {
    console.error('Error validating user:', error.message);
    return false;
  }
}

//Ban user from campaign
// Ban a user from a specific campaign by inserting into `bannedCampaign`.
export async function banUser(userId, campaignId) {
  if (!userId || !campaignId) {
    throw new Error('userId and campaignId are required to ban a user')
  }

  try {
    // 1) Remove any existing membership in the campaign
    const { error: delErr } = await DBClient
      .from('inCampaign')
      .delete()
      .eq('userId', userId)
      .eq('campaignId', campaignId)

    if (delErr) {
      console.error('banUser: failed to remove inCampaign row:', delErr)
      throw delErr
    }

    // 2) Insert a ban record (idempotent — ignore duplicates)
    const { data, error } = await DBClient
      .from('bannedCampaign')
      .insert([{ userId, campaignId }])
      .select()

    if (error) {
      // If duplicate key or similar, log and continue
      console.error('banUser insert error:', error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error('banUser failed:', err)
    throw err
  }
}


// Check whether a user is banned from a specific campaign
export async function isUserBannedFromCampaign(userId, campaignId) {
  if (!userId || !campaignId) return false
  const { data, error } = await DBClient
    .from('bannedCampaign')
    .select('*')
    .eq('userId', userId)
    .eq('campaignId', campaignId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('isUserBannedFromCampaign DB error:', error)
    throw error
  }

  return !!data
}

//Unban user
export async function unBanUserFromSite(userId, campaignId){
  if (!userId || !campaignId) {
    throw new Error('userId and campaignId are required to unban a user')
  }

  try {
    // 1) Remove the ban record (idempotent: ignore if already absent)
    const { error: delErr } = await DBClient
      .from('bannedCampaign')
      .delete()
      .eq('userId', userId)
      .eq('campaignId', campaignId)

    if (delErr) {
      console.error('unbanUser: failed to delete ban row:', delErr)
      throw delErr
    }

    // 2) Re-add the user to the campaign as a Player
    const { data, error } = await DBClient
      .from('inCampaign')
      .insert([{ userId, campaignId, Role: 'Player' }])
      .select()

    if (error) {
      console.error('unbanUser insert error:', error)
      throw error
    }

    return data || []
  } catch (err) {
    console.error('unbanUser failed:', err)
    throw err
  }
}

//Get the banned user
export async function loadBannedCampaign(campaignId) {
  console.log('loadBannedCampaign called with campaignId:', campaignId);
  try {
    // Fetch banned users for this campaign
    // First get all banned users with their IDs
    const { data, error: delErr } = await DBClient
      .from('bannedCampaign')
      .select('userId, campaignId')
      .eq('campaignId', campaignId)

    console.log('Banned records query result:', { dataLength: data?.length, delErr });

    if (delErr) {
      console.error('loadBannedCampaign: failed to fetch banned users:', delErr)
      throw delErr
    }

    // If no banned users, return empty array
    if (!data || data.length === 0) {
      console.log('No banned records found, returning empty array');
      return [];
    }

    console.log('Found', data.length, 'banned records');

    // Now fetch the usernames for these user IDs
    const userIds = data.map(row => row.userId);
    console.log('Fetching usernames for', userIds.length, 'userIds');

    const { data: users, error: userErr } = await DBClient
      .from('Users')
      .select('userid, username')
      .in('userid', userIds)

    console.log('Users query result - found', users?.length, 'users, error:', userErr);

    if (userErr) {
      console.error('loadBannedCampaign: failed to fetch usernames:', userErr)
      // Still return the data even if we can't get usernames
    }

    // Create a map of userid -> username for quick lookup
    const userMap = {};
    (users || []).forEach(user => {
      userMap[user.userid] = user.username;
    });

    // Map banned campaign data with usernames
    const mappedData = data.map(row => ({
      userId: row.userId,
      campaignId: row.campaignId,
      username: userMap[row.userId] || 'Unknown User'
    }));

    console.log('Final mapped data length:', mappedData.length);
    return mappedData;
  } catch (err) {
    console.error('Error loading banned users:', err);
    return [];
  }
}

// Checks what the user's role is in a campaign
export async function checkUserRole(userId, campaignId) {
  const { data, error } = await DBClient
    .from('inCampaign')
    .select('Role')
    .eq('userId', userId)
    .eq('campaignId', campaignId)
    .single()
    console.log("The user's role is " + data);
    if (error) throw error
    if (data.Role === null){
      return false;
    }
  
  return data.Role;
}

//Checks if a user is in a campaign
export async function checkUserInCampaign(userId, campaignId){
  const {data, error} = await DBClient
  .from('inCampaign')
  .select('userId')
  .eq('userId', userId)
  .eq('campaignId', campaignId)
  .maybeSingle();
  console.log(data);
  
  if(data === null){
    return false
  }
  return true
}

export async function checkUserInCampaignRole(userId, campaignId) {
  const {data, error} = await DBClient 
    .from('inCampaign')
    .select('Role')
    .eq('userId', userId)
    .eq('campaignId', campaignId)
    .maybeSingle()

    if (data === null) {
      return false;
    }
    return data;
}

export async function insertCampaign({ id, title, joinCode, sessionRecap = null }) {
  const { data, error } = await DBClient
    .from('updatedCampaign')
    .insert([{ id, title, joinCode, sessionRecap }])
    .select()

  if (error) throw error
  // Return the single inserted campaign object (not a wrapper) so routes
  // can send back the campaign directly to clients.
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


//We want to see how many rows are selected when we try to find all the campaigns where a user
// has the role of DM
export async function checkCampaignLimits({ userId }) {
  const {data, error} = await DBClient
    .from('inCampaign')
    .select('*')
    .eq('Role', 'DM')
    .eq('userId', userId)

  
  console.log("You have ", data.length, " campaigns")
  if(data.length >= 10) {
    return false;
  } else {
    return true;
  }
}

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

// Helper to convert various inputs into a nullable bigint for character stats
function toNullableBigInt(val) {
  if (val === undefined) return undefined
  if (val === null) return null
  if (typeof val === 'string' && val.trim() === '') return null
  const n = Number(val)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

// Helper to parse missing column name from Postgres error messages
function getMissingColumnFromError(error) {
  const msg = String(error?.message || error?.details || '')
  const match = msg.match(/column\s+"?([a-zA-Z0-9_]+)"?/i)
  return match ? match[1] : null
}

// When inserting/updating characters, if the merged schema is missing 
// some optional columns, we want to drop only those columns and retry 
// (instead of failing the entire request).
async function safeInsertCharacter(payload) {
  const insertData = { ...payload }
  let lastError = null

  // If merged schema is missing some optional columns, drop only those and retry.
  for (let i = 0; i < 12; i++) {
    const { data, error } = await DBClient
      .from('character')
      .insert([insertData])
      .select()
      .single()

    if (!error) return data
    lastError = error

    const missingCol = getMissingColumnFromError(error)
    if (!missingCol || !(missingCol in insertData)) break

    console.warn(`[character/create] Dropping missing column '${missingCol}' and retrying insert`)
    delete insertData[missingCol]
  }

  throw lastError || new Error('Failed to insert character')
}

// Similar to safeInsertCharacter but for updates. 
// This allows us to handle schema mismatches gracefully.
async function safeUpdateCharacterById(id, payload) {
  const updateData = { ...payload }
  let lastError = null

  for (let i = 0; i < 12; i++) {
    const { data, error } = await DBClient
      .from('character')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (!error) return data
    lastError = error

    const missingCol = getMissingColumnFromError(error)
    if (!missingCol || !(missingCol in updateData)) break

    console.warn(`[character/edit] Dropping missing column '${missingCol}' and retrying update`)
    delete updateData[missingCol]
  }

  throw lastError || new Error('Failed to update character')
}

//This will be to edit character entries in the database 
export async function editCharacter({
  id,
  name,
  image,
  backstory,
  class_: className,
  level,
  subClass,
  background,
  race,
  alignment,
  maxHealth,
  armorClass,
  str,
  dex,
  con,
  int,
  wis,
  cha
}) {
    const updates = {
      name,
      backstory,
      class: className,
      "Subclass": subClass,
      "Background": background,
      "Race": race,
      "Alignment": alignment,
      maxHealth: toNullableBigInt(maxHealth),
      armorClass: toNullableBigInt(armorClass),
      strength: toNullableBigInt(str),
      dexterity: toNullableBigInt(dex),
      constitution: toNullableBigInt(con),
      intelligence: toNullableBigInt(int),
      wisdom: toNullableBigInt(wis),
      charisma: toNullableBigInt(cha)
    }
    if (level !== undefined) updates.Level = toNullableBigInt(level)

    if (image && image.startsWith('data:')) {
        // Get the character's createdBy so we can namespace the file path
        const existing = await getCharacterById(id)
        if (!StorageAdminClient) {
          throw new Error('Image upload requires SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) on backend')
        }
        updates.image_url = await uploadCharacterImage(StorageAdminClient, image, existing?.createdBy || 'unknown')

        // Optionally delete the old image from storage here
        // (see Step 5 for cleanup)

    } else if (image && image.startsWith('http')) {
        updates.image_url = image
    }

    return await safeUpdateCharacterById(id, updates)
}

//This will be to create the character entries in the database
export async function createCharacter({
  id,
  name,
  image,
  backstory,
  createdBy,
  class_: className,
  level,
  subClass,
  background,
  race,
  alignment,
  maxHealth,
  armorClass,
  str,
  dex,
  con,
  int,
  wis,
  cha
}) {
    let imageUrl = null

    console.log('[createCharacter] image type:', typeof image)
    console.log('[createCharacter] image preview:', typeof image === 'string' ? image.substring(0, 100) : image)

    if (image && typeof image === 'string' && image.startsWith('data:')) {
      if (!StorageAdminClient) {
        throw new Error('Image upload requires SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) on backend')
      }
      imageUrl = await uploadCharacterImage(StorageAdminClient, image, createdBy)
    } else if (image && typeof image === 'string' && image.startsWith('http')) {
        imageUrl = image  // already a URL, store as-is
    } else if (image) {
        console.warn('[createCharacter] Unrecognized image format, skipping upload')
    }

    return await safeInsertCharacter({
      id,
      name,
      image_url: imageUrl,
      backstory,
      createdBy,
      class: className,
      Level: toNullableBigInt(level),
      "Subclass": subClass,
      "Background": background,
      "Race": race,
      "Alignment": alignment,
      maxHealth: toNullableBigInt(maxHealth),
      armorClass: toNullableBigInt(armorClass),
      strength: toNullableBigInt(str),
      dexterity: toNullableBigInt(dex),
      constitution: toNullableBigInt(con),
      intelligence: toNullableBigInt(int),
      wisdom: toNullableBigInt(wis),
      charisma: toNullableBigInt(cha)
    })
}



export async function countCharactersByCreator(username) {
  if (!username) return 0

  const { count, error } = await DBClient
    .from('character')
    .select('*', { count: 'exact', head: true })
    .eq('createdBy', username)

  if (error) {
    console.error('Error counting characters by creator:', error)
    throw error
  }

  return count || 0
}

//This will delete a character entry from the database by id
export async function deleteCharacterById(id) {
    // Fetch first so we have the image_url to clean up
    const character = await getCharacterById(id)
    if (!character) return null

    // If there's a storage image, delete it
    if (character.image_url?.includes('supabase.co/storage')) {
        // Extract the path after the bucket name
        const path = character.image_url.split('/character-images/')[1]
        if (path) {
            const { error } = await DBClient.storage
                .from('character-images')
                .remove([path])
            if (error) console.warn('Failed to delete image from storage:', error.message)
        }
    }

    const { data, error } = await DBClient
        .from('character')
        .delete()
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

//this will get character by their ID or more specifically UUID
export async function getCharacterById(characterId) {
    console.log("Getting character by ID:", characterId);
    const { data, error } = await DBClient
        .from('character')
        .select()
        .eq('id', characterId)
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
export async function getAllCharacters(offset = 0, perPage = 10) {
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

  // Get characters created by a specific user (createdBy references Users.username)
  export async function getCharactersByCreator(username) {
    if (!username) return []
    const { data, error } = await DBClient
      .from('character')
      .select()
      .eq('createdBy', username)

    if (error) {
      console.error('Error fetching characters by creator:', error)
      throw error
    }
    return data || []
  }

// --- Check Admin Perms ---
export async function checkAdminPerm(userId) {
  const role = await checkUserRole(userId)
  if (!role || (role !== 'Admin')) {
    const err = new Error('Invalid permissions')
    err.status = 403
    throw err
    return false;
  }
  return true;
}

// Get all characters linked to a campaign (via charCampLink table)
// Returns joined data with character and user information
export async function getCampaignCharacters(campaignId) {
  if (!campaignId) throw new Error('campaignId is required')

  // First get charCampLink entries
  const { data: charCampLinks, error: linkError } = await DBClient
    .from('charCampLink')
    .select('id, userId, characterId, campaignId, level, addBackstory')
    .eq('campaignId', campaignId)

  if (linkError) {
    console.error('getCampaignCharacters error:', linkError)
    throw linkError
  }

  if (!charCampLinks || charCampLinks.length === 0) {
    return []
  }

  // Get all unique characterIds and userIds
  const characterIds = [...new Set(charCampLinks.map(link => link.characterId))]
  const userIds = [...new Set(charCampLinks.map(link => link.userId))]

  // Fetch character data
  const { data: characters, error: charError } = await DBClient
    .from('character')
    .select('*')
    .in('id', characterIds)

  if (charError) {
    console.error('Error fetching characters:', charError)
    throw charError
  }

  // Fetch user data
  const { data: users, error: userError } = await DBClient
    .from('Users')
    .select('userid, username')
    .in('userid', userIds)

  if (userError) {
    console.error('Error fetching users:', userError)
    throw userError
  }

  // Create lookup maps
  const characterMap = {}
  characters.forEach(char => {
    characterMap[char.id] = char
  })

  const userMap = {}
  users.forEach(user => {
    userMap[user.userid] = user
  })

  // Map charCampLink entries with joined data
  const mappedCharacters = charCampLinks.map(link => {
    const character = characterMap[link.characterId] || {}
    const user = userMap[link.userId] || {}

    return {
      id: link.id, // charCampLink id for proper tracking and re-renders
      characterId: link.characterId,
      userId: link.userId,
      characterName: character.name || 'Unknown',
      image: character.image_url,
      characterBackstory: character.backstory,
      level: link.level || character.Level,
      username: user.username || 'Unknown',
      addBackstory: link.addBackstory,
      createdBy: character.createdBy,
      class: character.class,
      subClass: character.subClass ?? character.Subclass,
      background: character.background ?? character.Background,
      race: character.race ?? character.Race,
      alignment: character.alignment ?? character.Alignment,
      maxHealth: character.maxHealth,
      armorClass: character.armorClass,
      str: character.str ?? character.strength,
      dex: character.dex ?? character.dexterity,
      con: character.con ?? character.constitution,
      int: character.int ?? character.intelligence,
      wis: character.wis ?? character.wisdom,
      cha: character.cha ?? character.charisma
    }
  })

  return mappedCharacters
}

// Add a character to a campaign (creates charCampLink entry)
export async function addCharacterToCampaign(characterId, campaignId, userId) {
  if (!characterId || !campaignId || !userId) {
    throw new Error('characterId, campaignId, and userId are required')
  }

  // Get the character's backstory and level to copy into charCampLink
  const { data: charData, error: charErr } = await DBClient
    .from('character')
    .select('backstory, "Level"')
    .eq('id', characterId)
    .single()

  if (charErr) throw charErr

  const { data, error } = await DBClient
    .from('charCampLink')
    .insert([{
      characterId,
      campaignId,
      userId,
      level: charData?.Level || 1, // Copy character's base level (fallback to 1 if not set)
      addBackstory: charData?.backstory || '' // Copy initial backstory
    }])
    .select()

  if (error) {
    console.error('addCharacterToCampaign error:', error)
    throw error
  }

  return data?.[0] || null
}

// Update campaign-specific backstory for a character in a campaign
export async function updateCharacterBackstory(characterId, campaignId, backstory) {
  if (!characterId || !campaignId) {
    throw new Error('characterId and campaignId are required')
  }

  const { data, error } = await DBClient
    .from('charCampLink')
    .update({ addBackstory: backstory })
    .eq('characterId', characterId)
    .eq('campaignId', campaignId)
    .select()

  if (error) {
    console.error('updateCharacterBackstory error:', error)
    throw error
  }

  return data?.[0] || null
}

// Remove a character from a campaign (deletes charCampLink entry)
export async function removeCharacterFromCampaign(characterId, campaignId) {
  if (!characterId || !campaignId) {
    throw new Error('characterId and campaignId are required')
  }

  const { error } = await DBClient
    .from('charCampLink')
    .delete()
    .eq('characterId', characterId)
    .eq('campaignId', campaignId)

  if (error) {
    console.error('removeCharacterFromCampaign error:', error)
    throw error
  }

  return true
}

// Update a character's level in a campaign
export async function updateCharacterLevel(characterId, campaignId, level) {
  if (!characterId || !campaignId || level === undefined) {
    throw new Error('characterId, campaignId, and level are required')
  }

  const { data, error } = await DBClient
    .from('charCampLink')
    .update({ level })
    .eq('characterId', characterId)
    .eq('campaignId', campaignId)
    .select()

  if (error) {
    console.error('updateCharacterLevel error:', error)
    throw error
  }

  return data?.[0] || null
}

//RECAP STUFF !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
export async function createRecap(campaignId, recapText = '') {
  // Get latest recap for this campaign
  const { data: existing, error: fetchError } = await DBClient
    .from("Recaps")
    .select("orderNumber")
    .eq("campaignId", campaignId)
    .order("orderNumber", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching existing recaps:", fetchError);
    throw fetchError;
  }

  const nextOrderNum = existing ? existing.orderNumber + 1 : 1;
  
  const { data, error } = await DBClient
    .from("Recaps")
    .insert({
      campaignId,
      description: recapText,
      orderNumber: nextOrderNum
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating recap:", error);
    throw error;
  }
  return data;
}

// --- Get recap data ---
export async function getRecap(campaignId) {
  const { data, error } = await DBClient
    .from("Recaps")
    .select("id, description, orderNumber")
    .eq("campaignId", campaignId)
    .order("orderNumber", {ascending: true});

  if (error) {
    console.error("Error fetching recaps:", error);
    throw { status: 500, message: "Failed to fetch recaps" };
  }
  return { recaps: data || [] };
}

export async function deleteRecap(campaignId, recapId) {
  //Step 1: Delete the recap specified
  const {error: deleteError } = await DBClient
    .from("Recaps")
    .delete()
    .eq("id", recapId)
    .eq("campaignId", campaignId);
  
  if (deleteError) {
    console.error("Error deleting recap: ", deleteError);
    throw deleteError;
  }

  //Step 2: find the remaining recaps
  const {data: remaining, error: fetchError } = await DBClient
    .from("Recaps")
    .select("id")
    .eq("campaignId", campaignId)
    .order("orderNumber", {ascending: true});

  if (fetchError) {
    console.error("Error fetching the rest of the recaps");
    throw fetchError;
  }

  //Step 3: Update the order number of the remaining recaps
  for(let i = 0; i < remaining.length; i++) {
    const {error: updateOrderError } = await DBClient
      .from("Recaps")
      .update( {orderNumber: i + 1})
      .eq("id", remaining[i].id)
      .eq("campaignId", campaignId);
    
    if (updateOrderError) {
      console.error("Error updating the order of the recaps.");
      throw updateOrderError;
    }
  }

  return {success: true, newCount: remaining.length };
}

export async function editRecap(recapId, description) {
  const { data, error } = await DBClient
    .from("Recaps")
    .update({description})
    .eq("id", recapId)
    .select()
    .single()

  if (error) {
    console.error("Error updating recap: ", error)
    throw error
  }
  return data
}

export async function getRecapFunctionality(campaignId) {
  const {data, error} = await DBClient 
    .from("updatedCampaign")
    .select('allowPlayerRecaps')
    .eq('id', campaignId)
    .single()
  
    if(error) {
      console.error("error updateing recap: ", error);
      throw error;
    }
    return data;
}

export async function togglePlayerRecaps(campaignId) {
  const {data, error} = await DBClient
    .from('updatedCampaign')
    .select('allowPlayerRecaps')
    .eq('id', campaignId)
    .maybeSingle();

  if (error) {
    console.error("Error fethching recap functionality");
    throw error;
  }

  if (!data) throw new Error('Campaign not found');

  const {data: updated, error: updateError} = await DBClient
    .from('updatedCampaign')
    .update({ allowPlayerRecaps: !data.allowPlayerRecaps })
    .eq('id', campaignId)
    .select()
    .single();

  if (updateError) {
    console.error("Error updating recap functionality");
    throw updateError;
  }

  return updated.allowPlayerRecaps;
}


//END OF RECAP STUFF !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11


//START OF RULES STUFF!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export async function createRules(campaignId, description = '') {
  const { data: existing, error: fetchError } = await DBClient
    .from('Rules')
    .select('orderNumber')
    .eq('campaignId', campaignId)
    .order('orderNumber', {ascending: false})
    .limit(1)
    .maybeSingle();
  
  if (fetchError) {
    console.error('Error fetching existing rules', fetchError);
    throw fetchError;
  }
  const nextOrderNum = existing ? existing.orderNumber + 1 : 1;

  const {data, error} = await DBClient
    .from('Rules')
    .insert({
      campaignId,
      description,
      orderNumber: nextOrderNum
    })
    .select()
    .single();

  if(error) {
    console.error('Error creating rule: ', error);
    throw error;
  }

  return data;
}

// --- Get rules data ---
export async function getRules(campaignId) {
  const { data, error } = await DBClient
    .from("Rules")
    .select("id, description, orderNumber")
    .eq("campaignId", campaignId)
    .order('orderNumber', { ascending: true });

  if (error) {
    console.error('Error Fetching rules:', error);
    throw error;
  }

  return { rules: data || [] };
}

export async function editRule(ruleId, description) {
  const { data, error } = await DBClient
    .from('Rules')
    .update({ description })
    .eq('id', ruleId)
    .select()
    .single();

  if (error) {
    console.error('Error updating rule:', error);
    throw error;
  }

  return data;
}

export async function deleteRule(campaignId, ruleId) {
  // Step 1: Delete the rule
  const { error: deleteError } = await DBClient
    .from('Rules')
    .delete()
    .eq('id', ruleId)
    .eq('campaignId', campaignId);

  if (deleteError) {
    console.error('Error deleting rule:', deleteError);
    throw deleteError;
  }

  // Step 2: Fetch remaining rules
  const { data: remaining, error: fetchError } = await DBClient
    .from('Rules')
    .select('id')
    .eq('campaignId', campaignId)
    .order('orderNumber', { ascending: true });

  if (fetchError) {
    console.error('Error fetching remaining rules:', fetchError);
    throw fetchError;
  }

  // Step 3: Reorder remaining rules
  for (let i = 0; i < remaining.length; i++) {
    const { error: updateError } = await DBClient
      .from('Rules')
      .update({ orderNumber: i + 1 })
      .eq('id', remaining[i].id)
      .eq('campaignId', campaignId);

    if (updateError) {
      console.error('Error reordering rules:', updateError);
      throw updateError;
    }
  }

  return { success: true, newCount: remaining.length };
}

//END OF RULES STUF!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export async function getAllUsers() {
  const { data, error } = await DBClient
    .from("Users")
    .select("userid, username");

  if (error) {
    console.error("getAllUsers error:", error);
    throw error;
  }

  // Make sure `data` is always an array
  return Array.isArray(data) ? data : [];
}

export async function createUser(username, email, password) {
  const hashed = await bcrypt.hash(password, 10);
  const userId = crypto.randomUUID();
  const verificationCode = nanoid(32);

  const { data, error } = await DBClient
    .from('Users')
    .insert([{ userid: userId, username, email, userpassword: hashed, verified: false, verificationCode }]);

  if (error) throw error;
  return { userId, verificationCode };
}

// --- VERIFY USER EMAIL ---
export async function verifyUser(code) {
  const { data, error } = await DBClient
    .from('Users')
    .update({ verified: true })
    .eq('verificationCode', code)
    .select();

  if (error) throw error;
  return data?.length > 0;
}

// --- GET USER BY EMAIL ---
export async function getUserByEmail(email) {
  const { data, error } = await DBClient.from('Users').select('*').eq('email', email).single();
  if (error) throw error;
  return data;
}

// --- RESET PASSWORD ---
export async function updatePassword(email, newPassword) {
  const hashed = await bcrypt.hash(newPassword, 10);
  const { error } = await DBClient.from('Users').update({ userpassword: hashed }).eq('email', email);
  if (error) throw error;
}

export async function isUserBanned(userId) {
  const { data, error } = await DBClient
    .from('bannedSite')
    .select('reason')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null; // returns { reason } or null
}

export async function banUserFromSite(userId, username, reason) {
  const { data, error } = await DBClient
    .from('bannedSite')
    .insert([{ id: userId, username, reason }])
    .select();

  if (error) throw error;
  return data;
}


export async function getSiteRoleForUser(userId) {
  const { data, error } = await DBClient
    .from("UserRole")
    .select("rolename")
    .eq("userid", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;

  return data?.rolename || null;
}


export async function getMembersForCampaign(campaignId) {
  try {
    console.log('getMembersForCampaign called for campaignId:', campaignId);

    const { data: memberships, error: membershipsError } = await DBClient
      .from('inCampaign')
      .select('userId, Role, campaignId')
      .eq('campaignId', campaignId);

    if (membershipsError) {
      console.error('Error fetching inCampaign rows:', membershipsError);
      throw membershipsError;
    }

    console.log('inCampaign rows:', memberships);

    if (!memberships || memberships.length === 0) {
      console.log('No memberships found');
      return [];
    }

    const userIds = memberships.map(m => m.userId).filter(Boolean);
    if (userIds.length === 0) {
      console.log('No userIds in memberships');
      return [];
    }

    const { data: users, error: usersError } = await DBClient
      .from('Users')
      .select('userid, username')
      .in('userid', userIds);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    const usersById = new Map((users || []).map(u => [u.userid, u]));

    const members = memberships.map(m => ({
      userId: m.userId,
      userName: usersById.get(m.userId)?.username || null,
      role: m.Role || null
    }));

    console.log('Resolved members:', members);
    return members;

  } catch (err) {
    console.error('getMembersForCampaign failed:', err);
    throw err;
  }
}

// Campaign card helpers
export async function getCampaignCardRole(username) {
  const { data: user, error: userError } = await DBClient
    .from('Users')
    .select('userid')
    .eq('username', username)
    .single()

  if (userError) throw userError
  if (!user?.userid) return []

  const { data, error } = await DBClient
    .from('inCampaign')
    .select('campaignId, Role')
    .eq('userId', user.userid)

  if (error) throw error
  return data ?? []
}

export async function getCampaignCardTitle(campaignId) {
  const { data, error } = await DBClient
    .from('updatedCampaign')
    .select('id, title, joinCode')
    .eq('id', campaignId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data ?? null
}

// Get all campaigns (title/joinCode) plus the user's role
export async function getCampaignCards(username) {
  const roles = await getCampaignCardRole(username)
  if (!roles.length) return []

  const ids = roles.map(r => r.campaignId)
  const { data, error } = await DBClient
    .from('updatedCampaign')
    .select('id, title, joinCode')
    .in('id', ids)

  if (error) throw error

  return (data || []).map(c => ({
    ...c,
    role: roles.find(r => r.campaignId === c.id)?.Role ?? 'Player',
  }))
}

// ============================================
// MAP FUNCTIONS - Full CRUD for multiple maps
// ============================================

// UPLOADMAP: Save a map image to the database for a campaign
// Stores the image as bytea in the maps table linked to a campaign and creator
export async function uploadMap(campaignId, createdBy, imageData) {
  if (!campaignId || !createdBy) {
    throw new Error('campaignId and createdBy are required')
  }

  console.log('[uploadMap] Inserting map for campaign:', campaignId, 'Base64 length:', imageData?.length || 0)

  const { data, error } = await DBClient
    .from('maps')
    .insert([{
      campaign: campaignId,
      createdBy: createdBy,
      map: imageData  // Store as text/base64 string
    }])
    .select()

  if (error) {
    console.error('[uploadMap] Error:', error)
    throw error
  }

  console.log('[uploadMap] Successfully inserted, returning data:', data?.[0]?.id)
  return data?.[0] || null
}

// UPDATEMAP: Update an existing map by ID
export async function updateMap(mapId, imageData) {
  if (!mapId) {
    throw new Error('mapId is required')
  }

  console.log('[updateMap] Updating map:', mapId, 'Base64 length:', imageData?.length || 0)

  const { data, error } = await DBClient
    .from('maps')
    .update({ map: imageData })
    .eq('id', mapId)
    .select()

  if (error) {
    console.error('[updateMap] Error:', error)
    throw error
  }

  console.log('[updateMap] Successfully updated, returning data:', data?.[0]?.id)
  return data?.[0] || null
}

// GETMAPBYID: Retrieve a specific map by ID
export async function getMapById(mapId) {
  if (!mapId) {
    throw new Error('mapId is required')
  }

  console.log('[getMapById] Fetching map with ID:', mapId)

  const { data, error } = await DBClient
    .from('maps')
    .select('id, map, createdBy, campaign')
    .eq('id', mapId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[getMapById] Error:', error)
    throw error
  }

  return data || null
}

// GETMAPSFORCAMPAIGN: Retrieve all maps for a campaign
export async function getMapsForCampaign(campaignId) {
  if (!campaignId) {
    throw new Error('campaignId is required')
  }

  console.log('[getMapsForCampaign] Fetching maps for campaign:', campaignId)


  const { data, error } = await DBClient
    .from('maps')
    .select('id, map, createdBy, campaign')
    .eq('campaign', campaignId)
    .order('id', { ascending: false })

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is ok
    console.error('[getMapsForCampaign] Error:', error)
    throw error
  }

  if (!data || data.length === 0) {
    console.log('[getMapsForCampaign] No maps found for campaign:', campaignId)
  } else {
    console.log('[getMapsForCampaign] Found', data.length, 'maps')
  }

  return data || []
}

// GETLATESTMAPFORCAMPAIGN: Retrieve the most recent map for a campaign
export async function getLatestMapForCampaign(campaignId) {
  if (!campaignId) {
    throw new Error('campaignId is required')
  }

  console.log('[getLatestMapForCampaign] Fetching latest map for campaign:', campaignId)

  const { data, error } = await DBClient
    .from('maps')
    .select('id, map, createdBy, campaign')
    .eq('campaign', campaignId)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('[getLatestMapForCampaign] Error:', error)
    throw error
  }

  return data || null
}

// DELETEMAP: Delete a specific map by ID
export async function deleteMap(mapId) {
  if (!mapId) {
    throw new Error('mapId is required')
  }

  console.log('[deleteMap] Deleting map:', mapId)

  const { error } = await DBClient
    .from('maps')
    .delete()
    .eq('id', mapId)

  if (error) {
    console.error('[deleteMap] Error:', error)
    throw error
  }

  console.log('[deleteMap] Successfully deleted map:', mapId)
  return { success: true }
}

// DELETEMAPSFORCAMPAIGN: Delete all maps for a campaign
export async function deleteMapsForCampaign(campaignId) {
  if (!campaignId) {
    throw new Error('campaignId is required')
  }

  console.log('[deleteMapsForCampaign] Deleting all maps for campaign:', campaignId)

  const { error } = await DBClient
    .from('maps')
    .delete()
    .eq('campaign', campaignId)

  if (error) {
    console.error('[deleteMapsForCampaign] Error:', error)
    throw error
  }

  console.log('[deleteMapsForCampaign] Successfully deleted all maps for campaign:', campaignId)
  return { success: true }
}

// ============================================
// ZOOM FUNCTIONS
// ============================================

// Store / update Zoom tokens for a user
export async function saveZoomTokens(userId, accessToken, refreshToken, expiresAt) {
  const { data, error } = await DBClient
    .from('zoom_tokens')
    .upsert({
      userId,
      accessToken,
      refreshToken,
      expiresAt
    }, { onConflict: 'userId' })
    .select()
    .single()

  if (error) {
    console.error('saveZoomTokens error:', error)
    throw error
  }
  return data
}

export async function getZoomTokens(userId) {
  const { data, error } = await DBClient
    .from('zoom_tokens')
    .select('*')
    .eq('userId', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('getZoomTokens error:', error)
    throw error
  }
  return data || null
}

// Store a Zoom meeting row linked to a Schedule row
export async function insertZoomMeeting({ scheduleId, zoomMeetingId, joinUrl, startUrl }) {
  const { data, error } = await DBClient
    .from('zoomMeetings')
    .upsert({
      scheduleId,
      zoomMeetingId,
      zoomJoinUrl: joinUrl,
      zoomStartUrl: startUrl,
    }, {
      onConflict: 'scheduleId'
    })
    .select()
    .single()

  if (error) {
    console.error('insertZoomMeeting error:', error)
    throw error
  }

  return data
}

export async function getZoomMeetingBySchedule(scheduleId) {
  const { data, error } = await DBClient
    .from('zoomMeetings')
    .select('*')
    .eq('scheduleId', scheduleId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('getZoomMeetingBySchedule error:', error)
    throw error
  }
  return data || null
}

export async function getUsername(userID){
const { data, error } = await DBClient
  .from("Users")
  .select("username")
  .eq('userid', userID)
  .single()

  if (error){
  console.log("Problem fetching username: ", error)
  }
  return data;
}
//DISCORD!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

export async function getDiscordID(userID) {
  console.log("getDiscordID called in supabaseController")
  const {data, error} = await DBClient
    .from('Users')
    .select('discord_user_id')
    .eq('userid', userID)
    .single()
  
  if(error) {
    console.log("Problem fetching discordId: ", error)
  }
  console.log("Going back to users.js")
  return data;
}

export async function getDiscordUsername(userId) {
  const {data, error} = await DBClient
    .from('Users')
    .select('discord_username')
    .eq('userid', userId)
    .single()
  
  if(error) {
    console.log("Problem fetching discordUsername: ", error);
    throw error; 
  }

  console.log(data.discord_username);
  return data;
}

export async function unlinkDiscord(userId) {
  const { data, error } = await DBClient
    .from('Users')
    .update({
      discord_username: null, 
      discord_user_id: null})
    .eq('userid', userId)
    .select()
 
  if(error) {
    console.log("Problem unlinking account")
    throw error
  }

  return data;
}

export async function findUserByDiscord(discordUser, accessToken, refreshToken, expiresIn) {
  const discordUsername = discordUser.global_name || discordUser.username || discordUser.id

  const { data: byDiscordID, error: discordIdErr } = await DBClient
    .from("Users")
    .select("*")
    .eq("discord_user_id", discordUser.id)
    .maybeSingle()
  if (discordIdErr) throw discordIdErr

  if (byDiscordID) {
    // Update tokens even on existing match since they may have changed
    await DBClient
      .from("Users")
      .update({
        discord_username: discordUser.username,
        discord_access_token: accessToken,
        discord_refresh_token: refreshToken,
        discord_token_expiry: Date.now() + expiresIn * 1000
      })
      .eq("discord_user_id", discordUser.id)
    return byDiscordID
  }

  if (discordUser.email) {
    const { data: byEmail, error: emailErr } = await DBClient
      .from("Users")
      .select("*")
      .eq("email", discordUser.email)
      .maybeSingle()
    if (emailErr) throw emailErr

    if (byEmail) {
      await DBClient
        .from("Users")
        .update({
          discord_user_id: discordUser.id,
          discord_access_token: accessToken,
          discord_refresh_token: refreshToken,
          discord_token_expiry: Date.now() + expiresIn * 1000
        })
        .eq("userid", byEmail.userid)
      return { ...byEmail, discord_user_id: discordUser.id }
    }
  }

  const { data: newUser, error: createErr } = await DBClient
    .from("Users")
    .insert({
      email: discordUser.email || null,
      username: discordUsername,
      discord_user_id: discordUser.id,
      discord_access_token: accessToken,
      discord_refresh_token: refreshToken,
      discord_token_expiry: Date.now() + expiresIn * 1000,
      verified: true,
      userpassword: null
    })
    .select()
    .single()

  if (createErr) throw createErr
  return newUser
}

export async function getUserById(userId) {
  const { data, error } = await DBClient
    .from("Users")
    .select("*")
    .eq("userid", userId)
    .maybeSingle()
  if (error) throw error
  return data
}

// END OF DISCORD STUF!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export async function getEmail(userID){
const { data, error } = await DBClient
  .from("Users")
  .select("email")
  .eq('userid', userID)
  .single()

  if (error){
  console.log("Problem fetching email: ", error)
  }
  return data;
}

export async function getProfilePicture(userID){
const { data, error } = await DBClient
  .from("Users")
  .select("profilePicture")
  .eq('userid', userID)
  .single()

  if (error){
  console.log("Problem fetching profile picture: ", error)
  }
  return data;
}

//check tutorial tag in user table
export async function checkTutorial(userId){
  const { data, error} = await DBClient
  .from('Users')
  .select('showTutorial')
  .eq('userid', userId)
  .single()

  if (error){
    console.log("Problem fetching the tag:", error);
  }
  return data;
}


export async function getNpcsByCampaign(campaignId) {
  const { data, error } = await DBClient
    .from('NPC')
    .select(`
      *,
      Users (
        username
      )
    `)
    .eq('campaignId', campaignId)
    .order('id', { ascending: true })

  if (error) throw error

  
  return (data || []).map(npc => ({
    ...npc,
    createdBy: npc.Users?.username || 'Unknown'
  }))
}

export async function getNpcById(npcId) {
  const { data, error } = await DBClient
    .from('NPC')
    .select('*')
    .eq('id', npcId)
    .single()

  if (error) throw error
  return data || null
}

export async function createNpc(campaignId, createdBy, name, description) {
  const { data, error } = await DBClient
    .from('NPC')
    .insert([{ campaignId: campaignId, creator: createdBy, name, description }])
    .select()

  if (error) throw error
  return data?.[0] || null
}

export async function updateNpc(npcId, name, description) {
  const { data, error } = await DBClient
    .from('NPC')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', npcId)
    .select()

  if (error) throw error
  return data?.[0] || null
}

export async function deleteNpc(npcId) {
  const { error } = await DBClient
    .from('NPC')
    .delete()
    .eq('id', npcId)

  if (error) throw error
  return true
}



export async function getMessagesByCampaign(campaignId) {
  const { data, error } = await DBClient
    .from('messages')
    .select('*')
    .eq('campaignId', campaignId) 
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

export async function createMessage(campaignId, senderId, senderName, content) {
  const { data, error } = await DBClient
    .from('messages')
    .insert([{
      campaignId,   
      senderId,     
      senderName,  
      content
    }])
    .select()

  if (error) throw error
  return data?.[0] || null
}

export async function deleteMessage(messageId) {
  const { error } = await DBClient
    .from('messages')
    .delete()
    .eq('id', messageId)

  if (error) throw error
  return true
}

export async function getMessageById(messageId) {
  const { data, error } = await DBClient
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single()

  if (error) throw error
  return data || null
}

//disable tutorial in user table

export async function disableTutorialDB(userId) {
  // Single update call instead of select + update
  const { data, error } = await DBClient
    .from('Users')
    .update({ showTutorial: false })
    .eq('userid', userId)  // don't update every row!
    .select('showTutorial')
    .single();

  if (error) {  // check error FIRST before touching data
    console.log("Problem turning off the tutorial. The rat squirrel commands you stay...... here's why: " + JSON.stringify(error));
    return null;
  }

  if (data.showTutorial === false){
    console.log("line 1392 if statement hit. You already disabled it lol");
    return false;
  }

  console.log("showTutorial is now:", data.showTutorial);
  return data.showTutorial;
}

export async function keepDBOnline(){
  const id = 1;
  const {data, error } = await DBClient
  .from('keepDBOnline')
  .select('id')
  .eq('id', id)
  .single()

  return data;
}

export async function countAllCharacters(){
  const { count, error } = await DBClient
    .from('character') // remove the 's'
    .select('*', { count: 'exact', head: true })

  if (error) throw error
  return count
}

export async function countPlayersInCampaign(campainId) {
  const {count, error} = await DBClient
    .from('inCampaign')
    .select('*', { count: 'exact', head: true })
    .eq('campaignId', campainId)
    if (error) throw error 
    return count;
} 

export async function removeInvite(inviteId) {
  const { data, error } = await DBClient
    .from('Invites')
    .delete('*')
    .eq('id', inviteId)
    .select()

  if (error) {
    console.error('Error removing from Invites:', error)
    throw error
  }
  return data?.[0] || null
}

export async function addInvite(userId, username, pfp, campaignId){
  const {data, error} = await DBClient
  .from('Invites')
  .insert([{ userid: userId, username: username, profilePicture: pfp, campaignId: campaignId}])
  .select()

if (error) {
  console.error('Error adding to Invites', error)
  throw error
}
return;
}

export async function getInvites(campaignId){
   const {data, error} = await DBClient
  .from('Invites')
  .select('*')
  .eq('campaignId', campaignId)

if (error) {
  console.error('Error getting invites', error)
  throw error
}
return data;
}

export async function isUserInInvites(userId, campaignId){
  const {data, error} = await DBClient
  .from('Invites')
  .select('*')
  .eq('userid', userId)
  .eq('campaignId', campaignId)
  .maybeSingle()
if (error) {
  console.error('Error Checking for user in invites', error)
  throw error;
}

return !! data;
}

export async function getInviteById(id){
  const {data, error} = await DBClient
  .from('Invites')
  .select("*")
  .eq('id', id)
if (error) {
  console.error('Error finding invite', error);
  throw error;
}
return data[0];
}


