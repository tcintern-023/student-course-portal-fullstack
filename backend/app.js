require("dotenv").config();
const express = require("express");
const cors = require("cors");
const courseRoutes = require("./routes/courseRoutes");
const instructorRoutes = require("./routes/instructorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Allow the Next.js frontend (and no one else, by default) to call this API.
app.use(cors({ origin: CLIENT_URL }));

// Built-in middleware to parse JSON request bodies
app.use(express.json());

// Simple request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Student Course Portal API is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/instructors", instructorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/enrollments", enrollmentRoutes);

// 404 handler (for unmatched routes)
app.use(notFoundHandler);

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;
