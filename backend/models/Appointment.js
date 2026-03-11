const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    type: {
      type: String,
      enum: ["Consultation", "Follow-up", "Check-up", "Emergency", "Physiotherapy", "Lab Review", "Surgery"],
      default: "Consultation",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Completed", "Cancelled", "No-Show"],
      default: "Scheduled",
    },
    notes: { type: String },
    duration: { type: Number, default: 30 }, // in minutes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
