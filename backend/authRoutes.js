const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyToken } = require("./authController");
const protect = require("./authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", protect, verifyToken);

module.exports = router;
