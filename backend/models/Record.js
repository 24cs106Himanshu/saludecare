const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: String },
    provider: { type: String },
    attachments: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.models.Record || mongoose.model("Record", recordSchema);
