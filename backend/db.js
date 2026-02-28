const mongoose = require("mongoose");

const connectDB = async () => {
  // Skip MongoDB connection if MONGO_URI is not set
  if (!process.env.MONGO_URI) {
    console.log("⚠️  MongoDB URI not configured - running in mock mode");
    console.log("   The application will use mock data for development");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      dbName: "medicareDB", // Explicitly set database name
    });
    
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.db.databaseName}`);
  } catch (error) {
    console.error("MongoDB connection failed:");
    console.error("Error:", error.message);
    
    if (error.message.includes("bad auth")) {
      console.error("\n⚠️  Authentication failed. Please check:");
      console.error("   1. Username and password in .env file");
      console.error("   2. Database user exists in MongoDB Atlas");
      console.error("   3. User has proper permissions");
      console.error("   4. See MONGODB_FIX.md for step-by-step instructions\n");
    } else if (error.message.includes("Could not connect")) {
      console.error("\n⚠️  Connection failed. Please check:");
      console.error("   1. Your IP is whitelisted in MongoDB Atlas");
      console.error("   2. Network/firewall settings");
      console.error("   3. MongoDB cluster is running\n");
    }
    
    console.log("⚠️  Continuing in mock mode - using mock data for development");
  }
};

module.exports = connectDB;
