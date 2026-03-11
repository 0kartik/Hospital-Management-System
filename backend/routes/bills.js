const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");

// GET all bills
router.get("/", async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate("patient", "name age gender")
      .populate("doctor", "name specialization");
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single bill
router.get("/:id", async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id).populate("patient").populate("doctor");
    if (!bill) return res.status(404).json({ message: "Bill not found" });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create bill
router.post("/", async (req, res) => {
  try {
    const bill = new Bill(req.body);
    const saved = await bill.save();
    const populated = await saved.populate("patient", "name").populate("doctor", "name");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update bill
router.put("/:id", async (req, res) => {
  try {
    const updated = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate("patient", "name")
      .populate("doctor", "name");
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE bill
router.delete("/:id", async (req, res) => {
  try {
    await Bill.findByIdAndDelete(req.params.id);
    res.json({ message: "Bill deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
