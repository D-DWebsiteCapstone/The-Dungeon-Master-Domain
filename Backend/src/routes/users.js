// Import the express library
import Express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import https from "https";
import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid';
import { getLogin, checkUserRole, banUser, createUser, getUserByEmail, verifyUser, 
updatePassword, isUserBanned, getSiteRoleForUser, getAllUsers, banUserFromSite, 
unBanUserFromSite, getUsername, getEmail, checkTutorial, disableTutorialDB, checkUserInCampaign } from '../data/supabaseController.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import dotenv from 'dotenv';
import { DBClient } from '../data/supabaseController.js';
import { OAuth2Client} from 'google-auth-library';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

/**
 * Data endpoints concerned with user accounts
 * - This allows creation and editing of a user account
 * - It also allows login and generation of an authentication token
 */

// Create a new express router object to hold all endpoints
const router = new Express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NO_REPLY_EMAIL,
    pass: process.env.NO_REPLY_PASS
  }
});
// Configure all routes that come after to accept JSON data in their body (post requests only)
// IMPORTANT: The request Content-Type must be 'application/json' or the body will be ignored.
router.use(Express.json());

// Login route: used to validate a user and generate an authorization token
// - Matches get requests at http://localhost:3000/user/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const { data: user, error } = await DBClient
      .from('Users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !user)
      return res.status(401).json({ valid: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.userpassword);
    if (!match)
      return res.status(401).json({ valid: false, message: 'Invalid password' });

    if (!user.verified)
      return res.status(403).json({ valid: false, message: 'Please verify your email first' });

    try {
      const banned = await isUserBanned(user.userid);
      if (banned) {
        return res.status(403).json({ valid: false, message: `You are banned: ${banned.reason}` });
      }
    } catch (bErr) {
      console.error('Failed to check ban status:', bErr);
    }

    const { data: userRole, error: roleError } = await DBClient
      .from('UserRole')
      .select('rolename')
      .eq('userid', user.userid)
      .single();

      console.log('userRole:', userRole);
      console.log('roleError:', roleError);

    
    const role = (!roleError && userRole) ? userRole.rolename : 'user';

    const token = jwt.sign(
      { id: user.userid, username: user.username, role },
      JWT_SECRET
    );

    res.json({ valid: true, token, user: { id: user.userid, username: user.username, role } });

  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
});




//GOOGLE STUFFFFFFF !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//things we need for verification
const GOOGLE_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs"; 
const CLIENT_ID = "812526800082-kphkn27aalckafulgu3kgaoti517vv8g.apps.googleusercontent.com";
const client = new OAuth2Client(CLIENT_ID);


//since we are not creating new tables/columns in the database, we need to search our database for a user with the same email
async function findUserByGoogle(payload) {
  const { data: existingUser, error } = await DBClient
    .from("Users")
    .select("*")
    .eq("email", payload.email)
    .maybeSingle();

  if (error) throw error;
  if(existingUser) return existingUser;

  const { data: newUser, error: createErr } = await DBClient
    .from("Users")
    .insert({
      email: payload.email,
      username: payload.name || payload.email.split("@")[0],
      verified: true,
      userpassword: null   // no password for OAuth users
    })
    .select()
    .single();

    if (createErr) throw createErr;

    return newUser;
}

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID
  });

  return ticket.getPayload();
}

router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ valid: false, message: "Missing Token" });
    }

    const payload = await verifyGoogleToken(token);
    const user = await findUserByGoogle(payload);

    // Ban check
    const banned = await isUserBanned(user.userid);
    if (banned) {
      return res.status(403).json({ valid: false, message: `You are banned: ${banned.reason}` });
    }

    // Role lookup
    const { data: userRole, error: roleError } = await DBClient
      .from('UserRole')
      .select('rolename')
      .eq('userid', user.userid)
      .single();
    const role = (!roleError && userRole) ? userRole.rolename : 'user';

    // Build token inline — same pattern as regular login
    const appToken = jwt.sign(
      { id: user.userid, username: user.username, role },
      JWT_SECRET
    );

    res.json({
      valid: true,
      token: appToken,
      user: { id: user.userid, username: user.username, role }
    });

  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(401).json({ valid: false, message: "Invalid Google Token" });
  }
});

// END OF GOOGLE STUFF!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



// - Matches post requests at http://localhost:3000/user/request-reset
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    const token = nanoid(32);
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await DBClient
      .from('Users')
      .update({ reset_token: token, reset_expires: expires })
      .eq('email', email);

    // Attempt to send email
    try {
      await sendPasswordResetEmail(email, token);
    } catch (err) {
      console.error('Failed to send password reset email:', err);
      // Do NOT fail the request for security reasons (so attackers can't probe emails)
    }

    res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });

  } catch (err) {
    console.error('Request-reset error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// - Matches post requests at http://localhost:3000/user/recover
router.post('/recover', async (req, res) => {
  const { token, newPassword } = req.body;

  const { data: user } = await DBClient
    .from('Users')
    .select('*')
    .eq('reset_token', token)
    .single();

  if (!user || new Date(user.reset_expires) < new Date())
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await DBClient
    .from('Users')
    .update({ userpassword: hashedPassword, reset_token: null, reset_expires: null })
    .eq('userid', user.userid);

  res.json({ success: true, message: 'Password updated successfully' });
});

//Ban User route: used to ban a user by their ID
router.post('/ban', async (req, res) => {
  const { userId, campaignId } = req.body;

  if (!userId || !campaignId)
    return res.status(400).json({ error: true, message: 'Missing user or campaign ID' });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: true, message: 'Missing token' });

  const decoded = jwt.verify(token, JWT_SECRET);
  const adminId = decoded.id;
  const isAdmin = decoded.role === "Admin";

  const isInCampaign = await checkUserInCampaign(adminId, campaignId);

  if(isInCampaign === true){
  const role = await checkUserRole(adminId, campaignId);
  }
  
  const role = isAdmin;
  console.log("The role is " + role);

  if (!role || (role !== "DM" && role !== "Co DM" && !isAdmin))
    return res.status(403).json({ error: true, message: "Admin access required" });

  await banUser(userId, campaignId);

  res.json({ success: true, message: "User banned" });
});

//Unban User route: used to unban a user from a campaign
router.delete('/ban', async (req, res) => {
  try {
    const { userId, campaignId } = req.body;

    if (!userId || !campaignId)
      return res.status(400).json({ valid: false, message: 'Missing user or campaign ID' });

    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(401).json({ valid: false, message: 'Missing token' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const isAdmin = decoded.role === "Admin";
    const adminId = decoded.id;
    
    if(!isAdmin){
    const role = await checkUserRole(adminId, campaignId);
    if (!role || (role !== "DM" && role !== "Co DM"))
      return res.status(403).json({ valid: false, message: "Admin access required" });
  }

    await unBanUserFromSite(userId, campaignId);

    res.json({ valid: true, message: "User unbanned" });
  } catch (err) {
    console.error('Unban user error:', err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
});


// --- ADDED: Ban user from the entire site ---
router.post('/ban/site', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: true, message: "Missing token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminId = decoded.id;

    // Ensure they are Admin
    const role = await getSiteRoleForUser(adminId);
    if (role !== "Admin")
      return res.status(403).json({ error: true, message: "Admin access required" });

    const { userId, reason } = req.body;
    if (!userId || !reason)
      return res.status(400).json({ error: true, message: "Missing userId or reason" });

    // Lookup username
    const { data: user } = await DBClient
      .from("Users")
      .select("username")
      .eq("userid", userId)
      .single();

    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    const result = await banUserFromSite(userId, user.username, reason);

    res.json({ success: true, message: "User banned from site", result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

//unban user
router.delete('/ban/site', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: true, message: "Missing token" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const adminId = decoded.id;

    // Ensure they are Admin
    const role = await getSiteRoleForUser(adminId);
    if (role !== "Admin")
      return res.status(403).json({ error: true, message: "Admin access required" });

    const { userId, reason } = req.body;
    if (!userId || !reason)
      return res.status(400).json({ error: true, message: "Missing userId or reason" });

    // Lookup username
    const { data: user } = await DBClient
      .from("Users")
      .select("username")
      .eq("userid", userId)
      .single();

    // this should never happen, but check anyway
    if (!user)
      return res.status(404).json({ error: true, message: "User not found" });

    const result = await banUserFromSite(userId, user.username, reason);

    res.json({ success: true, message: "User banned from site", result });
  // this is 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: "Server error" });
  }
});

// SIGNUP -------------------------------------------------
router.post('/create', async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password || !username)
    return res.status(400).json({ error: true, message: 'Missing required fields' });

  try {
    const { verificationCode } = await createUser(username, email, password);
    await sendVerificationEmail(email, username, verificationCode);
    res.json({ success: true, message: 'Account created. Check your email to verify.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Signup failed' });
  }
});

// VERIFY EMAIL -------------------------------------------
router.get('/verify', async (req, res) => {
  const { code } = req.query;

  try {
    const { data, error } = await DBClient
      .from('Users')
      .select('*')
      .eq('verificationCode', code)
      .single();

    if (error || !data) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    if (data.verified) {
      return res.json({ success: false, message: 'Already verified' });
    }

    const { error: updateError } = await DBClient
      .from('Users')
      .update({ verified: true, verificationCode: null })
      .eq('userid', data.userid);

    if (updateError) throw updateError;

    res.json({ success: true });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PASSWORD RESET REQUEST ---------------------------------
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });
  await sendPasswordResetEmail(email, token);
  res.json({ success: true, message: 'Password reset link sent if email exists.' });
});

// PASSWORD RESET CONFIRM ---------------------------------
router.post('/recover', async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await updatePassword(decoded.email, newPassword);
    res.json({ success: true, message: 'Password reset successful.' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
});

router.get('/verify-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ valid: false, message: 'Missing token' })

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { id } = decoded

    const { data: user, error } = await DBClient.from('Users').select('verified').eq('userid', id).single()
    if (error || !user) return res.status(401).json({ valid: false, message: 'Invalid token' })

    if (!user.verified)
      return res.status(403).json({ valid: false, message: 'User not verified' })

    res.json({ valid: true })
  } catch (err) {
    console.error(err)
    res.status(401).json({ valid: false, message: 'Invalid or expired token' })
  }
})

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ valid: false, message: 'Missing token' })
  }

  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (err) {
    return res.status(401).json({ valid: false, message: 'Invalid or expired token' })
  }
}


// DELETE ACCOUNT -----------------------------------------------------
// Deletes the authenticated user's account. Requires Authorization header.
router.delete('/delete', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ success: false, message: 'Missing token' })

    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }

    const userId = decoded.id
    if (!userId) return res.status(400).json({ success: false, message: 'Invalid token payload' })

    // Delete the user record
    const { error } = await DBClient.from('Users').delete().eq('userid', userId)
    if (error) {
      console.error('Error deleting user:', error)
      return res.status(500).json({ success: false, message: 'Failed to delete user' })
    }

    res.json({ success: true, message: 'Account deleted' })
  } catch (err) {
    console.error('Delete account error:', err)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// Get all users (admin only) ---

router.get("/all", async (req, res) => {
  console.log("GET /user/all called");
  try {
    const auth = req.headers.authorization;
    console.log("Authorization header:", auth);
    if (!auth) {
      console.log("→ No auth header, returning 401");
      return res.status(401).json({ error: true });
    }

    const token = auth.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      console.log("→ JWT verification failed:", e.message);
      return res.status(401).json({ error: true, message: "Invalid token" });
    }
    console.log("Decoded token:", decoded);

    const role = await getSiteRoleForUser(decoded.id);
    console.log("User role from DB:", role);

    if (role !== "Admin") {
      console.log("→ Role is not Admin, returning 403");
      return res.status(403).json({ error: true });
    }

    const users = await getAllUsers();
    console.log("Users to return:", users);

    // Disable caching for this sensitive route
    res.set("Cache-Control", "no-store");

    res.json(users);
  } catch (err) {
    console.error("Error in /user/all:", err);
    res.status(500).json({ error: true });
  }
});


// Check admin role ---
router.get("/role", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) return res.json({ role: null });

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const role = await getSiteRoleForUser(decoded.id);
    res.json({ role });

  } catch {
    res.json({ role: null });
  }
});

router.post('/change-username', requireAuth, async (req, res) => {
  try {
    const { newUsername } = req.body
    if (!newUsername || typeof newUsername !== 'string') {
      return res.status(400).json({ valid: false, message: 'New username required' })
    }

    const { error } = await DBClient
      .from('Users')
      .update({ username: newUsername })
      .eq('userid', req.user.id)

    if (error) {
      console.error('Error updating username:', error)
      return res.status(500).json({ valid: false, message: 'Failed to update username' })
    }

    res.json({ valid: true, message: 'Username updated' })
  } catch (err) {
    console.error('change-username failed:', err)
    res.status(500).json({ valid: false, message: 'Server error' })
  }
})

// Change password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ valid: false, message: 'Both current and new passwords are required.' })
    }

    // 1) Get user row
    const { data: user, error: userErr } = await DBClient
      .from('Users')
      .select('userpassword')
      .eq('userid', req.user.id)
      .maybeSingle()

    if (userErr || !user) {
      console.error('Error fetching user for password change:', userErr)
      return res.status(500).json({ valid: false, message: 'User lookup failed.' })
    }

    // 2) Check current password
    const matches = await bcrypt.compare(currentPassword, user.userpassword)
    if (!matches) {
      return res.status(401).json({ valid: false, message: 'Current password is incorrect.' })
    }

    // 3) Hash new password
    const hashed = await bcrypt.hash(newPassword, 10)

    const { error: updateErr } = await DBClient
      .from('Users')
      .update({ userpassword: hashed })
      .eq('userid', req.user.id)

    if (updateErr) {
      console.error('Error updating password:', updateErr)
      return res.status(500).json({ valid: false, message: 'Failed to update password.' })
    }

    res.json({ valid: true, message: 'Password updated.' })
  } catch (err) {
    console.error('change-password failed:', err)
    res.status(500).json({ valid: false, message: 'Server error.' })
  }
})


router.get('/checkUserRole', async (req, res) => {
  try{
    const userId = '1832e05a-fcdd-4cd9-ae5e-7dd44da65295';
    const campaignId = 'f25a1315-ac42-4851-a068-2943ba821012';
    const role = await checkUserRole(userId, campaignId);
    console.log("succesfully checked role for userId: " + userId + " and campaignId: " + campaignId + ", role=", role);
    res.json({ role })
  }catch(error){
    console.error("failed to get role:", error );
    res.status(500).json({valid: false, message: 'failed'});
  }
})

router.post('/fetchUsername', async (req, res) => {
  try{
    const userId = req.body.userId;

    const result = await getUsername(userId);
    const username = result.username
    res.json({ username });


  }catch(error){
    console.log("No...failed to get the username lol");
    res.status(500).json({valid: false, message: "Get Shrecked Nerd"});
  }
})

//fetch email
router.post('/fetchEmail', async (req, res) => {
  try{
    const userId = req.body.userId;

    const result = await getEmail(userId);
    const email = result.email
    res.json({ email });


  }catch(error){
    console.log("No...failed to get the email lol");
    res.status(500).json({valid: false, message: "Get Shrocked Nerd"});
  }
})

router.post('/checkShowTutorial', async (req, res) =>{
  try{
    const userId = req.body.userId;

    const result = await checkTutorial(userId);
    const tag = result.showTutorial;
    //console.log(tag);
    res.json({ tag });
  }catch(error){
    console.log("failed to check the status of tutorial");
    res.status(500).json({valid: false, message: "Get rocked Nerd"});
  }
})

router.post('/disableTutorial', async (req, res) => {
  try {
    const userId = req.body.userId;
    const result = await disableTutorialDB(userId);
    res.json({ success: true, data: result });  // actually respond
  } catch(error) {
    console.log("There was an error. Good try though....nerd, here's the error: " + error);
    res.status(500).json({ success: false, error: error.message });  // respond on failure too
  }
});



export default router;