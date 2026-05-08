const express = require("express");
const router = express.Router();
const { registerUser, loginUser, verifyToken, updateProfile, oauthLogin } = require("./authController");
const protect = require("./authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/oauth", oauthLogin);
router.get("/verify", protect, verifyToken);
router.put("/profile", protect, updateProfile);

module.exports = router;
