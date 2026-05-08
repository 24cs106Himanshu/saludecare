const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const User = require("./models/User");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const patientsDb = await User.find({ role: "patient" });
    const patients = patientsDb.map((p) => ({
      id: p._id.toString(),
      _id: p._id.toString(),
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

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "patient" }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const obj = user.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
