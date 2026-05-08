const express = require("express");
const router = express.Router();
const protect = require("./authMiddleware");
const authorize = require("./roleMiddleware");

router.get(
  "/doctor-only",
  protect,
  authorize("doctor"),
  (req, res) => {
    res.json({ message: "Doctor access granted" });
  }
);

module.exports = router;
