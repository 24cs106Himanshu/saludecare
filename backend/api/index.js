const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../db");

dotenv.config();
connectDB();

const app = express();

/* ✅ ENHANCED CORS CONFIG - Allows all origins */
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      // Allow all origins
      callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ 
    message: "Hospital Management Backend is running",
    status: "OK",
    timestamp: new Date().toISOString()
  });
});

app.get("/api", (req, res) => {
  res.json({ 
    message: "API is working",
    status: "OK"
  });
});

app.use("/api/auth", require("../authRoutes"));

// Export for Vercel serverless
module.exports = app;
