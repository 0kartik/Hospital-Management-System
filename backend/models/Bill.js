const mongoose = require("mongoose");

const billItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
});

const billSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    date: { type: Date, default: Date.now },
    items: [billItemSchema],
    status: {
      type: String,
      enum: ["Pending", "Paid", "Partial", "Overdue"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Insurance", "Online"],
    },
    notes: { type: String },
  },
  { timestamps: true }
);

// Virtual for total amount
billSchema.virtual("total").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
});

billSchema.set("toJSON", { virtuals: true });
billSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Bill", billSchema);
