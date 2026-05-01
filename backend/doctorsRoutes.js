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

router.get("/:id/availability", async (req, res) => {
  const ALL_SLOTS = [
    "9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
    "2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM"
  ];
  try {
    const doctor = await User.findById(req.params.id);
    const blockedSlots = doctor?.blockedSlots || [];
    const slots = ALL_SLOTS.map(time => ({
      time,
      available: !blockedSlots.includes(time)
    }));
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/availability", authMiddleware, async (req, res) => {
  try {
    const { blockedSlots } = req.body;
    const doctor = await User.findByIdAndUpdate(
      req.params.id,
      { blockedSlots: blockedSlots || [] },
      { new: true }
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ message: "Availability updated successfully", blockedSlots: doctor.blockedSlots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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
