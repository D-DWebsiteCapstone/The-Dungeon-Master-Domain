// Import the express library
import Express from 'express'
import { getCampaign, listCampaigns,getMembersForCampaign, insertCampaign, insertInCampaign, isUserInCampaign, getCampaignByJoinCode, generateJoinCode, DBClient, getCampaignCards , updateRecap, isUserBannedFromCampaign } from '../data/supabaseController.js'
import crypto from 'crypto'
import { nanoid } from 'nanoid'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
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
function combineDateTime(dateInput, timeStr) {
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
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), h || 0, mm || 0, 0, 0)
}

function normalizeSchedules(list = []) {
  return list.map(item => {
    const plannedDt = combineDateTime(item.plannedSession, item.plannedSessionTime)
    const futureDt = combineDateTime(item.futureSession, item.futureSessionTime)
    const pastGrace = plannedDt && Date.now() > plannedDt.getTime() + GRACE_MS
    if (pastGrace && futureDt) {
      return {
        ...item,
        plannedSession: item.futureSession,
        plannedSessionTime: item.futureSessionTime,
        futureSession: null,
        futureSessionTime: null,
      }
    }
    if (pastGrace && !futureDt) {
      return {
        ...item,
        plannedSession: null,
        plannedSessionTime: null,
      }
    }
    return item
  })
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
// Campaign notes update route
router.post('/campaign/notes', async (req, res) => {
  try {
    updateRecap()
  } catch (err) {
    console.error('Error updating notes:', err)
    res.status(500).json({ valid: false, message: 'Failed to update notes'})
  }
})

// Export the router for importing in other files
export default router
