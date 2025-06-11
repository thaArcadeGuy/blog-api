const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGO_DB_URI = process.env.MONGO_DB_URI

function connectToDB() {
  return new Promise((resolve, reject) => {
    mongoose.connect(MONGO_DB_URI);

    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB successfully");
      resolve();
    });

    mongoose.connection.on("error", (error) => {
      console.log("An error occurred!", error);
      reject(error);
    });
  }); 
}

module.exports = connectToDB;