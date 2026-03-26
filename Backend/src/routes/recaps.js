import express from 'express';
import { getRecap, createRecap, editRecap } from '../data/supabaseController.js';

const router = express.Router();

// GET recaps
router.get('/:campaignId', async (req, res) => {
    try {
    const data = await getRecap(req.params.campaignId);
    console.log("Sending recaps: ", JSON.stringify(data))
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

export default router;