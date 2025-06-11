const express = require("express");
const { createUser, userLogin } = require("../controllers/auth.controller");

const authRouter = express.Router();

authRouter.post("/signup", createUser);
authRouter.post("/login", userLogin);

module.exports = authRouter;