const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const dbName = String(process.env.DB_NAME || "roots").trim() || "roots";

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      dbName,
    });
    console.log(
      `✓ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`,
    );
    return conn;
  } catch (error) {
    console.error(`✗ Error connecting to MongoDB: ${error.message}`);
    console.error(
      "Attempted connection string:",
      process.env.MONGO_URI?.substring(0, 50) + "...",
    );
    process.exit(1);
  }
};

module.exports = connectDB;
