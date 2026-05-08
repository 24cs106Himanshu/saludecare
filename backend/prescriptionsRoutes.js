const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const Prescription = require("./models/Prescription");
const User = require("./models/User");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    let query = {};
    if (role === "doctor") query.doctorId = id;
    else if (role === "patient") query.patientId = id;

    const prescriptions = await Prescription.find(query).sort({ createdAt: -1 });
    res.json(prescriptions.map(p => ({ ...p.toObject(), id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { patientId, patientName, medicines, notes, status } = req.body;
    const doctor = await User.findById(req.user.id);
    const newRx = await Prescription.create({
      patientId,
      patientName: patientName || "Patient",
      doctorId: req.user.id,
      doctorName: doctor ? doctor.name : "Doctor",
      medicines: medicines || [],
      notes: notes || "",
      status: status || "Active"
    });

    const obj = newRx.toObject();
    obj.id = obj._id.toString();
    res.status(201).json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Prescription.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Prescription not found" });

    const obj = updated.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/patient/:patientId", authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId }).sort({ createdAt: -1 });
    res.json(prescriptions.map(p => ({ ...p.toObject(), id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/doctor/:doctorId", authMiddleware, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ doctorId: req.params.doctorId }).sort({ createdAt: -1 });
    res.json(prescriptions.map(p => ({ ...p.toObject(), id: p._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
