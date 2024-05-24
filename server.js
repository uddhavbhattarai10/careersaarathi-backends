const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoutes");
const companyRoutes = require("./routes/companyRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const blogRoutes = require("./routes/blogRoutes");
const jobRoutes = require("./routes/jobRoutes");
const appliedRoutes = require("./routes/appliedRoutes");
const adminRoutes = require("./routes/adminRoutes");
const bodyParser = require("body-parser");

const app = express();
dotenv.config();

// Connect to MongoDB using environment variable
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
app.use(cookieParser());
// Middleware
app.use(cors());
app.use(express.static("uploads")); // Static middleware
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(bodyParser.json({ limit: "10mb" }));

// Routes
app.use("/user", userRoutes);
app.use("/company", companyRoutes);
app.use("/resume", resumeRoutes);
app.use("/blog", blogRoutes);
app.use("/job", jobRoutes);
app.use("/apply", appliedRoutes);
app.use("/admin", adminRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
