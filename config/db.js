const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const getDbUri = () => {
  if (process.env.CI) {
    return process.env.MONGO_DB_URI_TEST;
  }

  const env = process.env.NODE_ENV || "development";
  const uriMap = {
    test: process.env.MONGO_DB_URI_TEST,
    production: process.env.MONGODB_URI || process.env.MONGODB_URI, // Fallback for platforms like Render
    development: process.env.MONGODB_URI
  };

  const uri = uriMap[env];
  if (!uri) {
    throw new Error(`MongoDB URI not configured for ${env} environment. Please check your .env file.`);
  }

  return uri;
}

async function connectToDB() {
  try {
    const MONGO_DB_URI = getDbUri();

     // Add reconnect options for deployment stability
    const options = {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
    };

    const connection = await mongoose.connect(MONGO_DB_URI, options);

    // Deployment-friendly logging
    console.log(`MongoDB Connected [${process.env.NODE_ENV || "development"}]`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Database: ${connection.connection.name}`);
    }

    return connection;
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    
    // Don't exit process in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
}

module.exports = connectToDB;