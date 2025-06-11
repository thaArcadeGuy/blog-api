const User = require("../models/model.user");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1h";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Register a new user
//  POST /api/auth/signup
const createUser = async (req, res) => {
  try {
    const { first_name, last_name, username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = await User.create({
      first_name,
      last_name,
      username,
      email,
      password,
    });

    const token = generateToken(newUser._id);
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Login a User
// POST /api/auth/login
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.passwordIsValid(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createUser,
  userLogin,
};