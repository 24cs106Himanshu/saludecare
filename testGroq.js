const dotenv = require("dotenv");
const path = require("path");

// Load variables
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const { sendMessage } = require("./backend/groqChatbot");

async function test() {
  console.log("Testing Groq...");
  const result = await sendMessage("testUser", "Hello MediBot!");
  console.log("Result:", result);
}

test();
