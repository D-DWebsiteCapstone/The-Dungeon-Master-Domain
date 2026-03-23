// Import the express library
import Express from 'express'
import { getCampaign, listCampaigns,getMembersForCampaign, insertCampaign, insertInCampaign, isUserInCampaign, getCampaignByJoinCode, generateJoinCode, DBClient, getCampaignCards , updateRecap, isUserBannedFromCampaign, getRecap, saveZoomTokens, getZoomTokens, insertZoomMeeting, getZoomMeetingBySchedule, getCampaignCharacters, uploadMap, getMapForCampaign, deleteMapsForCampaign, updateCharacterLevel, updateCharacterBackstory, addCharacterToCampaign, removeCharacterFromCampaign, updateRules, loadBannedCampaign, createRecap} from '../data/supabaseController.js'
import crypto from 'crypto'
import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import bot from '../index.js'
dotenv.config()

/**
 * Data endpoints concerned with accessing the database
 * - Allow basic CRUD operations for all database entities
 **/

// Create a new express router object to hold all endpoints
const router = new Express.Router()

// Helpers
// Grace window before a planned session is considered expired
const GRACE_MS = 5 * 60 * 1000 // 5 minutes (testing)
function parseClientOffset(req) {
  const raw =
    req.headers['x-timezone-offset'] ??
    req.headers['x-client-offset'] ??
    req.headers['x-client-tz']
  const num = Number(raw)
  return Number.isFinite(num) ? num : 0
}
function combineDateTime(dateInput, timeStr, offsetMinutes = 0) {
  if (!dateInput) return null
  let dateObj
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('-').map(Number)
    if (parts.length >= 3) {
      const [y, m, d] = parts
      dateObj = new Date(y, (m || 1) - 1, d || 1)
    } else {
      dateObj = new Date(dateInput)
    }
  } else {
    dateObj = new Date(dateInput)
  }
  if (Number.isNaN(dateObj.getTime())) return null
  const time = timeStr || '00:00'
  const [h, mm] = time.split(':').map(Number)

  // Interpret the provided date/time as being in the client's timezone.
  // new Date(..., trueLocal) would use server TZ; instead build UTC and add client offset.
  const offset = Number.isFinite(Number(offsetMinutes)) ? Number(offsetMinutes) : 0
  const utcMs = Date.UTC(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    h || 0,
    mm || 0,
    0,
    0
  )
  return new Date(utcMs + offset * 60 * 1000)
}

function normalizeSchedules(list = [], offsetMinutes = 0) {
  return list
}

// Middleware for auth
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ valid: false, message: 'No token' })
  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ valid: false, message: 'Invalid token' })
  }
}

async function ensureDM(req, res, next) {
  try {
    const campaignId = req.params.campaignId || req.params.id;
    const userId = req.user.id;

    const { data, error } = await DBClient
      .from("inCampaign")
      .select("Role")
      .eq("campaignId", campaignId)
      .eq("userId", userId)
      .single();

    if (error || !data || data.Role !== "DM") {
      return res.status(403).json({ valid: false, message: "DM permissions required" });
    }

    next();
  } catch (err) {
    console.error("ensureDM failed:", err);
    res.status(500).json({ valid: false, message: "Server error" });
  }
}

async function ensureMember(req, res, next) {
  try {
    const campaignId = req.params.campaignId || req.params.id
    const userId = req.user.id

    const { data, error } = await DBClient
      .from('inCampaign')
      .select('userId')
      .eq('campaignId', campaignId)
      .eq('userId', userId)
      .single()

    if (error || !data) {
      return res.status(403).json({ valid: false, message: 'Membership required' })
    }

    next()
  } catch (err) {
    console.error('ensureMember failed:', err)
    res.status(500).json({ valid: false, message: 'Server error' })
  }
}

async function ensureAdmin(req, res, next) {
  try {
    const userId = req.user.id;

    const { data, error } = await DBClient
      .from("UserRole")
      .select("rolename")
      .eq("userid", userId)
      .single();

    if (error || !data || data.rolename !== "Admin") {
      return res.status(403).json({ valid: false, message: "Admin privileges required" });
    }

    next();
  } catch (err) {
    console.error("ensureAdmin failed:", err);
    res.status(500).json({ valid: false, message: "Server error" });
  }
}


// Configure all routes that come after to accept JSON data in their body (post requests only)
// These will likely be the 'create' or 'update' routes only.
// IMPORTANT: The request Content-Type must be 'application/json' or the body will be ignored.
router.use(Express.json())

// Members route must be declared before the generic paged list route so Express
// doesn't treat 'members' as the ':perPage' parameter on the paged route.


function generateId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

//this is the route to get members
router.get('/campaign/:campaignId/members', async (req, res) => {
  const { campaignId } = req.params;

  try {
    // 1. Get all membership rows for this campaign
    const { data: membershipRows, error: membershipErr } = await DBClient
      .from('inCampaign')
      .select('userId, Role')
      .eq('campaignId', campaignId);

    if (membershipErr) throw membershipErr;

    if (!membershipRows || membershipRows.length === 0) {
      return res.json({ valid: true, members: [] });
    }

    // 2. Extract userIds
    const userIds = membershipRows.map(m => m.userId);

    // 3. Get the users
    const { data: users, error: userErr } = await DBClient
      .from('Users')
      .select('userid, username')
      .in('userid', userIds);

    if (userErr) throw userErr;

    // 4. Combine users + roles
    const members = membershipRows.map(m => {
      const foundUser = users.find(u => u.userid === m.userId);
      return {
        userId: m.userId,
        username: foundUser?.username ?? "Unknown",
        role: m.Role
      };
    });

    return res.json({ valid: true, members });

  } catch (err) {
    console.error("GET /campaign/:campaignId/members FAILED:", err);
    return res.status(500).json({ valid: false, message: "Internal error." });
  }
});

// Remove a member from a campaign (DM only)
router.delete('/campaign/:campaignId/member/:userId', authenticate, ensureDM, async (req, res) => {
  const { campaignId, userId } = req.params
  try {
    // Prevent deleting if not found
    const { data: existing, error: existErr } = await DBClient
      .from('inCampaign')
      .select('*')
      .eq('campaignId', campaignId)
      .eq('userId', userId)
      .maybeSingle()

    if (existErr) throw existErr
    if (!existing) return res.status(404).json({ valid: false, message: 'Member not found' })

    // Remove user's characters from campaign first
    const { error: charError } = await DBClient
      .from('charCampLink')
      .delete()
      .eq('campaignId', campaignId)
      .eq('userId', userId)

    if (charError) {
      console.error('Failed to remove characters:', charError)
      // Continue anyway - don't block member removal
    }

    // Remove the user from the campaign
    const { error } = await DBClient
      .from('inCampaign')
      .delete()
      .eq('campaignId', campaignId)
      .eq('userId', userId)

    if (error) throw error
    return res.json({ valid: true, message: 'Member removed' })
  } catch (err) {
    console.error('DELETE member failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to remove member' })
  }
})

// Allow a player to leave the campaign themselves (no DM required)
router.post('/campaign/:campaignId/leave', authenticate, async (req, res) => {
  const { campaignId } = req.params
  const userId = req.user?.id // Get userId from authenticated token
  
  try {
    if (!userId) {
      return res.status(401).json({ valid: false, message: 'User not authenticated' })
    }

    // Check if user is in the campaign
    const { data: existing, error: existErr } = await DBClient
      .from('inCampaign')
      .select('*')
      .eq('campaignId', campaignId)
      .eq('userId', userId)
      .maybeSingle()

    if (existErr) throw existErr
    if (!existing) {
      return res.status(404).json({ valid: false, message: 'You are not a member of this campaign' })
    }

    // Prevent DM from leaving via this route
    if (existing.Role === 'DM') {
      return res.status(403).json({ valid: false, message: 'DMs cannot leave their own campaign. Use delete campaign instead.' })
    }

    // Remove user's characters from campaign first
    const { error: charError } = await DBClient
      .from('charCampLink')
      .delete()
      .eq('campaignId', campaignId)
      .eq('userId', userId)

    if (charError) {
      console.error('Failed to remove characters when leaving:', charError)
      // Continue anyway - don't block leaving
    }

    // Remove the user from the campaign
    const { error } = await DBClient
      .from('inCampaign')
      .delete()
      .eq('campaignId', campaignId)
      .eq('userId', userId)

    if (error) throw error
    
    return res.json({ valid: true, message: 'You have left the campaign' })
  } catch (err) {
    console.error('POST leave campaign failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to leave campaign' })
  }
})

// Change a member's role (DM only)
router.post('/campaign/:campaignId/change-role', authenticate, ensureDM, async (req, res) => {
  const { campaignId } = req.params
  const { userId, role } = req.body || {}
  const allowed = ['Player', 'Co DM', 'DM']
  if (!userId || !role) return res.status(400).json({ valid: false, message: 'Missing userId or role' })
  if (!allowed.includes(role)) return res.status(400).json({ valid: false, message: 'Invalid role' })

  try {
    // Ensure membership exists
    const { data: existing, error: existErr } = await DBClient
      .from('inCampaign')
      .select('*')
      .eq('campaignId', campaignId)
      .eq('userId', userId)
      .maybeSingle()

    if (existErr) throw existErr
    if (!existing) return res.status(404).json({ valid: false, message: 'Member not found' })

    const { data, error } = await DBClient
      .from('inCampaign')
      .update({ Role: role })
      .eq('campaignId', campaignId)
      .eq('userId', userId)
      .select('*')
      .single()

    if (error) throw error
    return res.json({ valid: true, membership: data })
  } catch (err) {
    console.error('POST change-role failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to change role' })
  }
})

// Campaign list route: retrieve a list of campaigns (limited and summarized)
// - Matches get requests at http://localhost:3000/data/campaign/page/count
router.get('/campaign/list-all', authenticate, async (req, res) => {
  try {
    const campaigns = await DBClient
      .from('updatedCampaign')
      .select('id, title, joinCode')

    res.json({ valid: true, campaigns: campaigns.data })
  } catch (err) {
    console.error(err)
    res.json({ valid: false, message: "Failed to load campaigns" })
  }
})

// Campaigns for current user (with role)
router.get('/campaign/my', authenticate, async (req, res) => {
  try {
    // Token carries user id
    const userId = req.user.id
    const { data: user, error: userErr } = await DBClient
      .from('Users')
      .select('username')
      .eq('userid', userId)
      .single()

    if (userErr) throw userErr
    if (!user?.username) return res.json({ valid: true, campaigns: [] })

    const campaigns = await getCampaignCards(user.username)
    res.json({ valid: true, campaigns })
  } catch (err) {
    console.error('Error loading my campaigns:', err)
    res.status(500).json({ valid: false, message: 'Failed to load campaigns' })
  }
})

// Get all characters linked to a campaign
router.get('/campaign/:campaignId/characters', async (req, res) => {
  try {
    const { campaignId } = req.params

    if (!campaignId) {
      return res.status(400).json({ valid: false, message: 'campaignId is required' })
    }

    const characters = await getCampaignCharacters(campaignId)
    return res.json({ valid: true, characters })
  } catch (err) {
    console.error('GET campaign characters failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to load campaign characters' })
  }
})

// Upload a map for a campaign
router.post('/campaign/:campaignId/map', async (req, res) => {
  try {
    const { campaignId } = req.params
    const { imageData } = req.body
    const createdBy = req.body.createdBy || 'unknown'

    console.log('[POST map] Received upload for campaign:', campaignId, 'by:', createdBy) // Debug
    console.log('[POST map] ImageData length:', imageData?.length || 0) // Debug

    if (!campaignId || !imageData) {
      return res.status(400).json({ valid: false, message: 'campaignId and imageData are required' })
    }

    // Store the base64 string directly (without data:image prefix)
    const base64Data = imageData.replace(/^data:image\/[^;]+;base64,/, '')
    
    console.log('[POST map] Base64 data length:', base64Data.length) // Debug

    const result = await uploadMap(campaignId, createdBy, base64Data)
    console.log('[POST map] Upload result:', result) // Debug
    return res.json({ valid: true, message: 'Map uploaded successfully', map: result })
  } catch (err) {
    console.error('POST map upload failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to upload map' })
  }
})

// Get the most recent map for a campaign
router.get('/campaign/:campaignId/map', async (req, res) => {
  try {
    const { campaignId } = req.params

    console.log('[GET map] Fetching map for campaign:', campaignId) // Debug

    if (!campaignId) {
      return res.status(400).json({ valid: false, message: 'campaignId is required' })
    }

    const mapData = await getMapForCampaign(campaignId)
    
    if (!mapData) {
      console.log('[GET map] No map found, returning null') // Debug
      return res.json({ valid: true, map: null, message: 'No map found for this campaign' })
    }

    console.log('[GET map] mapData.map type:', typeof mapData.map) // Debug
    console.log('[GET map] mapData.map preview:', mapData.map.substring(0, 100)) // Debug
    
    // Handle different encodings from Supabase bytea column
    let base64Map = mapData.map
    
    // If it starts with \x, it's hex-encoded bytea from PostgreSQL
    if (typeof base64Map === 'string' && base64Map.startsWith('\\x')) {
      console.log('[GET map] Detected hex encoding, converting to base64')
      // Remove \x prefix and convert hex to buffer, then to base64
      const hexString = base64Map.slice(2)
      base64Map = Buffer.from(hexString, 'hex').toString('utf8')
    }
    
    const mimeType = 'image/png' // Adjust if you support other formats
    const dataUrl = `data:${mimeType};base64,${base64Map}`

    console.log('[GET map] Final base64 length:', base64Map.length) // Debug
    console.log('[GET map] Data URL preview:', dataUrl.substring(0, 80) + '...') // Debug

    return res.json({ 
      valid: true, 
      map: dataUrl,
      createdBy: mapData.createdBy,
      id: mapData.id
    })
  } catch (err) {
    console.error('[GET map] Error:', err)
    return res.status(500).json({ valid: false, message: 'Failed to retrieve map' })
  }
})

// Delete all maps for a campaign
router.delete('/campaign/:campaignId/map', async (req, res) => {
  try {
    const { campaignId } = req.params

    console.log('[DELETE map] Deleting maps for campaign:', campaignId)

    if (!campaignId) {
      return res.status(400).json({ valid: false, message: 'campaignId is required' })
    }

    await deleteMapsForCampaign(campaignId)
    
    console.log('[DELETE map] Successfully deleted all maps')
    return res.json({ valid: true, message: 'Maps deleted successfully' })
  } catch (err) {
    console.error('[DELETE map] Error:', err)
    return res.status(500).json({ valid: false, message: 'Failed to delete maps' })
  }
})

// Route to update campaign rules (use POST). Declared before dynamic routes
// so this specific route doesn't get swallowed by '/campaign/:id'.
router.post('/campaign/rules', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id
    const { campaignId, rulesText = '' } = req.body || {}

    if (!campaignId) {
      return res.status(400).json({ valid: false, message: 'campaignId is required' })
    }

    const result = await updateRules(userId, campaignId, rulesText)
    return res.json({ valid: true, ...result })
  } catch (err) {
    const status = err?.status || 500
    const message = err?.message || 'Failed to update rules'
    console.error('Error updating rules:', err)
    res.status(status).json({ valid: false, message })
  }
})

// Get banned members for a campaign - MUST come before pagination route
router.get('/campaign/:campaignId/bannedMembers', async (req, res) => {
  const { campaignId } = req.params;
  console.log('\n=== DEBUG: bannedMembers endpoint called ===');
  console.log('campaignId:', campaignId);
  
  if (!campaignId) {
    return res.status(400).json({ valid: false, message: 'campaignId is required' });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ valid: false, message: 'Missing token' });

  try {
    // Verify token and get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
    const userId = decoded.id;
    console.log('User ID from token:', userId);

    // Check if user is a DM in this campaign
    const role = await getMembersForCampaign(campaignId);
    console.log('Members in campaign:', role.length);
    const userInCampaign = role.find(m => m.userId === userId);
    console.log('Current user in campaign:', userInCampaign);
    
    if (!userInCampaign || (userInCampaign.role !== 'DM' && userInCampaign.role !== 'Co DM')) {
      return res.status(403).json({ valid: false, message: 'Only DMs can view banned members' });
    }

    console.log('Calling loadBannedCampaign...');
    const banned = await loadBannedCampaign(campaignId);
    console.log('Received banned data:', banned);
    console.log('Banned data type:', typeof banned);
    console.log('Banned data is array:', Array.isArray(banned));
    console.log('Banned data length:', banned?.length);
    
    const response = { valid: true, banned };
    console.log('Sending response:', JSON.stringify(response).substring(0, 200));
    console.log('=== END DEBUG ===\n');
    
    return res.json(response);
  } catch (err) {
    console.error('Failed to get banned users:', err);
    console.log('=== END DEBUG (ERROR) ===\n');
    return res.status(500).json({ valid: false, message: 'Failed to get banned users' });
  }
});

// Generic pagination route - MUST come after all specific routes
router.get('/campaign/:page/:perPage', async (req, res) => {
    // Read the URL parameters
    const page = Number(req.params.page)
    const perPage = Number(req.params.perPage)

    // Get all campaigns from the database using offset and limit SQL parameters
    // Be sure to only include limited data (like campaign name and id) not all data
    const campaignList = await listCampaigns((page - 1) * perPage, perPage)

    // Return data as JSON
    res.json({ valid: true, campaignList })
})

// Campaign read route: retrieve full data about a specific campaign
// - Matches get requests at http://localhost:3000/data/campaign/id
router.get('/campaign/:id', async (req, res) => {
    // If you use a number as your ID, adjust this to turn this into a Number()
    const campaignId = req.params.id

    // Lookup a single campaign using its id and return ALL data
    const campaign = await getCampaign(campaignId)

    // If the campaign doesn't exist, return a 404 error
    if (!campaign) {
        res.status(404).json({ valid: false, message: 'Campaign not found' })
    } else {
        // Return data as JSON
        res.json({ valid: true, campaign })
    }
})

// Campaign create route
router.post('/campaign', authenticate, async (req, res) => {
  try {
    const { title } = req.body
    if (!title) return res.status(400).json({ valid: false, message: 'Missing campaign title' })

    const id = crypto.randomUUID()
    const joinCode = generateId()
    const userId = req.user.id

    // Create campaign
    const campaign = await insertCampaign({ id, title, joinCode })
    if (!campaign) return res.status(500).json({ valid: false, message: 'Failed to insert campaign' })

    // Link creator as DM
    const membership = await insertInCampaign({ userId, campaignId: campaign.id, role: 'DM' })

    res.json({ valid: true, campaign, membership })
  } catch (err) {
    console.error('Error creating campaign:', err)
    res.status(500).json({ valid: false, message: 'Server error', error: err.message })
  }
})

// Campaign join route
router.post('/campaign/join', authenticate, async (req, res) => {
  try {
    const { joinCode } = req.body
    if (!joinCode) return res.status(400).json({ valid: false, message: 'Missing join code' })

    const userId = req.user && req.user.id
    if (!userId) return res.status(401).json({ valid: false, message: 'Authentication required' })

    console.log('[DATA ROUTES] join attempt by', userId, 'for code', joinCode)

    const campaign = await getCampaignByJoinCode(joinCode)
    if (!campaign) return res.status(404).json({ valid: false, message: 'Invalid join code' })

    // Prevent banned users from joining
    const banned = await isUserBannedFromCampaign(userId, campaign.id)
    if (banned) {
      return res.status(403).json({ valid: false, message: 'You are banned from this campaign' })
    }

    // Prevent double joining
    const alreadyIn = await isUserInCampaign(userId, campaign.id)
    if (alreadyIn) {
      return res.status(409).json({ valid: false, message: 'Already joined this campaign' })
    }

    const membership = await insertInCampaign({ userId, campaignId: campaign.id, role: 'Player' })
    res.json({ valid: true, campaign, membership })
  } catch (err) {
    console.error('Error joining campaign:', err && err.stack ? err.stack : err)
    res.status(500).json({ valid: false, message: 'Failed to join campaign', error: err && err.message ? err.message : String(err) })
  }
})

router.delete('/campaign/:campaignId', authenticate, async (req, res) => {
  const { campaignId } = req.params;
  const userId = req.user.id;

  try {
    const { data: membership } = await DBClient
      .from('inCampaign')
      .select('Role')
      .eq('campaignId', campaignId)
      .eq('userId', userId)
      .single();

    if (!membership || membership.Role !== 'DM') {
      return res.status(403).json({ valid: false, message: 'Only the DM can delete this campaign' });
    }

    await DBClient.from('inCampaign').delete().eq('campaignId', campaignId);

    const { error: deleteCampaignError } = await DBClient
      .from('updatedCampaign')
      .delete()
      .eq('id', campaignId); 

    if (deleteCampaignError) throw deleteCampaignError;

    res.json({ valid: true, message: 'Campaign deleted' });
  } catch (err) {
    console.error('DELETE campaign failed:', err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
});

router.delete('/admin/campaign/:campaignId', authenticate, ensureAdmin, async (req, res) => {
    try {
      const campaignId = req.params.campaignId;

      await DBClient.from("inCampaign")
        .delete()
        .eq("campaignId", campaignId);

      const { error } = await DBClient
        .from("updatedCampaign")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      res.json({ valid: true, message: "Campaign deleted by Admin" });

    } catch (err) {
      console.error("Admin delete failed:", err);
      res.status(500).json({ valid: false, message: "Server error" });
    }
  }
);

// === Schedule CRUD (per campaign) ===
router.get('/campaign/:campaignId/schedule', authenticate, ensureMember, async (req, res) => {
  const { campaignId } = req.params
  try {
    const { data, error } = await DBClient
      .from('Schedule')
      .select('*')
      .eq('campaignId', campaignId)
      .order('plannedSession', { ascending: true })

    if (error) throw error
    return res.json({ valid: true, schedule: normalizeSchedules(data || []) })
  } catch (err) {
    console.error('GET schedule failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to load schedule' })
  }
})

router.post('/campaign/:campaignId/schedule', authenticate, ensureDM, async (req, res) => {
  const { campaignId } = req.params
  const {
    plannedSession,
    plannedSessionTime = null,
    futureSession = null,
    futureSessionTime = null
  } = req.body || {}
  if (!plannedSession) {
    return res.status(400).json({ valid: false, message: 'plannedSession is required' })
  }
  try {
    // Upsert by campaignId without requiring a unique constraint on the table
    const { data: existing, error: existingErr } = await DBClient
      .from('Schedule')
      .select('*')
      .eq('campaignId', campaignId)
      .maybeSingle()
    if (existingErr && existingErr.code !== 'PGRST116') throw existingErr

    if (existing) {
      const { data, error } = await DBClient
        .from('Schedule')
        .update({ plannedSession, plannedSessionTime, futureSession, futureSessionTime })
        .eq('campaignId', campaignId)
        .select('*')
        .single()
      if (error) throw error
      return res.json({ valid: true, schedule: data })
    }

    const { data, error } = await DBClient
      .from('Schedule')
      .insert({ campaignId, plannedSession, plannedSessionTime, futureSession, futureSessionTime })
      .select('*')
      .single()

    if (error) throw error
    return res.json({ valid: true, schedule: data })
  } catch (err) {
    console.error('POST schedule failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to create schedule' })
  }
})

router.patch('/campaign/:campaignId/schedule/:scheduleId', authenticate, ensureDM, async (req, res) => {
  const { campaignId, scheduleId } = req.params
  const {
    plannedSession,
    plannedSessionTime,
    futureSession,
    futureSessionTime,
  } = req.body || {}

  if (
    plannedSession === undefined &&
    plannedSessionTime === undefined &&
    futureSession === undefined &&
    futureSessionTime === undefined
  ) {
    return res.status(400).json({ valid: false, message: 'Nothing to update' })
  }

  const update = {}
  if (plannedSession !== undefined) update.plannedSession = plannedSession
  if (plannedSessionTime !== undefined) update.plannedSessionTime = plannedSessionTime
  if (futureSession !== undefined) update.futureSession = futureSession
  if (futureSessionTime !== undefined) update.futureSessionTime = futureSessionTime

  try {
    const { data, error } = await DBClient
      .from('Schedule')
      .update(update)
      .eq('id', scheduleId)
      .eq('campaignId', campaignId)
      .select('*')
      .single()

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ valid: false, message: 'Schedule not found' })
    }
    if (error) throw error
    return res.json({ valid: true, schedule: data })
  } catch (err) {
    console.error('PATCH schedule failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to update schedule' })
  }
})

router.delete('/campaign/:campaignId/schedule/:scheduleId', authenticate, ensureDM, async (req, res) => {
  const { campaignId, scheduleId } = req.params
  try {
    const { error } = await DBClient
      .from('Schedule')
      .delete()
      .eq('id', scheduleId)
      .eq('campaignId', campaignId)

    if (error && error.code === 'PGRST116') {
      return res.status(404).json({ valid: false, message: 'Schedule not found' })
    }
    if (error) throw error
    return res.json({ valid: true })
  } catch (err) {
    console.error('DELETE schedule failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to delete schedule' })
  }
})

// My schedules across campaigns
router.get('/schedule/my', authenticate, async (req, res) => {
  const userId = req.user.id
  try {
    // campaigns the user is in
    const { data: memberships, error: memErr } = await DBClient
      .from('inCampaign')
      .select('campaignId')
      .eq('userId', userId)
    if (memErr) throw memErr
    const campaignIds = (memberships || []).map(m => m.campaignId)
    if (!campaignIds.length) return res.json({ valid: true, schedule: [] })

    const { data: schedules, error: schedErr } = await DBClient
      .from('Schedule')
      .select('id, campaignId, plannedSession, plannedSessionTime, futureSession, futureSessionTime')
      .in('campaignId', campaignIds)
    if (schedErr) throw schedErr

    const { data: campaigns, error: campErr } = await DBClient
      .from('updatedCampaign')
      .select('id, title')
      .in('id', campaignIds)
    if (campErr) throw campErr

    const titleMap = new Map((campaigns || []).map(c => [c.id, c.title]))
    const merged = normalizeSchedules(schedules || []).map(s => ({
      ...s,
      campaignTitle: titleMap.get(s.campaignId) || 'Campaign'
    }))

    return res.json({ valid: true, schedule: merged })
  } catch (err) {
    console.error('GET /schedule/my failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to load schedule' })
  }
})

//Campaign recap fetching
router.get('Recaps/:campaignId/description', authenticate, ensureMember, async (req, res) => {
  try {
    const {campaignId} = req.params;
    const result = await getRecap(campaignId);
    return res.json({valid: True, ...result});
  } catch (err) {
    const status = err?.status || 500;
    const message = err?.message || "Failed to load recap";
    console.error("Error loading recap:", err);
    res.status(status).json({ valid: false, message })
  }
})

//old recap fetch route
//router.get('/campaign/:campaignId/recap', authenticate, ensureMember, async (req, res) => 


// Add a character to a campaign
router.post('/campaign/character/add', authenticate, async (req, res) => {
  try {
    const { characterId, campaignId, userId } = req.body

    if (!characterId || !campaignId || !userId) {
      return res.status(400).json({ valid: false, message: 'characterId, campaignId, and userId are required' })
    }

    const result = await addCharacterToCampaign(characterId, campaignId, userId)
    return res.json({ valid: true, message: 'Character added to campaign', link: result })
  } catch (err) {
    console.error('POST add character failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to add character to campaign' })
  }
})

// Remove a character from a campaign
router.delete('/campaign/:campaignId/character/:characterId', async (req, res) => {
  try {
    const { campaignId, characterId } = req.params

    if (!campaignId || !characterId) {
      return res.status(400).json({ valid: false, message: 'campaignId and characterId are required' })
    }

    await removeCharacterFromCampaign(characterId, campaignId)
    return res.json({ valid: true, message: 'Character removed from campaign' })
  } catch (err) {
    console.error('DELETE character failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to remove character from campaign' })
  }
})

// Update a character's level in a campaign
router.put('/campaign/:campaignId/character/:characterId/level', async (req, res) => {
  try {
    const { campaignId, characterId } = req.params
    const { level } = req.body

    if (!campaignId || !characterId || level === undefined) {
      return res.status(400).json({ valid: false, message: 'campaignId, characterId, and level are required' })
    }

    const result = await updateCharacterLevel(characterId, campaignId, level)
    return res.json({ valid: true, message: 'Character level updated', link: result })
  } catch (err) {
    console.error('PUT character level failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to update character level' })
  }
})

// Update a character's backstory in a campaign
router.put('/campaign/:campaignId/character/:characterId/backstory', async (req, res) => {
  try {
    const { campaignId, characterId } = req.params
    const { backstory } = req.body

    if (!campaignId || !characterId || backstory === undefined) {
      return res.status(400).json({ valid: false, message: 'campaignId, characterId, and backstory are required' })
    }

    const result = await updateCharacterBackstory(characterId, campaignId, backstory)
    return res.json({ valid: true, message: 'Character backstory updated', link: result })
  } catch (err) {
    console.error('PUT character backstory failed:', err)
    return res.status(500).json({ valid: false, message: 'Failed to update character backstory' })
  }
})

// Campaign recap update route
router.post('/Recaps', authenticate, async (req, res) => {
  try {
    const userId = req.user?.id
    const { campaignId, recapText = '' } = req.body || {}

    if (!campaignId) {
      return res.status(400).json({ valid: false, message: 'campaignId is required' })
    }
    const result = await createRecap(campaignId, recapText)
    return res.json({ valid: true, ...result })
  } catch (err) {
    const status = err?.status || 500
    const message = err?.message || 'Failed to update notes'
    console.error('Error updating notes:', err)
    res.status(status).json({ valid: false, message })
  }
})
//old recap route
//router.post('/campaign/recap', authenticate, async (req, res) => 

// Upload a map image for a campaign
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const ZOOM_REDIRECT_URL =
  process.env.ZOOM_REDIRECT_URL ||
  'http://localhost:3000/data/zoom/oauth/callback'

function buildZoomAuthorizeUrl(userId) {
  const base = 'https://zoom.us/oauth/authorize'
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ZOOM_CLIENT_ID,
    redirect_uri: ZOOM_REDIRECT_URL,
    state: userId,
  })
  return `${base}?${params.toString()}`
}

router.get('/zoom/connect', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    const url = buildZoomAuthorizeUrl(userId)
    return res.json({ valid: true, url })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ valid: false, message: 'Failed to start Zoom OAuth' })
  }
})


function zoomBasicAuthHeader() {
  const creds = `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
  const base64 = Buffer.from(creds).toString('base64')
  return `Basic ${base64}`
}

router.get('/zoom/oauth/callback', async (req, res) => {
  const { code, state } = req.query
  if (!code || !state) return res.status(400).send('Missing Zoom OAuth parameters')

  try {
    const tokenUrl = `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(ZOOM_REDIRECT_URL)}`

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        Authorization: zoomBasicAuthHeader(),
      },
    })

    const data = await tokenResponse.json()
    if (!data.access_token) {
      console.error('Zoom token error:', data)
      return res.status(500).send('Could not get Zoom token')
    }

    const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

    await saveZoomTokens(state, data.access_token, data.refresh_token, expiresAt)

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173'
    return res.redirect(`${FRONTEND_URL}/Home`)
  } catch (err) {
    console.error('OAuth callback failed:', err)
    return res.status(500).send('Zoom OAuth Failed')
  }
})

async function getValidZoomAccessToken(userId) {
  const tokens = await getZoomTokens(userId)
  if (!tokens) throw new Error('Zoom not connected')

  const expiresAt = new Date(tokens.expiresAt).getTime()
  const now = Date.now()

  if (expiresAt - now > 60 * 1000) {
    return tokens.accessToken
  }

  // Refresh token
  const refreshUrl =
    `https://zoom.us/oauth/token?grant_type=refresh_token&refresh_token=${tokens.refreshToken}`

  const response = await fetch(refreshUrl, {
    method: 'POST',
    headers: { Authorization: zoomBasicAuthHeader() },
  })

  const data = await response.json()

  if (!data.access_token) {
    console.error('Zoom refresh error:', data)
    throw new Error('Failed to refresh token')
  }

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

  await saveZoomTokens(userId, data.access_token, data.refresh_token, newExpiresAt)

  return data.access_token
}

router.post(
  '/campaign/:campaignId/schedule/:scheduleId/zoom/create',
  authenticate,
  ensureDM,
  async (req, res) => {
    const { campaignId, scheduleId } = req.params
    const userId = req.user.id

    try {
      const { data: schedule, error } = await DBClient
        .from('Schedule')
        .select('*')
        .eq('id', scheduleId)
        .eq('campaignId', campaignId)
        .maybeSingle()

      if (!schedule) {
        return res.status(404).json({ valid: false, message: 'Schedule not found' })
      }

      const startDate = new Date(`${schedule.plannedSession}T${schedule.plannedSessionTime}`)

      const accessToken = await getValidZoomAccessToken(userId)

      const zoomBody = {
        topic: 'DnD Session',
        type: 2,
        start_time: startDate.toISOString(),
        duration: 180,
      }

      const createResponse = await fetch('https://api.zoom.us/v2/users/me/meetings', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zoomBody),
      })

      const meeting = await createResponse.json()

      if (!meeting.join_url) {
        console.error('Zoom meeting create error:', meeting)
        return res.status(500).json({ valid: false, message: 'Failed to create Zoom meeting' })
      }

      const saved = await insertZoomMeeting({
        scheduleId: Number(scheduleId),
        zoomMeetingId: meeting.id,
        joinUrl: meeting.join_url,
        startUrl: meeting.start_url,
      })

      return res.json({ valid: true, zoomMeeting: saved })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ valid: false, message: 'Zoom error' })
    }
  }
)

router.get('/zoom/by-schedule/:scheduleId', authenticate, async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.scheduleId, 10)

    if (isNaN(scheduleId)) {
      console.error("Invalid scheduleId:", req.params.scheduleId)
      return res.status(400).json({ valid: false, message: "Invalid schedule ID" })
    }

    const { data, error } = await DBClient
      .from('zoomMeetings')         
      .select('*')
      .eq('scheduleId', scheduleId) 
      .maybeSingle()

    if (error) {
      console.error("Supabase error fetching zoom meeting:", error)
      return res.status(500).json({ valid: false, message: error.message })
    }

    return res.json({ valid: true, zoomMeeting: data || null })

  } catch (err) {
    console.error("zoom/by-schedule crash:", err)
    return res.status(500).json({ valid: false, message: err.message })
  }
})

router.get('/campaign/:campaignId/rules',authenticate, ensureMember, async (req, res)=> {
  try {
    const { campaignId } = req.params
    const result = await getRules(campaignId)
    return res.json({ valid: true, ...result })
  } catch (err) {
    const status = err?.status || 500
    const message = err?.message || 'Failed to load rules'
    console.error('Error loading rules:', err)
    res.status(status).json({ valid: false, message })
    
  }
})

//Trouble Ticket Submission Route
router.post('/submit-ticket', async (req, res) => {
  const { username, email, issue, description } = req.body;
  
  const channel = await bot.channels.fetch(process.env.TICKET_CHANNEL);
  
  await channel.send({
    embeds: [{
      title: 'New Support Ticket',
      fields: [
        { name: 'Name', value: username },
        { name: 'Email', value: email },
        { name: 'Issue Type', value: issue },
        { name: 'Description', value: description }
      ],
      color: 0x0099ff,
      timestamp: new Date()
    }]
  });
  
  res.json({ success: true });
});

//fetches all campaigns

// (Removed duplicate/buggy GET handler for /campaign/rules - POST implemented earlier)



// Export the router for importing in other files
export default router

