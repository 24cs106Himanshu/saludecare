const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const Record = require("./models/Record");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const records = await Record.find({ patientId: req.user.id }).sort({ createdAt: -1 });
    res.json(records.map(r => ({ ...r.toObject(), id: r._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const newRecord = await Record.create({
      ...req.body,
      patientId: req.body.patientId || req.user.id,
      createdBy: req.user.id,
    });

    const obj = newRecord.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/patient/:patientId", authMiddleware, async (req, res) => {
  try {
    const records = await Record.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(records.map(r => ({ ...r.toObject(), id: r._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
