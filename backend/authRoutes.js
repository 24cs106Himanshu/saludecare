const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyToken, updateProfile } = require("./authController");
const protect = require("./authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify", protect, verifyToken);
router.put("/profile", protect, updateProfile);

module.exports = router;
