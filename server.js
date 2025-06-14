const app = require("./app");
const connectToDB = require("./config/db");
const verifyEnv = require("./config/verifyEnv")

verifyEnv();

const validateEnv = () => {
  const required = ['JWT_SECRET', 'PORT', 'MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
  console.log("Environment variables loaded successfully");
}

validateEnv();
const PORT = process.env.PORT || 5000;

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});