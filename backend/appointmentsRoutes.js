const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const { db } = require("./localDb");

// Get all appointments for current user
// - Patients see their own appointments
// - Doctors see appointments booked with them
router.get("/", authMiddleware, (req, res) => {
  try {
    const { id, role } = req.user;
    let appointments;

    if (role === "doctor") {
      appointments = db.getAppointments({ doctorId: id });
    } else if (role === "patient") {
      appointments = db.getAppointments({ patientId: id });
    } else {
      // Admin sees all
      appointments = db.getAppointments();
    }

    // Sort by date descending (most recent first)
    appointments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create appointment (patient books with a doctor)
router.post("/", authMiddleware, (req, res) => {
  try {
    const { doctorId, doctorName, specialty, hospital, date, time, reason } = req.body;

    if (!doctorId || !date || !time) {
      return res.status(400).json({ message: "Doctor, date, and time are required" });
    }

    // Get patient info
    const { db: dbModule } = require("./localDb");
    const patient = db.findUserById(req.user.id);
    const patientName = patient ? patient.name : "Patient";

    const newAppointment = db.createAppointment({
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

    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointment by ID
router.get("/:id", authMiddleware, (req, res) => {
  try {
    const appointment = db.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update appointment (doctor can confirm/complete, patient can update reason)
router.put("/:id", authMiddleware, (req, res) => {
  try {
    const appointment = db.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const updated = db.updateAppointment(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete / Cancel appointment
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const appointment = db.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Mark as cancelled instead of deleting to preserve history
    const updated = db.updateAppointment(req.params.id, { status: "cancelled" });
    res.json({ message: "Appointment cancelled successfully", appointment: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reschedule appointment
router.put("/:id/reschedule", authMiddleware, (req, res) => {
  try {
    const appointment = db.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const updated = db.updateAppointment(req.params.id, { ...req.body, status: "rescheduled" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Confirm appointment (doctor action)
router.put("/:id/confirm", authMiddleware, (req, res) => {
  try {
    const updated = db.updateAppointment(req.params.id, { status: "confirmed" });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Complete appointment (doctor action)
router.put("/:id/complete", authMiddleware, (req, res) => {
  try {
    const updated = db.updateAppointment(req.params.id, { status: "completed" });
    if (!updated) return res.status(404).json({ message: "Appointment not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
