const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const Appointment = require("./models/Appointment");
const User = require("./models/User");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    let appointments;

    if (role === "doctor") {
      appointments = await Appointment.find({ doctorId: id }).sort({ createdAt: -1 });
    } else if (role === "patient") {
      appointments = await Appointment.find({ patientId: id }).sort({ createdAt: -1 });
    } else {
      appointments = await Appointment.find().sort({ createdAt: -1 });
    }

    // Map `_id` to `id` for frontend
    res.json(appointments.map(a => ({ ...a.toObject(), id: a._id.toString() })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { doctorId, doctorName, specialty, hospital, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date, and time are required" });
    }

    const patient = await User.findById(req.user.id);
    const patientName = patient ? patient.name : "Patient";

    const newAppointment = await Appointment.create({
      doctorId,
      doctorName: doctorName || "Doctor",
      specialty: specialty || "General",
      hospital: hospital || "Medicare General",
      date,
      time,
      reason: reason || "",
      patientId: req.user.id,
      patientName,
      status: "pending",
    });

    const appointmentObj = newAppointment.toObject();
    appointmentObj.id = appointmentObj._id.toString();
    res.status(201).json(appointmentObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });

    const obj = appointment.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    const obj = updated.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    const obj = updated.toObject();
    obj.id = obj._id.toString();
    res.json({ message: "Appointment cancelled successfully", appointment: obj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/reschedule", authMiddleware, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { ...req.body, status: "rescheduled" }, { new: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    const obj = updated.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/confirm", authMiddleware, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: "confirmed" }, { new: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    const obj = updated.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/complete", authMiddleware, async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status: "completed" }, { new: true });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    const obj = updated.toObject();
    obj.id = obj._id.toString();
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
