import Express from 'express';
import jwt from 'jsonwebtoken';
import { getCampaign, listCampaigns,getMembersForCampaign, insertCampaign, insertInCampaign, isUserInCampaign, getCampaignByJoinCode, generateJoinCode, DBClient, getCampaignCards , updateRecap, isUserBannedFromCampaign, getRecap, saveZoomTokens, getZoomTokens, insertZoomMeeting, getZoomMeetingBySchedule, getCampaignCharacters, uploadMap, getMapForCampaign, deleteMapsForCampaign, updateCharacterLevel, updateCharacterBackstory, addCharacterToCampaign, removeCharacterFromCampaign, updateRules, loadBannedCampaign, createRecap} from '../data/supabaseController.js';


const router = new Express.Router();
router.use(Express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

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

//get the campaign id, this is very much like the million other router.get function i hate my life
//screw this stupid recap user story that i am spending too much time on 
router.get('/campaignId', requireAuth, async (req, res) => {
    try {
        const { campaignId } = req.params;
        const {data, error} = await DBClient
            .from('Recaps')
            .select('*')
            .eq('campaignID', campaignId)
            .order('orderNumber', { ascending: true});
        
        if (error) throw error;
    } catch (err) {
        console.error('Failed to fetch recaps:', err)
        res.status(500).json({ error: true, message: 'Failed to fetch recaps' });
    }
});

//this is creating a new recap with the autoincrement order number for the campaign. THANK YOU 
// CLAUDE CODE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
router.post('/', requireAuth, asyn (req,res) => {
    try {
        //ensuring that we have a campaignID or description
        const {campaignId, description} = req.body;
        if(!campaignId || !description) {
            return res.status(400).json({error:true, message: "Missing campaignId or Description"});
        }

        const {data: existing, error: countErr } = await DBClient
            .from('Recaps')
            .select('orderNumber')
            .eq('campaignId', campaignId)
            .order('orderNumber', {ascending:false })
            .limit(1);
        
        if (countErr) throw countErr;

        const nextOrder = existing.length > 0 ? existing[0].orderNumber + 1 : 1;

        const { data, error } = await DBClient
            .from('Recaps')
            .insert({ campaignId, description, orderNumber : nextOrder})
            .select()
            .single();

        if (error) throw error;
        res.join({success: true, recap: data});
    
    } catch (err) {
        console.error('Failed to create recap', err);
        res.status(500).json({ error: true, message: 'Failed to create recap' });
    }
});


export default router;