const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
});

userSchema.pre("save", async function(next) {
  if (this.isModified("password")) {
    const bcrypt = require("bcrypt");
    const saltRounds = 10;
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

userSchema.methods.passwordIsValid = async function(password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error
  }
};

userSchema.set("toJSON", {
  transform: function(document, returnedObject) {
    delete returnedObject.__v;
    delete returnedObject.password;
  }
});

const User = mongoose.model("User", userSchema);
module.exports = User;