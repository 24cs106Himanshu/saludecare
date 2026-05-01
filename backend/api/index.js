const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("../db");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

// Connect to MongoDB
connectDB();

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

// Health check routes
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
  });
});

// ✅ All API Routes (matching server.js)
app.use("/api/auth", require("../authRoutes"));
app.use("/api/appointments", require("../appointmentsRoutes"));
app.use("/api/prescriptions", require("../prescriptionsRoutes"));
app.use("/api/records", require("../recordsRoutes"));
app.use("/api/doctors", require("../doctorsRoutes"));
app.use("/api/patients", require("../patientsRoutes"));
app.use("/api/dashboard", require("../dashboardRoutes"));
app.use("/api/chatbot", require("../aichatbotRoutes"));

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

// Export for Vercel serverless
module.exports = app;
