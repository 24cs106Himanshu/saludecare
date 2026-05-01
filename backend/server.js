const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./db");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
const mongoose = require("mongoose");
connectDB().then(async () => {
  // Seed default accounts if connected
  if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
    try {
      const patientCount = await User.countDocuments({ email: "patient@medicare.com" });
      if (patientCount === 0) {
        const hashedPwd = await bcrypt.hash("patient123", 10);
        await User.create({
          name: "John Patient",
          firstName: "John",
          lastName: "Patient",
          email: "patient@medicare.com",
          password: hashedPwd,
          role: "patient",
        });
        console.log("✅ Seeded patient account: patient@medicare.com / patient123");
      }

      const doctorCount = await User.countDocuments({ email: "doctor@medicare.com" });
      if (doctorCount === 0) {
        const hashedPwd = await bcrypt.hash("doctor123", 10);
        await User.create({
          name: "Dr. Sarah Johnson",
          firstName: "Dr. Sarah",
          lastName: "Johnson",
          email: "doctor@medicare.com",
          password: hashedPwd,
          role: "doctor",
          specialization: "Cardiology",
          experience: "8 years",
          rating: 4.9,
          hospital: "Medicare General Hospital",
        });
        console.log("✅ Seeded doctor account: doctor@medicare.com / doctor123");
      }
    } catch (err) {
      console.error("Error seeding generic accounts:", err.message);
    }
  }
});

const app = express();

/* ✅ CORS CONFIG */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Hospital Management Backend is running",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.json({
    message: "API is working",
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", require("./authRoutes"));
app.use("/api/appointments", require("./appointmentsRoutes"));
app.use("/api/prescriptions", require("./prescriptionsRoutes"));
app.use("/api/records", require("./recordsRoutes"));
app.use("/api/doctors", require("./doctorsRoutes"));
app.use("/api/patients", require("./patientsRoutes"));
app.use("/api/dashboard", require("./dashboardRoutes"));
app.use("/api/chatbot", require("./aichatbotRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});
