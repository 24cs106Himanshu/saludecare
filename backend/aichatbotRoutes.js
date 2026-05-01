const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");
const { sendMessage, getHistory, clearHistory } = require("./groqChatbot");

// Custom guest auth bypass for chatbot testing
const optionalAuth = (req, res, next) => {
  if (!req.user) {
    req.user = { _id: "guest_user_" + Date.now() };
  }
  next();
};

// POST - Send message to chatbot
router.post("/message", optionalAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = (req.user._id || req.user.id).toString();

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Send to OpenRouter (formerly Groq)
    const result = await sendMessage(userId, message);

    if (!result.success) {
      return res.status(500).json({
        type: "bot",
        text: result.message,
        error: true,
      });
    }

    res.json({
      type: "bot",
      text: result.message,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({
      type: "bot",
      text: "Sorry, I encountered an error. Please try again.",
      error: true,
    });
  }
});

// GET - Get chat history
router.get("/history", optionalAuth, (req, res) => {
  const userId = (req.user._id || req.user.id).toString();
  const history = getHistory(userId);

  res.json({
    history: history,
    count: history.length,
  });
});

// DELETE - Clear chat history
router.delete("/history", optionalAuth, (req, res) => {
  const userId = (req.user._id || req.user.id).toString();
  const result = clearHistory(userId);

  res.json(result);
});

// GET - Test endpoint (no auth needed)
router.get("/test", (req, res) => {
  res.json({
    status: "Chatbot API is working",
    message: "Use POST /api/chatbot/message with authentication",
  });
});

module.exports = router;
