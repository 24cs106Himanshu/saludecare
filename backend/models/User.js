const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    dob: { type: String },
    gender: { type: String },
    specialization: { type: String },
    licenseNumber: { type: String },
    experience: { type: String },
    rating: { type: Number },
    hospital: { type: String },
    consultationFee: { type: Number }
}, { timestamps: true });

// Avoid overlapping model creation if it already exists
module.exports = mongoose.models.User || mongoose.model("User", userSchema);
