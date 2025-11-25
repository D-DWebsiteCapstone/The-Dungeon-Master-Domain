// Import the express library
import Express from 'express'
import { getCampaign, listCampaigns,getMembersForCampaign, insertCampaign, insertInCampaign, isUserInCampaign, getCampaignByJoinCode, generateJoinCode, DBClient } from '../data/supabaseController.js'
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


router.post('/campaign/join', authenticate, async (req, res) => {
  try {
    const { joinCode } = req.body
    const userId = req.user.id
    if (!joinCode) return res.status(400).json({ valid: false, message: 'Missing join code' })

    const campaign = await getCampaignByJoinCode(joinCode)
    if (!campaign) return res.status(404).json({ valid: false, message: 'Invalid join code' })

    // Prevent double joining
    const alreadyIn = await isUserInCampaign(userId, campaign.id)
    if (alreadyIn) {
      return res.status(409).json({ valid: false, message: 'Already joined this campaign' })
    }

    const membership = await insertInCampaign({ userId, campaignId: campaign.id, role: 'Player' })
    res.json({ valid: true, campaign, membership })
  } catch (err) {
    console.error('Error joining campaign:', err)
    res.status(500).json({ valid: false, message: 'Failed to join campaign', error: err.message })
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


// Export the router for importing in other files
export default router