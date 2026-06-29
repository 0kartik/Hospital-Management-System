const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");

// GET all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single doctor
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create doctor
router.post("/", async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    const saved = await doctor.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update doctor
router.put("/:id", async (req, res) => {
  try {
    const updated = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE doctor
router.delete("/:id", async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
