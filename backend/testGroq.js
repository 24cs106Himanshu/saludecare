require("dotenv").config();
const { sendMessage } = require("./groqChatbot");

async function test() {
  console.log("Testing Groq...");
  const result = await sendMessage("testUser", "Hello MediBot!");
  console.log("Result:", result);
}

test();
