// Import Mongoose
const mongoose = require("mongoose");

// Define the blog schema
const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: [
      {
        type: String,
        required: true,
      },
    ],
    picture: { type: String },

    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create the Blog model
const Blog = mongoose.model("Blog", blogSchema);

// Export the model
module.exports = Blog;
