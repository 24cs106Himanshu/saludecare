const API_KEY = process.env.OPENROUTER_API_KEY || "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";

// Store conversations per user
const conversations = {};

const SYSTEM_PROMPT = `You are MediBot, a helpful healthcare AI assistant for the Medicare platform. You provide:
- General health information and medical knowledge
- Medication information (side effects, dosage, interactions)
- Guidance on appointment booking
- Health tips and wellness advice

IMPORTANT GUIDELINES:
- Always include medical disclaimers
- Never provide definitive diagnoses
- Encourage consulting healthcare professionals
- Be empathetic, professional, and concise
- Use markdown formatting with **bold** and bullet points
- Keep responses under 500 characters when possible

Remember: You provide informational assistance, not medical advice.`;

// Send message to OpenRouter AI
async function sendMessage(userId, userMessage) {
  try {
    // Initialize conversation if new user
    if (!conversations[userId]) {
      conversations[userId] = [];
    }

    // Add user message to conversation
    conversations[userId].push({
      role: "user",
      content: userMessage,
    });

    // Call OpenRouter API
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
          ...conversations[userId]
        ],
        "temperature": 0.7,
        "max_tokens": 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const botMessage = data.choices[0].message.content;

    // Add bot response to conversation
    conversations[userId].push({
      role: "assistant",
      content: botMessage,
    });

    return {
      success: true,
      message: botMessage,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return {
      success: false,
      message: `Error: ${error.message}`,
      timestamp: new Date().toISOString(),
    };
  }
}

// Get conversation history
function getHistory(userId) {
  return conversations[userId] || [];
}

// Clear conversation
function clearHistory(userId) {
  conversations[userId] = [];
  return { success: true, message: "Conversation cleared" };
}

module.exports = {
  sendMessage,
  getHistory,
  clearHistory,
};
