import express from 'express';

const router = express.Router();

// In-memory storage for player data (in production, use a database)
const playerProfiles = new Map();

// POST /api/player/save - Save player combat choices and diagnostic data
router.post('/save', (req, res) => {
  try {
    const { playerId, data } = req.body;

    if (!playerId) {
      return res.status(400).json({ error: 'playerId is required' });
    }

    // Initialize player profile if it doesn't exist
    if (!playerProfiles.has(playerId)) {
      playerProfiles.set(playerId, {
        playerId,
        createdAt: new Date().toISOString(),
        combatHistory: [],
        diagnosticResponses: {},
        reports: {}
      });
    }

    const profile = playerProfiles.get(playerId);

    // Update profile with new data
    if (data.combatChoice) {
      profile.combatHistory.push({
        ...data.combatChoice,
        timestamp: new Date().toISOString()
      });
    }

    if (data.diagnosticResponses) {
      profile.diagnosticResponses = {
        ...profile.diagnosticResponses,
        ...data.diagnosticResponses
      };
    }

    profile.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Player data saved',
      profile
    });

  } catch (error) {
    console.error('Save Error:', error);
    res.status(500).json({ error: 'Failed to save player data' });
  }
});

// GET /api/player/:playerId - Retrieve player profile
router.get('/:playerId', (req, res) => {
  const { playerId } = req.params;
  const profile = playerProfiles.get(playerId);

  if (!profile) {
    return res.status(404).json({ error: 'Player profile not found' });
  }

  res.json({ profile });
});

// POST /api/player/:playerId/report - Save a generated report
router.post('/:playerId/report', (req, res) => {
  try {
    const { playerId } = req.params;
    const { reportType, report } = req.body;

    if (!playerProfiles.has(playerId)) {
      return res.status(404).json({ error: 'Player profile not found' });
    }

    const profile = playerProfiles.get(playerId);
    profile.reports[reportType] = {
      content: report,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Report saved',
      report: profile.reports[reportType]
    });

  } catch (error) {
    console.error('Report Save Error:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// GET /api/player/:playerId/reports - Get all reports for a player
router.get('/:playerId/reports', (req, res) => {
  const { playerId } = req.params;
  const profile = playerProfiles.get(playerId);

  if (!profile) {
    return res.status(404).json({ error: 'Player profile not found' });
  }

  res.json({ reports: profile.reports });
});

export default router;
