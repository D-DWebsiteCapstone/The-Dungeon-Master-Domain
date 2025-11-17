// Import the express library
import Express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid';
//This user stuff is crashing the backend, so commenting it out for now.
//import { getLogin, checkUserRole, banUser, createUser, getUserByEmail, verifyUser, updatePassword  } from '../data/supabaseController.js';
import { checkLoginCredentials } from '../../../Dnd Campaign Manager/src/lib/dataHelper.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/mailer.js';
import dotenv from 'dotenv';
import { DBClient } from '../data/supabaseController.js';
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

    // generate token
    const token = jwt.sign(
      { id: user.userid, username: user.username },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ valid: true, token, user: { id: user.userid, username: user.username } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: 'Internal server error' });
  }
});

// Account creation route:
// - Matches post requests at http://localhost:3000/user/create
/*router.post('/create', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: true, message: 'Missing fields' });

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const { data, error } = await DBClient
      .from('Users')
      .insert([{ username, email, userpassword: hashedPassword }])
      .select();

    if (error) throw error;

    // send verification email
    const verifyToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1d' });
    const verifyUrl = `http://localhost:3000/user/verify?token=${verifyToken}`;

    await transporter.sendMail({
      from: process.env.NO_REPLY_EMAIL,
      to: email,
      subject: 'Verify Your Account',
      html: `<h1>Welcome!</h1><p>Please verify your account by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`
    });

    res.json({ success: true, message: 'Account created! Please check your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
*/
// Password reset request route: step 1 of password reset
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



// Account recovery route: step 2 of password reset
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


/*
// LOGIN --------------------------------------------------
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await getUserByEmail(username); // could change to get by username if needed
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.userpassword);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user.userid, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.userid, username: user.username } });
});
*/
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




export default router;