const mongoose = require("mongoose");
const { readingTime } = require("../utils/utils")

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
  },
  body: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
    required: true
  },
  owner: {
    type: String,
  },
  state: {
    type: String,
    default: "draft",
    enum: ["draft", "published"]
  },
  read_count: {
    type: Number,
    default: 0
  },
  reading_time: Number,
  tags: [String],
  },
  {
    timestamps: true
  }
);

blogSchema.pre("save", async function(next) {
  try {
    if (!this.isModified("body")) {
      return next();
    }

    const timeToRead = readingTime(this.body);
    this.reading_time = timeToRead;
    next();
  } catch (error) {
    next(error);
  }
});

blogSchema.set("toJSON", {
  transform: function(document, returnedObject) {
    delete returnedObject.__v;
    delete returnedObject.owner; 
  }
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;