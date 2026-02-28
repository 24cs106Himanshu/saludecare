const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");

// Mock chatbot history
let chatHistory = [];

// Send message to chatbot
router.post("/message", authMiddleware, (req, res) => {
  const { message } = req.body;
  
  const userMessage = {
    id: Date.now().toString(),
    message,
    sender: "user",
    timestamp: new Date().toISOString()
  };
  
  chatHistory.push(userMessage);
  
  // Simple bot response
  const botResponse = {
    id: (Date.now() + 1).toString(),
    message: "I'm here to help! How can I assist you with your healthcare needs today?",
    sender: "bot",
    timestamp: new Date().toISOString()
  };
  
  chatHistory.push(botResponse);
  
  res.json(botResponse);
});

// Get chat history
router.get("/history", authMiddleware, (req, res) => {
  res.json(chatHistory);
});

// Clear chat history
router.delete("/history", authMiddleware, (req, res) => {
  chatHistory = [];
  res.json({ message: "Chat history cleared" });
});

module.exports = router;
