// Import the express library
import Express from 'express'
import { getCampaign, listCampaigns, insertCampaign } from '../data/supabaseController.js'

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
    const { title, id, roleName, selectedCharacter } = req.body;

    if (!title || !id || !roleName) {
        return res.status(400).json({ valid: false, message: 'Missing required fields' });
    }

    try {
        const { data, error } = await insertCampaign({ title, id, roleName, selectedCharacter });

        if (error) {
            console.error("Supabase insert error:", error);
            return res.status(500).json({ valid: false, message: error.message });
        }

        if (!data || data.length === 0) {
            console.error("No data returned from Supabase insert.");
            return res.status(500).json({ valid: false, message: "Failed to create campaign (no data returned)" });
        }

        res.json({ valid: true, campaign: data[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ valid: false, message: 'Failed to create campaign' });
    }
})

// Export the router for importing in other files
export default router