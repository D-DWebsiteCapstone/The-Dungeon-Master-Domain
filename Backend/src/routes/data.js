// Import the express library
import Express from 'express'

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
router.get('/campaign/:page/:perPage', (req, res) => {
    // Read the URL parameters
    const page = Number(req.params.page)
    const perPage = Number(req.params.perPage)

    // Get all campaigns from the database using offset and limit SQL parameters
    // Be sure to only include limited data (like campaign name and id) not all data
    const offset = (page - 1) * perPage
    const limit = perPage
    // TODO: Call function in 'data/supabaseController.js' to get this data

    // Return data as JSON
    res.json({ valid: false })
})


// Campaign read route: retrieve full data about a specific campaign
// - Matches get requests at http://localhost:3000/data/campaign/id
router.get('/campaign/:id', (req, res) => {
    // If you use a number as your ID, adjust this to turn this into a Number()
    const campaignId = req.params.id

    // Lookup a single campaign using its id and return ALL data
    // TODO: Call function in 'data/supabaseController.js' to get this data

    // Return data as JSON
    res.json({ valid: false })
})

// Export the router for importing in other files
export default router
