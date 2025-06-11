const dotenv  = require("dotenv");
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not loaded from .env file');
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
// const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
// app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
})

module.exports = app;