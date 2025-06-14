const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const getDbUri = () => {
  const env = process.env.NODE_ENV || "development";
  const uriMap = {
    test: process.env.MONGO_DB_URI_TEST,
    production: process.env.MONGO_DB_URI_PROD,
    development: process.env.MONGO_DB_URI
  };

  const uri = uriMap[env];
  if (!uri) {
    throw new Error(`MongoDB URI not configured for ${env} environment`);
  }

  return uri;
}

async function connectToDB() {
  try {
    const MONGO_DB_URI = getDbUri();

    const connection = await mongoose.connect(MONGO_DB_URI);

    console.log(`Connected to MongoDB (${process.env.NODE_ENV || "development"}) environment successfully`);
    console.log(`Database host: ${connection.connection.host}`);

    return connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
}

module.exports = connectToDB;