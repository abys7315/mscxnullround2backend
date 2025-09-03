const express = require("express");
const router = express.Router();
const Team = require("../models/Team");
const jwt = require("jsonwebtoken");

/**
 * POST /api/auth/login
 * This route now handles both login and registration with strict validation.
 */
router.post("/login", async (req, res) => {
  const { teamName, regNumber, teamHead, password } = req.body;

  if (!teamName || !regNumber || !teamHead || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    let team = await Team.findOne({ teamName });

    // --- LOGIC FOR EXISTING USER ---
    if (team) {
      if (team.cheated) {
        return res.status(403).json({ message: "You have been disqualified for malpractice and do not have permission to login." });
      }

      const credentialsMatch =
        team.regNumber === regNumber &&
        team.teamHead === teamHead &&
        team.isValidPassword(password);

      if (!credentialsMatch) {
        return res.status(400).json({ message: "Invalid credentials. Please check all your details." });
      }
    }
    // --- LOGIC FOR NEW USER ---
    else {
      // For new users, password must equal teamHead
      if (password !== teamHead) {
        return res.status(400).json({ message: "For new teams, password must be the same as the Team Head's name." });
      }

      const existingReg = await Team.findOne({ regNumber });
      if (existingReg) {
        return res.status(409).json({ message: "Registration number already in use." });
      }
      
      team = new Team({ teamName, regNumber, teamHead, password });
      await team.save();
    }

    // --- SINGLE DEVICE LOGIN LOGIC ---
    // Increment the token version to invalidate old tokens
    team.tokenVersion += 1;
    await team.save();

    if (!process.env.JWT_SECRET) {
        console.error("FATAL ERROR: JWT_SECRET is not defined in your .env file.");
        return res.status(500).json({ message: "Server configuration error." });
    }
    
    // Add the new version to the JWT payload
    const payload = { sub: team._id, role: 'team', version: team.tokenVersion };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3h" });

    res.json({
      token,
      team: {
        id: team._id,
        teamName: team.teamName,
        regNumber: team.regNumber,
        teamHead: team.teamHead,
        currentStage: team.currentStage
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
