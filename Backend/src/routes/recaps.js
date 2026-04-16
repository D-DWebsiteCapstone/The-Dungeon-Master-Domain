import express from 'express';
import { getRecap, createRecap, editRecap, deleteRecap, getRecapFunctionality, togglePlayerRecaps } from '../data/supabaseController.js';

const router = express.Router();

// GET recaps
router.get('/playerSettings/:campaignId', async (req, res) => {
  try {
    const data = await getRecapFunctionality(req.params.campaignId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/playerSettings/:campaignId', async (req, res) => {
  try {
    const newValue = await togglePlayerRecaps(req.params.campaignId)
    res.json({ success: true, allowPlayerRecaps: newValue})
  } catch (err) {
    console.error('Update recap functionality error: ', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

router.get('/:campaignId', async (req, res) => {
    try {
    const data = await getRecap(req.params.campaignId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new recap
router.post('/:campaignId', async (req, res) => {
    try {
    const recap = await createRecap(
      req.params.campaignId,
      req.body.description
    );
    res.json(recap);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:recapId', async (req, res) => {
  try {
    const recapId = parseInt(req.params.recapId, 10)

    if (isNaN(recapId)) {
      return res.status(400).json({ success: false, message: 'Invalid recap ID' })
    }

    const recap = await editRecap(req.params.recapId, req.body.description)
    res.json({ success: true, recap: editRecap })
  } catch (err) {
    console.error('PATCH recap error:', err)
    res.status(500).json({ success: false, message: err.message})
  }
})

router.delete('/:campaignId/:recapId', async (req, res) => {
  try {
    const { campaignId} = req.params;
    const recapId = parseInt(req.params.recapId, 10)
    console.log('DELETE hit — campaignId:', campaignId, 'recapId:', recapId) // ✅ add this


    if (isNaN(recapId)) {
      return res.status(400).json({ success: false, message: 'Invalid recap ID' })
    }


    const result = await deleteRecap(campaignId, recapId);
    res.json(result);
  } catch (err) {
    console.error('DELETE recap error:', err.message)
    res.status(500).json({error: err.message});
  }
})



export default router;