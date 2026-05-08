const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const User = require("./models/User");
const Appointment = require("./models/Appointment");
const Prescription = require("./models/Prescription");
const Record = require("./models/Record");

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const { id, role } = req.user;
    let stats = {};

    if (role === "patient") {
      const myAppts = await Appointment.find({ patientId: id });
      const myRx = await Prescription.find({ patientId: id });
      const myRecs = await Record.find({ patientId: id });

      const upcoming = myAppts.filter((a) => a.status !== "completed" && a.status !== "cancelled");

      stats = {
        totalAppointments: myAppts.length,
        upcomingAppointments: upcoming.length,
        activePrescriptions: myRx.filter((r) => r.status === "Active" || r.status === "active").length,
        medicalRecords: myRecs.length,
      };
    } else if (role === "doctor") {
      const myAppts = await Appointment.find({ doctorId: id });
      const today = new Date().toISOString().split("T")[0];
      const todayAppts = myAppts.filter((a) => a.date === today);

      const uniquePatients = [...new Set(myAppts.map((a) => a.patientId.toString()))];

      stats = {
        totalPatients: uniquePatients.length,
        todayAppointments: todayAppts.length,
        totalAppointments: myAppts.length,
        activePrescriptions: await Prescription.countDocuments({ doctorId: id }),
      };
    } else {
      // admin stats
      const today = new Date().toISOString().split("T")[0];
      const allAppts = await Appointment.find({ date: today });

      stats = {
        totalUsers: await User.countDocuments(),
        totalDoctors: await User.countDocuments({ role: "doctor" }),
        totalPatients: await User.countDocuments({ role: "patient" }),
        todayAppointments: allAppts.length,
      };
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
