const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const User = require("./models/User");
const Appointment = require("./models/Appointment");

router.get("/", async (req, res) => {
  try {
    const doctorsDb = await User.find({ role: "doctor" });
    const doctors = doctorsDb.map((doc) => ({
      id: doc._id.toString(),
      _id: doc._id.toString(),
      firstName: doc.firstName || doc.name.split(" ")[0],
      lastName: doc.lastName || doc.name.split(" ").slice(1).join(" "),
      name: doc.name,
      email: doc.email,
      specialization: doc.specialization,
      experience: doc.experience,
      consultationFee: doc.consultationFee,
      rating: doc.rating,
      hospital: doc.hospital,
      available: true,
    }));
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, role: "doctor" });
    if (!user) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({
      id: user._id.toString(),
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      specialization: user.specialization,
      experience: user.experience,
      consultationFee: user.consultationFee,
      rating: user.rating,
      hospital: user.hospital,
      available: true,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

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

router.get("/:id/appointments", authMiddleware, async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.params.id });
    res.json(appointments.map(a => ({ ...a.toObject(), id: a._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
