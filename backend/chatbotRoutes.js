const express = require("express");
const router = express.Router();
const authMiddleware = require("./authMiddleware");

// OpenRouter API setup
const API_KEY = process.env.OPENROUTER_API_KEY || "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";

// Store chat history with conversation context
const chatHistories = {}; // userId -> array of messages

// System prompt for healthcare chatbot
const SYSTEM_PROMPT = `You are MediBot, a helpful healthcare AI assistant for a Medicare platform. You provide:
1. General health information and medical knowledge
2. Medication information (side effects, dosage, interactions)
3. Guidance on appointment booking and platform features
4. Health tips and wellness advice

Important guidelines:
- Always include medical disclaimers when necessary
- Never provide definitive medical diagnoses
- Encourage users to consult healthcare professionals for serious concerns
- Be empathetic and professional
- Keep responses concise and clear
- Use proper formatting with bullet points and emphasis where appropriate

Remember: You are an informational assistant, not a substitute for professional medical advice.`;

// Send message to chatbot with OpenRouter AI
router.post("/message", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id.toString();

    if (!message || message.trim() === "") {
      return res.status(400).json({ error: "Message cannot be empty" });
    }

    // Initialize user chat history if not exists
    if (!chatHistories[userId]) {
      chatHistories[userId] = [];
    }

    // Add user message to history
    const userMessage = {
      role: "user",
      content: message,
    };
    chatHistories[userId].push(userMessage);

    // Call OpenRouter API with conversation history
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Hospital Management System"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.3-70b-instruct",
        "messages": [
          { role: "system", content: SYSTEM_PROMPT },
          ...chatHistories[userId]
        ],
        "temperature": 0.7,
        "max_tokens": 500,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const botContent = data.choices[0].message.content;

    // Add bot response to history
    const botMessage = {
      role: "assistant",
      content: botContent,
    };
    chatHistories[userId].push(botMessage);

    res.json({
      id: Date.now().toString(),
      text: botContent,
      type: "bot",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("OpenRouter API Error:", error);
    res.status(500).json({
      error: "Failed to get response from AI",
      message: error.message,
    });
  }
});

// Get chat history
router.get("/history", authMiddleware, (req, res) => {
  const userId = req.user._id.toString();
  const history = chatHistories[userId] || [];
  
  // Format history for frontend
  const formattedHistory = history.map((msg, index) => ({
    id: index,
    type: msg.role === "user" ? "user" : "bot",
    text: msg.content,
    time: new Date(),
  }));
  
  res.json(formattedHistory);
});

// Clear chat history
router.delete("/history", authMiddleware, (req, res) => {
  const userId = req.user._id.toString();
  chatHistories[userId] = [];
  res.json({ message: "Chat history cleared" });
});

module.exports = router;
