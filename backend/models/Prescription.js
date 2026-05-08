const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorName: { type: String },
    medicines: [{
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        duration: { type: String }
    }],
    notes: { type: String },
    status: { type: String, default: "Active" },
    prescribedDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Prescription || mongoose.model("Prescription", prescriptionSchema);
