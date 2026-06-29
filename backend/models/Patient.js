const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  type: { type: String, required: true },
  notes: { type: String, required: true },
});

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    bloodType: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    status: {
      type: String,
      enum: ["Stable", "Critical", "Recovering", "Discharged"],
      default: "Stable",
    },
    admissionDate: { type: Date, default: Date.now },
    condition: { type: String },
    allergies: [{ type: String }],
    records: [recordSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
