const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const { db } = require("./localDb");

// Get all records for current user
router.get("/", authMiddleware, (req, res) => {
  try {
    const records = db.getRecords({ userId: req.user.id, patientId: req.user.id });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create medical record
router.post("/", authMiddleware, (req, res) => {
  try {
    const newRecord = db.createRecord({
      ...req.body,
      patientId: req.body.patientId || req.user.id,
      createdBy: req.user.id,
    });
    res.status(201).json(newRecord);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get records by patient
router.get("/patient/:patientId", authMiddleware, (req, res) => {
  try {
    const records = db.getRecords({ patientId: req.params.patientId });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
