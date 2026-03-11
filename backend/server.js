const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/patients", require("./routes/patients"));
app.use("/api/doctors", require("./routes/doctors"));
app.use("/api/appointments", require("./routes/appointments"));
app.use("/api/bills", require("./routes/bills"));

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Hospital Management API is running" });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await seedDatabase();
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

async function seedDatabase() {
  const Doctor = require("./models/Doctor");
  const Patient = require("./models/Patient");
  const Appointment = require("./models/Appointment");
  const Bill = require("./models/Bill");

  const doctorCount = await Doctor.countDocuments();
  if (doctorCount > 0) return;

  console.log("🌱 Seeding demo data...");

  const doctors = await Doctor.insertMany([
    { name: "Dr. Sarah Mitchell", specialization: "Cardiologist", department: "Cardiology", experience: 12, status: "Available", phone: "555-0101", email: "s.mitchell@hospital.com", schedule: "Mon-Fri 9AM-5PM", patients: 124, rating: 4.9 },
    { name: "Dr. James Okafor", specialization: "Neurologist", department: "Neurology", experience: 8, status: "Busy", phone: "555-0102", email: "j.okafor@hospital.com", schedule: "Mon-Thu 10AM-6PM", patients: 98, rating: 4.7 },
    { name: "Dr. Priya Sharma", specialization: "Pediatrician", department: "Pediatrics", experience: 15, status: "Available", phone: "555-0103", email: "p.sharma@hospital.com", schedule: "Tue-Sat 8AM-4PM", patients: 210, rating: 4.8 },
    { name: "Dr. Lucas Ferreira", specialization: "Orthopedist", department: "Orthopedics", experience: 10, status: "Off Duty", phone: "555-0104", email: "l.ferreira@hospital.com", schedule: "Mon-Wed-Fri 9AM-3PM", patients: 87, rating: 4.6 },
    { name: "Dr. Aisha Rahman", specialization: "Dermatologist", department: "Dermatology", experience: 6, status: "Available", phone: "555-0105", email: "a.rahman@hospital.com", schedule: "Mon-Fri 11AM-7PM", patients: 156, rating: 4.5 },
  ]);

  const patients = await Patient.insertMany([
    { name: "Emily Carter", age: 34, gender: "Female", bloodType: "A+", phone: "555-1001", email: "emily.carter@email.com", address: "12 Maple St, Springfield", doctor: doctors[0]._id, status: "Stable", admissionDate: new Date("2025-12-01"), condition: "Hypertension", allergies: ["Penicillin"], records: [{ date: new Date("2025-12-01"), type: "Consultation", notes: "Blood pressure elevated, prescribed medication." }, { date: new Date("2025-12-15"), type: "Follow-up", notes: "BP normalizing, continue current treatment." }] },
    { name: "Marcus Johnson", age: 52, gender: "Male", bloodType: "O-", phone: "555-1002", email: "m.johnson@email.com", address: "45 Oak Ave, Riverdale", doctor: doctors[1]._id, status: "Critical", admissionDate: new Date("2025-12-10"), condition: "Migraine Disorder", allergies: ["Aspirin", "Sulfa"], records: [{ date: new Date("2025-12-10"), type: "Emergency", notes: "Severe migraine episode, admitted for monitoring." }] },
    { name: "Sophia Lee", age: 8, gender: "Female", bloodType: "B+", phone: "555-1003", email: "s.lee.parent@email.com", address: "78 Pine Rd, Lakewood", doctor: doctors[2]._id, status: "Recovering", admissionDate: new Date("2025-12-05"), condition: "Viral Fever", allergies: [], records: [{ date: new Date("2025-12-05"), type: "Admission", notes: "High fever 103°F, started antiviral treatment." }, { date: new Date("2025-12-08"), type: "Progress", notes: "Fever reduced to 99°F, patient improving." }] },
    { name: "Robert Williams", age: 45, gender: "Male", bloodType: "AB+", phone: "555-1004", email: "r.williams@email.com", address: "23 Birch Ln, Hillside", doctor: doctors[3]._id, status: "Stable", admissionDate: new Date("2025-11-28"), condition: "Knee Replacement Recovery", allergies: ["Latex"], records: [{ date: new Date("2025-11-28"), type: "Surgery", notes: "Successful right knee replacement surgery." }, { date: new Date("2025-12-05"), type: "Physiotherapy", notes: "Starting physiotherapy, range of motion improving." }] },
    { name: "Zoe Patel", age: 29, gender: "Female", bloodType: "O+", phone: "555-1005", email: "zoe.patel@email.com", address: "56 Cedar Dr, Westside", doctor: doctors[4]._id, status: "Discharged", admissionDate: new Date("2025-11-20"), condition: "Eczema Treatment", allergies: [], records: [{ date: new Date("2025-11-20"), type: "Consultation", notes: "Chronic eczema, prescribed topical treatment." }] },
  ]);

  const appointments = await Appointment.insertMany([
    { patient: patients[0]._id, doctor: doctors[0]._id, date: new Date("2026-01-15T09:00:00"), type: "Follow-up", status: "Scheduled", notes: "Routine BP checkup", duration: 30 },
    { patient: patients[1]._id, doctor: doctors[1]._id, date: new Date("2026-01-16T10:30:00"), type: "Consultation", status: "Scheduled", notes: "Migraine management plan", duration: 45 },
    { patient: patients[2]._id, doctor: doctors[2]._id, date: new Date("2026-01-14T14:00:00"), type: "Check-up", status: "Completed", notes: "Post-fever checkup", duration: 30 },
    { patient: patients[3]._id, doctor: doctors[3]._id, date: new Date("2026-01-17T11:00:00"), type: "Physiotherapy", status: "Scheduled", notes: "Weekly physio session", duration: 60 },
    { patient: patients[4]._id, doctor: doctors[4]._id, date: new Date("2026-01-13T15:00:00"), type: "Consultation", status: "Cancelled", notes: "Skin review cancelled by patient", duration: 30 },
    { patient: patients[0]._id, doctor: doctors[0]._id, date: new Date("2026-01-20T09:30:00"), type: "Lab Review", status: "Scheduled", notes: "Review blood test results", duration: 20 },
  ]);

  await Bill.insertMany([
    { patient: patients[0]._id, doctor: doctors[0]._id, date: new Date("2025-12-15"), items: [{ description: "Consultation Fee", quantity: 1, unitPrice: 200 }, { description: "Blood Pressure Medication", quantity: 2, unitPrice: 45 }], status: "Paid", paymentMethod: "Insurance" },
    { patient: patients[1]._id, doctor: doctors[1]._id, date: new Date("2025-12-10"), items: [{ description: "Emergency Admission", quantity: 1, unitPrice: 1500 }, { description: "MRI Scan", quantity: 1, unitPrice: 800 }, { description: "Medication", quantity: 3, unitPrice: 60 }], status: "Pending", paymentMethod: "Cash" },
    { patient: patients[2]._id, doctor: doctors[2]._id, date: new Date("2025-12-08"), items: [{ description: "Pediatric Consultation", quantity: 1, unitPrice: 150 }, { description: "Antiviral Medication", quantity: 1, unitPrice: 80 }], status: "Paid", paymentMethod: "Card" },
    { patient: patients[3]._id, doctor: doctors[3]._id, date: new Date("2025-11-28"), items: [{ description: "Knee Replacement Surgery", quantity: 1, unitPrice: 12000 }, { description: "Anesthesia", quantity: 1, unitPrice: 1200 }, { description: "Hospital Stay (5 days)", quantity: 5, unitPrice: 400 }], status: "Partial", paymentMethod: "Insurance" },
    { patient: patients[4]._id, doctor: doctors[4]._id, date: new Date("2025-11-20"), items: [{ description: "Dermatology Consultation", quantity: 1, unitPrice: 180 }, { description: "Topical Treatment Kit", quantity: 1, unitPrice: 95 }], status: "Paid", paymentMethod: "Card" },
  ]);

  console.log("✅ Demo data seeded successfully!");
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏥 Server running on http://localhost:${PORT}`));
