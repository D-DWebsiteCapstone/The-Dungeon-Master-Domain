import express from 'express';
import { getRecap, createRecap } from '../data/supabaseController.js';

const router = express.Router();

// GET recaps
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
    console.log("HIT /recaps route with ID:", req.params.campaignId);
  
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

export default router;