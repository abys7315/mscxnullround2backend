const jwt = require('jsonwebtoken');
const Team = require('../models/Team.js');

const auth = async (req, res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload?.sub) throw new Error('invalid');
    
    req.user = { id: payload.sub, role: payload.role || 'team' };
    
    if (req.user.role === 'team') {
      const team = await Team.findById(req.user.id);
      if (!team) return res.status(401).json({ error: 'Team not found' });

      // **SINGLE DEVICE LOGIN CHECK**
      // If the token's version doesn't match the database version, it's an old token.
      if (payload.version !== team.tokenVersion) {
        return res.status(401).json({ error: 'Session expired. Please log in again.' });
      }

      if (team.cheated) return res.status(403).json({ error: 'Disqualified' });
      req.team = team;
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
};

module.exports = { auth, requireAdmin };
