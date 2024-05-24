const Blog = require('../models/blogModel');
const  uploadOnCloudinary =require ("../config/cloudinary")

exports.getBlogById = async (req, res) => {
  const { id } = req.params; // Extract the blog ID from the request parameters

  try {
    // Find the blog post by ID
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Send response
    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    // Retrieve all blog posts, sorted in descending order of createdAt field
    const blogs = await Blog.find().sort({ createdAt: -1 });
  


    // Send response
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching all blogs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.createBlog = async (req, res) => {
  const { title, content, tags } = req.body;

  try {
    let pictureUrl = null; // Initialize pictureUrl variable
console.log("path",req.file)
    // If there's a file uploaded, you can access it via req.file
    if (req.file) {
      const pictures = await uploadOnCloudinary(req.file.path);
      pictureUrl = pictures.url; // Get the URL of the uploaded image from Cloudinary
    }

    // Create a new blog post
    const blog = new Blog({
      title,
      content,
      tags,
      picture: pictureUrl // Store the image URL in the database if a file is uploaded
    });

    // Save the blog post to the database
    await blog.save();

    // Send response
    res.status(201).json(blog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateBlog = async (req, res) => {
  const { id } = req.params; // Extract the blog ID from the request parameters
  const { title, content, tags } = req.body;

  try {
    let pictureUrl = null;

    // If there's a file uploaded, you can access it via req.file
    if (req.file) {
      const pictures = await uploadOnCloudinary(req.file.path);
      pictureUrl = pictures.url; // Get the URL of the uploaded image from Cloudinary
    }

    // Find the blog post by ID
    let blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Update the blog post
    blog.title = title;
    blog.content = content;
    blog.tags = tags;
    if (pictureUrl) {
      blog.picture = pictureUrl;
    }

    // Save the updated blog post
    await blog.save();

    // Send response
    res.json(blog);
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteBlog = async (req, res) => {
  const { id } = req.params; // Extract the blog ID from the request parameters

  try {
    // Find the blog post by ID and delete it
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Send response
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
