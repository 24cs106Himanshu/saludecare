const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const { db } = require("./localDb");

// Get all patients (from local DB)
router.get("/", authMiddleware, (req, res) => {
  try {
    const allUsers = db.getAllUsers();
    const patients = allUsers
      .filter((u) => u.role === "patient")
      .map((p) => ({
        id: p._id,
        _id: p._id,
        name: p.name,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        role: p.role,
      }));
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get patient by ID
router.get("/:id", authMiddleware, (req, res) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user || user.role !== "patient") {
      return res.status(404).json({ message: "Patient not found" });
    }
    const { password, ...patient } = user;
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
