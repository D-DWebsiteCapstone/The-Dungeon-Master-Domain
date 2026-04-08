import express from 'express';
import { getRules, createRules, editRule, deleteRule } from '../data/supabaseController.js';

const router = express.Router();

// GET rule
router.get('/:campaignId', async (req, res) => {
    try {
    const data = await getRules(req.params.campaignId);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new rule
router.post('/:campaignId', async (req, res) => {
    try {
    const rule = await createRules(
      req.params.campaignId,
      req.body.description
    );
    res.json(rule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:ruleId', async (req, res) => {
  try {
    const ruleId = parseInt(req.params.ruleId, 10)

    if (isNaN(ruleId)) {
      return res.status(400).json({ success: false, message: 'Invalid rule ID' })
    }

    const rule = await editRule(req.params.ruleId, req.body.description)
    res.json({ success: true, rule: editRule })
  } catch (err) {
    console.error('PATCH rule error:', err)
    res.status(500).json({ success: false, message: err.message})
  }
})

router.delete('/:campaignId/:ruleId', async (req, res) => {
  try {
    const { campaignId} = req.params;
    const ruleId = parseInt(req.params.ruleId, 10)
    console.log('DELETE hit — campaignId:', campaignId, 'ruleId:', ruleId) // ✅ add this


    if (isNaN(ruleId)) {
      return res.status(400).json({ success: false, message: 'Invalid rule ID' })
    }


    const result = await deleteRule(campaignId, ruleId);
    res.json(result);
  } catch (err) {
    console.error('DELETE rule error:', err.message)
    res.status(500).json({error: err.message});
  }
})

export default router;