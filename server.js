const app = require("./app");
const connectToDB = require("./config/db");

const PORT = process.env.PORT || 5000;

connectToDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});