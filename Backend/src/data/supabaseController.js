import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { PDFDocument } from "pdf-lib";

// Read in environment variables
dotenv.config()
const SUPABASE_URL = process.env.SUPABASE_URL ?? 'http://localhost:3000'
const SUPABASE_PUB_KEY = process.env.SUPABASE_PUB_KEY ?? 'badKey'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY

// Make database client object (does not connect until first query)
// Prefer service role key so server routes bypass RLS; fallback to anon/public if missing.
export const DBClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_PUB_KEY)

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

// Checks what the user's role is in a campaign
export async function checkUserRole(userId, campaignId) {
  const { data, error } = await DBClient
    .from('inCampaign')
    .select('Role')
    .select('Role')
    .eq('userId', userId)
    .eq('campaignId', campaignId)
    .maybeSingle()

  if (error) throw error
  return data?.Role || null
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
export async function createCharacter({ id, name, image, backstory, createdBy }) {
  // Build insert object and include createdBy only if provided
  const insertObj = { id, name, image, backstory }
  if (createdBy) insertObj.createdBy = createdBy

  const { data, error } = await DBClient
    .from('character')
    .insert([insertObj])
    .select() // ← this ensures `data` is returned!

  if (error) {
    console.error('createCharacter error:', error)
    throw error
  }

  // return the single inserted character (supabase returns an array)
  return data && data[0]
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
export async function checkAdminPerm(userId, campaignId) {
  const role = await checkUserRole(userId, campaignId)
  if (!role || (role !== 'DM' && role !== 'Co DM' && role !== 'Admin')) {
    const err = new Error('Invalid permissions: Only DMs and Co-DMs can update recaps.')
    err.status = 403
    throw err
  }
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
    .select('id, name, image, backstory, Level, createdBy')
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
      image: character.image,
      characterBackstory: character.backstory,
      level: link.level || character.Level,
      username: user.username || 'Unknown',
      addBackstory: link.addBackstory,
      createdBy: character.createdBy
    }
  })

  return mappedCharacters
}

// Add a character to a campaign (creates charCampLink entry)
export async function addCharacterToCampaign(characterId, campaignId, userId) {
  if (!characterId || !campaignId || !userId) {
    throw new Error('characterId, campaignId, and userId are required')
  }

  // Get the character's backstory to copy into charCampLink
  const { data: charData, error: charErr } = await DBClient
    .from('character')
    .select('backstory')
    .eq('id', characterId)
    .single()

  if (charErr) throw charErr

  const { data, error } = await DBClient
    .from('charCampLink')
    .insert([{
      characterId,
      campaignId,
      userId,
      level: 1, // Default to level 1 when adding character
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

// Shared helpers for recap PDF handling
const toUint8 = (val) => {
  if (!val) return null;
  if (val instanceof Uint8Array) return val;
  if (Buffer.isBuffer(val)) return new Uint8Array(val);
  if (typeof val === 'object' && Array.isArray(val.data)) {
    // Supabase can return { type: 'Buffer', data: [...] }
    return new Uint8Array(val.data);
  }
  if (typeof val === 'string') {
    // Try hex (Postgres bytea often comes back like "\\x....")
    const cleaned = val.startsWith('\\x') ? val.slice(2) : val;
    try {
      const hexBuf = Buffer.from(cleaned, 'hex');
      if (hexBuf.length) return new Uint8Array(hexBuf);
    } catch (_) { /* ignore */ }
    // Fallback: attempt base64
    try {
      const b64Buf = Buffer.from(cleaned, 'base64');
      if (b64Buf.length) return new Uint8Array(b64Buf);
    } catch (_) { /* ignore */ }
  }
  return null;
};

const hasPdfHeader = (bytes) =>
  bytes &&
  bytes.length >= 4 &&
  bytes[0] === 0x25 && // %
  bytes[1] === 0x50 && // P
  bytes[2] === 0x44 && // D
  bytes[3] === 0x46;   // F

// --- Save Data to Database ---
export async function savePdf(){
  const { error } = await DBClient
  .from("updatedCampaign")
    .update({
      sessionRecap: savePDF, // <- direct bytea write
    })
    .eq("campaignId", campaignId);

  if (updateError) throw updateError;

  return { success: true };
}

// --- Create/edit recap ---
export async function updateRecap(userId, campaignId, recapText = '') {
  /*checkAdminPerm(userId, campaignId);
  const { data, error } = await DBClient
  .from('updatedCampaign')
  .select('sessionRecap')
  
  let pdfDoc;

  if (!data || data.sessionRecap === null){
    //create pdf file and store it to the database
    pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    page.drawText(recapText || "New Recap");
  }
  else{
    //open pdf file to edit and store changes
    const existingPDF = data.recap;
    dpfDoc = await PDFDocument.load(existingPDF);
    const page = pdfDoc.addPage();
    page.drawText(recap);
  }

  const savedPDF = await pdfDoc.save();

  const { error:UpdateError } = await DBClient
    .from("updatedCampaign")
    .update({ sessionRecap: savedPDF, 
      })
    .eq("campaignId", campaignId);

  if (updateError) throw updateError;

  return { success: true };

}
*/
  await checkAdminPerm(userId, campaignId);

  // Get existing PDF if available
  const { data, error } = await DBClient
    .from("updatedCampaign")
    .select("sessionRecap")
    .eq("id", campaignId)
    .maybeSingle();

  if (error) throw error

  let existingRecap = toUint8(data?.sessionRecap)

  if (!hasPdfHeader(existingRecap)) {
    existingRecap = null;
  }

  let pdfDoc;
  let currentText = recapText || '';

  if (!existingRecap) {
    // --------------------------------------------------
    // CREATE NEW PDF WITH FILLABLE FIELDS
    // --------------------------------------------------
    pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // Make a form
    const form = pdfDoc.getForm();

    // Create a text field (editable)
    const recapField = form.createTextField("recap");
    recapField.setText(recapText || "Enter recap here...");
    currentText = recapText || "Enter recap here...";
    recapField.enableMultiline();
    recapField.addToPage(page, {
      x: 50,
      y: 600,
      width: 500,
      height: 150,
    });

    page.drawText("Session Recap:", { x: 50, y: 760, size: 20 });

  } else {
    // --------------------------------------------------
    // LOAD EXISTING PDF & KEEP FORM FIELDS
    // --------------------------------------------------
    try {
      pdfDoc = await PDFDocument.load(existingRecap);
      const form = pdfDoc.getForm();
      let recapField;
      try {
        recapField = form.getTextField("recap");
      } catch {
        recapField = form.createTextField("recap");
        recapField.enableMultiline();
        recapField.addToPage(pdfDoc.addPage([600, 800]), {
          x: 50,
          y: 600,
          width: 500,
          height: 150,
        });
      }
      const newText = (recapText && recapText.length) ? recapText : (recapField.getText() || '');
      recapField.setText(newText || '');
      currentText = newText || '';
    } catch (e) {
      console.warn('Existing recap was not a valid PDF, recreating:', e?.message || e);
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const form = pdfDoc.getForm();
      const recapField = form.createTextField("recap");
      recapField.setText(recapText || "Enter recap here...");
      currentText = recapText || "Enter recap here...";
      recapField.enableMultiline();
      recapField.addToPage(page, {
        x: 50,
        y: 600,
        width: 500,
        height: 150,
      });
      page.drawText("Session Recap:", { x: 50, y: 760, size: 20 });
    }
  }

  const pdfBytes = await pdfDoc.save();

  // --------------------------------------------------
  // SAVE PDF BACK INTO SUPABASE BYTEA
  // --------------------------------------------------
  await DBClient
    .from("updatedCampaign")
    .update({ sessionRecap: Buffer.from(pdfBytes) })
    .eq("id", campaignId);

  const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
  return { success: true, pdfBytes, pdfBase64, recapText: currentText };
}

// Fetch recap (text + pdf) for a campaign
export async function getRecap(campaignId) {
  const { data, error } = await DBClient
    .from("updatedCampaign")
    .select("sessionRecap")
    .eq("id", campaignId)
    .maybeSingle();

  if (error) throw error

  const existingRecap = toUint8(data?.sessionRecap)
  let pdfBytes = null
  let recapText = ''

  if (hasPdfHeader(existingRecap)) {
    pdfBytes = existingRecap
    try {
      const pdfDoc = await PDFDocument.load(existingRecap)
      const form = pdfDoc.getForm()
      const recapField = form.getTextField("recap")
      recapText = recapField?.getText?.() || ''
    } catch (e) {
      console.warn('Failed to read recap PDF:', e?.message || e)
    }
  }

  const pdfBase64 = pdfBytes ? Buffer.from(pdfBytes).toString('base64') : null
  return { recapText, pdfBytes, pdfBase64 }
}




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

// UPLOADMAP: Save a map image to the database for a campaign
// Stores the image as bytea in the maps table linked to a campaign and creator
export async function uploadMap(campaignId, createdBy, imageData) {
  if (!campaignId || !createdBy) {
    throw new Error('campaignId and createdBy are required')
  }

  console.log('[uploadMap] Inserting map for campaign:', campaignId, 'Base64 length:', imageData.length) // Debug

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

  console.log('[uploadMap] Successfully inserted, returning data:', data?.[0]?.id) // Debug
  return data?.[0] || null
}

// GETMAPFORCAMPAIGN: Retrieve the most recent map for a campaign
export async function getMapForCampaign(campaignId) {
  if (!campaignId) {
    throw new Error('campaignId is required')
  }

  console.log('[getMapForCampaign] Fetching map for campaign:', campaignId) // Debug

  const { data, error } = await DBClient
    .from('maps')
    .select('id, map, createdBy, campaign')
    .eq('campaign', campaignId)
    .order('id', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 means no rows returned, which is ok
    console.error('[getMapForCampaign] Error:', error)
    throw error
  }

  if (!data) {
    console.log('[getMapForCampaign] No map found for campaign:', campaignId) // Debug
  } else {
    console.log('[getMapForCampaign] Found map, buffer size:', data.map?.length || 0) // Debug
  }

  return data || null
}

