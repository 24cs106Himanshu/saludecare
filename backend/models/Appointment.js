const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorName: { type: String },
    specialty: { type: String },
    hospital: { type: String },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: { type: String },
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled", "rescheduled"], default: "pending" }
}, { timestamps: true });

module.exports = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);
