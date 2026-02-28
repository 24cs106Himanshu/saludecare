const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const { db } = require("./localDb");

// Get all doctors (from local DB)
router.get("/", (req, res) => {
  try {
    const allUsers = db.getAllUsers();
    const doctors = allUsers
      .filter((u) => u.role === "doctor")
      .map((doc) => ({
        id: doc._id,
        _id: doc._id,
        firstName: doc.firstName || doc.name.split(" ")[0],
        lastName: doc.lastName || doc.name.split(" ").slice(1).join(" "),
        name: doc.name,
        email: doc.email,
        specialization: doc.specialization || "General Practice",
        experience: doc.experience || "5 years",
        consultationFee: doc.consultationFee || 150,
        rating: doc.rating || 4.9,
        hospital: doc.hospital || "Medicare General Hospital",
        available: true,
      }));
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor by ID
router.get("/:id", (req, res) => {
  try {
    const user = db.findUserById(req.params.id);
    if (!user || user.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({
      id: user._id,
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      specialization: user.specialization || "General Practice",
      experience: user.experience || "5 years",
      consultationFee: user.consultationFee || 150,
      rating: user.rating || 4.9,
      hospital: user.hospital || "Medicare General Hospital",
      available: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor availability
router.get("/:id/availability", (req, res) => {
  const slots = [
    { time: "09:00 AM", available: true },
    { time: "09:30 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "10:30 AM", available: true },
    { time: "11:00 AM", available: true },
    { time: "11:30 AM", available: false },
    { time: "02:00 PM", available: true },
    { time: "02:30 PM", available: true },
    { time: "03:00 PM", available: true },
    { time: "03:30 PM", available: true },
    { time: "04:00 PM", available: true },
    { time: "04:30 PM", available: false },
  ];
  res.json(slots);
});

// Get doctor appointments
router.get("/:id/appointments", authMiddleware, (req, res) => {
  try {
    const appointments = db.getAppointments({ doctorId: req.params.id });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
