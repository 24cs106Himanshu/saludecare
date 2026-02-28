const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const { db } = require("./localDb");

// Get dashboard stats (role-aware)
router.get("/stats", authMiddleware, (req, res) => {
  try {
    const stats = db.getStats(req.user.id, req.user.role);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
