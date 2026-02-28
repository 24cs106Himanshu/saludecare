const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const { db } = require("./localDb");

// Get all prescriptions for current user
router.get("/", authMiddleware, (req, res) => {
  try {
    const { id, role } = req.user;
    let prescriptions;
    if (role === "doctor") {
      prescriptions = db.getPrescriptions({ doctorId: id });
    } else if (role === "patient") {
      prescriptions = db.getPrescriptions({ patientId: id });
    } else {
      prescriptions = db.getPrescriptions();
    }
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create prescription (doctor only)
router.post("/", authMiddleware, (req, res) => {
  try {
    const { patientId, patientName, medicines, notes, status } = req.body;
    const doctor = db.findUserById(req.user.id);
    const newRx = db.createPrescription({
      patientId,
      patientName: patientName || "Patient",
      doctorId: req.user.id,
      doctorName: doctor ? doctor.name : "Doctor",
      medicines: medicines || [],
      notes: notes || "",
      status: status || "Active",
      prescribedDate: new Date().toISOString(),
    });
    res.status(201).json(newRx);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update prescription
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const updated = db.updatePrescription(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Prescription not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get prescriptions by patient
router.get("/patient/:patientId", authMiddleware, (req, res) => {
  try {
    const prescriptions = db.getPrescriptions({ patientId: req.params.patientId });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get prescriptions by doctor
router.get("/doctor/:doctorId", authMiddleware, (req, res) => {
  try {
    const prescriptions = db.getPrescriptions({ doctorId: req.params.doctorId });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
