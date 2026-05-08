// Quick token generator for testing when MongoDB is offline
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "medicare_local_secret_key_2024";

const user = {
  _id: "patient_001",
  role: "patient",
  email: "patient@medicare.com",
};

const token = jwt.sign(
  { id: user._id, role: user.role },
  JWT_SECRET,
  { expiresIn: "7d" }
);

console.log("Test JWT Token:");
console.log(token);
