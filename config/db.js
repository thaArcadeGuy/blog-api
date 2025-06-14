const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const getDbUri = () => {
  switch(process.env.NODE_ENV) {
    case "test":
      return process.env.MONGO_DB_URI_TEST;
    case "production":
      return process.env.MONGO_DB_URI_PROD;
    default:
      return process.env.MONGO_DB_URI;
  }
}

function connectToDB() {
  const MONGO_DB_URI = getDbUri();

  return new Promise((resolve, reject) => {
    mongoose.connect(MONGO_DB_URI);

    mongoose.connection.on("connected", () => {
      console.log(`Connected to MongoDB (${process.env.NODE_ENV || "development"}) environment successfully`);
      resolve();
    });

    mongoose.connection.on("error", (error) => {
      console.log("An error occurred!", error);
      reject(error);
    });
  }); 
}

module.exports = connectToDB;