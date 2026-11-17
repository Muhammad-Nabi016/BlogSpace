const express = require("express");
const path = require("path");

const { app, connectDB } = require("./backend/server");

const vercelApp = express();

// Serve frontend static files
vercelApp.use(express.static(path.join(__dirname, "public")));

// Connect MongoDB before API requests
vercelApp.use("/api", async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Existing Express API routes
vercelApp.use(app);

module.exports = vercelApp;