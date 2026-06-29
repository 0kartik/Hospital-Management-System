const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// GET all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name age gender bloodType condition")
      .populate("doctor", "name specialization department status");
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single appointment
router.get("/:id", async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id).populate("patient").populate("doctor");
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create appointment
router.post("/", async (req, res) => {
  try {
    const appt = new Appointment(req.body);
    const saved = await appt.save();
    const populated = await saved.populate("patient", "name").populate("doctor", "name specialization");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update appointment
router.put("/:id", async (req, res) => {
  try {
    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("patient", "name")
      .populate("doctor", "name specialization");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE appointment
router.delete("/:id", async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
