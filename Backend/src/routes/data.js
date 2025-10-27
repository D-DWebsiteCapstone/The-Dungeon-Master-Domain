// Import the express library
import Express from 'express'
import { insertCampaign, getCampaign, getCampaignByJoinCode, listCampaigns } from '../data/supabaseController.js'
/**
 * Data endpoints concerned with accessing the database
 * - Allow basic CRUD operations for all database entities
 **/

// Create a new express router object to hold all endpoints
const router = new Express.Router()



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
router.post('/campaign', async (req, res) => {
  try {
    const { title } = req.body
    if (!title) return res.status(400).json({ valid: false, message: 'Missing campaign title' })

    const id = generateId()
    const joinCode = generateId()
    const roleName = 'DM'
    const userId = null
    const selectedCharacter = null

    const campaign = await insertCampaign({ id, title, userId, roleName, selectedCharacter, joinCode })

    res.json({ valid: true, campaign })
  } catch (err) {
    console.error('Error creating campaign:', err)
    res.status(500).json({ valid: false, message: 'Failed to create campaign' })
  }
})

router.post('/campaign/join', async (req, res) => {
  try {
    const { joinCode } = req.body
    if (!joinCode) return res.status(400).json({ valid: false, message: 'Missing join code' })

    const existing = await getCampaignByJoinCode(joinCode)
    if (!existing) return res.status(404).json({ valid: false, message: 'Invalid join code' })

    const roleName = 'Player'
    const userId = null
    const selectedCharacter = null

    // You could later insert a "player record" here if you have one,
    // for now just return the campaign info
    res.json({ valid: true, campaign: existing, roleName })
  } catch (err) {
    console.error('Error joining campaign:', err)
    res.status(500).json({ valid: false, message: 'Failed to join campaign' })
  }
})

// Export the router for importing in other files
export default router
