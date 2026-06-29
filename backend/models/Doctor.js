const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    department: { type: String, required: true },
    experience: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Available", "Busy", "Off Duty"],
      default: "Available",
    },
    phone: { type: String },
    email: { type: String },
    schedule: { type: String },
    patients: { type: Number, default: 0 },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
