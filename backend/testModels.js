require("dotenv").config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testModels() {
  try {
    console.log("Testing llama-3.3-70b-versatile...");
    await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: "Hi" }],
    });
    console.log("llama-3.3-70b-versatile OK");

    console.log("Testing mixtral-8x7b-32768...");
    await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: "Hi" }],
    });
    console.log("mixtral-8x7b-32768 OK");
  } catch (error) {
    console.error("Error:", error.message);
  }
}
testModels();
