const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

// GET all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().populate("doctor", "name specialization status");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single patient
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("doctor");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create patient
router.post("/", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const saved = await patient.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update patient
router.put("/:id", async (req, res) => {
  try {
    const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE patient
router.delete("/:id", async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ message: "Patient deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST add medical record
router.post("/:id/records", async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    patient.records.push(req.body);
    const saved = await patient.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
