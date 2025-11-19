// Import the express library
import Express from 'express'
import { getCampaign, listCampaigns, insertCampaign, insertInCampaign, isUserInCampaign, getCampaignByJoinCode, generateJoinCode, updateRecap} from '../data/supabaseController.js'
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

// Configure all routes that come after to accept JSON data in their body (post requests only)
// These will likely be the 'create' or 'update' routes only.
// IMPORTANT: The request Content-Type must be 'application/json' or the body will be ignored.
router.use(Express.json())

function generateId(length = 12) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}


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
router.post('/campaign/join', async (req, res) => {
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

// Campaign notes update route
/*router.post('/campaign/notes/:username/:characterId', async (req, res) => {
  try {

  } catch (err) {
    console.error('Error updating notes:', err)
    res.status(500).json({ valid: false, message: 'Failed to update notes'})
  }
})*/

//Update recap route
//router.post('/campaign/notes/:userID/:campaignId')

// Export the router for importing in other files
export default router