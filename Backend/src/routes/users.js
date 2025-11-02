// Import the express library
import Express from 'express';
import { getLogin, checkUserRole, banUser } from '../data/supabaseController.js';
import { checkLoginCredentials } from '../../../Dnd Campaign Manager/src/lib/dataHelper.js';
const jwt = require('jsonwebtoken'); // used to create json web tokens
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';


/**
 * Data endpoints concerned with user accounts
 * - This allows creation and editing of a user account
 * - It also allows login and generation of an authentication token
 */

// Create a new express router object to hold all endpoints
const router = new Express.Router();

// Configure all routes that come after to accept JSON data in their body (post requests only)
// IMPORTANT: The request Content-Type must be 'application/json' or the body will be ignored.
router.use(Express.json());

// Login route: used to validate a user and generate an authorization token
// - Matches get requests at http://localhost:3000/user/login
router.post('/login', async (req, res) => {
    // TODO: This should probably be a POST route instead of get _/
    // -- send JSON data in the body of the post with the username and password (plaintext) _/
    // -- Validate the password with the username _/
    // -- return a JSON Web Token -or- reject the request

    //grabs username and password from request body
    const { username, password } = req.body;


    try {
        // login
        const login = await getLogin(username, password);

    if (!login) {
        console.log("Error 404");
        return res.status(401).json({ valid: false, message: 'Invalid username or password' });
    }

    const token = jwt.sign(
    { username: login.username, id: login.id }, // payload
    JWT_SECRET,
    { expiresIn: '1h' } // token expires in 1 hour
    );
    // Return data as JSON
        res.json({ valid: true, token });
    } catch (err){
    console.error(err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
    }
});


// Account creation route:
// - Matches post requests at http://localhost:3000/user/create
router.post('/create', (req, res) => {
    // Look for request data
    const requestData = req.body;

    // Verify that the expected data is present (email and password, plaintext)
    if (typeof requestData?.email !== 'string' || requestData?.email === '' ||
        typeof requestData?.password !== 'string' || requestData?.password === '') {
        return res.status(400).json({ error: true, message: 'Invalid or missing data' });
    }

    // TODO: Check if account exists and create if not
    // -- Lookup the given email in the database to make sure it is not already registered
    // -- Hash and salt the password
    // -- Add the email and hashed password to the database with a verified property set to false
    // -- Send a verification link to the email provided

    // User data in the database should look something like this
    const newUser = {
        id: 'xxxxxxx',
        email: 'someone@test.org',
        hashedPassword: undefined, // DON'T include this in the response
        verified: false // They need to verify their email
    }

    // Return data as JSON (be careful not to include the password or hashed password)
    res.json({ error: false, message: 'Accepted', data: newUser });
});

// Password reset request route: step 1 of password reset
// - Matches post requests at http://localhost:3000/user/request-reset
router.post('/request-reset', (req, res) => {
    // Look for request data
    const requestData = req.body;

    // Verify that the expected data is present (email and password, plaintext)
    if (typeof requestData?.email !== 'string' || requestData?.email === '') {
        return res.status(400).json({ error: true, message: 'Invalid or missing data' });
    }

    // TODO: Check the email and generate an expiring recovery token
    // -- Retrieve the user account from the database using the email
    // -- If found, generate and store a unique recovery token and an expiration time
    // -- Send a recovery link to their email with the recovery token and user ID

    // Return data as JSON (do not reveal if the email was found or not, could enable a brute-force attack)
    res.json({ error: false, message: 'If email was found, a password reset link has been sent' })
});

// Account recovery route: step 2 of password reset
// - Matches post requests at http://localhost:3000/user/recover
router.post('/recover', (req, res) => {
    // Look for request data
    const requestData = req.body;

    // Verify that the expected data is present (email and password, plaintext)
    if (typeof requestData?.userId !== 'string' || requestData?.userId === '' ||
        typeof requestData?.recoveryCode !== 'string' || requestData?.recoveryCode === '' ||
        typeof requestData?.newPassword !== 'string' || requestData?.recoveryCode ==='') {
        return res.status(400).json({ error: true, message: 'Invalid or missing data' });
    }

    // TODO: Validate recovery token and store new password
    // -- Retrieve the user account from the database using the user Id
    // -- If found, compare the recovery code with the one stored in the database
    // -- If they match, check the expiration time to ensure it has not passed
    // -- If it has not expired, hash and store the new password

    // Return data as JSON (do not reveal if the email was found or not, could enable a brute-force attack)
    res.json({ error: false, message: 'Password has been reset' })
});

//Ban User route: used to ban a user by their ID
router.post('/ban', async (req, res) => {
    const requestData = req.body;

    // Verify that the expected data is present (userId)
    if (typeof requestData?.userId !== 'string' || requestData?.userId === ''){
        return res.status(400).json({error: true, message: 'Invalid User Id'});
    }
    
    try {
        const userRole = await checkUserRole(req);
        if (!userRole || userRole !== 'DM' || userRole !== 'Co DM') {
            return res.status(403).json({ error: true, message: 'Unauthorized - Admin access required' });
        }
        
        // TODO: Implement ban user logic here
        banUser(requestData.userId);
        res.json({ error: false, message: 'User banned successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});

// Export the router for importing in other files
export default router