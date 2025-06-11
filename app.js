const express = require("express");
const dotenv  = require("dotenv");
// const authRoutes = require("./routes/authRoutes");
// const blogRoutes = require("./routes/blogRoutes");

dotenv.config();
const app = express();

app.use(express.json());

// app.use("/api/auth", authRoutes);
// app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
})

module.exports = app;